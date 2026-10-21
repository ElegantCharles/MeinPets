import type { ExpressionSpecification, LayerSpecification, StyleSpecification } from '@maplibre/maplibre-gl-style-spec';
import { colors, mapTint } from '../theme';

const SOURCE = 'openmaptiles';
const NAME: ExpressionSpecification = ['coalesce', ['get', 'name:es'], ['get', 'name']];

function width(stops: [number, number][], base = 1.4): ExpressionSpecification {
  return ['interpolate', ['exponential', base], ['zoom'], ...stops.flat()] as ExpressionSpecification;
}

const MINOR = ['minor', 'service'];
const MID = ['tertiary', 'secondary', 'primary'];
const MAJOR = ['trunk', 'motorway'];

const roadStops: Record<'minor' | 'mid' | 'major', [number, number][]> = {
  minor: [[12, 0.4], [14, 1.6], [16, 5], [18, 14]],
  mid: [[10, 0.4], [13, 1.8], [15, 5], [17, 12], [19, 26]],
  major: [[6, 0.5], [10, 1.6], [13, 3.4], [15, 7], [17, 15], [19, 30]],
};

function road(
  id: string,
  classes: string[],
  color: string,
  stops: [number, number][],
  minzoom: number,
  extra = 0
): LayerSpecification {
  return {
    id,
    type: 'line',
    source: SOURCE,
    'source-layer': 'transportation',
    minzoom,
    filter: ['in', ['get', 'class'], ['literal', classes]],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': color,
      'line-width': width(stops.map(([zoom, value]) => [zoom, value + extra] as [number, number])),
    },
  };
}

const textFont = ['Noto Sans Regular'];
const boldFont = ['Noto Sans Bold'];

export const MEINPETS_MAP_STYLE: StyleSpecification = {
  version: 8,
  name: 'MeinPets',
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: {
    [SOURCE]: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' },
  },
  layers: [
    { id: 'land', type: 'background', paint: { 'background-color': mapTint.land } },
    {
      id: 'landcover',
      type: 'fill',
      source: SOURCE,
      'source-layer': 'landcover',
      filter: ['in', ['get', 'class'], ['literal', ['grass', 'wood', 'wetland', 'farmland']]],
      paint: { 'fill-color': mapTint.park, 'fill-opacity': 0.7 },
    },
    {
      id: 'park',
      type: 'fill',
      source: SOURCE,
      'source-layer': 'park',
      paint: { 'fill-color': mapTint.park },
    },
    {
      id: 'water',
      type: 'fill',
      source: SOURCE,
      'source-layer': 'water',
      paint: { 'fill-color': mapTint.water },
    },
    {
      id: 'waterway',
      type: 'line',
      source: SOURCE,
      'source-layer': 'waterway',
      minzoom: 10,
      paint: { 'line-color': mapTint.water, 'line-width': width([[10, 0.6], [16, 3]]) },
    },
    {
      id: 'boundary-region',
      type: 'line',
      source: SOURCE,
      'source-layer': 'boundary',
      maxzoom: 11,
      filter: ['all', ['==', ['get', 'admin_level'], 4], ['!=', ['get', 'maritime'], 1]],
      layout: { 'line-join': 'round' },
      paint: { 'line-color': mapTint.boundary, 'line-width': 1.2, 'line-dasharray': [3, 2] },
    },
    road('road-mid-casing', MID, mapTint.roadCasing, roadStops.mid, 11, 1.4),
    road('road-minor-casing', MINOR, mapTint.roadCasing, roadStops.minor, 14, 1.2),
    road('road-major-casing', MAJOR, mapTint.roadCasing, roadStops.major, 6, 1.6),
    road('road-minor', MINOR, mapTint.road, roadStops.minor, 13),
    road('road-mid', MID, mapTint.road, roadStops.mid, 10),
    road('road-major', MAJOR, mapTint.road, roadStops.major, 6),
    {
      id: 'road-label',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'transportation_name',
      minzoom: 14,
      filter: ['in', ['get', 'class'], ['literal', [...MINOR, ...MID, ...MAJOR]]],
      layout: {
        'symbol-placement': 'line',
        'text-field': NAME,
        'text-font': textFont,
        'text-size': width([[14, 9], [18, 12]], 1),
        'text-letter-spacing': 0.04,
      },
      paint: { 'text-color': mapTint.label, 'text-halo-color': mapTint.road, 'text-halo-width': 1.6 },
    },
    {
      id: 'place-suburb',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'place',
      minzoom: 12,
      filter: ['in', ['get', 'class'], ['literal', ['suburb', 'quarter']]],
      layout: {
        'text-field': NAME,
        'text-font': boldFont,
        'text-size': width([[12, 10], [16, 12]], 1),
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.18,
        'text-max-width': 8,
      },
      paint: { 'text-color': mapTint.label, 'text-halo-color': mapTint.labelHalo, 'text-halo-width': 1.4 },
    },
    {
      id: 'place-neighbourhood',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'place',
      minzoom: 14.5,
      filter: ['==', ['get', 'class'], 'neighbourhood'],
      layout: {
        'text-field': NAME,
        'text-font': textFont,
        'text-size': 9.5,
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.14,
        'text-max-width': 7,
      },
      paint: {
        'text-color': mapTint.label,
        'text-opacity': 0.75,
        'text-halo-color': mapTint.labelHalo,
        'text-halo-width': 1.2,
      },
    },
    {
      id: 'place-town',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'place',
      minzoom: 8,
      filter: ['in', ['get', 'class'], ['literal', ['town', 'village', 'hamlet']]],
      layout: {
        'text-field': NAME,
        'text-font': textFont,
        'text-size': width([[8, 11], [13, 14]], 1),
        'text-max-width': 8,
      },
      paint: { 'text-color': mapTint.labelStrong, 'text-halo-color': mapTint.labelHalo, 'text-halo-width': 1.6 },
    },
    {
      id: 'place-city',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'place',
      minzoom: 4,
      maxzoom: 15,
      filter: ['==', ['get', 'class'], 'city'],
      layout: {
        'text-field': NAME,
        'text-font': boldFont,
        'text-size': width([[4, 11], [10, 16], [14, 20]], 1),
        'text-max-width': 8,
      },
      paint: { 'text-color': colors.ink, 'text-halo-color': mapTint.labelHalo, 'text-halo-width': 1.8 },
    },
    {
      id: 'place-state',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'place',
      minzoom: 4,
      maxzoom: 8,
      filter: ['==', ['get', 'class'], 'state'],
      layout: {
        'text-field': NAME,
        'text-font': textFont,
        'text-size': 11,
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.18,
        'text-max-width': 8,
      },
      paint: { 'text-color': mapTint.label, 'text-halo-color': mapTint.labelHalo, 'text-halo-width': 1.4 },
    },
  ],
};
