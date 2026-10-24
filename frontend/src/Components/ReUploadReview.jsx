import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  Moon,
  Sun,
  Building2,
  Clock3,
  RefreshCw,
  MessageSquareWarning,
  ShieldCheck,
  BarChart3,
  Gem,
  FileText,
  Users,
  Settings,
  FileBarChart,
  HelpCircle,
  CalendarDays,
  RotateCw,
  ChevronDown,
  ChevronRight,
  X,
  Image as ImageIcon,
  Wifi,
  BedDouble,
  Sparkles,
  Maximize2,
  LogOut,
  LayoutDashboard,
  History,
  Building,
  Filter,
  SlidersHorizontal,
} from "lucide-react";

const API_BASE_URL = "http://localhost:8080";

/* ============================================================
 * AUTH
 * ============================================================ */

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken");

  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getImageUrl = (url) => {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  if (url.startsWith("/")) return `${API_BASE_URL}${url}`;
  return `${API_BASE_URL}/${url}`;
};

/* ============================================================
 * CONSTANTS — ENTITY / ACTION / STATUS
 * ============================================================ */

const ENTITY_TYPE = {
  AMENITY: "AMENITY",
  ROOM: "ROOM",
  HOSTEL_PHOTO: "HOSTEL_PHOTO",
};

const ACTION_TYPE = {
  NEW: "NEW",
  REUPLOAD: "REUPLOAD",
};

const STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

const ENTITY_LABEL = {
  AMENITY: "Amenity",
  ROOM: "Room",
  HOSTEL_PHOTO: "Hostel Photo",
};

const ACTION_LABEL = {
  NEW: "New",
  REUPLOAD: "Re-upload",
};

const ENTITY_ICON = {
  AMENITY: Wifi,
  ROOM: BedDouble,
  HOSTEL_PHOTO: Building2,
};

/* ============================================================
 * NORMALIZERS
 * ============================================================ */

const inferEntityType = (review) => {
  const raw = (
    review?.entityType ||
    review?.requestType ||
    review?.type ||
    review?.reviewType ||
    ""
  ).toUpperCase();

  if (raw.includes("AMENITY")) return ENTITY_TYPE.AMENITY;
  if (raw.includes("ROOM")) return ENTITY_TYPE.ROOM;
  if (raw.includes("HOSTEL") || raw.includes("PHOTO"))
    return ENTITY_TYPE.HOSTEL_PHOTO;

  if (review?.amenityId || review?.hostelAmenityId)
    return ENTITY_TYPE.AMENITY;
  if (review?.roomId) return ENTITY_TYPE.ROOM;

  return ENTITY_TYPE.AMENITY;
};

const inferActionType = (review) => {
  const raw = (
    review?.actionType ||
    review?.requestType ||
    review?.type ||
    review?.reviewType ||
    ""
  ).toUpperCase();

  if (raw.includes("REUPLOAD") || raw.includes("RE-UPLOAD"))
    return ACTION_TYPE.REUPLOAD;

  if (
    review?.oldImageUrl ||
    review?.previousImageUrl ||
    review?.oldPhotoUrl
  ) {
    return ACTION_TYPE.REUPLOAD;
  }

  if (review?.previousRejectionReason || review?.rejectionReason) {
    return ACTION_TYPE.REUPLOAD;
  }

  return ACTION_TYPE.NEW;
};

const normalizeReview = (review, index = 0) => {
  const entityType = inferEntityType(review);
  const actionType = inferActionType(review);

  const id =
    review?.id ??
    review?.requestId ??
    `${entityType}-${actionType}-${index}`;

  const photoId = review?.photoId ?? review?.photo?.id ?? null;

  const newImageUrl =
    review?.newImageUrl ||
    review?.reUploadImageUrl ||
    review?.reuploadedImageUrl ||
    review?.newPhotoUrl ||
    review?.newImage ||
    review?.imageUrl ||
    review?.photoUrl ||
    review?.photo?.photoUrl ||
    review?.photo?.url ||
    "";

  const oldImageUrl =
    review?.oldImageUrl ||
    review?.previousImageUrl ||
    review?.oldPhotoUrl ||
    review?.previousPhotoUrl ||
    review?.oldImage ||
    review?.previousImage ||
    "";

  return {
    ...review,
    id,
    entityType,
    actionType,
    status: String(review?.status || STATUS.PENDING).toUpperCase(),
    hostelId: review?.hostelId ?? review?.hostel?.id ?? null,
    hostelName:
      review?.hostelName ||
      review?.hostel?.hostelName ||
      review?.hostel?.name ||
      review?.hostel?.basicInfo?.hostelName ||
      "Unknown Hostel",
    ownerName:
      review?.ownerName ||
      review?.owner?.fullName ||
      review?.owner?.name ||
      review?.hostel?.ownerName ||
      review?.hostel?.owner?.name ||
      "Unknown Owner",
    itemName:
      review?.amenityName ||
      review?.roomName ||
      review?.photoTitle ||
      review?.name ||
      review?.amenity?.amenityName ||
      review?.room?.name ||
      "",
    photoId,
    newImageUrl,
    oldImageUrl,
    previousRejectionReason:
      review?.previousRejectionReason ||
      review?.rejectionReason ||
      review?.photo?.rejectionReason ||
      "",
    submittedAt:
      review?.submittedAt ||
      review?.createdAt ||
      review?.uploadedAt ||
      review?.photo?.uploadedAt ||
      null,
  };
};

