import { useCallback, useState } from "react";
import { GoogleMap, LoadScript, Marker, Polyline, InfoWindow } from "@react-google-maps/api";

interface Location {
  name: string;
  lat: number;
  lng: number;
  description: string;
}

const GOOGLE_MAPS_API_KEY = "AIzaSyDAspyBktkxhZsn7PMrLBhQMgipuxbUGRA";

const containerStyle = { width: "100%", height: "400px" };

const ItineraryMap = ({ locations }: { locations: Location[] }) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      setMap(mapInstance);
      if (locations.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        locations.forEach((loc) => bounds.extend({ lat: loc.lat, lng: loc.lng }));
        mapInstance.fitBounds(bounds, 50);
      }
    },
    [locations]
  );

  if (locations.length === 0) return null;

  const center = { lat: locations[0].lat, lng: locations[0].lng };
  const path = locations.map((l) => ({ lat: l.lat, lng: l.lng }));

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12} onLoad={onLoad}>
        {locations.map((loc, i) => (
          <Marker
            key={i}
            position={{ lat: loc.lat, lng: loc.lng }}
            label={{ text: String(i + 1), color: "white", fontWeight: "bold" }}
            onClick={() => setSelectedLocation(loc)}
          />
        ))}

        {selectedLocation && (
          <InfoWindow
            position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            onCloseClick={() => setSelectedLocation(null)}
          >
            <div>
              <strong>{selectedLocation.name}</strong>
              <p style={{ margin: "4px 0 0", fontSize: "13px" }}>{selectedLocation.description}</p>
            </div>
          </InfoWindow>
        )}

        {locations.length > 1 && (
          <Polyline
            path={path}
            options={{ strokeColor: "hsl(24, 85%, 52%)", strokeWeight: 3, strokeOpacity: 0.7 }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default ItineraryMap;
