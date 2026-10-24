import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Info,
  MapPin,
  Wifi,
  Utensils,
  Bed,
  Gavel,
  CheckCircle,
  XCircle,
  Check,
  Search,
  Train,
  Bus,
  Plane,
  Bike,
  Car,
  X,
  Network,
  Wind,
  Fan,
  Bath,
  Flame,
  Shirt,
  ShieldCheck,
  Building,
  Video,
  Zap,
  Droplet,
  Tv,
  Dumbbell,
  BookOpen,
  Gamepad2,
  TreePine,
  ChefHat,
  Sparkles,
  ParkingSquare,
  Clock,
  Star,
  ArrowRight,
  ArrowLeft,
  User,
  Users,
  Image as ImageIcon,
  Plus,
  Send,
  Coffee,
  Snowflake,
  FileText,
  Locate,
  Camera,
  Upload,
  AlertTriangle,
  RotateCcw,
  Lightbulb,
  Shield,
  Banknote
} from 'lucide-react';

import toast from 'react-hot-toast';
import axios from 'axios';
import api from "../api/axiosConfig";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// ============================================================
// SAVE & RESTORE PROGRESS HELPER FUNCTIONS
// ============================================================

const SESSION_STORAGE_KEY = 'addHostelProgress';

// Save current progress to sessionStorage
const saveProgress = (data) => {
  try {
    const progressData = {
      ...data,
      _timestamp: Date.now(),
      _version: '1.0'
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(progressData));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
};

// Load saved progress from sessionStorage
const loadProgress = () => {
  try {
    const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    // Check if progress is less than 24 hours old
    if (parsed._timestamp && (Date.now() - parsed._timestamp) > 24 * 60 * 60 * 1000) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch (error) {
    console.error('Failed to load progress:', error);
    return null;
  }
};

// Clear saved progress
const clearProgress = () => {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear progress:', error);
  }
};

// ============================================================
// LOGGED-IN OWNER REGISTRATION DETAILS HELPERS
// ============================================================
// The registration / login response is stored in localStorage under "user".
// Owner name and phone number in Basic Info must always come from there.

// Normalize any raw phone value into a 10-digit string.
const normalizePhoneValue = (value) => {
  if (value === null || value === undefined) return "";

  const text = String(value).trim();
  if (!text) return "";

  const digitsOnly = text.replace(/\D/g, "");

  if (digitsOnly.length >= 10) {
    // Keep the last 10 digits so values such as +91XXXXXXXXXX
    // are displayed as the required 10-digit registered number.
    return digitsOnly.slice(-10);
  }

  return digitsOnly;
};

// All phone field names we have seen in registration flows.
const PHONE_FIELD_ALIASES = [
  // Registration field used for the owner's contact number.
  "contactPhoneNumber",
  "contactPhone",
  "contact_phone_number",
  "contact_phone",

  // Other likely registration field names.
  "registrationPhoneNumber",
  "registrationPhone",
  "registeredPhone",
  "ownerPhone",
  "ownerPhoneNumber",
  "userPhone",
  "userPhoneNumber",
  "accountPhone",
  "accountPhoneNumber",
  "phoneNumber",
  "phone",
  "mobileNumber",
  "mobile",
  "phone_number",
  "mobile_number",
  "contactNumber",
  "contact",
  "phoneNo",
  "mobileNo",
  "contact_no",
  "phone_no",
  "tel",
  "telephone",
];

// Read the logged-in owner object stored by the registration/login flow.
// Different versions of the authentication/registration UI may use different
// localStorage keys, so check all known registration keys.
const getRegisteredUser = () => {
  const storageKeys = [
    "user",
    "userInfo",
    "loggedInUser",
    "registeredUser",
    "registrationData",
    "ownerData",
    "userData",
    "owner",
    "authUser",
  ];

  for (const key of storageKeys) {
    try {
      const storedUser = localStorage.getItem(key);

      if (!storedUser) {
        continue;
      }

      const parsedUser = JSON.parse(storedUser);

      if (parsedUser && typeof parsedUser === "object") {
        return parsedUser;
      }
    } catch (error) {
      console.warn(`Failed to parse ${key} from localStorage:`, error);
    }
  }

  return null;
};

// Some registrations wrap the user object under a nested key
// such as { user: {...} }, { data: {...} } or { owner: {...} }.
const getRegisteredUserData = () => {
  const user = getRegisteredUser();

  if (!user) return null;

  return {
    ...user,
    ...(user.user && typeof user.user === "object" ? user.user : {}),
    ...(user.data && typeof user.data === "object" ? user.data : {}),
    ...(user.owner && typeof user.owner === "object" ? user.owner : {}),
    ...(user.userData && typeof user.userData === "object" ? user.userData : {}),
    ...(user.registrationData &&
    typeof user.registrationData === "object"
      ? user.registrationData
      : {}),
  };
};

// Registered owner name is read from the registration details.
const getRegisteredOwnerName = () => {
  const userData = getRegisteredUserData();

  if (!userData) return "";

  return (
    userData.name ||
    userData.fullName ||
    userData.ownerName ||
    userData.username ||
    ""
  );
};

// Recursively search a value object for any known phone alias.
const findPhoneValueInObject = (value, visited = new Set()) => {
  if (!value || typeof value !== "object" || visited.has(value)) {
    return "";
  }

  visited.add(value);

  // Check all direct phone/contact fields first.
  for (const key of PHONE_FIELD_ALIASES) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      continue;
    }

    const normalized = normalizePhoneValue(value[key]);

    // The Basic Info field requires a 10-digit number. Do not stop on
    // unrelated short numeric values such as an ID.
    if (normalized.length === 10) {
      return normalized;
    }
  }

  // Then inspect nested objects and arrays because registration responses
  // can wrap the account details several levels deep.
  for (const nestedValue of Object.values(value)) {
    if (nestedValue && typeof nestedValue === "object") {
      const found = findPhoneValueInObject(nestedValue, visited);

      if (found) {
        return found;
      }
    }
  }

  return "";
};

// Try to find a phone number anywhere in localStorage.
// This runs when the phone number is NOT present inside the user object.
// It scans every localStorage key and returns the first value that
// looks like a 10-digit phone number, only when the key name itself
// suggests a phone/mobile/contact field.
const findPhoneInLocalStorage = () => {
  try {
    // First: check well-known top-level keys directly.
    const directKeys = [
      "phoneNumber",
      "phone",
      "mobileNumber",
      "mobile",
      "contactNumber",
      "contactPhoneNumber",
      "contactPhone",
      "registeredPhone",
      "ownerPhone",
      "userPhone",
    ];

    for (const key of directKeys) {
      const value = localStorage.getItem(key);

      if (!value) continue;

      const normalized = normalizePhoneValue(value);

      if (normalized.length === 10) {
        console.log(`Phone found in localStorage[${key}]:`, normalized);
        return normalized;
      }
    }

    // Second: scan every localStorage key for phone-looking values.
    const phoneishRegex = /(phone|mobile|contact|tel|cell)/i;

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (!phoneishRegex.test(key)) continue;

      const value = localStorage.getItem(key);
      if (!value) continue;

      // Skip if it is an object - those are handled by other helpers.
      const trimmed = value.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        continue;
      }

      const normalized = normalizePhoneValue(trimmed);

      if (normalized.length === 10) {
        console.log(`Phone found in localStorage[${key}]:`, normalized);
        return normalized;
      }
    }
  } catch (error) {
    console.warn("Failed to scan localStorage for phone:", error);
  }

  return "";
};

// Registration phone number is the single source of truth.
const getRegisteredPhoneNumber = () => {
  const user = getRegisteredUser();

  // 1) Search the user object (and all nested objects) for a known alias.
  if (user) {
    const found = findPhoneValueInObject(user);
    if (found) {
      return found;
    }
  }

  // 2) Search all localStorage keys for a phone-looking value.
  const fromStorage = findPhoneInLocalStorage();
  if (fromStorage) {
    return fromStorage;
  }

  return "";
};

// ============================================================
// HOSTEL LOCATION MAP HELPERS
// ============================================================

