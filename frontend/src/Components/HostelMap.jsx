import React, { useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import toast from "react-hot-toast";

import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// --------------------------------------------------
// Map Click Handler
// --------------------------------------------------
function MapClickHandler({
  setPosition,
  onLocationChange,
}) {
  useMapEvents({
    click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      setPosition({
        lat,
        lng,
      });

      if (onLocationChange) {
        onLocationChange(lat, lng);
      }
    },
  });

  return null;
}

// --------------------------------------------------
// Change Map View
// --------------------------------------------------
function ChangeMapView({ position }) {
  const map = useMap();

  map.setView(
    [position.lat, position.lng],
    map.getZoom()
  );

  return null;
}

// --------------------------------------------------
// Hostel Map
// --------------------------------------------------
export default function HostelMap({
  position,
  setPosition,
  onLocationChange,
}) {

  // --------------------------------------------------
  // Notify parent whenever location changes
  // --------------------------------------------------
  const updateLocation = (lat, lng) => {
    const newPosition = {
      lat: Number(lat),
      lng: Number(lng),
    };

    // Update map position
    setPosition(newPosition);

    // Notify AddHostelDetails
    if (onLocationChange) {
      onLocationChange(
        newPosition.lat,
        newPosition.lng
      );
    }
  };

  // --------------------------------------------------
  // Current Location
  // --------------------------------------------------
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (location) => {
        const lat =
          location.coords.latitude;

        const lng =
          location.coords.longitude;

        console.log(
          "Current location:",
          lat,
          lng
        );

        updateLocation(lat, lng);
      },

      (error) => {
        console.error(
          "Geolocation error:",
          error
        );

        switch (error.code) {

          case error.PERMISSION_DENIED:
            toast.error(
              "Location permission denied."
            );
            break;

          case error.POSITION_UNAVAILABLE:
            toast.error(
              "Location information unavailable."
            );
            break;

          case error.TIMEOUT:
            toast.error(
              "Location request timed out."
            );
            break;

          default:
            toast.error(
              "Unable to fetch current location."
            );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // --------------------------------------------------
  // Marker Drag
  // --------------------------------------------------
  const eventHandlers = useMemo(
  () => ({
    dragend(event) {
      const marker = event.target;
      const newPosition = marker.getLatLng();

      const lat = newPosition.lat;
      const lng = newPosition.lng;

      setPosition({
        lat,
        lng,
      });

      if (onLocationChange) {
        onLocationChange(lat, lng);
      }
    },
  }),
  [setPosition, onLocationChange]
);


  return (
    <div className="space-y-3">

      {/* Current Location Button */}
      <button
        type="button"
        onClick={handleCurrentLocation}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
      >
        📍 Use Current Location
      </button>

      {/* Map */}
      <MapContainer
        center={[
          position.lat,
          position.lng,
        ]}
        zoom={15}
        scrollWheelZoom={true}
        style={{
          height: "500px",
          width: "100%",
          borderRadius: "12px",
        }}
      >

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map click */}
        <MapClickHandler
          setPosition={setPosition}
          onLocationChange={onLocationChange}
        />

        {/* Move map */}
        <ChangeMapView
          position={position}
        />

        {/* Marker */}
        <Marker
          position={[
            position.lat,
            position.lng,
          ]}
          draggable={true}
          eventHandlers={eventHandlers}
        />

      </MapContainer>
    </div>
  );
}