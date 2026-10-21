import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAP_CONFIG } from '../../config/map';
import {
  MapCamera,
  MapCanvasProps,
  MapInsets,
  PLACES_PIN_LAYER,
  PLACES_SOURCE,
  ROUTE_SOURCE,
  USER_SOURCE,
  cameraPadding,
  markersToGeoJson,
  placesHaloLayer,
  placesPinLayer,
  pointToGeoJson,
  routeLayer,
  routeToGeoJson,
  userDotLayer,
  userHaloLayer,
} from './mapShared';
import { PIN_IMAGES } from './pins';

const HIT_RADIUS = 22;

function applyCamera(map: MapLibreMap, camera: MapCamera, insets: MapInsets, animate: boolean) {
  const padding = cameraPadding(insets);
  if (camera.kind === 'bounds') {
    const [west, south, east, north] = camera.bounds;
    map.fitBounds(
      [
        [west, south],
        [east, north],
      ],
      { padding, duration: animate ? 600 : 0 }
    );
  } else {
    map.flyTo({
      center: [camera.center.longitude, camera.center.latitude],
      zoom: camera.zoom,
      padding,
      duration: animate ? 800 : 0,
    });
  }
}

const PIN_BASE_WIDTH = 60;

async function registerPins(map: MapLibreMap) {
  await Promise.all(
    Object.entries(PIN_IMAGES).map(async ([name, source]) => {
      const asset = source as unknown as { uri: string; width: number };
      const { data } = await map.loadImage(asset.uri);
      if (!map.hasImage(name)) {
        map.addImage(name, data, { pixelRatio: asset.width / PIN_BASE_WIDTH });
      }
    })
  );
}

export function MapCanvas(props: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const readyRef = useRef(false);
  const latest = useRef(props);
  latest.current = props;
  const appliedKey = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const first = latest.current.camera;
    const map = new MapLibreMap({
      container,
      style: MAP_CONFIG.STYLE,
      ...(first.kind === 'center'
        ? { center: [first.center.longitude, first.center.latitude] as [number, number], zoom: first.zoom }
        : {
            bounds: [
              [first.bounds[0], first.bounds[1]],
              [first.bounds[2], first.bounds[3]],
            ] as [[number, number], [number, number]],
            fitBoundsOptions: { padding: cameraPadding(latest.current.insets) },
          }),
      maxZoom: MAP_CONFIG.MAX_ZOOM,
      attributionControl: false,
      dragRotate: false,
      touchPitch: false,
    });
    map.touchZoomRotate.disableRotation();
    mapRef.current = map;

    let failed = false;
    let styleReady = false;
    let disposed = false;
    map.once('style.load', () => {
      styleReady = true;
    });

    map.on('load', async () => {
      await registerPins(map);
      if (disposed) return;
      const current = latest.current;
      map.addSource(ROUTE_SOURCE, { type: 'geojson', data: routeToGeoJson(current.route) });
      map.addSource(USER_SOURCE, { type: 'geojson', data: pointToGeoJson(current.userLocation) });
      map.addSource(PLACES_SOURCE, {
        type: 'geojson',
        data: markersToGeoJson(current.markers, current.selectedId),
      });
      map.addLayer(routeLayer);
      map.addLayer(userHaloLayer);
      map.addLayer(userDotLayer);
      map.addLayer(placesHaloLayer);
      map.addLayer(placesPinLayer);

      const hitBox = (point: { x: number; y: number }): [[number, number], [number, number]] => [
        [point.x - HIT_RADIUS, point.y - HIT_RADIUS],
        [point.x + HIT_RADIUS, point.y + HIT_RADIUS],
      ];
      map.on('click', (event) => {
        const found = map.queryRenderedFeatures(hitBox(event.point), { layers: [PLACES_PIN_LAYER] });
        const id = Number(found[0]?.properties?.id);
        if (Number.isFinite(id)) latest.current.onSelect(id);
      });
      map.on('mousemove', (event) => {
        const found = map.queryRenderedFeatures(hitBox(event.point), { layers: [PLACES_PIN_LAYER] });
        map.getCanvas().style.cursor = found.length > 0 ? 'pointer' : '';
      });

      readyRef.current = true;
      appliedKey.current = current.camera.key;
      applyCamera(map, current.camera, current.insets, false);
    });

    map.on('error', () => {
      if (!failed && !styleReady) {
        failed = true;
        latest.current.onLoadError();
      }
    });

    return () => {
      disposed = true;
      readyRef.current = false;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const source = map.getSource(PLACES_SOURCE) as GeoJSONSource | undefined;
    source?.setData(markersToGeoJson(props.markers, props.selectedId));
  }, [props.markers, props.selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const source = map.getSource(USER_SOURCE) as GeoJSONSource | undefined;
    source?.setData(pointToGeoJson(props.userLocation));
  }, [props.userLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const source = map.getSource(ROUTE_SOURCE) as GeoJSONSource | undefined;
    source?.setData(routeToGeoJson(props.route));
  }, [props.route]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current || appliedKey.current === props.camera.key) return;
    appliedKey.current = props.camera.key;
    applyCamera(map, props.camera, props.insets, true);
  }, [props.camera, props.insets]);

  return (
    <View style={styles.fill}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
