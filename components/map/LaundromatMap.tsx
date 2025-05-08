'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF } from '@react-google-maps/api'

type Laundromat = {
  id: string
  name: string
  address: string
  lat: number
  lng: number
}

type Props = {
  laundromats: Laundromat[]
  onMarkerClick?: (laundromat: Laundromat) => void
}

export function LaundromatMap({ laundromats, onMarkerClick }: Props) {
  const [selectedLaundromat, setSelectedLaundromat] = useState<Laundromat | null>(null)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    console.log('Google Maps API Key:', apiKey ? 'Present' : 'Missing')
    if (!apiKey) {
      console.error('Google Maps API key is missing. Check your .env.local file.')
    }
  }, [apiKey])

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || '',
    libraries: ['places']
  })

  useEffect(() => {
    if (loadError) {
      console.error('Google Maps load error:', loadError)
    }
  }, [loadError])

  const center = useMemo(() => {
    if (laundromats.length === 0) return { lat: 40.7128, lng: -74.0060 } // Default to NYC
    return {
      lat: laundromats.reduce((sum, l) => sum + l.lat, 0) / laundromats.length,
      lng: laundromats.reduce((sum, l) => sum + l.lng, 0) / laundromats.length,
    }
  }, [laundromats])

  const handleMarkerClick = useCallback((laundromat: Laundromat) => {
    setSelectedLaundromat(laundromat)
    onMarkerClick?.(laundromat)
  }, [onMarkerClick])

  if (!isLoaded) {
    return (
      <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
        {loadError && (
          <p className="text-red-500 mt-2">Error loading map: {loadError.message}</p>
        )}
      </div>
    )
  }

  return (
    <GoogleMap
      zoom={12}
      center={center}
      mapContainerClassName="w-full h-[400px] rounded-lg shadow-lg"
      options={{
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      }}
    >
      {laundromats.map((laundromat) => (
        <MarkerF
          key={laundromat.id}
          position={{ lat: laundromat.lat, lng: laundromat.lng }}
          onClick={() => handleMarkerClick(laundromat)}
        />
      ))}

      {selectedLaundromat && (
        <InfoWindowF
          position={{ lat: selectedLaundromat.lat, lng: selectedLaundromat.lng }}
          onCloseClick={() => setSelectedLaundromat(null)}
        >
          <div className="p-2">
            <h3 className="font-semibold">{selectedLaundromat.name}</h3>
            <p className="text-sm text-gray-600">{selectedLaundromat.address}</p>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  )
} 