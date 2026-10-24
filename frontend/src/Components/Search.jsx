
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useSearchParams } from "react-router-dom";

import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  House,
  LogOut,
  MapPin,
  Menu,
  Search as SearchIcon,
  ShieldCheck,
  UserCircle,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  BedDouble,
  AlertTriangle,
  CheckCircle2,
  Users,
  DoorOpen,
  Star,
} from "lucide-react";

import api from "../api/axiosConfig";

/* ===============================================================
   STATIC SEARCH OPTIONS
================================================================ */

const popularSearches = [
  "Hyderabad",
  "Gachibowli",
  "Madhapur",
  "Kondapur",
  "Hitech City",
  "Kukatpally",
];

const cities = ["Hyderabad", "Bengaluru", "Chennai", "Pune", "Mumbai"];

const areas = [
  "Gachibowli",
  "Madhapur",
  "Kondapur",
  "Hitech City",
  "Kukatpally",
  "Banjara Hills",
  "Ameerpet",
];

const initialFilters = {
  city: "",
  area: "",
  near: "",
  nearbyPlace: "",
  nearbyRadiusKm: 2,
  nearbyPlaces: [],
  nearbyMatchMode: "ANY",
  minBudget: 1000,
  maxBudget: 200000,
  roomPreferences: [],
  amenities: [],
  hostelPreference: [],
};

const roomOptions = ["Single", "Double", "Triple", "4+ Sharing"];

const amenityOptions = [
  "Wi-Fi",
  "Food",
  "AC",
  "Laundry",
  "Housekeeping",
  "Parking",
  "Power Backup",
  "Security",
  "Gym",
  "Common Area",
  "Hot Water",
  "CCTV",
];

const hostelPreferenceOptions = ["Boys", "Girls", "Co-living"];

/* ===============================================================
   BACKEND VALUE MAPPINGS
================================================================ */

const ROOM_TYPE_MAP = {
  Single: "SINGLE",
  Double: "DOUBLE",
  Triple: "TRIPLE",
  "4+ Sharing": "QUAD",
};

const HOSTEL_TYPE_MAP = {
  Boys: "BOYS",
  Girls: "GIRLS",
  "Co-living": "CO-LIVING",
};

const AMENITY_CODE_MAP = {
  "Wi-Fi": "wifi",
  Food: "food",
  AC: "ac",
  Laundry: "laundry",
  Housekeeping: "housekeeping",
  Parking: "parking",
  "Power Backup": "power_backup",
  Security: "security",
  Gym: "gym",
  "Common Area": "common_area",
  "Hot Water": "hot_water",
  CCTV: "cctv",
};

/* ===============================================================
   HELPERS
================================================================ */

const formatCurrency = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return number.toLocaleString("en-IN");
};

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

const normalizeNearbyPlaces = (filters) => {
  if (Array.isArray(filters?.nearbyPlaces) && filters.nearbyPlaces.length > 0) {
    return filters.nearbyPlaces
      .map((item, index) => ({
        id: item?.id || `nearby-${index + 1}`,
        place: String(item?.place || "").trim(),
        radiusKm: Number(item?.radiusKm) || Number(filters?.nearbyRadiusKm) || 2,
      }))
      .filter((item) => item.place);
  }

  const legacyPlace = String(filters?.nearbyPlace || "").trim();
  if (!legacyPlace) return [];

  return [
    {
      id: "nearby-1",
      place: legacyPlace,
      radiusKm: Number(filters?.nearbyRadiusKm) || 2,
    },
  ];
};


const getRoomLabel = (roomType) => {
  if (!roomType) return "Room type not specified";
  const normalized = String(roomType).toUpperCase();
  const labels = {
    SINGLE: "Single",
    DOUBLE: "Double",
    TRIPLE: "Triple",
    QUAD: "4+ Sharing",
    FOUR: "4+ Sharing",
    FIVE: "5+ Sharing",
  };
  return labels[normalized] || roomType;
};

const getHostelTypeLabel = (hostelType) => {
  if (!hostelType) return "Hostel";
  const normalized = String(hostelType).toUpperCase().replace(/_/g, "-");
  const labels = {
    BOYS: "Boys",
    GIRLS: "Girls",
    "CO-LIVING": "Co-living",
    COLIVING: "Co-living",
    "CO LIVING": "Co-living",
  };
  return labels[normalized] || hostelType;
};

const normalizeCoverPhotoUrl = (photoUrl) => {
  if (!photoUrl) return null;
  const value = String(photoUrl).trim();
  if (!value) return null;
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }
  if (value.startsWith("/")) return `http://localhost:8080${value}`;
  return `http://localhost:8080/${value}`;
};

const formatAmenityLabel = (amenity) => {
  if (!amenity) return "";
  const value = String(amenity).trim();
  const normalized = value.toLowerCase().replace(/[\s-]+/g, "_");
  const labels = {
    wifi: "Wi-Fi",
    wi_fi: "Wi-Fi",
    food: "Food",
    ac: "AC",
    laundry: "Laundry",
    housekeeping: "Housekeeping",
    parking: "Parking",
    power_backup: "Power Backup",
    security: "Security",
    gym: "Gym",
    common_area: "Common Area",
    hot_water: "Hot Water",
    cctv: "CCTV",
  };
  return labels[normalized] || value;
};

const mapRecommendationToHostel = (item) => {
  const breakdown = item?.matchBreakdown || {};
  const rawScore = item?.matchScore ?? breakdown?.overallScore ?? 0;
  const matchScore = Number(rawScore);

  const amenities = normalizeArray(item?.amenities)
    .map(formatAmenityLabel)
    .filter(Boolean);

  const distance =
    item?.distanceKm === null || item?.distanceKm === undefined
      ? null
      : Number(item.distanceKm);

  return {
    hostelId: item?.hostelId,
    name: item?.hostelName || "Hostel",
    location: item?.address || item?.city || "Location unavailable",
    city: item?.city || "",
    address: item?.address || "",
    rating: null,
    reviews: null,
    price: Number(item?.monthlyRent) || 0,
    roomType: item?.roomType || "",
    roomLabel: getRoomLabel(item?.roomType),
    hostelType: item?.hostelType || "",
    hostelTypeLabel: getHostelTypeLabel(item?.hostelType),
    amenities,
    image: normalizeCoverPhotoUrl(item?.coverPhotoUrl),
    match: Number.isFinite(matchScore)
      ? Math.round(matchScore * 100) / 100
      : 0,
    distanceKm: Number.isFinite(distance) ? distance : null,
    nearbyDistances: [],
    breakdown: {
      budgetScore: Number(breakdown?.budgetScore) || 0,
      locationScore: Number(breakdown?.locationScore) || 0,
      roomScore: Number(breakdown?.roomScore) || 0,
      amenityScore: Number(breakdown?.amenityScore) || 0,
      hostelTypeScore: Number(breakdown?.hostelTypeScore) || 0,
      overallScore: Number(breakdown?.overallScore) || 0,
      summary: breakdown?.summary || "Match based on your preferences",
    },
    roomAvailability: {
      totalRooms: Number(item?.roomAvailability?.totalRooms) || 0,
      occupiedRooms: Number(item?.roomAvailability?.occupiedRooms) || 0,
      availableRooms: Number(item?.roomAvailability?.availableRooms) || 0,
      totalBeds: Number(item?.roomAvailability?.totalBeds) || 0,
      occupiedBeds: Number(item?.roomAvailability?.occupiedBeds) || 0,
      availableBeds: Number(item?.roomAvailability?.availableBeds) || 0,
    },
    issueSummary: {
      totalIssues: Number(item?.issueSummary?.totalIssues) || 0,
      openIssues: Number(item?.issueSummary?.openIssues) || 0,
      resolvedIssues: Number(item?.issueSummary?.resolvedIssues) || 0,
      rejectedIssues: Number(item?.issueSummary?.rejectedIssues) || 0,
      issueHealthScore:
        item?.issueSummary?.issueHealthScore == null
          ? 100
          : Number(item.issueSummary.issueHealthScore),
    },
  };
};

