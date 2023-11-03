import { createContext, Dispatch, SetStateAction } from "react"

type StateSetter<T> = Dispatch<SetStateAction<T>>
type StateArgs<S> = [S, StateSetter<S>]

export interface GeoMapContextData {
  map?: maplibregl.Map
}

export type GeoMapDataStateArgs = StateArgs<GeoMapContextData>

const geoMapInitState: GeoMapContextData = {
  map: undefined
}

export const GeoMapContext = createContext<GeoMapDataStateArgs>([
  geoMapInitState,
  x => (x),
])