const hostelMarkerIcon = L.divIcon({
  className: "hostel-location-marker",
  html: `
    <div style="
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #2563eb;
      border: 3px solid #ffffff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.30);
    ">
      <div style="
        width: 10px;
        height: 10px;
        background: #ffffff;
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34]
});

const HostelMapCenter = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (!position) return;

    map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), 16), {
      duration: 0.8
    });
  }, [map, position]);

  return null;
};

const DraggableHostelMarker = ({
  position,
  onPositionChange,
  onDragStart
}) => {
  const eventHandlers = {
    dragstart: () => {
      onDragStart?.();
    },
    dragend: (event) => {
      const marker = event.target;
      const latLng = marker.getLatLng();

      onPositionChange({
        lat: latLng.lat,
        lng: latLng.lng
      });
    }
  };

  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={hostelMarkerIcon}
      draggable={true}
      eventHandlers={eventHandlers}
    >
      <Popup>
        <div className="text-xs">
          <div className="font-semibold text-slate-800">
            Hostel Location
          </div>
          <div className="mt-1 text-slate-600">
            Drag the marker to adjust the hostel location.
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

const HostelMapClickHandler = ({ onPositionChange }) => {
  useMapEvents({
    click: (event) => {
      onPositionChange({
        lat: event.latlng.lat,
        lng: event.latlng.lng
      });
    }
  });

  return null;
};

const AddHostelDetails = () => {

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [visitedSteps, setVisitedSteps] = useState(
    Array.from({ length: 8 }, (_, index) => index)
  );

  const [showResumePopup, setShowResumePopup] = useState(false);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [missingPhotoMessages, setMissingPhotoMessages] = useState({
    amenities: [],
    rooms: [],
    hostelPhotos: [],
  });

  // =====================================================
  // APPROVAL STATUS - FIXED
  // =====================================================
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [isCheckingApprovalStatus, setIsCheckingApprovalStatus] = useState(true);
  const [hasHostel, setHasHostel] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(true);
  const [approvalCheckError, setApprovalCheckError] = useState(false);
  
  // 🔥 NEW: Track if hostel is in DRAFT state (incomplete) or fully submitted
  const [isDraft, setIsDraft] = useState(false);
  const [isFullySubmitted, setIsFullySubmitted] = useState(false);

  const restoreSavedHostelProgress = async (savedHostelId) => {
    if (!savedHostelId) return;

    const completed = [];
    const restoredVisited = [0];
    const missingPhotos = { amenities: [], rooms: [], hostelPhotos: [] };

    // Convert every backend photo path into a URL that the browser can actually load.
    // The backend commonly returns values such as uploads/amenities/... rather than
    // a complete http://localhost:8080/... URL.
    const normalizePhotoUrl = (value) => {
      if (!value || typeof value !== "string") return null;

      const trimmed = value.trim();
      if (!trimmed) return null;

      if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
        return trimmed;
      }

      if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
      }

      let baseUrl = String(
        api?.defaults?.baseURL ||
        "http://localhost:8080"
      ).replace(/\/$/, "");

      // If axios baseURL is /api, uploaded files still live at the backend
      // origin, not under /api/uploads.
      baseUrl = baseUrl.replace(/\/api$/i, "");

      if (trimmed.startsWith("/")) {
        return `${baseUrl}${trimmed}`;
      }

      return `${baseUrl}/${trimmed}`;
    };

    const getPersistedPhotoUrl = (photo) =>
      normalizePhotoUrl(
        photo?.photoUrl ||
        photo?.fileUrl ||
        photo?.filePath ||
        photo?.url ||
        null
      );

    // IMPORTANT:
    // Do not use the database URL directly in <img>.
    // The owner photo endpoints can require Authorization, while a normal
    // <img src="..."> request does NOT send the Authorization header.
    // That is why the DB photo can exist but the UI can still show a broken image.
    //
    // We fetch the real image through axios (with the existing auth interceptor),
    // create a browser blob URL, and use that blob URL for the preview.
    // If the fetch fails, the image is genuinely unavailable and the owner must
    // re-upload it.
    const loadPersistedPhoto = async (photoUrl) => {
      if (!photoUrl) return null;

      if (photoUrl.startsWith("blob:") || photoUrl.startsWith("data:")) {
        return photoUrl;
      }

      try {
        const response = await api.get(photoUrl, {
          responseType: "blob",
          validateStatus: (status) => status >= 200 && status < 300,
        });

        const contentType = String(
          response?.headers?.["content-type"] ||
          response?.data?.type ||
          ""
        ).toLowerCase();

        if (response?.data && (!contentType || contentType.startsWith("image/"))) {
          return URL.createObjectURL(response.data);
        }

        console.warn(
          "Persisted photo URL did not return an image through axios:",
          photoUrl,
          contentType
        );
      } catch (error) {
        console.warn(
          "Authenticated photo request failed; trying direct browser image load:",
          photoUrl,
          error
        );
      }

      // Fallback: some static-file configurations allow the browser to load
      // the image directly even when axios cannot fetch it as a blob. Test the
      // real image resource before declaring the saved photo missing.
      return await new Promise((resolve) => {
        const image = new Image();
        let finished = false;

        const finish = (value) => {
          if (finished) return;
          finished = true;
          image.onload = null;
          image.onerror = null;
          resolve(value);
        };

        image.onload = () => finish(photoUrl);
        image.onerror = () => finish(null);
        image.src = photoUrl;
      });
    };

    const getPhotoStatus = (photo) =>
      String(
        photo?.verificationStatus ||
        photo?.status ||
        "PENDING"
      ).toUpperCase();

    try {
      // ==========================================
      // STEP 0 - BASIC INFO
      // ==========================================

      try {
        const response = await api.get(
          `/api/owner/hostels/${savedHostelId}/basic-info`
        );

        const data = response.data;

        if (data) {
          setFormData((prev) => ({
            ...prev,
            hostelName: data.hostelName || "",
            hostelType: data.hostelType || "",
            // Owner name always comes from the registration details.
            // Phone number prefers whatever value was already saved
            // (which the owner may have edited) and falls back to the
            // registration details only when nothing was saved.
            ownerName:
              getRegisteredOwnerName() ||
              data.ownerName ||
              prev.ownerName,
            phoneNumber:
              data.phoneNumber ||
              getRegisteredPhoneNumber() ||
              prev.phoneNumber ||
              "",
            description: data.description || "",
          }));

          completed.push(0);
          restoredVisited.push(0);
        }
      } catch (error) {
        console.log("Basic Info not saved yet.");
      }

      // ==========================================
      // STEP 1 - LOCATION
      // ==========================================

      try {
        const response = await api.get(
          `/api/owner/hostels/${savedHostelId}/location`
        );

        const data = response.data;

        if (data) {
          setFormData((prev) => ({
            ...prev,
            address: data.address || "",
            landmark: data.landmark || "",
            city: data.city || "",
            area: data.area || "",
            state: data.state || "",
            pincode: data.pincode || "",
            latitude:
              data.latitude !== null && data.latitude !== undefined
                ? String(data.latitude)
                : "",
            longitude:
              data.longitude !== null && data.longitude !== undefined
                ? String(data.longitude)
                : "",
          }));

          const restoredLatitude = Number(data.latitude);
          const restoredLongitude = Number(data.longitude);

          if (
            Number.isFinite(restoredLatitude) &&
            restoredLatitude >= -90 &&
            restoredLatitude <= 90 &&
            Number.isFinite(restoredLongitude) &&
            restoredLongitude >= -180 &&
            restoredLongitude <= 180
          ) {
            setPosition({
              lat: restoredLatitude,
              lng: restoredLongitude
            });
            setLocationConfirmed(true);
            setLocationWasAdjusted(false);
            setMapLocationName(
              data.address
                ? `${data.address}, ${data.area || ""}, ${data.city || ""}, ${data.state || ""}`.replace(
                    /,\s*,/g,
                    ","
                  )
                : ""
            );
          }

          completed.push(1);
          restoredVisited.push(1);
        }
      } catch (error) {
        console.log("Location not saved yet.");
      }

      // ==========================================
      // STEP 2 - AMENITIES
      // ==========================================

      try {
        const response = await api.get(
          `/api/owner/hostels/${savedHostelId}/amenities`
        );

        const amenities = Array.isArray(response.data)
          ? response.data
          : [];

        if (amenities.length > 0) {
          const restoredAmenityPhotos = {};
          const requiredAmenityCodes = [];

          // Restore selected amenities first.
          setFormData((prev) => ({
            ...prev,
            selectedAmenities: amenities
              .map((amenity) => amenity.amenityCode)
              .filter(Boolean),
          }));

          // Load persisted photo for each amenity.
          for (const amenity of amenities) {
            const amenityCode = amenity?.amenityCode;
            const amenityId =
              amenity?.amenityId ??
              amenity?.id;

            if (!amenityCode || !amenityId) {
              continue;
            }

            const definition = allAmenityItems.find(
              (item) => item.id === amenityCode
            );

            if (!definition?.photoRequired) {
              continue;
            }

            try {
              const photoResponse = await api.get(
                `/api/owner/hostels/amenities/${amenityId}/photos`
              );

              const photos = Array.isArray(photoResponse.data)
                ? photoResponse.data
                : [];

              let persistedPhoto = null;
              let persistedPhotoUrl = null;

              // Do not trust only the DB photo row. The row can exist while the
              // actual file is missing. Find the first non-rejected image that
              // can really be loaded from backend storage.
              for (const candidate of photos) {
                const candidateUrl = getPersistedPhotoUrl(candidate);

                if (
                  !candidateUrl ||
                  getPhotoStatus(candidate) === "REJECTED"
                ) {
                  continue;
                }

                const loadedPhotoUrl = await loadPersistedPhoto(candidateUrl);

                if (loadedPhotoUrl) {
                  persistedPhoto = candidate;
                  persistedPhotoUrl = loadedPhotoUrl;
                  break;
                }
              }

              if (persistedPhoto && persistedPhotoUrl) {
                restoredAmenityPhotos[amenityCode] = {
                  id: persistedPhoto.id,
                  fileName: persistedPhoto.fileName,
                  fileType: persistedPhoto.fileType,
                  fileSize: persistedPhoto.fileSize,
                  fileUrl: persistedPhotoUrl,
                  verificationStatus:
                    persistedPhoto.verificationStatus ||
                    persistedPhoto.status ||
                    "PENDING",
                  rejectionReason:
                    persistedPhoto.rejectionReason || "",
                  persisted: true,
                  file: null,
                  previewUrl: persistedPhotoUrl,
                  loadFailed: false,
                };
              } else {
                // Keep the database record in the UI even when its image file
                // cannot currently be loaded. Do not turn it into a generic
                // empty "Add Photo" state; the owner must know this exact
                // previously uploaded photo needs replacement.
                const failedPhoto = photos.find(
                  (photo) =>
                    Boolean(getPersistedPhotoUrl(photo)) &&
                    getPhotoStatus(photo) !== "REJECTED"
                );

                if (failedPhoto) {
                  restoredAmenityPhotos[amenityCode] = {
                    id: failedPhoto.id,
                    fileName: failedPhoto.fileName,
                    fileType: failedPhoto.fileType,
                    fileSize: failedPhoto.fileSize,
                    fileUrl: getPersistedPhotoUrl(failedPhoto),
                    verificationStatus:
                      failedPhoto.verificationStatus ||
                      failedPhoto.status ||
                      "PENDING",
                    rejectionReason:
                      failedPhoto.rejectionReason || "",
                    persisted: false,
                    file: null,
                    previewUrl: null,
                    loadFailed: true,
                  };
                }
              }

              requiredAmenityCodes.push(amenityCode);
              if (!persistedPhoto) {
                missingPhotos.amenities.push(
                  definition?.label || amenityCode
                );
              }
            } catch (photoError) {
              console.log(
                `Amenity photo not saved yet: ${amenityCode}`
              );
              requiredAmenityCodes.push(amenityCode);
              missingPhotos.amenities.push(definition?.label || amenityCode);
            }
          }

          setAmenityPhotos(restoredAmenityPhotos);

          const hasAllRequiredAmenityPhotos =
            requiredAmenityCodes.every(
              (amenityCode) =>
                Boolean(restoredAmenityPhotos[amenityCode])
            );

          // Amenity data exists, but step is complete only when
          // every selected photo-required amenity has persisted photo.
          restoredVisited.push(2);

          if (hasAllRequiredAmenityPhotos) {
            completed.push(2);
          } else {
            console.log(
              "Amenities saved, but one or more required amenity photos are missing."
            );
          }
        }
      } catch (error) {
        console.log("Amenities not saved yet.");
      }

      // ==========================================
      // STEP 3 - ROOMS
      // ==========================================

      try {
        const response = await api.get(
          `/api/owner/hostels/${savedHostelId}/rooms`
        );

        const rooms = Array.isArray(response.data)
          ? response.data
          : response.data?.rooms || [];

        console.log('========== RESTORED ROOMS ==========');
        console.log('Hostel ID:', savedHostelId);
        console.log('Rooms response:', response.data);
        console.log('Rooms:', rooms);
        console.log('Room count:', rooms.length);
        console.log('====================================');

        if (rooms.length > 0) {
          const selectedRoomTypes = Array.from(
            new Set(
              rooms
                .map((room) => room.roomType?.toLowerCase())
                .filter(Boolean)
            )
          );

          const roomCoolingTypes = {};
          const roomPricing = {};
          const restoredRoomPhotos = {};

          for (const room of rooms) {
            const roomId = room.roomType?.toLowerCase();
            if (!roomId) continue;

            // Existing records created before AC/Non-AC support are treated as Non-AC.
            const coolingType = String(
              room.coolingType || room.cooling_type || 'NON_AC'
            ).toUpperCase();

            if (!roomCoolingTypes[roomId]) {
              roomCoolingTypes[roomId] = [];
            }

            if (!roomCoolingTypes[roomId].includes(coolingType)) {
              roomCoolingTypes[roomId].push(coolingType);
            }

            const configurationKey = getRoomConfigurationKey(
              roomId,
              coolingType
            );

            roomPricing[configurationKey] = room.rentPerBed ?? '';

            const photos = Array.isArray(room.photos)
              ? room.photos
              : [];

            const availableRoomPhotos = [];

            for (const photo of photos) {
              const photoUrl = getPersistedPhotoUrl(photo);

              if (
                !photoUrl ||
                getPhotoStatus(photo) === 'REJECTED'
              ) {
                continue;
              }

              const loadedPhotoUrl = await loadPersistedPhoto(photoUrl);

              availableRoomPhotos.push({
                id: photo.id,
                fileName: photo.fileName,
                originalFileName: photo.originalFileName,
                fileUrl: photoUrl,
                filePath: photo.filePath,
                verificationStatus:
                  photo.verificationStatus ||
                  photo.status ||
                  'PENDING',
                persisted: Boolean(loadedPhotoUrl),
                file: null,
                previewUrl: loadedPhotoUrl,
                loadFailed: !loadedPhotoUrl,
              });
            }

            restoredRoomPhotos[configurationKey] =
              availableRoomPhotos;
          }

          setFormData((prev) => ({
            ...prev,
            selectedRoomTypes,
            roomCoolingTypes,
            roomPricing: {
              ...prev.roomPricing,
              ...roomPricing,
            },
          }));

          setRoomPhotos((prev) => ({
            ...prev,
            ...restoredRoomPhotos,
          }));

          setSavedRoomTypes(selectedRoomTypes);

          const allRoomConfigurations = [];
          Object.entries(roomCoolingTypes).forEach(
            ([roomId, coolingTypes]) => {
              coolingTypes.forEach((coolingType) => {
                allRoomConfigurations.push(
                  getRoomConfigurationKey(roomId, coolingType)
                );
              });
            }
          );

          const allRoomsComplete =
            allRoomConfigurations.length > 0 &&
            allRoomConfigurations.every((configurationKey) => {
              const rent = Number(roomPricing[configurationKey]);
              const photos = restoredRoomPhotos[configurationKey] || [];

              const hasLoadedPhoto = photos.some(
                (photo) =>
                  Boolean(photo?.previewUrl) &&
                  photo?.loadFailed !== true &&
                  photo?.verificationStatus !== 'REJECTED'
              );

              return (
                Boolean(roomPricing[configurationKey]) &&
                !Number.isNaN(rent) &&
                rent > 0 &&
                hasLoadedPhoto
              );
            });

          restoredVisited.push(3);

          if (allRoomsComplete) {
            completed.push(3);
          } else {
            allRoomConfigurations.forEach((configurationKey) => {
              const photos = restoredRoomPhotos[configurationKey] || [];
              const hasLoadedPhoto = photos.some(
                (photo) =>
                  Boolean(photo?.previewUrl) &&
                  photo?.loadFailed !== true &&
                  photo?.verificationStatus !== 'REJECTED'
              );

              if (!hasLoadedPhoto) {
                const [roomId] = configurationKey.split('__');
                const roomDefinition = roomTypes.find(
                  (room) => room.id === roomId
                );
                missingPhotos.rooms.push(
                  roomDefinition?.title || roomId
                );
              }
            });

            console.log(
              'Rooms saved, but one or more room photos are missing.'
            );
          }

          console.log('========== STEP 4 RESTORED ==========');
          console.log('Selected rooms restored:', selectedRoomTypes);
          console.log('Room cooling types restored:', roomCoolingTypes);
          console.log('Room pricing restored:', roomPricing);
          console.log('Room photos restored:', restoredRoomPhotos);
          console.log('====================================');
        } else {
          console.log('No rooms found in database.');
        }
      } catch (error) {
        console.error('========== LOAD ROOMS ERROR ==========', error);
        console.error('Error:', error);
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);
        console.error('URL:', error.config?.url);
        console.error('=======================================');
        console.log('Rooms not saved yet.');
      }

      // STEP 4 - RULES
      // ==========================================

      try {
        const response = await api.get(
          `/api/owner/hostels/${savedHostelId}/rules`
        );

        const data = response.data;

        if (data) {
          setFormData((prev) => ({
            ...prev,
            generalRules: {
              noSmoking: !!data.noSmoking,
              noAlcohol: !!data.noAlcohol,
              noPets: !!data.noPets,
              visitorsAllowed: !!data.visitorsAllowed,
              curfew10pm: !!data.curfewEnabled,
            },
            customRules: data.additionalRules || "",
          }));

          completed.push(4);
          restoredVisited.push(4);
        }
      } catch (error) {
        console.log("Rules not saved yet.");
      }

      // ==========================================
      // STEP 5 - DEPOSIT POLICY
      // ==========================================

      try {
        const response = await api.get(
          `/api/owner/hostels/${savedHostelId}/deposit-policy`
        );

        const data = response.data;

        if (data) {
          setFormData((prev) => ({
            ...prev,
            cancellationPolicy:
              data.refundPolicy || "",
          }));

          completed.push(5);
          restoredVisited.push(5);
        }
      } catch (error) {
        console.log("Deposit policy not saved yet.");
      }

      // ==========================================
      // STEP 6 - HOSTEL PHOTOS
      // ==========================================

      try {
        const response = await api.get(
          `/api/owner/hostels/${savedHostelId}/photos`
        );

        const photos = Array.isArray(response.data)
          ? response.data
          : [];

        // Preserve every database photo record. A record must never silently
        // disappear from the UI just because its physical image cannot be loaded.
        // The owner must be able to see exactly which previously uploaded photo
        // needs to be replaced.
        const coverRecords = photos
          .filter(
            (photo) =>
              String(photo.photoType || "").toUpperCase() === "COVER"
          )
          .filter((photo) => getPhotoStatus(photo) !== "REJECTED");

        const additionalRecords = photos
          .filter(
            (photo) =>
              String(photo.photoType || "").toUpperCase() === "ADDITIONAL"
          )
          .filter((photo) => getPhotoStatus(photo) !== "REJECTED")
          .sort(
            (a, b) =>
              (a.displayOrder ?? 0) -
              (b.displayOrder ?? 0)
          )
          .slice(0, 4);

        const resolvePhotoRecord = async (photo) => {
          const photoUrl = getPersistedPhotoUrl(photo);

          if (!photoUrl) {
            return {
              ...photo,
              _resolvedPhotoUrl: null,
              _originalPhotoUrl: null,
              _loadFailed: true,
            };
          }

          const loadedPhotoUrl = await loadPersistedPhoto(photoUrl);

          return {
            ...photo,
            _resolvedPhotoUrl: loadedPhotoUrl,
            _originalPhotoUrl: photoUrl,
            _loadFailed: !loadedPhotoUrl,
          };
        };

        const resolvedCoverRecords = await Promise.all(
          coverRecords.map(resolvePhotoRecord)
        );

        const resolvedAdditionalRecords = await Promise.all(
          additionalRecords.map(resolvePhotoRecord)
        );

        const coverPhoto = resolvedCoverRecords[0] || null;

        if (coverPhoto) {
          if (coverPhoto._loadFailed) {
            missingPhotos.hostelPhotos.push("Main cover photo");
          }

          setFormData((prev) => ({
            ...prev,
            coverImage: {
              id: coverPhoto.id,
              fileName: coverPhoto.fileName,
              fileUrl: coverPhoto._originalPhotoUrl,
              verificationStatus:
                coverPhoto.verificationStatus ||
                coverPhoto.status ||
                "PENDING",
              persisted: !coverPhoto._loadFailed,
              file: null,
              previewUrl: coverPhoto._resolvedPhotoUrl,
              loadFailed: coverPhoto._loadFailed,
            },
          }));
        } else {
          missingPhotos.hostelPhotos.push("Main cover photo");
        }

        // IMPORTANT: keep failed additional photos selected.
        // If Photo 1/2/3 were previously saved but their files are gone,
        // the owner sees those exact slots as "Re-upload required" instead
        // of seeing generic empty Photo 1/2/3 placeholders.
        setFormData((prev) => ({
          ...prev,
          additionalPhotos: Array.from(
            { length: 4 },
            (_, index) => {
              const photo = resolvedAdditionalRecords[index];

              if (!photo) {
                return {
                  slotIndex: index,
                  selected: false,
                  file: null,
                  previewUrl: null,
                };
              }

              if (photo._loadFailed) {
                missingPhotos.hostelPhotos.push(`Photo ${index + 1}`);
              }

              return {
                slotIndex: index,
                selected: true,
                id: photo.id,
                fileName: photo.fileName,
                fileUrl: photo._originalPhotoUrl,
                verificationStatus:
                  photo.verificationStatus ||
                  photo.status ||
                  "PENDING",
                persisted: !photo._loadFailed,
                file: null,
                previewUrl: photo._resolvedPhotoUrl,
                loadFailed: photo._loadFailed,
              };
            }
          ),
        }));

        restoredVisited.push(6);

        // Cover is mandatory. Previously saved additional photos are also kept
        // as selected slots; if any of those physical files are unavailable,
        // the step stays incomplete until the owner replaces them.
        if (
          coverPhoto &&
          !coverPhoto._loadFailed &&
          resolvedAdditionalRecords.every((photo) => !photo._loadFailed)
        ) {
          completed.push(6);
        }

        if (missingPhotos.hostelPhotos.length > 0) {
          console.log(
            "Previously uploaded hostel photos that need re-upload:",
            missingPhotos.hostelPhotos
          );
        }
      } catch (error) {
        console.log("Hostel photos not saved yet.");
      }

      // ==========================================
      // UPDATE FRONTEND WIZARD STATE
      // ==========================================

      setCompletedSteps(completed);
      setVisitedSteps(
        [...new Set(restoredVisited)]
      );
      setMissingPhotoMessages(missingPhotos);

      // ==========================================
      // DETERMINE WHETHER SAVED PROGRESS EXISTS
      // ==========================================

      if (completed.length > 0 || restoredVisited.length > 1) {
        setHasSavedProgress(true);
        setShowResumePopup(true);
      }

    } catch (error) {
      console.error(
        "Failed to restore saved hostel progress:",
        error
      );
    }
  };


  // ============================================================
  // SESSION RESTORE STATE
  // ============================================================
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [restoreData, setRestoreData] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleStepClick = (idx) => {
    setVisitedSteps((prev) =>
      prev.includes(currentStep)
        ? prev
        : [...prev, currentStep]
    );

    setVisitedSteps((prev) =>
      prev.includes(idx)
        ? prev
        : [...prev, idx]
    );

    setCurrentStep(idx);
  };

  const navigate = useNavigate();

  const locationTimerRef = useRef(null);

  const [hostelId, setHostelId] = useState(null);

  const [amenityPhotos, setAmenityPhotos] = useState({});
  const [photoModalAmenity, setPhotoModalAmenity] = useState(null);
  const [photoInputKey, setPhotoInputKey] = useState(0);

  const photoUploadInputRef = useRef(null);
  
  const [cameraOpen, setCameraOpen] = useState(false);
  const cameraVideoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const coverCameraInputRef = useRef(null);
  const additionalCameraInputRef = useRef(null);
  const [propertyPhotoTarget, setPropertyPhotoTarget] = useState(null);
  const [additionalPhotoTargetSlot, setAdditionalPhotoTargetSlot] = useState(null);
  const [statusCheckFailed, setStatusCheckFailed] = useState(false);

  // =====================================================
  // ROOM PHOTO STATE
  // =====================================================

  const [roomPhotos, setRoomPhotos] = useState({});
  const [savedRoomTypes, setSavedRoomTypes] = useState([]);
  const [roomPhotoModal, setRoomPhotoModal] = useState(null);
  const [roomPhotoReplaceIndex, setRoomPhotoReplaceIndex] = useState(null);
  const [roomCameraOpen, setRoomCameraOpen] = useState(false);

  const roomPhotoInputRef = useRef(null);
  const roomCameraVideoRef = useRef(null);
  const roomCameraStreamRef = useRef(null);

  const [roomPhotoInputKey, setRoomPhotoInputKey] = useState(0);

  // =====================================================
  // COVER & ADDITIONAL PHOTOS STATE & DECLARATION
  // =====================================================
  const coverImageInputRef = useRef(null);
  const additionalPhotosInputRef = useRef(null);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  const [position, setPosition] = useState({
    lat: 17.385044,
    lng: 78.486671
  });

  // Hostel location verification state.
  // The coordinates come from the hostel address, then the owner
  // confirms or adjusts the marker on the map.
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [locationFinding, setLocationFinding] = useState(false);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);
  const [mapLocationName, setMapLocationName] = useState("");
  const [mapAddressPreview, setMapAddressPreview] = useState("");
  const [locationWasAdjusted, setLocationWasAdjusted] = useState(false);

  const [hostelRules, setHostelRules] = useState({
    noSmoking: false,
    noAlcohol: false,
    noPets: false,
    visitorsAllowed: false,
    curfewEnabled: false,
    additionalRules: ""
  });

  // Combined Form State - MUST BE DECLARED BEFORE ANY useEffect THAT USES IT
  const [formData, setFormData] = useState({
    // Step 0: Basic Info
    hostelName: "",
    hostelType: "",
    ownerName: "",
    phoneNumber: "",
    description: "",

    // Step 1: Location
    state: "", 
    city: "", 
    area: "", 
    address: "", 
    landmark: "", 
    pincode: "", 
    latitude: "", 
    longitude: "",

    // Step 2: Amenities
    selectedAmenities: [],

    // Step 3: Rooms (Room Details)
    selectedRoomTypes: [],
    // Each sharing type can independently have AC, Non-AC, or both.
    roomCoolingTypes: {},
    // Pricing is stored by configuration key: roomId__AC / roomId__NON_AC
    roomPricing: {
      single: '',
      double: '',
      triple: '',
      quad: '',
      five: '',
    },

    // Step 4: Rules & Policy
    generalRules: {
      noSmoking: false,
      noAlcohol: false,
      noPets: false,
      visitorsAllowed: false,
      curfew10pm: false,
    },
    customRules: '',

    // Step 5: Deposit
    cancellationPolicy: '',

    // Step 6: Photos
    coverImage: null,
    additionalPhotos: Array.from({ length: 4 }, (_, index) => ({
      slotIndex: index,
      selected: false,
      file: null,
      previewUrl: null,
    })),
  });

  // =====================================================
  // LOAD LOGGED-IN OWNER NAME + PHONE NUMBER FROM REGISTRATION
  // - MUST BE AFTER formData DECLARATION
  // - Owner name is auto-filled from registration.
  // - Phone number is prefilled from registration when available,
  //   but the owner can freely edit it in the form.
  // =====================================================
  useEffect(() => {
    let mounted = true;

    const loadRegisteredOwnerDetails = async () => {
      try {
        let userData = getRegisteredUserData();

        // Always resolve the phone number through the registration helper
        // first. It searches the user object, all nested objects inside it,
        // and every localStorage key with a phone-looking name.
        let resolvedPhone = getRegisteredPhoneNumber();

        if (!resolvedPhone) {
          // Fallback: fetch the owner profile from the backend.
          // Some registration flows only store the phone on the server.
          const profileEndpoints = [
            "/api/owner/profile",
            "/api/owner/me",
            "/api/auth/me",
            "/api/owner/dashboard",
          ];

          for (const endpoint of profileEndpoints) {
            try {
              const response = await api.get(endpoint);
              const data = response?.data;

              const candidateUsers = [
                data,
                data?.owner,
                data?.user,
                data?.data,
                data?.data?.owner,
                data?.data?.user,
                data?.profile,
                data?.data?.profile,
              ].filter(Boolean);

              for (const candidate of candidateUsers) {
                if (!candidate || typeof candidate !== "object") continue;

                // Merge useful fields into userData so the alias search below
                // and subsequent renders use them.
                userData = {
                  ...(userData || {}),
                  ...candidate,
                };

                const candidatePhone =
                  findPhoneValueInObject(candidate);

                if (candidatePhone) {
                  resolvedPhone = candidatePhone;

                  console.log(
                    `Phone resolved from backend endpoint ${endpoint}:`,
                    resolvedPhone
                  );

                  break;
                }
              }

              if (resolvedPhone) break;
            } catch (endpointError) {
              // Endpoint may not exist in this backend; try the next one.
              console.log(
                `Profile endpoint ${endpoint} not available:`,
                endpointError?.response?.status ||
                  endpointError?.message
              );
            }
          }
        }

        if (!mounted) return;

        const registeredName =
          (userData &&
            (userData.name ||
              userData.fullName ||
              userData.ownerName ||
              userData.username)) ||
          getRegisteredOwnerName();

        console.log("========== REGISTERED OWNER DETAILS ==========");
        console.log("Resolved owner data:", userData);
        console.log("Owner Name:", registeredName);
        console.log("Resolved Phone:", resolvedPhone);
        console.log(
          "All localStorage keys:",
          Object.keys(localStorage)
        );
        console.log("===============================================");

        setFormData((prev) => ({
          ...prev,
          ownerName: registeredName || prev.ownerName,
          // Prefill the phone number only when the field is still empty,
          // so an owner-edited value is never overwritten.
          phoneNumber: prev.phoneNumber || resolvedPhone || "",
        }));
      } catch (error) {
        console.error(
          "Failed to load logged-in owner information:",
          error
        );
      }
    };

    loadRegisteredOwnerDetails();

    return () => {
      mounted = false;
    };
  }, []);

  const handleDeclarationChange = (e) => {
    const checked = e.target.checked;

    if (!checked) {
      setDeclarationAccepted(false);
      return;
    }

    // Steps 0 to 6 must be successfully saved
    const unsavedSteps = [0, 1, 2, 3, 4, 5, 6].filter(
      (stepIndex) => !completedSteps.includes(stepIndex)
    );

    if (unsavedSteps.length > 0) {
      toast.error(
        "Please fill required information and click the Next Step button to save the steps."
      );
      setDeclarationAccepted(false);
      return;
    }

    setDeclarationAccepted(true);
  };

  // =====================================================
// 🔥 FIXED: CHECK HOSTEL APPROVAL STATUS
// =====================================================
useEffect(() => {
  const checkApprovalStatus = async () => {
    try {
      console.log("========== CHECKING APPROVAL STATUS ==========");

      const response = await api.get("/api/owner/hostels/status");
      console.log("Approval Status Response:", response.data);

      const data = response.data;
      const hasOwnerHostel = data?.hasHostel === true;
      const status = data?.status || null;
      const backendHostelId = data?.hostelId || null;
      const emailVerificationStatus = data?.emailVerificationStatus || null;

      console.log("Has Hostel:", hasOwnerHostel);
      console.log("Current Approval Status:", status);
      console.log("Backend Hostel ID:", backendHostelId);
      console.log("Email Verification Status:", emailVerificationStatus);

      setHasHostel(hasOwnerHostel);
      setApprovalStatus(status);

      // ============================================================
      // 🔥 CRITICAL FIX: REJECTED must become a NEW blank application
      // ============================================================
      //
      // When the owner's previous hostel was REJECTED:
      //
      //   1. Do NOT treat it as "fully submitted"
      //   2. Do NOT restore the old rejected hostel data
      //   3. Do NOT keep the old hostelId
      //   4. Show a completely blank Add Hostel form
      //
      // The backend has already (or will) remove the rejected
      // hostel data. The owner account stays intact.
      // ============================================================

      if (status === "REJECTED") {
        console.log(
          "Hostel was REJECTED. Starting a NEW blank application."
        );

        // Clear the old rejected hostel ID so the form creates
        // a brand-new hostel record.
        localStorage.removeItem("hostelId");
        sessionStorage.removeItem(SESSION_STORAGE_KEY);

        // Treat as a fresh draft.
        setHostelId(null);
        setHasHostel(false);
        setIsDraft(true);
        setIsFullySubmitted(false);

        // Do NOT restore old progress.
        // Do NOT show the resume dialog.

        return;
      }

      if (backendHostelId) {
        setHostelId(backendHostelId);
        localStorage.setItem("hostelId", String(backendHostelId));

        // ============================================================
        // Determine the correct page to show
        // ============================================================

        // Case 1: Hostel is fully submitted and pending approval
        if (status === "OWNER_VERIFICATION_PENDING" || status === "PENDING") {
          setIsFullySubmitted(true);
          setIsDraft(false);
        }
        // Case 2: Hostel is approved
        else if (status === "APPROVED" || status === "VERIFIED") {
          setIsFullySubmitted(true);
          setIsDraft(false);
        }
        // Case 3: Hostel is SUSPENDED
        else if (status === "SUSPENDED") {
          setIsFullySubmitted(true);
          setIsDraft(false);
        }
        // Case 4: Hostel is DRAFT or incomplete - allow editing
        else {
          setIsDraft(true);
          setIsFullySubmitted(false);
          // Restore saved progress for draft
          await restoreSavedHostelProgress(backendHostelId);
        }
      } else {
        // No hostel exists - this is a new submission
        setIsDraft(false);
        setIsFullySubmitted(false);

        // Check for saved progress in sessionStorage
        const saved = loadProgress();
        if (saved && saved.formData) {
          setRestoreData(saved);
          setShowRestoreDialog(true);
        }
      }

    } catch (error) {
      console.error("Failed to check approval status:", error);
      setApprovalCheckError(true);
    } finally {
      setIsCheckingApprovalStatus(false);
      setCheckingApproval(false);
    }
  };

  checkApprovalStatus();
}, []);

  // ============================================================
  // RESTORE SAVED PROGRESS ON MOUNT
  // ============================================================
  useEffect(() => {
    // Only check for saved progress if not already in a pending state
    if (!hasHostel && !approvalStatus && !isFullySubmitted) {
      const saved = loadProgress();
      if (saved && saved.formData) {
        setRestoreData(saved);
        setShowRestoreDialog(true);
      }
    }
  }, [hasHostel, approvalStatus, isFullySubmitted]);

  // ============================================================
  // AUTO-SAVE PROGRESS ON FORM DATA CHANGE
  // ============================================================
  useEffect(() => {
    // Don't save if we're in a pending approval state or fully submitted
    if (approvalStatus === "PENDING" || isFullySubmitted) return;
    
    // Save progress whenever form data changes (debounced)
    const timer = setTimeout(() => {
      const progressData = {
        formData,
        roomPhotos,
        amenityPhotos,
        currentStep,
        completedSteps,
        visitedSteps,
        declarationAccepted,
        hostelId: hostelId || null
      };
      saveProgress(progressData);
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, roomPhotos, amenityPhotos, currentStep, completedSteps, visitedSteps, declarationAccepted, hostelId, hasHostel, approvalStatus, isFullySubmitted]);

  // ============================================================
  // RESTORE DIALOG HANDLERS
  // ============================================================
  const handleRestoreProgress = () => {
    if (!restoreData) return;
    
    setIsRestoring(true);
    
    // Restore all state from saved data
    if (restoreData.formData) {
      const restoredFormData = {
        ...restoreData.formData,
        roomCoolingTypes: {
          ...(restoreData.formData.roomCoolingTypes || {}),
        },
        roomPricing: {
          ...(restoreData.formData.roomPricing || {}),
        },
      };

      // Owner name is always taken from registration details.
      // Phone number keeps the owner-edited value from the saved draft and
      // only falls back to the registration details when nothing was saved.
      const registeredName = getRegisteredOwnerName();
      const registeredPhone = getRegisteredPhoneNumber();

      if (registeredName) {
        restoredFormData.ownerName = registeredName;
      }

      if (!restoredFormData.phoneNumber && registeredPhone) {
        restoredFormData.phoneNumber = registeredPhone;
      }

      // Migrate older saved progress that did not contain AC/Non-AC.
      (restoredFormData.selectedRoomTypes || []).forEach((roomId) => {
        if (
          !Array.isArray(restoredFormData.roomCoolingTypes[roomId]) ||
          restoredFormData.roomCoolingTypes[roomId].length === 0
        ) {
          restoredFormData.roomCoolingTypes[roomId] = ['NON_AC'];
        }

        const legacyPrice = restoredFormData.roomPricing[roomId];
        const migratedKey = getRoomConfigurationKey(roomId, 'NON_AC');

        if (
          restoredFormData.roomPricing[migratedKey] === undefined &&
          legacyPrice !== undefined
        ) {
          restoredFormData.roomPricing[migratedKey] = legacyPrice;
        }
      });

      setFormData(restoredFormData);

      // Migrate old room photo keys to the Non-AC configuration key.
      if (restoreData.roomPhotos) {
        const migratedRoomPhotos = {
          ...restoreData.roomPhotos,
        };

        (restoredFormData.selectedRoomTypes || []).forEach((roomId) => {
          const migratedKey = getRoomConfigurationKey(roomId, 'NON_AC');

          if (
            migratedRoomPhotos[migratedKey] === undefined &&
            migratedRoomPhotos[roomId] !== undefined
          ) {
            migratedRoomPhotos[migratedKey] = migratedRoomPhotos[roomId];
          }
        });

        setRoomPhotos(migratedRoomPhotos);
      }

      const restoredLatitude = Number(restoredFormData.latitude);
      const restoredLongitude = Number(restoreData.formData.longitude);

      if (
        Number.isFinite(restoredLatitude) &&
        restoredLatitude >= -90 &&
        restoredLatitude <= 90 &&
        Number.isFinite(restoredLongitude) &&
        restoredLongitude >= -180 &&
        restoredLongitude <= 180
      ) {
        setPosition({
          lat: restoredLatitude,
          lng: restoredLongitude
        });
        setLocationConfirmed(true);
        setLocationWasAdjusted(false);
      }
    }
    if (restoreData.roomPhotos && !restoreData.formData) {
      setRoomPhotos(restoreData.roomPhotos);
    }
    if (restoreData.amenityPhotos) {
      setAmenityPhotos(restoreData.amenityPhotos);
    }
    if (restoreData.currentStep !== undefined) {
      setCurrentStep(restoreData.currentStep);
    }
    if (restoreData.completedSteps) {
      setCompletedSteps(restoreData.completedSteps);
    }
    if (restoreData.visitedSteps) {
      setVisitedSteps(restoreData.visitedSteps);
    }
    if (restoreData.declarationAccepted !== undefined) {
      setDeclarationAccepted(restoreData.declarationAccepted);
    }
    if (restoreData.hostelId) {
      setHostelId(restoreData.hostelId);
      localStorage.setItem("hostelId", String(restoreData.hostelId));
    }
    
    setShowRestoreDialog(false);
    setIsRestoring(false);
    toast.success("Previous progress restored successfully!");
  };

  const handleStartFresh = () => {
    clearProgress();
    setShowRestoreDialog(false);
    toast.success("Starting fresh! All previous data cleared.");
  };

  const openPropertyPhotoCamera = (type, slotIndex = null) => {
    if (type === "additional") {
      if (slotIndex === null || slotIndex === undefined) {
        toast.error("Please select a photo slot first.");
        return;
      }

      const slot = formData.additionalPhotos?.[slotIndex];

      if (!slot?.selected) {
        toast.error(`Please select Photo ${slotIndex + 1} first.`);
        return;
      }
    }

    setPropertyPhotoTarget({
      type,
      slotIndex,
    });

    setCameraOpen(true);
  };

  const closePropertyCamera = () => {
    stopCamera();
    setCameraOpen(false);
    setPropertyPhotoTarget(null);
    setAdditionalPhotoTargetSlot(null);
  };

  const steps = [
    { label: 'Basic Info', icon: Info },
    { label: 'Location', icon: MapPin },
    { label: 'Amenities', icon: Wifi },
    { label: 'Rooms', icon: Bed },
    { label: 'Rules', icon: Gavel },
    { label: 'Deposits', icon: Banknote },
    { label: 'Photos', icon: ImageIcon },
    { label: 'Preview & Submit', icon: CheckCircle },
  ];

  const hostelTypes = ["Men's", "Women's", "Co-Living"];

  const handleCoverCameraChange = (e) => {
    handleCoverImageChange(e);
  };

  const handleAdditionalCameraChange = (e) => {
    handleAdditionalPhotosChange(e);
  };

  const removeCoverImage = () => {
    if (formData.coverImage?.previewUrl) {
      URL.revokeObjectURL(formData.coverImage.previewUrl);
    }

    setFormData((prev) => ({
      ...prev,
      coverImage: null,
    }));

    if (coverImageInputRef.current) {
      coverImageInputRef.current.value = "";
    }

    if (coverCameraInputRef.current) {
      coverCameraInputRef.current.value = "";
    }
  };

  // If an image element fails after restore, immediately turn that slot into
  // an explicit re-upload state. Never leave a broken image icon for the owner.
  const markMissingPhotoMessage = (type, label) => {
    setMissingPhotoMessages((prev) => ({
      ...prev,
      [type]: prev[type].includes(label)
        ? prev[type]
        : [...prev[type], label],
    }));
  };

  const markMissingHostelPhoto = (label) => {
    setMissingPhotoMessages((prev) => ({
      ...prev,
      hostelPhotos: prev.hostelPhotos.includes(label)
        ? prev.hostelPhotos
        : [...prev.hostelPhotos, label],
    }));
  };

  const clearMissingHostelPhoto = (label) => {
    setMissingPhotoMessages((prev) => ({
      ...prev,
      hostelPhotos: prev.hostelPhotos.filter((item) => item !== label),
    }));
  };

  const handlePersistedAmenityImageError = (amenityId, label) => {
    markMissingPhotoMessage('amenities', label);

    setAmenityPhotos((prev) => ({
      ...prev,
      [amenityId]: {
        ...(prev[amenityId] || {}),
        persisted: false,
        previewUrl: null,
        file: null,
        loadFailed: true,
      },
    }));

    setCompletedSteps((prev) => prev.filter((step) => step !== 2));
  };

  const handlePersistedRoomImageError = (roomId, photoIndex, roomTitle) => {
    markMissingPhotoMessage('rooms', roomTitle);

    setRoomPhotos((prev) => {
      const photos = [...(prev[roomId] || [])];

      if (photos[photoIndex]) {
        photos[photoIndex] = {
          ...photos[photoIndex],
          persisted: false,
          previewUrl: null,
          file: null,
          loadFailed: true,
        };
      }

      return { ...prev, [roomId]: photos };
    });

    setCompletedSteps((prev) => prev.filter((step) => step !== 3));
  };

  const handlePersistedCoverImageError = () => {
    markMissingHostelPhoto("Main cover photo");

    setFormData((prev) => ({
      ...prev,
      coverImage: {
        ...(prev.coverImage || {}),
        persisted: false,
        previewUrl: null,
        file: null,
        loadFailed: true,
      },
    }));

    setCompletedSteps((prev) => prev.filter((step) => step !== 6));
  };

  const handlePersistedAdditionalPhotoError = (slotIndex) => {
    const label = `Photo ${slotIndex + 1}`;
    markMissingHostelPhoto(label);

    setFormData((prev) => {
      const slots = Array.isArray(prev.additionalPhotos)
        ? [...prev.additionalPhotos]
        : [];

      slots[slotIndex] = {
        ...(slots[slotIndex] || {}),
        slotIndex,
        selected: true,
        persisted: false,
        previewUrl: null,
        file: null,
        loadFailed: true,
      };

      return { ...prev, additionalPhotos: slots };
    });

    setCompletedSteps((prev) => prev.filter((step) => step !== 6));
  };

  // ============================================================
  // HOSTEL LOCATION: ADDRESS -> GEOCODING -> MAP CONFIRMATION
  // ============================================================
  const handleGetCoordinates = async () => {
    console.log("Find Hostel Location button clicked");

    if (!formData.state?.trim()) {
      toast.error("Please select the hostel state.");
      return;
    }

    if (!formData.city?.trim()) {
      toast.error("Please enter the hostel city.");
      return;
    }

    if (!formData.area?.trim()) {
      toast.error("Please enter the hostel area/locality.");
      return;
    }

    if (!formData.address?.trim()) {
      toast.error("Please enter the hostel street address.");
      return;
    }

    if (!formData.pincode?.trim()) {
      toast.error("Please enter the hostel pincode.");
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      toast.error("Please enter a valid 6-digit pincode.");
      return;
    }

    const hostelAddress = [
      formData.address.trim(),
      formData.area.trim(),
      formData.city.trim(),
      formData.state.trim(),
      formData.pincode.trim(),
      "India"
    ]
      .filter(Boolean)
      .join(", ");

    console.log("========== HOSTEL GEOCODING ==========");
    console.log("Address being geocoded:", hostelAddress);
    console.log("======================================");

    setLocationFinding(true);
    setLocationConfirmed(false);
    setLocationWasAdjusted(false);
    setMapAddressPreview("");
    setMapLocationName("");

    toast.loading("Finding hostel location...", {
      id: "location-loading"
    });

    try {
      // Try the complete address first. If that exact address is not
      // indexed, progressively fall back to locality/city/pincode.
      const searchQueries = [
        hostelAddress,
        [
          formData.area.trim(),
          formData.city.trim(),
          formData.state.trim(),
          formData.pincode.trim(),
          "India"
        ]
          .filter(Boolean)
          .join(", "),
        [
          formData.city.trim(),
          formData.state.trim(),
          formData.pincode.trim(),
          "India"
        ]
          .filter(Boolean)
          .join(", "),
        [
          formData.pincode.trim(),
          formData.city.trim(),
          formData.state.trim(),
          "India"
        ]
          .filter(Boolean)
          .join(", ")
      ];

      let results = [];

      for (const query of searchQueries) {
        console.log("Trying geocoding query:", query);

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=in&addressdetails=1&q=${encodeURIComponent(
            query
          )}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json"
            }
          }
        );

        if (!response.ok) {
          throw new Error(
            `Geocoding service returned HTTP ${response.status}`
          );
        }

        const queryResults = await response.json();

        if (Array.isArray(queryResults) && queryResults.length > 0) {
          results = queryResults;
          break;
        }
      }

      console.log("========== GEOCODING RESPONSE ==========");
      console.log("Search address:", hostelAddress);
      console.log("Results:", results);
      console.log("========================================");

      if (!Array.isArray(results) || results.length === 0) {
        toast.error(
          "Hostel address could not be located. Please check the address, area, city and pincode and try again.",
          {
            id: "location-loading"
          }
        );
        return;
      }

      const normalizedCity = formData.city.trim().toLowerCase();
      const normalizedState = formData.state.trim().toLowerCase();
      const normalizedPincode = formData.pincode.trim();

      // Prefer a result matching the owner's entered city/state/pincode.
      const bestResult =
        results.find((item) => {
          const address = item?.address || {};

          const resultCity = String(
            address.city ||
              address.town ||
              address.municipality ||
              address.village ||
              ""
          ).toLowerCase();

          const resultState = String(
            address.state || ""
          ).toLowerCase();

          const resultPostcode = String(
            address.postcode || ""
          ).replace(/\s/g, "");

          const cityMatches =
            !resultCity ||
            resultCity.includes(normalizedCity) ||
            normalizedCity.includes(resultCity);

          const stateMatches =
            !resultState ||
            resultState.includes(normalizedState) ||
            normalizedState.includes(resultState);

          const postcodeMatches =
            !resultPostcode ||
            resultPostcode === normalizedPincode;

          return cityMatches && stateMatches && postcodeMatches;
        }) || results[0];

      const latitude = Number(bestResult.lat);
      const longitude = Number(bestResult.lon);

      if (
        Number.isNaN(latitude) ||
        latitude < -90 ||
        latitude > 90
      ) {
        throw new Error("Invalid latitude returned by geocoding service.");
      }

      if (
        Number.isNaN(longitude) ||
        longitude < -180 ||
        longitude > 180
      ) {
        throw new Error("Invalid longitude returned by geocoding service.");
      }

      const newPosition = {
        lat: latitude,
        lng: longitude
      };

      setPosition(newPosition);

      setFormData((prev) => ({
        ...prev,
        latitude: latitude.toFixed(7),
        longitude: longitude.toFixed(7)
      }));

      setMapLocationName(bestResult.display_name || hostelAddress);
      setMapAddressPreview(bestResult.display_name || hostelAddress);
      setLocationConfirmed(false);
      setLocationWasAdjusted(false);

      console.log("========== HOSTEL LOCATION FOUND ==========");
      console.log("Hostel address:", hostelAddress);
      console.log("Latitude:", latitude.toFixed(7));
      console.log("Longitude:", longitude.toFixed(7));
      console.log("Display name:", bestResult.display_name);
      console.log("==========================================");

      toast.success(
        "Hostel location found. Please verify the marker on the map.",
        {
          id: "location-loading"
        }
      );
    } catch (error) {
      console.error(
        "========== HOSTEL GEOCODING ERROR =========="
      );
      console.error("Error:", error);
      console.error("Address:", hostelAddress);
      console.error(
        "============================================"
      );

      toast.error(
        "Unable to find the hostel location. Please check the entered address and try again.",
        {
          id: "location-loading"
        }
      );
    } finally {
      setLocationFinding(false);
    }
  };

  // Reverse-geocode a marker position after the owner drags it or
  // clicks another point on the map. The returned address is shown
  // for verification and does not silently overwrite the owner's
  // original hostel address.
  const reverseGeocodePosition = async (newPosition) => {
    setPosition(newPosition);

    setFormData((prev) => ({
      ...prev,
      latitude: newPosition.lat.toFixed(7),
      longitude: newPosition.lng.toFixed(7)
    }));

    setLocationConfirmed(false);
    setLocationWasAdjusted(true);
    setReverseGeocoding(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
          newPosition.lat
        )}&lon=${encodeURIComponent(
          newPosition.lng
        )}&zoom=18&addressdetails=1`,
        {
          method: "GET",
          headers: {
            Accept: "application/json"
          }
        }
      );

      if (!response.ok) {
        throw new Error(
          `Reverse geocoding service returned HTTP ${response.status}`
        );
      }

      const result = await response.json();
      const displayName = result?.display_name || "";

      setMapAddressPreview(displayName);

      console.log("========== REVERSE GEOCODING ==========");
      console.log("Latitude:", newPosition.lat);
      console.log("Longitude:", newPosition.lng);
      console.log("Address:", displayName);
      console.log("=======================================");
    } catch (error) {
      console.warn("Reverse geocoding failed:", error);
      setMapAddressPreview(
        "Address preview could not be loaded. Please verify the marker manually."
      );
    } finally {
      setReverseGeocoding(false);
    }
  };

  const handleConfirmLocation = () => {
    const latitude = Number(formData.latitude);
    const longitude = Number(formData.longitude);

    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      toast.error("Please find the hostel location on the map first.");
      return;
    }

    setLocationConfirmed(true);
    setLocationWasAdjusted(false);

    toast.success("Hostel location confirmed successfully.");
  };


  const amenityCategories = [
    {
      title: 'Internet',
      icon: Wifi,
      items: [
        { id: 'wifi', label: 'High-Speed WiFi', Icon: Wifi, photoRequired: false },
        { id: 'lan', label: 'LAN', Icon: Network, photoRequired: false },
      ],
    },
    {
      title: 'Room',
      icon: Bed,
      items: [
        { id: 'ac', label: 'AC', Icon: Wind, photoRequired: true },
        { id: 'fan', label: 'Fan', Icon: Fan, photoRequired: true },
        { id: 'bathroom', label: 'Attached Bathroom', Icon: Bath, photoRequired: true },
        { id: 'geyser', label: 'Geyser', Icon: Flame, photoRequired: true },
        { id: 'table', label: 'Study Table', Icon: BookOpen, photoRequired: true },
        { id: 'wardrobe', label: 'Wardrobe', Icon: Shirt, photoRequired: true },
        { id: 'balcony', label: 'Balcony', Icon: Building, photoRequired: true },
      ],
    },
    {
      title: 'Building',
      icon: Building,
      items: [
        { id: 'lift', label: 'Lift', Icon: Building, photoRequired: false },
        { id: 'cctv', label: 'CCTV', Icon: Video, photoRequired: true },
        { id: 'guard', label: 'Security Guard', Icon: ShieldCheck, photoRequired: false },
        { id: 'firesafety', label: 'Fire Safety', Icon: ShieldCheck, photoRequired: true },
        { id: 'powerbackup', label: 'Power Backup', Icon: Zap, photoRequired: true },
        { id: 'parking', label: 'Parking', Icon: ParkingSquare, photoRequired: true },
      ],
    },
    {
      title: 'Services',
      icon: Sparkles,
      items: [
        { id: 'housekeeping', label: 'Housekeeping', Icon: Sparkles, photoRequired: false },
        { id: 'laundry', label: 'Laundry', Icon: Shirt, photoRequired: false },
        { id: 'washing_machine', label: 'Washing Machine', Icon: Shirt, photoRequired: true },
        { id: 'ro_water', label: 'RO Water', Icon: Droplet, photoRequired: false },
        { id: 'refrigerator', label: 'Refrigerator', Icon: Utensils, photoRequired: true },
        { id: 'tv', label: 'TV', Icon: Tv, photoRequired: true },
      ],
    },
  ];

  const allAmenityItems = amenityCategories.flatMap((category) => category.items);

  const requiredSelectedAmenities = allAmenityItems.filter(
    (item) => item.photoRequired && formData.selectedAmenities.includes(item.id)
  );

  const completedRequiredPhotos = requiredSelectedAmenities.filter(
    (item) => {
      const photo = amenityPhotos[item.id];
      const status = String(
        photo?.verificationStatus ||
        photo?.status ||
        "PENDING"
      ).toUpperCase();

      return Boolean(photo?.previewUrl) && status !== "REJECTED";
    }
  ).length;

  const remainingRequiredPhotos = Math.max(
    requiredSelectedAmenities.length - completedRequiredPhotos,
    0
  );

  const verificationProgress = requiredSelectedAmenities.length
    ? Math.round((completedRequiredPhotos / requiredSelectedAmenities.length) * 100)
    : 0;

  const handleAmenityPhotoFile = (file) => {
    if (!file || !photoModalAmenity) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be 10 MB or less.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const amenityId = photoModalAmenity.id;

    setAmenityPhotos((prev) => {
      const previous = prev[amenityId];

      if (previous?.previewUrl) {
        URL.revokeObjectURL(previous.previewUrl);
      }

      return {
        ...prev,
        [amenityId]: {
          file,
          previewUrl,
          status: 'PENDING',
          rejectionReason: '',
        },
      };
    });

    setPhotoModalAmenity(null);
    setPhotoInputKey((key) => key + 1);

    toast.success(
      `${photoModalAmenity.label} photo added. Pending verification.`
    );
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      cameraStreamRef.current = null;
    }

    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }
  };

  const openCamera = (amenity) => {
    setPhotoModalAmenity(amenity);
    setCameraOpen(true);
  };

  const closeCamera = () => {
    stopCamera();
    setCameraOpen(false);
  };

  useEffect(() => {
    if (!cameraOpen) {
      return;
    }

    let cancelled = false;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          toast.error(
            "Camera access is not supported by this browser."
          );
          setCameraOpen(false);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: "environment",
            },
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        cameraStreamRef.current = stream;

        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;

          try {
            await cameraVideoRef.current.play();
          } catch (error) {
            console.error("Camera video play error:", error);
          }
        }
      } catch (error) {
        console.error("Camera access error:", error);

        if (error.name === "NotAllowedError") {
          toast.error(
            "Camera permission was denied. Please allow camera access in your browser."
          );
        } else if (error.name === "NotFoundError") {
          toast.error(
            "No camera was found on this device."
          );
        } else if (error.name === "NotReadableError") {
          toast.error(
            "The camera is already being used by another application."
          );
        } else {
          toast.error(
            "Unable to access the camera."
          );
        }

        setCameraOpen(false);
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [cameraOpen]);

  const captureCameraPhoto = () => {
    const video = cameraVideoRef.current;

    if (!video) {
      toast.error("Camera is not ready.");
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      toast.error(
        "Camera is still starting. Please wait."
      );
      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      toast.error("Unable to capture image.");
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Unable to create image.");
          return;
        }

        const file = new File(
          [blob],
          `hostel-photo-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        if (
          propertyPhotoTarget === null &&
          photoModalAmenity
        ) {
          handleAmenityPhotoFile(file);
          closeCamera();
          return;
        }

        if (
          propertyPhotoTarget?.type === "cover"
        ) {
          handleCoverImageFile(file);
          closePropertyCamera();
          toast.success(
            "Main cover image captured successfully."
          );
          return;
        }

        if (
          propertyPhotoTarget?.type === "additional"
        ) {
          const slotIndex = propertyPhotoTarget.slotIndex;

          if (slotIndex === null || slotIndex === undefined) {
            toast.error("Please select a photo slot first.");
            closePropertyCamera();
            return;
          }

          const slot = formData.additionalPhotos?.[slotIndex];

          if (!slot?.selected) {
            toast.error(`Please select Photo ${slotIndex + 1} first.`);
            closePropertyCamera();
            return;
          }

          handleAdditionalPhotoFile(file, slotIndex);
          closePropertyCamera();
          toast.success(
            `Photo ${slotIndex + 1} captured successfully.`
          );
          return;
        }
      },
      "image/jpeg",
      0.9
    );
  };

  const openPhotoPicker = (mode, amenity) => {
    if (!amenity) return;

    if (mode === "camera") {
      setPhotoModalAmenity(amenity);
      setCameraOpen(true);
      return;
    }

    if (mode === "upload") {
      setPhotoModalAmenity(amenity);

      setTimeout(() => {
        photoUploadInputRef.current?.click();
      }, 0);
    }
  };

  const removeAmenityPhoto = (amenityId) => {
    setAmenityPhotos((prev) => {
      const existing = prev[amenityId];

      if (existing?.previewUrl) {
        URL.revokeObjectURL(existing.previewUrl);
      }

      const next = { ...prev };
      delete next[amenityId];

      return next;
    });
  };

  const handleCoverImageFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be 10 MB or less.");
      return;
    }

    setFormData((prev) => {
      if (prev.coverImage?.previewUrl) {
        URL.revokeObjectURL(prev.coverImage.previewUrl);
      }

      return {
        ...prev,
        coverImage: {
          file,
          previewUrl: URL.createObjectURL(file),
          persisted: false,
          loadFailed: false,
        },
      };
    });
  };

  const handleCoverImageChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      handleCoverImageFile(file);
    }

    event.target.value = "";
  };

  const toggleAdditionalPhotoSlot = (slotIndex) => {
    setFormData((prev) => {
      const slots = Array.isArray(prev.additionalPhotos)
        ? [...prev.additionalPhotos]
        : Array.from({ length: 4 }, (_, index) => ({
            slotIndex: index,
            selected: false,
            file: null,
            previewUrl: null,
          }));

      const currentSlot = slots[slotIndex] || {
        slotIndex,
        selected: false,
        file: null,
        previewUrl: null,
      };

      if (currentSlot.selected) {
        if (currentSlot.previewUrl) {
          URL.revokeObjectURL(currentSlot.previewUrl);
        }

        slots[slotIndex] = {
          slotIndex,
          selected: false,
          file: null,
          previewUrl: null,
        };
      } else {
        slots[slotIndex] = {
          ...currentSlot,
          slotIndex,
          selected: true,
        };
      }

      return {
        ...prev,
        additionalPhotos: slots,
      };
    });
  };

  const handleAdditionalPhotoFile = (file, explicitSlotIndex = null) => {
    if (!file) return;

    const slotIndex =
      explicitSlotIndex !== null && explicitSlotIndex !== undefined
        ? explicitSlotIndex
        : additionalPhotoTargetSlot;

    if (slotIndex === null || slotIndex === undefined) {
      toast.error("Please select a photo slot first.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be 10 MB or less.");
      return;
    }

    setFormData((prev) => {
      const slots = Array.isArray(prev.additionalPhotos)
        ? [...prev.additionalPhotos]
        : Array.from({ length: 4 }, (_, index) => ({
            slotIndex: index,
            selected: false,
            file: null,
            previewUrl: null,
          }));

      const currentSlot = slots[slotIndex] || {
        slotIndex,
        selected: false,
        file: null,
        previewUrl: null,
      };

      if (!currentSlot.selected) {
        toast.error(`Please select Photo ${slotIndex + 1} first.`);
        return prev;
      }

      if (currentSlot.previewUrl) {
        URL.revokeObjectURL(currentSlot.previewUrl);
      }

      slots[slotIndex] = {
        ...currentSlot,
        slotIndex,
        selected: true,
        file,
        previewUrl: URL.createObjectURL(file),
        persisted: false,
        loadFailed: false,
      };

      return {
        ...prev,
        additionalPhotos: slots,
      };
    });
  };

  const openAdditionalPhotoUpload = (slotIndex) => {
    const slot = formData.additionalPhotos?.[slotIndex];

    if (!slot?.selected) {
      toast.error(`Please select Photo ${slotIndex + 1} first.`);
      return;
    }

    setAdditionalPhotoTargetSlot(slotIndex);

    setTimeout(() => {
      additionalPhotosInputRef.current?.click();
    }, 0);
  };

  const handleAdditionalPhotosChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      handleAdditionalPhotoFile(file, additionalPhotoTargetSlot);
    }

    setAdditionalPhotoTargetSlot(null);
    event.target.value = "";
  };

  const removeAdditionalPhoto = (index) => {
    setFormData((prev) => {
      const slots = Array.isArray(prev.additionalPhotos)
        ? [...prev.additionalPhotos]
        : [];

      const existing = slots[index];

      if (existing?.previewUrl) {
        URL.revokeObjectURL(existing.previewUrl);
      }

      slots[index] = {
        slotIndex: index,
        selected: false,
        file: null,
        previewUrl: null,
      };

      return {
        ...prev,
        additionalPhotos: slots,
      };
    });
  };

  const roomTypes = [
    {
      id: 'single',
      title: '1 Sharing',
      description: 'Private room for one person',
      icon: User
    },
    {
      id: 'double',
      title: '2 Sharing',
      description: 'Room shared by two people',
      icon: Users
    },
    {
      id: 'triple',
      title: '3 Sharing',
      description: 'Room shared by three people',
      icon: Users
    },
    {
      id: 'quad',
      title: '4 Sharing',
      description: 'Room shared by four people',
      icon: Users
    },
    {
      id: 'five',
      title: '5+ Sharing',
      description: 'Room shared by five or more people',
      icon: Users
    },
  ];

  const getRoomConfigurationKey = (roomId, coolingType) =>
    `${roomId}__${String(coolingType).toUpperCase()}`;

  const getCoolingTypeLabel = (coolingType) =>
    String(coolingType).toUpperCase() === 'AC' ? 'AC' : 'Non-AC';

  const getSelectedRoomConfigurations = () => {
    const configurations = [];

    for (const roomId of formData.selectedRoomTypes || []) {
      const room = roomTypes.find((item) => item.id === roomId);
      if (!room) continue;

      const selectedCoolingTypes =
        formData.roomCoolingTypes?.[roomId] || [];

      selectedCoolingTypes.forEach((coolingType) => {
        const normalizedCoolingType = String(coolingType).toUpperCase();
        const configurationKey = getRoomConfigurationKey(
          roomId,
          normalizedCoolingType
        );

        configurations.push({
          ...room,
          id: configurationKey,
          baseRoomId: roomId,
          coolingType: normalizedCoolingType,
          title: `${room.title} — ${getCoolingTypeLabel(normalizedCoolingType)}`,
          sharingTitle: room.title,
        });
      });
    }

    return configurations;
  };

  const toggleRoomType = (roomId) => {
    setFormData((prev) => {
      const exists = prev.selectedRoomTypes.includes(roomId);

      if (exists) {
        const nextCoolingTypes = {
          ...(prev.roomCoolingTypes || {}),
        };
        delete nextCoolingTypes[roomId];

        const nextPricing = {
          ...(prev.roomPricing || {}),
        };
        ['AC', 'NON_AC'].forEach((coolingType) => {
          delete nextPricing[getRoomConfigurationKey(roomId, coolingType)];
        });

        return {
          ...prev,
          selectedRoomTypes: prev.selectedRoomTypes.filter(
            (id) => id !== roomId
          ),
          roomCoolingTypes: nextCoolingTypes,
          roomPricing: nextPricing,
        };
      }

      return {
        ...prev,
        selectedRoomTypes: [...prev.selectedRoomTypes, roomId],
        roomCoolingTypes: {
          ...(prev.roomCoolingTypes || {}),
          [roomId]: [],
        },
      };
    });
  };

  const toggleRoomCoolingType = (roomId, coolingType) => {
    const normalizedCoolingType = String(coolingType).toUpperCase();

    setFormData((prev) => {
      const current = Array.isArray(prev.roomCoolingTypes?.[roomId])
        ? prev.roomCoolingTypes[roomId]
        : [];

      const exists = current.includes(normalizedCoolingType);

      const nextCoolingTypes = exists
        ? current.filter((type) => type !== normalizedCoolingType)
        : [...current, normalizedCoolingType];

      const nextPricing = {
        ...(prev.roomPricing || {}),
      };

      if (exists) {
        delete nextPricing[
          getRoomConfigurationKey(roomId, normalizedCoolingType)
        ];
      }

      return {
        ...prev,
        roomCoolingTypes: {
          ...(prev.roomCoolingTypes || {}),
          [roomId]: nextCoolingTypes,
        },
        roomPricing: nextPricing,
      };
    });
  };

  const handleRoomPriceChange = (configurationKey, value) => {
    const cleanedValue = value.replace(/\D/g, '');

    setFormData((prev) => ({
      ...prev,
      roomPricing: {
        ...prev.roomPricing,
        [configurationKey]: cleanedValue,
      },
    }));
  };

  const getRoomPhotos = (configurationKey) => {
    return roomPhotos[configurationKey] || [];
  };

  const handleRoomPhotoFile = (file) => {
    if (!file || !roomPhotoModal) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be 10 MB or less.');
      return;
    }

    const roomId = roomPhotoModal.id;
    const currentPhotos = roomPhotos[roomId] || [];
    const replaceIndex = roomPhotoReplaceIndex;
    const previewUrl = URL.createObjectURL(file);

    setRoomPhotos((prev) => {
      const existingPhotos = [...(prev[roomId] || [])];

      if (
        replaceIndex !== null &&
        replaceIndex !== undefined &&
        existingPhotos[replaceIndex]
      ) {
        const oldPreview = existingPhotos[replaceIndex]?.previewUrl;

        if (oldPreview && oldPreview.startsWith('blob:')) {
          URL.revokeObjectURL(oldPreview);
        }

        existingPhotos[replaceIndex] = {
          ...existingPhotos[replaceIndex],
          file,
          previewUrl,
          persisted: false,
          loadFailed: false,
          status: 'PENDING',
          verificationStatus: 'PENDING',
        };

        return {
          ...prev,
          [roomId]: existingPhotos,
        };
      }

      if (existingPhotos.length >= 3) {
        URL.revokeObjectURL(previewUrl);
        return prev;
      }

      return {
        ...prev,
        [roomId]: [
          ...existingPhotos,
          {
            file,
            previewUrl,
          },
        ],
      };
    });

    setRoomPhotoReplaceIndex(null);
    setRoomPhotoModal(null);
    setRoomPhotoInputKey((key) => key + 1);

    toast.success(
      replaceIndex !== null && replaceIndex !== undefined
        ? `${roomPhotoModal.title} room photo replaced.`
        : `${roomPhotoModal.title} room photo added.`
    );
  };

  const handleRoomPhotoInputChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      handleRoomPhotoFile(file);
    }

    e.target.value = '';
  };

  const removeRoomPhoto = (roomId, photoIndex) => {
    setRoomPhotos((prev) => {
      const existingPhotos = prev[roomId] || [];
      const photoToRemove = existingPhotos[photoIndex];

      if (photoToRemove?.previewUrl) {
        URL.revokeObjectURL(photoToRemove.previewUrl);
      }

      const updatedPhotos = existingPhotos.filter(
        (_, index) => index !== photoIndex
      );

      return {
        ...prev,
        [roomId]: updatedPhotos,
      };
    });
  };

  const stopRoomCamera = () => {
    if (roomCameraStreamRef.current) {
      roomCameraStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      roomCameraStreamRef.current = null;
    }

    if (roomCameraVideoRef.current) {
      roomCameraVideoRef.current.srcObject = null;
    }
  };

  const openRoomCamera = (room) => {
    setRoomPhotoModal(room);
    setRoomCameraOpen(true);
  };

  const closeRoomCamera = () => {
    stopRoomCamera();
    setRoomCameraOpen(false);
  };

  useEffect(() => {
    if (!roomCameraOpen) {
      return;
    }

    let cancelled = false;

    const startRoomCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          toast.error(
            "Camera access is not supported by this browser."
          );
          setRoomCameraOpen(false);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: "environment",
            },
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        roomCameraStreamRef.current = stream;

        if (roomCameraVideoRef.current) {
          roomCameraVideoRef.current.srcObject = stream;

          try {
            await roomCameraVideoRef.current.play();
          } catch (error) {
            console.error(
              "Room camera video play error:",
              error
            );
          }
        }
      } catch (error) {
        console.error(
          "Room camera access error:",
          error
        );

        if (error.name === "NotAllowedError") {
          toast.error(
            "Camera permission was denied. Please allow camera access."
          );
        } else if (error.name === "NotFoundError") {
          toast.error(
            "No camera was found on this device."
          );
        } else if (error.name === "NotReadableError") {
          toast.error(
            "The camera is already being used by another application."
          );
        } else {
          toast.error(
            "Unable to access the camera."
          );
        }

        setRoomCameraOpen(false);
      }
    };

    startRoomCamera();

    return () => {
      cancelled = true;
      stopRoomCamera();
    };
  }, [roomCameraOpen]);

  const captureRoomCameraPhoto = () => {
    const video = roomCameraVideoRef.current;

    if (!video) {
      toast.error("Camera is not ready.");
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      toast.error(
        "Camera is still starting. Please wait."
      );
      return;
    }

    if (!roomPhotoModal) {
      toast.error("Room type is not selected.");
      return;
    }

    const existingPhotos = roomPhotos[roomPhotoModal.id] || [];

    if (
      roomPhotoReplaceIndex === null &&
      existingPhotos.length >= 3
    ) {
      toast.error(
        "You can add a maximum of 3 photos per room type."
      );
      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      toast.error("Unable to capture image.");
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Unable to create image.");
          return;
        }

        const file = new File(
          [blob],
          `room-${roomPhotoModal.id}-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        handleRoomPhotoFile(file);
        closeRoomCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  const openRoomPhotoPicker = (room, mode, replaceIndex = null) => {
    if (!room) return;

    const existingPhotos = roomPhotos[room.id] || [];

    if (
      replaceIndex === null &&
      existingPhotos.length >= 3
    ) {
      toast.error(
        "You can add a maximum of 3 photos per room type."
      );
      return;
    }

    setRoomPhotoReplaceIndex(replaceIndex);
    setRoomPhotoModal(room);

    if (mode === "camera") {
      setRoomCameraOpen(true);
      return;
    }

    if (mode === "upload") {
      setTimeout(() => {
        roomPhotoInputRef.current?.click();
      }, 0);
    }
  };

  const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  setFormData((prev) => {
    const nextValue =
      type === "checkbox" ? checked : value;

    const locationFields = [
      "state",
      "city",
      "area",
      "address",
      "landmark",
      "pincode"
    ];

    if (locationFields.includes(name)) {
      setLocationConfirmed(false);
      setLocationWasAdjusted(false);
      setMapAddressPreview("");
      setMapLocationName("");

      return {
        ...prev,
        [name]: nextValue,
        latitude: "",
        longitude: ""
      };
    }

    if (name === "latitude" || name === "longitude") {
      setLocationConfirmed(false);

      const nextLatitude =
        name === "latitude" ? Number(nextValue) : Number(prev.latitude);
      const nextLongitude =
        name === "longitude" ? Number(nextValue) : Number(prev.longitude);

      if (
        Number.isFinite(nextLatitude) &&
        nextLatitude >= -90 &&
        nextLatitude <= 90 &&
        Number.isFinite(nextLongitude) &&
        nextLongitude >= -180 &&
        nextLongitude <= 180
      ) {
        setPosition({
          lat: nextLatitude,
          lng: nextLongitude
        });
        setLocationWasAdjusted(true);
      }

      return {
        ...prev,
        [name]: nextValue
      };
    }

    return {
      ...prev,
      [name]: nextValue
    };
  });
};

  const toggleAmenity = (id) => {
    setFormData((prev) => {
      const exists = prev.selectedAmenities.includes(id);

      return {
        ...prev,
        selectedAmenities: exists
          ? prev.selectedAmenities.filter((item) => item !== id)
          : [...prev.selectedAmenities, id],
      };
    });
  };

  const handlePhotoInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleAmenityPhotoFile(file);
    e.target.value = '';
  };

  const toggleGeneralRule = (ruleId) => {
    setFormData((prev) => ({
      ...prev,
      generalRules: {
        ...prev.generalRules,
        [ruleId]: !prev.generalRules[ruleId],
      },
    }));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  // Helper validation function to determine if a step is filled properly
  const isStepValid = (stepIdx) => {
    switch (stepIdx) {
      case 0: // Basic Info
        return (
          Boolean(formData.hostelName?.trim()) &&
          Boolean(formData.hostelType) &&
          Boolean(formData.ownerName?.trim()) &&
          Boolean(formData.phoneNumber?.trim()) &&
          /^\d{10}$/.test(formData.phoneNumber)
        );

      case 1: // Location
        const lat = Number(formData.latitude);
        const lng = Number(formData.longitude);
        return (
          Boolean(formData.address?.trim()) &&
          Boolean(formData.state) &&
          Boolean(formData.city) &&
          Boolean(formData.area?.trim()) &&
          Boolean(formData.landmark?.trim()) &&
          Boolean(formData.pincode?.trim()) &&
          /^\d{6}$/.test(formData.pincode) &&
          formData.latitude !== "" &&
          formData.longitude !== "" &&
          !Number.isNaN(lat) &&
          lat >= -90 &&
          lat <= 90 &&
          !Number.isNaN(lng) &&
          lng >= -180 &&
          lng <= 180 &&
          locationConfirmed
        );

      case 2: // Amenities
        return (
          formData.selectedAmenities &&
          formData.selectedAmenities.length > 0 &&
          remainingRequiredPhotos === 0
        );

      case 3: // Rooms
        if (
          !formData.selectedRoomTypes ||
          formData.selectedRoomTypes.length === 0
        ) {
          return false;
        }

        const selectedConfigurations = getSelectedRoomConfigurations();

        if (selectedConfigurations.length === 0) {
          return false;
        }

        for (const configuration of selectedConfigurations) {
          const configurationKey = configuration.id;
          const photos = roomPhotos[configurationKey] || [];

          const hasPersistedPhoto = photos.some(
            (photo) =>
              photo?.persisted === true &&
              Boolean(photo?.previewUrl) &&
              photo?.loadFailed !== true &&
              photo?.verificationStatus !== 'REJECTED'
          );

          const hasNewPhoto = photos.some(
            (photo) =>
              photo?.file instanceof File &&
              photo.file.size > 0
          );

          const rent = Number(
            formData.roomPricing[configurationKey]
          );

          if (
            (!hasPersistedPhoto && !hasNewPhoto) ||
            !formData.roomPricing[configurationKey] ||
            Number.isNaN(rent) ||
            rent <= 0
          ) {
            return false;
          }
        }

        return true;

      case 4: // Rules
        const hasGeneralRules =
          Object.values(formData.generalRules).some(Boolean);
        const hasCustomRules =
          Boolean(formData.customRules?.trim());

        return hasGeneralRules || hasCustomRules;

      case 5: // Deposit
        return Boolean(formData.cancellationPolicy);

      case 6: // Photos
        const coverReady =
          Boolean(formData.coverImage?.file) ||
          (
            formData.coverImage?.persisted === true &&
            Boolean(formData.coverImage?.previewUrl)
          );

        if (!coverReady) return false;

        const additionalPhotoSlots =
          Array.isArray(formData.additionalPhotos)
            ? formData.additionalPhotos
            : [];

        const selectedAdditionalSlots =
          additionalPhotoSlots.filter(
            (photo) => photo?.selected
          );

        const incompleteSlot =
          selectedAdditionalSlots.find(
            (photo) =>
              !photo?.file &&
              photo?.persisted !== true
          );

        if (incompleteSlot) return false;

        return selectedAdditionalSlots.length <= 4;

      case 7: // Preview & Declaration
        return declarationAccepted;

      default:
        return false;
    }
  };

  // Toast message tracking to prevent duplicates
  let lastToastMessage = '';
  let lastToastTime = 0;

  const showToastOnce = (message, type = 'success') => {
    const now = Date.now();
    // Only show if different message or more than 2 seconds have passed
    if (message !== lastToastMessage || now - lastToastTime > 2000) {
      lastToastMessage = message;
      lastToastTime = now;
      if (type === 'success') {
        toast.success(message);
      } else if (type === 'error') {
        toast.error(message);
      } else if (type === 'loading') {
        toast.loading(message);
      } else {
        toast(message);
      }
    }
  };

  const handleNext = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      if (currentStep === 0) {
        if (!formData.hostelName?.trim()) {
          toast.error("Please enter the hostel name.");
          return;
        }

        if (!formData.hostelType) {
          toast.error("Please select the hostel type.");
          return;
        }

        if (!formData.ownerName?.trim()) {
          toast.error("Please enter the owner or manager name.");
          return;
        }

        if (!formData.phoneNumber?.trim()) {
          toast.error("Please enter the contact phone number.");
          return;
        }

        if (!/^\d{10}$/.test(formData.phoneNumber)) {
          toast.error("Please enter a valid 10-digit phone number.");
          return;
        }

        const basicInfoPayload = {
          hostelName: formData.hostelName.trim(),
          hostelType: formData.hostelType,
          ownerName: formData.ownerName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          description: formData.description?.trim() || ""
        };

        let response;
        if (hostelId) {
          response = await api.put(
            `/api/owner/hostels/${hostelId}/basic-info`,
            basicInfoPayload
          );
        } else {
          response = await api.post(
            "/api/owner/hostels/basic-info",
            basicInfoPayload
          );
        }

        console.log("========== BASIC INFO RESPONSE ==========");
        console.log("Response:", response.data);
        console.log("=========================================");

        const generatedHostelId = response.data?.hostelId || hostelId;

        if (!generatedHostelId) {
          toast.error(
            "Hostel was created, but hostel ID was not returned by the server."
          );
          return;
        }

        setHostelId(generatedHostelId);

        console.log(
          "Hostel basic info saved successfully. Hostel ID:",
          generatedHostelId
        );

        showToastOnce("Basic information saved successfully.");
        
      } else if (currentStep === 1) {
        if (!hostelId) {
          toast.error(
            "Hostel ID is missing. Please complete Basic Info first."
          );
          return;
        }

        // Location must be explicitly confirmed before the owner can
        // proceed to the next step. Finding/fetching latitude and longitude
        // alone is not enough; the owner must click "Confirm Hostel Location".
        if (!locationConfirmed) {
          toast.error(
            'Please click "Confirm Hostel Location" before proceeding to the next step.'
          );
          return;
        }

        if (!formData.address?.trim()) {
          toast.error("Please enter the hostel address.");
          return;
        }

        if (!formData.state) {
          toast.error("Please select the state.");
          return;
        }

        if (!formData.city) {
          toast.error("Please select the city.");
          return;
        }

        if (!formData.area?.trim()) {
          toast.error("Please enter the area/locality.");
          return;
        }

        if (!formData.landmark?.trim()) {
          toast.error("Please enter the landmark.");
          return;
        }

        if (!formData.pincode?.trim()) {
          toast.error("Please enter the pincode.");
          return;
        }

        if (!/^\d{6}$/.test(formData.pincode)) {
          toast.error("Please enter a valid 6-digit pincode.");
          return;
        }

        if (
          formData.latitude === "" ||
          formData.latitude === null ||
          formData.latitude === undefined
        ) {
          toast.error("Please enter the hostel latitude.");
          return;
        }

        if (
          formData.longitude === "" ||
          formData.longitude === null ||
          formData.longitude === undefined
        ) {
          toast.error("Please enter the hostel longitude.");
          return;
        }

        const latitude = Number(formData.latitude);
        const longitude = Number(formData.longitude);

        if (
          Number.isNaN(latitude) ||
          latitude < -90 ||
          latitude > 90
        ) {
          toast.error("Please enter a valid latitude.");
          return;
        }

        if (
          Number.isNaN(longitude) ||
          longitude < -180 ||
          longitude > 180
        ) {
          toast.error("Please enter a valid longitude.");
          return;
        }

        const response = await api.put(
          `/api/owner/hostels/${hostelId}/location`,
          {
            address: formData.address.trim(),
            landmark: formData.landmark.trim(),
            city: formData.city,
            area: formData.area.trim(),
            state: formData.state,
            pincode: formData.pincode.trim(),
            latitude: latitude,
            longitude: longitude
          }
        );

        console.log("========== LOCATION RESPONSE ==========");
        console.log("Response:", response.data);
        console.log("Hostel ID:", hostelId);
        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);
        console.log("======================================");

        showToastOnce("Location saved successfully.");
        
      } else if (currentStep === 2) {
        if (!hostelId) {
          toast.error("Hostel ID is missing.");
          return;
        }

        if (
          !formData.selectedAmenities ||
          formData.selectedAmenities.length === 0
        ) {
          toast.error("Please select at least one amenity.");
          return;
        }

        if (remainingRequiredPhotos > 0) {
          const missingNames = requiredSelectedAmenities
            .filter(
              (item) =>
                !amenityPhotos[item.id]?.previewUrl ||
                amenityPhotos[item.id]?.status === "REJECTED"
            )
            .map((item) => item.label);

          toast.error(
            `Please add photos for: ${missingNames.join(", ")}`
          );
          return;
        }

        const loadingToast = toast.loading(
          "Saving amenities..."
        );

        try {
          console.log(
            "========== SAVING AMENITIES =========="
          );
          console.log("Hostel ID:", hostelId);
          console.log("Selected amenities:", formData.selectedAmenities);
          console.log("Amenity photos:", amenityPhotos);

          for (const selectedAmenityId of formData.selectedAmenities) {
            const amenity = amenityCategories
              .flatMap(category => category.items)
              .find(item => item.id === selectedAmenityId);

            if (!amenity) {
              throw new Error(
                `Amenity definition not found: ${selectedAmenityId}`
              );
            }

            const requestData = {
              amenityCode: amenity.id,
              amenityName: amenity.label,
              photoRequired: Boolean(
                amenity.photoRequired
              )
            };

            const amenityResponse = await api.post(
              `/api/owner/hostels/${hostelId}/amenities`,
              requestData
            );

            const savedAmenity = amenityResponse.data;
            const amenityId = savedAmenity?.amenityId;

            if (!amenityId) {
              throw new Error(
                `Backend did not return amenityId for ${amenity.label}`
              );
            }

            if (amenity.photoRequired) {
              const photoData = amenityPhotos[amenity.id];

              if (
                !photoData ||
                (
                  !photoData.file &&
                  photoData.persisted !== true
                )
              ) {
                throw new Error(
                  `Photo is missing for ${amenity.label}`
                );
              }

              // Persisted photo already exists in database.
              // Do not upload it again.
              if (
                photoData.persisted === true &&
                !photoData.file
              ) {
                console.log(
                  `Existing photo already saved for ${amenity.label}. Skipping upload.`
                );
              } else {
                const photoFormData = new FormData();

                photoFormData.append(
                  "file",
                  photoData.file
                );

                const photoResponse = await api.post(
                  `/api/owner/hostels/amenities/${amenityId}/photo`,
                  photoFormData
                );

                console.log(
                  "PHOTO RESPONSE:",
                  photoResponse.data
                );
              }
            }
          }

          toast.dismiss(loadingToast);
          showToastOnce(
            `Amenities saved successfully. ${formData.selectedAmenities.length} ${
              formData.selectedAmenities.length === 1
                ? "amenity"
                : "amenities"
            } saved.`
          );

          // The missing-photo warning is cleared only after the replacement
          // photo has been successfully saved by the backend.
          setMissingPhotoMessages((prev) => ({
            ...prev,
            amenities: [],
          }));

        } catch (error) {
          toast.dismiss(loadingToast);

          console.error(
            "========== AMENITIES SAVE ERROR =========="
          );
          console.error("Status:", error.response?.status);
          console.error("Response:", error.response?.data);
          console.error("Message:", error.message);
          console.error("Request URL:", error.config?.url);

          toast.error(
            error.response?.data?.message ||
            error.response?.data ||
            error.message ||
            "Failed to save amenities."
          );
          return;
        }
        
      } 