const buildMatchReasons = (hostel) => {
  const reasons = [];
  const {
    budgetScore,
    locationScore,
    roomScore,
    amenityScore,
    hostelTypeScore,
  } = hostel.breakdown;

  if (budgetScore >= 80) reasons.push("Strong budget match");
  else if (budgetScore >= 60) reasons.push("Good budget match");

  if (locationScore >= 90) reasons.push("Excellent location match");
  else if (locationScore >= 70) reasons.push("Good location match");

  if (roomScore >= 90) reasons.push("Preferred room type");

  if (amenityScore >= 90) reasons.push("Required amenities");
  else if (amenityScore >= 60) reasons.push("Several required amenities");

  if (hostelTypeScore >= 90) reasons.push("Preferred hostel type");

  if (hostel.distanceKm !== null) {
    if (hostel.distanceKm <= 1) reasons.push("Very close to your location");
    else if (hostel.distanceKm <= 5)
      reasons.push("Within your preferred distance");
  }

  if (reasons.length === 0) {
    reasons.push(hostel.breakdown.summary || "Matches your search preferences");
  }

  return reasons.slice(0, 4);
};

/* ===============================================================
   GEOCODING
================================================================ */

const geocodeLocation = async ({ city, area }) => {
  const searchText = [area, city].filter(Boolean).join(", ");
  if (!searchText.trim()) return null;

  const params = new URLSearchParams({
    q: searchText,
    format: "json",
    limit: "1",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    { headers: { Accept: "application/json" } }
  );

  if (!response.ok) {
    throw new Error("Unable to determine the selected location.");
  }

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const latitude = Number(data[0]?.lat);
  const longitude = Number(data[0]?.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return { latitude, longitude };
};

const geocodeNearbyPlace = async ({ place, city }) => {
  const searchText = [place, city].filter(Boolean).join(", ");
  if (!searchText.trim()) return null;

  const params = new URLSearchParams({
    q: searchText,
    format: "json",
    limit: "1",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    { headers: { Accept: "application/json" } }
  );

  if (!response.ok) {
    throw new Error("Unable to determine the selected nearby place.");
  }

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const latitude = Number(data[0]?.lat);
  const longitude = Number(data[0]?.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return { latitude, longitude };
};

/* ===============================================================
   SEARCH COMPONENT
================================================================ */

function Search() {
  const [filters, setFilters] = useState(initialFilters);
  const [searchParams] = useSearchParams();

  const homeLocation = searchParams.get("location")?.trim() || "";
  const homeBudget = searchParams.get("budget")?.trim() || "";
  const homeNear = searchParams.get("near")?.trim() || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [showMoreAmenities, setShowMoreAmenities] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState("Recommended");
  const [citySuggestionsOpen, setCitySuggestionsOpen] = useState(false);
  const [areaSuggestionsOpen, setAreaSuggestionsOpen] = useState(false);

  const firstRenderRef = useRef(true);
  const searchRequestIdRef = useRef(0);
  const homeSearchInitializedRef = useRef(false);

  useEffect(() => {
    if (homeSearchInitializedRef.current) return;
    if (!homeLocation && !homeBudget && !homeNear) {
      homeSearchInitializedRef.current = true;
      return;
    }

    const normalizedNear = homeNear.toLowerCase();
    let nearLocation = "";

    if (
      normalizedNear === "college" ||
      normalizedNear === "office" ||
      normalizedNear === "transport"
    ) {
      nearLocation = homeNear;
    } else if (homeNear) {
      nearLocation = homeNear;
    }

    let parsedBudget = null;
    if (homeBudget) {
      const numericBudget = Number(homeBudget.replace(/,/g, ""));
      if (Number.isFinite(numericBudget) && numericBudget > 0) {
        parsedBudget = numericBudget;
      }
    }

    setFilters((prev) => ({
      ...prev,
      city: homeLocation || prev.city,
      area: prev.area,
      minBudget: Number(initialFilters.minBudget),
      maxBudget:
        parsedBudget !== null
          ? Math.min(
              Math.max(parsedBudget, Number(initialFilters.minBudget)),
              200000
            )
          : prev.maxBudget,
      near: nearLocation,
      nearbyPlace:
        homeNear &&
        !["college", "office", "transport"].includes(normalizedNear)
          ? homeNear
          : prev.nearbyPlace,
      nearbyPlaces:
        homeNear &&
        !["college", "office", "transport"].includes(normalizedNear)
          ? [
              {
                id: "nearby-1",
                place: homeNear,
                radiusKm: Number(prev.nearbyRadiusKm) || 2,
              },
            ]
          : prev.nearbyPlaces,
    }));

    homeSearchInitializedRef.current = true;
  }, [homeLocation, homeBudget, homeNear]);

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [profileOpen, setProfileOpen] = useState(false);

  const displayName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.firstName ||
    "Profile";

  const displayEmail = user?.email || "";

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("jwt");
    setUser(null);
    setProfileOpen(false);
    window.location.href = "/";
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const toggleArrayFilter = (key, value) => {
    setFilters((prev) => {
      const currentValues = Array.isArray(prev[key]) ? prev[key] : [];

      /*
       * ROOM PREFERENCE is intentionally single-select.
       * The UI remains a checkbox to preserve the existing design,
       * but selecting one room replaces the previous room selection.
       * Clicking the selected room again clears it.
       */
      if (key === "roomPreferences") {
        return {
          ...prev,
          [key]: currentValues.includes(value) ? [] : [value],
        };
      }

      if (currentValues.includes(value)) {
        return {
          ...prev,
          [key]: currentValues.filter((item) => item !== value),
        };
      }

      return { ...prev, [key]: [...currentValues, value] };
    });
    setError("");
  };

  const clearFilters = () => {
    setFilters({
      ...initialFilters,
      nearbyPlaces: [],
    });
    setResults([]);
    setHasSearched(false);
    setError("");
  };

  const hasUserSearchInput = (currentFilters = filters) => {
    const hasCity = String(currentFilters.city || "").trim().length > 0;
    const hasArea = String(currentFilters.area || "").trim().length > 0;
    const hasNear = String(currentFilters.near || "").trim().length > 0;
    const hasNearbyPlace = normalizeNearbyPlaces(currentFilters).length > 0;
    const hasRoomPreference =
      Array.isArray(currentFilters.roomPreferences) &&
      currentFilters.roomPreferences.length > 0;
    const hasAmenity =
      Array.isArray(currentFilters.amenities) &&
      currentFilters.amenities.length > 0;
    const hasHostelPreference =
      Array.isArray(currentFilters.hostelPreference) &&
      currentFilters.hostelPreference.length > 0;
    const hasCustomBudget =
      Number(currentFilters.minBudget) !== Number(initialFilters.minBudget) ||
      Number(currentFilters.maxBudget) !== Number(initialFilters.maxBudget);

    return (
      hasCity ||
      hasArea ||
      hasNear ||
      hasNearbyPlace ||
      hasRoomPreference ||
      hasAmenity ||
      hasHostelPreference ||
      hasCustomBudget
    );
  };

  const handlePopularSearch = (value) => {
    const isArea = areas.includes(value);
    if (isArea) {
      setFilters((prev) => ({ ...prev, city: "Hyderabad", area: value }));
    } else {
      setFilters((prev) => ({ ...prev, city: value, area: "" }));
    }
    setCitySuggestionsOpen(false);
    setAreaSuggestionsOpen(false);
    setError("");
  };

  const buildRecommendationRequest = async (currentFilters, nearbyPlaceOverride = null) => {
    let coordinates = null;
    let searchReference = "";

    const nearbyPlaces = normalizeNearbyPlaces(currentFilters);
    const selectedNearbyPlace =
      nearbyPlaceOverride || (nearbyPlaces.length === 1 ? nearbyPlaces[0] : null);

    if (selectedNearbyPlace?.place) {
      coordinates = await geocodeNearbyPlace({
        place: selectedNearbyPlace.place,
        city: currentFilters.city,
      });
      searchReference = selectedNearbyPlace.place;

      if (!coordinates) {
        throw new Error(
          `Unable to find "${selectedNearbyPlace.place}". Please enter a more specific office, metro station, college, or landmark.`
        );
      }
    } else if (currentFilters.city || currentFilters.area) {
      coordinates = await geocodeLocation({
        city: currentFilters.city,
        area: currentFilters.area,
      });
      searchReference = [currentFilters.area, currentFilters.city]
        .filter(Boolean)
        .join(", ");
    }

    const selectedRoom =
      currentFilters.roomPreferences.length > 0
        ? ROOM_TYPE_MAP[currentFilters.roomPreferences[0]]
        : "";

    const selectedHostelType =
      currentFilters.hostelPreference.length > 0
        ? HOSTEL_TYPE_MAP[currentFilters.hostelPreference[0]]
        : "";

    const selectedAmenities = currentFilters.amenities
      .map((amenity) => AMENITY_CODE_MAP[amenity])
      .filter(Boolean);

    return {
      maxBudget: Number(currentFilters.maxBudget),
      minBudget: Number(currentFilters.minBudget),
      officeLocation: [
        searchReference || currentFilters.near,
        currentFilters.area,
        currentFilters.city,
      ]
        .filter(Boolean)
        .join(", "),
      latitude: coordinates?.latitude ?? null,
      longitude: coordinates?.longitude ?? null,
      maxDistanceKm: coordinates
        ? selectedNearbyPlace?.place
          ? Number(selectedNearbyPlace.radiusKm) || 2
          : 10
        : null,
      roomType: selectedRoom,
      hostelType: selectedHostelType,
      amenities: selectedAmenities,
      limit: 50,
      onlyAvailable: true,
    };
  };

  const executeRecommendationSearch = async (currentFilters, options = {}) => {
    const { scrollToResults = false, automatic = false } = options;

    if (!hasUserSearchInput(currentFilters)) {
      if (!automatic) {
        setLoading(false);
        setHasSearched(false);
        setResults([]);
      }
      return;
    }

    const requestId = ++searchRequestIdRef.current;

    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const nearbyPlaces = normalizeNearbyPlaces(currentFilters);
      let finalResults = [];

      if (nearbyPlaces.length <= 1) {
        const request = await buildRecommendationRequest(
          currentFilters,
          nearbyPlaces[0] || null
        );

        if (requestId !== searchRequestIdRef.current) return;

        console.log("========== RECOMMENDATION REQUEST ==========");
        console.log("Automatic search:", automatic);
        console.log("Request:", request);

        const response = await api.post("/api/recommendations", request);
        if (requestId !== searchRequestIdRef.current) return;

        const recommendations = Array.isArray(response.data?.recommendations)
          ? response.data.recommendations
          : [];

        const mappedResults = recommendations.map(mapRecommendationToHostel);

        const hasNearbyRadiusSearch = nearbyPlaces.length === 1;
        const requestedRadiusKm = Number(nearbyPlaces[0]?.radiusKm);

        finalResults = hasNearbyRadiusSearch
          ? mappedResults.filter((hostel) => {
              const distanceKm = Number(hostel.distanceKm);
              if (!Number.isFinite(distanceKm)) return false;

              return (
                Number.isFinite(requestedRadiusKm) &&
                distanceKm >= 0 &&
                distanceKm <= requestedRadiusKm + 0.001
              );
            })
          : mappedResults;
      } else {
        /*
         * PHASE 2:
         * The existing recommendation API accepts one coordinate/radius pair.
         * For multiple places, retrieve a broad candidate set once per place,
         * then apply the user's exact radius and ANY/ALL logic on the frontend.
         *
         * ANY  = hostel can be within the requested radius of any place.
         * ALL  = hostel must be within the requested radius of every place.
         */
        const perPlaceResults = [];

        for (const nearbyPlace of nearbyPlaces) {
          const request = await buildRecommendationRequest(
            currentFilters,
            nearbyPlace
          );

          if (requestId !== searchRequestIdRef.current) return;

          /*
           * IMPORTANT PHASE 2 FIX
           * -----------------------------------------------------------
           * The backend recommendation endpoint currently applies
           * maxDistanceKm BEFORE scoring/ranking.
           *
           * That is correct for a single nearby-place search, but it
           * causes a problem for Phase 2: a hostel that should match
           * one of several places can disappear from that individual
           * API response before the frontend gets a chance to perform
           * ANY / ALL matching.
           *
           * Therefore, for MULTIPLE nearby places only:
           *
           *   1. Ask the recommendation API for a broad candidate set.
           *   2. Keep all the existing budget/room/amenity/type/
           *      availability filters.
           *   3. Apply the user's exact radius locally using the
           *      distanceKm returned by the backend.
           *
           * The user's requested radius is NEVER loosened in the final
           * displayed results. The broad request is only a retrieval
           * step so Phase 2 can perform its own exact ANY / ALL logic.
           */
          const retrievalRequest = {
            ...request,
            maxDistanceKm: 10,
          };

          console.log("========== PHASE 2 NEARBY REQUEST ==========");
          console.log("Nearby place:", nearbyPlace.place);
          console.log("Requested radius:", nearbyPlace.radiusKm);
          console.log("Retrieval radius:", retrievalRequest.maxDistanceKm);
          console.log("Request:", retrievalRequest);

          const response = await api.post(
            "/api/recommendations",
            retrievalRequest
          );

          if (requestId !== searchRequestIdRef.current) return;

          const recommendations = Array.isArray(response.data?.recommendations)
            ? response.data.recommendations
            : [];

          const mappedResults = recommendations
            .map(mapRecommendationToHostel)
            .filter((hostel) => {
              const distanceKm = Number(hostel.distanceKm);
              const radiusKm = Number(nearbyPlace.radiusKm);

              return (
                Number.isFinite(distanceKm) &&
                Number.isFinite(radiusKm) &&
                distanceKm >= 0 &&
                distanceKm <= radiusKm + 0.001
              );
            })
            .map((hostel) => ({
              ...hostel,
              nearbyDistances: [
                {
                  place: nearbyPlace.place,
                  radiusKm: Number(nearbyPlace.radiusKm),
                  distanceKm: Number(hostel.distanceKm),
                },
              ],
            }));

          perPlaceResults.push({
            nearbyPlace,
            results: mappedResults,
          });
        }

        const resultMaps = perPlaceResults.map(({ results }) => {
          const map = new Map();

          results.forEach((hostel) => {
            const key = String(hostel.hostelId ?? `${hostel.name}-${hostel.roomType}`);

            const existing = map.get(key);
            if (!existing || hostel.match > existing.match) {
              map.set(key, hostel);
            }
          });

          return map;
        });

        const matchMode =
          String(currentFilters.nearbyMatchMode || "ANY").toUpperCase() === "ALL"
            ? "ALL"
            : "ANY";

        if (matchMode === "ALL") {
          const commonKeys = [...resultMaps[0].keys()].filter((key) =>
            resultMaps.every((map) => map.has(key))
          );

          finalResults = commonKeys
            .map((key) => {
              const candidates = resultMaps.map((map) => map.get(key));
              const bestCandidate = [...candidates].sort(
                (a, b) => b.match - a.match
              )[0];

              return {
                ...bestCandidate,
                nearbyDistances: candidates.flatMap(
                  (candidate) => candidate.nearbyDistances || []
                ),
                distanceKm: Math.max(
                  ...candidates.map((candidate) => Number(candidate.distanceKm))
                ),
              };
            })
            .filter((hostel) => {
              const distances = hostel.nearbyDistances || [];
              return (
                distances.length === nearbyPlaces.length &&
                distances.every(
                  (item) =>
                    Number.isFinite(Number(item.distanceKm)) &&
                    Number(item.distanceKm) <= Number(item.radiusKm) + 0.001
                )
              );
            });
        } else {
          const combined = new Map();

          resultMaps.forEach((map) => {
            map.forEach((hostel, key) => {
              const existing = combined.get(key);

              if (!existing) {
                combined.set(key, hostel);
                return;
              }

              const distances = [
                ...(existing.nearbyDistances || []),
                ...(hostel.nearbyDistances || []),
              ];

              const bestCandidate =
                hostel.match > existing.match ? hostel : existing;

              combined.set(key, {
                ...bestCandidate,
                nearbyDistances: distances,
                distanceKm: Math.min(
                  ...distances.map((item) => Number(item.distanceKm))
                ),
              });
            });
          });

          finalResults = [...combined.values()];
        }
      }

      console.log("========== PHASE 2 COMBINED RESULTS ==========");
      console.log("Nearby places:", nearbyPlaces);
      console.log("Match mode:", currentFilters.nearbyMatchMode);
      console.log("Results:", finalResults.length);

      setResults(finalResults);
      setCitySuggestionsOpen(false);
      setAreaSuggestionsOpen(false);

      if (scrollToResults) {
        setTimeout(() => {
          document.getElementById("results")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
    } catch (err) {
      if (requestId !== searchRequestIdRef.current) return;

      console.error("Recommendation API error:", err);

      let message = "Unable to load hostel recommendations.";

      if (err?.response?.status === 400) {
        message =
          err?.response?.data?.message ||
          "Some search filters are invalid. Please check your selections.";
      } else if (err?.response?.status === 403) {
        message =
          "You do not have permission to access hostel recommendations.";
      } else if (err?.response?.status >= 500) {
        message =
          "The recommendation server encountered an error. Please try again.";
      } else if (err?.message) {
        message = err.message;
      }

      setError(message);
      setResults([]);
    } finally {
      if (requestId === searchRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const searchHostels = async () => {
    if (!hasUserSearchInput()) {
      setLoading(false);
      setHasSearched(false);
      setResults([]);
      setError(
        "Please enter a city or area, or select at least one search filter before searching."
      );
      return;
    }

    await executeRecommendationSearch(filters, {
      scrollToResults: true,
      automatic: false,
    });
  };

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    if (!hasUserSearchInput(filters)) {
      searchRequestIdRef.current += 1;
      setLoading(false);
      setResults([]);
      setHasSearched(false);
      setError("");
      return;
    }

    const timer = setTimeout(() => {
      executeRecommendationSearch(filters, {
        scrollToResults: false,
        automatic: true,
      });
    }, 450);

    return () => clearTimeout(timer);
  }, [
    filters.city,
    filters.area,
    filters.near,
    filters.nearbyPlace,
    filters.nearbyRadiusKm,
    filters.nearbyPlaces,
    filters.nearbyMatchMode,
    filters.minBudget,
    filters.maxBudget,
    filters.roomPreferences,
    filters.amenities,
    filters.hostelPreference,
  ]);

  const sortedResults = useMemo(() => {
    const sorted = [...results];

    if (sortBy === "Price: Low to High") {
      sorted.sort((a, b) => a.price - b.price);
    }
    if (sortBy === "Price: High to Low") {
      sorted.sort((a, b) => b.price - a.price);
    }
    if (sortBy === "Rating") {
      sorted.sort((a, b) => b.match - a.match);
    }
    if (sortBy === "Recommended") {
      sorted.sort((a, b) => b.match - a.match);
    }

    return sorted;
  }, [results, sortBy]);

  const topMatch = sortedResults[0];
  const otherHostels = sortedResults.slice(1);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <a
            href="/home"
            className="flex items-center gap-2.5 text-xl font-bold tracking-tight"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <House size={18} strokeWidth={2.2} />
            </div>
            <span>
              Hostel<span className="text-blue-600">Hub</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="/home"
              className="text-sm font-medium text-neutral-600 transition hover:text-blue-600"
            >
              Home
            </a>
            <a href="/search" className="text-sm font-semibold text-blue-600">
              Search
            </a>
            <a
              href="/about"
              className="text-sm font-medium text-neutral-600 transition hover:text-blue-600"
            >
              About
            </a>
            <a
              href="/help"
              className="text-sm font-medium text-neutral-600 transition hover:text-blue-600"
            >
              Help
            </a>
          </nav>

          <div className="relative hidden md:block">
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium transition hover:border-blue-300 hover:text-blue-600 hover:shadow-sm"
            >
              <UserCircle size={20} />
              <span className="max-w-[150px] truncate">{displayName}</span>
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <>
                <button
                  aria-label="Close profile menu"
                  onClick={() => setProfileOpen(false)}
                  className="fixed inset-0 z-40 h-full w-full cursor-default"
                />
                <div className="absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
                  <div className="border-b border-black/10 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <UserCircle size={26} strokeWidth={1.8} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-black">
                          {displayName}
                        </p>
                        {displayEmail && (
                          <p className="mt-1 truncate text-xs text-neutral-500">
                            {displayEmail}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <LogOut size={17} />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="rounded-xl border border-black/10 bg-white p-2.5 transition hover:border-blue-300 hover:text-blue-600 md:hidden"
          >
            <Menu size={21} />
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
              Hostel recommendation
            </p>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-black sm:text-5xl lg:text-6xl">
              Find your right place.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
              Tell us where you want to live and what matters to you. We&apos;ll
              recommend hostels that fit your preferences.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-5xl rounded-[28px] border border-black/10 bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto]">
              <div className="relative border-b border-black/10 px-5 py-4 lg:border-b-0 lg:border-r">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500">
                  City
                </label>
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="shrink-0 text-blue-600" />
                  <input
                    type="text"
                    value={filters.city}
                    onChange={(e) => {
                      updateFilter("city", e.target.value);
                      setCitySuggestionsOpen(true);
                    }}
                    onFocus={() => setCitySuggestionsOpen(true)}
                    placeholder="Search city"
                    className="w-full bg-transparent text-sm font-medium text-black outline-none placeholder:text-neutral-400"
                  />
                </div>

                {citySuggestionsOpen && filters.city && (
                  <div className="absolute left-4 right-4 top-[82px] z-20 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl">
                    {cities
                      .filter((city) =>
                        city.toLowerCase().includes(filters.city.toLowerCase())
                      )
                      .map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            updateFilter("city", city);
                            setCitySuggestionsOpen(false);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <MapPin size={16} className="text-blue-600" />
                          {city}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              <div className="relative px-5 py-4">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Area / Locality
                </label>
                <div className="flex items-center gap-2">
                  <SearchIcon size={18} className="shrink-0 text-blue-600" />
                  <input
                    type="text"
                    value={filters.area}
                    onChange={(e) => {
                      updateFilter("area", e.target.value);
                      setAreaSuggestionsOpen(true);
                    }}
                    onFocus={() => setAreaSuggestionsOpen(true)}
                    placeholder="Search area"
                    className="w-full bg-transparent text-sm font-medium text-black outline-none placeholder:text-neutral-400"
                  />
                </div>

                {areaSuggestionsOpen && filters.area && (
                  <div className="absolute left-4 right-4 top-[82px] z-20 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl">
                    {areas
                      .filter((area) =>
                        area.toLowerCase().includes(filters.area.toLowerCase())
                      )
                      .map((area) => (
                        <button
                          key={area}
                          onClick={() => {
                            updateFilter("area", area);
                            setAreaSuggestionsOpen(false);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <MapPin size={16} className="text-blue-600" />
                          {area}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              <button
                onClick={searchHostels}
                disabled={loading}
                className="m-1 flex items-center justify-center gap-2 rounded-[20px] bg-blue-600 px-7 py-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 lg:min-w-[190px]"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    Search hostels
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mx-auto mt-7 flex max-w-5xl flex-wrap items-center justify-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Popular
            </span>
            {popularSearches.map((item) => (
              <button
                key={item}
                onClick={() => handlePopularSearch(item)}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium text-neutral-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section
        id="results"
        className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10"
      >
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            Refine your search
          </p>
          <div className="mt-2 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">
                Recommended for you
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                {hasSearched
                  ? `${sortedResults.length} ${
                      sortedResults.length === 1 ? "hostel" : "hostels"
                    } match your preferences`
                  : "Choose your preferences to get personalized recommendations"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-blue-300 hover:text-blue-600 md:hidden"
              >
                <Menu size={17} />
                Filters
              </button>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none rounded-xl border border-black/10 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-black outline-none transition focus:border-blue-500"
                >
                  <option>Recommended</option>
                  <option>Rating</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[270px_1fr]">
          <aside className="hidden md:block">
            <FilterSidebar
              filters={filters}
              updateFilter={updateFilter}
              toggleArrayFilter={toggleArrayFilter}
              clearFilters={clearFilters}
              showMoreAmenities={showMoreAmenities}
              setShowMoreAmenities={setShowMoreAmenities}
            />
          </aside>

          <div>
            {loading && <LoadingState />}

            {!loading && error && (
              <ErrorState message={error} onRetry={searchHostels} />
            )}

            {!loading && !error && !hasSearched && <InitialSearchState />}

            {!loading &&
              !error &&
              hasSearched &&
              sortedResults.length === 0 && (
                <EmptyState clearFilters={clearFilters} />
              )}

            {!loading && !error && sortedResults.length > 0 && (
              <>
                {topMatch && <TopMatchCard hostel={topMatch} />}

                {otherHostels.length > 0 && (
                  <div className="mt-12">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                          Explore more
                        </p>
                        <h3 className="mt-1 text-xl font-semibold text-black">
                          Other recommendations
                        </h3>
                      </div>
                      <span className="hidden text-sm text-neutral-400 sm:block">
                        {otherHostels.length} more options
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {otherHostels.map((hostel) => (
                        <HostelCard
                          key={`${hostel.hostelId}-${hostel.roomType}`}
                          hostel={hostel}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* MATCH EXPLANATION */}
      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <ShieldCheck
              size={30}
              strokeWidth={1.6}
              className="mx-auto mb-5 text-blue-600"
            />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              How recommendations work
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-black sm:text-4xl">
              Don&apos;t just find a hostel.
              <br />
              Find your best match.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-neutral-600 sm:text-base">
              HostelHub looks at the preferences you provide — location, budget,
              room preference and amenities — and helps you discover approved
              hostels that fit those requirements.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
            <MatchFeature
              number="01"
              title="Your requirements"
              text="Tell us where you want to live and what you need."
            />
            <MatchFeature
              number="02"
              title="We compare"
              text="Your preferences are compared with approved and available hostels."
            />
            <MatchFeature
              number="03"
              title="Better matches"
              text="See the hostels that best fit what you're looking for."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="overflow-hidden rounded-[32px] bg-blue-600 px-6 py-16 text-center text-white sm:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">
            HostelHub
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            Your next place might be closer than you think.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/80">
            Explore approved hostels based on your budget, location and
            lifestyle preferences.
          </p>
          <button
            onClick={() =>
              document.getElementById("results")?.scrollIntoView({
                behavior: "smooth",
              })
            }
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Explore more hostels
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-4 lg:px-10">
          <div className="md:col-span-2">
            <a
              href="/"
              className="flex items-center gap-2.5 text-xl font-bold tracking-tight"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
                <House size={18} />
              </div>
              <span>
                Hostel<span className="text-blue-600">Hub</span>
              </span>
            </a>
            <p className="mt-4 max-w-md text-sm leading-7 text-neutral-500">
              Helping students and professionals discover approved hostels that
              fit their requirements.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-black">Explore</h4>
            <div className="mt-4 space-y-3 text-sm text-neutral-500">
              <a href="/" className="block transition hover:text-blue-600">
                Home
              </a>
              <a href="/search" className="block transition hover:text-blue-600">
                Search
              </a>
              <a href="/about" className="block transition hover:text-blue-600">
                About
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-black">Support</h4>
            <div className="mt-4 space-y-3 text-sm text-neutral-500">
              <a href="/help" className="block transition hover:text-blue-600">
                Help Center
              </a>
              <a
                href="/contact"
                className="block transition hover:text-blue-600"
              >
                Contact
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-black/10">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-5 py-6 text-xs text-neutral-400 sm:flex-row sm:px-8 lg:px-10">
            <p>© 2026 HostelHub. All rights reserved.</p>
            <p>Find a place that fits your life.</p>
          </div>
        </div>
      </footer>

      {/* MOBILE FILTER DRAWER */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto rounded-t-[30px] bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Refine
                </p>
                <h3 className="mt-1 text-xl font-semibold text-black">
                  Filters
                </h3>
              </div>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-full border border-black/10 bg-white p-2 transition hover:border-blue-300 hover:text-blue-600"
              >
                <X size={19} />
              </button>
            </div>

            <FilterSidebar
              filters={filters}
              updateFilter={updateFilter}
              toggleArrayFilter={toggleArrayFilter}
              clearFilters={clearFilters}
              showMoreAmenities={showMoreAmenities}
              setShowMoreAmenities={setShowMoreAmenities}
            />

            <button
              onClick={searchHostels}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Searching...
                </>
              ) : (
                <>Show {results.length} results</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===============================================================
   FILTER SIDEBAR
================================================================ */

function FilterSidebar({
  filters,
  updateFilter,
  toggleArrayFilter,
  clearFilters,
  showMoreAmenities,
  setShowMoreAmenities,
}) {
  const visibleAmenities = showMoreAmenities
    ? amenityOptions
    : amenityOptions.slice(0, 8);

  return (
    <div className="rounded-[24px] border border-black/10 bg-white p-5">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-black">
          Filters
        </h3>
        <button
          onClick={clearFilters}
          className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
        >
          Clear all
        </button>
      </div>

      <FilterSection title="City">
        <div className="relative">
          <MapPin
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
          />
          <input
            type="text"
            value={filters.city}
            onChange={(e) => updateFilter("city", e.target.value)}
            placeholder="Search city"
            className="w-full rounded-xl border border-black/10 bg-white py-3 pl-9 pr-3 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </FilterSection>

      <FilterSection title="Area / Locality">
        <div className="relative">
          <SearchIcon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
          />
          <input
            type="text"
            value={filters.area}
            onChange={(e) => updateFilter("area", e.target.value)}
            placeholder="Search area"
            className="w-full rounded-xl border border-black/10 bg-white py-3 pl-9 pr-3 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </FilterSection>

      <FilterSection title="Nearby / Radius">
        <div className="space-y-3">
          {(filters.nearbyPlaces?.length > 0
            ? filters.nearbyPlaces
            : filters.nearbyPlace
              ? [
                  {
                    id: "nearby-1",
                    place: filters.nearbyPlace,
                    radiusKm: filters.nearbyRadiusKm,
                  },
                ]
              : [
                  {
                    id: "nearby-1",
                    place: "",
                    radiusKm: filters.nearbyRadiusKm,
                  },
                ]
          ).map((nearby, index) => (
            <div
              key={nearby.id}
              className="rounded-2xl border border-black/10 bg-neutral-50/60 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Nearby place {index + 1}
                </span>

                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = (filters.nearbyPlaces || []).filter(
                        (item) => item.id !== nearby.id
                      );
                      updateFilter("nearbyPlaces", next);
                    }}
                    className="text-[10px] font-semibold text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="relative">
                <MapPin
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                />
                <input
                  type="text"
                  value={nearby.place}
                  onChange={(e) => {
                    const value = e.target.value;
                    const current =
                      filters.nearbyPlaces?.length > 0
                        ? filters.nearbyPlaces
                        : [
                            {
                              id: "nearby-1",
                              place: "",
                              radiusKm: filters.nearbyRadiusKm,
                            },
                          ];

                    const next = current.map((item) =>
                      item.id === nearby.id
                        ? { ...item, place: value }
                        : item
                    );

                    updateFilter("nearbyPlaces", next);
                    updateFilter(
                      "nearbyPlace",
                      next[0]?.place || ""
                    );
                  }}
                  placeholder="Office, metro, college, landmark..."
                  className="w-full rounded-xl border border-black/10 bg-white py-3 pl-9 pr-3 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="mt-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-500">
                    Search within
                  </span>
                  <span className="text-xs font-semibold text-black">
                    {nearby.radiusKm} km
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={nearby.radiusKm}
                  onChange={(e) => {
                    const radiusKm = Number(e.target.value);
                    const current =
                      filters.nearbyPlaces?.length > 0
                        ? filters.nearbyPlaces
                        : [
                            {
                              id: "nearby-1",
                              place: nearby.place,
                              radiusKm: filters.nearbyRadiusKm,
                            },
                          ];

                    const next = current.map((item) =>
                      item.id === nearby.id
                        ? { ...item, radiusKm }
                        : item
                    );

                    updateFilter("nearbyPlaces", next);
                    updateFilter("nearbyRadiusKm", radiusKm);
                  }}
                  className="w-full accent-blue-600"
                  aria-label={`Radius for nearby place ${index + 1}`}
                />

                <div className="mt-2 flex justify-between text-[10px] font-medium text-neutral-400">
                  <span>1 km</span>
                  <span>5 km</span>
                  <span>10 km</span>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const current =
                filters.nearbyPlaces?.length > 0
                  ? filters.nearbyPlaces
                  : filters.nearbyPlace
                    ? [
                        {
                          id: "nearby-1",
                          place: filters.nearbyPlace,
                          radiusKm: filters.nearbyRadiusKm,
                        },
                      ]
                    : [];

              updateFilter("nearbyPlaces", [
                ...current,
                {
                  id: `nearby-${Date.now()}`,
                  place: "",
                  radiusKm: 2,
                },
              ]);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-200 bg-blue-50/50 px-3 py-2.5 text-xs font-semibold text-blue-700 transition hover:border-blue-400 hover:bg-blue-50"
          >
            + Add another nearby place
          </button>

          {(filters.nearbyPlaces?.length > 1 ||
            String(filters.nearbyPlace || "").trim()) && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Match requirement
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateFilter("nearbyMatchMode", "ANY")}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                    (filters.nearbyMatchMode || "ANY") === "ANY"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-black/10 bg-white text-neutral-600 hover:border-blue-300"
                  }`}
                >
                  Near ANY
                </button>

                <button
                  type="button"
                  onClick={() => updateFilter("nearbyMatchMode", "ALL")}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                    filters.nearbyMatchMode === "ALL"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-black/10 bg-white text-neutral-600 hover:border-blue-300"
                  }`}
                >
                  Near ALL
                </button>
              </div>

              <p className="mt-2 text-[10px] leading-4 text-neutral-400">
                ANY = within the radius of at least one place. ALL = within the
                radius of every selected place.
              </p>
            </div>
          )}

          {normalizeNearbyPlaces(filters).length > 0 && (
            <p className="rounded-xl bg-blue-50 px-3 py-2.5 text-[11px] leading-5 text-blue-700">
              {filters.nearbyMatchMode === "ALL" &&
              normalizeNearbyPlaces(filters).length > 1
                ? "Showing hostels that are within the selected radius of every nearby place."
                : `Showing hostels within the selected radius of ${
                    normalizeNearbyPlaces(filters).length === 1
                      ? normalizeNearbyPlaces(filters)[0].place
                      : "any selected nearby place"
                  }.`}
            </p>
          )}
        </div>
      </FilterSection>

      <FilterSection title="Monthly Budget">
        <div className="flex items-center justify-between text-xs font-semibold text-black">
          <span>
            ₹{Number(filters.minBudget).toLocaleString("en-IN")}
          </span>
          <span>₹{filters.maxBudget.toLocaleString("en-IN")}</span>
        </div>

        <div className="mt-4">
          <input
            type="range"
            min="1000"
            max="200000"
            step="1000"
            value={filters.maxBudget}
            onChange={(e) =>
              updateFilter(
                "maxBudget",
                Math.max(Number(filters.minBudget), Number(e.target.value))
              )
            }
            className="w-full accent-blue-600"
            aria-label="Maximum monthly budget"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {[
            [1000, 8000, "Under ₹8K"],
            [8000, 12000, "₹8K – ₹12K"],
            [12000, 15000, "₹12K – ₹15K"],
            [15000, 200000, "₹15K+"],
          ].map(([min, max, label]) => (
            <button
              key={label}
              onClick={() => {
                /* Apply both boundaries of the selected budget range. */
                updateFilter("minBudget", Number(min));
                updateFilter("maxBudget", Math.min(Number(max), 200000));
              }}
              className="rounded-lg border border-black/10 px-2 py-2 text-[11px] font-medium text-black transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
            >
              {label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Room Preference">
        <div className="space-y-2">
          {roomOptions.map((room) => (
            <CheckboxItem
              key={room}
              label={room}
              checked={filters.roomPreferences.includes(room)}
              onChange={() => toggleArrayFilter("roomPreferences", room)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Amenities">
        <div className="space-y-2">
          {visibleAmenities.map((amenity) => (
            <CheckboxItem
              key={amenity}
              label={amenity}
              checked={filters.amenities.includes(amenity)}
              onChange={() => toggleArrayFilter("amenities", amenity)}
            />
          ))}
        </div>

        <button
          onClick={() => setShowMoreAmenities(!showMoreAmenities)}
          className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600 transition hover:text-blue-700"
        >
          {showMoreAmenities ? "Show less" : "Show more"}
          <ChevronRight
            size={13}
            className={showMoreAmenities ? "rotate-90 transition" : ""}
          />
        </button>
      </FilterSection>

      <FilterSection title="Hostel Preference">
        <div className="space-y-2">
          {hostelPreferenceOptions.map((type) => (
            <CheckboxItem
              key={type}
              label={type}
              checked={filters.hostelPreference.includes(type)}
              onChange={() => toggleArrayFilter("hostelPreference", type)}
            />
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

/* ===============================================================
   FILTER SECTION
================================================================ */

function FilterSection({ title, children }) {
  return (
    <div className="border-t border-black/10 py-5 first:border-t-0 first:pt-0">
      <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.13em] text-neutral-500">
        {title}
      </h4>
      {children}
    </div>
  );
}

/* ===============================================================
   CHECKBOX
================================================================ */

function CheckboxItem({ label, checked, onChange }) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 py-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition ${
          checked
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-black/20 bg-white group-hover:border-blue-400"
        }`}
      >
        {checked && <Check size={12} strokeWidth={3} />}
      </span>
      <span
        className={`text-sm ${
          checked ? "font-medium text-black" : "text-neutral-600"
        }`}
      >
        {label}
      </span>
    </label>
  );
}

/* ===============================================================
   AVAILABILITY PANEL
================================================================ */

function AvailabilityPanel({ hostel, compact = false }) {
  const availability = hostel?.roomAvailability || {};
  const availableBeds = Number(availability.availableBeds) || 0;
  const availableRooms = Number(availability.availableRooms) || 0;
  const totalBeds = Number(availability.totalBeds) || 0;
  const totalRooms = Number(availability.totalRooms) || 0;

  return (
    <div
      className={`rounded-2xl border border-black/10 bg-neutral-50 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <BedDouble size={16} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
              Room availability
            </p>
            <p className="mt-0.5 text-sm font-semibold text-black">
              {availableBeds > 0
                ? `${availableBeds} beds available`
                : availableRooms > 0
                  ? `${availableRooms} rooms available`
                  : "Currently full"}
            </p>
          </div>
        </div>

        {availableBeds > 0 || availableRooms > 0 ? (
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
            Available
          </span>
        ) : (
          <span className="rounded-full bg-neutral-200 px-2.5 py-1 text-[11px] font-semibold text-neutral-600">
            Full
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <AvailabilityStat
          icon={<DoorOpen size={14} />}
          label="Rooms"
          value={`${availableRooms}/${totalRooms}`}
        />
        <AvailabilityStat
          icon={<Users size={14} />}
          label="Beds"
          value={`${availableBeds}/${totalBeds}`}
        />
        <AvailabilityStat
          icon={<Users size={14} />}
          label="Occupied"
          value={`${Number(availability.occupiedBeds) || 0}`}
        />
        <AvailabilityStat
          icon={<DoorOpen size={14} />}
          label="Occupied rooms"
          value={`${Number(availability.occupiedRooms) || 0}`}
        />
      </div>
    </div>
  );
}

function AvailabilityStat({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-black/5 bg-white px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-neutral-400">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="mt-1 text-sm font-semibold text-black">{value}</p>
    </div>
  );
}

/* ===============================================================
   ISSUE PANEL
================================================================ */

function IssuePanel({ hostel, compact = false }) {
  const issue = hostel?.issueSummary || {};
  const health = Math.max(
    0,
    Math.min(100, Number(issue.issueHealthScore) || 0)
  );
  const openIssues = Number(issue.openIssues) || 0;
  const healthy = openIssues === 0;

  return (
    <div
      className={`rounded-2xl border ${
        healthy
          ? "border-blue-100 bg-blue-50/40"
          : "border-amber-200 bg-amber-50/50"
      } ${compact ? "p-4" : "p-5"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
              healthy ? "bg-white text-blue-600" : "bg-white text-amber-600"
            }`}
          >
            {healthy ? (
              <CheckCircle2 size={17} />
            ) : (
              <AlertTriangle size={17} />
            )}
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
              Issue information
            </p>
            <p className="mt-0.5 text-sm font-semibold text-black">
              {healthy
                ? "No active issues reported"
                : `${openIssues} active ${openIssues === 1 ? "issue" : "issues"}`}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            healthy ? "bg-white text-blue-700" : "bg-white text-amber-700"
          }`}
        >
          {Math.round(health)}% health
        </span>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/80">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${health}%` }}
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <IssueStat label="Total" value={issue.totalIssues} />
        <IssueStat label="Resolved" value={issue.resolvedIssues} />
        <IssueStat label="Rejected" value={issue.rejectedIssues} />
      </div>
    </div>
  );
}

function IssueStat({ label, value }) {
  return (
    <div className="rounded-xl bg-white/80 px-2 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-black">
        {Number(value) || 0}
      </p>
    </div>
  );
}

/* ===============================================================
   TOP MATCH CARD — clean editorial split layout
================================================================ */

function TopMatchCard({ hostel }) {
  const matchReasons = buildMatchReasons(hostel);

  const availability = hostel.roomAvailability || {};
  const availableBeds = Number(availability.availableBeds) || 0;
  const availableRooms = Number(availability.availableRooms) || 0;
  const totalBeds = Number(availability.totalBeds) || 0;
  const totalRooms = Number(availability.totalRooms) || 0;

  const issue = hostel.issueSummary || {};
  const openIssues = Number(issue.openIssues) || 0;

  const isAvailable = availableBeds > 0 || availableRooms > 0;

  return (
    <article className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      <div className="grid lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* Image column */}
        <div className="relative h-[280px] bg-neutral-100 sm:h-[340px] lg:h-auto lg:min-h-[520px]">
          {hostel.image ? (
            <img
              src={hostel.image}
              alt={hostel.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <House size={56} strokeWidth={1.2} className="text-neutral-300" />
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

          <div className="absolute left-5 top-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-600 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
              Top match
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-black shadow-sm backdrop-blur-md">
              <ShieldCheck size={13} className="text-blue-600" />
              Verified
            </span>
          </div>
        </div>

        {/* Details column */}
        <div className="flex flex-col p-6 sm:p-8 lg:p-10">
          {/* Match header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">
              <Star size={13} className="fill-blue-600 text-blue-600" />
              Recommended for you
            </div>
            <div className="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5">
              <span className="text-sm font-bold text-blue-700">
                {hostel.match}%
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600/70">
                match
              </span>
            </div>
          </div>

          {/* Name */}
          <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.03em] text-black sm:text-3xl">
            {hostel.name}
          </h3>

          {/* Location */}
          <div className="mt-3 flex items-start gap-2 text-sm text-neutral-500">
            <MapPin size={15} className="mt-0.5 shrink-0 text-blue-600" />
            <span className="leading-relaxed">{hostel.location}</span>
          </div>

          {hostel.distanceKm !== null && (
            <div className="mt-2 text-xs font-semibold text-blue-600">
              {hostel.distanceKm < 1
                ? `${Math.round(hostel.distanceKm * 1000)} m away`
                : `${hostel.distanceKm.toFixed(1)} km away`}
            </div>
          )}

          {hostel.nearbyDistances?.length > 1 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {hostel.nearbyDistances.map((item) => (
                <span
                  key={`${item.place}-${item.distanceKm}`}
                  className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-medium text-blue-700"
                >
                  {item.distanceKm < 1
                    ? `${Math.round(item.distanceKm * 1000)} m from ${item.place}`
                    : `${item.distanceKm.toFixed(1)} km from ${item.place}`}
                </span>
              ))}
            </div>
          )}

          {/* Meta strip */}
          <div className="mt-6 grid grid-cols-3 gap-4 rounded-2xl border border-black/5 bg-neutral-50 px-5 py-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                From
              </p>
              <p className="mt-1 text-lg font-semibold text-black">
                ₹{formatCurrency(hostel.price)}
                <span className="ml-0.5 text-xs font-normal text-neutral-400">
                  /mo
                </span>
              </p>
            </div>
            <div className="border-l border-black/10 pl-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Room
              </p>
              <p className="mt-1 text-sm font-semibold text-black">
                {hostel.roomLabel}
              </p>
            </div>
            <div className="border-l border-black/10 pl-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Type
              </p>
              <p className="mt-1 text-sm font-semibold text-black">
                {hostel.hostelTypeLabel}
              </p>
            </div>
          </div>

          {/* Availability + Issues */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white p-4">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  isAvailable
                    ? "bg-blue-50 text-blue-600"
                    : "bg-neutral-100 text-neutral-500"
                }`}
              >
                <BedDouble size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  {isAvailable ? "Availability" : "Status"}
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-black">
                  {availableBeds > 0
                    ? `${availableBeds} of ${totalBeds} beds`
                    : availableRooms > 0
                      ? `${availableRooms} of ${totalRooms} rooms`
                      : "Currently full"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white p-4">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  openIssues > 0
                    ? "bg-amber-50 text-amber-600"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                {openIssues > 0 ? (
                  <AlertTriangle size={16} />
                ) : (
                  <CheckCircle2 size={16} />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Issues
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-black">
                  {openIssues > 0
                    ? `${openIssues} active`
                    : "None active"}
                </p>
              </div>
            </div>
          </div>

          {/* Match reasons */}
          {matchReasons.length > 0 && (
            <div className="mt-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                Why it matches
              </p>
              <ul className="mt-3 space-y-2">
                {matchReasons.slice(0, 2).map((reason) => (
                  <li
                    key={reason}
                    className="flex items-center gap-2.5 text-sm text-neutral-700"
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      <Check size={10} strokeWidth={3} />
                    </span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Amenities */}
          {hostel.amenities.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {hostel.amenities.slice(0, 4).map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-[11px] font-medium text-neutral-700"
                >
                  {amenity}
                </span>
              ))}
              {hostel.amenities.length > 4 && (
                <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-[11px] font-medium text-neutral-500">
                  +{hostel.amenities.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* CTA */}
          <div className="mt-auto pt-8">
            <button
              onClick={() => {
                if (hostel.hostelId) {
                  window.location.href = `/hostels/${hostel.hostelId}`;
                }
              }}
              className="group inline-flex w-full items-center justify-between gap-3 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <span>View hostel details</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition group-hover:bg-white/25">
                <ArrowRight size={15} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ===============================================================
   HOSTEL CARD — clean modern product card
================================================================ */

function HostelCard({ hostel }) {
  const availableBeds = Number(hostel.roomAvailability?.availableBeds) || 0;
  const availableRooms = Number(hostel.roomAvailability?.availableRooms) || 0;
  const openIssues = Number(hostel.issueSummary?.openIssues) || 0;

  const isAvailable = availableBeds > 0 || availableRooms > 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-[22px] border border-black/10 bg-white transition duration-300 hover:-translate-y-0.5 hover:border-black/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.07)]">
      {/* Image */}
      <div className="relative aspect-[1.5/1] overflow-hidden bg-neutral-100">
        {hostel.image ? (
          <img
            src={hostel.image}
            alt={hostel.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <House size={44} strokeWidth={1.2} className="text-neutral-300" />
          </div>
        )}

        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black shadow-sm backdrop-blur-md">
            {hostel.match}% match
          </span>
        </div>

        <div className="absolute right-4 top-4">
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-semibold shadow-sm backdrop-blur-md ${
              isAvailable
                ? "bg-white/95 text-emerald-700"
                : "bg-white/95 text-neutral-600"
            }`}
          >
            {isAvailable ? "Available" : "Full"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="truncate text-[16px] font-semibold tracking-tight text-black">
          {hostel.name}
        </h3>

        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-neutral-500">
          <MapPin size={12} className="shrink-0 text-blue-600" />
          <span className="truncate">{hostel.location}</span>
        </div>

        {hostel.distanceKm !== null && (
          <div className="mt-2 text-xs font-medium text-blue-600">
            {hostel.distanceKm < 1
              ? `${Math.round(hostel.distanceKm * 1000)} m away`
              : `${hostel.distanceKm.toFixed(1)} km away`}
          </div>
        )}

        {/* Price + Room */}
        <div className="mt-4 flex items-end justify-between gap-2">
          <p className="text-lg font-semibold text-black">
            ₹{formatCurrency(hostel.price)}
            <span className="ml-1 text-xs font-normal text-neutral-400">
              /mo
            </span>
          </p>
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold text-neutral-600">
            {hostel.roomLabel}
          </span>
        </div>

        {/* Info row */}
        <div className="mt-3 flex items-center gap-3 text-xs text-neutral-600">
          <span className="flex items-center gap-1.5">
            <BedDouble size={13} className="text-blue-600" />
            {availableBeds > 0
              ? `${availableBeds} beds`
              : availableRooms > 0
                ? `${availableRooms} rooms`
                : "Full"}
          </span>
          <span className="h-3 w-px bg-black/10" />
          <span className="flex items-center gap-1.5">
            {openIssues > 0 ? (
              <AlertTriangle size={13} className="text-amber-600" />
            ) : (
              <CheckCircle2 size={13} className="text-blue-600" />
            )}
            {openIssues > 0 ? `${openIssues} issues` : "No issues"}
          </span>
          <span className="h-3 w-px bg-black/10" />
          <span className="truncate">{hostel.hostelTypeLabel}</span>
        </div>

        {/* Amenities */}
        {hostel.amenities.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {hostel.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700"
              >
                {amenity}
              </span>
            ))}
            {hostel.amenities.length > 3 && (
              <span className="rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-medium text-neutral-500">
                +{hostel.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => {
            if (hostel.hostelId) {
              window.location.href = `/hostels/${hostel.hostelId}`;
            }
          }}
          className="group/btn mt-5 flex w-full items-center justify-between gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <span>View hostel</span>
          <ArrowRight
            size={15}
            className="transition group-hover/btn:translate-x-0.5"
          />
        </button>
      </div>
    </article>
  );
}

/* ===============================================================
   LOADING STATE
================================================================ */

function LoadingState() {
  return (
    <div className="flex min-h-[450px] flex-col items-center justify-center rounded-[28px] border border-black/10 bg-white px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        <Loader2 size={27} className="animate-spin text-blue-600" />
      </div>
      <h3 className="mt-6 text-2xl font-semibold tracking-tight text-black">
        Finding your best matches
      </h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-neutral-500">
        We&apos;re comparing your preferences with approved and available
        hostels.
      </p>
    </div>
  );
}

/* ===============================================================
   INITIAL SEARCH STATE
================================================================ */

function InitialSearchState() {
  return (
    <div className="flex min-h-[450px] flex-col items-center justify-center rounded-[28px] border border-black/10 bg-white px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        <SearchIcon size={25} className="text-blue-600" />
      </div>
      <h3 className="mt-6 text-2xl font-semibold tracking-tight text-black">
        Tell us what you&apos;re looking for.
      </h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-neutral-500">
        Choose your city, budget, room type, amenities or hostel preference,
        then search for your best matches.
      </p>
    </div>
  );
}

/* ===============================================================
   ERROR STATE
================================================================ */

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex min-h-[450px] flex-col items-center justify-center rounded-[28px] border border-red-200 bg-red-50/30 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <AlertCircle size={27} className="text-red-500" />
      </div>
      <h3 className="mt-6 text-2xl font-semibold tracking-tight text-black">
        We couldn&apos;t load recommendations.
      </h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-neutral-500">
        {message}
      </p>
      <button
        onClick={onRetry}
        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        <RefreshCw size={16} />
        Try again
      </button>
    </div>
  );
}

/* ===============================================================
   EMPTY STATE
================================================================ */

function EmptyState({ clearFilters }) {
  return (
    <div className="flex min-h-[450px] flex-col items-center justify-center rounded-[28px] border border-black/10 bg-white px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        <SearchIcon size={25} className="text-blue-600" />
      </div>
      <h3 className="mt-6 text-2xl font-semibold tracking-tight text-black">
        We couldn&apos;t find a perfect match.
      </h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-neutral-500">
        Try widening your budget, choosing a different area, or removing some
        preferences.
      </p>
      <button
        onClick={clearFilters}
        className="mt-7 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Adjust filters
      </button>
    </div>
  );
}

/* ===============================================================
   MATCH FEATURE
================================================================ */

function MatchFeature({ number, title, text }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 transition hover:border-blue-200 hover:shadow-sm">
      <span className="text-xs font-bold tracking-wider text-blue-600">
        {number}
      </span>
      <h3 className="mt-5 text-base font-semibold text-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-neutral-500">{text}</p>
    </div>
  );
}

export default Search;
