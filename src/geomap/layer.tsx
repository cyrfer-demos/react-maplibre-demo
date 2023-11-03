import { useEffect } from "react"

import { AddLayerObject } from 'maplibre-gl'
import {
  FillLayerSpecification,
  CircleLayerSpecification,
} from "@maplibre/maplibre-gl-style-spec"

export type LayerStyle =
  | {type: 'fill', paint: FillLayerSpecification['paint']}
  | {type: 'circle', paint: CircleLayerSpecification['paint']}

export interface LayerProps {
  map: maplibregl.Map
  sourceId: string
  layerId: string
  style: LayerStyle
}

export const GeoLayer = ({
  map,
  sourceId,
  layerId,
  style,
}: LayerProps) => {

  // manage the layer resource
  useEffect(() => {
    if (!map) {
      return
    }

    if (!map.getSource(sourceId)) {
      return
    }

    console.log('geomap/Layer/useEffect map.addLayer')
    const layer: AddLayerObject = {
      source: sourceId,
      id: layerId,
      ...style,
      filter: ['==', '$type', 'Polygon'],
    }
    map.addLayer(layer)

    return () => {
      console.log('geomap/Layer/useEffect cleanup layerId: ' + layerId)
      map.removeLayer(layerId)
    }
  }, [map])

  return null
}
