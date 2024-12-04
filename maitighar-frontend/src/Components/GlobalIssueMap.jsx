import { useState, useEffect } from "react";
import {
  MapContainer, TileLayer, Marker, Popup, useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

// This component will handle changing the map view
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

function GlobalIssueMap() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const adminData = JSON.parse(localStorage.getItem("loggedAdmin"));
  const { token } = adminData;
  const { setNotification } = useNotification();

  const [showNearby, setShowNearby] = useState(false);
  const maxDistance = 5000; // 5 km, adjust as needed

  const initialZoom = 12; // Adjust this value as needed

  const handleMarkerClick = (id) => {
    navigate(`/admin/details/${id}`);
  };

  useEffect(() => {
    // Fetch user's location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting user location:", error);
          // Fallback to a default location (e.g., Kathmandu) if geolocation fails
          setUserLocation([27.7172, 85.324]);
        },
      );
    } else {
      console.log("Geolocation is not available in this browser.");
      // Fallback to a default location
      setUserLocation([27.7172, 85.324]);
    }

    // Fetch issues
    const fetchIssues = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get("/api/issues/admin", {
          params: { adminId: adminData.id },
          ...config, // Spread the config here
        });
        setIssues(response.data);
      } catch (error) {
        console.error("Error fetching issues:", error);
        setNotification({ message: " Error Fetching issues.", status: "error" });
      }
    };
    fetchIssues();
  }, [token]);

  const fetchNearbyIssues = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get("/api/issues/nearby", {
        params: {
          latitude: userLocation[0],
          longitude: userLocation[1],
          maxDistance,
        },
        ...config,
      });
      setIssues(response.data);
      setShowNearby(true);
    } catch (error) {
      console.error("Error fetching nearby issues:", error);
      setNotification({ message: " Error Fetching issues.", status: "error" });
    }
  };

  const getMarkerColor = (upvotes) => {
    if (upvotes >= 10) return "red";
    if (upvotes >= 5) return "orange";
    return "blue";
  };

  const createCustomIcon = (upvotes) => L.divIcon({
    className: "custom-icon",
    html: `<div style="background-color: ${getMarkerColor(upvotes)}; width: 25px; height: 25px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold;">${upvotes}</div>`,
  });

  if (!userLocation) {
    return <div>Loading map...</div>;
  }

  return (
    <>
      <Button
        variant="contained"
        onClick={fetchNearbyIssues}
      >
        See all nearby issues
      </Button>
      <MapContainer
        center={userLocation}
        zoom={initialZoom}
        style={{ height: "100vh", width: "100%" }}
      >
        <ChangeView
          center={userLocation}
          zoom={initialZoom}
        />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {issues.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.latitude, issue.longitude]}
            icon={createCustomIcon(issue.upvotes)}
          >
            <Popup>
              <h3>{issue.title}</h3>
              <p>
                Department:
                {issue.department}
              </p>
              <p>
                Status:
                {issue.status}
              </p>
              <p>
                Upvotes:
                {issue.upvotes}
              </p>
              <Button onClick={() => handleMarkerClick(issue.id)}>Go to issue</Button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
}

export default GlobalIssueMap;
