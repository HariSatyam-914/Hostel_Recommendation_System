import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  AlertTriangle,
  BedDouble,
  Bike,
  Bus,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Coffee,
  Copy,
  Dumbbell,
  Droplets,
  ExternalLink,
  Flame,
  Heart,
  Home,
  Info,
  KeyRound,
  Landmark,
  LayoutGrid,
  Lock,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  ParkingCircle,
  Phone,
  Plus,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Train,
  Tv,
  Users,
  Utensils,
  WashingMachine,
  Wifi,
  X,
  Zap,
} from "lucide-react";

/* =========================================================
   REAL API DATA
   ---------------------------------------------------------
   Expected public endpoint:
     GET /api/hostels/{hostelId}/details

   Expected transit endpoint:
     GET /api/transit/nearby?lat={lat}&lng={lng}

   The backend should return ONLY approved/public information.
   No mock/demo data is used in this component.
   ========================================================= */

const API_BASE =
  (import.meta.env.VITE_API_URL || "http://localhost:8080")
    .replace(/\/$/, "");

const apiUrl = (path) => `${API_BASE}${path}`;

/* =========================================================
   ISSUE REPORTING API
   ---------------------------------------------------------
   Expected endpoints:
     GET  /api/issues/hostel/{hostelId}/mine
     POST /api/issues
       multipart/form-data:
         request (JSON):
           hostelId
           category
           subject
           description
           priority
         file (optional)
   The backend derives the owner/admin visibility from
   the hostelId and the authenticated user.
   ========================================================= */

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

const getHostelIdFromUrl = () => {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const index = parts.indexOf("hostels");

  if (index >= 0 && parts[index + 1]) {
    return parts[index + 1];
  }

  return parts[parts.length - 1] || null;
};

const formatPrice = (value) => {
  if (value === null || value === undefined || value === "") return "—";

  const number = Number(value);

  if (!Number.isFinite(number)) return "—";

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(number);
};

