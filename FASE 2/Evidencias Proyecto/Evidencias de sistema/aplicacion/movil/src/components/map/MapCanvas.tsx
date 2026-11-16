import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Camera,
  GeoJSONSource,
  Images,
  Layer,
  Map,
  type CameraRef,
} from '@maplibre/maplibre-react-native';
import { MAP_CONFIG } from '../../config/map';
import {
  MapCamera,
  MapCanvasProps,
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

function initialView(camera: MapCamera, padding: ReturnType<typeof cameraPadding>) {
  if (camera.kind === 'center') {
    return {
      center: [camera.center.longitude, camera.center.latitude] as [number, number],
      zoom: camera.zoom,
      padding,
    };
  }
  return { bounds: camera.bounds, padding };
}

export function MapCanvas({
  markers,
  selectedId,
  userLocation,
  route,
  camera,
  insets,
  onSelect,
  onLoadError,
}: MapCanvasProps) {
  const cameraRef = useRef<CameraRef>(null);
  const firstCamera = useRef(camera);
  const appliedKey = useRef(camera.key);
  const [mapReady, setMapReady] = useState(false);
  const padding = useMemo(() => cameraPadding(insets), [insets]);

  const places = useMemo(() => markersToGeoJson(markers, selectedId), [markers, selectedId]);
  const user = useMemo(() => pointToGeoJson(userLocation), [userLocation]);
  const line = useMemo(() => routeToGeoJson(route), [route]);

  useEffect(() => {
    if (!mapReady || appliedKey.current === camera.key) return;
    const ref = cameraRef.current;
    if (!ref) return;
    appliedKey.current = camera.key;
    if (camera.kind === 'bounds') {
      ref.fitBounds(camera.bounds, { padding, duration: 600 });
    } else {
      ref.flyTo({
        center: [camera.center.longitude, camera.center.latitude],
        zoom: camera.zoom,
        padding,
        duration: 800,
      });
    }
  }, [camera, mapReady, padding]);

  return (
    <View style={styles.fill}>
      <Map
        style={styles.fill}
        mapStyle={MAP_CONFIG.STYLE}
        attribution={false}
        logo={false}
        compass={false}
        touchRotate={false}
        touchPitch={false}
        onDidFinishLoadingMap={() => setMapReady(true)}
        onDidFailLoadingMap={onLoadError}
      >
        <Camera
          ref={cameraRef}
          initialViewState={initialView(firstCamera.current, padding)}
          maxZoom={MAP_CONFIG.MAX_ZOOM}
        />
        <Images images={PIN_IMAGES} />
        <GeoJSONSource id={ROUTE_SOURCE} data={line}>
          <Layer {...routeLayer} />
        </GeoJSONSource>
        <GeoJSONSource id={USER_SOURCE} data={user}>
          <Layer {...userHaloLayer} />
          <Layer {...userDotLayer} />
        </GeoJSONSource>
        <GeoJSONSource
          id={PLACES_SOURCE}
          data={places}
          hitbox={{ top: 22, right: 22, bottom: 22, left: 22 }}
          onPress={(event) => {
            const id = Number(event.nativeEvent.features[0]?.properties?.id);
            if (Number.isFinite(id)) onSelect(id);
          }}
        >
          <Layer {...placesHaloLayer} />
          <Layer {...placesPinLayer} />
        </GeoJSONSource>
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
