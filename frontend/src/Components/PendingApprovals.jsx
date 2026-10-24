import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


import {
  LayoutDashboard,
  Clock,
  Building2,
  ShieldCheck,
  BarChart3,
  FileText,
  Users,
  Settings,
  History,
  HelpCircle,
  LogOut,
  Search,
  Bell,
  Moon,
  ArrowLeft,
  ImageOff,
  ChevronDown,
  Building,
  Menu,
  MessageSquareWarning,
  Gem,
  Check,
  CheckCircle2,
  AlertTriangle,
  Send,
  Phone,
  Ban,
  Undo2,
  RefreshCw,
} from "lucide-react";

const PendingApprovals = () => {
  const navigate = useNavigate();
  const { hostelId } = useParams();

  // Sidebar & Profile States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Data States
  const [hostelDetails, setHostelDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState([]);
  const [amenityPhotos, setAmenityPhotos] = useState([]);
  const [roomPhotos, setRoomPhotos] = useState([]);
  const [roomData, setRoomData] = useState([]);
    // Full image preview state
  const [imagePreview, setImagePreview] = useState({
    open: false,
    images: [],
    index: 0,
    title: "",
  });

  // Verification States
  const [photoVerification, setPhotoVerification] = useState({});
  const [photoActionLoading, setPhotoActionLoading] = useState({});
  const [adminNotes, setAdminNotes] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);

  // Reason Modal States
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonModalType, setReasonModalType] = useState('');
  const [reasonModalData, setReasonModalData] = useState(null);
  const [reasonText, setReasonText] = useState('');
  const [reasonSubmitting, setReasonSubmitting] = useState(false);

  // Section approval status
  const [sectionStatus, setSectionStatus] = useState({
    basicInfo: "PENDING",
    location: "PENDING",
    amenities: "PENDING",
    rooms: "PENDING",
    rules: "PENDING",
    deposit: "PENDING",
    hostelPhotos: "PENDING",
    ownerVerification: "PENDING",
  });

  const getPhotoVerificationStatus = (photo, type) => {
  const key = `${type.toUpperCase()}-${photo.id}`;

  return (
    photoVerification[key] ||
    photo.verificationStatus ||
    "PENDING"
  );
};

// ============================================================
// SECTION IMAGE REVIEW GATE
// A section that contains images may be accepted/rejected only
// after EVERY image has an explicit APPROVED or REJECTED status.
// A rejected image does NOT block the section once its decision
// has been recorded; only a PENDING image blocks the section.
// ============================================================
const getSectionImages = (sectionKey) => {
  if (sectionKey === "amenities") {
    return getRequiredAmenityPhotos().map((photo) => ({
      photo,
      type: "amenity",
    }));
  }

  if (sectionKey === "rooms") {
    return effectiveRooms.flatMap((room) =>
      getPhotosForRoom(room).map((photo) => ({
        photo,
        type: "room",
      }))
    );
  }

  if (sectionKey === "hostelPhotos") {
    return photos.map((photo) => ({
      photo,
      type: "hostel",
    }));
  }

  return [];
};

const getSectionImageReviewState = (sectionKey) => {
  const sectionImages = getSectionImages(sectionKey);

  if (sectionImages.length === 0) {
    return {
      hasImages: false,
      total: 0,
      approved: 0,
      rejected: 0,
      pending: 0,
    };
  }

  const summary = sectionImages.reduce(
    (result, { photo, type }) => {
      const status = getPhotoVerificationStatus(photo, type);

      if (status === "APPROVED") {
        result.approved += 1;
      } else if (status === "REJECTED") {
        result.rejected += 1;
      } else {
        result.pending += 1;
      }

      return result;
    },
    { approved: 0, rejected: 0, pending: 0 }
  );

  return {
    hasImages: true,
    total: sectionImages.length,
    ...summary,
  };
};

const canReviewSection = (sectionKey) => {
  const reviewState = getSectionImageReviewState(sectionKey);

  // Sections without images do not need image decisions.
  if (!reviewState.hasImages) {
    return true;
  }

  // IMPORTANT: rejected images are allowed. Only unresolved/pending
  // images prevent the section from being accepted or rejected.
  return reviewState.pending === 0;
};

const getSectionActionBlockReason = (sectionKey) => {
  const reviewState = getSectionImageReviewState(sectionKey);

  if (!reviewState.hasImages || reviewState.pending === 0) {
    return "";
  }

  return `${reviewState.pending} image${reviewState.pending === 1 ? "" : "s"} still require${reviewState.pending === 1 ? "s" : ""} a decision. Approve or reject every image before deciding this section.`;
};

const isOwnerContactVerified = () => {
  return hostelDetails?.owner?.emailVerificationStatus === "VERIFIED";
};

const getEffectiveSectionStatus = (sectionKey) => {
  if (sectionKey === "ownerVerification") {
    return isOwnerContactVerified() ? "APPROVED" : "PENDING";
  }

  return sectionStatus[sectionKey] || "PENDING";
};

