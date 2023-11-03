import { useEffect, useState } from "react"
import { GeoMapContextData, GeoMapDataStateArgs } from "./context"
import { GeoJSONSourceSpecification } from '@maplibre/maplibre-gl-style-spec'

export type MapFactory = () => Promise<maplibregl.Map>

export const useMap = (factory: MapFactory): GeoMapDataStateArgs => {
  const mapContextState = useState<GeoMapContextData>({})
  const [, setMapContext] = mapContextState

  useEffect(() => {
    let mounted = true
    let mountedGlMap: maplibregl.Map
    console.log('geomap/hooks/useMap: creating map')

    factory().then((glMap: maplibregl.Map) => {
      new Promise<maplibregl.Map>((resolve, reject) => {
        glMap.on('load', () => {
          console.log('geomap/hooks/useMap: map.on(load)')
          resolve(glMap)
        })
      }).then((map) => {
        if (!mounted) {
          console.log('geomap/hooks/useMap: mounted=false, not calling setMapContext')
          return
        }
        console.log('geomap/hooks/useMap: setMapContext')
        setMapContext({map})
        mountedGlMap = map
      })
    })

    return () => {
      mounted = false
      console.log('geomap/hooks/useMap: cleanup')
      if (mountedGlMap) {
        mountedGlMap.remove()
      }
      setMapContext({map: undefined})
    }
  }, [factory])

  return mapContextState
}


export interface ISource {
  sourceId: string
  mapSource: GeoJSONSourceSpecification
}

export interface StateType {
  registeredSources: ISource[]
  indexRegisteredSourcesById: Record<string, ISource>
}

export const reducerState = (registeredSources: ISource[]): StateType => {
  const indexRegisteredSourcesById = registeredSources.reduce((accum, registered) => {
    return {
      ...accum,
      [registered.sourceId]: registered,
    }
  }, {})

  return {registeredSources, indexRegisteredSourcesById}
}

export interface UseMapSourcesArgs {
  dataSources: ISource[]
  map: maplibregl.Map
}

export const useMapSources = ({
  dataSources,
  map,
}: UseMapSourcesArgs): StateType => {

  // const [registeredSources, setRegisteredSources] = useState<ISource[]>([])
  const [state, setState] = useState<StateType>({
    registeredSources: [],
    indexRegisteredSourcesById: {},
  })

  useEffect(() => {
    if (!map) {
      return
    }

    if (dataSources.length === 0) {
      return
    }

    const sources = dataSources.map(({sourceId, mapSource}) => {
      console.log('geomap/hooks/useSource map.addSource for sourceId: ' + sourceId)
      map.addSource(sourceId, mapSource)

      return {sourceId,mapSource}
    })

    setState(reducerState(sources))

    return () => {
      if (sources.length > 0) {
        sources.forEach(({sourceId}) => {
          console.log('geomap/hooks/useSource map.removeSource for sourceId: ' + sourceId)
          map.removeSource(sourceId)
        })

        setState(reducerState([]))
      }
    }
  }, [map, dataSources])

  return state
}
