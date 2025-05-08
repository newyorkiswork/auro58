'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import washerIcon from '/public/icons/washer.svg';
import dryerIcon from '/public/icons/dryer.svg';

export type LaundromatMapItem = {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  washersAvailable?: number
  dryersAvailable?: number
  washersInUse?: number
  dryersInUse?: number
  washersOut?: number
  dryersOut?: number
}

type Props = {
  laundromats: LaundromatMapItem[]
  selectedLaundromatId?: string | null
  onSelectLaundromat?: (id: string | null) => void
  userLocation?: { lat: number; lng: number } | null
}

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
}

const defaultZoom = 12

const mapContainerStyle = {
  width: '100%',
  height: '400px',
}

export default function GoogleMapComponent({ laundromats, selectedLaundromatId, onSelectLaundromat, userLocation }: Props) {
  // Load the Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  })

  // Memoize the map options to prevent unnecessary re-renders
  const mapOptions = useMemo(() => ({
    disableDefaultUI: false,
    clickableIcons: true,
    scrollwheel: true,
    zoomControl: true,
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
  }), [])

  // Track selected laundromat for info window
  const [selected, setSelected] = useState<LaundromatMapItem | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const [hasCentered, setHasCentered] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [markerIconOptions, setMarkerIconOptions] = useState<{ washer: google.maps.Icon | string; dryer: google.maps.Icon | string }>({ washer: '/icons/washer.svg', dryer: '/icons/dryer.svg' });

  // On initial load, center on first laundromat or default
  useEffect(() => {
    if (isLoaded && mapRef.current && !hasCentered) {
      if (laundromats.length > 0) {
        mapRef.current.setCenter({ lat: laundromats[0].lat, lng: laundromats[0].lng })
      } else {
        mapRef.current.setCenter(defaultCenter)
      }
      setHasCentered(true)
    }
  }, [isLoaded, laundromats, hasCentered])

  // When selectedLaundromatId changes, update selected and pan map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) {
      console.log('Map not loaded yet:', { isLoaded, mapRef: mapRef.current })
      return
    }
    if (selectedLaundromatId) {
      const found = laundromats.find(l => l.id === selectedLaundromatId)
      console.log('Selected ID:', selectedLaundromatId, 'Found:', found, 'MapRef:', mapRef.current)
      if (found) {
        setSelected(found)
        mapRef.current.panTo({ lat: found.lat, lng: found.lng })
      } else {
        console.log('No laundromat found for selected ID:', selectedLaundromatId)
      }
    }
  }, [selectedLaundromatId, laundromats, isLoaded])

  useEffect(() => {
    if (mapLoaded && selectedLaundromatId && mapRef.current) {
      const selectedLaundromat = laundromats.find(l => l.id === selectedLaundromatId)
      if (selectedLaundromat) {
        mapRef.current.panTo({ lat: selectedLaundromat.lat, lng: selectedLaundromat.lng })
      }
    }
  }, [selectedLaundromatId, laundromats, mapLoaded])

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map
    setMapLoaded(true)
  }

  // Set marker icon options after map is loaded
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.Size) {
      setMarkerIconOptions({
        washer: {
          url: '/icons/washer.svg',
          scaledSize: new window.google.maps.Size(36, 36),
        } as google.maps.Icon,
        dryer: {
          url: '/icons/dryer.svg',
          scaledSize: new window.google.maps.Size(36, 36),
        } as google.maps.Icon,
      });
    } else {
      setMarkerIconOptions({
        washer: '/icons/washer.svg',
        dryer: '/icons/dryer.svg',
      });
    }
  }, [mapLoaded]);

  function getMarkerIcon(type: 'washer' | 'dryer'): google.maps.Icon | string {
    return markerIconOptions[type];
  }

  // Helper: pick marker type based on most available machines
  function markerType(l: LaundromatMapItem) {
    const washers = (l.washersAvailable ?? 0) + (l.washersInUse ?? 0) + (l.washersOut ?? 0);
    const dryers = (l.dryersAvailable ?? 0) + (l.dryersInUse ?? 0) + (l.dryersOut ?? 0);
    return washers >= dryers ? 'washer' : 'dryer';
  }

  if (loadError) {
    return (
      <div className="h-[400px] w-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Error loading Google Maps</p>
          <p className="text-gray-600 text-sm mt-2">Please check your API key and try again</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="h-[400px] w-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden shadow-lg">
      <GoogleMap
        options={mapOptions}
        zoom={defaultZoom}
        mapContainerClassName="w-full h-full"
        onLoad={onMapLoad}
        center={userLocation || defaultCenter}
      >
        {userLocation && (
          <Marker
            position={userLocation}
            icon={
              typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.Size
                ? {
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    scaledSize: new window.google.maps.Size(36, 36),
                  }
                : 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }
          />
        )}
        {laundromats.map((laundromat) => (
          <Marker
            key={laundromat.id}
            position={{ lat: laundromat.lat, lng: laundromat.lng }}
            icon={getMarkerIcon(markerType(laundromat))}
            onClick={() => {
              setSelected(laundromat)
              onSelectLaundromat?.(laundromat.id)
            }}
          />
        ))}
        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div className="min-w-[220px] font-sans">
              <div className="font-bold text-base mb-1">{selected.name}</div>
              <div className="text-xs text-gray-700 mb-2">{selected.address}</div>
              <div className="flex gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <img src="/icons/washer.svg" alt="Washer" className="w-4 h-4" />
                    <span className="font-semibold">Washers</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-green-700">{selected.washersAvailable ?? 0} available</span>
                    <span className="text-yellow-700">{selected.washersInUse ?? 0} in use</span>
                    <span className="text-gray-500">{selected.washersOut ?? 0} out</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <img src="/icons/dryer.svg" alt="Dryer" className="w-4 h-4" />
                    <span className="font-semibold">Dryers</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-green-700">{selected.dryersAvailable ?? 0} available</span>
                    <span className="text-yellow-700">{selected.dryersInUse ?? 0} in use</span>
                    <span className="text-gray-500">{selected.dryersOut ?? 0} out</span>
                  </div>
                </div>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
} 