const titleCase = (value) => {
  if (!value) return "";

  return String(value)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const absoluteUrl = (value) => {
  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${API_BASE}${value}`;
  }

  return `${API_BASE}/${value}`;
};

const getVerifiedPhotoUrl = (photo) => {
  if (!photo) return "";

  // Some backend responses return the image path directly as a string.
  if (typeof photo === "string") {
    return absoluteUrl(photo);
  }

  const status = String(
    photo.verificationStatus ||
      photo.verification_status ||
      photo.status ||
      photo.approvalStatus ||
      ""
  ).toUpperCase();

  if (status && status !== "APPROVED") return "";

  // Support the different image-field names used by the backend.
  const value =
    photo.photoUrl ||
    photo.photoURL ||
    photo.imageUrl ||
    photo.imageURL ||
    photo.fileUrl ||
    photo.fileURL ||
    photo.filePath ||
    photo.filepath ||
    photo.imagePath ||
    photo.path ||
    photo.url ||
    photo.src ||
    photo.storagePath ||
    photo.fileName ||
    photo.filename ||
    "";

  return absoluteUrl(value);
};

const getPhotoArray = (...candidates) => {
  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 0) {
      return candidate;
    }
  }

  return [];
};

const getIconForAmenity = (amenity) => {
  const value = `${amenity?.amenityCode || ""} ${
    amenity?.amenityName || ""
  }`.toLowerCase();

  if (value.includes("wifi") || value.includes("internet")) return Wifi;
  if (value.includes("water") || value.includes("drinking"))
    return Droplets;
  if (value.includes("laundry") || value.includes("washing"))
    return WashingMachine;
  if (value.includes("gym") || value.includes("fitness"))
    return Dumbbell;
  if (value.includes("security") || value.includes("guard"))
    return ShieldCheck;
  if (value.includes("cctv") || value.includes("camera"))
    return ShieldCheck;
  if (value.includes("fire")) return Flame;
  if (value.includes("tv") || value.includes("television")) return Tv;
  if (value.includes("food") || value.includes("dining")) return Utensils;
  if (value.includes("kitchen")) return Utensils;
  if (value.includes("parking")) return ParkingCircle;
  if (value.includes("power") || value.includes("backup")) return Zap;
  if (value.includes("lock") || value.includes("biometric")) return Lock;

  return Home;
};

const normalizeHostelResponse = (data) => {
  const basic = data?.basicInfo || {};
  const location = data?.location || {};
  const rawAmenities = Array.isArray(data?.amenities)
    ? data.amenities
    : [];
  const rawRooms = Array.isArray(data?.roomsPricing)
    ? data.roomsPricing
    : Array.isArray(data?.rooms)
      ? data.rooms
      : [];

  const hostelPhotos = getPhotoArray(
    data?.photos,
    data?.hostelPhotos,
    data?.hostelImages,
    data?.images,
    data?.gallery,
    basic?.photos,
    basic?.hostelPhotos,
    basic?.hostelImages,
    basic?.images,
    basic?.gallery
  );

  const approvedHostelPhotos = hostelPhotos
    .map((photo, index) => ({
      id:
        typeof photo === "object"
          ? photo.id || photo.photoId || `hostel-photo-${index}`
          : `hostel-photo-${index}`,
      url: getVerifiedPhotoUrl(photo),
      label:
        typeof photo === "object" && photo.photoType === "COVER"
          ? "Hostel Cover"
          : "Hostel Photo",
    }))
    .filter((photo) => photo.url);

  const amenities = rawAmenities
    .map((amenity) => {
      const amenityPhotos = getPhotoArray(
        amenity.photos,
        amenity.images
      );

      // Prefer the single `photo` object returned by the backend,
      // but fall back to any approved entry inside a photos array.
      const candidatePhotos = [
        amenity.photo,
        amenity.amenityPhoto,
        amenity.photoUrl,
        amenity.photoURL,
        amenity.imageUrl,
        amenity.imageURL,
        amenity.image,
        ...amenityPhotos.slice().reverse(),
      ].filter(Boolean);

      const approvedPhoto = candidatePhotos.find((item) => {
        if (typeof item === "string") return true;

        const status = String(
          item?.verificationStatus ||
            item?.verification_status ||
            item?.status ||
            item?.approvalStatus ||
            ""
        ).toUpperCase();

        return !status || status === "APPROVED";
      });

      return {
        id: amenity.amenityId || amenity.id,
        name:
          amenity.amenityName ||
          titleCase(amenity.amenityCode),
        code: amenity.amenityCode,
        icon: getIconForAmenity(amenity),
        photoUrl: getVerifiedPhotoUrl(approvedPhoto),
      };
    })
    .filter((amenity) => amenity.name);

  const normalizedRooms = rawRooms.map((room) => {
    const roomPhotoList = getPhotoArray(
      room.photos,
      room.roomPhotos,
      room.roomImages,
      room.images
    );

    // Also support a room object that contains a single image URL.
    const roomPhotos =
      roomPhotoList.length > 0
        ? roomPhotoList
        : [
            room.photo,
            room.photoUrl,
            room.photoURL,
            room.image,
            room.imageUrl,
            room.imageURL,
            room.fileUrl,
            room.filePath,
          ].filter(Boolean);

    const photos = roomPhotos
      .map((photo, index) => ({
        id:
          typeof photo === "object"
            ? photo.id || photo.photoId || `room-photo-${room.id || "room"}-${index}`
            : `room-photo-${room.id || "room"}-${index}`,
        url: getVerifiedPhotoUrl(photo),
        label:
          typeof photo === "object"
            ? photo.originalFileName ||
              photo.originalFilename ||
              photo.fileName ||
              photo.filename ||
              "Room photo"
            : "Room photo",
      }))
      .filter((photo) => photo.url);

    const bedsPerRoom = Number(room.bedsPerRoom);
    const numberOfRooms = Number(room.numberOfRooms);
    const occupiedRoomsRaw = Number(room.occupiedRooms);
    const occupiedBedsRaw = Number(room.occupiedBeds);

    // Backend sometimes sends totalBeds = 0 even when bedsPerRoom and
    // numberOfRooms are set. In that case, derive totalBeds.
    const rawTotalBeds = Number(room.totalBeds);
    const derivedTotalBeds =
      Number.isFinite(bedsPerRoom) &&
      Number.isFinite(numberOfRooms) &&
      bedsPerRoom > 0 &&
      numberOfRooms > 0
        ? bedsPerRoom * numberOfRooms
        : null;

    const totalBeds =
      Number.isFinite(rawTotalBeds) && rawTotalBeds > 0
        ? rawTotalBeds
        : derivedTotalBeds;

    // Derive occupiedBeds if the backend sends 0 but occupiedRooms is set.
    const derivedOccupiedBeds =
      Number.isFinite(occupiedRoomsRaw) && occupiedRoomsRaw > 0
        ? occupiedRoomsRaw
        : null;

    const occupiedBeds =
      Number.isFinite(occupiedBedsRaw) && occupiedBedsRaw > 0
        ? occupiedBedsRaw
        : Number.isFinite(occupiedRoomsRaw) && occupiedRoomsRaw > 0
          ? occupiedRoomsRaw
          : Number.isFinite(occupiedBedsRaw)
            ? occupiedBedsRaw
            : null;

    const occupiedRooms = Number.isFinite(occupiedRoomsRaw)
      ? occupiedRoomsRaw
      : null;

    const availableBeds =
      Number.isFinite(totalBeds) && Number.isFinite(occupiedBeds)
        ? Math.max(totalBeds - occupiedBeds, 0)
        : null;

    const availableRooms =
      Number.isFinite(numberOfRooms) && Number.isFinite(occupiedRooms)
        ? Math.max(numberOfRooms - occupiedRooms, 0)
        : null;

    return {
      id: room.id,
      name: room.roomType || "Room",
      price: room.rentPerBed,
      available:
        availableRooms !== null
          ? availableRooms
          : availableBeds !== null
            ? availableBeds
            : null,
      availableBeds,
      availableRooms,
      beds:
        Number.isFinite(bedsPerRoom) && bedsPerRoom > 0
          ? bedsPerRoom
          : null,
      size: null,
      bathroom: null,
      ac: null,
      image: photos[0]?.url || "",
      photos,
      features: [],
      numberOfRooms: Number.isFinite(numberOfRooms)
        ? numberOfRooms
        : null,
      bedsPerRoom:
        Number.isFinite(bedsPerRoom) ? bedsPerRoom : null,
      totalBeds: Number.isFinite(totalBeds) ? totalBeds : null,
      occupiedRooms,
      occupiedBeds,
    };
  });

  const startingPrice = normalizedRooms
    .map((room) => Number(room.price))
    .filter(Number.isFinite)
    .sort((a, b) => a - b)[0];

  const rules = [];
  const rawRules = data?.rules || {};

  if (rawRules.noSmoking === true)
    rules.push("Smoking is not allowed.");
  if (rawRules.noAlcohol === true)
    rules.push("Alcohol is not allowed.");
  if (rawRules.noPets === true)
    rules.push("Pets are not allowed.");
  if (rawRules.visitorsAllowed === true)
    rules.push("Visitors are allowed.");
  if (rawRules.visitorsAllowed === false)
    rules.push("Visitors are not allowed.");
  if (rawRules.curfewEnabled === true)
    rules.push("Hostel curfew is enabled.");
  if (rawRules.additionalRules?.trim())
    rules.push(rawRules.additionalRules.trim());

  const deposit = data?.deposit || null;
  const owner = data?.owner || {};

  const ownerName =
    owner.name ||
    owner.fullName ||
    owner.ownerName ||
    basic.ownerName ||
    "Hostel Owner";

  const ownerPhone =
    owner.phoneNumber ||
    owner.phone ||
    owner.mobileNumber ||
    owner.mobile ||
    owner.contactNumber ||
    basic.ownerPhoneNumber ||
    basic.ownerPhone ||
    basic.contactNumber ||
    "";

  const ownerEmail =
    owner.email ||
    owner.emailAddress ||
    basic.ownerEmail ||
    basic.email ||
    "";

  const ownerVerified =
    String(
      owner.emailVerificationStatus ||
        owner.verificationStatus ||
        owner.verified ||
        ""
    ).toUpperCase() === "VERIFIED" ||
    owner.verified === true;

  const stats = [
    {
      label: "Total Beds",
      value: normalizedRooms.reduce(
        (sum, room) =>
          Number.isFinite(room.totalBeds)
            ? sum + room.totalBeds
            : sum,
        0
      ) || "—",
      icon: BedDouble,
    },
    {
      label: "Room Types",
      value: normalizedRooms.length,
      icon: Home,
    },
    {
      label: "Amenities",
      value: amenities.length,
      icon: Sparkles,
    },
    {
      label: "Property Status",
      value: "Verified",
      icon: ShieldCheck,
    },
  ];

  return {
    id: data?.hostelId,
    name: basic.hostelName || "Hostel",
    location: {
      area: location.area || "",
      city: location.city || "",
      state: location.state || "",
      pincode: location.pincode || "",
      landmark: location.landmark || "",
      address: location.address || "",
      latitude: location.latitude,
      longitude: location.longitude,
    },
    type: basic.hostelType || "Hostel",
    audience: basic.hostelType ? [basic.hostelType] : [],
    verified: true,
    rating: null,
    reviewCount: null,
    startingPrice,
    description:
      basic.description ||
      "No description has been provided for this hostel.",
    gallery: approvedHostelPhotos,
    stats,
    amenities,
    rooms: normalizedRooms,
    transport: [],
    rules,
    paymentPolicy: deposit
      ? {
          refundPolicy: deposit.refundPolicy || null,
        }
      : null,
    owner: {
      name: ownerName,
      phone: ownerPhone,
      email: ownerEmail,
      verified: ownerVerified,
    },
  };
};

const normalizeTransitResponse = (data) => {
  const places = [];

  const addPlace = (place, type) => {
    if (!place || !place.name) return;

    places.push({
      id: `${type}-${place.name}`,
      type,
      name: place.name,
      distanceKm: Number(place.distanceKm),
      latitude: place.latitude,
      longitude: place.longitude,
      icon:
        type === "Bus"
          ? Bus
          : type === "Railway"
            ? Landmark
            : type === "Airport"
              ? Navigation
              : Train,
    });
  };

  addPlace(data?.nearestMetro, "Metro");
  addPlace(data?.nearestBusStop, "Bus");
  addPlace(data?.nearestRailwayStation, "Railway");
  addPlace(data?.nearestAirport, "Airport");

  return places;
};

const formatDistance = (distanceKm) => {
  const value = Number(distanceKm);

  if (!Number.isFinite(value)) return "—";

  if (value < 1) {
    return `${Math.round(value * 1000)} m`;
  }

  return `${value.toFixed(1)} km`;
};

/* =========================================================
   HELPERS
   ========================================================= */

const extractIssueList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.issues)) return data.issues;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.reports)) return data.reports;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  if (Array.isArray(data?.data?.issues)) return data.data.issues;
  return [];
};

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function ViewDetails() {
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [transportFilter, setTransportFilter] = useState("All");
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllRules, setShowAllRules] = useState(false);
  const [roomFilter, setRoomFilter] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [transportLoading, setTransportLoading] = useState(false);
  const [transportError, setTransportError] = useState("");
  const [ownerCopied, setOwnerCopied] = useState(false);

  // Issue reporting
  const [issueType, setIssueType] = useState("");
  const [issueSubject, setIssueSubject] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [issuePriority, setIssuePriority] = useState("MEDIUM");
  const [issueFile, setIssueFile] = useState(null);
  const [issueSubmitting, setIssueSubmitting] = useState(false);
  const [issueSuccess, setIssueSuccess] = useState("");
  const [issueError, setIssueError] = useState("");
  const [reportedIssues, setReportedIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [expandedIssueId, setExpandedIssueId] = useState(null);
  const [issueDetails, setIssueDetails] = useState({});
  const [issueDetailsLoading, setIssueDetailsLoading] = useState({});
  const [issueActionLoading, setIssueActionLoading] = useState({});
  const [issueActionSuccess, setIssueActionSuccess] = useState("");
  const [issueActionError, setIssueActionError] = useState("");

  // User review
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const hostelId = getHostelIdFromUrl();

  React.useEffect(() => {
    let cancelled = false;

    const loadHostel = async () => {
      if (!hostelId) {
        setError("Hostel ID was not found in the URL.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          apiUrl(`/api/hostels/${hostelId}/details`),
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Unable to load hostel details (${response.status}).`
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setHostel(normalizeHostelResponse(data));
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load hostel details:", err);
          setError(
            err?.message ||
              "Unable to load hostel details. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadHostel();

    return () => {
      cancelled = true;
    };
  }, [hostelId]);

  React.useEffect(() => {
    let cancelled = false;

    const loadReportedIssues = async () => {
      if (!hostelId) return;

      try {
        setIssuesLoading(true);

        const response = await fetch(
          apiUrl(`/api/issues/hostel/${hostelId}/mine`),
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              ...getAuthHeaders(),
            },
            credentials: "include",
          }
        );

        if (response.status === 401 || response.status === 403) {
          if (!cancelled) setReportedIssues([]);
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Unable to load reported issues (${response.status}).`
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setReportedIssues(extractIssueList(data));
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load reported issues:", err);
          setReportedIssues([]);
        }
      } finally {
        if (!cancelled) setIssuesLoading(false);
      }
    };

    loadReportedIssues();

    return () => {
      cancelled = true;
    };
  }, [hostelId]);

  React.useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      if (!hostelId) return;

      try {
        setReviewsLoading(true);
        setReviewError("");

        const response = await fetch(
          apiUrl(`/api/reviews/hostel/${hostelId}`),
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const items = Array.isArray(data)
            ? data
            : Array.isArray(data?.reviews)
              ? data.reviews
              : Array.isArray(data?.content)
                ? data.content
                : [];

          if (!cancelled) setReviews(items);
        }
      } catch (err) {
        console.error("Failed to load hostel reviews:", err);
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    };

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [hostelId]);

  React.useEffect(() => {
    let cancelled = false;

    const loadMyReview = async () => {
      if (!hostelId) return;

      try {
        const response = await fetch(
          apiUrl(`/api/reviews/hostel/${hostelId}/mine`),
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              ...getAuthHeaders(),
            },
            credentials: "include",
          }
        );

        if (response.status === 401 || response.status === 403 || response.status === 404) {
          return;
        }

        if (!response.ok) return;

        const data = await response.json().catch(() => null);
        const mine = data?.review || data?.data || data;

        if (!cancelled && mine && typeof mine === "object" && !Array.isArray(mine)) {
          setReviewSubmitted(true);
          setReviewRating(Number(mine.rating) || 0);
          setReviewComment(mine.comment || mine.reviewText || mine.text || "");
        }
      } catch (err) {
        console.error("Failed to load your hostel review:", err);
      }
    };

    loadMyReview();

    return () => {
      cancelled = true;
    };
  }, [hostelId]);

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (reviewSubmitted) return;

    if (!getAuthHeaders().Authorization) {
      setReviewError("Please sign in before submitting a review.");
      return;
    }

    if (!hostelId) {
      setReviewError("Hostel information is not available.");
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError("Please select a rating from 1 to 5 stars.");
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError("Please write your review before submitting.");
      return;
    }

    if (reviewComment.trim().length < 10) {
      setReviewError("Please write at least 10 characters in your review.");
      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewError("");
      setReviewSuccess("");

      const response = await fetch(apiUrl("/api/reviews"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          hostelId: Number(hostelId),
          rating: Number(reviewRating),
          comment: reviewComment.trim(),
        }),
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("Please sign in before submitting a review.");
      }

      if (response.status === 409) {
        setReviewSubmitted(true);
        throw new Error("You have already submitted a review for this hostel. Reviews cannot be submitted twice.");
      }

      if (!response.ok) {
        let message = `Unable to submit the review (${response.status}).`;
        try {
          const errorData = await response.json();
          message = errorData?.message || errorData?.error || message;
        } catch {
          // Keep default message.
        }
        throw new Error(message);
      }

      const createdReview = await response.json().catch(() => null);
      if (createdReview) {
        setReviews((current) => [createdReview, ...current]);
      }

      // A submitted review is intentionally locked. There is no edit/delete flow.
      setReviewSubmitted(true);
      setReviewSuccess("Your review has been submitted successfully. It is now available in the hostel owner review page.");
    } catch (err) {
      console.error("Failed to submit hostel review:", err);
      setReviewError(err?.message || "Unable to submit your review right now. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  React.useEffect(() => {
    let cancelled = false;

    const loadTransport = async () => {
      if (
        !hostel?.location?.latitude ||
        !hostel?.location?.longitude
      ) {
        return;
      }

      try {
        setTransportLoading(true);
        setTransportError("");

        const params = new URLSearchParams({
          lat: String(hostel.location.latitude),
          lng: String(hostel.location.longitude),
        });

        const response = await fetch(
          apiUrl(`/api/transit/nearby?${params.toString()}`),
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Unable to load nearby transport (${response.status}).`
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setHostel((current) =>
            current
              ? {
                  ...current,
                  transport: normalizeTransitResponse(data),
                }
              : current
          );
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load nearby transport:", err);
          setTransportError(
            "Nearby transport could not be loaded right now."
          );
        }
      } finally {
        if (!cancelled) setTransportLoading(false);
      }
    };

    loadTransport();

    return () => {
      cancelled = true;
    };
  }, [hostel?.location?.latitude, hostel?.location?.longitude]);

  React.useEffect(() => {
    setActiveImage(0);
  }, [hostel?.id]);

  const transportTypes = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set((hostel?.transport || []).map((item) => item.type))
      ),
    ],
    [hostel?.transport]
  );

  const filteredTransport = useMemo(() => {
    const transport = hostel?.transport || [];

    if (transportFilter === "All") return transport;

    return transport.filter(
      (item) => item.type === transportFilter
    );
  }, [hostel?.transport, transportFilter]);

  const filteredRooms = useMemo(() => {
    const rooms = hostel?.rooms || [];

    if (roomFilter === "All") return rooms;

    if (roomFilter === "AC") {
      return rooms.filter((room) => room.ac === true);
    }

    if (roomFilter === "Available") {
      return rooms.filter(
        (room) =>
          room.available !== null &&
          Number(room.available) > 0
      );
    }

    return rooms;
  }, [hostel?.rooms, roomFilter]);

  const handleIssueFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    setIssueError("");
    setIssueSuccess("");

    if (!file) {
      setIssueFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setIssueFile(null);
      setIssueError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setIssueFile(null);
      setIssueError("The image must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }

    setIssueFile(file);
  };

  const resetIssueForm = () => {
    setIssueType("");
    setIssueSubject("");
    setIssueDescription("");
    setIssuePriority("MEDIUM");
    setIssueFile(null);
    setIssueSuccess("");
    setIssueError("");

    const fileInput = document.getElementById("issue-attachment");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmitIssue = async (event) => {
    event.preventDefault();

    if (!hostelId) {
      setIssueError("Hostel information is not available.");
      return;
    }

    if (!issueType || !issueSubject.trim() || !issueDescription.trim()) {
      setIssueError(
        "Please select an issue type and complete the subject and description."
      );
      return;
    }

    if (issueSubject.trim().length < 5) {
      setIssueError("Please provide a more descriptive subject.");
      return;
    }

    if (issueDescription.trim().length < 15) {
      setIssueError("Please provide more details about the issue.");
      return;
    }

    try {
      setIssueSubmitting(true);
      setIssueError("");
      setIssueSuccess("");

      const formData = new FormData();

      /*
       * The backend UserIssueController expects:
       *
       * @RequestPart("request") IssueCreateRequest request
       * @RequestPart(value = "file", required = false) MultipartFile file
       *
       * Therefore the issue fields must be sent together as a JSON
       * request part instead of being sent as separate form fields.
       */
      const issueRequest = {
        hostelId: Number(hostelId),
        category: issueType,
        subject: issueSubject.trim(),
        description: issueDescription.trim(),
        priority: issuePriority,
      };

      formData.append(
        "request",
        new Blob([JSON.stringify(issueRequest)], {
          type: "application/json",
        })
      );

      if (issueFile) {
        formData.append("file", issueFile);
      }

      const response = await fetch(apiUrl("/api/issues"), {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: formData,
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Please sign in before reporting an issue."
        );
      }

      if (!response.ok) {
        let message = `Unable to submit the issue (${response.status}).`;

        try {
          const errorData = await response.json();
          message =
            errorData?.message ||
            errorData?.error ||
            message;
        } catch {
          // Keep the default message when the server does not return JSON.
        }

        throw new Error(message);
      }

      const createdIssue = await response.json().catch(() => null);

      if (createdIssue) {
        // Normalize the created issue so it can be merged into the list.
        const normalizedIssue =
          createdIssue?.data && typeof createdIssue.data === "object"
            ? createdIssue.data
            : createdIssue;

        setReportedIssues((current) => [
          normalizedIssue,
          ...current,
        ]);
      } else {
        // If the server does not return the created issue,
        // refresh the list from the server so the new item appears.
        try {
          const refreshResponse = await fetch(
            apiUrl(`/api/issues/hostel/${hostelId}/mine`),
            {
              method: "GET",
              headers: {
                Accept: "application/json",
                ...getAuthHeaders(),
              },
              credentials: "include",
            }
          );

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            setReportedIssues(extractIssueList(refreshData));
          }
        } catch (refreshErr) {
          console.error("Failed to refresh reported issues:", refreshErr);
        }
      }

      resetIssueForm();

      setIssueSuccess(
        "Your issue has been submitted successfully. The owner and admin can now review it."
      );
    } catch (err) {
      console.error("Failed to submit issue:", err);
      setIssueError(
        err?.message ||
          "Unable to submit the issue right now. Please try again."
      );
    } finally {
      setIssueSubmitting(false);
    }
  };

  const loadIssueDetails = async (issueId) => {
    if (!issueId) return null;

    try {
      setIssueDetailsLoading((current) => ({
        ...current,
        [issueId]: true,
      }));

      setIssueActionError("");

      const response = await fetch(
        apiUrl(`/api/issues/${issueId}`),
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...getAuthHeaders(),
          },
          credentials: "include",
        }
      );

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Please sign in to view this issue."
        );
      }

      if (!response.ok) {
        let message =
          `Unable to load issue details (${response.status}).`;

        try {
          const errorData = await response.json();

          message =
            errorData?.message ||
            errorData?.error ||
            message;
        } catch {
          // Keep default error message.
        }

        throw new Error(message);
      }

      const data = await response.json();

      // Unwrap possible envelope.
      const normalizedDetails =
        data?.data && typeof data.data === "object" && !Array.isArray(data.data)
          ? data.data
          : data;

      setIssueDetails((current) => ({
        ...current,
        [issueId]: normalizedDetails,
      }));

      setReportedIssues((current) =>
        current.map((item) => {
          const currentId =
            item?.id ||
            item?.issueId;

          if (String(currentId) !== String(issueId)) {
            return item;
          }

          return {
            ...item,
            ...normalizedDetails,
            status:
              normalizedDetails?.status ||
              item?.status,
          };
        })
      );

      return normalizedDetails;
    } catch (err) {
      console.error(
        "Failed to load issue details:",
        err
      );

      setIssueActionError(
        err?.message ||
          "Unable to load issue details."
      );

      return null;
    } finally {
      setIssueDetailsLoading((current) => ({
        ...current,
        [issueId]: false,
      }));
    }
  };

  const handleApproveIssueResolution = async (issueId) => {
    if (!issueId) return;

    try {
      setIssueActionLoading((current) => ({
        ...current,
        [issueId]: "approve",
      }));

      setIssueActionError("");
      setIssueActionSuccess("");

      const response = await fetch(
        apiUrl(`/api/issues/${issueId}/approve-resolution`),
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            ...getAuthHeaders(),
          },
          credentials: "include",
        }
      );

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Please sign in before approving the resolution."
        );
      }

      if (!response.ok) {
        let message =
          `Unable to approve the resolution (${response.status}).`;

        try {
          const errorData = await response.json();

          message =
            errorData?.message ||
            errorData?.error ||
            message;
        } catch {
          // Keep default error.
        }

        throw new Error(message);
      }

      await response.json().catch(() => null);

      await loadIssueDetails(issueId);

      setReportedIssues((current) =>
        current.map((item) => {
          const currentId =
            item?.id ||
            item?.issueId;

          if (String(currentId) !== String(issueId)) {
            return item;
          }

          return {
            ...item,
            status: "CLOSED",
          };
        })
      );

      setIssueActionSuccess(
        "You confirmed that the issue has been resolved."
      );
    } catch (err) {
      console.error(
        "Failed to approve issue resolution:",
        err
      );

      setIssueActionError(
        err?.message ||
          "Unable to approve the resolution."
      );
    } finally {
      setIssueActionLoading((current) => ({
        ...current,
        [issueId]: false,
      }));
    }
  };

  const handleRejectIssueResolution = async (issueId) => {
    if (!issueId) return;

    try {
      setIssueActionLoading((current) => ({
        ...current,
        [issueId]: "reject",
      }));

      setIssueActionError("");
      setIssueActionSuccess("");

      const response = await fetch(
        apiUrl(`/api/issues/${issueId}/reject-resolution`),
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            ...getAuthHeaders(),
          },
          credentials: "include",
        }
      );

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Please sign in before rejecting the resolution."
        );
      }

      if (!response.ok) {
        let message =
          `Unable to reject the resolution (${response.status}).`;

        try {
          const errorData = await response.json();

          message =
            errorData?.message ||
            errorData?.error ||
            message;
        } catch {
          // Keep default error.
        }

        throw new Error(message);
      }

      await response.json().catch(() => null);

      await loadIssueDetails(issueId);

      setReportedIssues((current) =>
        current.map((item) => {
          const currentId =
            item?.id ||
            item?.issueId;

          if (String(currentId) !== String(issueId)) {
            return item;
          }

          return {
            ...item,
            status: "OPEN",
          };
        })
      );

      setIssueActionSuccess(
        "The issue has been sent back to the owner because it is not resolved."
      );
    } catch (err) {
      console.error(
        "Failed to reject issue resolution:",
        err
      );

      setIssueActionError(
        err?.message ||
          "Unable to reject the resolution."
      );
    } finally {
      setIssueActionLoading((current) => ({
        ...current,
        [issueId]: false,
      }));
    }
  };

  const formatIssueDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getIssueStatusLabel = (issue) => {
    const raw =
      issue?.status ||
      issue?.issueStatus ||
      issue?.state ||
      "OPEN";

    return titleCase(raw);
  };

  const getIssueStatusClass = (issue) => {
    const status = String(
      issue?.status ||
        issue?.issueStatus ||
        issue?.state ||
        "OPEN"
    ).toUpperCase();

    if (
      status === "RESOLVED" ||
      status === "CLOSED"
    ) {
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    }

    if (
      status === "REJECTED"
    ) {
      return "bg-red-50 text-red-700 ring-1 ring-red-200";
    }

    if (
      status === "OWNER_RESPONDED" ||
      status === "ADMIN_REVIEW" ||
      status === "UNDER_REVIEW"
    ) {
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    }

    return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
  };

  const handleShare = async () => {
    if (!hostel) return;

    const shareData = {
      title: hostel.name,
      text: `Check out ${hostel.name}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard");
      }
    } catch (shareError) {
      console.log("Share cancelled");
    }
  };

  const handleCopyOwnerPhone = async () => {
    if (!hostel?.owner?.phone) {
      alert("Phone number is not available for this owner.");
      return;
    }

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(hostel.owner.phone);
        setOwnerCopied(true);
        setTimeout(() => setOwnerCopied(false), 2000);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = hostel.owner.phone;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setOwnerCopied(true);
        setTimeout(() => setOwnerCopied(false), 2000);
      }
    } catch (copyError) {
      console.error("Failed to copy phone number:", copyError);
      alert("Unable to copy the phone number. Please copy it manually: " + hostel.owner.phone);
    }
  };

  const handleCallOwner = () => {
    if (!hostel?.owner?.phone) {
      alert("Phone number is not available for this owner.");
      return;
    }

    window.location.href = `tel:${hostel.owner.phone}`;
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-black/10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-blue-600" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold tracking-tight">Loading hostel details</h2>
            <p className="mt-2 text-sm leading-6 text-black/55">Fetching the latest information for this property.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !hostel) {
    return (
      <div className="min-h-screen bg-white text-black">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <div className="w-full max-w-lg rounded-[32px] border border-black/10 bg-white p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <Info size={22} />
            </div>
            <h2 className="mt-6 text-2xl font-semibold tracking-tight">Unable to load hostel</h2>
            <p className="mt-3 text-sm leading-7 text-black/60">
              {error || "No hostel details were returned by the server."}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-7 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const gallery =
    Array.isArray(hostel.gallery) && hostel.gallery.length > 0
      ? hostel.gallery
      : [];

  const locationText = [
    hostel.location.area,
    hostel.location.city,
    hostel.location.state,
    hostel.location.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const addressText = [
    hostel.location.address,
    hostel.location.landmark,
    locationText,
  ]
    .filter(Boolean)
    .join(" • ");

  const visibleAmenities = showAllAmenities
    ? hostel.amenities
    : hostel.amenities.slice(0, 10);

  const visibleRules = showAllRules
    ? hostel.rules
    : hostel.rules.slice(0, 6);

  const reviewItems = Array.isArray(reviews) ? reviews : [];

  const getReviewName = (review) =>
    review?.userName ||
    review?.username ||
    review?.user?.name ||
    review?.user?.fullName ||
    "User";

  const getReviewText = (review) =>
    review?.comment ||
    review?.reviewText ||
    review?.text ||
    "";

  const ownerInitials = (hostel.owner.name || "HO")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-white text-black selection:bg-blue-100 selection:text-blue-700">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="group flex items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 transition group-hover:border-blue-600 group-hover:text-blue-600">
              <ArrowLeft size={17} />
            </span>
            <span className="hidden text-sm font-semibold sm:block">Back to search</span>
          </button>

          <div className="hidden items-center gap-1 lg:flex">
            {[
              ["overview", "Overview"],
              ["rooms", "Rooms"],
              ["amenities", "Amenities"],
              ["transport", "Location"],
              ["rules","Rules"],
              ["payment","Deposit Policy"],
              ["owner","Host"],
              ["reviews", "Reviews"],
              ["issues", "Report"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollToSection(id)}
                className="rounded-full px-4 py-2 text-sm font-medium text-black/55 transition hover:bg-black/[0.03] hover:text-blue-600"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSaved((value) => !value)}
              className={`flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${
                saved
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-black/10 bg-white text-black hover:border-black/25"
              }`}
            >
              <Heart size={16} fill={saved ? "currentColor" : "none"} />
              <span className="hidden sm:block">{saved ? "Saved" : "Save"}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex h-10 items-center gap-2 rounded-full border border-black/10 bg-white px-4 text-sm font-semibold transition hover:border-black/25 hover:text-blue-600"
            >
              <Share2 size={16} />
              <span className="hidden sm:block">Share</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 lg:hidden"
              aria-label="Open navigation"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-black/5 bg-white px-5 py-4 lg:hidden">
            <div className="grid grid-cols-2 gap-2">
              {[
                ["overview", "Overview"],
                ["rooms", "Rooms"],
                ["amenities", "Amenities"],
                ["transport", "Location"],
                ["rules", "Rules"],
                ["payment", "Policies"],
                ["owner", "Host"],
                ["reviews", "Reviews"],
                ["issues", "Report issue"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToSection(id)}
                  className="rounded-2xl border border-black/5 px-4 py-3 text-left text-sm font-semibold transition hover:border-blue-100 hover:text-blue-600"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-[1400px] px-5 pb-28 sm:px-8 lg:px-12">
        {/* =====================================================
            EDITORIAL HERO / GALLERY
        ===================================================== */}
        <section className="pt-6 sm:pt-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                  {hostel.type || "Hostel"}
                </span>

                {hostel.audience.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-black/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-black/60"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <h1 className="max-w-5xl text-[clamp(3rem,7vw,7rem)] font-semibold leading-[0.9] tracking-[-0.065em] text-black">
                {hostel.name}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-black/60">
                <span className="inline-flex items-center gap-2">
                  <MapPin size={16} />
                  {locationText || "Location not provided"}
                </span>

                {hostel.startingPrice !== undefined && hostel.startingPrice !== null && (
                  <>
                    <span className="hidden h-1 w-1 rounded-full bg-black/20 sm:block" />
                    <span className="font-semibold text-black">
                      From ₹{formatPrice(hostel.startingPrice)} / month
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="border-l border-black/10 pl-7">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/40">
                  Property details
                </div>
                <p className="mt-3 text-sm leading-7 text-black/60">
                  Explore rooms, amenities, location, policies and reviews using the sections below.
                </p>
              </div>
            </div>
          </div>

          {gallery.length > 0 ? (
            <div className="mt-10 grid gap-2 overflow-hidden rounded-[32px] lg:grid-cols-[1.65fr_0.85fr]">
              <button
                type="button"
                onClick={() => setGalleryOpen(true)}
                className="group relative h-[430px] overflow-hidden bg-black/[0.03] text-left sm:h-[560px]"
              >
                <img
                  src={gallery[activeImage]?.url || undefined}
                  alt={gallery[activeImage]?.label || hostel.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/45 to-transparent" />
                <div className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold backdrop-blur-md">
                  {activeImage + 1} / {gallery.length} · View gallery
                </div>
              </button>

              <div className="grid grid-cols-2 gap-2 lg:grid-rows-2">
                {gallery.slice(1, 5).map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => {
                      setActiveImage(index + 1);
                      setGalleryOpen(true);
                    }}
                    className="group relative min-h-[180px] overflow-hidden bg-black/[0.03]"
                  >
                    <img
                      src={image.url || undefined}
                      alt={image.label || hostel.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    {index === 3 && gallery.length > 5 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold">
                          +{gallery.length - 5} more
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-10 flex h-[360px] items-center justify-center rounded-[32px] bg-black/[0.025] ring-1 ring-black/5">
              <div className="text-center">
                <Home size={30} className="mx-auto text-black/30" />
                <p className="mt-4 text-sm text-black/50">No approved hostel photos available.</p>
              </div>
            </div>
          )}
        </section>

        {/* =====================================================
            QUICK INFORMATION STRIP
        ===================================================== */}
        <section className="grid border-b border-black/10 py-7 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Starting price", hostel.startingPrice != null ? `₹${formatPrice(hostel.startingPrice)}` : "Not provided", "per month"],
            ["Room types", String(hostel.rooms.length), "available in this property"],
            ["Amenities", String(hostel.amenities.length), "listed for this property"],
            ["Beds", String(hostel.stats?.[0]?.value || "—"), "total beds when provided"],
          ].map(([label, value, note], index) => (
            <div
              key={label}
              className={`py-5 lg:px-6 ${index !== 0 ? "border-black/10 sm:border-l" : ""} ${index < 2 ? "border-b sm:border-b-0" : ""}`}
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/40">{label}</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
              <div className="mt-1 text-xs text-black/45">{note}</div>
            </div>
          ))}
        </section>

        {/* =====================================================
            OVERVIEW
        ===================================================== */}
        <section id="overview" className="scroll-mt-28 border-b border-black/10 py-20 lg:py-28">
          <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <SectionHeading
                eyebrow="01 · Overview"
                title="The details that matter before you decide."
                description="Everything shown here comes from the hostel detail data returned by the application."
              />
            </div>

            <div>
              <p className="max-w-3xl text-lg leading-8 text-black/65 sm:text-xl">
                {hostel.description || "No description has been provided for this hostel."}
              </p>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {hostel.stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="group rounded-[24px] border border-black/10 p-5 transition hover:border-blue-200 hover:shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/[0.035] transition group-hover:bg-blue-600 group-hover:text-white">
                          <Icon size={18} />
                        </div>
                        <ArrowUpRight size={17} className="text-black/25" />
                      </div>
                      <div className="mt-8 text-2xl font-semibold tracking-tight">{stat.value}</div>
                      <div className="mt-1 text-xs text-black/45">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            ROOMS
        ===================================================== */}
        <section id="rooms" className="scroll-mt-28 border-b border-black/10 py-20 lg:py-28">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="02 · Rooms"
              title="Compare the rooms, not just the property."
              description="Room type, rent, beds and occupancy are taken from the available room data."
            />

            <div className="flex w-fit rounded-full border border-black/10 p-1">
              {["All", "AC", "Available"].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setRoomFilter(filter)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    roomFilter === filter
                      ? "bg-blue-600 text-white"
                      : "text-black/55 hover:text-blue-600"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {filteredRooms.length > 0 ? (
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-[28px] border border-dashed border-black/10 p-10 text-center">
              <BedDouble size={28} className="mx-auto text-black/25" />
              <p className="mt-4 text-sm text-black/50">No rooms match this filter.</p>
            </div>
          )}
        </section>

        {/* =====================================================
            AMENITIES
        ===================================================== */}
        <section id="amenities" className="scroll-mt-28 border-b border-black/10 py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
            <SectionHeading
              eyebrow="03 · Amenities"
              title="What is available at the property."
              description="Only amenities returned by the hostel detail response are displayed."
            />

            <div>
              {visibleAmenities.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {visibleAmenities.map((amenity) => {
                    const Icon = amenity.icon;
                    return (
                      <div key={amenity.id || amenity.name} className="group overflow-hidden rounded-[22px] border border-black/10 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_40px_rgba(0,0,0,0.05)]">
                        {amenity.photoUrl ? (
                          <img
                            src={amenity.photoUrl}
                            alt={amenity.name}
                            className="h-28 w-full object-cover"
                            onError={(event) => {
                              // Hide broken images so the card collapses gracefully.
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : null}
                        <div className="p-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/[0.035] transition group-hover:bg-blue-600 group-hover:text-white">
                            <Icon size={17} />
                          </div>
                          <div className="mt-4 text-sm font-semibold">{amenity.name}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed border-black/10 p-8 text-sm text-black/50">
                  No amenities have been provided for this hostel.
                </div>
              )}

              {hostel.amenities.length > 10 && (
                <button
                  type="button"
                  onClick={() => setShowAllAmenities((value) => !value)}
                  className="mt-7 inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition hover:border-blue-600 hover:text-blue-600"
                >
                  {showAllAmenities ? "Show fewer" : `Show all ${hostel.amenities.length} amenities`}
                  <ChevronDown size={15} className={showAllAmenities ? "rotate-180" : ""} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            LOCATION / TRANSPORT
        ===================================================== */}
        <section id="transport" className="scroll-mt-28 border-b border-black/10 py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
            <SectionHeading
              eyebrow="04 · Location"
              title="Understand the neighbourhood before you move."
              description="Nearby transport is loaded from the property's coordinates when those coordinates are available."
            />

            <div>
              <div className="rounded-[30px] border border-black/10 p-5 sm:p-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/40">Address</div>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-black/65">
                      {addressText || "Address not provided."}
                    </p>
                  </div>

                  {hostel.location.latitude && hostel.location.longitude && (
                    <button
                      type="button"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${hostel.location.latitude},${hostel.location.longitude}`,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <ExternalLink size={15} />
                      Open in Maps
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-[30px] border border-black/10">
                <div className="flex flex-wrap gap-1 border-b border-black/10 p-2">
                  {transportTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTransportFilter(type)}
                      className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                        transportFilter === type
                          ? "bg-blue-600 text-white"
                          : "text-black/50 hover:text-blue-600"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {transportLoading ? (
                  <div className="p-7 text-sm text-black/50">Loading nearby transport...</div>
                ) : transportError ? (
                  <div className="p-7 text-sm text-black/50">{transportError}</div>
                ) : filteredTransport.length > 0 ? (
                  <div>
                    {filteredTransport.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.id} className={`flex items-center gap-4 p-5 ${index !== filteredTransport.length - 1 ? "border-b border-black/5" : ""}`}>
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black/[0.035]">
                            <Icon size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold">{item.name}</div>
                            <div className="mt-1 text-xs text-black/45">{item.type}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatDistance(item.distanceKm)}</div>
                            <div className="mt-1 text-xs text-black/40">away</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-7 text-sm text-black/50">No nearby transport information is available.</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            POLICIES
        ===================================================== */}
        <section id="rules" className="scroll-mt-28 border-b border-black/10 py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
            <SectionHeading
              eyebrow="05 · Rules"
              title="Know the house rules before you commit."
              description="These rules are generated from the policy information returned for this hostel."
            />

            <div>
              {visibleRules.length > 0 ? (
                <div className="space-y-2">
                  {visibleRules.map((rule, index) => (
                    <div key={`${rule}-${index}`} className="flex items-start gap-4 border-b border-black/10 py-5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/[0.04]">
                        <Check size={14} />
                      </span>
                      <p className="pt-0.5 text-sm leading-6 text-black/65">{rule}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed border-black/10 p-8 text-sm text-black/50">
                  No hostel rules have been provided.
                </div>
              )}

              {hostel.rules.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllRules((value) => !value)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition hover:border-blue-600 hover:text-blue-600"
                >
                  {showAllRules ? "Show fewer rules" : `View all ${hostel.rules.length} rules`}
                  <ChevronDown size={15} className={showAllRules ? "rotate-180" : ""} />
                </button>
              )}
            </div>
          </div>
        </section>

        {hostel.paymentPolicy && (
          <section id="payment" className="scroll-mt-28 border-b border-black/10 py-20 lg:py-28">
            <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
              <SectionHeading
                eyebrow="06 · Payment"
                title="Understand the deposit policy."
                description="Only the payment information returned by the hostel details endpoint is shown."
              />

              <div className="rounded-[30px] border border-black/10 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                    <KeyRound size={19} />
                  </div>
                  <div>
                    <div className="font-semibold">Refund policy</div>
                    <div className="mt-1 text-xs text-black/45">Provided by the property</div>
                  </div>
                </div>
                <div className="mt-8 text-3xl font-semibold tracking-tight">
                  {hostel.paymentPolicy.refundPolicy
                    ? titleCase(hostel.paymentPolicy.refundPolicy)
                    : "Not specified"}
                </div>
                <p className="mt-4 max-w-xl text-sm leading-7 text-black/55">
                  Confirm the complete deposit amount and payment terms directly with the hostel owner before making a payment.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            OWNER
        ===================================================== */}
        <section id="owner" className="scroll-mt-28 border-b border-black/10 py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
            <SectionHeading
              eyebrow="07 · Host"
              title="A direct line to the property owner."
              description="Reach out directly to the hostel owner using the contact details below."
            />

            <div className="rounded-[30px] border border-black/10 p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-lg font-semibold text-white">
                    {ownerInitials}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-xl font-semibold">{hostel.owner.name}</div>
                      {hostel.owner.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-blue-700 ring-1 ring-blue-100">
                          <ShieldCheck size={12} />
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-black/45">Hostel owner</div>
                  </div>
                </div>
              </div>

              {/* Owner details */}
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-black/40">
                    <Phone size={12} />
                    Phone
                  </div>
                  <div className="mt-2 break-all text-sm font-semibold text-black">
                    {hostel.owner.phone || "Not provided"}
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-black/40">
                    <MessageCircle size={12} />
                    Email
                  </div>
                  <div className="mt-2 break-all text-sm font-semibold text-black">
                    {hostel.owner.email || "Not provided"}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCopyOwnerPhone}
                  disabled={!hostel.owner.phone}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                    ownerCopied
                      ? "bg-emerald-600 text-white"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {ownerCopied ? <Check size={16} /> : <Copy size={16} />}
                  {ownerCopied ? "Phone copied!" : "Contact owner"}
                </button>

                <button
                  type="button"
                  onClick={handleCallOwner}
                  disabled={!hostel.owner.phone}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition hover:border-blue-600 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Phone size={16} />
                  Call owner
                </button>

                {hostel.owner.email && (
                  <a
                    href={`mailto:${hostel.owner.email}`}
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition hover:border-blue-600 hover:text-blue-600"
                  >
                    <Send size={16} />
                    Email owner
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            REVIEWS
        ===================================================== */}
        <section id="reviews" className="scroll-mt-28 border-b border-black/10 py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
            <SectionHeading
              eyebrow="08 · Reviews"
              title="Read what people have actually submitted."
              description="No placeholder testimonials are used here. Reviews are loaded from the hostel review endpoint."
            />

            <div className="space-y-6">
              <div className="rounded-[30px] border border-black/10 p-6 sm:p-8">
                {reviewsLoading ? (
                  <p className="text-sm text-black/50">Loading reviews...</p>
                ) : reviewItems.length === 0 ? (
                  <div className="py-8 text-center">
                    <Star size={26} className="mx-auto text-black/20" />
                    <p className="mt-4 text-sm text-black/50">No reviews have been submitted for this hostel yet.</p>
                  </div>
                ) : (
                  <div className="space-y-7">
                    {reviewItems.map((review, index) => {
                      const rating = Math.min(5, Math.max(0, Number(review?.rating) || 0));
                      const text = getReviewText(review);
                      return (
                        <article key={review?.id || review?.reviewId || index} className="border-b border-black/10 pb-7 last:border-b-0 last:pb-0">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="font-semibold">{getReviewName(review)}</div>
                              <div className="mt-2 flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} size={14} className={star <= rating ? "fill-current text-blue-600" : "text-black/15"} />
                                ))}
                              </div>
                            </div>
                            {(review?.createdAt || review?.submittedAt) && (
                              <div className="text-xs text-black/40">
                                {new Date(review.createdAt || review.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </div>
                            )}
                          </div>
                          {text && <p className="mt-4 text-sm leading-7 text-black/65">{text}</p>}
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-[30px] border border-black/10 bg-white p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Star size={19} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-black">Share your experience</h3>
                    <p className="mt-1 text-sm leading-6 text-black/55">One review per user for this hostel. After submission, your review is locked.</p>
                  </div>
                </div>

                {reviewSubmitted ? (
                  <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-700">
                    Your review has already been submitted for this hostel.
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="mt-7 space-y-5">
                    {reviewError && <div className="rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-700">{reviewError}</div>}
                    {reviewSuccess && <div className="rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">{reviewSuccess}</div>}

                    <div>
                      <div className="text-sm font-semibold text-black">Your rating</div>
                      <div className="mt-3 flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => { setReviewRating(star); setReviewError(""); }} className="rounded-lg p-1 transition hover:bg-black/5">
                            <Star size={25} className={star <= reviewRating ? "fill-current text-blue-600" : "text-black/20"} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="hostel-review-comment" className="text-sm font-semibold text-black">Your review</label>
                      <textarea
                        id="hostel-review-comment"
                        value={reviewComment}
                        onChange={(event) => { setReviewComment(event.target.value); setReviewError(""); }}
                        rows={5}
                        maxLength={1000}
                        placeholder="Share your experience with this hostel..."
                        className="mt-3 w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 text-black outline-none placeholder:text-black/30 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={reviewSubmitting || reviewRating === 0 || !reviewComment.trim()}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send size={16} />
                      {reviewSubmitting ? "Submitting..." : "Submit review"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            REPORT ISSUE
        ===================================================== */}
        <section id="issues" className="scroll-mt-28 py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
            <SectionHeading
              eyebrow="09 · Report"
              title="See something that needs attention?"
              description="Submit a report about incorrect information, room details, pricing, amenities, photos, safety or another property issue."
            />

            <div className="space-y-6">
              <div className="rounded-[30px] border border-black/10 bg-white p-6 sm:p-8">
                <form onSubmit={handleSubmitIssue} className="space-y-5">
                  {issueSuccess && <div className="rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">{issueSuccess}</div>}
                  {issueError && <div className="rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-700">{issueError}</div>}

                  <div>
                    <label htmlFor="issue-type" className="text-sm font-semibold">Issue type *</label>
                    <select id="issue-type" value={issueType} onChange={(event) => { setIssueType(event.target.value); setIssueError(""); }} className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" required>
                      <option value="">Select issue type</option>
                      <option value="INCORRECT_HOSTEL_INFORMATION">Incorrect hostel information</option>
                      <option value="WRONG_ROOM_INFORMATION">Wrong room information</option>
                      <option value="WRONG_PRICE">Wrong price / rent</option>
                      <option value="AMENITY_NOT_AVAILABLE">Amenity not available</option>
                      <option value="PHOTO_DOES_NOT_MATCH">Photo does not match hostel</option>
                      <option value="CLEANLINESS_MAINTENANCE">Cleanliness / maintenance</option>
                      <option value="SAFETY_CONCERN">Safety concern</option>
                      <option value="OWNER_RELATED">Owner-related issue</option>
                      <option value="LOCATION_ADDRESS">Location / address issue</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="issue-subject" className="text-sm font-semibold">Subject *</label>
                      <input id="issue-subject" type="text" value={issueSubject} onChange={(event) => { setIssueSubject(event.target.value); setIssueError(""); }} maxLength={150} placeholder="Short description" className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" required />
                    </div>
                    <div>
                      <label htmlFor="issue-priority" className="text-sm font-semibold">Priority</label>
                      <select id="issue-priority" value={issuePriority} onChange={(event) => setIssuePriority(event.target.value)} className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="issue-description" className="text-sm font-semibold">Description *</label>
                    <textarea id="issue-description" value={issueDescription} onChange={(event) => { setIssueDescription(event.target.value); setIssueError(""); }} rows={6} maxLength={2000} placeholder="Describe what is wrong..." className="mt-2 w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" required />
                  </div>

                  <div>
                    <label htmlFor="issue-attachment" className="text-sm font-semibold">Photo <span className="font-normal text-black/40">(optional)</span></label>
                    <input id="issue-attachment" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleIssueFileChange} className="mt-2 block w-full text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2.5 file:font-semibold file:text-white" />
                    <p className="mt-2 text-xs text-black/40">JPG, PNG or WEBP · maximum 10 MB</p>
                  </div>

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button type="button" onClick={resetIssueForm} disabled={issueSubmitting} className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition hover:border-black/25 disabled:opacity-50">Clear</button>
                    <button type="submit" disabled={issueSubmitting} className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50">
                      <Send size={15} />
                      {issueSubmitting ? "Submitting..." : "Submit issue"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="rounded-[30px] border border-black/10 bg-white p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <AlertTriangle size={19} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black">Your existing reports</h3>
                    <p className="mt-1 text-sm leading-6 text-black/50">Review reports you have already submitted for this hostel.</p>
                  </div>
                </div>

                {issuesLoading ? (
                  <div className="mt-6 text-sm text-black/50">Loading your reports...</div>
                ) : reportedIssues.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-black/[0.02] p-4 text-sm text-black/55">No previous reports for this hostel.</div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {reportedIssues.map((issue, index) => {
                      const issueId = issue?.id || issue?.issueId || `issue-${index}`;
                      const isExpanded = expandedIssueId === issueId;
                      const statusLabel = getIssueStatusLabel(issue);
                      const details = issueDetails[issueId] || issue;
                      const currentStatus = String(details?.status || details?.issueStatus || details?.state || "OPEN").toUpperCase();
                      const responses = Array.isArray(details?.responses) ? details.responses : [];

                      return (
                        <div key={issueId} className="rounded-2xl border border-black/10 bg-white p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-black">{issue?.subject || issue?.title || "Reported issue"}</div>
                              <div className="mt-1 text-xs text-black/40">{formatIssueDate(issue?.createdAt || issue?.reportedAt || issue?.createdDate)}</div>
                            </div>
                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${getIssueStatusClass(issue)}`}>{statusLabel}</span>
                          </div>

                          <button type="button" onClick={async () => { if (isExpanded) { setExpandedIssueId(null); return; } setExpandedIssueId(issueId); await loadIssueDetails(issueId); }} className="mt-3 text-xs font-semibold text-blue-600">
                            {isExpanded ? "Hide details" : "View report"}
                          </button>

                          {isExpanded && (
                            <div className="mt-4 space-y-4 border-t border-black/10 pt-4">
                              {issueDetailsLoading[issueId] ? (
                                <div className="text-sm text-black/50">Loading issue details...</div>
                              ) : (
                                <>
                                  <div>
                                    <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/40">Description</div>
                                    <p className="mt-2 text-sm leading-6 text-black/65">{details?.description || "No description available."}</p>
                                  </div>

                                  {responses.length > 0 && (
                                    <div>
                                      <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/40">Conversation</div>
                                      <div className="mt-3 space-y-2">
                                        {responses.map((response, responseIndex) => (
                                          <div key={response?.id || responseIndex} className="rounded-xl bg-black/[0.03] p-3">
                                            <div className="text-xs font-semibold text-black/75">
                                              {String(response?.responderType || response?.type || "Response").toUpperCase()}
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-black/55">{response?.message || response?.response || "No response message."}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {currentStatus === "RESOLVED" && (
                                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                                      <div className="text-sm font-semibold text-blue-800">Owner marked this issue as resolved.</div>
                                      <p className="mt-1 text-xs leading-5 text-blue-700">Confirm whether the problem has actually been solved.</p>
                                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                        <button type="button" disabled={!!issueActionLoading[issueId]} onClick={() => handleApproveIssueResolution(issueId)} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
                                          {issueActionLoading[issueId] === "approve" ? "Confirming..." : "Solved"}
                                        </button>
                                        <button type="button" disabled={!!issueActionLoading[issueId]} onClick={() => handleRejectIssueResolution(issueId)} className="rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-700 disabled:opacity-50">
                                          {issueActionLoading[issueId] === "reject" ? "Sending..." : "Not solved"}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================
          MOBILE ACTION BAR
      ===================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/10 bg-white/95 px-4 py-3 shadow-[0_-15px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/40">Starting from</div>
            <div className="truncate text-lg font-semibold">₹{formatPrice(hostel.startingPrice)} <span className="text-xs font-normal text-black/45">/ month</span></div>
          </div>
          <button
            type="button"
            onClick={handleCopyOwnerPhone}
            disabled={!hostel.owner.phone}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition ${
              ownerCopied ? "bg-emerald-600" : "bg-blue-600 hover:bg-blue-700"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {ownerCopied ? <Check size={16} /> : <MessageCircle size={16} />}
            {ownerCopied ? "Copied!" : "Contact owner"}
          </button>
        </div>
      </div>

      {/* =====================================================
          GALLERY LIGHTBOX
      ===================================================== */}
      {galleryOpen && gallery.length > 0 && (
        <ImageLightbox
          images={gallery}
          activeImage={activeImage}
          setActiveImage={setActiveImage}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </div>
  );
}

/* =========================================================
   SECTION HEADING
   ========================================================= */

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-9 max-w-3xl">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black">
        {eyebrow}
      </div>

      <h2 className="text-3xl font-semibold tracking-[-0.035em] text-black sm:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="mt-3 max-w-2xl text-sm leading-7 text-black sm:text-[15px]">
          {description}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   ROOM CARD
   ========================================================= */

function RoomCard({ room }) {
  const totalRooms = Number(room.numberOfRooms);
  const totalBeds = Number(room.totalBeds);
  const occupiedBeds = Number(room.occupiedBeds);
  const occupiedRooms = Number(room.occupiedRooms);
  const bedsPerRoom = Number(room.bedsPerRoom);

  const availableBeds =
    Number.isFinite(totalBeds) && Number.isFinite(occupiedBeds)
      ? Math.max(totalBeds - occupiedBeds, 0)
      : null;

  const availableRooms =
    Number.isFinite(totalRooms) && Number.isFinite(occupiedRooms)
      ? Math.max(totalRooms - occupiedRooms, 0)
      : null;

  // A room type is "Available" if it has at least one free bed.
  // If availability data is missing entirely, default to Available.
  const hasAvailabilityData =
    availableBeds !== null || availableRooms !== null;

  const isAvailable =
    !hasAvailabilityData ||
    (availableBeds !== null && availableBeds > 0) ||
    (availableRooms !== null && availableRooms > 0);

  return (
    <div className="overflow-hidden rounded-[24px] bg-white ring-1 ring-black/5 transition hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)]">
      <div className="grid sm:grid-cols-[230px_1fr]">
        <div className="relative h-56 bg-white sm:h-full">
          {room.image ? (
            <img
              src={room.image || undefined}
              alt={room.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-black">
              <BedDouble size={36} />
            </div>
          )}

          {/* Availability badge – top-left (image side) */}
          {hasAvailabilityData && (
            <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold backdrop-blur-md">
              {isAvailable
                ? `${availableBeds ?? availableRooms} available`
                : "Full"}
            </div>
          )}
        </div>

        <div className="relative p-5 sm:p-6">
          {/* Available / Not Available badge – top-right corner of card */}
          <span
            className={`absolute right-5 top-5 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${
              isAvailable
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : "bg-red-50 text-red-700 ring-1 ring-red-200"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isAvailable ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            {isAvailable ? "Available" : "Not Available"}
          </span>

          <div className="flex items-start justify-between gap-4 pr-24">
            <div>
              <h3 className="text-lg font-semibold">
                {room.name}
              </h3>

              <div className="mt-1 text-xs text-black/60">
                {Number.isFinite(totalRooms)
                  ? `${totalRooms} rooms in total`
                  : "Room information"}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-xl font-semibold">
              ₹{formatPrice(room.price)}
            </div>
            <div className="text-xs text-black/50">
              / month per bed
            </div>
          </div>

          {/* Key room statistics */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            {Number.isFinite(totalRooms) && (
              <RoomFeature
                icon={Home}
                text={`${totalRooms} Total Rooms`}
              />
            )}

            {Number.isFinite(totalBeds) && (
              <RoomFeature
                icon={BedDouble}
                text={`${totalBeds} Total Beds`}
              />
            )}

            {Number.isFinite(occupiedBeds) && (
              <RoomFeature
                icon={Users}
                text={`${occupiedBeds} Occupied Beds`}
              />
            )}

            {availableBeds !== null && (
              <RoomFeature
                icon={BedDouble}
                text={`${availableBeds} Beds Available`}
              />
            )}

            {Number.isFinite(bedsPerRoom) && (
              <RoomFeature
                icon={Users}
                text={`${bedsPerRoom} ${
                  bedsPerRoom === 1 ? "Bed" : "Beds"
                } / Room`}
              />
            )}

            {Number.isFinite(occupiedRooms) && (
              <RoomFeature
                icon={Home}
                text={`${occupiedRooms} Occupied Rooms`}
              />
            )}
          </div>

          {room.photos.length > 1 && (
            <div className="mt-5 grid grid-cols-3 gap-2">
              {room.photos.slice(0, 3).map((photo) => (
                <img
                  key={photo.id}
                  src={photo.url || undefined}
                  alt={photo.label}
                  className="h-20 w-full rounded-xl object-cover"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RoomFeature({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-black/[0.03] px-3 py-2.5 text-xs text-black">
      <Icon size={15} />
      {text}
    </div>
  );
}

/* =========================================================
   POLICY ITEM
   ========================================================= */

function PolicyItem({ label, value, highlight }) {
  return (
    <div className="border-b border-black/5 p-5 sm:nth-[n+7]:border-b-0">
      <div className="text-xs text-black">
        {label}
      </div>

      <div
        className={`mt-2 font-semibold ${
          highlight ? "text-2xl tracking-tight" : "text-base"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   MAP TRANSPORT PIN
   ========================================================= */

function TransportPin({ icon: Icon, label, position }) {
  return (
    <div className={`absolute ${position}`}>
      <div className="group relative">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-white shadow-lg">
          <Icon size={17} />
        </div>

        <div className="absolute left-1/2 top-12 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold opacity-0 shadow-md transition group-hover:opacity-100">
          {label}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   IMAGE LIGHTBOX
   ========================================================= */

function ImageLightbox({
  images,
  activeImage,
  setActiveImage,
  onClose,
}) {
  const current = images[activeImage];

  const previous = () => {
    setActiveImage(
      activeImage === 0 ? images.length - 1 : activeImage - 1
    );
  };

  const next = () => {
    setActiveImage(
      activeImage === images.length - 1 ? 0 : activeImage + 1
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4">
      <button
        onClick={onClose}
        className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
      >
        <X size={20} />
      </button>

      <button
        onClick={previous}
        className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 sm:left-8"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="flex h-full w-full max-w-6xl flex-col items-center justify-center">
        <div className="flex max-h-[78vh] w-full items-center justify-center">
          <img
            src={current.url || undefined}
            alt={current.label}
            className="max-h-[78vh] max-w-full rounded-xl object-contain"
          />
        </div>

        <div className="mt-5 text-center text-white">
          <div className="font-medium">
            {current.label}
          </div>

          <div className="mt-1 text-xs text-white/50">
            {activeImage + 1} of {images.length}
          </div>
        </div>

        <div className="mt-5 flex max-w-full gap-2 overflow-x-auto px-3 pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setActiveImage(index)}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg ${
                activeImage === index
                  ? "ring-2 ring-white"
                  : "opacity-50"
              }`}
            >
              <img
                src={image.url || undefined}
                alt={image.label}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={next}
        className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 sm:right-8"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}