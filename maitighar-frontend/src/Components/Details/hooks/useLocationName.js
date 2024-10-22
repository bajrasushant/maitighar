import { useState, useCallback } from "react";
import { useNotification } from "../../../context/NotificationContext";

export default function useLocationName() {
  const [locationName, setLocationName] = useState("");
  const { setNotification } = useNotification();

  const fetchLocationName = useCallback(
    async (lat, lon) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        );
        const data = await response.json();
        setLocationName(data.display_name || "Location name not available");
      } catch (err) {
        console.error("Error fetching location name:", err);
        setNotification({
          message: "Error fetching location. Please try again.",
          status: "error",
        });
        setLocationName("Unable to fetch location name");
      }
    },
    [setNotification],
  );

  return { locationName, fetchLocationName };
}