/* ============================================================
 * DATA LOADER
 * ============================================================ */

const loadAllPendingReviews = async () => {
  let rawRequests = [];

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/admin/amenity-change-requests/pending`,
      { headers: getAuthHeaders() }
    );

    if (res.ok) {
      const data = await res.json();
      rawRequests = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.requests)
            ? data.requests
            : Array.isArray(data?.pendingRequests)
              ? data.pendingRequests
              : [];
    } else {
      const fallback = await fetch(
        `${API_BASE_URL}/api/admin/re-upload-reviews`,
        { headers: getAuthHeaders() }
      );
      if (fallback.ok) {
        const data = await fallback.json();
        rawRequests = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.requests)
              ? data.requests
              : [];
      }
    }
  } catch (err) {
    console.error("Amenity requests fetch failed:", err);
  }

  const directPhotoReviews = [];
  const hostelMetaById = new Map();

  try {
    const hostelsRes = await fetch(`${API_BASE_URL}/api/admin/hostels`, {
      headers: getAuthHeaders(),
    });

    if (hostelsRes.ok) {
      const hostelsData = await hostelsRes.json();
      const hostels = Array.isArray(hostelsData)
        ? hostelsData
        : Array.isArray(hostelsData?.data)
          ? hostelsData.data
          : Array.isArray(hostelsData?.hostels)
            ? hostelsData.hostels
            : [];

      hostels.forEach((hostel) => {
        const hostelId = hostel?.hostelId ?? hostel?.id;
        if (!hostelId) return;

        hostelMetaById.set(String(hostelId), {
          hostelName:
            hostel?.hostelName ||
            hostel?.name ||
            hostel?.basicInfo?.hostelName ||
            "Unknown Hostel",
          ownerName:
            hostel?.ownerName ||
            hostel?.owner?.fullName ||
            hostel?.owner?.name ||
            "Unknown Owner",
        });
      });

      const details = await Promise.all(
        hostels.map(async (h) => {
          const hostelId = h?.hostelId ?? h?.id;
          if (!hostelId) return null;
          try {
            const r = await fetch(
              `${API_BASE_URL}/api/admin/hostels/${hostelId}`,
              { headers: getAuthHeaders() }
            );
            return r.ok ? await r.json() : null;
          } catch {
            return null;
          }
        })
      );

      details.filter(Boolean).forEach((detail) => {
        const hostelId = detail?.hostelId ?? detail?.id;
        const detailHostelName =
          detail?.basicInfo?.hostelName ||
          detail?.hostelName ||
          detail?.name ||
          "Unknown Hostel";
        const detailOwnerName =
          detail?.owner?.name ||
          detail?.owner?.fullName ||
          detail?.basicInfo?.ownerName ||
          detail?.ownerName ||
          "Unknown Owner";

        if (hostelId) {
          const existingMeta = hostelMetaById.get(String(hostelId)) || {};
          hostelMetaById.set(String(hostelId), {
            hostelName:
              detailHostelName !== "Unknown Hostel"
                ? detailHostelName
                : existingMeta.hostelName || "Unknown Hostel",
            ownerName:
              detailOwnerName !== "Unknown Owner"
                ? detailOwnerName
                : existingMeta.ownerName || "Unknown Owner",
          });
        }

        const hostelName = detailHostelName;
        const ownerName = detailOwnerName;

        const amenities = Array.isArray(detail?.amenities)
          ? detail.amenities
          : [];

        amenities.forEach((amenity) => {
          const amenityId = amenity?.id ?? amenity?.amenityId;
          const photos = Array.isArray(amenity?.photos)
            ? amenity.photos
            : [];

          if (!amenityId || photos.length === 0) return;

          const normalizedPhotos = photos
            .filter(Boolean)
            .map((p) => ({
              ...p,
              id: p?.id ?? p?.photoId,
              status: String(
                p?.verificationStatus || p?.status || ""
              ).toUpperCase(),
            }))
            .filter((p) => p?.id);

          const pendingPhotos = normalizedPhotos.filter(
            (p) => p.status === STATUS.PENDING
          );
          const rejectedPhotos = normalizedPhotos
            .filter((p) => p.status === STATUS.REJECTED)
            .sort((a, b) =>
              String(b?.reviewedAt || b?.uploadedAt || "").localeCompare(
                String(a?.reviewedAt || a?.uploadedAt || "")
              )
            );

          pendingPhotos.forEach((pendingPhoto) => {
            const rejectedPhoto = rejectedPhotos[0] || null;

            const alreadyInRequests = rawRequests.some(
              (r) =>
                String(r.photoId ?? "") === String(pendingPhoto.id ?? "")
            );
            if (alreadyInRequests) return;

            const newPhotoId = pendingPhoto.id;
            const oldPhotoId = rejectedPhoto?.id ?? null;

            directPhotoReviews.push(
              normalizeReview(
                {
                  id: `photo-${hostelId}-${amenityId}-${newPhotoId}`,
                  source: "PHOTO_REUPLOAD",
                  entityType: ENTITY_TYPE.AMENITY,
                  actionType: oldPhotoId
                    ? ACTION_TYPE.REUPLOAD
                    : ACTION_TYPE.NEW,
                  status: STATUS.PENDING,
                  hostelId,
                  hostelName,
                  ownerName,
                  amenityId,
                  amenityName:
                    amenity?.amenityName || amenity?.name || "Amenity",
                  photoId: newPhotoId,
                  newImageUrl: `/api/owner/hostels/amenities/photos/${newPhotoId}`,
                  oldImageUrl: oldPhotoId
                    ? `/api/owner/hostels/amenities/photos/${oldPhotoId}`
                    : "",
                  previousRejectionReason:
                    rejectedPhoto?.rejectionReason ||
                    rejectedPhoto?.reason ||
                    "",
                  submittedAt:
                    pendingPhoto?.uploadedAt ||
                    pendingPhoto?.createdAt ||
                    null,
                },
                directPhotoReviews.length
              )
            );
          });
        });
      });
    }
  } catch (err) {
    console.error("Hostel detail fetch failed:", err);
  }

  const amenityReviews = rawRequests.map((r, i) => {
    const requestHostelId =
      r?.hostelId ??
      r?.hostel?.hostelId ??
      r?.hostel?.id ??
      null;

    const metadata = requestHostelId
      ? hostelMetaById.get(String(requestHostelId))
      : null;

    return normalizeReview(
      {
        ...r,
        source: "AMENITY_REQUEST",
        entityType: ENTITY_TYPE.AMENITY,
        actionType: inferActionType(r),
        hostelId: requestHostelId ?? r?.hostelId,
        hostelName:
          r?.hostelName ||
          r?.hostel?.hostelName ||
          r?.hostel?.name ||
          r?.hostel?.basicInfo?.hostelName ||
          metadata?.hostelName ||
          "Unknown Hostel",
        ownerName:
          r?.ownerName ||
          r?.owner?.fullName ||
          r?.owner?.name ||
          r?.hostel?.ownerName ||
          r?.hostel?.owner?.fullName ||
          r?.hostel?.owner?.name ||
          metadata?.ownerName ||
          "Unknown Owner",
      },
      i
    );
  });

  const merged = [...amenityReviews, ...directPhotoReviews];
  const seen = new Set();
  return merged.filter((r) => {
    const key =
      r.photoId != null
        ? `${r.source}-photo-${r.photoId}`
        : `${r.source}-id-${r.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/* ============================================================
 * HELPERS
 * ============================================================ */

const formatRelative = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
};

const formatFullDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* ============================================================
 * SUBCOMPONENTS
 * ============================================================ */

const StatusBadge = ({ status }) => {
  const s = String(status || "").toUpperCase();
  if (s === STATUS.APPROVED) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF3] px-3 py-1 text-xs font-semibold text-[#059669]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
        Approved
      </span>
    );
  }
  if (s === STATUS.REJECTED) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF1F2] px-3 py-1 text-xs font-semibold text-[#E11D48]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#F43F5E]" />
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF8E7] px-3 py-1 text-xs font-semibold text-[#D97706]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
      Pending
    </span>
  );
};

