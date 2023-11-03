import {
  useEffect,
  useState,
} from "react"
import { createPortal } from "react-dom"
import maplibregl from 'maplibre-gl'

type MarkerState = Partial<{
  elem: HTMLDivElement
  marker: maplibregl.Marker
}>

export interface GeoMarkerProps {
  map: maplibregl.Map
  locationId: string
  coords: maplibregl.LngLatLike
  children: React.ReactNode | React.ReactNode[]
}

export const GeoMarker = ({
  map,
  locationId,
  coords,
  children,
}: GeoMarkerProps) => {
  const [state, setState] = useState<MarkerState>({})

  useEffect(() => {
    if (!map) {
      console.log('geomap/GeoMarker/useEffect, early exit for location: ' + locationId)
      return
    }

    // --- update ---
    if (state?.marker) {
      console.log('geomap/GeoMarker: updating coordinates for location ' + locationId)
      state.marker.setLngLat(coords)
      return
    }

    // --- create ---
    console.log('geomap/GeoMarker: creating Marker for location ' + locationId)
    const elem = document.createElement('div')
    elem.id = `geomap-marker-${locationId}`

    const marker = new maplibregl.Marker({
      element: elem,
    })
      .setLngLat(coords)
      .addTo(map)

    setState({elem, marker})

    return () => {
      console.log('geomap/Marker: cleanup for location: ' + locationId)
      marker.remove()
      elem.remove()
    }
  }, [map])

  // createPortal inspired by react-map-gl/Marker
  // https://github.com/visgl/react-map-gl/blob/master/src/components/marker.ts
  return (!state.elem)
    ? null
    : createPortal(children, state.elem)
}
