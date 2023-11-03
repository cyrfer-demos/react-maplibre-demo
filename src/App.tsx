import { LocationPOI } from './models'
import './style.css';

import maplibregl from 'maplibre-gl'

// TODO: comment CSS import below to see a bug
import 'maplibre-gl/dist/maplibre-gl.css'



import {
  GeoMarker,
  ISource,
  GeoLayer,
  LayerStyle,
  useMap,
  useMapSources,
} from './geomap'

import { makeCirclePolygon } from './utils'
import { useCallback, useEffect, useState } from 'react'
import { Pin } from './components'
import { GeoJSONSourceSpecification } from '@maplibre/maplibre-gl-style-spec';

const fenceMeta: LocationPOI['fenceMeta'] = {
  radiusMeters: 100,
  center: {
    type: "Point",
    coordinates: [-118.60418982063331, 34.088879120267066],
  },
}

const loc01: LocationPOI = {
  id: "loc-01",
  name: "Topanga Film Festival",
  fenceMeta,
  fence: {
    type: 'Polygon',
    coordinates: [
      makeCirclePolygon({
        radiusMeters: fenceMeta.radiusMeters,
        center: {
          lng: fenceMeta.center.coordinates[0],
          lat: fenceMeta.center.coordinates[1],
        }
      })
    ]
  }
}

const locations: LocationPOI[] = [
  loc01,  
]

const makeMapSourceFromLocations = (data: LocationPOI[]): GeoJSONSourceSpecification => {
  const features = data.map(loc => ({
    type: 'Feature',
    geometry: loc.fence,
    // properties: {
    //   name: loc.name,
    //   id: loc.id,
    // },
  }))

  const mapSource: GeoJSONSourceSpecification = {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features,
    }
  }

  return mapSource
}

const sourceIdLocations = 'source-01-locations'

// put all locations into one dataSource
const dataSources: ISource[] = [
  {
    sourceId: sourceIdLocations,
    mapSource: makeMapSourceFromLocations(locations),
  },
]

const containerId = "only-map-container"

interface FactoryConfiguration {
  styleUrl: string
}

interface GeoMapViewState {
  zoom: number
  lat: number
  lng: number
}

interface MapLayer {
  sourceId: string
  layerId: string
  visible: boolean
  style: LayerStyle
}

export const App = () => {

  const [factorySettings, setFactorySettings] = useState<FactoryConfiguration>()
  const [initViewSettings, setInitViewSettings] = useState<GeoMapViewState>({zoom: 3, lat: 0, lng: 0})

  useEffect(() => {
    // fake an api call to retrieve configuration
    setTimeout(() => {
      setFactorySettings({
        styleUrl: "https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL",
      })
    }, 1000)
  }, [])

  useEffect(() => {
    // fake some technique to determine view settings
    setTimeout(() => {
      setInitViewSettings({
        lng: loc01.fenceMeta.center.coordinates[0],
        lat: loc01.fenceMeta.center.coordinates[1],
        zoom: 13,
      })
    }, 900)
  }, [])

  const factory = useCallback(async (): Promise<maplibregl.Map> => {
    const map = new maplibregl.Map({
      container: containerId,
      style: factorySettings?.styleUrl || '',
      center: [initViewSettings.lng, initViewSettings.lat],
      zoom: initViewSettings.zoom,
    })

    return map
  }, [factorySettings, initViewSettings])

  const mapContextState = useMap(factory)
  const [mapContext, ] = mapContextState
  const {indexRegisteredSourcesById} = useMapSources({dataSources, map: mapContext.map})

  const [mapLayers, setMapLayers] = useState<MapLayer[]>([
    {
      sourceId: sourceIdLocations,
      layerId: `layer-${sourceIdLocations}-fill`,
      visible: true,
      style: {
        type: 'fill',
        paint: {
          'fill-color': '#F37260',
          'fill-opacity': 0.25,
        },
      },
    },
  ])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flexWrap: 'nowrap',
      background: 'red',
      width: '100%',
      height: '100%',
    }}>
      <div style={{margin: 'auto'}}>
        <h1>Demo Marker and Layer</h1>
      </div>
      <div style={{
        position: "relative",
        flex: 1,
        background: 'darkgreen',
      }}>
        <div
          id={containerId}
          style={{
            position: 'relative',
            height: '100%',
            width: '100%',
          }}
        >
          {(mapContext.map) && (
            <>
              {mapLayers.filter(({visible}) => visible).map(({sourceId, layerId, style}) => ((indexRegisteredSourcesById[sourceId]) && (
                <GeoLayer
                  key={`layer-${layerId}`}
                  map={mapContext.map}
                  sourceId={sourceId}
                  layerId={layerId}
                  style={style}
                />
              )))}

              {locations.map((loc) => (
                <GeoMarker
                  key={`marker-${loc.id}`}
                  map={mapContext.map}
                  locationId={loc.id}
                  coords={[
                    loc.fenceMeta.center.coordinates[0],
                    loc.fenceMeta.center.coordinates[1],
                  ]}
                >
                  <Pin />
                </GeoMarker>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