const getPhotoVerificationSummary = (photos, type) => {
  const total = photos.length;

  const approved = photos.filter(
    photo => getPhotoVerificationStatus(photo, type) === "APPROVED"
  ).length;

  const rejected = photos.filter(
    photo => getPhotoVerificationStatus(photo, type) === "REJECTED"
  ).length;

  const pending = photos.filter(
    photo => getPhotoVerificationStatus(photo, type) === "PENDING"
  ).length;

  return {
    total,
    approved,
    rejected,
    pending,
  };
};

  // ============================================================
  // REVIEW SUMMARY / REJECTION INFORMATION
  // Non-image sections are informational and are considered reviewed.
  // Image sections are reviewed only after every image has an
  // explicit APPROVED or REJECTED decision.
  // ============================================================
  const getRejectedPhotoInformation = () => {
    const rejectedItems = [];

    getRequiredAmenityPhotos().forEach((photo) => {
      if (getPhotoVerificationStatus(photo, "amenity") === "REJECTED") {
        rejectedItems.push({
          id: `amenity-${photo.id}`,
          label: `${getAmenityDisplayName(photo)} Image`,
          reason:
            photo.rejectionReason ||
            photo.adminNote ||
            photo.verificationNote ||
            "No rejection reason provided",
        });
      }
    });

    effectiveRooms.forEach((room) => {
      getPhotosForRoom(room).forEach((photo) => {
        if (getPhotoVerificationStatus(photo, "room") === "REJECTED") {
          rejectedItems.push({
            id: `room-${photo.id}`,
            label: `${room.roomType || "Room"} Image`,
            reason:
              photo.rejectionReason ||
              photo.adminNote ||
              photo.verificationNote ||
              "No rejection reason provided",
          });
        }
      });
    });

    photos.forEach((photo, index) => {
      if (getPhotoVerificationStatus(photo, "hostel") === "REJECTED") {
        const photoLabel =
          photo.photoType === "COVER"
            ? "Hostel Cover Photo"
            : `Hostel Photo ${index + 1}`;

        rejectedItems.push({
          id: `hostel-${photo.id}`,
          label: photoLabel,
          reason:
            photo.rejectionReason ||
            photo.adminNote ||
            photo.verificationNote ||
            "No rejection reason provided",
        });
      }
    });

    return rejectedItems;
  };

  const getReviewSummaryStatus = (sectionKey) => {
    if (sectionKey === "ownerVerification") {
      return hostelDetails?.owner?.emailVerificationStatus === "VERIFIED"
        ? "REVIEWED"
        : "PENDING";
    }

    const imageSections = ["amenities", "rooms", "hostelPhotos"];

    if (imageSections.includes(sectionKey)) {
      return canReviewSection(sectionKey) ? "REVIEWED" : "PENDING";
    }

    return "REVIEWED";
  };

  const areAllReviewItemsComplete = () => {
    const nonOwnerSections = [
      "basicInfo",
      "location",
      "amenities",
      "rooms",
      "rules",
      "deposit",
      "hostelPhotos",
    ];

    const sectionsComplete = nonOwnerSections.every((key) => {
      if (["amenities", "rooms", "hostelPhotos"].includes(key)) {
        return canReviewSection(key);
      }
      return true;
    });

    const ownerVerified =
      hostelDetails?.owner?.emailVerificationStatus === "VERIFIED";

    return sectionsComplete && ownerVerified;
  };

  // ============================================================
  // OVERALL HOSTEL DECISION GATE
  // Overall Approve is enabled only when:
  // 1. Every section has been accepted.
  // 2. Every submitted image has an explicit APPROVED/REJECTED decision.
  // 3. Owner email verification is complete.
  // 4. Rejected images are not more than 50% of all submitted images.
  //
  // When rejected images are greater than 50%, only overall Reject
  // remains available.
  // ============================================================
  const getOverallImageReviewSummary = () => {
    const allImageItems = [
      ...getSectionImages("amenities"),
      ...getSectionImages("rooms"),
      ...getSectionImages("hostelPhotos"),
    ];

    const total = allImageItems.length;

    const approved = allImageItems.filter(
      ({ photo, type }) =>
        getPhotoVerificationStatus(photo, type) === "APPROVED"
    ).length;

    const rejected = allImageItems.filter(
      ({ photo, type }) =>
        getPhotoVerificationStatus(photo, type) === "REJECTED"
    ).length;

    const pending = allImageItems.filter(
      ({ photo, type }) =>
        getPhotoVerificationStatus(photo, type) === "PENDING"
    ).length;

    const rejectedPercentage = total > 0 ? (rejected / total) * 100 : 0;

    return {
      total,
      approved,
      rejected,
      pending,
      rejectedPercentage,
      rejectionThresholdExceeded: rejectedPercentage > 50,
    };
  };

  const areAllSectionsAccepted = () => {
    const sectionKeys = [
      "basicInfo",
      "location",
      "amenities",
      "rooms",
      "rules",
      "deposit",
      "hostelPhotos",
    ];

    return sectionKeys.every((key) => {
      if (sectionStatus[key] !== "APPROVED") {
        return false;
      }

      if (["amenities", "rooms", "hostelPhotos"].includes(key)) {
        return canReviewSection(key);
      }

      return true;
    });
  };

  const canApproveOverallHostel = () => {
    const imageSummary = getOverallImageReviewSummary();

    return (
      areAllSectionsAccepted() &&
      imageSummary.pending === 0 &&
      !imageSummary.rejectionThresholdExceeded &&
      hostelDetails?.owner?.emailVerificationStatus === "VERIFIED"
    );
  };

  const getOverallApproveBlockReason = () => {
    const imageSummary = getOverallImageReviewSummary();

    if (!areAllSectionsAccepted()) {
      return "Accept every section before approving the hostel.";
    }

    if (imageSummary.pending > 0) {
      return `${imageSummary.pending} image${imageSummary.pending === 1 ? "" : "s"} still require a decision.`;
    }

    if (imageSummary.rejectionThresholdExceeded) {
      return `More than 50% of images are rejected (${imageSummary.rejectedPercentage.toFixed(
        0
      )}%). Only Reject is available.`;
    }

    if (hostelDetails?.owner?.emailVerificationStatus !== "VERIFIED") {
      return "Owner email must be verified before approving the hostel.";
    }

    return "Approve hostel";
  };

  const defaultMarkerIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

  // Review history state
  const [reviewHistory, setReviewHistory] = useState([]);

  // Keep review history in local state and persist it for this hostel.
  // This helper was missing, which caused the ReferenceError when accepting
  // or requesting changes for a section.
  const addReviewHistoryEntry = (action, reason = "") => {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      action,
      reason,
      createdAt: new Date().toISOString(),
    };

    setReviewHistory((prev) => {
      const updated = [entry, ...prev];
      try {
        localStorage.setItem(
          `hostel-review-history-${hostelId}`,
          JSON.stringify(updated)
        );
      } catch (error) {
        console.error("Failed to save review history:", error);
      }
      return updated;
    });
  };

  // Overall approval permanently turns this page into a read-only audit view.
  const [isReadOnlyReview, setIsReadOnlyReview] = useState(false);

  // Track which sections have been reviewed/approved
  const [reviewedSections, setReviewedSections] = useState({});

  const sendOwnerEmailOtp = async (hostelId) => {
  if (!hostelId) {
    toast.error("Hostel ID is missing.");
    return;
  }

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("jwtToken") ||
    localStorage.getItem("accessToken");

  if (!token) {
    toast.error("Please login again.");
    return;
  }

  const endpoint =
    `/api/admin/hostels/${hostelId}/owner-email-verification/send-otp`;

  try {
    setSendingOtp(true);

    console.log("========== ADMIN SEND OWNER OTP ==========");
    console.log("Hostel ID:", hostelId);
    console.log("Endpoint:", endpoint);

    const response = await axios.post(
      `http://localhost:8080${endpoint}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("OTP API RESPONSE:", response.data);

    toast.success(
      response.data?.message || "OTP sent successfully to the owner."
    );

    // IMPORTANT:
    // Admin has now initiated owner verification.
    setHostelDetails((prev) => ({
      ...prev,
      owner: {
        ...prev?.owner,
        emailVerificationStatus: "OTP_SENT",
      },
    }));

  } catch (error) {
    console.error("========== OTP ERROR ==========");
    console.error("OTP ERROR:", error);
    console.error("STATUS:", error.response?.status);
    console.error("DATA:", error.response?.data);

    toast.error(
      error.response?.data?.message ||
      "Failed to send OTP to the owner."
    );
  } finally {
    setSendingOtp(false);
  }
};

  const formatReviewDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }
    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getAmenityChangesCount = () => {
    return getRequiredAmenityPhotos().filter((photo) => {
      const key = `AMENITY-${photo.id}`;
      const status = photoVerification[key] || photo.verificationStatus || "PENDING";
      return status === "REJECTED";
    }).length;
  };

  const getRequiredAmenityPhotos = () => {
    if (!Array.isArray(amenityPhotos)) {
      return [];
    }
    return amenityPhotos.filter((photo) => {
      return (
        photo.photoRequired === true ||
        photo.photoRequired === 1 ||
        photo.photoRequired === "1" ||
        photo.amenity?.photoRequired === true ||
        photo.amenity?.photoRequired === 1 ||
        photo.amenity?.photoRequired === "1" ||
        photo.amenityCode ||
        photo.amenityId ||
        photo.amenityName ||
        (photo.id && photo.photoUrl)
      );
    });
  };

  const getSelectedAmenities = () => {
    const amenities = hostelDetails?.amenities || hostelDetails?.amenity || hostelDetails?.basicInfo?.amenities || [];

    if (Array.isArray(amenities) && amenities.length > 0) {
      return amenities.map((amenity) => ({
        id: amenity.id,
        code: amenity.code || amenity.amenityCode || amenity.amenity?.code,
        name: amenity.name || amenity.amenityName || amenity.amenity?.name || amenity.code,
        photoRequired: Boolean(amenity.photoRequired ?? amenity.amenity?.photoRequired ?? false),
      }));
    }

    return amenityPhotos
      .map((photo) => ({
        id: photo.amenityId || photo.amenity?.id,
        code: photo.amenityCode || photo.code || photo.amenity?.code,
        name: photo.amenityName || photo.name || photo.amenity?.name || photo.amenityCode,
        photoRequired: true,
      }))
      .filter((amenity, index, self) =>
        index === self.findIndex((a) => a.code === amenity.code || a.id === amenity.id)
      );
  };

  const getAmenityIcon = (code) => {
    const icons = {
      ac: "❄️",
      wifi: "📶",
      fan: "🌀",
      bathroom: "🚿",
      cctv: "📹",
      lift: "🛗",
      ro_water: "💧",
      housekeeping: "🧹",
      powerbackup: "🔋",
      refrigerator: "🧊",
      balcony: "🌿",
      laundry: "🧺",
      mess: "🍽️",
      food: "🍽️",
      parking: "🅿️",
      gym: "🏋️",
      security: "🔐",
      tv: "📺",
      geyser: "🚿",
      kitchen: "🍳",
      LAN: "",
    };
    if (!code) {
      return "✓";
    }
    return icons[String(code).toLowerCase()] || "✓";
  };

  const extractAmenityCodeFromUrl = (photoUrl) => {
    if (!photoUrl) return null;
    const match = String(photoUrl).match(/\/?uploads\/amenities\/\d+\/([^/]+)\//);
    return match ? match[1] : null;
  };

  const extractRooms = (responseData) => {
    console.log("extractRooms called with:", responseData);
    let rooms = [];

    if (!responseData) {
      return [];
    }

    if (Array.isArray(responseData)) {
      rooms = responseData;
    } else if (Array.isArray(responseData.data)) {
      rooms = responseData.data;
    } else if (Array.isArray(responseData.rooms)) {
      rooms = responseData.rooms;
    } else if (Array.isArray(responseData.roomDetails)) {
      rooms = responseData.roomDetails;
    } else if (Array.isArray(responseData.hostelRooms)) {
      rooms = responseData.hostelRooms;
    } else if (Array.isArray(responseData.content)) {
      rooms = responseData.content;
    }

    return rooms.map((room) => ({
      id: Number(room.id ?? room.roomId ?? room.hostelRoomId),
      roomType: room.roomType ?? room.type ?? room.room_type ?? "",
      rentPerBed: room.rentPerBed ?? room.rent_per_bed ?? room.rent ?? 0,
      capacity: room.capacity ?? room.bedCount ?? room.bed_count ?? null,
    }));
  };

  const getAmenityDisplayName = (photo) => {
    if (photo.amenityName || photo.name || photo.amenity?.name) {
      return photo.amenityName || photo.name || photo.amenity?.name;
    }

    const codeFromUrl = extractAmenityCodeFromUrl(
      photo.photoUrl || photo.fileUrl || photo.imageUrl || photo.url
    );

    if (codeFromUrl) {
      const matched = getSelectedAmenities().find(
        (a) => a.code?.toLowerCase() === codeFromUrl.toLowerCase()
      );
      return matched?.name || codeFromUrl.toUpperCase();
    }

    return "Amenity";
  };

  const getRoomPhotos = (room) => {
    if (!room) {
      return [];
    }
    return Array.isArray(room.photos) ? room.photos : [];
  };

  const extractRoomIdFromUrl = (url) => {
    if (!url) return null;
    const match = url.match(/\/rooms\/[^/]+\/(\d+)\//);
    return match ? Number(match[1]) : null;
  };

  const getPhotosForRoom = (room) => {
    if (!room) return [];

    const roomId = Number(
      room.id || room.roomId || room.hostelRoomId
    );

    if (!roomId || !Array.isArray(roomPhotos)) {
      return [];
    }

    return roomPhotos.filter((photo) => {
      const photoRoomId = Number(
        photo.roomId ||
        photo.room?.id ||
        photo.hostelRoomId ||
        photo.hostelRoom?.id ||
        photo.room_id ||
        extractRoomIdFromUrl(
          photo.photoUrl ||
          photo.fileUrl ||
          photo.imageUrl ||
          photo.url ||
          photo.filePath
        )
      );
      return photoRoomId === roomId;
    });
  };

  const [roomImageUrls, setRoomImageUrls] = useState({});

  // ============================================================
  // FIXED: IMAGE URL HELPERS
  // ============================================================
  
  /**
   * Normalize a stored image path to a full URL
   * Handles various path formats and ensures proper URL construction
   */
  const normalizeImagePath = (path) => {
    if (!path || typeof path !== 'string') {
      return '';
    }

    // Trim and clean up the path
    let normalized = path.trim().replace(/\\/g, '/');

    // If it's already a full URL, return as is
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
      return normalized;
    }

    // If it's a blob or data URL, return as is
    if (normalized.startsWith('blob:') || normalized.startsWith('data:')) {
      return normalized;
    }

    // Remove leading slashes and ./ to avoid double slashes
    normalized = normalized.replace(/^\.\//, '');
    normalized = normalized.replace(/^\/+/, '');

    // If the path is empty after cleaning, return empty
    if (!normalized) {
      return '';
    }

    // Build the full URL
    return `http://localhost:8080/${normalized}`;
  };

  /**
   * Get the rendered image URL for a photo
   * First checks protectedImageUrls (blob URLs), then falls back to direct URL
   */
  const getRenderedImageUrl = (photo, type = "hostel") => {
    if (!photo) return '';

    // Check if we have a protected (blob) URL for this photo
    const protectedUrl = photo.id ? protectedImageUrls[`${type}-${photo.id}`] : '';
    if (protectedUrl) {
      return protectedUrl;
    }

    // Get the raw path from the photo object
    const rawPath = photo.photoUrl || photo.fileUrl || photo.imageUrl || photo.url || photo.filePath || photo.imagePath;
    
    if (!rawPath || typeof rawPath !== 'string') {
      return '';
    }

    // Normalize the path to a full URL
    return normalizeImagePath(rawPath);
  };

  // Protected image URLs used by the admin review page. The photo endpoints can
  // require the admin bearer token, so fetch the files as blobs before rendering.
  const [protectedImageUrls, setProtectedImageUrls] = useState({});

  // ============================================================
  // FIXED: IMAGE LOADING EFFECT
  // ============================================================
  useEffect(() => {
    let cancelled = false;
    const createdUrls = [];

    const loadAllImages = async () => {
      const token = localStorage.getItem("token") || localStorage.getItem("jwtToken") || localStorage.getItem("accessToken");

      // Collect all photos with their types
      const allPhotos = [
        ...photos.map((p) => ({ photo: p, type: 'hostel' })),
        ...amenityPhotos.map((p) => ({ photo: p, type: 'amenity' })),
        ...roomPhotos.map((p) => ({ photo: p, type: 'room' })),
      ];

      if (allPhotos.length === 0) {
        setProtectedImageUrls({});
        return;
      }

      // First, set initial direct URLs for all photos
      const initialUrls = {};
      allPhotos.forEach(({ photo, type }) => {
        if (photo.id) {
          const rawPath = photo.photoUrl || photo.fileUrl || photo.imageUrl || photo.url || photo.filePath || photo.imagePath;
          if (rawPath) {
            const directUrl = normalizeImagePath(rawPath);
            if (directUrl) {
              initialUrls[`${type}-${photo.id}`] = directUrl;
            }
          }
        }
      });
      
      if (!cancelled) {
        setProtectedImageUrls(initialUrls);
      }

      // If no token, we can't fetch protected images, but direct URLs will still work
      if (!token) {
        console.warn('No auth token found, using direct image URLs');
        return;
      }

      // Try to fetch each image as a blob for better compatibility
      for (const { photo, type } of allPhotos) {
        if (cancelled) break;
        
        if (!photo.id) continue;

        const rawPath = photo.photoUrl || photo.fileUrl || photo.imageUrl || photo.url || photo.filePath || photo.imagePath;
        if (!rawPath) continue;

        const imageUrl = normalizeImagePath(rawPath);
        if (!imageUrl) continue;

        try {
          const response = await axios.get(imageUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseType: 'blob',
            timeout: 10000,
          });

          // Check if response is actually an image
          const contentType = response.headers['content-type'] || '';
          if (!contentType.startsWith('image/')) {
            console.warn(`Photo ${photo.id} is not an image (${contentType})`);
            continue;
          }

          const blob = new Blob([response.data], { type: contentType });
          const blobUrl = URL.createObjectURL(blob);
          createdUrls.push(blobUrl);

          if (!cancelled) {
            setProtectedImageUrls((prev) => ({
              ...prev,
              [`${type}-${photo.id}`]: blobUrl,
            }));
          }
        } catch (error) {
          console.error(`Failed to fetch ${type} photo ${photo.id}:`, error.message);
          // Keep the direct URL as fallback
        }
      }
    };

    loadAllImages();

    return () => {
      cancelled = true;
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photos, amenityPhotos, roomPhotos]);

  // ============================================================
  // ROOM IMAGES LOADING (kept separate for room-specific handling)
  // ============================================================
  useEffect(() => {
    let cancelled = false;
    const createdUrls = [];

    const loadRoomImages = async () => {
      if (!Array.isArray(roomPhotos) || roomPhotos.length === 0) {
        setRoomImageUrls({});
        return;
      }

      const token = localStorage.getItem("token") || localStorage.getItem("jwtToken") || localStorage.getItem("accessToken");

      const urls = {};

      // First set direct URLs
      roomPhotos.forEach((photo) => {
        if (photo.id) {
          const rawPath = photo.photoUrl || photo.fileUrl || photo.imageUrl || photo.url || photo.filePath || photo.imagePath;
          if (rawPath) {
            const directUrl = normalizeImagePath(rawPath);
            if (directUrl) {
              urls[photo.id] = directUrl;
            }
          }
        }
      });

      if (!cancelled) {
        setRoomImageUrls(urls);
      }

      if (!token) {
        return;
      }

      // Try to fetch as blobs
      for (const photo of roomPhotos) {
        if (cancelled) break;
        if (!photo.id) continue;

        const rawPath = photo.photoUrl || photo.fileUrl || photo.imageUrl || photo.url || photo.filePath || photo.imagePath;
        if (!rawPath) continue;

        const imageUrl = normalizeImagePath(rawPath);
        if (!imageUrl) continue;

        try {
          const response = await axios.get(imageUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseType: 'blob',
            timeout: 10000,
          });

          const contentType = response.headers['content-type'] || '';
          if (!contentType.startsWith('image/')) {
            continue;
          }

          const blob = new Blob([response.data], { type: contentType });
          const blobUrl = URL.createObjectURL(blob);
          createdUrls.push(blobUrl);

          if (!cancelled) {
            setRoomImageUrls((prev) => ({
              ...prev,
              [photo.id]: blobUrl,
            }));
          }
        } catch (error) {
          console.error(`Failed to fetch room photo ${photo.id}:`, error.message);
        }
      }
    };

    loadRoomImages();

    return () => {
      cancelled = true;
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [roomPhotos]);

  useEffect(() => {
    if (!hostelId) {
      setError("Hostel ID is missing.");
      setIsLoading(false);
      return;
    }

    const fetchAllData = async () => {
      try {
        setIsLoading(true);

        const token = localStorage.getItem("token") || localStorage.getItem("jwtToken") || localStorage.getItem("accessToken");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Fetch details
        const detailsRes = await axios
          .get(`http://localhost:8080/api/admin/hostels/${hostelId}`, { headers })
          .catch(() => ({ data: null }));

        if (detailsRes.data) {
          setHostelDetails(detailsRes.data);

          // If the hostel has already been approved or rejected, reconstruct
          // the persisted final review state from the backend status.
          // REJECTED remains stored until the owner submits it again, so
          // opening it must not make it look like a brand-new pending hostel.
          const persistedApprovalStatus = String(
            detailsRes.data?.approvalStatus || ""
          )
            .trim()
            .toUpperCase();

          if (
            persistedApprovalStatus === "APPROVED" ||
            persistedApprovalStatus === "REJECTED"
          ) {
            setIsReadOnlyReview(true);

            if (persistedApprovalStatus === "APPROVED") {
              setSectionStatus({
                basicInfo: "APPROVED",
                location: "APPROVED",
                amenities: "APPROVED",
                rooms: "APPROVED",
                rules: "APPROVED",
                deposit: "APPROVED",
                hostelPhotos: "APPROVED",
                ownerVerification: "APPROVED",
              });
            }

            if (persistedApprovalStatus === "APPROVED") {
              setReviewedSections({
                basicInfo: true,
                location: true,
                amenities: true,
                rooms: true,
                rules: true,
                deposit: true,
                hostelPhotos: true,
                ownerVerification: true,
              });
            }

            try {
              const storedHistory = localStorage.getItem(
                `hostel-review-history-${hostelId}`
              );
              if (storedHistory) {
                const parsedHistory = JSON.parse(storedHistory);
                if (Array.isArray(parsedHistory)) {
                  setReviewHistory(parsedHistory);
                }
              }
            } catch (historyError) {
              console.error("Failed to restore review history:", historyError);
            }
          }

          // Populate roomData from hostel details
          const extractedRooms = extractRooms(
            detailsRes.data.rooms ||
            detailsRes.data.roomsPricing ||
            detailsRes.data.roomDetails ||
            detailsRes.data.roomsList ||
            detailsRes.data.hostelRooms ||
            detailsRes.data.room ||
            []
          );

          if (extractedRooms.length > 0) {
            setRoomData(extractedRooms);
          }

          // If review history exists in response, set it
          if (detailsRes.data.reviewHistory) {
            setReviewHistory(detailsRes.data.reviewHistory);
          }

          // If section status exists in response, set it
          if (detailsRes.data.sectionStatus) {
            setSectionStatus(prev => ({
              ...prev,
              ...detailsRes.data.sectionStatus
            }));
          }
        }

        // Fetch general photos
        const photosRes = await axios
          .get(`http://localhost:8080/api/admin/hostels/${hostelId}/photos`, { headers })
          .catch(() => ({ data: [] }));

        setPhotos(extractPhotos(photosRes.data));

        // Fetch amenity photos
        try {
          const amenityRes = await axios.get(
            `http://localhost:8080/api/admin/hostels/${hostelId}/amenity-photos`,
            { headers }
          );

          console.log("========== AMENITY PHOTO API ==========");
          console.log("Hostel ID:", hostelId);
          console.log("Status:", amenityRes.status);
          console.log("Response RAW:", amenityRes.data);
          console.log("Response JSON:", JSON.stringify(amenityRes.data, null, 2));
          console.log("Is Array:", Array.isArray(amenityRes.data));
          console.log("Length:", Array.isArray(amenityRes.data) ? amenityRes.data.length : "N/A");

          setAmenityPhotos(extractPhotos(amenityRes.data));
        } catch (err) {
          console.error("========== AMENITY PHOTO API ERROR ==========");
          console.error("Status:", err.response?.status);
          console.error("Response:", err.response?.data);
          console.error("Error:", err);
          setAmenityPhotos([]);
        }

        // Fetch room photos
        try {
          console.log("========== FETCHING ROOM PHOTOS ==========");
          console.log("Hostel ID:", hostelId);

          const roomRes = await axios.get(
            `http://localhost:8080/api/admin/hostels/${hostelId}/room-photos`,
            { headers }
          );

          console.log("Room Photos Response Status:", roomRes.status);
          console.log("Room Photos Response Data:", roomRes.data);

          const extractedRoomPhotos = extractPhotos(roomRes.data);

          console.log("Extracted Room Photos:", extractedRoomPhotos);
          console.log("Extracted Room Photos Count:", extractedRoomPhotos.length);

          if (extractedRoomPhotos.length > 0) {
            console.log("Sample room photo:", extractedRoomPhotos[0]);
            console.log("Sample room photo keys:", Object.keys(extractedRoomPhotos[0]));
          }

          setRoomPhotos(extractedRoomPhotos);
        } catch (err) {
          console.error("========== ROOM PHOTO API ERROR ==========");
          console.error("Status:", err.response?.status);
          console.error("Response:", err.response?.data);
          console.error("Error:", err);
          setRoomPhotos([]);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [hostelId]);

  const effectiveRooms =
    Array.isArray(roomData) && roomData.length > 0
      ? roomData
      : (hostelDetails?.rooms || hostelDetails?.roomDetails || hostelDetails?.roomsList || []).length > 0
      ? (hostelDetails?.rooms || hostelDetails?.roomDetails || hostelDetails?.roomsList || [])
      : Array.from(
          new Map(
            roomPhotos
              .map((photo) => {
                let id = photo.roomId || photo.room?.id || photo.hostelRoomId || photo.hostelRoom?.id || photo.room_id;

                if (!id) {
                  id = extractRoomIdFromUrl(
                    photo.photoUrl || photo.fileUrl || photo.imageUrl || photo.url || photo.filePath
                  );
                }

                if (!id) return null;

                id = Number(id);

                if (!Number.isFinite(id)) return null;

                return [
                  id,
                  {
                    id,
                    roomType: photo.roomType || photo.room?.roomType || photo.room?.type || `Room ${id}`,
                    rentPerBed: photo.rentPerBed ?? photo.rent ?? photo.room?.rentPerBed ?? photo.room?.price ?? null,
                    capacity: photo.capacity ?? photo.room?.capacity ?? photo.room?.bedCount ?? null,
                  },
                ];
              })
              .filter(Boolean)
          ).values()
        );

  // Photo verification handler with reason support
  const handlePhotoVerification = async (photoId, photoType, status, reason = '') => {
    if (isReadOnlyReview) return;

    const key = `${photoType}-${photoId}`;

    if (!photoId) {
      toast.error("Photo ID is missing.");
      return;
    }

    try {
      setPhotoActionLoading((prev) => ({
        ...prev,
        [key]: true,
      }));

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("jwtToken") ||
        localStorage.getItem("accessToken");

      if (!token) {
        toast.error("Please login again.");
        return;
      }

      console.log("Updating photo verification:", {
        photoId,
        photoType,
        status,
        reason,
        tokenPresent: !!token,
      });

      const response = await axios.put(
        `http://localhost:8080/api/admin/photos/${photoType}/${photoId}/verification`,
        {
          status: status,
          rejectionReason: status === "REJECTED" ? reason : null,
          adminNote: reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Photo verification response:", response.data);

      // Update photoVerification state
      setPhotoVerification((prev) => ({
        ...prev,
        [key]: status,
      }));

      // Update amenityPhotos if it's an amenity photo
      if (photoType === "amenity") {
        setAmenityPhotos((prevPhotos) =>
          prevPhotos.map((photo) =>
            photo.id === photoId
              ? {
                  ...photo,
                  verificationStatus: status,
                  rejectionReason: status === "REJECTED" ? reason : photo.rejectionReason,
                  adminNote: reason,
                }
              : photo
          )
        );
      }

      // Update photos state if it's a hostel photo
      if (photoType === "hostel") {
        setPhotos((prevPhotos) =>
          prevPhotos.map((photo) =>
            photo.id === photoId
              ? {
                  ...photo,
                  verificationStatus: status,
                  rejectionReason: status === "REJECTED" ? reason : photo.rejectionReason,
                  adminNote: reason,
                }
              : photo
          )
        );
      }

      // Update roomPhotos if it's a room photo
      if (photoType === "room") {
        setRoomPhotos((prevPhotos) =>
          prevPhotos.map((photo) =>
            photo.id === photoId
              ? {
                  ...photo,
                  verificationStatus: status,
                  rejectionReason: status === "REJECTED" ? reason : photo.rejectionReason,
                  adminNote: reason,
                }
              : photo
          )
        );
      }

      addReviewHistoryEntry(
        `Photo ${photoType} ${photoId} ${status}`,
        status === "REJECTED" ? `Rejection reason: ${reason}` : `Photo verification ${status.toLowerCase()}`
      );

      toast.success(`Photo ${status.toLowerCase()} successfully`);

    } catch (err) {
      console.error(`Failed to update photo ${photoId}:`, err);

      console.error("HTTP status:", err.response?.status);
      console.error("Response data:", err.response?.data);
      console.error("Response headers:", err.response?.headers);

      if (err.response?.status === 403) {
        toast.error(
          "Photo verification was rejected by the server."
        );
      } else if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(
          err.response?.data?.message ||
          "Failed to update photo verification"
        );
      }

    } finally {
      setPhotoActionLoading((prev) => ({
        ...prev,
        [key]: false,
      }));
    }
  };

  // Reason Modal functions
  const openReasonModal = (type, data) => {
    setReasonText('');
    setReasonModalType(type);
    setReasonModalData(data);
    setShowReasonModal(true);
  };

  const closeReasonModal = () => {
    setShowReasonModal(false);
    setReasonText('');
    setReasonModalData(null);
    setReasonModalType('');
  };

  const handleReasonSubmit = async () => {
    if (!reasonText.trim()) {
      toast.error('Please provide a reason for this action.');
      return;
    }

    setReasonSubmitting(true);

    try {
      if (reasonModalType === 'photo-reject') {
        const { photoId, photoType } = reasonModalData;
        await handlePhotoVerification(photoId, photoType, 'REJECTED', reasonText.trim());
      } else if (reasonModalType === 'section-changes') {
        const { sectionKey } = reasonModalData;
        await handleSectionRequestChanges(sectionKey, reasonText.trim());
      }
      closeReasonModal();
    } catch (error) {
      console.error('Failed to submit reason:', error);
      toast.error('Failed to submit reason. Please try again.');
    } finally {
      setReasonSubmitting(false);
    }
  };

  // Handle section request changes with reason.
  // Request Changes is the ONLY section action that opens the reason modal.
  const handleSectionRequestChanges = (sectionKey, reason = '') => {
    if (isReadOnlyReview) return;

    const sectionNames = {
      basicInfo: "Basic Information",
      location: "Location",
      amenities: "Amenities",
      rooms: "Rooms",
      rules: "Rules",
      deposit: "Deposit",
      hostelPhotos: "Hostel Photos",
      ownerVerification: "Owner Verification"
    };

    setSectionStatus(prev => ({
      ...prev,
      [sectionKey]: "CHANGES_REQUIRED"
    }));

    setReviewedSections(prev => ({
      ...prev,
      [sectionKey]: false
    }));

    addReviewHistoryEntry(
      `Requested changes for ${sectionNames[sectionKey]}`,
      reason || "Changes requested by admin"
    );

    toast.success(`Changes requested for ${sectionNames[sectionKey]}`);
  };

  // Accept a section directly.
  // IMPORTANT: No reason modal is opened for Accept.
  const handleSectionApprove = (sectionKey) => {
    if (isReadOnlyReview) return;

    const sectionNames = {
      basicInfo: "Basic Information",
      location: "Location",
      amenities: "Amenities",
      rooms: "Rooms",
      rules: "Rules",
      deposit: "Deposit",
      hostelPhotos: "Hostel Photos",
      ownerVerification: "Owner Verification"
    };

    const currentStatus = sectionStatus[sectionKey];

    // Accept is only a PENDING -> APPROVED transition.
    if (currentStatus !== "PENDING") {
      return;
    }

    if (!canReviewSection(sectionKey)) {
      toast.error(getSectionActionBlockReason(sectionKey));
      return;
    }

    setSectionStatus(prev => ({
      ...prev,
      [sectionKey]: "APPROVED",
    }));

    setReviewedSections(prev => ({
      ...prev,
      [sectionKey]: true
    }));

    addReviewHistoryEntry(
      `Approved ${sectionNames[sectionKey]}`,
      "Section approved by admin"
    );

    toast.success(`${sectionNames[sectionKey]} approved`);
  };

  // Undo ONLY an approval: APPROVED -> PENDING.
  const undoSectionApproval = (sectionKey) => {
    if (isReadOnlyReview) return;

    const sectionNames = {
      basicInfo: "Basic Information",
      location: "Location",
      amenities: "Amenities",
      rooms: "Rooms",
      rules: "Rules",
      deposit: "Deposit",
      hostelPhotos: "Hostel Photos",
      ownerVerification: "Owner Verification"
    };

    if (sectionStatus[sectionKey] !== "APPROVED") {
      return;
    }

    setSectionStatus(prev => ({
      ...prev,
      [sectionKey]: "PENDING",
    }));

    setReviewedSections(prev => ({
      ...prev,
      [sectionKey]: false
    }));

    addReviewHistoryEntry(
      `Undo approval for ${sectionNames[sectionKey]}`,
      "Admin reverted the section approval"
    );

    toast.success(`${sectionNames[sectionKey]} approval undone`);
  };

  // Undo ONLY a request for changes: CHANGES_REQUIRED -> PENDING.
  const undoSectionRequestChanges = (sectionKey) => {
    if (isReadOnlyReview) return;

    const sectionNames = {
      basicInfo: "Basic Information",
      location: "Location",
      amenities: "Amenities",
      rooms: "Rooms",
      rules: "Rules",
      deposit: "Deposit",
      hostelPhotos: "Hostel Photos",
      ownerVerification: "Owner Verification"
    };

    if (sectionStatus[sectionKey] !== "CHANGES_REQUIRED") {
      return;
    }

    setSectionStatus(prev => ({
      ...prev,
      [sectionKey]: "PENDING",
    }));

    setReviewedSections(prev => ({
      ...prev,
      [sectionKey]: false
    }));

    addReviewHistoryEntry(
      `Undo requested changes for ${sectionNames[sectionKey]}`,
      "Admin reverted the change request"
    );

    toast.success(`${sectionNames[sectionKey]} change request undone`);
  };

  // Request changes function with modal.
  const requestChanges = (sectionKey) => {
    if (isReadOnlyReview) return;

    if (sectionKey === "all") {
      // Keep bulk Request Changes behaviour, but do not affect sections
      // that were already approved.
      const pendingSections = Object.keys(sectionStatus).filter(
        key => sectionStatus[key] !== "APPROVED"
      );

      const blockedImageSection = pendingSections.find(
        key => !canReviewSection(key)
      );

      if (blockedImageSection) {
        toast.error(getSectionActionBlockReason(blockedImageSection));
        return;
      }

      setSectionStatus(prev => {
        const next = { ...prev };
        pendingSections.forEach(key => {
          next[key] = "CHANGES_REQUIRED";
        });
        return next;
      });

      setReviewedSections(prev => {
        const next = { ...prev };
        pendingSections.forEach(key => {
          next[key] = false;
        });
        return next;
      });

      addReviewHistoryEntry(
        `Requested changes for ${pendingSections.length} sections`,
        "Bulk changes requested"
      );

      toast.success(`Changes requested for ${pendingSections.length} sections`);
    } else {
      // A section containing images cannot be rejected/requested for changes
      // while any image is still pending.
      if (!canReviewSection(sectionKey)) {
        toast.error(getSectionActionBlockReason(sectionKey));
        return;
      }

      // ONLY this action opens the reason modal.
      openReasonModal('section-changes', { sectionKey });
    }
  };

  // Accept no longer opens a modal.
  const toggleSectionApproval = (sectionKey) => {
    if (isReadOnlyReview) return;

    if (sectionStatus[sectionKey] === "PENDING") {
      if (!canReviewSection(sectionKey)) {
        toast.error(getSectionActionBlockReason(sectionKey));
        return;
      }

      handleSectionApprove(sectionKey);
    }
  };

  // Function to check whether the hostel is eligible for overall approval.
  const areAllSectionsApproved = () => {
    return canApproveOverallHostel();
  };

  // Function to get approval progress
  const getApprovalProgress = () => {
    const total = Object.keys(sectionStatus).length;
    const approved = Object.values(sectionStatus).filter(s => s === "APPROVED").length;
    return { total, approved };
  };

  // Function to reject hostel
  const rejectHostel = async (hostelId) => {
    if (isReadOnlyReview) return;

    if (!hostelId) {
      toast.error("Hostel ID is missing.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:8080/api/admin/hostels/${hostelId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      addReviewHistoryEntry("Hostel Rejected", "Hostel was rejected by admin");
      toast.success("Hostel rejected successfully");
      navigate("/admin/hostel-management");
    } catch (error) {
      console.error("Failed to reject hostel:", error);
      toast.error(error.response?.data?.message || "Failed to reject hostel");
    }
  };

  // Function to approve hostel
  const approveHostel = async (hostelId) => {
    if (isReadOnlyReview) return;

    if (!areAllSectionsApproved()) {
      toast.error("All sections must be approved before approving the hostel");
      return;
    }

    if (!hostelId) {
      toast.error("Hostel ID is missing.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:8080/api/admin/hostels/${hostelId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      setSectionStatus({
        basicInfo: "APPROVED",
        location: "APPROVED",
        amenities: "APPROVED",
        rooms: "APPROVED",
        rules: "APPROVED",
        deposit: "APPROVED",
        hostelPhotos: "APPROVED",
        ownerVerification: "APPROVED",
      });

      setReviewedSections({
        basicInfo: true,
        location: true,
        amenities: true,
        rooms: true,
        rules: true,
        deposit: true,
        hostelPhotos: true,
        ownerVerification: true,
      });

      setHostelDetails((prev) => ({
        ...prev,
        approvalStatus: "APPROVED",
      }));

      setIsReadOnlyReview(true);

      addReviewHistoryEntry(
        "Hostel Approved",
        "Hostel was approved by admin. Review is now permanently read-only."
      );

      toast.success("Hostel approved successfully");
      navigate("/admin/hostel-management");
    } catch (error) {
      console.error("Failed to approve hostel:", error);
      toast.error(error.response?.data?.message || "Failed to approve hostel");
    }
  };

  // ============================================================
  // PHOTO HELPERS
  // ============================================================

  const extractPhotos = (responseData) => {
    console.log("extractPhotos called with:", responseData);

    if (!responseData) {
      console.log("extractPhotos: No data provided");
      return [];
    }

    if (Array.isArray(responseData)) {
      console.log("extractPhotos: Response is array, length:", responseData.length);
      return responseData;
    }

    if (responseData.data && Array.isArray(responseData.data)) {
      console.log("extractPhotos: Found data.data array, length:", responseData.data.length);
      return responseData.data;
    }

    if (responseData.photos && Array.isArray(responseData.photos)) {
      console.log("extractPhotos: Found photos property array, length:", responseData.photos.length);
      return responseData.photos;
    }

    if (responseData.roomPhotos && Array.isArray(responseData.roomPhotos)) {
      console.log("extractPhotos: Found roomPhotos property array, length:", responseData.roomPhotos.length);
      return responseData.roomPhotos;
    }

    if (responseData.hostelPhotos && Array.isArray(responseData.hostelPhotos)) {
      console.log("extractPhotos: Found hostelPhotos property array, length:", responseData.hostelPhotos.length);
      return responseData.hostelPhotos;
    }

    if (responseData.images && Array.isArray(responseData.images)) {
      console.log("extractPhotos: Found images property array, length:", responseData.images.length);
      return responseData.images;
    }

    if (responseData.id && (responseData.photoUrl || responseData.fileUrl || responseData.imageUrl)) {
      console.log("extractPhotos: Single photo object detected, wrapping in array");
      return [responseData];
    }

    if (responseData.content && Array.isArray(responseData.content)) {
      console.log("extractPhotos: Found content array (Spring Boot page), length:", responseData.content.length);
      return responseData.content;
    }

    for (const key in responseData) {
      if (Array.isArray(responseData[key]) && responseData[key].length > 0) {
        const firstItem = responseData[key][0];
        if (firstItem && (firstItem.photoUrl || firstItem.fileUrl || firstItem.imageUrl || firstItem.id)) {
          console.log(`extractPhotos: Found photo-like array in property "${key}"`);
          return responseData[key];
        }
      }
    }

    console.log("extractPhotos: No photos found in response", Object.keys(responseData));
    return [];
  };

  // IMPROVED: Get image URL with better handling for room photos
  const getImageUrl = (path, photoType = "general") => {
    if (!path) {
      if (photoType === "room") {
        return null;
      }
      return "";
    }

    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    if (path.startsWith("/")) {
      return `http://localhost:8080${path}`;
    }

    return `http://localhost:8080/${path}`;
  };

    // ============================================================
  // FULL IMAGE PREVIEW
  // ============================================================

  const openImagePreview = (images, index = 0, title = "Image Preview") => {
    if (!Array.isArray(images) || images.length === 0) {
      return;
    }

    const validImages = images.filter(Boolean);

    if (validImages.length === 0) {
      return;
    }

    setImagePreview({
      open: true,
      images: validImages,
      index: Math.min(Math.max(index, 0), validImages.length - 1),
      title,
    });
  };

  const closeImagePreview = () => {
    setImagePreview({
      open: false,
      images: [],
      index: 0,
      title: "",
    });
  };

  const showPreviousPreviewImage = () => {
    setImagePreview((prev) => {
      if (!prev.open || prev.images.length <= 1) {
        return prev;
      }

      return {
        ...prev,
        index:
          prev.index === 0
            ? prev.images.length - 1
            : prev.index - 1,
      };
    });
  };

  const showNextPreviewImage = () => {
    setImagePreview((prev) => {
      if (!prev.open || prev.images.length <= 1) {
        return prev;
      }

      return {
        ...prev,
        index:
          prev.index === prev.images.length - 1
            ? 0
            : prev.index + 1,
      };
    });
  };

  useEffect(() => {
    if (!imagePreview.open) {
      return;
    }

    const handlePreviewKeyboard = (event) => {
      if (event.key === "Escape") {
        closeImagePreview();
      }

      if (event.key === "ArrowLeft") {
        showPreviousPreviewImage();
      }

      if (event.key === "ArrowRight") {
        showNextPreviewImage();
      }
    };

    document.addEventListener("keydown", handlePreviewKeyboard);

    // Prevent background page scrolling while preview is open
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handlePreviewKeyboard
      );

      document.body.style.overflow = previousOverflow;
    };
  }, [imagePreview.open]);


  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const coverPhoto = photos.find((p) => p.photoType === "COVER") || photos[0];
  const galleryPhotos = photos.filter((p) => p.photoType === "ADDITIONAL" || p.id !== coverPhoto?.id);

  const approvedSectionsCount = Object.values(sectionStatus).filter((s) => s === "APPROVED").length;

  const NavItem = ({ icon: Icon, label, onClick, active = false }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
      }`}
    >
      <Icon className={`w-5 h-5 shrink-0 ${active ? "text-white" : "text-slate-500"}`} />
      {sidebarOpen && <span>{label}</span>}
    </button>
  );

  const getSummaryStatus = (section) => {
    const status = section?.status;

    if (status === "APPROVED") {
      return { status: "Approved", icon: "check" };
    }

    if (status === "CHANGES_REQUIRED") {
      const count = section?.changeCount ?? 0;
      return { status: `${count} ${count === 1 ? "change" : "changes"}`, icon: "alert" };
    }

    return { status: "Pending", icon: "alert" };
  };

  const getOwnerVerificationSummary = () => {
    const status = hostelDetails?.owner?.emailVerificationStatus;

    if (status === "VERIFIED") {
      return { status: "Approved", icon: "check" };
    }

    return { status: "Pending", icon: "alert" };
  };

  const renderApprovalBlocked = () => {
    if (isReadOnlyReview) return null;

    const pendingReasons = [];

    const emailStatus = hostelDetails?.owner?.emailVerificationStatus;
    if (emailStatus !== "VERIFIED") {
      pendingReasons.push({ section: "Owner Email", reason: "Owner Email is not verified" });
    }

    if (sectionStatus.amenities === "CHANGES_REQUIRED") {
      pendingReasons.push({ section: "Amenities", reason: "Amenities requires changes" });
    }

    if (sectionStatus.hostelPhotos === "CHANGES_REQUIRED") {
      pendingReasons.push({ section: "Hostel Photos", reason: "Hostel Photos requires changes" });
    }

    if (sectionStatus.rooms === "CHANGES_REQUIRED") {
      pendingReasons.push({ section: "Rooms", reason: "Rooms requires changes" });
    }

    if (sectionStatus.location === "CHANGES_REQUIRED") {
      pendingReasons.push({ section: "Location", reason: "Location requires changes" });
    }

    if (sectionStatus.rules === "CHANGES_REQUIRED") {
      pendingReasons.push({ section: "Rules", reason: "Rules requires changes" });
    }

    if (sectionStatus.deposit === "CHANGES_REQUIRED") {
      pendingReasons.push({ section: "Deposit", reason: "Deposit requires changes" });
    }

    if (sectionStatus.basicInfo === "CHANGES_REQUIRED") {
      pendingReasons.push({ section: "Basic Info", reason: "Basic Information requires changes" });
    }

    if (pendingReasons.length === 0) {
      return null;
    }

    return (
      <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-rose-700">
          <Ban className="w-5 h-5" />
          <h4 className="text-sm font-bold">Approval Blocked</h4>
        </div>

        <p className="text-xs text-slate-600">
          Please resolve pending sections or request changes from the owner.
        </p>

        <ul className="text-xs text-rose-600 space-y-1 list-disc pl-5">
          {pendingReasons.map((item, index) => (
            <li key={`${item.section}-${index}`}>
              <strong>{item.section}:</strong> {item.reason}
            </li>
          ))}
        </ul>

        <div className="flex justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => requestChanges("all")}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 border border-slate-300 bg-white rounded-lg hover:bg-slate-50"
          >
            Request Changes
          </button>

          <button
            type="button"
            onClick={() => rejectHostel(hostelDetails?.hostelId)}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Reject Hostel
          </button>

          <button
            type="button"
            disabled={true}
            className="px-4 py-1.5 text-xs font-semibold text-slate-400 border border-slate-200 bg-slate-100 rounded-lg cursor-not-allowed"
          >
            Approve Hostel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased overflow-hidden">

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-screen ${
          sidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 bg-white border-r border-slate-200 flex flex-col justify-between z-30`}
      >
        <div>
          <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-100">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
              <Building className="w-6 h-6" />
            </div>

            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-slate-900 leading-none text-xl tracking-tight">
                  HostelHub
                </h1>
                <span className="text-xs text-slate-400 font-medium">
                  Admin Console
                </span>
              </div>
            )}
          </div>

          <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-180px)]">
            <NavItem icon={LayoutDashboard} label="Dashboard" onClick={() => navigate("/admin/dashboard")} />

            <div>
              {sidebarOpen && (
                <p className="px-3 text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2">
                  Management
                </p>
              )}
              <nav className="space-y-1">
                <NavItem icon={Building2} label="Hostel Requests" onClick={() => navigate("/admin/hostel-management")} />
                <NavItem icon={Clock} label="Pending Approvals" active={true} onClick={() => navigate("/admin/pending-approvals")} />
                <NavItem
                 icon={RefreshCw}
                 label="Reupload Review"
                 onClick={() =>
                   navigate('/admin/reupload')
                 }
               />
                <NavItem icon={MessageSquareWarning} label="User Issues" onClick={() => navigate("/admin/user-issues")} />
                <NavItem icon={ShieldCheck} label="Owner Verification" onClick={() => navigate("/admin/owner-verification")} />
              </nav>
            </div>

            <div>
              {sidebarOpen && (
                <p className="px-3 text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2">
                  Analytics & Reports
                </p>
              )}
              <nav className="space-y-1">
                <NavItem icon={BarChart3} label="Analytics" onClick={() => navigate("/admin/analytics")} />
                <NavItem icon={Gem} label="Subscription" onClick={() => navigate("/admin/subscription")} />
                <NavItem icon={FileText} label="Reports" onClick={() => navigate("/admin/reports")} />
              </nav>
            </div>

            <div>
              {sidebarOpen && (
                <p className="px-3 text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2">
                  System
                </p>
              )}
              <nav className="space-y-1">
                <NavItem icon={Users} label="Users" onClick={() => navigate("/admin/users")} />
                <NavItem icon={Settings} label="System Settings" onClick={() => navigate("/admin/settings")} />
                <NavItem icon={History} label="Audit Logs" onClick={() => navigate("/admin/audit-logs")} />
              </nav>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-slate-100 space-y-2">
          {sidebarOpen && (
            <button
              onClick={() => navigate("/admin/reports")}
              className="w-full py-2.5 px-3 border border-blue-200 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2 mb-2"
            >
              <FileText className="w-4 h-4" />
              Generate Reports
            </button>
          )}
          <NavItem icon={HelpCircle} label="Help Center" onClick={() => navigate("/admin/help")} />
          <NavItem icon={LogOut} label="Logout" onClick={handleLogout} />
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div
        className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >

        {/* NAVBAR */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
              <Menu className="w-6 h-6" />
            </button>

            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search hostel, owner, location..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-10 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1 py-0.5 border border-slate-200 bg-white rounded text-[10px] text-slate-400">
                ⌘K
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 hover:bg-slate-100 rounded-full text-slate-600 cursor-pointer relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            </div>

            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
              <Moon className="w-5 h-5" />
            </button>

            <div className="h-5 w-px bg-slate-200" />

            <div ref={profileMenuRef} className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <div className="text-left hidden md:block leading-tight">
                  <p className="text-xs font-semibold text-slate-800">Admin User</p>
                  <p className="text-[10px] text-slate-400">Super Admin</p>
                </div>
                <ChevronDown
                      className={`w-4 h-4 text-slate-400 hidden md:block transition-transform ${
                        profileMenuOpen ? "rotate-180" : ""
                      }`}
                    />
              </button>
              {/* Profile Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
              
                    {/* Profile Header */}
                    <div className="px-4 py-3 border-b border-slate-100">
              
                      <div className="flex items-center gap-3">
              
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          A
                        </div>
              
                        <div className="min-w-0">
              
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            Admin User
                          </p>
              
                          <p className="text-xs text-slate-400 truncate">
                            Super Admin
                          </p>
              
                        </div>
              
                      </div>
              
                    </div>
              
                    {/* Logout */}
                    <div className="p-2">
              
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
              
                        <LogOut className="w-4 h-4" />
              
                        <span>Logout</span>
              
                      </button>
              
                    </div>
              
                  </div>
                )}
            </div>
          </div>
        </header>

        {/* CONTENT VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#F4F6FA]">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* PAGE HEADER */}
            <div>
              <button
                onClick={() => navigate("/admin/hostel-management")}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Hostel Requests
              </button>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                      [{hostelDetails?.basicInfo?.hostelName || "Hostel Name"}]
                    </h1>
                    <span
                      className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${
                        String(hostelDetails?.approvalStatus || "")
                          .trim()
                          .toUpperCase() === "REJECTED"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : isReadOnlyReview
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-600 border-amber-200"
                      }`}
                    >
                      {String(hostelDetails?.approvalStatus || "")
                        .trim()
                        .toUpperCase() === "REJECTED"
                        ? "REJECTED • READ ONLY"
                        : isReadOnlyReview
                        ? "APPROVED • READ ONLY"
                        : "PENDING REVIEW"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Owner: <span className="text-slate-700 font-medium">[{hostelDetails?.basicInfo?.ownerName || "Owner Name"}]</span>{" "}
                    | ID: #{hostelId || "0"} | Submitted: [Date]
                  </p>
                </div>


              </div>

              {String(hostelDetails?.approvalStatus || "")
                .trim()
                .toUpperCase() === "REJECTED" && (
                <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
                  <p className="text-xs font-bold text-rose-700">
                    This hostel was rejected and remains stored for review.
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-rose-600">
                    The existing hostel information is being displayed as submitted.
                    It will return to the normal approval workflow only after the owner
                    submits it again.
                  </p>
                </div>
              )}

              <div className="mt-3">
                <span className="text-xs text-slate-600 font-semibold">Review Progress</span>
                {String(hostelDetails?.approvalStatus || "")
                  .trim()
                  .toUpperCase() === "REJECTED" ? (
                  <span className="text-xs text-rose-600 font-bold ml-2">
                    Review closed after rejection
                  </span>
                ) : (
                  <span className="text-xs text-blue-600 font-bold ml-2">
                    {approvedSectionsCount} / {Object.keys(sectionStatus).length} Sections Approved
                  </span>
                )}
              </div>
            </div>

            {/* TWO COLUMN CONTENT VIEW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* LEFT ACCORDION / SECTION LIST */}
              <div className="lg:col-span-8 space-y-4">

                {/* 1. Basic Information */}
                <SectionCard
                  number="1"
                  title="Basic Information"
                  sectionKey="basicInfo"
                  sectionActionsAllowed={canReviewSection("basicInfo")}
                  sectionActionBlockReason={getSectionActionBlockReason("basicInfo")}
                  status={sectionStatus.basicInfo}
                  readOnly={isReadOnlyReview}
                  onAccept={() => toggleSectionApproval("basicInfo")}
                  onRequestChanges={() => requestChanges("basicInfo")}
                  onUndoApprove={() => undoSectionApproval("basicInfo")}
                  onUndoChanges={() => undoSectionRequestChanges("basicInfo")}
                >
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate-400">Hostel Name</p>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {hostelDetails?.basicInfo?.hostelName || "[Hostel Name]"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Hostel Type</p>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {hostelDetails?.basicInfo?.hostelType || "[Hostel Type]"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Manager Name</p>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {hostelDetails?.basicInfo?.ownerName || "[Manager Name]"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Contact Number</p>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {hostelDetails?.basicInfo?.phoneNumber || "[Contact Number]"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400">Email Address</p>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {hostelDetails?.basicInfo?.email || "[Email Address]"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400">Description</p>
                      <p className="text-slate-700 mt-0.5">
                        {hostelDetails?.basicInfo?.description || "[Description Text]"}
                      </p>
                    </div>
                  </div>
                </SectionCard>

                {/* 2. Location */}
                <SectionCard
                  number="2"
                  title="Location"
                  sectionKey="location"
                  sectionActionsAllowed={canReviewSection("location")}
                  sectionActionBlockReason={getSectionActionBlockReason("location")}
                  status={sectionStatus.location}
                  readOnly={isReadOnlyReview}
                  onAccept={() => toggleSectionApproval("location")}
                  onRequestChanges={() => requestChanges("location")}
                  onUndoApprove={() => undoSectionApproval("location")}
                  onUndoChanges={() => undoSectionRequestChanges("location")}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-3">
                      <div>
                        <p className="text-slate-400">Address Line 1</p>
                        <p className="font-semibold text-slate-800 mt-0.5">
                          {hostelDetails?.location?.address || "[Address Line 1]"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Address Line 2 (Optional)</p>
                        <p className="font-semibold text-slate-800 mt-0.5">
                          {hostelDetails?.location?.landmark || "[Address Line 2]"}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-slate-400">City</p>
                          <p className="font-semibold text-slate-800 mt-0.5">
                            {hostelDetails?.location?.city || "[City]"}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">State</p>
                          <p className="font-semibold text-slate-800 mt-0.5">
                            {hostelDetails?.location?.state || "[State]"}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-slate-400">ZIP Code</p>
                          <p className="font-semibold text-slate-800 mt-0.5">
                            {hostelDetails?.location?.pincode || "[ZIP Code]"}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Coordinates</p>
                          <p className="font-semibold text-slate-800 mt-0.5">
                            {hostelDetails?.location?.latitude
                              ? `[${hostelDetails.location.latitude}], [${hostelDetails.location.longitude}]`
                              : "[Lat], [Long]"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">

  {hostelDetails?.location?.latitude != null &&
  hostelDetails?.location?.longitude != null &&
  !isNaN(Number(hostelDetails.location.latitude)) &&
  !isNaN(Number(hostelDetails.location.longitude)) ? (

    <MapContainer
      center={[
        Number(hostelDetails.location.latitude),
        Number(hostelDetails.location.longitude)
      ]}
      zoom={16}
      scrollWheelZoom={false}
      style={{
        height: "260px",
        width: "100%"
      }}
    >

      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker
        position={[
          Number(hostelDetails.location.latitude),
          Number(hostelDetails.location.longitude)
        ]}
        icon={defaultMarkerIcon}
      >

        <Popup>

          <div className="text-sm">

            <p className="font-semibold text-slate-900">
              Submitted Hostel Location
            </p>

            <p className="mt-1 text-slate-500">
              {Number(hostelDetails.location.latitude).toFixed(6)}
              {", "}
              {Number(hostelDetails.location.longitude).toFixed(6)}
            </p>

          </div>

        </Popup>

      </Marker>

    </MapContainer>

  ) : (

    <div className="h-[260px] flex items-center justify-center">

      <div className="text-center px-6">

        <p className="text-sm font-semibold text-slate-700">
          Map Unavailable
        </p>

        <p className="text-xs text-slate-500 mt-1">
          Valid coordinates were not provided for this hostel.
        </p>

      </div>

    </div>

  )}

</div>


                  </div>
                </SectionCard>

                {/* 3. Amenities */}
                <SectionCard
                  number="3"
                  title="Amenities"
                  sectionKey="amenities"
                  sectionActionsAllowed={canReviewSection("amenities")}
                  sectionActionBlockReason={getSectionActionBlockReason("amenities")}
                  status={sectionStatus.amenities}
                  readOnly={isReadOnlyReview}
                  badge={getAmenityChangesCount() > 0 ? `${getAmenityChangesCount()} Changes Required` : null}
                  onAccept={() => toggleSectionApproval("amenities")}
                  onRequestChanges={() => requestChanges("amenities")}
                  onUndoApprove={() => undoSectionApproval("amenities")}
                  onUndoChanges={() => undoSectionRequestChanges("amenities")}
                >
                  <p className="text-xs text-slate-500 mb-4">
                    Review the amenities submitted by the hostel and verify photos where required.
                  </p>

                  {/* SELECTED AMENITIES */}
                  {getSelectedAmenities().length > 0 ? (
                    <div className="mb-5">
                      <p className="text-xs font-bold text-slate-700 mb-3">Selected Amenities</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {getSelectedAmenities().map((amenity, index) => (
                          <div key={amenity.code || amenity.id || index} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200">
                            <span className="text-base">{getAmenityIcon(amenity.code)}</span>
                            <span className="text-xs font-semibold text-slate-700">{amenity.name}</span>
                            {amenity.photoRequired && (
                              <span className="ml-auto text-[9px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                Photo Required
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-5 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
                      No amenities were submitted by this hostel.
                    </div>
                  )}

                  {/* AMENITY VERIFICATION PHOTOS */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-slate-700">Amenity Verification Photos</p>
                      <span className="text-[10px] text-slate-400">
                        {getRequiredAmenityPhotos().length} photo{getRequiredAmenityPhotos().length !== 1 ? "s" : ""} required
                      </span>
                    </div>

                    {getRequiredAmenityPhotos().length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {getRequiredAmenityPhotos().map((photo, index) => {
                          const photoId = photo.id;
                          const photoKey = `AMENITY-${photoId}`;
                          
                          const verificationStatus = photoVerification[photoKey] || photo.verificationStatus || "PENDING";
                          const isRejected = verificationStatus === "REJECTED";
                          const isVerified = verificationStatus === "APPROVED";
                          const isPending = verificationStatus === "PENDING";
                          
                          const imageUrl = getRenderedImageUrl(photo, "amenity");

                          return (
                            <div key={photoId || index} className={`rounded-xl border p-3 transition ${
                              isRejected ? "border-rose-200 bg-rose-50/20" :
                              isVerified ? "border-emerald-200 bg-emerald-50/20" : "border-slate-200 bg-white"
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold text-slate-700">{getAmenityDisplayName(photo)}</p>
                                {photo.photoRequired && (
                                  <span className="text-[9px] font-medium text-slate-400">Required</span>
                                )}
                              </div>
                              <div className={`relative h-40 rounded-lg overflow-hidden border ${
                                isRejected ? "border-rose-200" : isVerified ? "border-emerald-200" : "border-slate-200"
                              } bg-slate-100`}>
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={photo.amenityName || photo.amenity?.name || "Amenity"}
                                    className="w-full h-full object-cover cursor-pointer hover:scale-[1.02] transition-transform"
                                    onClick={() => {
                                      openImagePreview(
                                        [imageUrl],
                                        0,
                                        `${getAmenityDisplayName(photo)} - Verification Photo`
                                      );
                                    }}
                                    onError={(e) => { 
                                      e.currentTarget.style.display = "none";
                                      const parent = e.currentTarget.parentElement;
                                      const fallback = document.createElement('div');
                                      fallback.className = "w-full h-full flex flex-col items-center justify-center text-slate-400";
                                      fallback.innerHTML = `
                                        <svg class="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span class="text-[10px]">Image not available</span>
                                      `;
                                      if (parent) {
                                        parent.innerHTML = '';
                                        parent.appendChild(fallback);
                                      }
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                    <ImageOff className="w-6 h-6 mb-2" />
                                    <span className="text-[10px]">No photo submitted</span>
                                  </div>
                                )}
                                {isVerified && (
                                  <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                                    <Check className="w-4 h-4" />
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow">
                                    ✕
                                  </span>
                                )}
                              </div>
                              <div className="mt-2">
                                {!isReadOnlyReview && isRejected && (
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="text-[10px] font-semibold text-rose-600">✕ Rejected</p>
                                      {(photo.rejectionReason || photo.adminNote || photo.verificationNote) && (
                                        <p className="text-[10px] text-rose-500 mt-0.5">
                                          {photo.rejectionReason || photo.adminNote || photo.verificationNote}
                                        </p>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handlePhotoVerification(photoId, "amenity", "PENDING")}
                                      disabled={photoActionLoading[photoKey]}
                                      className="text-[10px] text-blue-600 hover:underline disabled:opacity-50"
                                    >
                                      Undo
                                    </button>
                                  </div>
                                )}
                                {!isReadOnlyReview && isVerified && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-semibold text-emerald-600">✓ Accepted</span>
                                    <button
                                      type="button"
                                      onClick={() => handlePhotoVerification(photoId, "amenity", "PENDING")}
                                      disabled={photoActionLoading[photoKey]}
                                      className="text-[10px] text-blue-600 hover:underline disabled:opacity-50"
                                    >Undo </button>
                                  </div>
                                )}
                                {!isReadOnlyReview && isPending && (
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-semibold text-amber-600">
                                      ● Pending Verification
                                    </span>
                                    <div className="flex gap-1.5">
                                      <button
                                        type="button"
                                        disabled={photoActionLoading[photoKey]}
                                        onClick={() => handlePhotoVerification(photoId, "amenity", "APPROVED")}
                                        className="px-2.5 py-1 text-[10px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md disabled:opacity-50"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        type="button"
                                        disabled={photoActionLoading[photoKey]}
                                        onClick={() => openReasonModal('photo-reject', { photoId, photoType: 'amenity' })}
                                        className="px-2.5 py-1 text-[10px] font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 rounded-md disabled:opacity-50"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center">
                        <ImageOff className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                        <p className="text-xs font-medium text-slate-600">No amenity verification photos submitted</p>
                        <p className="text-[10px] text-slate-400 mt-1">This hostel did not submit photos for any photo-required amenities.</p>
                      </div>
                    )}
                  </div>
                </SectionCard>

                {/* 4. Rooms */}
                <SectionCard
                  number="4"
                  title="Rooms"
                  sectionKey="rooms"
                  sectionActionsAllowed={canReviewSection("rooms")}
                  sectionActionBlockReason={getSectionActionBlockReason("rooms")}
                  status={sectionStatus.rooms}
                  readOnly={isReadOnlyReview}
                  onAccept={() => toggleSectionApproval("rooms")}
                  onRequestChanges={() => requestChanges("rooms")}
                  onUndoApprove={() => undoSectionApproval("rooms")}
                  onUndoChanges={() => undoSectionRequestChanges("rooms")}
                >
                  <div className="space-y-6">
                    {effectiveRooms.length > 0 ? (
                      effectiveRooms.map((room, index) => {
                        const roomId = Number(
                          room.id || room.roomId || room.hostelRoomId
                        );
                        const roomPhotoList = getPhotosForRoom(room);

                        return (
                          <div
                            key={roomId || index}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                          >
                            {/* ROOM HEADER */}
                            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-7 py-5">
                              <div>
                                <p className="text-lg font-bold tracking-wide text-slate-800">
                                  {room.roomType || "Room"}
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-400">
                                  Room #{roomId || index + 1}
                                </p>
                              </div>

                              <span className="text-sm font-semibold text-slate-500">
                                {roomPhotoList.length} photo
                                {roomPhotoList.length !== 1 ? "s" : ""}
                              </span>
                            </div>

                            {/* ROOM CONTENT */}
                            <div className="grid grid-cols-1 gap-8 px-7 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,1.25fr)]">
                              {/* ROOM DETAILS */}
                              <div className="flex flex-col justify-center space-y-7">
                                <div>
                                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                                    Room Type
                                  </p>
                                  <p className="mt-2 text-2xl font-semibold text-slate-800">
                                    {room.roomType || "Not available"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                                    Rent Per Bed
                                  </p>
                                  <p className="mt-2 text-2xl font-semibold text-slate-800">
                                    ₹
                                    {Number(room.rentPerBed || 0).toLocaleString(
                                      "en-IN"
                                    )}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-400">
                                    Monthly rent per bed
                                  </p>
                                </div>

                                {room.capacity && (
                                  <div>
                                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                                      Capacity
                                    </p>
                                    <p className="mt-2 text-lg font-semibold text-slate-800">
                                      {room.capacity} beds
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* ROOM PHOTOS */}
                              <div className="min-w-0">
                                <div className="mb-4 flex items-center justify-between">
                                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                                    Room Photos
                                  </p>
                                  <span className="text-sm font-medium text-slate-400">
                                    {roomPhotoList.length} submitted
                                  </span>
                                </div>

                                {roomPhotoList.length > 0 ? (
                                  <div className="flex flex-wrap gap-4">
                                    {roomPhotoList.map((photo, photoIndex) => {
                                      const photoUrl = getRenderedImageUrl(photo, "room");

                                      const photoId = photo.id;
                                      const photoKey = `room-${photoId}`;
                                      const verificationStatus =
                                        getPhotoVerificationStatus(
                                          photo,
                                          "room"
                                        );

                                      const isRejected =
                                        verificationStatus === "REJECTED";
                                      const isVerified =
                                        verificationStatus === "APPROVED";
                                      const isPending =
                                        verificationStatus === "PENDING";

                                      const openRoomPhotoPreview = () => {
                                        const roomImages = getPhotosForRoom(
                                          room
                                        )
                                          .map(
                                            (roomPhoto) => 
                                              getRenderedImageUrl(roomPhoto, "room")
                                          )
                                          .filter(Boolean);

                                        const currentIndex =
                                          roomImages.findIndex(
                                            (url) => url === photoUrl
                                          );

                                        openImagePreview(
                                          roomImages,
                                          currentIndex >= 0
                                            ? currentIndex
                                            : photoIndex,
                                          `${room.roomType || "Room"} - Room Photos`
                                        );
                                      };

                                      return (
                                        <div
                                          key={photo.id || photoIndex}
                                          className={`w-full max-w-[285px] rounded-2xl border bg-white p-3 shadow-sm transition ${
                                            isRejected
                                              ? "border-rose-200 bg-rose-50/20"
                                              : isVerified
                                              ? "border-emerald-200 bg-emerald-50/20"
                                              : "border-slate-200"
                                          }`}
                                        >
                                          {/* IMAGE */}
                                          <button
                                            type="button"
                                            onClick={openRoomPhotoPreview}
                                            disabled={!photoUrl}
                                            className="group block w-full overflow-hidden rounded-xl text-left disabled:cursor-default"
                                          >
                                            {photoUrl ? (
                                              <img
                                                src={photoUrl}
                                                alt={`${room.roomType || "Room"} photo ${
                                                  photoIndex + 1
                                                }`}
                                                className="h-48 w-full rounded-xl border border-slate-200 object-cover shadow-sm transition duration-200 group-hover:scale-[1.015]"
                                                onError={(event) => {
                                                  event.currentTarget.style.display =
                                                    "none";
                                                  const parent =
                                                    event.currentTarget
                                                      .parentElement;
                                                  if (parent) {
                                                    parent.innerHTML = `
                                                      <div class="h-48 w-full rounded-xl bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                                                        <span class="text-xs font-medium">Image not available</span>
                                                      </div>
                                                    `;
                                                  }
                                                }}
                                              />
                                            ) : (
                                              <div className="flex h-48 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                                                <ImageOff className="mb-2 h-6 w-6" />
                                                <span className="text-xs font-medium">
                                                  Loading...
                                                </span>
                                              </div>
                                            )}
                                          </button>

                                          {/* VERIFICATION ACTIONS */}
                                          {!isReadOnlyReview && isPending && (
                                            <div className="mt-3 flex items-center justify-between gap-2">
                                              <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-amber-600">
                                                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500" />
                                                <span>
                                                  Pending Verification
                                                </span>
                                              </span>

                                              <div className="flex shrink-0 gap-2">
                                                <button
                                                  type="button"
                                                  disabled={
                                                    photoActionLoading[photoKey]
                                                  }
                                                  onClick={() =>
                                                    handlePhotoVerification(
                                                      photoId,
                                                      "room",
                                                      "APPROVED"
                                                    )
                                                  }
                                                  className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                  Accept
                                                </button>

                                                <button
                                                  type="button"
                                                  disabled={
                                                    photoActionLoading[photoKey]
                                                  }
                                                  onClick={() =>
                                                    openReasonModal(
                                                      "photo-reject",
                                                      {
                                                        photoId,
                                                        photoType: "room",
                                                      }
                                                    )
                                                  }
                                                  className="rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                  Reject
                                                </button>
                                              </div>
                                            </div>
                                          )}

                                          {/* APPROVED STATE */}
                                          {!isReadOnlyReview && isVerified && (
                                            <div className="mt-3 flex items-center justify-between">
                                              <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                                                  <Check className="h-3.5 w-3.5" />
                                                </span>
                                                Accepted
                                              </span>

                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handlePhotoVerification(
                                                    photoId,
                                                    "room",
                                                    "PENDING"
                                                  )
                                                }
                                                disabled={
                                                  photoActionLoading[photoKey]
                                                }
                                                className="text-xs font-semibold text-blue-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                                              >
                                                Undo
                                              </button>
                                            </div>
                                          )}

                                          {/* REJECTED STATE */}
                                          {!isReadOnlyReview && isRejected && (
                                            <div className="mt-3 space-y-2">
                                              <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                  <p className="flex items-center gap-1.5 text-sm font-semibold text-rose-600">
                                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100">
                                                      ✕
                                                    </span>
                                                    Rejected
                                                  </p>

                                                  {(photo.rejectionReason ||
                                                    photo.adminNote ||
                                                    photo.verificationNote) && (
                                                    <p className="mt-1 break-words text-xs leading-relaxed text-rose-500">
                                                      {photo.rejectionReason ||
                                                        photo.adminNote ||
                                                        photo.verificationNote}
                                                    </p>
                                                  )}
                                                </div>

                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    handlePhotoVerification(
                                                      photoId,
                                                      "room",
                                                      "PENDING"
                                                    )
                                                  }
                                                  disabled={
                                                    photoActionLoading[photoKey]
                                                  }
                                                  className="shrink-0 text-xs font-semibold text-blue-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                  Undo
                                                </button>
                                              </div>
                                            </div>
                                          )}

                                          {/* READ-ONLY STATUS */}
                                          {isReadOnlyReview && (
                                            <div className="mt-3">
                                              {isVerified && (
                                                <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                                                  <Check className="h-4 w-4" />
                                                  Accepted
                                                </span>
                                              )}

                                              {isRejected && (
                                                <div>
                                                  <p className="text-sm font-semibold text-rose-600">
                                                    ✕ Rejected
                                                  </p>
                                                  {(photo.rejectionReason ||
                                                    photo.adminNote ||
                                                    photo.verificationNote) && (
                                                    <p className="mt-1 text-xs text-rose-500">
                                                      {photo.rejectionReason ||
                                                        photo.adminNote ||
                                                        photo.verificationNote}
                                                    </p>
                                                  )}
                                                </div>
                                              )}

                                              {isPending && (
                                                <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-600">
                                                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                                  Pending Verification
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="flex min-h-48 w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
                                    <div className="flex flex-col items-center text-slate-400">
                                      <ImageOff className="mb-2 h-7 w-7" />
                                      <p className="text-sm font-medium text-slate-500">
                                        No room photos submitted
                                      </p>
                                      <p className="mt-1 text-xs text-slate-400">
                                        This room has no verification photos.
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-slate-400">
                        <ImageOff className="mb-2 h-8 w-8" />
                        <p className="text-sm font-medium">
                          No room information submitted
                        </p>
                      </div>
                    )}
                  </div>
                </SectionCard>

                {/* 5. Rules */}
                <SectionCard
                  number="5"
                  title="Rules"
                  sectionKey="rules"
                  sectionActionsAllowed={canReviewSection("rules")}
                  sectionActionBlockReason={getSectionActionBlockReason("rules")}
                  status={sectionStatus.rules}
                  readOnly={isReadOnlyReview}
                  onAccept={() => toggleSectionApproval("rules")}
                  onRequestChanges={() => requestChanges("rules")}
                  onUndoApprove={() => undoSectionApproval("rules")}
                  onUndoChanges={() => undoSectionRequestChanges("rules")}
                >
                  <div className="text-xs">
                    <div className="grid grid-cols-2 py-1.5 border-b border-slate-100">
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">Rule</span>
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">Details</span>
                    </div>
                    <div className="grid grid-cols-2 py-2 border-b border-slate-100">
                      <span className="font-semibold text-slate-700">Curfew Timing</span>
                      <span className="text-slate-600">{hostelDetails?.rules?.curfewEnabled ? "Enabled" : "Not Enabled"}</span>
                    </div>
                    <div className="grid grid-cols-2 py-2 border-b border-slate-100">
                      <span className="font-semibold text-slate-700">Visitors Allowed</span>
                      <span className="text-slate-600">{hostelDetails?.rules?.visitorsAllowed ? "Yes" : "No"}</span>
                    </div>
                    <div className="grid grid-cols-2 py-2 border-b border-slate-100">
                      <span className="font-semibold text-slate-700">Smoking/Drinking</span>
                      <span className="text-slate-600">
                        {hostelDetails?.rules?.noSmoking || hostelDetails?.rules?.noAlcohol ? "Prohibited" : "Allowed"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 py-2">
                      <span className="font-semibold text-slate-700">Other Rules</span>
                      <span className="text-slate-600">
                        {hostelDetails?.rules?.additionalRules?.trim() ? hostelDetails.rules.additionalRules : "None"}
                      </span>
                    </div>
                  </div>
                </SectionCard>

                {/* 6. Deposit */}
                <SectionCard
                  number="6"
                  title="Deposit"
                  sectionKey="deposit"
                  sectionActionsAllowed={canReviewSection("deposit")}
                  sectionActionBlockReason={getSectionActionBlockReason("deposit")}
                  status={sectionStatus.deposit}
                  readOnly={isReadOnlyReview}
                  onAccept={() => toggleSectionApproval("deposit")}
                  onRequestChanges={() => requestChanges("deposit")}
                  onUndoApprove={() => undoSectionApproval("deposit")}
                  onUndoChanges={() => undoSectionRequestChanges("deposit")}
                >
                  <div className="text-xs">
                    <div className="grid grid-cols-2 py-1.5 border-b border-slate-100">
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">Deposit</span>
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">Details</span>
                    </div>
                    <div className="grid grid-cols-2 py-3">
                      <span className="font-semibold text-slate-700">Refund Policy</span>
                      <span className="font-semibold text-slate-800">
                        {hostelDetails?.deposit?.refundPolicy ? hostelDetails.deposit.refundPolicy : "Not Provided"}
                      </span>
                    </div>
                  </div>
                </SectionCard>

                {/* 7. Hostel Photos */}
                <SectionCard
                  number="7"
                  title="Hostel Photos"
                  sectionKey="hostelPhotos"
                  sectionActionsAllowed={canReviewSection("hostelPhotos")}
                  sectionActionBlockReason={getSectionActionBlockReason("hostelPhotos")}
                  status={sectionStatus.hostelPhotos}
                  readOnly={isReadOnlyReview}
                  onAccept={() => toggleSectionApproval("hostelPhotos")}
                  onRequestChanges={() => requestChanges("hostelPhotos")}
                  onUndoApprove={() => undoSectionApproval("hostelPhotos")}
                  onUndoChanges={() => undoSectionRequestChanges("hostelPhotos")}
                >
                  <div className="text-xs space-y-4">
                    <div>
                      <p className="text-slate-600 font-semibold mb-2">Cover Photo</p>
                      {(() => {
                        const coverPhoto = photos.find((photo) => photo.photoType === "COVER");
                        if (!coverPhoto) {
                          return (
                            <div className="h-44 bg-slate-100 rounded-lg border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                              <ImageOff className="w-7 h-7 mb-1" />
                              <span>No photo submitted</span>
                            </div>
                          );
                        }
                        
                        const photoId = coverPhoto.id;
                        const photoKey = `HOSTEL-${photoId}`;
                        const verificationStatus = photoVerification[photoKey] || coverPhoto.verificationStatus || "PENDING";
                        const isRejected = verificationStatus === "REJECTED";
                        const isVerified = verificationStatus === "APPROVED";
                        const isPending = verificationStatus === "PENDING";
                        
                        const imageUrl = getRenderedImageUrl(coverPhoto, "hostel");

                        return (
                          <div className={`rounded-xl border p-3 transition ${
                            isRejected ? "border-rose-200 bg-rose-50/20" :
                            isVerified ? "border-emerald-200 bg-emerald-50/20" : "border-slate-200 bg-white"
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-semibold text-slate-700">Cover Photo</p>
                              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                                isRejected ? "text-rose-600 bg-rose-50" :
                                isVerified ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
                              }`}>
                                {isRejected ? "Rejected" : isVerified ? "Approved" : "Pending"}
                              </span>
                            </div>
                            <div className={`relative h-44 rounded-lg overflow-hidden border ${
                              isRejected ? "border-rose-200" : isVerified ? "border-emerald-200" : "border-slate-200"
                            } bg-slate-100`}>
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt="Hostel Cover"
                                  className="w-full h-full object-cover cursor-pointer hover:scale-[1.02] transition-transform"
                                  onClick={() => {
                                    openImagePreview(
                                      [imageUrl],
                                      0,
                                      "Hostel Cover Photo"
                                    );
                                  }}
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    const parent = e.currentTarget.parentElement;
                                    const fallback = document.createElement('div');
                                    fallback.className = "w-full h-full flex flex-col items-center justify-center text-slate-400";
                                    fallback.innerHTML = `
                                      <svg class="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      <span class="text-[10px]">Image not available</span>
                                    `;
                                    if (parent) {
                                      parent.innerHTML = '';
                                      parent.appendChild(fallback);
                                    }
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                  <ImageOff className="w-6 h-6 mb-2" />
                                  <span className="text-[10px]">No photo submitted</span>
                                </div>
                              )}
                              {isVerified && (
                                <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                                  <Check className="w-4 h-4" />
                                </span>
                              )}
                              {isRejected && (
                                <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow">
                                  ✕
                                </span>
                              )}
                            </div>
                            <div className="mt-2">
                              {!isReadOnlyReview && isRejected && (
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-[10px] font-semibold text-rose-600">✕ Rejected</p>
                                    {(coverPhoto.rejectionReason || coverPhoto.adminNote || coverPhoto.verificationNote) && (
                                      <p className="text-[10px] text-rose-500 mt-0.5">
                                        {coverPhoto.rejectionReason || coverPhoto.adminNote || coverPhoto.verificationNote}
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handlePhotoVerification(photoId, "hostel", "PENDING")}
                                    disabled={photoActionLoading[photoKey]}
                                    className="text-[10px] text-blue-600 hover:underline disabled:opacity-50"
                                  >
                                    Undo
                                  </button>
                                </div>
                              )}
                              {!isReadOnlyReview && isVerified && (
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-semibold text-emerald-600">✓ Accepted</span>
                                  <button
                                    type="button"
                                    onClick={() => handlePhotoVerification(photoId, "hostel", "PENDING")}
                                    disabled={photoActionLoading[photoKey]}
                                    className="text-[10px] text-blue-600 hover:underline disabled:opacity-50"
                                  >Undo Acceptance</button>
                                </div>
                              )}
                              {!isReadOnlyReview && isPending && (
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-semibold text-amber-600">
                                    ● Pending Verification
                                  </span>
                                  <div className="flex gap-1.5">
                                    <button
                                      type="button"
                                      disabled={photoActionLoading[photoKey]}
                                      onClick={() => handlePhotoVerification(photoId, "hostel", "APPROVED")}
                                      className="px-2.5 py-1 text-[10px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md disabled:opacity-50"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      type="button"
                                      disabled={photoActionLoading[photoKey]}
                                      onClick={() => openReasonModal('photo-reject', { photoId, photoType: 'hostel' })}
                                      className="px-2.5 py-1 text-[10px] font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 rounded-md disabled:opacity-50"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div>
                      <p className="text-slate-600 font-semibold mb-2">Gallery Photos</p>
                      {(() => {
                        const galleryPhotos = photos
                          .filter((photo) => photo.photoType === "ADDITIONAL")
                          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

                        if (galleryPhotos.length === 0) {
                          return (
                            <div className="h-24 bg-slate-100 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                              <ImageOff className="w-5 h-5 mr-2" />
                              <span>No additional photos submitted</span>
                            </div>
                          );
                        }
                        
                        return (
                          <div className="grid grid-cols-2 gap-4">
                            {galleryPhotos.map((photo) => {
                              const photoId = photo.id;
                              const photoKey = `HOSTEL-${photoId}`;
                              const verificationStatus = photoVerification[photoKey] || photo.verificationStatus || "PENDING";
                              const isRejected = verificationStatus === "REJECTED";
                              const isVerified = verificationStatus === "APPROVED";
                              const isPending = verificationStatus === "PENDING";
                              
                              const imageUrl = getRenderedImageUrl(photo, "hostel");

                              return (
                                <div key={photoId} className={`rounded-xl border p-3 transition ${
                                  isRejected ? "border-rose-200 bg-rose-50/20" :
                                  isVerified ? "border-emerald-200 bg-emerald-50/20" : "border-slate-200 bg-white"
                                }`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold text-slate-700">Gallery Photo</p>
                                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                                      isRejected ? "text-rose-600 bg-rose-50" :
                                      isVerified ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
                                    }`}>
                                      {isRejected ? "Rejected" : isVerified ? "Approved" : "Pending"}
                                    </span>
                                  </div>
                                  <div className={`relative h-32 rounded-lg overflow-hidden border ${
                                    isRejected ? "border-rose-200" : isVerified ? "border-emerald-200" : "border-slate-200"
                                  } bg-slate-100`}>
                                    {imageUrl ? (
                                      <img
                                        src={imageUrl}
                                        alt="Hostel Gallery"
                                        className="w-full h-full object-cover cursor-pointer hover:scale-[1.02] transition-transform"
                                        onClick={() => {
                                          const galleryUrls = galleryPhotos
                                            .map((galleryPhoto) =>
                                              getRenderedImageUrl(galleryPhoto, "hostel")
                                            )
                                            .filter(Boolean);

                                          const currentUrl = getRenderedImageUrl(photo, "hostel");

                                          const currentIndex = galleryUrls.findIndex(
                                            (url) => url === currentUrl
                                          );

                                          openImagePreview(
                                            galleryUrls,
                                            currentIndex >= 0 ? currentIndex : 0,
                                            "Hostel Gallery"
                                          );
                                        }}
                                        onError={(e) => {
                                          e.currentTarget.style.display = "none";
                                          const parent = e.currentTarget.parentElement;
                                          const fallback = document.createElement('div');
                                          fallback.className = "w-full h-full flex flex-col items-center justify-center text-slate-400";
                                          fallback.innerHTML = `
                                            <svg class="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span class="text-[10px]">Image not available</span>
                                          `;
                                          if (parent) {
                                            parent.innerHTML = '';
                                            parent.appendChild(fallback);
                                          }
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                        <ImageOff className="w-6 h-6 mb-2" />
                                        <span className="text-[10px]">No photo submitted</span>
                                      </div>
                                    )}
                                    {isVerified && (
                                      <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                                        <Check className="w-4 h-4" />
                                      </span>
                                    )}
                                    {isRejected && (
                                      <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow">
                                        ✕
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-2">
                                    {!isReadOnlyReview && isRejected && (
                                      <div className="flex items-start justify-between gap-2">
                                        <div>
                                          <p className="text-[10px] font-semibold text-rose-600">✕ Rejected</p>
                                          {(photo.rejectionReason || photo.adminNote || photo.verificationNote) && (
                                            <p className="text-[10px] text-rose-500 mt-0.5">
                                              {photo.rejectionReason || photo.adminNote || photo.verificationNote}
                                            </p>
                                          )}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handlePhotoVerification(photoId, "hostel", "PENDING")}
                                          disabled={photoActionLoading[photoKey]}
                                          className="text-[10px] text-blue-600 hover:underline disabled:opacity-50"
                                        >
                                          Undo
                                        </button>
                                      </div>
                                    )}
                                    {!isReadOnlyReview && isVerified && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-semibold text-emerald-600">✓ Accepted</span>
                                        <button
                                          type="button"
                                          onClick={() => handlePhotoVerification(photoId, "hostel", "PENDING")}
                                          disabled={photoActionLoading[photoKey]}
                                          className="text-[10px] text-blue-600 hover:underline disabled:opacity-50"
                                        >Undo Acceptance</button>
                                      </div>
                                    )}
                                    {!isReadOnlyReview && isPending && (
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-[10px] font-semibold text-amber-600">
                                          ● Pending Verification
                                        </span>
                                        <div className="flex gap-1.5">
                                          <button
                                            type="button"
                                            disabled={photoActionLoading[photoKey]}
                                            onClick={() => handlePhotoVerification(photoId, "hostel", "APPROVED")}
                                            className="px-2.5 py-1 text-[10px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md disabled:opacity-50"
                                          >
                                            Accept
                                          </button>
                                          <button
                                            type="button"
                                            disabled={photoActionLoading[photoKey]}
                                            onClick={() => openReasonModal('photo-reject', { photoId, photoType: 'hostel' })}
                                            className="px-2.5 py-1 text-[10px] font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 rounded-md disabled:opacity-50"
                                          >
                                            Reject
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </SectionCard>

                {/* 8. Owner Contact Verification */}
                <div className="bg-white rounded-xl border border-amber-300 shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={isReadOnlyReview ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                        {isReadOnlyReview ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">8. Owner Contact Verification</h3>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        hostelDetails?.owner?.emailVerificationStatus === "VERIFIED"
                          ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                          : hostelDetails?.owner?.emailVerificationStatus === "OTP_SENT"
                          ? "text-blue-700 bg-blue-50 border-blue-200"
                          : "text-amber-700 bg-amber-50 border-amber-200"
                      }`}
                    >
                      {hostelDetails?.owner?.emailVerificationStatus === "VERIFIED"
                        ? "EMAIL VERIFIED"
                        : hostelDetails?.owner?.emailVerificationStatus === "OTP_SENT"
                        ? "OTP SENT"
                        : "VERIFICATION PENDING"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Verify that the owner controls the email address associated with the registered owner account.
                  </p>

                  <div className="space-y-2">
                    <p className="text-slate-400 text-xs">Registered Email</p>
                    <p className="font-semibold text-slate-800 text-sm">
                      {hostelDetails?.owner?.email || "Email not available"}
                    </p>

                    {hostelDetails?.owner?.emailVerificationStatus === "VERIFIED" ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          <Check className="w-3 h-3" />
                          EMAIL VERIFIED
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block text-[10px] font-semibold px-2 py-1 rounded border ${
                            hostelDetails?.owner?.emailVerificationStatus === "OTP_SENT"
                              ? "text-blue-600 bg-blue-50 border-blue-200"
                              : "text-amber-600 bg-amber-50 border-amber-200"
                          }`}
                        >
                          {hostelDetails?.owner?.emailVerificationStatus === "OTP_SENT" ? "OTP SENT" : "VERIFICATION PENDING"}
                        </span>
                      </div>
                    )}
                  </div>

                  {!isReadOnlyReview && hostelDetails?.owner?.emailVerificationStatus !== "VERIFIED" && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-700">Email OTP Verification</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        An OTP will be sent to the registered owner email. The owner must enter the OTP from their account.
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">OTP expires after 5 minutes.</p>
                    </div>
                  )}

                  {!isReadOnlyReview && hostelDetails?.owner?.emailVerificationStatus !== "VERIFIED" && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => sendOwnerEmailOtp(hostelDetails?.hostelId)}
                        disabled={sendingOtp}
                        className="px-4 py-2 text-xs font-semibold text-blue-600 border border-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                      >
                        {sendingOtp
                          ? "Sending..."
                          : hostelDetails?.owner?.emailVerificationStatus === "OTP_SENT"
                          ? "Resend Email OTP"
                          : "Send Email OTP"}
                      </button>
                    </div>
                  )}

                  {hostelDetails?.owner?.emailVerificationStatus === "VERIFIED" && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <p className="text-xs font-semibold text-emerald-700">Owner email has been successfully verified.</p>
                      </div>
                      <p className="text-[11px] text-emerald-600 mt-1">Email verification is independent of hostel approval.</p>
                    </div>
                  )}

                  {!isReadOnlyReview && (
                      <div className="pt-2 border-t border-slate-100">
                        {hostelDetails?.owner?.emailVerificationStatus === "VERIFIED" ? (
                          <div className="flex items-center justify-end gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-semibold text-emerald-700">
                              Owner contact verified successfully
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => sendOwnerEmailOtp(hostelDetails?.hostelId)}
                              disabled={sendingOtp}
                              className="px-4 py-2 text-xs font-semibold text-blue-600 border border-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                            >
                              {sendingOtp
                                ? "Sending..."
                                : hostelDetails?.owner?.emailVerificationStatus === "OTP_SENT"
                                ? "Resend Email OTP"
                                : "Send Email OTP"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                </div>

                {/* REJECTION INFORMATION */}
                {!isReadOnlyReview && (
                  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h3 className="text-sm font-bold text-slate-900">
                        Rejection Information
                      </h3>
                    </div>

                    {getRejectedPhotoInformation().length > 0 ? (
                      <div className="p-5 space-y-3">
                        {getRejectedPhotoInformation().map((item) => (
                          <div
                            key={item.id}
                            className="rounded-lg border border-rose-200 bg-rose-50/60 p-3"
                          >
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-rose-700">
                                  {item.label}
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                  <span className="font-semibold text-slate-700">
                                    Reason:
                                  </span>{" "}
                                  {item.reason}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-5">
                        <p className="text-xs text-slate-400">
                          No rejected images.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* FINAL HOSTEL DECISION */}
                {!isReadOnlyReview && (
                  <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
                    {getOverallImageReviewSummary().rejectionThresholdExceeded && (
                      <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
                          <div>
                            <p className="text-xs font-bold text-rose-700">
                              Overall approval disabled
                            </p>
                            <p className="text-[11px] text-rose-600 mt-0.5 leading-relaxed">
                              {getOverallImageReviewSummary().rejected} of{" "}
                              {getOverallImageReviewSummary().total} submitted images
                              are rejected (
                              {getOverallImageReviewSummary().rejectedPercentage.toFixed(0)}
                              %). More than 50% are rejected, so only Reject is available.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => rejectHostel(hostelDetails?.hostelId)}
                        className="min-w-[120px] px-5 py-2.5 text-sm font-semibold text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition"
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        disabled={!canApproveOverallHostel()}
                        onClick={() => approveHostel(hostelDetails?.hostelId)}
                        title={
                          !canApproveOverallHostel()
                            ? getOverallApproveBlockReason()
                            : "Approve hostel"
                        }
                        className={`min-w-[120px] px-5 py-2.5 text-sm font-semibold rounded-lg transition ${
                          canApproveOverallHostel()
                            ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* RIGHT SIDEBAR */}
              <div className="lg:col-span-4 space-y-4">

                {/* Review Summary Checklist */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Review Summary
                  </h3>
                  <div className="space-y-2 text-xs">
                    {Object.keys(sectionStatus).map((key) => {
                      const sectionNames = {
                        basicInfo: "Basic Information",
                        location: "Location",
                        amenities: "Amenities",
                        rooms: "Rooms",
                        rules: "Rules",
                        deposit: "Deposit",
                        hostelPhotos: "Hostel Photos",
                        ownerVerification: "Owner Verification"
                      };
                      const status = getEffectiveSectionStatus(key);
                      const isApproved = status === "APPROVED";
                      const displayStatus = isApproved ? "Approved" : 
                                           status === "CHANGES_REQUIRED" ? "Changes Required" : "Pending";

                      return (
                        <div key={key} className="flex items-center justify-between py-1 border-b border-slate-50">
                          <div className="flex items-center gap-2">
                            {isApproved ? (
                              <span className="text-emerald-500 font-bold">✓</span>
                            ) : (
                              <span className="text-amber-500 font-bold">⚠️</span>
                            )}
                            <span className="font-medium text-slate-700">{sectionNames[key]}</span>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            isApproved ? "text-emerald-600 bg-emerald-50" :
                            status === "CHANGES_REQUIRED" ? "text-rose-600 bg-rose-50" :
                            "text-amber-600 bg-amber-50"
                          }`}>
                            {displayStatus}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review History */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Review History
                  </h3>
                  <div className="space-y-4 text-xs">
                    {reviewHistory.length > 0 ? (
                      reviewHistory.map((item, index) => (
                        <div key={item.id || index}>
                          <p className="text-[10px] text-slate-400 font-semibold">
                            {formatReviewDate(item.createdAt)}
                          </p>
                          <p className="font-semibold text-slate-800">{item.action}</p>
                          {item.reason && (
                            <p className="text-slate-500 text-[11px]">Reason: {item.reason}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-xs text-slate-400">No review history available.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
              {/* */}

            </div>
          </div>
        </main>
      </div>

      {/* ============================================================
        REASON MODAL
        ============================================================ */}
      {showReasonModal && (
        <div className="fixed inset-0 z-[150] bg-black/50 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {reasonModalType === 'photo-reject' && 'Reject Photo'}
                                    {reasonModalType === 'section-changes' && 'Request Changes'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {reasonModalType === 'photo-reject' && 'Please provide a reason for rejecting this photo.'}
                                    {reasonModalType === 'section-changes' && 'Describe what changes are needed for this section.'}
                  {false && 'Add a note for approving this section (optional).'}
                </p>
              </div>
              <button
                onClick={closeReasonModal}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
              >
                <span className="text-xl">×</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {reasonModalType === 'photo-reject' ? 'Rejection Reason' :
                   reasonModalType === 'section-changes' ? 'Change Request Details' :
                   'Note (Optional)'}
                  {(reasonModalType === 'photo-reject' || reasonModalType === 'section-changes') && <span className="text-rose-500 ml-1">*</span>}
                </label>
                <textarea
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  placeholder={
                    reasonModalType === 'photo-reject' ? 'E.g., Image is blurry, incorrect orientation, etc.' :
                    reasonModalType === 'section-changes' ? 'E.g., Missing information, incorrect details, etc.' :
                    'Optional note for the owner...'
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[100px]"
                  maxLength={500}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-slate-400">
                    {(reasonModalType === 'photo-reject' || reasonModalType === 'section-changes') && 
                      'This reason will be shared with the owner.'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {reasonText.length}/500
                  </p>
                </div>
              </div>

              {reasonModalType === 'photo-reject' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-700">
                    <span className="font-semibold">💡 Tip:</span> Be specific about what needs to be fixed. 
                    The owner will see this reason and can re-upload the photo.
                  </p>
                </div>
              )}

              {reasonModalType === 'section-changes' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    <span className="font-semibold">💡 Tip:</span> Clearly describe what information is missing 
                    or incorrect so the owner can make the necessary updates.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeReasonModal}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReasonSubmit}
                  disabled={reasonSubmitting || (!reasonText.trim() && (reasonModalType === 'photo-reject' || reasonModalType === 'section-changes'))}
                  className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition ${
                    reasonSubmitting || (!reasonText.trim() && (reasonModalType === 'photo-reject' || reasonModalType === 'section-changes'))
                      ? 'bg-slate-300 cursor-not-allowed'
                      : reasonModalType === 'photo-reject' || reasonModalType === 'section-changes'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {reasonSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    reasonModalType === 'photo-reject' ? 'Reject Photo' :
                    reasonModalType === 'section-changes' ? 'Request Changes' :
                    'Confirm'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
        FULL IMAGE PREVIEW MODAL
        ============================================================ */}
      {imagePreview.open && imagePreview.images.length > 0 && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={closeImagePreview}
        >
          {/* HEADER */}
          <div
            className="absolute top-0 left-0 right-0 h-16 bg-black/50 flex items-center justify-between px-5 z-[102]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {imagePreview.title}
              </p>

              {imagePreview.images.length > 1 && (
                <p className="text-white/60 text-[11px] mt-0.5">
                  Image {imagePreview.index + 1} of{" "}
                  {imagePreview.images.length}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={closeImagePreview}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              aria-label="Close image preview"
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </div>

          {/* PREVIOUS */}
          {imagePreview.images.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPreviousPreviewImage();
              }}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-[102] w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl transition"
              aria-label="Previous image"
            >
              ‹
            </button>
          )}

          {/* COMPLETE IMAGE */}
          <div
            className="w-full h-full flex items-center justify-center pt-12 pb-4"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={imagePreview.images[imagePreview.index]}
              alt={`${imagePreview.title} ${imagePreview.index + 1}`}
              className="max-w-full max-h-full w-auto h-auto object-contain select-none"
              draggable={false}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>

          {/* NEXT */}
          {imagePreview.images.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNextPreviewImage();
              }}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-[102] w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl transition"
              aria-label="Next image"
            >
              ›
            </button>
          )}

          {/* FOOTER */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[102] bg-black/50 text-white/70 text-[11px] px-3 py-1.5 rounded-full"
            onClick={(event) => event.stopPropagation()}
          >
            Click outside to close
            {imagePreview.images.length > 1 &&
              " • Use ← → to navigate"}
          </div>
        </div>
      )}

    </div>
  );
};

// SUB-COMPONENTS

// SectionCard component with section-level approval and reject/change controls.
// Image-level verification remains inside the image sections.
const SectionCard = ({
  number,
  title,
  badge,
  status,
  sectionKey,
  sectionActionsAllowed = true,
  sectionActionBlockReason = "",
  onAccept,
  onRequestChanges,
  onUndoApprove,
  onUndoChanges,
  readOnly = false,
  children,
}) => {
  const isApproved = status === "APPROVED";
  const isChangesRequired = status === "CHANGES_REQUIRED";
  const isPending = status === "PENDING";

  return (
    <div
      className={`bg-white rounded-xl border p-5 space-y-4 shadow-sm ${
        isApproved
          ? "border-emerald-200 bg-emerald-50/30"
          : isChangesRequired
          ? "border-rose-200 bg-rose-50/30"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 min-w-0">
          {isApproved ? (
            <span className="w-5 h-5 shrink-0 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
              ✓
            </span>
          ) : isChangesRequired ? (
            <span className="w-5 h-5 shrink-0 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs">
              ✕
            </span>
          ) : (
            <span className="w-5 h-5 shrink-0 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs">
              ⚠
            </span>
          )}

          <h3 className="text-sm font-bold text-slate-900 truncate">
            {number}. {title}
          </h3>

          {badge && (
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">
              {badge}
            </span>
          )}

          {isApproved && (
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap">
              Accepted
            </span>
          )}

          {isChangesRequired && (
            <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full whitespace-nowrap">
              Rejected
            </span>
          )}

          {isPending && !sectionActionsAllowed && (
            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">
              Image Review Pending
            </span>
          )}
        </div>

        {!readOnly && isPending && (
          <button
            type="button"
            onClick={onRequestChanges}
            disabled={!sectionActionsAllowed}
            title={
              !sectionActionsAllowed
                ? sectionActionBlockReason
                : "Reject / request changes for this section"
            }
            className={`text-[11px] font-semibold ${
              sectionActionsAllowed
                ? "text-slate-500 hover:underline"
                : "text-slate-300 cursor-not-allowed"
            }`}
          >
            Request Edit
          </button>
        )}

        {!readOnly && isApproved && (
          <button
            type="button"
            onClick={onUndoApprove}
            className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <Undo2 className="w-3 h-3" />
            Undo Approval
          </button>
        )}

        {!readOnly && isChangesRequired && (
          <button
            type="button"
            onClick={onUndoChanges}
            className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <Undo2 className="w-3 h-3" />
            Undo Rejection
          </button>
        )}
      </div>

      <div>{children}</div>

      {!readOnly && (
        <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-slate-100">
          {isPending && (
            <>
              <button
                type="button"
                onClick={onRequestChanges}
                disabled={!sectionActionsAllowed}
                title={
                  !sectionActionsAllowed
                    ? sectionActionBlockReason
                    : "Reject this section / request changes"
                }
                className={`min-w-[120px] px-3.5 py-1.5 text-xs font-semibold border rounded-lg transition ${
                  sectionActionsAllowed
                    ? "text-rose-600 border-rose-200 bg-white hover:bg-rose-50"
                    : "text-slate-400 border-slate-200 bg-slate-100 cursor-not-allowed"
                }`}
              >
                Reject Section
              </button>

              <button
                type="button"
                onClick={onAccept}
                disabled={!sectionActionsAllowed}
                title={
                  !sectionActionsAllowed
                    ? sectionActionBlockReason
                    : "Accept this section"
                }
                className={`min-w-[120px] px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition ${
                  sectionActionsAllowed
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                ✓ Accept Section
              </button>
            </>
          )}

          {isApproved && (
            <button
              type="button"
              onClick={onUndoApprove}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer hover:bg-emerald-200"
            >
              ✓ Accepted
              <Undo2 className="w-3 h-3 ml-1" />
            </button>
          )}

          {isChangesRequired && (
            <button
              type="button"
              onClick={onUndoChanges}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer hover:bg-rose-200"
            >
              ✕ Rejected
              <Undo2 className="w-3 h-3 ml-1" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;