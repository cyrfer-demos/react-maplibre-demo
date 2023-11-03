
import { Polygon, Point } from 'geojson'

export type GeoJsonPoint = Omit<Point, 'bbox'>
export type GeoJsonPolygon = Omit<Polygon, 'bbox'>

export interface FenceMeta {
  radiusMeters: number
  center: GeoJsonPoint
}

export interface LocationPOI {
  id: string
  name: string
  fence: GeoJsonPolygon
  fenceMeta: FenceMeta
}

export interface GeoLocationPoint {
  lat: number
  lng: number
}