else if (currentStep === 3) {
  if (!hostelId) {
    toast.error('Hostel ID is missing.');
    return;
  }

  if (
    !formData.selectedRoomTypes ||
    formData.selectedRoomTypes.length === 0
  ) {
    toast.error('Please select at least one room type.');
    return;
  }

  const selectedConfigurations = getSelectedRoomConfigurations();

  if (selectedConfigurations.length === 0) {
    toast.error('Please select AC or Non-AC for every selected room type.');
    return;
  }

  let loadingToast = null;

  console.log('========== SELECTED ROOM CONFIGURATIONS ==========');
  console.log(
    'Selected Room Configurations:',
    selectedConfigurations.map((configuration) => ({
      roomType: configuration.baseRoomId,
      title: configuration.title,
      coolingType: configuration.coolingType,
      configurationKey: configuration.id,
    }))
  );
  console.log('===================================================');

  try {
    loadingToast = toast.loading('Saving room details...');

    // =========================================================
    // GET EXISTING ROOMS FROM DATABASE
    // =========================================================

    let existingRooms = [];

    try {
      const existingRoomsResponse = await api.get(
        `/api/owner/hostels/${hostelId}/rooms`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (Array.isArray(existingRoomsResponse.data)) {
        existingRooms = existingRoomsResponse.data;
      } else if (Array.isArray(existingRoomsResponse.data?.rooms)) {
        existingRooms = existingRoomsResponse.data.rooms;
      } else if (Array.isArray(existingRoomsResponse.data?.data)) {
        existingRooms = existingRoomsResponse.data.data;
      }

      console.log('========== EXISTING ROOMS ==========');
      console.log('Existing rooms from database:', existingRooms);
      console.log('====================================');
    } catch (roomsFetchError) {
      console.error('Failed to fetch existing rooms:', roomsFetchError);
      throw new Error(
        'Unable to check existing rooms. Please try again.'
      );
    }

    const roomTypeMapping = {
      single: 'SINGLE',
      double: 'DOUBLE',
      triple: 'TRIPLE',
      quad: 'QUAD',
      five: 'FIVE',
      one: 'SINGLE',
      two: 'DOUBLE',
      three: 'TRIPLE',
      four: 'QUAD',
      fiveSharing: 'FIVE'
    };

    // =========================================================
    // PROCESS EACH SELECTED ROOM CONFIGURATION
    // =========================================================

    for (const configuration of selectedConfigurations) {
      const roomId = configuration.baseRoomId;
      const backendRoomType =
        roomTypeMapping[roomId] ||
        roomId.toUpperCase();
      const coolingType =
        String(configuration.coolingType).toUpperCase();
      const configurationKey = configuration.id;

      const existingRoom = existingRooms.find((existing) => {
        const existingType =
          existing?.roomType ||
          existing?.type ||
          existing?.room_type;

        const existingCoolingType = String(
          existing?.coolingType ||
          existing?.cooling_type ||
          'NON_AC'
        ).toUpperCase();

        return (
          existingType &&
          String(existingType).toUpperCase() === backendRoomType &&
          existingCoolingType === coolingType
        );
      });

      console.log('==========================================');
      console.log('CHECKING ROOM CONFIGURATION:', configuration.title);
      console.log('Backend Type:', backendRoomType);
      console.log('Cooling Type:', coolingType);
      console.log('Existing room:', existingRoom || 'NOT FOUND');
      console.log('==========================================');

      const currentRoomPhotos =
        roomPhotos[configurationKey] || [];

      // =======================================================
      // EXISTING ROOM CONFIGURATION
      // =======================================================

      if (existingRoom) {
        const hasMissingPersistedRoomPhoto =
          currentRoomPhotos.some(
            (photo) =>
              photo?.persisted === false &&
              photo?.loadFailed === true
          );

        const hasAnyUsablePersistedRoomPhoto =
          currentRoomPhotos.some(
            (photo) =>
              photo?.persisted === true &&
              Boolean(photo?.previewUrl) &&
              photo?.loadFailed !== true &&
              String(
                photo?.verificationStatus ||
                photo?.status ||
                'PENDING'
              ).toUpperCase() !== 'REJECTED'
          );

        const newRoomPhotos = currentRoomPhotos.filter(
          (photoObj) =>
            photoObj?.file instanceof File &&
            photoObj.file.size > 0
        );

        if (!hasMissingPersistedRoomPhoto) {
          if (hasAnyUsablePersistedRoomPhoto) {
            console.log(
              `Existing room ${backendRoomType} / ${coolingType} has visible persisted photos. Skipping room upload.`
            );
            continue;
          }
        }

        if (newRoomPhotos.length === 0) {
          throw new Error(
            `Please re-upload the missing photo(s) for ${configuration.title}`
          );
        }

        const rentPerBed = Number(
          formData.roomPricing[configurationKey]
        );

        if (!rentPerBed || rentPerBed <= 0) {
          throw new Error(
            `Please enter a valid rent for ${configuration.title}`
          );
        }

        const uploadRoomPhotos = [];

        for (const photoObj of currentRoomPhotos) {
          if (
            photoObj?.file instanceof File &&
            photoObj.file.size > 0
          ) {
            uploadRoomPhotos.push(photoObj.file);
            continue;
          }

          if (
            photoObj?.persisted === true &&
            photoObj?.previewUrl &&
            photoObj?.loadFailed !== true
          ) {
            try {
              const response = await fetch(photoObj.previewUrl);
              const blob = await response.blob();
              const originalName =
                photoObj.originalFileName ||
                photoObj.fileName ||
                `room-photo-${Date.now()}.jpg`;

              uploadRoomPhotos.push(
                new File(
                  [blob],
                  originalName,
                  {
                    type: blob.type ||
                      photoObj.fileType ||
                      'image/jpeg',
                  }
                )
              );
            } catch (error) {
              console.error(
                `Failed to prepare existing room photo ${photoObj.id} for repair:`,
                error
              );
              throw new Error(
                `Unable to preserve an existing photo for ${configuration.title}. Please try again.`
              );
            }
          }
        }

        if (uploadRoomPhotos.length === 0) {
          throw new Error(
            `Please upload at least one photo for ${configuration.title}`
          );
        }

        if (uploadRoomPhotos.length > 3) {
          throw new Error(
            `Maximum 3 photos are allowed for ${configuration.title}`
          );
        }

        const roomPayload = {
          roomType: backendRoomType,
          coolingType,
          rentPerBed,
        };

        const roomFormData = new FormData();

        roomFormData.append(
          'room',
          new Blob([JSON.stringify(roomPayload)], {
            type: 'application/json'
          })
        );

        uploadRoomPhotos.forEach((file) => {
          roomFormData.append('photos', file);
        });

        const roomResponse = await api.post(
          `/api/owner/hostels/${hostelId}/rooms`,
          roomFormData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        console.log(
          `SUCCESS: ${configuration.title}`,
          roomResponse.data
        );

        continue;
      }

      // =======================================================
      // NEW ROOM CONFIGURATION
      // =======================================================

      const rentPerBed = Number(
        formData.roomPricing[configurationKey]
      );

      if (!rentPerBed || rentPerBed <= 0) {
        throw new Error(
          `Please enter a valid rent for ${configuration.title}`
        );
      }

      const validPhotos = currentRoomPhotos.filter(
        (photoObj) =>
          photoObj?.file instanceof File &&
          photoObj.file.size > 0
      );

      if (validPhotos.length > 3) {
        throw new Error(
          `Maximum 3 photos are allowed for ${configuration.title}`
        );
      }

      if (validPhotos.length === 0) {
        throw new Error(
          `Please upload at least one photo for ${configuration.title}`
        );
      }

      console.log('SAVING NEW ROOM CONFIGURATION');
      console.log('Frontend ID:', roomId);
      console.log('Frontend Title:', configuration.title);
      console.log('Backend Type:', backendRoomType);
      console.log('Cooling Type:', coolingType);
      console.log('Rent:', rentPerBed);
      console.log('Photos:', validPhotos.length);

      const roomPayload = {
        roomType: backendRoomType,
        coolingType,
        rentPerBed,
      };

      const roomFormData = new FormData();

      roomFormData.append(
        'room',
        new Blob([JSON.stringify(roomPayload)], {
          type: 'application/json'
        })
      );

      validPhotos.forEach((photoObj) => {
        roomFormData.append('photos', photoObj.file);
      });

      const roomResponse = await api.post(
        `/api/owner/hostels/${hostelId}/rooms`,
        roomFormData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log(
        `SUCCESS: ${configuration.title}`,
        roomResponse.data
      );
    }

    toast.dismiss(loadingToast);
    showToastOnce('All room details saved successfully.');

    setMissingPhotoMessages((prev) => ({
      ...prev,
      rooms: [],
    }));

  } catch (error) {
    if (loadingToast) {
      toast.dismiss(loadingToast);
    }

    console.error('========== ROOMS SAVE ERROR ==========', error);
    console.error('Backend response:', error.response?.data);
    console.error('HTTP status:', error.response?.status);

    toast.error(
      error.response?.data?.message ||
      error.response?.data ||
      error.message ||
      'Failed to save room details.'
    );

    return;
  }
}
 else if (currentStep === 4) {
        if (!hostelId) {
          toast.error("Hostel ID is missing.");
          return;
        }

        console.log(
          "Rules step for Hostel ID:",
          hostelId
        );

        const rulesData = {
          noSmoking: formData.generalRules.noSmoking,
          noAlcohol: formData.generalRules.noAlcohol,
          noPets: formData.generalRules.noPets,
          visitorsAllowed: formData.generalRules.visitorsAllowed,
          curfewEnabled: formData.generalRules.curfew10pm,
          additionalRules: formData.customRules || ""
        };

        console.log("Rules Data:", rulesData);

        const rulesResponse = await api.put(
          `/api/owner/hostels/${hostelId}/rules`,
          rulesData
        );

        console.log("========== RULES SAVED ==========");
        console.log("Rules Response:", rulesResponse.data);
        
        showToastOnce("Rules saved successfully.");
        
      } else if (currentStep === 5) {
        console.log("========== DEPOSIT POLICY ==========");

        if (!formData.cancellationPolicy) {
          toast.error("Please select a refund policy.");
          return;
        }

        try {
          const response = await axios.post(
            `http://localhost:8080/api/owner/hostels/${hostelId}/deposit-policy`,
            {
              refundPolicy:
                formData.cancellationPolicy.toUpperCase()
            },
            {
              headers: {
                Authorization:
                  `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
              }
            }
          );

          console.log(
            "========== DEPOSIT POLICY RESPONSE =========="
          );
          console.log("Response:", response.data);

          showToastOnce("Deposit policy saved successfully.");

        } catch (error) {
          console.error(
            "========== DEPOSIT POLICY SAVE ERROR ==========",
            error
          );
          toast.error("Failed to save deposit policy.");
          return;
        }
        
      } else if (currentStep === 6) {
        console.log(
          "========== STEP 7: HOSTEL PHOTOS =========="
        );

        const storedHostelId = localStorage.getItem("hostelId");
        const effectiveHostelId =
          hostelId ||
          formData.hostelId ||
          null;

        console.log("State Hostel ID:", hostelId);
        console.log("Form Hostel ID:", formData.hostelId);
        console.log("Stored Hostel ID:", storedHostelId);
        console.log("Effective Hostel ID:", effectiveHostelId);

        if (
          !effectiveHostelId ||
          effectiveHostelId === "null" ||
          effectiveHostelId === "undefined"
        ) {
          console.error(
            "Hostel ID is missing. Cannot upload photos."
          );
          toast.error(
            "Hostel ID is missing. Please complete Basic Info first."
          );
          return false;
        }

        const coverFile = formData.coverImage?.file;
        const hasPersistedCover =
          formData.coverImage?.persisted === true &&
          Boolean(formData.coverImage?.previewUrl);

        if (!coverFile && !hasPersistedCover) {
          console.error("Cover image is missing.");
          toast.error(
            "Please upload the main hostel building entrance photo."
          );
          return false;
        }

        const additionalPhotoSlots =
          Array.isArray(formData.additionalPhotos)
            ? formData.additionalPhotos
            : [];

        const selectedAdditionalSlots =
          additionalPhotoSlots.filter(
            (photo) => photo?.selected
          );

        const incompleteSlot =
          selectedAdditionalSlots.find(
            (photo) =>
              !photo?.file &&
              photo?.persisted !== true
          );

        if (incompleteSlot) {
          toast.error(
            `Please upload Photo ${incompleteSlot.slotIndex + 1}, or uncheck it.`
          );
          return false;
        }

        const additionalPhotos =
          selectedAdditionalSlots.filter(
            (photo) =>
              photo?.file &&
              photo.file !== coverFile
          );

        console.log("========== PHOTO VALIDATION ==========");
        console.log(
          "Cover image:",
          coverFile?.name ||
          (hasPersistedCover ? "Existing persisted cover image" : "NULL")
        );
        console.log("Additional photo count:", additionalPhotos.length);
        console.log(
          "Additional photo names:",
          additionalPhotos.map((photo) => photo.file.name)
        );

        if (additionalPhotos.length > 4) {
          console.error(
            "Too many additional photos:",
            additionalPhotos.length
          );
          toast.error(
            "Maximum 4 additional photos are allowed."
          );
          return false;
        }

        /*
         * Upload only new files.
         * Existing persisted photos remain in database.
         */
        if (coverFile || additionalPhotos.length > 0) {
          const photoFormData = new FormData();

          if (coverFile) {
            photoFormData.append(
              "coverImage",
              coverFile
            );
          }

          additionalPhotos.forEach((photo) => {
            photoFormData.append(
              "additionalPhotos",
              photo.file
            );
          });

          console.log("========== PHOTO UPLOAD DATA ==========");
          console.log("Hostel ID:", effectiveHostelId);
          console.log(
            "Cover image:",
            coverFile?.name ||
            "Existing persisted cover image"
          );
          console.log("Additional photos:", additionalPhotos.length);
          console.log(
            "Total new images:",
            (coverFile ? 1 : 0) + additionalPhotos.length
          );

        try {
          const response = await axios.post(
            `http://localhost:8080/api/owner/hostels/${effectiveHostelId}/photos`,
            photoFormData,
            {
              headers: {
                Authorization:
                  `Bearer ${localStorage.getItem("token")}`
              }
            }
          );

          console.log("========== PHOTO UPLOAD SUCCESS ==========");
          console.log("Status:", response.status);
          console.log("Response:", response.data);

          setHostelId(effectiveHostelId);

          localStorage.setItem(
            "hostelId",
            String(effectiveHostelId)
          );

          // The warning is cleared only after the backend accepted the
          // replacement upload. Choosing a local file is not enough.
          if (coverFile) {
            clearMissingHostelPhoto("Main cover photo");
          }
          additionalPhotos.forEach((photo) => {
            if (photo?.slotIndex !== undefined) {
              clearMissingHostelPhoto(`Photo ${photo.slotIndex + 1}`);
            }
          });

          showToastOnce("Hostel photos uploaded successfully.");

        } catch (error) {
          console.error("========== PHOTO UPLOAD ERROR ==========");
          console.error("Status:", error.response?.status);
          console.error("Response:", error.response?.data);
          console.error("Message:", error.message);
          console.error("Full Error:", error);

          let errorMessage = "Failed to upload hostel photos.";

          if (error.response?.data) {
            if (typeof error.response.data === "string") {
              errorMessage = error.response.data;
            } else if (error.response.data.message) {
              errorMessage = error.response.data.message;
            } else if (error.response.data.error) {
              errorMessage = error.response.data.error;
            }
          }

          console.error("Backend Error Message:", errorMessage);
          toast.error(errorMessage);
          return;
        }
        } else {
          console.log(
            "No new hostel photos to upload. Existing persisted photos are already saved."
          );
        }

        // Step 6 is considered repaired only after the owner reaches this
        // point without validation/upload errors.
        setMissingPhotoMessages((prev) => ({
          ...prev,
          hostelPhotos: [],
        }));

      } else if (currentStep === 7) {
        const effectiveHostelId =
          hostelId ||
          formData.hostelId ||
          localStorage.getItem("hostelId");

        if (!effectiveHostelId) {
          toast.error("Hostel ID is missing.");
          return;
        }

        if (!declarationAccepted) {
          toast.error(
            "Please confirm the declaration checkbox before submitting."
          );
          return;
        }

        console.log("========== SUBMIT FOR APPROVAL ==========");
        console.log("Hostel ID:", effectiveHostelId);

        const token = localStorage.getItem("token");

        if (!token) {
          toast.error("Please login again.");
          return;
        }

        const response = await axios.post(
          `http://localhost:8080/api/owner/hostels/${effectiveHostelId}/submit-approval`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        console.log("Approval Response:", response.data);

        const submittedStatus = response.data?.status || "PENDING";

        console.log("Submitted status:", submittedStatus);

        localStorage.setItem(
          "hostelApprovalStatus",
          submittedStatus
        );

        // Clear saved progress on successful submission
        clearProgress();

        showToastOnce(
          "Your request has been sent to admin and is now pending approval."
        );

        // ✅ Navigate to approval pending page - NOT email verification
        navigate(
          "/owner/approval-pending",
          {
            replace: true
          }
        );
        return;
      }

      if (currentStep < steps.length - 1) {
        // Mark the current step as completed
        setCompletedSteps((prev) => {
          if (prev.includes(currentStep)) {
            return prev;
          }
          return [...prev, currentStep];
        });

        // Also mark it as visited
        setVisitedSteps((prev) => {
          if (prev.includes(currentStep)) {
            return prev;
          }
          return [...prev, currentStep];
        });

        // Move to next step
        setCurrentStep((prev) => prev + 1);
      }
    } catch (error) {
      console.error("========== SAVE STEP ERROR ==========");
      console.error("Status:", error.response?.status);
      console.error("Response:", error.response?.data);
      console.error("Error:", error);
      console.error("====================================");

      let errorMessage = "Failed to save information.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.response?.data === "string") {
        errorMessage = error.response.data;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatedProgress = Math.round(((currentStep + 1) / steps.length) * 100);

  // =====================================================
  // 🔥 FIXED: APPROVAL STATUS LOADING SCREEN
  // =====================================================
 // In AddHostelDetails.jsx - replace the render logic

// =====================================================
// 🔥 FIXED: APPROVAL STATUS RENDERING
// =====================================================

// Show loading state
if (isCheckingApprovalStatus) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
        <p className="text-sm font-semibold text-slate-700">
          Checking hostel approval status...
        </p>
      </div>
    </div>
  );
}

// Show error state
if (approvalCheckError) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-slate-900">
          Unable to verify hostel status
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Please refresh the page or login again.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// 🔥 FIXED: APPROVAL STATUS RENDERING
// ============================================================

// If hostel is fully submitted and pending, show pending page
if (
  isFullySubmitted &&
  (approvalStatus === "OWNER_VERIFICATION_PENDING" ||
    approvalStatus === "PENDING")
) {
  return <Navigate to="/owner/approval-pending" replace />;
}

// If hostel is approved, go to dashboard
if (
  isFullySubmitted &&
  (approvalStatus === "APPROVED" || approvalStatus === "VERIFIED")
) {
  return <Navigate to="/owner/dashboard" replace />;
}

// ============================================================
// 🔥 REJECTED
// ============================================================
// Do NOT redirect. Show the blank Add Hostel form so the owner
// can submit a NEW application.
//
// The status check above already cleared the old hostelId and
// sessionStorage, and set isDraft = true.
// ============================================================

// If hostel is suspended, show pending page
if (isFullySubmitted && approvalStatus === "SUSPENDED") {
  return <Navigate to="/owner/approval-pending" replace />;
}

// ============================================================
// SHOW THE FORM - For DRAFT or new hostels
// ============================================================
// [Rest of your component JSX here]

  // =====================================================
  // RESTORE PROGRESS DIALOG
  // =====================================================
  if (showRestoreDialog && restoreData) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-6">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <Clock className="h-7 w-7 text-blue-600" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Continue where you left off?
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              We found a saved progress from your previous session.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Last saved: {restoreData._timestamp ? new Date(restoreData._timestamp).toLocaleString() : 'recently'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Step {((restoreData.currentStep || 0) + 1)} of {steps.length}: {steps[restoreData.currentStep || 0]?.label}
            </p>
          </div>

          {(missingPhotoMessages.amenities.length > 0 ||
            missingPhotoMessages.rooms.length > 0 ||
            missingPhotoMessages.hostelPhotos.length > 0) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-bold text-amber-900">Some required photos are missing</p>
                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    Re-upload the missing photos before submitting this hostel for approval.
                  </p>
                  {missingPhotoMessages.amenities.length > 0 && (
                    <p className="mt-2 text-xs font-semibold text-amber-900">
                      Amenities: {missingPhotoMessages.amenities.join(', ')}
                    </p>
                  )}
                  {missingPhotoMessages.rooms.length > 0 && (
                    <p className="mt-1 text-xs font-semibold text-amber-900">
                      Rooms: {missingPhotoMessages.rooms.join(', ')}
                    </p>
                  )}
                  {missingPhotoMessages.hostelPhotos.length > 0 && (
                    <p className="mt-1 text-xs font-semibold text-amber-900">
                      Hostel Photos: {missingPhotoMessages.hostelPhotos.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleRestoreProgress}
              disabled={isRestoring}
              className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isRestoring ? 'Restoring...' : '✅ Resume Progress'}
            </button>
            <button
              type="button"
              onClick={handleStartFresh}
              disabled={isRestoring}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              🗑️ Start Fresh
            </button>
          </div>

          <p className="text-center text-[11px] text-slate-400">
            Saved progress will be deleted after 24 hours.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN COMPONENT RENDER - Only shown for DRAFT or new hostels
  // =====================================================
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 flex flex-col justify-between">
    {/* =====================================================
    REJECTED NOTICE BANNER
===================================================== */}
{approvalStatus === "REJECTED" && (
  <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 pt-5">
    <div className="rounded-2xl border border-red-300 bg-red-50 px-5 py-4 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-red-900">
            Your previous hostel application was rejected
          </p>
          <p className="mt-1 text-xs leading-5 text-red-800">
            Please review the admin feedback and submit a new application.
            Your owner account remains active. Fill in the form below to
            create a fresh hostel listing.
          </p>
        </div>
      </div>
    </div>
  </div>
)}
      {showResumePopup && hasSavedProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50">
                <RotateCcw className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Saved Hostel Information Found
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  You have already saved some hostel information.
                  Would you like to continue from where you stopped?
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResumePopup(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Continue
              </button>

              <button
  type="button"
  onClick={() => {

    setShowResumePopup(false);

    const firstIncompleteStep =
      steps.findIndex(
        (_, index) =>
          !completedSteps.includes(index)
      );

    setCurrentStep(
      firstIncompleteStep >= 0
        ? firstIncompleteStep
        : 7
    );

  }}
  className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
>
  Resume
</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header / Navbar */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-3.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-lg bg-blue-600 p-1.5 text-white">
            <Building className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-slate-800">
            FindMyHostel
          </span>
        </div>
        <button className="text-slate-400 hover:text-slate-600">
          <X className="h-5 w-5" />
        </button>
      </header>

      {(missingPhotoMessages.amenities.length > 0 ||
        missingPhotoMessages.rooms.length > 0 ||
        missingPhotoMessages.hostelPhotos.length > 0) && (
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 pt-5">
          <div className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-amber-900">Required photos need to be re-uploaded</p>
                <p className="mt-1 text-xs leading-5 text-amber-800">
                  Some saved required photos were not found. Re-upload them before submitting for approval.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {missingPhotoMessages.amenities.length > 0 && (
                    <button type="button" onClick={() => setCurrentStep(2)} className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100">
                      Amenities: {missingPhotoMessages.amenities.join(', ')}
                    </button>
                  )}
                  {missingPhotoMessages.rooms.length > 0 && (
                    <button type="button" onClick={() => setCurrentStep(3)} className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100">
                      Rooms: {missingPhotoMessages.rooms.join(', ')}
                    </button>
                  )}
                  {missingPhotoMessages.hostelPhotos.length > 0 && (
                    <button type="button" onClick={() => setCurrentStep(6)} className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100">
                      Hostel Photos: {missingPhotoMessages.hostelPhotos.join(', ')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container with Sidebar Layout */}
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 flex-1 flex flex-col md:flex-row gap-8">

        {/* LEFT SIDEBAR: SETUP WIZARD PROGRESS */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Setup Wizard
              </h2>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {currentStep + 1} / {steps.length} Steps ({calculatedProgress}%)
              </p>

              {/* Progress bar line */}
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${calculatedProgress}%` }}
                />
              </div>
            </div>

            {/* Step Navigation Item List */}
            <nav className="space-y-1">
              {steps.map((step, idx) => {
                const StepIcon = step.icon;
                const isActive = currentStep === idx;
                const isVisited = visitedSteps.includes(idx);
                const isCompleted = completedSteps.includes(idx);
                const isValid = isStepValid(idx);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleStepClick(idx)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-semibold'
                        : isVisited
                        ? 'text-slate-700 hover:bg-slate-50'
                        : 'text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <StepIcon
                      className={`h-4 w-4 shrink-0 ${
                        isActive
                          ? 'text-blue-600'
                          : isVisited
                          ? isCompleted
                            ? 'text-slate-600'
                            : 'text-red-500'
                          : 'text-slate-400'
                      }`}
                    />

                    <span className="truncate">{step.label}</span>

                    {/* Step Icon Validation Logic */}
                    {isVisited && (
                      isCompleted ? (
                        <CheckCircle className="ml-auto h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      ) : (
                        <XCircle className="ml-auto h-3.5 w-3.5 shrink-0 text-red-500" />
                      )
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1 flex flex-col justify-between space-y-6 min-w-0">

          {/* Form Body Area */}
          <div className="flex-1">

            {/* =====================================================
                STEP 0: BASIC INFO
            ===================================================== */}

            {currentStep === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Step 1: Basic Information
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Provide initial details about your property and management.
                  </p>
                </div>

                <div className="space-y-4">

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Hostel Name <span className='text-red-500'>*</span>
                    </label>

                    <input
                      type="text"
                      name="hostelName"
                      value={formData.hostelName}
                      onChange={handleChange}
                      placeholder="e.g., Green Valley PG & Hostel"
                      className="w-full rounded-md border border-slate-200 p-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Hostel Type <span className='text-red-500'>*</span>
                    </label>

                    <div className="flex gap-3">

                      {hostelTypes.map((type) => (

                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              hostelType: type,
                            }))
                          }
                          className={`rounded-lg px-4 py-2 text-xs font-semibold border transition ${
                            formData.hostelType === type
                              ? 'border-blue-600 bg-blue-50 text-blue-600'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {type}
                        </button>

                      ))}

                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Owner / Manager Name <span className='text-red-500'>*</span>
                      </label>

                      <input
                        type="text"
                        name="ownerName"
                        value={formData.ownerName}
                        readOnly
                        placeholder="e.g., John Doe"
                        className="w-full rounded-md border border-slate-200 p-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />

                    </div>

                    <div>

                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Contact Phone Number <span className="text-red-500">*</span>
                      </label>

                      {/* Owner can freely enter/edit the phone number for this hostel. */}
                      <input
                        type="tel"
                        inputMode="numeric"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => {
                          const onlyNums = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);

                          setFormData((prev) => ({
                            ...prev,
                            phoneNumber: onlyNums,
                          }));
                        }}
                        required
                        pattern="[0-9]{10}"
                        maxLength={10}
                        title="Please enter a valid 10-digit phone number"
                        placeholder="9876543210"
                        className="w-full rounded-md border border-slate-200 p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />

                      <p className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-slate-400">
                        <ShieldCheck className="h-3 w-3" />
                        Enter the contact phone number for this hostel.
                      </p>

                    </div>

                  </div>

                  <div>

                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Description (Optional)
                    </label>

                    <textarea
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your property, nearby landmarks, or key features..."
                      className="w-full rounded-md border border-slate-200 p-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />

                  </div>

                </div>

              </div>
            )}

            {/* =====================================================
                STEP 1: LOCATION
            ===================================================== */}

            {currentStep === 1 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-8">

                <div className="space-y-4">

                  <div>

                    <h2 className="text-base font-bold text-slate-900">
                      Location Details
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Enter the hostel location manually. Coordinates are used only
                      to calculate distances to nearby transport facilities.
                    </p>

                  </div>

                  <div>

                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      State <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">

                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full appearance-none rounded-lg border border-slate-200 bg-white p-2.5 pr-8 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >

                        <option value="" disabled hidden>
                          Select State
                        </option>

                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                        <option value="Assam">Assam</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Chhattisgarh">Chhattisgarh</option>
                        <option value="Goa">Goa</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Manipur">Manipur</option>
                        <option value="Meghalaya">Meghalaya</option>
                        <option value="Mizoram">Mizoram</option>
                        <option value="Nagaland">Nagaland</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Sikkim">Sikkim</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Tripura">Tripura</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="West Bengal">West Bengal</option>

                      </select>

                      <div className="pointer-events-none absolute right-3 top-3 text-slate-400">
                        <svg
                          className="h-4 w-4 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>

                    </div>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div>

                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input 
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full appearance-none rounded-lg border border-slate-200 bg-white p-2.5 pr-8 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      
                    </div>

                    <div>

                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Area / Locality <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="text"
                        name="area"
                        value={formData.area}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Madhapur"
                        className="w-full rounded-lg border border-slate-200 p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />

                    </div>

                  </div>

                </div>

                <div className="space-y-4">

                  <h2 className="text-base font-bold text-slate-900">
                    Address Details
                  </h2>

                  <div>

                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Street Address <span className="text-red-500">*</span>
                    </label>

                    <textarea
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="House/Flat No., Building Name, Street Name"
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    />

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div>

                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Landmark <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="text"
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Near Cyber Towers"
                        className="w-full rounded-lg border border-slate-200 p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />

                    </div>

                    <div>

                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Pincode <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                        pattern="[0-9]{6}"
                        title="Please enter a valid 6-digit pincode"
                        placeholder="e.g. 500081"
                        maxLength={6}
                        className="w-full rounded-lg border border-slate-200 p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />

                    </div>

                  </div>

                </div>

                <div className="space-y-4">

                  <div>

                    <h2 className="text-base font-bold text-slate-900">
                      Hostel Coordinates
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Coordinates are calculated from the hostel address entered above,
                      not from your current location. Make sure the hostel address,
                      city and pincode are correct.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={handleGetCoordinates}
                    disabled={locationFinding}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-white transition ${
                      locationFinding
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    <Locate className="h-4 w-4" />
                    {locationFinding
                      ? "Finding Hostel Location..."
                      : "Find Hostel Location"}
                  </button>

                  <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                      <div className="text-xs text-blue-800">
                        <p className="font-semibold">
                          How hostel coordinates are determined
                        </p>
                        <p className="mt-1 leading-5">
                          The map uses the hostel address you entered above.
                          It does not use your current device location.
                          After the location is found, verify the marker and
                          move it if necessary.
                        </p>
                      </div>
                    </div>
                  </div>

                  {formData.latitude && formData.longitude && (
                    <>
                      <div className="overflow-hidden rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              Hostel Location Map
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              Drag the marker or click on the map to adjust
                              the hostel location.
                            </p>
                          </div>

                          {locationConfirmed ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                              <Check className="h-3.5 w-3.5" />
                              Confirmed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Verification required
                            </span>
                          )}
                        </div>

                        <MapContainer
                          center={[position.lat, position.lng]}
                          zoom={16}
                          scrollWheelZoom={true}
                          className="h-[360px] w-full"
                          style={{ minHeight: "360px" }}
                        >
                          <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />

                          <HostelMapCenter position={position} />

                          <DraggableHostelMarker
                            position={position}
                            onDragStart={() => {
                              setLocationConfirmed(false);
                              setLocationWasAdjusted(true);
                            }}
                            onPositionChange={reverseGeocodePosition}
                          />

                          <HostelMapClickHandler
                            onPositionChange={reverseGeocodePosition}
                          />
                        </MapContainer>
                      </div>

                      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800">
                              Selected hostel location
                            </p>

                            <p className="mt-1 break-words text-xs text-slate-600">
                              {reverseGeocoding
                                ? "Checking selected map location..."
                                : mapAddressPreview ||
                                  mapLocationName ||
                                  "Location found from the entered hostel address."}
                            </p>

                            {locationWasAdjusted && !reverseGeocoding && (
                              <p className="mt-2 text-[11px] font-medium text-amber-700">
                                The marker was adjusted. Please verify the
                                selected location and confirm it again.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Latitude <span className="text-red-500">*</span>
                          </label>

                          <input
                            type="number"
                            name="latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                            required
                            placeholder="e.g. 17.4483000"
                            step="any"
                            min="-90"
                            max="90"
                            className="w-full rounded-lg border border-slate-200 p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Longitude <span className="text-red-500">*</span>
                          </label>

                          <input
                            type="number"
                            name="longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                            required
                            placeholder="e.g. 78.3915000"
                            step="any"
                            min="-180"
                            max="180"
                            className="w-full rounded-lg border border-slate-200 p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-slate-500">
                          <span className="font-semibold text-slate-700">
                            Coordinates:
                          </span>{" "}
                          {formData.latitude}, {formData.longitude}
                        </div>

                        <button
                          type="button"
                          onClick={handleConfirmLocation}
                          className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition ${
                            locationConfirmed
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "bg-slate-900 text-white hover:bg-slate-800"
                          }`}
                        >
                          <Check className="h-4 w-4" />
                          {locationConfirmed
                            ? "Location Confirmed"
                            : "Confirm Hostel Location"}
                        </button>
                      </div>

                      {locationConfirmed && (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                            <div>
                              <p className="text-xs font-semibold text-green-800">
                                Hostel location confirmed successfully
                              </p>

                              <p className="mt-1 text-xs text-green-700">
                                Latitude: {formData.latitude}
                              </p>

                              <p className="text-xs text-green-700">
                                Longitude: {formData.longitude}
                              </p>

                              <p className="mt-1 text-[11px] text-green-700">
                                These coordinates will be used for nearby
                                hostel, metro, office and radius-based
                                recommendations.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                </div>

              </div>
            )}

            {/* =====================================================
                STEP 2: AMENITIES
            ===================================================== */}

            {currentStep === 2 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-7">

                <div>

                  <h2 className="text-xl font-bold text-slate-900">
                    Step 3: Amenities & Facilities
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Select the amenities available at your property. Photos are required to verify listed facilities.
                  </p>

                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                    <div className="text-sm font-semibold text-slate-800">
                      Verification Progress
                    </div>

                    <div className="text-xs text-slate-500">
                      {formData.selectedAmenities.length} amenities selected • {completedRequiredPhotos}/{requiredSelectedAmenities.length} photos added
                      {remainingRequiredPhotos > 0
                        ? ` • ${remainingRequiredPhotos} remaining`
                        : ''}
                    </div>

                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">

                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-300"
                      style={{
                        width: `${verificationProgress}%`
                      }}
                    />

                  </div>

                  <div className="mt-3 flex items-start gap-2 text-[11px] text-slate-500">

                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                    <span>
                      Photos help us verify the facilities listed at your property.
                      Uploaded photos may be reviewed by our admin team.
                    </span>

                  </div>

                </div>

                <div className="space-y-8">

                  {amenityCategories.map((cat) => (

                    <div key={cat.title}>

                      <div className="mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">

                        <cat.icon className="h-4 w-4 text-blue-600" />

                        <h3 className="text-sm font-bold text-slate-800">
                          {cat.title}
                        </h3>

                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">

                        {cat.items.map((item) => {

                          const isSelected =
                            formData.selectedAmenities.includes(item.id);

                          const photo =
                            amenityPhotos[item.id];

                          const isRejected =
                            photo?.status === 'REJECTED';

                          return (

                            <div
                              key={item.id}
                              className={`relative rounded-xl border transition-all ${
                                isRejected
                                  ? 'border-red-400 bg-red-50'
                                  : isSelected
                                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >

                              <button
                                type="button"
                                onClick={() =>
                                  toggleAmenity(item.id)
                                }
                                className="flex min-h-112px w-full flex-col items-center justify-center px-4 pb-3 pt-4 text-center"
                              >

                                <span
                                  className={`absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full border ${
                                    isSelected
                                      ? 'border-blue-600 bg-blue-600 text-white'
                                      : 'border-slate-300 bg-white text-transparent'
                                  }`}
                                >

                                  <Check className="h-2.5 w-2.5 stroke-3" />

                                </span>

                                <item.Icon
                                  className={`h-6 w-6 ${
                                    isSelected
                                      ? 'text-blue-600'
                                      : 'text-slate-600'
                                  }`}
                                />

                                <span
                                  className={`mt-2 text-xs font-semibold ${
                                    isSelected
                                      ? 'text-blue-700'
                                      : 'text-slate-700'
                                  }`}
                                >
                                  {item.label}
                                </span>

                              </button>

                              {isSelected &&
                                item.photoRequired &&
                                photo?.loadFailed && (

                                  <div className="mx-3 mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                    <div className="flex items-start gap-2">
                                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                      <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-bold text-amber-900">Photo unavailable</p>
                                        <p className="mt-1 text-[9px] leading-4 text-amber-800">
                                          This previously uploaded image could not be loaded. Re-upload it and save this step.
                                        </p>
                                        <button
                                          type="button"
                                          onClick={() => setPhotoModalAmenity(item)}
                                          className="mt-2 inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-[9px] font-semibold text-white hover:bg-blue-700"
                                        >
                                          <RotateCcw className="h-3 w-3" />
                                          Re-upload
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                )}

                              {isSelected &&
                                item.photoRequired &&
                                !photo && (

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPhotoModalAmenity(item)
                                    }
                                    className="mb-3 mx-auto flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm transition hover:bg-blue-700"
                                  >

                                    <Camera className="h-3 w-3" />

                                    {missingPhotoMessages.amenities.includes(item.label)
                                      ? 'Re-upload'
                                      : 'Add Photo'}

                                  </button>

                                )}

                              {isSelected &&
                                photo?.previewUrl && !photo?.loadFailed && (

                                  <div className="px-3 pb-3">

                                    <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white">

                                      <img
                                        src={photo.previewUrl}
                                        alt={`${item.label} verification`}
                                        className="h-24 w-full object-cover"
                                        onError={() => handlePersistedAmenityImageError(item.id, item.label)}
                                      />

                                    </div>

                                    <div className="mt-2 flex items-center justify-between gap-2">

                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPhotoModalAmenity(item)
                                        }
                                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-700"
                                      >

                                        <RotateCcw className="h-3 w-3" />

                                        Replace

                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeAmenityPhoto(item.id)
                                        }
                                        className="text-[10px] font-medium text-slate-400 hover:text-red-500"
                                      >
                                        Remove
                                      </button>

                                    </div>

                                  </div>

                                )}

                            </div>

                          );

                        })}

                      </div>

                    </div>

                  ))}

                </div>

                {remainingRequiredPhotos > 0 ? (

                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">

                    <div className="flex items-start gap-2">

                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                      <div>

                        <p className="text-xs font-semibold text-amber-800">
                          {remainingRequiredPhotos} photo
                          {remainingRequiredPhotos > 1 ? 's' : ''}
                          {' '}still required
                        </p>

                      </div>

                    </div>

                  </div>

                ) : (

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">

                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">

                      <CheckCircle className="h-4 w-4" />

                      All required amenity photos added.

                    </div>

                  </div>

                )}

                <input
                  key={`upload-${photoInputKey}`}
                  ref={photoUploadInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoInputChange}
                />

              </div>
            )}

            {/* AMENITY PHOTO MODAL */}
            {currentStep === 2 &&
              photoModalAmenity &&
              !cameraOpen && (

                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-[1px]"
                  onMouseDown={(e) => {
                    if (e.target === e.currentTarget) {
                      setPhotoModalAmenity(null);
                    }
                  }}
                >

                  <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex items-center gap-2">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">

                          <ImageIcon className="h-5 w-5" />

                        </div>

                        <div>

                          <h3 className="text-base font-bold text-slate-900">
                            Add Photo — {photoModalAmenity.label}
                          </h3>

                          <p className="mt-0.5 text-[11px] text-slate-500">
                            Photo required for admin verification
                          </p>

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setPhotoModalAmenity(null)
                        }
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      >

                        <X className="h-5 w-5" />

                      </button>

                    </div>

                    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/60 p-4">

                      <p className="text-xs font-medium leading-5 text-slate-600">
                        Add a clear photo showing the complete amenity.
                        The image will remain pending until reviewed by
                        an admin.
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-3">

                        <button
                          type="button"
                          onClick={() =>
                            openPhotoPicker(
                              "camera",
                              photoModalAmenity
                            )
                          }
                          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-5 text-xs font-semibold text-blue-700 transition hover:border-blue-400 hover:bg-blue-50"
                        >

                          <Camera className="h-6 w-6" />

                          <span>
                            Capture Photo
                          </span>

                          <span className="text-[9px] font-normal text-blue-500">
                            Use camera
                          </span>

                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openPhotoPicker(
                              "upload",
                              photoModalAmenity
                            )
                          }
                          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >

                          <Upload className="h-6 w-6" />

                          <span>
                            Upload from Device
                          </span>

                          <span className="text-[9px] font-normal text-slate-400">
                            Choose existing photo
                          </span>

                        </button>

                      </div>

                    </div>

                    <div className="mt-4 flex justify-end">

                      <button
                        type="button"
                        onClick={() =>
                          setPhotoModalAmenity(null)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Cancel
                      </button>

                    </div>

                  </div>

                </div>

              )}

            {/* AMENITY CAMERA */}
            {currentStep === 2 &&
              cameraOpen &&
              photoModalAmenity && (

                <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">

                  <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

                      <div>

                        <h3 className="text-base font-bold text-slate-900">
                          Capture Photo
                        </h3>

                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {photoModalAmenity.label}
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={closeCamera}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                      >

                        <X className="h-5 w-5" />

                      </button>

                    </div>

                    <div className="bg-black">

                      <div className="relative aspect-4/3 w-full overflow-hidden">

                        <video
                          ref={cameraVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="h-full w-full object-cover"
                        />

                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

                          <div className="h-[70%] w-[78%] rounded-2xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.20)]" />

                        </div>

                      </div>

                    </div>

                    <div className="flex items-center justify-between gap-3 px-5 py-4">

                      <button
                        type="button"
                        onClick={closeCamera}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={captureCameraPhoto}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
                      >

                        <Camera className="h-4 w-4" />

                        Capture Photo

                      </button>

                    </div>

                  </div>

                </div>

              )}

            {/* =====================================================
                STEP 3: ROOMS
            ===================================================== */}

            {currentStep === 3 && (

              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

                <div className="mb-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Step 4: Room Details
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Select the room sharing types available at your hostel, then choose AC, Non-AC, or both for each sharing type.
                      </p>
                    </div>

                    {getSelectedRoomConfigurations().length > 0 && (
                      <div className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700">
                        {getSelectedRoomConfigurations().length}
                        {' '}
                        {getSelectedRoomConfigurations().length === 1
                          ? 'room configuration'
                          : 'room configurations'} selected
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">
                      Select all available room types and cooling types
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-slate-500">
                      For each sharing type, select AC, Non-AC, or both. Each selected configuration has its own photos and monthly rent per bed.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {roomTypes.map((room) => {
                    const isSelected =
                      formData.selectedRoomTypes.includes(room.id);
                    const selectedCoolingTypes =
                      formData.roomCoolingTypes?.[room.id] || [];
                    const RoomIcon = room.icon;

                    return (
                      <div
                        key={room.id}
                        className={`overflow-hidden rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/30 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleRoomType(room.id)}
                          className="flex w-full items-center gap-4 px-5 py-4 text-left"
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-300 bg-white text-transparent'
                            }`}
                          >
                            <Check className="h-3.5 w-3.5 stroke-3" />
                          </span>

                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                              isSelected
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <RoomIcon className="h-5 w-5" />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span
                              className={`block text-sm font-bold ${
                                isSelected
                                  ? 'text-blue-700'
                                  : 'text-slate-800'
                              }`}
                            >
                              {room.title}
                            </span>
                            <span className="mt-0.5 block text-[11px] text-slate-500">
                              {room.description}
                            </span>
                          </span>

                          <span
                            className={`hidden sm:block text-[10px] font-semibold ${
                              isSelected
                                ? 'text-blue-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </span>
                        </button>

                        {isSelected && (
                          <div className="border-t border-blue-100 bg-white px-5 py-5">
                            <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                  <h3 className="text-xs font-bold text-slate-800">
                                    Cooling Type
                                  </h3>
                                  <p className="mt-0.5 text-[10px] text-slate-500">
                                    Select AC, Non-AC, or both.
                                  </p>
                                </div>

                                {selectedCoolingTypes.length === 0 && (
                                  <span className="text-[10px] font-semibold text-amber-600">
                                    Select at least one
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {['AC', 'NON_AC'].map((coolingType) => {
                                  const checked = selectedCoolingTypes.includes(
                                    coolingType
                                  );

                                  return (
                                    <label
                                      key={coolingType}
                                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition ${
                                        checked
                                          ? 'border-blue-400 bg-blue-50 text-blue-700'
                                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() =>
                                          toggleRoomCoolingType(
                                            room.id,
                                            coolingType
                                          )
                                        }
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-xs font-bold">
                                        {getCoolingTypeLabel(coolingType)}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="space-y-6">
                              {selectedCoolingTypes.map((coolingType) => {
                                const configurationKey =
                                  getRoomConfigurationKey(
                                    room.id,
                                    coolingType
                                  );
                                const configuration = {
                                  ...room,
                                  id: configurationKey,
                                  baseRoomId: room.id,
                                  coolingType,
                                  title: `${room.title} — ${getCoolingTypeLabel(coolingType)}`,
                                };
                                const photos =
                                  getRoomPhotos(configurationKey);
                                const price =
                                  formData.roomPricing[configurationKey] || '';

                                return (
                                  <div
                                    key={configurationKey}
                                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                                  >
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                      <div>
                                        <h3 className="text-sm font-bold text-slate-900">
                                          {room.title} — {getCoolingTypeLabel(coolingType)}
                                        </h3>
                                        <p className="mt-0.5 text-[10px] text-slate-500">
                                          Add 1–3 clear photos and enter the monthly rent per bed for this configuration.
                                        </p>
                                      </div>
                                      <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-bold text-blue-700">
                                        {getCoolingTypeLabel(coolingType)}
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                      <div>
                                        <div className="mb-3 flex items-center justify-between">
                                          <div>
                                            <h4 className="text-xs font-bold text-slate-800">
                                              Room Photos
                                              <span className="ml-1 text-red-500">*</span>
                                            </h4>
                                            <p className="mt-0.5 text-[10px] text-slate-500">
                                              Add 1–3 clear photos of this {getCoolingTypeLabel(coolingType).toLowerCase()} room.
                                            </p>
                                          </div>
                                          <span className="text-[10px] font-medium text-slate-400">
                                            {photos.length}/3
                                          </span>
                                        </div>

                                        {photos.length > 0 && (
                                          <div className="mb-3 grid grid-cols-3 gap-2">
                                            {photos.map((photo, index) => (
                                              <div
                                                key={`${configurationKey}-${index}`}
                                                className={`group relative aspect-4/3 overflow-hidden rounded-lg border ${
                                                  photo.loadFailed
                                                    ? 'border-amber-300 bg-amber-50'
                                                    : 'border-slate-200 bg-slate-100'
                                                }`}
                                              >
                                                {photo.loadFailed ? (
                                                  <div className="flex h-full flex-col items-center justify-center px-2 text-center">
                                                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                                                    <p className="mt-1 text-[9px] font-bold text-amber-800">
                                                      Photo unavailable
                                                    </p>
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        openRoomPhotoPicker(
                                                          configuration,
                                                          'upload',
                                                          index
                                                        )
                                                      }
                                                      className="mt-1 rounded bg-amber-100 px-2 py-1 text-[8px] font-bold text-amber-800 hover:bg-amber-200"
                                                    >
                                                      Re-upload
                                                    </button>
                                                  </div>
                                                ) : (
                                                  <img
                                                    src={photo.previewUrl}
                                                    alt={`${configuration.title} ${index + 1}`}
                                                    className="h-full w-full object-cover"
                                                    onError={() =>
                                                      handlePersistedRoomImageError(
                                                        configuration.id,
                                                        index,
                                                        configuration.title
                                                      )
                                                    }
                                                  />
                                                )}

                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    removeRoomPhoto(
                                                      configuration.id,
                                                      index
                                                    )
                                                  }
                                                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/70 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-600"
                                                  aria-label="Remove photo"
                                                >
                                                  <X className="h-3.5 w-3.5" />
                                                </button>

                                                {index === 0 && (
                                                  <span className="absolute bottom-1 left-1 rounded bg-slate-900/70 px-1.5 py-0.5 text-[8px] font-semibold text-white">
                                                    Main
                                                  </span>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {photos.length < 3 && (
                                          <div className="grid grid-cols-2 gap-2">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                openRoomPhotoPicker(
                                                  configuration,
                                                  'camera'
                                                )
                                              }
                                              className="flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-[11px] font-semibold text-blue-700 transition hover:border-blue-400 hover:bg-blue-100"
                                            >
                                              <Camera className="h-4 w-4" />
                                              Capture Photo
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() =>
                                                openRoomPhotoPicker(
                                                  configuration,
                                                  'upload'
                                                )
                                              }
                                              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50"
                                            >
                                              <Upload className="h-4 w-4" />
                                              Upload Photo
                                            </button>
                                          </div>
                                        )}

                                        {photos.length === 0 && (
                                          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-600">
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                            At least one room photo is required.
                                          </div>
                                        )}

                                        {photos.some((photo) => photo?.loadFailed) && (
                                          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-amber-700">
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                            One or more previously uploaded room photos are unavailable. Re-upload them and save this step.
                                          </div>
                                        )}
                                      </div>

                                      <div>
                                        <div className="mb-3">
                                          <h4 className="text-xs font-bold text-slate-800">
                                            Monthly Rent
                                            <span className="ml-1 text-red-500">*</span>
                                          </h4>
                                          <p className="mt-0.5 text-[10px] text-slate-500">
                                            Enter monthly rent per bed.
                                          </p>
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                          <label className="mb-2 block text-[10px] font-semibold text-slate-600">
                                            Monthly Rent per Bed
                                          </label>

                                          <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                                              ₹
                                            </span>
                                            <input
                                              type="text"
                                              inputMode="numeric"
                                              value={price}
                                              onChange={(e) =>
                                                handleRoomPriceChange(
                                                  configurationKey,
                                                  e.target.value
                                                )
                                              }
                                              placeholder="e.g. 12000"
                                              className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-8 pr-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />
                                          </div>

                                          {!price && (
                                            <p className="mt-2 text-[10px] text-amber-600">
                                              Monthly rent is required.
                                            </p>
                                          )}

                                          {price && (
                                            <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2">
                                              <span className="text-[10px] text-slate-500">
                                                Monthly rent
                                              </span>
                                              <span className="text-xs font-bold text-slate-800">
                                                ₹{Number(price).toLocaleString('en-IN')}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <input
                  key={`room-upload-${roomPhotoInputKey}`}
                  ref={roomPhotoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleRoomPhotoInputChange}
                />
              </div>
            )}

            {/* ROOM PHOTO CAMERA MODAL */}
            {currentStep === 3 &&
              roomCameraOpen &&
              roomPhotoModal && (

                <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">

                  <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">

                          <Camera className="h-5 w-5" />

                        </div>

                        <div>

                          <h3 className="text-base font-bold text-slate-900">
                            Capture Room Photo
                          </h3>

                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {roomPhotoModal.title}
                          </p>

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={closeRoomCamera}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      >

                        <X className="h-5 w-5" />

                      </button>

                    </div>

                    <div className="bg-black">

                      <div className="relative aspect-4/3 w-full overflow-hidden">

                        <video
                          ref={roomCameraVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="h-full w-full object-cover"
                        />

                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

                          <div className="h-[70%] w-[78%] rounded-2xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.20)]" />

                        </div>

                      </div>

                    </div>

                    <div className="flex items-center justify-between gap-3 px-5 py-4">

                      <button
                        type="button"
                        onClick={closeRoomCamera}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={captureRoomCameraPhoto}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                      >

                        <Camera className="h-4 w-4" />

                        Capture Photo

                      </button>

                    </div>

                  </div>

                </div>

              )}

            {/* =====================================================
                STEP 4: RULES
            ===================================================== */}

            {currentStep === 4 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-8">

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Step 5: Hostel Rules & Policy
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Define the guidelines for guests staying at your property.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-10 md:grid-cols-2">

                  <div>
                    <h3 className="mb-6 text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
                      General Rules
                    </h3>

                    <div className="space-y-4">
                      {[
                        { id: 'noSmoking', label: 'No Smoking' },
                        { id: 'noAlcohol', label: 'No Alcohol' },
                        { id: 'noPets', label: 'No Pets' },
                        { id: 'visitorsAllowed', label: 'Visitors Allowed' },
                        { id: 'curfew10pm', label: '10 PM Curfew' },
                      ].map((rule) => {
                        const isChecked = formData.generalRules[rule.id];

                        return (
                          <label
                            key={rule.id}
                            className="flex cursor-pointer items-center gap-3 text-sm text-slate-700 select-none hover:text-slate-900"
                          >
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded transition ${
                                isChecked
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-slate-300 bg-white text-transparent'
                              }`}
                            >
                              <Check className="h-3.5 w-3.5 stroke-3" />
                            </div>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleGeneralRule(rule.id)}
                              className="sr-only"
                            />
                            <span className="text-sm font-medium text-slate-700">
                              {rule.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
                        Additional Rules & Policies
                      </h3>
                      <p className="mb-3 text-xs text-slate-500">
                        Add any other rules or policies...
                      </p>

                      <div className="relative">
                        <textarea
                          name="customRules"
                          rows={6}
                          maxLength={750}
                          value={formData.customRules || ''}
                          onChange={handleChange}
                          placeholder="Enter additional rules..."
                          className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        />
                        <div className="mt-1 text-right text-xs text-slate-400">
                          {formData.customRules?.length || 0} / 750
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-100/70 p-5 space-y-3">
                      <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                        <Lightbulb className="h-4 w-4" />
                        <span>Examples</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pl-1">
                        <li>Valid ID requirements</li>
                        <li>Visitor restrictions</li>
                        <li>Quiet hours</li>
                        <li>Parking restrictions</li>
                      </ul>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* =====================================================
                STEP 5: DEPOSITS
            ===================================================== */}

            {currentStep === 5 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Step 6: Deposit Policies
                  </h2>
                </div>

                <div className="space-y-4">

                  <label className="block text-base font-semibold text-slate-600">
                    Refund Policy
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <p className='mt-1 text-xs text-slate-500'>
                    Define how much of the advance deposit will be refunded if a guest cancels, does not join, or checks out early.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {[
                      {
                        id: "Flexible",
                        label: "Flexible",
                        desc: "Full refund according to the hostel's cancellation terms.",
                      },
                      {
                        id: "Moderate",
                        label: "Moderate",
                        desc: "Partial refund according to the hostel's cancellation terms.",
                      },
                      {
                        id: "Strict",
                        label: "Strict",
                        desc: "Advance deposit is non-refundable according to the hostel's cancellation terms.",
                      },
                    ].map((policy) => {

                      const isSelected =
                        formData.cancellationPolicy === policy.id;

                      return (
                        <div
                          key={policy.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              cancellationPolicy:
                                isSelected ? "" : policy.id,
                            }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setFormData((prev) => ({
                                ...prev,
                                cancellationPolicy:
                                  isSelected ? "" : policy.id,
                              }));
                            }
                          }}
                          className={`cursor-pointer rounded-xl border p-4 transition-all ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div>
                              <div className="font-bold text-sm text-slate-800">
                                {policy.label}
                              </div>

                              <div className="text-xs text-slate-500 mt-1">
                                {policy.desc}
                              </div>
                            </div>

                            <div
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                isSelected
                                  ? "border-blue-600 bg-blue-600"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {isSelected && (
                                <div className="h-2 w-2 rounded-full bg-white" />
                              )}
                            </div>

                          </div>

                        </div>
                      );
                    })}

                  </div>

                  {!formData.cancellationPolicy && (
                    <p className="text-xs font-medium text-red-500">
                      Please select a cancellation policy.
                    </p>
                  )}

                </div>

              </div>
            )}

            {/* =====================================================
                STEP 6: PHOTOS
            ===================================================== */}

            {currentStep === 6 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-7">

                {/* HEADER */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Step 7: Photos Upload
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Upload a cover image and choose the additional photos you want to add to your hostel listing.
                  </p>
                </div>

                {/* MAIN COVER IMAGE */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Main Cover Image <span className="text-red-500">*</span>
                  </label>

                  <p className="text-xs text-slate-400 mb-3">
                    Upload a clear photo of the hostel building entrance or front view.
                  </p>

                  {formData.coverImage?.previewUrl ? (
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 max-w-xl">
                      <img
                        src={formData.coverImage.previewUrl}
                        alt="Hostel building entrance"
                        className="h-64 w-full object-cover"
                        onError={handlePersistedCoverImageError}
                      />

                      <button
                        type="button"
                        onClick={removeCoverImage}
                        className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition"
                        aria-label="Remove cover image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : formData.coverImage?.loadFailed ? (
                    <div className="max-w-xl rounded-2xl border-2 border-amber-300 bg-amber-50 p-8">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-amber-900">Main cover photo is unavailable</p>
                          <p className="mt-1 text-xs leading-5 text-amber-800">
                            This photo was uploaded earlier, but the saved image could not be loaded. Re-upload it and save this step.
                          </p>
                          <div className="mt-4 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => coverImageInputRef.current?.click()}
                              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                            >
                              Re-upload cover photo
                            </button>
                            <button
                              type="button"
                              onClick={() => openPropertyPhotoCamera("cover")}
                              className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                            >
                              <Camera className="h-4 w-4" />
                              Camera
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50/80 transition max-w-xl">
                      <div className="mb-3 text-slate-400">
                        <ImageIcon className="h-8 w-8 stroke-[1.5]" />
                      </div>

                      <p className="text-sm font-semibold text-slate-800 mb-1">
                        {missingPhotoMessages.hostelPhotos.includes("Main cover photo")
                          ? "Main cover photo needs to be re-uploaded"
                          : "Click to upload main cover image"}
                      </p>

                      <p className="text-xs text-slate-400 mb-4">
                        Hostel building entrance photo recommended (16:9)
                      </p>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => coverImageInputRef.current?.click()}
                          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                        >
                          {missingPhotoMessages.hostelPhotos.includes("Main cover photo")
                            ? "Re-upload cover photo"
                            : "Browse Files"}
                        </button>

                        <button
                          type="button"
                          onClick={() => openPropertyPhotoCamera("cover")}
                          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                        >
                          <Camera className="h-4 w-4" />
                          Take Photo
                        </button>
                      </div>
                    </div>
                  )}

                  <input
                    ref={coverImageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleCoverImageChange}
                  />

                  <input
                    ref={coverCameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleCoverCameraChange}
                  />
                </div>

                {/* DIVIDER */}
                <div className="border-t border-slate-100" />

                {/* ADDITIONAL HOSTEL PHOTOS */}
                <div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="block text-sm font-semibold text-slate-700">
                          Additional Hostel Photos
                        </label>

                        <span className="text-sm font-normal text-slate-400">
                          (Optional)
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        Select the photo slots you want to add. You can select up to 4 photos.
                      </p>
                    </div>

                    <span className="shrink-0 text-xs font-semibold text-slate-500">
                      {formData.additionalPhotos.filter((photo) => photo?.selected).length} / 4 selected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[0, 1, 2, 3].map((slotIndex) => {
                      const photo = formData.additionalPhotos[slotIndex] || {
                        slotIndex,
                        selected: false,
                        file: null,
                        previewUrl: null,
                      };

                      const isSelected = Boolean(photo.selected);
                      const hasPhoto = Boolean(photo.previewUrl);

                      return (
                        <div
                          key={slotIndex}
                          className={`relative overflow-hidden rounded-2xl border-2 transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-50/30 shadow-sm"
                              : "border-slate-200 bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          {/* CHECKBOX */}
                          <button
                            type="button"
                            onClick={() => toggleAdditionalPhotoSlot(slotIndex)}
                            className="absolute left-3 top-3 z-20 flex items-center gap-2"
                            aria-pressed={isSelected}
                            aria-label={`Select Photo ${slotIndex + 1}`}
                          >
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${
                                isSelected
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-slate-300 bg-white text-transparent hover:border-blue-400"
                              }`}
                            >
                              <Check className="h-4 w-4 stroke-3" />
                            </span>
                          </button>

                          {/* PHOTO CONTENT */}
                          <div className="aspect-4/3 w-full">
                            {hasPhoto ? (
                              <div className="relative h-full w-full group">
                                <img
                                  src={photo.previewUrl}
                                  alt={`Additional Hostel Photo ${slotIndex + 1}`}
                                  className="h-full w-full object-cover"
                                  onError={() => handlePersistedAdditionalPhotoError(slotIndex)}
                                />

                                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to from-black/70 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => openAdditionalPhotoUpload(slotIndex)}
                                    className="rounded-md bg-white/95 px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-white"
                                  >
                                    Replace
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => removeAdditionalPhoto(slotIndex)}
                                    className="flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-red-700"
                                  >
                                    <X className="h-3 w-3" />
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : photo.loadFailed ? (
                              <div className="flex h-full flex-col items-center justify-center px-3 pt-8 text-center">
                                <AlertTriangle className="h-7 w-7 text-amber-500" />
                                <p className="mt-2 text-xs font-bold text-amber-800">
                                  Photo {slotIndex + 1} unavailable
                                </p>
                                <p className="mt-1 px-2 text-[10px] leading-4 text-amber-700">
                                  This previously uploaded image could not be loaded. Re-upload it and save this step.
                                </p>
                                <div className="mt-4 flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openAdditionalPhotoUpload(slotIndex)}
                                    className="rounded-md bg-blue-600 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-blue-700"
                                  >
                                    Re-upload
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openPropertyPhotoCamera("additional", slotIndex)}
                                    className="flex items-center gap-1 rounded-md border border-blue-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-blue-700 hover:bg-blue-50"
                                  >
                                    <Camera className="h-3 w-3" />
                                    Camera
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex h-full flex-col items-center justify-center px-3 pt-8 text-center">
                                <Plus className="h-7 w-7 text-slate-400" />

                                <p className="mt-2 text-xs font-semibold text-slate-600">
                                  Photo {slotIndex + 1}
                                </p>

                                <p className="mt-1 text-[10px] text-slate-400">
                                  {isSelected ? "Selected — add your photo" : "Select this box to add"}
                                </p>

                                <div className="mt-4 flex gap-2">
                                  <button
                                    type="button"
                                    disabled={!isSelected}
                                    onClick={() => openAdditionalPhotoUpload(slotIndex)}
                                    className={`rounded-md border px-3 py-1.5 text-[10px] font-semibold transition ${
                                      isSelected
                                        ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                        : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300"
                                    }`}
                                  >
                                    Upload
                                  </button>

                                  <button
                                    type="button"
                                    disabled={!isSelected}
                                    onClick={() => openPropertyPhotoCamera("additional", slotIndex)}
                                    className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-[10px] font-semibold text-white transition ${
                                      isSelected
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : "cursor-not-allowed bg-slate-300"
                                    }`}
                                  >
                                    <Camera className="h-3 w-3" />
                                    Camera
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* SLOT FOOTER */}
                          <div className="border-t border-slate-200 bg-white px-3 py-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-semibold text-slate-600">
                                Photo {slotIndex + 1}
                              </span>

                              <span
                                className={`text-[10px] font-medium ${
                                  hasPhoto
                                    ? "text-emerald-600"
                                    : photo.loadFailed
                                    ? "text-amber-700"
                                    : isSelected
                                    ? "text-blue-600"
                                    : "text-slate-400"
                                }`}
                              >
                                {hasPhoto
                                  ? "Ready"
                                  : photo.loadFailed
                                  ? "Re-upload required"
                                  : isSelected
                                  ? "Selected"
                                  : "Not selected"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* INFORMATION MESSAGE */}
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                      Click the checkbox on each photo slot you want to include. For example, select Photo 1 for one photo, or select Photo 1 and Photo 2 for two photos. Selected slots must have an uploaded or captured image before continuing.
                    </p>
                  </div>

                  <p className="mt-3 text-[11px] text-slate-400">
                    Recommended: rooms, common areas, facilities, dining area, exterior, or other useful hostel spaces.
                  </p>

                  <input
                    ref={additionalPhotosInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAdditionalPhotosChange}
                  />
                </div>

              </div>
            )}

            {cameraOpen && (
              <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 p-4">

                <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

                  {/* HEADER */}
                  <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Take Photo
                      </h3>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Position the hostel photo clearly inside the frame.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={closePropertyCamera}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    >
                      <X className="h-5 w-5" />
                    </button>

                  </div>

                  {/* CAMERA */}
                  <div className="bg-black p-4">

                    <video
                      ref={cameraVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="mx-auto max-h-[65vh] w-full rounded-xl object-contain"
                    />

                  </div>

                  {/* CONTROLS */}
                  <div className="flex items-center justify-center gap-3 px-5 py-5">

                    <button
                      type="button"
                      onClick={closePropertyCamera}
                      className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={captureCameraPhoto}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      <Camera className="h-4 w-4" />
                      Capture Photo
                    </button>

                  </div>

                </div>

              </div>
            )}

            {/* =====================================================
                STEP 7: PREVIEW INFORMATION & SUBMIT
            ===================================================== */}

            {currentStep === 7 && (

              <div className="space-y-6">

                {/* PREVIEW CONTAINER */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                  {/* LEFT SIDE: MAIN COVER IMAGE & GALLERY */}
                  <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">

                    <div>
                      <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-blue-600" />
                        Main Cover Image
                      </h2>
                      <p className="text-xs text-slate-500">
                        Primary image shown to guests on search results.
                      </p>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      {formData.coverImage?.previewUrl ? (
                        <img
                          src={formData.coverImage.previewUrl}
                          alt="Property Cover Preview"
                          className="h-64 w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-50 p-4 text-center">
                          <ImageIcon className="h-10 w-10 mb-2 stroke-[1.5]" />
                          <span className="text-xs font-semibold text-slate-500">No cover image uploaded</span>
                          <span className="text-[10px] text-slate-400 mt-1">Go back to step 7 to add a cover photo</span>
                        </div>
                      )}
                    </div>

                    {/* GALLERY PREVIEW */}
                    {formData.additionalPhotos.filter((photo) => photo?.selected && photo?.previewUrl).length > 0 && (
                      <div className="pt-2">
                        <span className="text-xs font-bold text-slate-700 block mb-2">
                          Additional Gallery ({formData.additionalPhotos.filter((photo) => photo?.selected && photo?.previewUrl).length})
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {formData.additionalPhotos
                            .filter((photo) => photo?.selected && photo?.previewUrl)
                            .map((photo, idx) => (
                              <div key={photo.slotIndex ?? idx} className="aspect-4/3 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                                <img src={photo.previewUrl} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover" />
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* RIGHT SIDE: SUMMARY OF DETAILS */}
                  <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">

                    <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          Property Details Summary
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Review all your submitted details before final submission.
                        </p>
                      </div>
                      <span className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-bold text-blue-600">
                        Preview Mode
                      </span>
                    </div>

                    {/* 1. BASIC INFORMATION */}
                    <div className="space-y-2 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <Info className="h-3.5 w-3.5 text-blue-600" />
                        <span>Basic Information</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                        <div>
                          <span className="text-slate-400 block">Hostel Name</span>
                          <span className="font-semibold text-slate-800">{formData.hostelName || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Type</span>
                          <span className="font-semibold text-slate-800">{formData.hostelType || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Owner / Manager</span>
                          <span className="font-semibold text-slate-800">{formData.ownerName || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Contact Phone</span>
                          <span className="font-semibold text-slate-800">{formData.phoneNumber || "N/A"}</span>
                        </div>
                        {formData.description && (
                          <div className="sm:col-span-2">
                            <span className="text-slate-400 block">Description</span>
                            <span className="font-medium text-slate-700">{formData.description}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 2. LOCATION */}
                    <div className="space-y-2 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <MapPin className="h-3.5 w-3.5 text-blue-600" />
                        <span>Location</span>
                      </div>

                      <div className="text-xs text-slate-700 space-y-1 pt-1">
                        <p className="font-semibold">{formData.address || "N/A"}</p>
                        <p className="text-slate-500">
                          {formData.area ? `${formData.area}, ` : ''}
                          {formData.city ? `${formData.city}, ` : ''}
                          {formData.state ? `${formData.state} ` : ''}
                          {formData.pincode ? `- ${formData.pincode}` : ''}
                        </p>
                        {formData.landmark && (
                          <p className="text-slate-500"><span className="font-medium text-slate-600">Landmark:</span> {formData.landmark}</p>
                        )}
                        {formData.latitude && formData.longitude && (
                          <p className="text-[11px] text-slate-400 pt-0.5">
                            Coordinates: {formData.latitude}, {formData.longitude}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 3. AMENITIES */}
                    <div className="space-y-2 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <Wifi className="h-3.5 w-3.5 text-blue-600" />
                        <span>Selected Amenities ({formData.selectedAmenities.length})</span>
                      </div>

                      {formData.selectedAmenities.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {formData.selectedAmenities.map((amenityId) => {
                            const item = allAmenityItems.find((a) => a.id === amenityId);
                            if (!item) return null;
                            return (
                              <span key={amenityId} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                                <item.Icon className="h-3 w-3 text-blue-600" />
                                {item.label}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No amenities selected</p>
                      )}
                    </div>

                    {/* 4. ROOM TYPES & PRICING */}
                    <div className="space-y-2 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <Bed className="h-3.5 w-3.5 text-blue-600" />
                        <span>Room Configurations & Rent</span>
                      </div>

                      {getSelectedRoomConfigurations().length > 0 ? (
                        <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
                          {getSelectedRoomConfigurations().map((configuration) => {
                            const price = formData.roomPricing[configuration.id];
                            const photoCount = (roomPhotos[configuration.id] || []).length;

                            return (
                              <div
                                key={configuration.id}
                                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-2.5"
                              >
                                <div>
                                  <span className="block text-xs font-bold text-slate-800">
                                    {configuration.title}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {photoCount} photo(s) added
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-blue-600">
                                  {price
                                    ? `₹${Number(price).toLocaleString('en-IN')}/mo`
                                    : 'Price pending'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs italic text-slate-400">
                          No room configurations selected
                        </p>
                      )}
                    </div>

                    {/* 5. RULES & DEPOSIT POLICY */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Rules & Policy
                        </span>
                        <ul className="space-y-1 text-slate-700">
                          <li className={formData.generalRules.noSmoking ? "text-slate-800 font-medium" : "text-slate-400"}>
                            • No Smoking: {formData.generalRules.noSmoking ? "Yes" : "No"}
                          </li>
                          <li className={formData.generalRules.noAlcohol ? "text-slate-800 font-medium" : "text-slate-400"}>
                            • No Alcohol: {formData.generalRules.noAlcohol ? "Yes" : "No"}
                          </li>
                          <li className={formData.generalRules.noPets ? "text-slate-800 font-medium" : "text-slate-400"}>
                            • No Pets: {formData.generalRules.noPets ? "Yes" : "No"}
                          </li>
                          <li className={formData.generalRules.visitorsAllowed ? "text-slate-800 font-medium" : "text-slate-400"}>
                            • Visitors Allowed: {formData.generalRules.visitorsAllowed ? "Yes" : "No"}
                          </li>
                          <li className={formData.generalRules.curfew10pm ? "text-slate-800 font-medium" : "text-slate-400"}>
                            • 10 PM Curfew: {formData.generalRules.curfew10pm ? "Yes" : "No"}
                          </li>
                        </ul>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Deposit Policy
                        </span>
                        <div className="rounded-lg bg-blue-50/60 border border-blue-100 p-3">
                          <span className="font-bold text-blue-800 block text-xs">
                            {formData.cancellationPolicy || "Not specified"}
                          </span>
                          <p className="text-[11px] text-blue-700 mt-0.5">
                            Refund terms applied as selected.
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                {/* DECLARATION CHECKBOX */}
                <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <div
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                        declarationAccepted
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 bg-white text-transparent'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5 stroke-3" />
                    </div>
                    <input
                      type="checkbox"
                      checked={declarationAccepted}
                      onChange={handleDeclarationChange}
                      className="sr-only"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        Owner Declaration
                      </span>
                      <span className="text-xs font-semibold text-slate-700 mt-0.5 block">
                        "The given information so far is valid and No false information."
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1">
                        By checking this box, you certify that all property details, pricing, policies, and uploaded media are accurate and compliant with our host guidelines.
                      </p>
                    </div>
                  </label>
                </div>

              </div>

            )}

          </div>

          {/* Bottom Navigation Controls */}
          <div className="flex items-center justify-between border-t border-slate-200/80 pt-6">

            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 0 || isSubmitting}
              className={`flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 ${
                currentStep === 0 || isSubmitting
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Previous Step
            </button>

            {currentStep === steps.length - 1 ? (

              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-semibold text-white shadow-md transition ${
                  declarationAccepted && !isSubmitting
                    ? 'bg-blue-600 shadow-blue-500/20 hover:bg-blue-700'
                    : 'bg-slate-400 shadow-none cursor-not-allowed opacity-60'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                <Send className="h-3.5 w-3.5" />
              </button>

            ) : (

              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition ${
                  isSubmitting ? 'opacity-60 cursor-not-allowed' : 'bg-blue-600'
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Next Step'}
                <ArrowRight className="h-4 w-4" />
              </button>

            )}

          </div>

        </div>

      </main>

    </div>
  );
};

export default AddHostelDetails;