const ActionBadge = ({ actionType }) => {
  if (actionType === ACTION_TYPE.REUPLOAD) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-[#EEF2FF] px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#4F46E5]">
        <RefreshCw size={11} strokeWidth={2.5} />
        Re-upload
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-[#F0FDF4] px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#16A34A]">
      <Sparkles size={11} strokeWidth={2.5} />
      New
    </span>
  );
};

const EntityBadge = ({ entityType }) => {
  const Icon = ENTITY_ICON[entityType] || Wifi;
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-[#F1F5F9] px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#475569]">
      <Icon size={11} strokeWidth={2.5} />
      {ENTITY_LABEL[entityType] || "Item"}
    </span>
  );
};

const ImagePreview = ({
  src,
  label,
  className = "",
  onExpand,
}) => {
  const [failed, setFailed] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState("");
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;

    setFailed(false);
    setResolvedSrc("");

    if (!src) return undefined;

    const normalized = String(src);
    const needsAuth = normalized.includes(
      "/api/owner/hostels/amenities/photos/"
    );

    if (!needsAuth) {
      setResolvedSrc(getImageUrl(normalized));
      return undefined;
    }

    (async () => {
      try {
        setResolving(true);
        const res = await fetch(getImageUrl(normalized), {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setResolvedSrc(objectUrl);
      } catch (e) {
        console.error("Image load failed:", e);
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setResolving(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`flex h-full min-h-[140px] max-h-[220px] items-center justify-center bg-[#F8FAFC] ${className}`}
      >
        <div className="text-center">
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-[#EEF2F7]">
            <ImageIcon size={22} strokeWidth={1.6} className="text-[#94A3B8]" />
          </div>
          <p className="text-xs font-medium text-[#64748B]">
            {label || "Image unavailable"}
          </p>
        </div>
      </div>
    );
  }

  if (resolving || !resolvedSrc) {
    return (
      <div
        className={`flex h-full min-h-[140px] max-h-[220px] items-center justify-center bg-[#F8FAFC] ${className}`}
      >
        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-[#E2E8F0] border-t-[#2563EB]" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() =>
        onExpand?.({
          src: resolvedSrc,
          label: label || "Review",
        })
      }
      className={`group relative block w-full overflow-hidden bg-white ${className}`}
      aria-label={`Expand ${label || "image"}`}
    >
      <img
        src={resolvedSrc}
        alt={label || "Review"}
        className="block h-auto max-h-[220px] w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
        onError={() => setFailed(true)}
      />

      <span className="pointer-events-none absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
        <Maximize2 size={16} strokeWidth={2} />
      </span>
    </button>
  );
};

const ExpandedImageModal = ({ image, onClose }) => {
  if (!image?.src) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] max-w-[94vw] items-center justify-center rounded-2xl bg-white p-2 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/75"
          aria-label="Close expanded image"
        >
          <X size={20} strokeWidth={2} />
        </button>

        <img
          src={image.src}
          alt={image.label || "Expanded review image"}
          className="max-h-[88vh] max-w-[92vw] rounded-xl object-contain"
        />
      </div>
    </div>
  );
};

/* ============================================================
 * SIDEBAR — extracted from Hostel Request admin page
 * ============================================================ */

const NavItem = ({ icon: Icon, label, active, onClick, sidebarOpen }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
      active
        ? "bg-blue-600 text-white shadow-sm"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`}
  >
    <Icon
      className={`w-5 h-5 shrink-0 ${
        active ? "text-white" : "text-slate-500"
      }`}
    />
    {sidebarOpen && <span>{label}</span>}
  </button>
);

/* ============================================================
 * MAIN COMPONENT
 * ============================================================ */

const PendingChangesReview = () => {
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState(STATUS.PENDING);
  const [dateFilter, setDateFilter] = useState("ALL");

  const [expandedHostels, setExpandedHostels] = useState({});

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await loadAllPendingReviews();
      setReviews(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load pending changes.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNavigation = (path) => {
    setProfileMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("hostelId");
    setProfileMenuOpen(false);
    navigate("/", { replace: true });
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (entityFilter !== "ALL" && r.entityType !== entityFilter)
        return false;
      if (actionFilter !== "ALL" && r.actionType !== actionFilter)
        return false;

      if (dateFilter !== "ALL" && r.submittedAt) {
        const age =
          (Date.now() - new Date(r.submittedAt).getTime()) /
          (1000 * 60 * 60 * 24);
        if (dateFilter === "TODAY" && age > 1) return false;
        if (dateFilter === "WEEK" && age > 7) return false;
        if (dateFilter === "MONTH" && age > 30) return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = [
          r.hostelName,
          r.ownerName,
          r.itemName,
          r.id,
          r.hostelId,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [reviews, statusFilter, entityFilter, actionFilter, dateFilter, search]);

  const groupedByHostel = useMemo(() => {
    const map = new Map();
    filteredReviews.forEach((r) => {
      const key = r.hostelId || r.hostelName || "unknown";
      if (!map.has(key)) {
        map.set(key, {
          hostelId: r.hostelId,
          hostelName: r.hostelName,
          ownerName: r.ownerName,
          items: [],
        });
      }
      map.get(key).items.push(r);
    });
    return Array.from(map.values());
  }, [filteredReviews]);

  const counts = useMemo(() => {
    const base = reviews;
    return {
      PENDING: base.filter((r) => r.status === STATUS.PENDING).length,
      REUPLOAD: base.filter(
        (r) =>
          r.actionType === ACTION_TYPE.REUPLOAD &&
          r.status === STATUS.PENDING
      ).length,
      NEW: base.filter(
        (r) =>
          r.actionType === ACTION_TYPE.NEW && r.status === STATUS.PENDING
      ).length,
      APPROVED_TODAY: base.filter((r) => {
        if (r.status !== STATUS.APPROVED) return false;
        if (!r.submittedAt) return false;
        const age =
          (Date.now() - new Date(r.submittedAt).getTime()) /
          (1000 * 60 * 60 * 24);
        return age <= 1;
      }).length,
    };
  }, [reviews]);

  const handleApprove = async (review) => {
    if (!review?.id) return;
    try {
      setError("");
      const source = review.source || "";

      let res;
      if (source === "PHOTO_REUPLOAD") {
        if (!review.photoId) throw new Error("Photo ID missing.");
        res = await fetch(
          `${API_BASE_URL}/api/admin/photos/amenity/${review.photoId}/verification`,
          {
            method: "PUT",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: "APPROVED",
              rejectionReason: "",
            }),
          }
        );
      } else {
        res = await fetch(
          `${API_BASE_URL}/api/admin/re-upload-reviews/${review.id}/approve`,
          {
            method: "PUT",
            headers: getAuthHeaders(),
          }
        );
      }

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Failed to approve.");
      }
      await loadReviews();
      setSelectedReview(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to approve.");
    }
  };

  const handleReject = async (review) => {
    if (!review?.id) return;
    const reason = window.prompt("Enter rejection reason:");
    if (!reason || !reason.trim()) return;

    try {
      setError("");
      const source = review.source || "";
      let res;

      if (source === "PHOTO_REUPLOAD") {
        if (!review.photoId) throw new Error("Photo ID missing.");
        res = await fetch(
          `${API_BASE_URL}/api/admin/photos/amenity/${review.photoId}/verification`,
          {
            method: "PUT",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: "REJECTED",
              rejectionReason: reason.trim(),
            }),
          }
        );
      } else {
        res = await fetch(
          `${API_BASE_URL}/api/admin/re-upload-reviews/${review.id}/reject`,
          {
            method: "PUT",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ reason: reason.trim() }),
          }
        );
      }

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Failed to reject.");
      }
      await loadReviews();
      setSelectedReview(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to reject.");
    }
  };

  const toggleHostel = (key) =>
    setExpandedHostels((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased overflow-hidden">
      {/* ======================================================== */}
      {/* SIDEBAR — same as Hostel Request admin page              */}
      {/* ======================================================== */}

      <aside
        className={`fixed top-0 left-0 h-screen ${
          sidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 bg-white border-r border-slate-200 flex flex-col justify-between z-30`}
      >
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-100">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-6 h-6" />
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

          {/* Navigation */}
          <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-180px)]">
            {/* Dashboard */}
            <div>
              <NavItem
                icon={LayoutDashboard}
                label="Dashboard"
                sidebarOpen={sidebarOpen}
                onClick={() => handleNavigation("/admin/dashboard")}
              />
            </div>

            {/* Management */}
            <div>
              {sidebarOpen && (
                <p className="px-3 text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2">
                  Management
                </p>
              )}

              <nav className="space-y-1">
                <NavItem
                  icon={Building2}
                  label="Hostel Requests"
                  sidebarOpen={sidebarOpen}
                  onClick={() => handleNavigation("/admin/hostel-management")}
                />

                <NavItem
                  icon={Clock3}
                  label="Pending Approvals"
                  sidebarOpen={sidebarOpen}
                  onClick={() =>
                    handleNavigation("/admin/pending-approvals/:hostel-id")
                  }
                />

                <NavItem
                  icon={RefreshCw}
                  label="Reupload Review"
                  active
                  sidebarOpen={sidebarOpen}
                  onClick={() => handleNavigation("/admin/reupload")}
                />

                <NavItem
                  icon={MessageSquareWarning}
                  label="User Issues"
                  sidebarOpen={sidebarOpen}
                  onClick={() => handleNavigation("/admin/user-issues")}
                />

                <NavItem
                  icon={ShieldCheck}
                  label="Owner Verification"
                  sidebarOpen={sidebarOpen}
                  onClick={() => handleNavigation("/admin/owner-verification")}
                />
              </nav>
            </div>

            {/* Analytics */}
            <div>
              {sidebarOpen && (
                <p className="px-3 text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2">
                  Analytics & Reports
                </p>
              )}

              <nav className="space-y-1">
                <NavItem
                  icon={BarChart3}
                  label="Analytics"
                  sidebarOpen={sidebarOpen}
                  onClick={() => handleNavigation("/admin/analytics")}
                />
                <NavItem
                  icon={Gem}
                  label="Subscription"
                  sidebarOpen={sidebarOpen}
                  onClick={() => handleNavigation("/admin/subscription")}
                />
                <NavItem
                  icon={FileText}
                  label="Reports"
                  sidebarOpen={sidebarOpen}
                  onClick={() => handleNavigation("/admin/reports")}
                />
              </nav>
            </div>

            {/* System */}
            <div>
              {sidebarOpen && (
                <p className="px-3 text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2">
                  System
                </p>
              )}

              <nav className="space-y-1">
                <NavItem
                  icon={Users}
                  label="Users"
                  sidebarOpen={sidebarOpen}
                  onClick={() => handleNavigation("/admin/users")}
                />
                <NavItem
                  icon={Settings}
                  label="System Settings"
                  sidebarOpen={sidebarOpen}
                  onClick={() => handleNavigation("/admin/settings")}
                />
                <NavItem
                  icon={History}
                  label="Audit Logs"
                  sidebarOpen={sidebarOpen}
                  onClick={() => handleNavigation("/admin/audit-logs")}
                />
              </nav>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          {sidebarOpen && (
            <button className="w-full py-2.5 px-3 border border-blue-200 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2 mb-2">
              <FileText className="w-4 h-4" />
              Generate Reports
            </button>
          )}

          <NavItem
            icon={HelpCircle}
            label="Help Center"
            sidebarOpen={sidebarOpen}
            onClick={() => handleNavigation("/help")}
          />

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <LogOut className="w-5 h-5 shrink-0 text-slate-500" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN CONTENT                                              */}
      {/* ======================================================== */}

      <div
        className={`flex-1 flex flex-col min-w-0 h-screen overflow-hidden transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* ====================================================== */}
        {/* TOP NAVBAR                                             */}
        {/* ====================================================== */}

        <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="relative w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

              <input
                type="text"
                placeholder="Search hostel, owner..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-12 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />

              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 border border-slate-200 bg-white rounded text-xs text-slate-400 font-mono">
                ⌘ K
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer p-2 hover:bg-slate-100 rounded-full text-slate-600 transition">
              <Bell className="w-6 h-6" />
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition"
            >
              {darkMode ? (
                <Sun className="w-6 h-6" />
              ) : (
                <Moon className="w-6 h-6" />
              )}
            </button>

            <div className="h-6 w-px bg-slate-200" />

            <div ref={profileMenuRef} className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-3 pl-2 cursor-pointer rounded-xl px-2 py-1.5 hover:bg-slate-50 transition"
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  A
                </div>

                <div className="text-left hidden md:block leading-tight">
                  <p className="text-sm font-semibold text-slate-800">
                    Admin User
                  </p>
                  <p className="text-xs text-slate-400">Super Admin</p>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-slate-400 hidden md:block transition-transform ${
                    profileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
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

        {/* ====================================================== */}
        {/* SCROLLABLE CONTENT                                      */}
        {/* ====================================================== */}

        <main className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1400px]">
            {/* Page header */}
            <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF2FF]">
                  <RefreshCw
                    size={22}
                    strokeWidth={2}
                    className="text-[#2563EB]"
                  />
                </div>
                <div>
                  <h1 className="text-[26px] font-bold tracking-[-0.6px] text-[#17213A]">
                    Re-upload & Changes Review
                  </h1>
                  <p className="mt-1 text-[14px] text-[#7890AE]">
                    Review new and replacement content submitted by hostel
                    owners
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-[43px] items-center gap-2 rounded-xl border border-[#DDE5EF] bg-white px-4 text-[14px] font-medium text-[#40536F] shadow-sm">
                  <CalendarDays
                    size={17}
                    strokeWidth={1.8}
                    className="text-[#7C91AC]"
                  />
                  <span>
                    {new Date().toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={loadReviews}
                  disabled={loading}
                  className="inline-flex h-[43px] items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 text-[14px] font-semibold text-white shadow-[0_5px_12px_rgba(37,99,235,0.18)] transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RotateCw
                    size={17}
                    strokeWidth={2}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#FECACA] bg-[#FFF1F2] p-4">
                <MessageSquareWarning
                  size={20}
                  className="mt-0.5 shrink-0 text-[#E11D48]"
                />
                <div>
                  <p className="text-sm font-medium text-[#9F1239]">{error}</p>
                  <button
                    type="button"
                    onClick={loadReviews}
                    className="mt-1 text-sm font-medium text-[#BE123C] underline hover:no-underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {/* Summary cards */}
            <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
              <SummaryCard
                label="Pending"
                value={counts.PENDING}
                icon={Clock3}
                color="amber"
              />
              <SummaryCard
                label="Re-uploads"
                value={counts.REUPLOAD}
                icon={RefreshCw}
                color="indigo"
              />
              <SummaryCard
                label="New Content"
                value={counts.NEW}
                icon={Sparkles}
                color="green"
              />
              <SummaryCard
                label="Approved Today"
                value={counts.APPROVED_TODAY}
                icon={ShieldCheck}
                color="blue"
              />
            </div>

            {/* Filters */}
            <div className="mb-6 rounded-2xl border border-[#E1E7EF] bg-white p-4 shadow-[0_2px_8px_rgba(30,55,90,0.04)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search
                    size={19}
                    strokeWidth={1.8}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#93A5BB]"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search hostel or owner..."
                    className="h-[45px] w-full rounded-xl border border-[#DDE5EF] bg-[#FBFCFE] py-2.5 pl-11 pr-4 text-[14px] text-[#17213A] outline-none transition placeholder:text-[#91A3BA] focus:border-[#8CB7FF] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/10"
                  />
                </div>

                <FilterDropdown
                  value={entityFilter}
                  onChange={setEntityFilter}
                  options={[
                    { value: "ALL", label: "All Types" },
                    { value: ENTITY_TYPE.AMENITY, label: "Amenity" },
                    { value: ENTITY_TYPE.ROOM, label: "Room" },
                    {
                      value: ENTITY_TYPE.HOSTEL_PHOTO,
                      label: "Hostel Photo",
                    },
                  ]}
                />

                <FilterDropdown
                  value={actionFilter}
                  onChange={setActionFilter}
                  options={[
                    { value: "ALL", label: "All Actions" },
                    { value: ACTION_TYPE.NEW, label: "New" },
                    { value: ACTION_TYPE.REUPLOAD, label: "Re-upload" },
                  ]}
                />

                <FilterDropdown
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: "ALL", label: "All Status" },
                    { value: STATUS.PENDING, label: "Pending" },
                    { value: STATUS.APPROVED, label: "Approved" },
                    { value: STATUS.REJECTED, label: "Rejected" },
                  ]}
                />

                <FilterDropdown
                  value={dateFilter}
                  onChange={setDateFilter}
                  options={[
                    { value: "ALL", label: "All Time" },
                    { value: "TODAY", label: "Today" },
                    { value: "WEEK", label: "This Week" },
                    { value: "MONTH", label: "This Month" },
                  ]}
                />
              </div>
            </div>

            {/* List */}
            {loading ? (
              <div className="rounded-2xl border border-[#E1E7EF] bg-white p-16 text-center shadow-[0_2px_8px_rgba(30,55,90,0.04)]">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-[3px] border-[#E2E8F0] border-t-[#2563EB]" />
                <p className="mt-4 text-[14px] font-medium text-[#7B90AC]">
                  Loading pending changes...
                </p>
              </div>
            ) : groupedByHostel.length === 0 ? (
              <div className="rounded-2xl border border-[#E1E7EF] bg-white px-6 py-20 text-center shadow-[0_2px_8px_rgba(30,55,90,0.04)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1F5F9]">
                  <FileText
                    size={29}
                    strokeWidth={1.5}
                    className="text-[#94A3B8]"
                  />
                </div>
                <h2 className="mt-5 text-[16px] font-semibold text-[#26344D]">
                  No pending changes found
                </h2>
                <p className="mx-auto mt-1 max-w-md text-[14px] text-[#8BA0BB]">
                  There are currently no submissions matching the selected
                  filters.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {groupedByHostel.map((group) => {
                  const groupKey =
                    group.hostelId || group.hostelName || "unknown";
                  const expanded = expandedHostels[groupKey] !== false;
                  const pendingCount = group.items.length;

                  return (
                    <div
                      key={groupKey}
                      className="overflow-hidden rounded-2xl border border-[#E1E7EF] bg-white shadow-[0_2px_8px_rgba(30,55,90,0.04)]"
                    >
                      <button
                        type="button"
                        onClick={() => toggleHostel(groupKey)}
                        className="flex w-full items-center justify-between gap-4 border-b border-[#EDF1F5] bg-[#FBFCFE] px-5 py-4 text-left transition hover:bg-[#F5F8FC]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2FF]">
                            <Building2
                              size={19}
                              strokeWidth={2}
                              className="text-[#2563EB]"
                            />
                          </div>
                          <div>
                            <p className="text-[15px] font-semibold text-[#26344D]">
                              {group.hostelName}
                            </p>
                            <p className="mt-0.5 text-[12px] text-[#7C91AC]">
                              Owner: {group.ownerName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-[#FFF8E7] px-3 py-1 text-[12px] font-semibold text-[#D97706]">
                            {pendingCount} pending
                          </span>
                          {expanded ? (
                            <ChevronDown
                              size={18}
                              className="text-[#7C91AC]"
                            />
                          ) : (
                            <ChevronRight
                              size={18}
                              className="text-[#7C91AC]"
                            />
                          )}
                        </div>
                      </button>

                      {expanded && (
                        <div className="divide-y divide-[#F1F5F9]">
                          {group.items.map((review) => (
                            <ReviewCard
                              key={review.id}
                              review={review}
                              onView={() => setSelectedReview(review)}
                              onApprove={() => handleApprove(review)}
                              onReject={() => handleReject(review)}
                              onExpandImage={setExpandedImage}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Details modal */}
      {selectedReview && (
        <ReviewDetailsModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onApprove={() => handleApprove(selectedReview)}
          onReject={() => handleReject(selectedReview)}
          onExpandImage={setExpandedImage}
        />
      )}

      {expandedImage && (
        <ExpandedImageModal
          image={expandedImage}
          onClose={() => setExpandedImage(null)}
        />
      )}
    </div>
  );
};

/* ============================================================
 * SUMMARY CARD
 * ============================================================ */
const SummaryCard = ({ label, value, icon: Icon, color }) => {
  const colorMap = {
    amber: {
      bg: "bg-[#FFF7E5]",
      text: "text-[#F59E0B]",
      ring: "border-[#F6C95C]",
    },
    indigo: {
      bg: "bg-[#EEF2FF]",
      text: "text-[#4F46E5]",
      ring: "border-[#C7D2FE]",
    },
    green: {
      bg: "bg-[#EAFBF3]",
      text: "text-[#16A34A]",
      ring: "border-[#BBF7D0]",
    },
    blue: {
      bg: "bg-[#EAF2FF]",
      text: "text-[#2563EB]",
      ring: "border-[#BFDBFE]",
    },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`rounded-2xl border ${c.ring} bg-white p-5 shadow-[0_2px_8px_rgba(30,55,90,0.04)] transition`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium text-[#8094AF]">{label}</p>
          <p className="mt-2 text-[28px] font-bold tracking-[-0.5px] text-[#17213A]">
            {value}
          </p>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg}`}
        >
          <Icon size={19} strokeWidth={2} className={c.text} />
        </div>
      </div>
    </div>
  );
};

/* ============================================================
 * FILTER DROPDOWN
 * ============================================================ */
const FilterDropdown = ({ value, onChange, options }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-[45px] w-full cursor-pointer appearance-none rounded-xl border border-[#DDE5EF] bg-[#FBFCFE] pl-4 pr-10 text-[14px] font-medium text-[#40536F] outline-none transition focus:border-[#8CB7FF] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/10 lg:w-auto"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    <ChevronDown
      size={16}
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7C91AC]"
    />
  </div>
);

/* ============================================================
 * REVIEW CARD
 * ============================================================ */
const ReviewCard = ({ review, onView, onApprove, onReject, onExpandImage }) => {
  const isReupload = review.actionType === ACTION_TYPE.REUPLOAD;
  const isPending = review.status === STATUS.PENDING;

  return (
    <div className="px-5 py-5">
      <div className="flex flex-wrap items-center gap-2">
        <EntityBadge entityType={review.entityType} />
        <ActionBadge actionType={review.actionType} />
        <StatusBadge status={review.status} />
        <span className="ml-auto text-[12px] text-[#8BA0BB]">
          {formatRelative(review.submittedAt)}
        </span>
      </div>

      {review.itemName && (
        <p className="mt-3 text-[15px] font-semibold text-[#26344D]">
          {review.itemName}
        </p>
      )}

      <div className="mt-4">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#16A34A]">
            {isReupload ? "Re-uploaded / Pending" : "New Image"}
          </p>
          <div className="mx-auto max-w-md overflow-hidden rounded-xl border border-[#BBF7D0] bg-[#F0FDF4]">
            <ImagePreview
              src={review.newImageUrl}
              label="Re-uploaded image unavailable"
              onExpand={onExpandImage}
              className="min-h-[140px] max-h-[220px]"
            />
          </div>
        </div>
      </div>

      {review.previousRejectionReason && (
        <div className="mt-4 rounded-xl border border-[#FFD5DC] bg-[#FFF7F8] p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#E11D48]">
            Previous Rejection Reason
          </p>
          <p className="mt-1 text-[13px] leading-6 text-[#9F1239]">
            {review.previousRejectionReason}
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onView}
          className="rounded-lg border border-[#D8E1EC] bg-white px-4 py-2 text-[13px] font-semibold text-[#45607F] transition hover:border-[#B9C8DA] hover:bg-[#F8FAFC]"
        >
          View Details
        </button>

        {isPending && (
          <>
            <button
              type="button"
              onClick={onReject}
              className="rounded-lg border border-[#F5B8C3] bg-white px-4 py-2 text-[13px] font-semibold text-[#E11D48] transition hover:bg-[#FFF4F5]"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={onApprove}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_10px_rgba(37,99,235,0.16)] transition hover:bg-[#1D4ED8]"
            >
              Approve
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/* ============================================================
 * DETAILS MODAL
 * ============================================================ */
const ReviewDetailsModal = ({
  review,
  onClose,
  onApprove,
  onReject,
  onExpandImage,
}) => {
  const isReupload = review.actionType === ACTION_TYPE.REUPLOAD;
  const isPending = review.status === STATUS.PENDING;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/50 p-4 backdrop-blur-[2px]">
      <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#E5EAF0] bg-white px-6 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[20px] font-bold tracking-[-0.3px] text-[#17213A]">
                Review Submission
              </h2>
              <StatusBadge status={review.status} />
            </div>
            <p className="mt-1 text-[13px] text-[#7C91AC]">
              {ENTITY_LABEL[review.entityType]} ·{" "}
              {ACTION_LABEL[review.actionType]}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#94A3B8] transition hover:bg-[#F1F5F9] hover:text-[#334155]"
            aria-label="Close"
          >
            <X size={21} strokeWidth={1.8} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-[#E3E9F0] bg-[#F8FAFC] p-5 sm:grid-cols-2">
            <MetaRow label="Hostel" value={review.hostelName} />
            <MetaRow label="Owner" value={review.ownerName} />
            <MetaRow
              label="Type"
              value={ENTITY_LABEL[review.entityType]}
            />
            <MetaRow label="Name" value={review.itemName} />
            <MetaRow
              label="Action"
              value={ACTION_LABEL[review.actionType]}
            />
            <MetaRow
              label="Submitted"
              value={formatFullDate(review.submittedAt)}
            />
          </div>

          <div>
            <h3 className="mb-4 text-[15px] font-semibold text-[#26344D]">
              {isReupload ? "Re-uploaded Image" : "New Image"}
            </h3>

            <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-[#BBF7D0] bg-[#F0FDF4]">
              <ImagePreview
                src={review.newImageUrl}
                label="Re-uploaded image unavailable"
                onExpand={onExpandImage}
                className="min-h-[180px] max-h-[420px]"
              />
            </div>
          </div>

          {review.previousRejectionReason && (
            <div className="rounded-xl border border-[#FFD5DC] bg-[#FFF7F8] p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.7px] text-[#E11D48]">
                Previous Rejection Reason
              </p>
              <p className="mt-2 text-[13px] leading-6 text-[#9F1239]">
                {review.previousRejectionReason}
              </p>
            </div>
          )}
        </div>

        {isPending && (
          <div className="sticky bottom-0 flex flex-col gap-3 border-t border-[#E5EAF0] bg-white px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onReject}
              className="rounded-lg border border-[#F5B8C3] bg-white px-6 py-2.5 text-[13px] font-semibold text-[#E11D48] transition hover:bg-[#FFF4F5]"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={onApprove}
              className="rounded-lg bg-[#2563EB] px-6 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_10px_rgba(37,99,235,0.16)] transition hover:bg-[#1D4ED8]"
            >
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const MetaRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-[#8A9DB6]">
        {label}
      </p>
      <p className="mt-1 text-[13px] font-semibold text-[#26344D]">{value}</p>
    </div>
  );
};

export default PendingChangesReview;