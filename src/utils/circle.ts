
import circle from '@turf/circle'
import { GeoLocationPoint } from '../models'

export const defaultNumPointsCircle = 12

export interface MakeCircleParams {
  center: GeoLocationPoint
  radiusMeters: number
  // the number of points NOT including the closing point, e.g. 12 for each number on a clock
  numPoints?: number
}


export const makeCirclePolygon = ({center, radiusMeters, numPoints=defaultNumPointsCircle}: MakeCircleParams) => {
  const centerCoords = [center.lng, center.lat]
  const data = circle(centerCoords, 0.001 * radiusMeters, {steps: numPoints, units: 'kilometers'})
  return data.geometry.coordinates[0]
}
