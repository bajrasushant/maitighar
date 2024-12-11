import { useState, useEffect, useRef } from "react";
import {
  MapContainer, TileLayer, Marker, useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button, Box, Typography } from "@mui/material";

function MapPicker({ setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function LocationPicker({ position, setPosition }) {
  const [mapCenter, setMapCenter] = useState(position);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);
  const mapRef = useRef();

  useEffect(() => {
    if (userLocation && mapRef.current) {
      // Pan the map to the user's location when it changes
      mapRef.current.setView(userLocation, 13);
    }
  }, [userLocation]);

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setError(null);
        },
        () => {
          setError("Unable to retrieve your location. Please select manually on the map.");
        },
      );
    } else {
      setError("Geolocation is not supported by your browser. Please select manually on the map.");
    }
  };

  return (
    <Box>
      <Button variant="contained" onClick={getUserLocation} sx={{ mb: 2 }}>
        Use My Current Location
      </Button>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: "300px", width: "100%" }}
        ref={mapRef} // Reference to the map
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} />
        <MapPicker setPosition={setPosition} />
      </MapContainer>
      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
        Click on the map to set a specific location
      </Typography>
    </Box>
  );
}

export default LocationPicker;
