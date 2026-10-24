import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  Calendar,
  RefreshCw,
  AlertTriangle,
  Flag,
  UserPlus,
  FileCheck,
  Download,
  Activity,
  ChevronDown,
  Building,
  Menu,
  MessageSquareWarning,
  Gem,
  CheckCircle2,
  XCircle,
  Loader2,
  MapPin,
  Eye,
  ArrowUpRight,
  AlertCircle,
  RotateCw,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
).replace(/\/$/, "");

const REFRESH_INTERVAL_MS = 5000;

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("jwtToken") ||
    localStorage.getItem("jwt");

  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const apiUrl = (path) => `${API_BASE_URL}${path}`;

const unwrapArray = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
};

const normalizeStatus = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

const titleCase = (value) => {
  if (!value) return "—";
  return String(value)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (value, withTime = false) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime
      ? { hour: "2-digit", minute: "2-digit" }
      : {}),
  }).format(date);
};

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value || 0));

const percentage = (current, previous) => {
  const c = Number(current || 0);
  const p = Number(previous || 0);
  if (p === 0) return c === 0 ? 0 : 100;
  return Math.round(((c - p) / p) * 100);
};

const isWithinDays = (value, days) => {
  if (!value) return false;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return false;
  const now = Date.now();
  return time >= now - days * 24 * 60 * 60 * 1000 && time <= now;
};

const isPendingHostelStatus = (status) => {
  const normalized = normalizeStatus(status);
  return [
    "PENDING",
    "IN_REVIEW",
    "PENDING_REVIEW",
    "PENDING_ADMIN_REUPLOAD_REVIEW",
    "FLAGGED",
  ].includes(normalized);
};

const isOpenIssueStatus = (status) =>
  ["OPEN", "OWNER_REVIEW", "OWNER_RESPONDED", "ADMIN_REVIEW"].includes(
    normalizeStatus(status)
  );

const extractPhotoLists = (detail) => {
  const photos = [];

  const amenities = Array.isArray(detail?.amenities) ? detail.amenities : [];
  amenities.forEach((amenity) => {
    const amenityPhotos = Array.isArray(amenity?.photos)
      ? amenity.photos
      : [];
    amenityPhotos.forEach((photo) => {
      photos.push({
        ...photo,
        entityType: "AMENITY",
        entityName:
          amenity?.amenityName || amenity?.name || "Amenity",
      });
    });
  });

  const rooms = Array.isArray(detail?.roomsPricing)
    ? detail.roomsPricing
    : Array.isArray(detail?.rooms)
      ? detail.rooms
      : [];

  rooms.forEach((room) => {
    const roomPhotos = Array.isArray(room?.photos) ? room.photos : [];
    roomPhotos.forEach((photo) => {
      photos.push({
        ...photo,
        entityType: "ROOM",
        entityName: room?.roomType || room?.name || "Room",
      });
    });
  });

  return photos;
};

const extractHostelPhotos = (detail) => {
  const possible = [
    ...(Array.isArray(detail?.hostelPhotos) ? detail.hostelPhotos : []),
    ...(Array.isArray(detail?.photos) ? detail.photos : []),
  ];
  return possible;
};

const getPendingPhotoCount = (detail) => {
  const photos = [
    ...extractPhotoLists(detail),
    ...extractHostelPhotos(detail).map((photo) => ({
      ...photo,
      entityType: "HOSTEL_PHOTO",
    })),
  ];

  return photos.filter((photo) =>
    ["PENDING", "PENDING_REVIEW", "SUBMITTED"].includes(
      normalizeStatus(photo?.verificationStatus || photo?.status)
    )
  ).length;
};

const getRejectedPhotoCount = (detail) => {
  const photos = [
    ...extractPhotoLists(detail),
    ...extractHostelPhotos(detail).map((photo) => ({
      ...photo,
      entityType: "HOSTEL_PHOTO",
    })),
  ];

  return photos.filter((photo) =>
    ["REJECTED", "DECLINED"].includes(
      normalizeStatus(photo?.verificationStatus || photo?.status)
    )
  ).length;
};

const getRecentIssueActivity = (issues) =>
  issues.map((issue) => ({
    id: `issue-${issue?.id}`,
    kind: "issue",
    title: issue?.subject || issue?.category || "User issue",
    subtitle: issue?.hostelName || "Hostel issue",
    status: normalizeStatus(issue?.status),
    date: issue?.createdAt || issue?.updatedAt,
  }));

const getRecentHostelActivity = (hostels) =>
  hostels.map((hostel) => ({
    id: `hostel-${hostel?.hostelId}`,
    kind: "hostel",
    title: hostel?.hostelName || "Hostel submission",
    subtitle:
      hostel?.ownerName || hostel?.city || "New hostel submission",
    status: normalizeStatus(hostel?.approvalStatus),
    date: hostel?.submittedAt,
  }));

const getRecentReviewActivity = (reviews) =>
  reviews.map((review) => ({
    id: `review-${review?.id}`,
    kind: "review",
    title:
      review?.amenityName ||
      review?.itemName ||
      review?.photoTitle ||
      "Re-upload review",
    subtitle:
      review?.hostelName ||
      review?.ownerName ||
      "Pending admin review",
    status: normalizeStatus(review?.status || "PENDING"),
    date:
      review?.submittedAt ||
      review?.createdAt ||
      review?.uploadedAt,
  }));

const normalizeAmenityReview = (request, index) => {
  const amenity = request?.amenity || {};
  const photo = request?.photo || {};
  const hostel = request?.hostel || {};

  return {
    ...request,
    id: request?.id ?? request?.requestId ?? `amenity-${index}`,
    hostelId:
      request?.hostelId ?? hostel?.hostelId ?? hostel?.id ?? null,
    hostelName:
      request?.hostelName ??
      hostel?.hostelName ??
      hostel?.name ??
      hostel?.basicInfo?.hostelName ??
      "",
    ownerName:
      request?.ownerName ??
      request?.owner?.fullName ??
      request?.owner?.name ??
      hostel?.ownerName ??
      hostel?.owner?.fullName ??
      hostel?.owner?.name ??
      "",
    amenityName:
      request?.amenityName ??
      amenity?.amenityName ??
      amenity?.name ??
      "",
    status:
      request?.status ??
      request?.requestStatus ??
      photo?.verificationStatus ??
      "PENDING",
    submittedAt:
      request?.submittedAt ??
      request?.createdAt ??
      photo?.uploadedAt ??
      null,
  };
};

const getStatusTone = (status) => {
  const normalized = normalizeStatus(status);

  if (["APPROVED", "RESOLVED", "VERIFIED"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }

  if (["REJECTED", "DECLINED", "CLOSED"].includes(normalized)) {
    return "bg-rose-50 text-rose-700 border-rose-100";
  }

  if (["FLAGGED", "CRITICAL", "HIGH"].includes(normalized)) {
    return "bg-amber-50 text-amber-700 border-amber-100";
  }

  return "bg-blue-50 text-blue-700 border-blue-100";
};

const StatCard = ({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  value,
  change,
  btnText,
  btnBorder,
  onClick,
  loading,
}) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
    <div className="flex items-center gap-3">
      <div className={`p-2.5 rounded-xl ${iconBg} ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-sm font-semibold text-slate-700">{title}</span>
    </div>

    <div>
      <div className="flex items-center gap-2">
        <h4 className="text-3xl font-bold text-slate-900 leading-none tracking-tight">
          {loading ? "…" : formatNumber(value)}
        </h4>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
      </div>
      <p
        className={`text-xs mt-2.5 font-medium ${
          change > 0
            ? "text-emerald-600"
            : change < 0
              ? "text-rose-500"
              : "text-slate-400"
        }`}
      >
        {change > 0 ? "+" : ""}
        {change}% vs previous period
      </p>
    </div>

    <button
      type="button"
      onClick={onClick}
      className={`w-full py-2 border ${btnBorder} rounded-xl text-sm font-semibold transition hover:-translate-y-[1px]`}
    >
      {btnText}
    </button>
  </div>
);

const QuickActionCard = ({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="text-left p-4 border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm cursor-pointer transition flex flex-col justify-between space-y-3.5 bg-white"
  >
    <div className={`p-2.5 rounded-xl w-fit ${iconBg} ${iconColor}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="text-xs text-slate-400 mt-1 leading-tight">{subtitle}</p>
    </div>
  </button>
);

const NavItem = ({ icon: Icon, label, onClick, active, sidebarOpen }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
      active
        ? "bg-blue-600 text-white shadow-sm"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    } ${!sidebarOpen ? "justify-center" : ""}`}
    title={!sidebarOpen ? label : undefined}
  >
    <Icon
      className={`w-5 h-5 shrink-0 ${
        active ? "text-white" : "text-slate-500"
      }`}
    />
    {sidebarOpen && <span>{label}</span>}
  </button>
);

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [hostels, setHostels] = useState([]);
  const [issues, setIssues] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [hostelDetails, setHostelDetails] = useState([]);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState(7);
  const [dateOpen, setDateOpen] = useState(false);
  const [refreshingDetails, setRefreshingDetails] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const refreshRef = useRef(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();

  const getHostelStatusPath = useCallback(
    (hostel) => {
      const hostelId = hostel?.hostelId ?? hostel?.id;
      if (!hostelId) return "/admin/hostel-management";
      return `/admin/pending-approvals/${hostelId}`;
    },
    []
  );

  const loadHostels = useCallback(async () => {
    const response = await fetch(apiUrl("/api/admin/hostels"), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Unable to load hostels (${response.status}).`);
    }

    const data = await response.json();
    return unwrapArray(data, ["data", "hostels", "content"]);
  }, []);

  const loadIssues = useCallback(async () => {
    const response = await fetch(apiUrl("/api/admin/issues"), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Unable to load issues (${response.status}).`);
    }

    const data = await response.json();
    return unwrapArray(data, ["data", "issues", "content"]);
  }, []);

  const loadReviews = useCallback(async () => {
    const response = await fetch(
      apiUrl("/api/admin/amenity-change-requests/pending"),
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const list = unwrapArray(data, [
        "data",
        "requests",
        "pendingRequests",
      ]);
      return list.map(normalizeAmenityReview);
    }

    const fallback = await fetch(apiUrl("/api/admin/re-upload-reviews"), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!fallback.ok) {
      throw new Error(
        `Unable to load review queue (${fallback.status}).`
      );
    }

    const fallbackData = await fallback.json();
    return unwrapArray(fallbackData, [
      "data",
      "requests",
      "pendingRequests",
    ]).map(normalizeAmenityReview);
  }, []);

  const loadDetails = useCallback(async (hostelList) => {
    if (!Array.isArray(hostelList) || hostelList.length === 0) return [];

    setRefreshingDetails(true);
    try {
      const results = await Promise.all(
        hostelList.map(async (hostel) => {
          const hostelId = hostel?.hostelId ?? hostel?.id;
          if (!hostelId) return null;

          try {
            const [detailResponse, photosResponse] = await Promise.all([
              fetch(apiUrl(`/api/admin/hostels/${hostelId}`), {
                method: "GET",
                headers: getAuthHeaders(),
              }),
              fetch(apiUrl(`/api/admin/hostels/${hostelId}/photos`), {
                method: "GET",
                headers: getAuthHeaders(),
              }),
            ]);

            if (!detailResponse.ok) return null;

            const detail = await detailResponse.json();
            let hostelPhotos = [];

            if (photosResponse.ok) {
              const photoPayload = await photosResponse.json();
              hostelPhotos = unwrapArray(photoPayload, [
                "data",
                "photos",
                "content",
              ]);
            }

            return {
              ...detail,
              hostelPhotos,
            };
          } catch (detailError) {
            console.warn(
              `Failed to load hostel ${hostelId} details:`,
              detailError
            );
            return null;
          }
        })
      );

      return results.filter(Boolean);
    } finally {
      setRefreshingDetails(false);
    }
  }, []);

  const loadDashboardData = useCallback(
    async ({ silent = false } = {}) => {
      if (refreshRef.current) return;
      refreshRef.current = true;

      try {
        if (silent) setRefreshing(true);
        else setLoading(true);

        setError("");

        const [hostelResult, issueResult, reviewResult] = await Promise.allSettled([
          loadHostels(),
          loadIssues(),
          loadReviews(),
        ]);

        const errors = [];

        const nextHostels =
          hostelResult.status === "fulfilled" ? hostelResult.value : [];
        const nextIssues =
          issueResult.status === "fulfilled" ? issueResult.value : [];
        const nextReviews =
          reviewResult.status === "fulfilled" ? reviewResult.value : [];

        if (hostelResult.status === "rejected") errors.push("hostels");
        if (issueResult.status === "rejected") errors.push("issues");
        if (reviewResult.status === "rejected") errors.push("reviews");

        setHostels(nextHostels);
        setIssues(nextIssues);
        setReviews(nextReviews);

        const detailResult = await loadDetails(nextHostels);
        setHostelDetails(detailResult);

        if (errors.length > 0) {
          setError(`Some dashboard data could not be loaded: ${errors.join(", ")}.`);
        }
      } catch (err) {
        console.error("Admin dashboard refresh failed:", err);
        if (!silent) {
          setError(
            err?.message ||
              "Unable to load the Admin Dashboard. Please try again."
          );
        }
      } finally {
        refreshRef.current = false;
        if (silent) setRefreshing(false);
        else setLoading(false);
      }
    },
    [loadDetails, loadHostels, loadIssues, loadReviews]
  );

  useEffect(() => {
    loadDashboardData({ silent: false });

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadDashboardData({ silent: true });
      }
    }, REFRESH_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadDashboardData({ silent: true });
      }
    };

    const handleFocus = () => loadDashboardData({ silent: true });

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadDashboardData]);

  const filteredHostels = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return hostels;

    return hostels.filter((hostel) =>
      [
        hostel?.hostelName,
        hostel?.ownerName,
        hostel?.ownerEmail,
        hostel?.city,
        hostel?.locality,
        hostel?.hostelType,
        hostel?.approvalStatus,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [hostels, search]);

  const stats = useMemo(() => {
    const pendingHostels = hostels.filter((hostel) =>
      isPendingHostelStatus(hostel?.approvalStatus)
    );

    const openIssues = issues.filter((issue) =>
      isOpenIssueStatus(issue?.status)
    );

    const flaggedHostels = hostels.filter(
      (hostel) => normalizeStatus(hostel?.approvalStatus) === "FLAGGED"
    );

    const ownerVerificationPending = hostelDetails.filter((detail) => {
      const status = normalizeStatus(
        detail?.owner?.emailVerificationStatus ||
          detail?.emailVerificationStatus
      );
      return status && status !== "VERIFIED";
    });

    const pendingPhotoReviews = hostelDetails.reduce(
      (sum, detail) => sum + getPendingPhotoCount(detail),
      0
    );

    const pendingReviews =
      pendingHostels.length + reviews.length + pendingPhotoReviews;

    const previousStart =
      Date.now() - (period * 2) * 24 * 60 * 60 * 1000;
    const currentStart = Date.now() - period * 24 * 60 * 60 * 1000;

    const newHostelsCurrent = hostels.filter((hostel) => {
      const time = new Date(hostel?.submittedAt || "").getTime();
      return time >= currentStart && time <= Date.now();
    }).length;

    const newHostelsPrevious = hostels.filter((hostel) => {
      const time = new Date(hostel?.submittedAt || "").getTime();
      return time >= previousStart && time < currentStart;
    }).length;

    const currentOwnerKeys = new Set(
      hostels
        .filter((hostel) => {
          const time = new Date(hostel?.submittedAt || "").getTime();
          return time >= currentStart && time <= Date.now();
        })
        .map((hostel) => hostel?.ownerEmail || hostel?.ownerName)
        .filter(Boolean)
    );

    const previousOwnerKeys = new Set(
      hostels
        .filter((hostel) => {
          const time = new Date(hostel?.submittedAt || "").getTime();
          return time >= previousStart && time < currentStart;
        })
        .map((hostel) => hostel?.ownerEmail || hostel?.ownerName)
        .filter(Boolean)
    );

    return {
      pendingHostels,
      openIssues,
      flaggedHostels,
      ownerVerificationPending,
      pendingPhotoReviews,
      pendingReviews,
      totalHostels: hostels.length,
      newHostelsCurrent,
      newHostelsPrevious,
      newOwnersCurrent: currentOwnerKeys.size,
      newOwnersPrevious: previousOwnerKeys.size,
    };
  }, [hostels, hostelDetails, issues, period, reviews]);

  const statusBreakdown = useMemo(() => {
    const counts = {
      APPROVED: 0,
      IN_REVIEW: 0,
      PENDING_INFO: 0,
      REJECTED: 0,
    };

    hostels.forEach((hostel) => {
      const status = normalizeStatus(hostel?.approvalStatus);
      if (status === "APPROVED") counts.APPROVED += 1;
      else if (["REJECTED", "DECLINED"].includes(status)) counts.REJECTED += 1;
      else if (["DRAFT", "PENDING_INFO"].includes(status)) counts.PENDING_INFO += 1;
      else counts.IN_REVIEW += 1;
    });

    const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
    return Object.entries(counts).map(([key, value]) => ({
      key,
      value,
      percentage: total ? Math.round((value / total) * 100) : 0,
    }));
  }, [hostels]);

  const activity = useMemo(() => {
    const items = [
      ...getRecentIssueActivity(issues),
      ...getRecentHostelActivity(hostels),
      ...getRecentReviewActivity(reviews),
    ];

    const query = search.trim().toLowerCase();
    const filtered = query
      ? items.filter((item) =>
          [item?.title, item?.subtitle, item?.status]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query))
        )
      : items;

    return filtered
      .sort((a, b) => {
        const at = new Date(a?.date || 0).getTime();
        const bt = new Date(b?.date || 0).getTime();
        return bt - at;
      })
      .slice(0, 4);
  }, [hostels, issues, reviews, search]);

  const recentSubmissions = useMemo(() => {
    return [...filteredHostels]
      .sort(
        (a, b) =>
          new Date(b?.submittedAt || 0).getTime() -
          new Date(a?.submittedAt || 0).getTime()
      )
      .slice(0, 6);
  }, [filteredHostels]);

  const overviewBars = useMemo(() => {
    const result = [];
    for (let index = period - 1; index >= 0; index -= 1) {
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(dayStart.getDate() - index);
      const nextDay = new Date(dayStart);
      nextDay.setDate(nextDay.getDate() + 1);

      const hostelCount = hostels.filter((hostel) => {
        const time = new Date(hostel?.submittedAt || "").getTime();
        return time >= dayStart.getTime() && time < nextDay.getTime();
      }).length;

      const issueCount = issues.filter((issue) => {
        const time = new Date(issue?.createdAt || "").getTime();
        return time >= dayStart.getTime() && time < nextDay.getTime();
      }).length;

      result.push({
        label: dayStart.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        hostelCount,
        issueCount,
      });
    }
    return result;
  }, [hostels, issues, period]);

  const maxOverviewValue = Math.max(
    1,
    ...overviewBars.map((item) => Math.max(item.hostelCount, item.issueCount))
  );

  const approvedIn30Days = useMemo(
    () =>
      hostels.filter(
        (hostel) =>
          normalizeStatus(hostel?.approvalStatus) === "APPROVED" &&
          isWithinDays(hostel?.submittedAt, 30)
      ).length,
    [hostels]
  );

  const executeRefresh = () => loadDashboardData({ silent: true });

  const handleLogout = () => {
    [
      "token",
      "jwtToken",
      "accessToken",
      "authToken",
      "jwt",
      "user",
      "userData",
      "role",
      "admin",
      "hostelId",
    ].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    setProfileOpen(false);
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased overflow-hidden">
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
            <NavItem
              icon={LayoutDashboard}
              label="Dashboard"
              active
              sidebarOpen={sidebarOpen}
              onClick={() => navigate("/admin/dashboard")}
            />

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
                  onClick={() => navigate("/admin/hostel-management")}
                />
                <NavItem
                  icon={Clock}
                  label="Pending Approvals"
                  sidebarOpen={sidebarOpen}
                  onClick={() =>
                    navigate(
                      stats.pendingHostels[0]
                        ? getHostelStatusPath(stats.pendingHostels[0])
                        : "/admin/hostel-management"
                    )
                  }
                />
                <NavItem
                  icon={RefreshCw}
                  label="Reupload Review"
                  sidebarOpen={sidebarOpen}
                  onClick={() => navigate("/admin/reupload")}
                />
                <NavItem
                  icon={MessageSquareWarning}
                  label="User Issues"
                  sidebarOpen={sidebarOpen}
                  onClick={() => navigate("/admin/user-issues")}
                />
                <NavItem
                  icon={ShieldCheck}
                  label="Owner Verification"
                  sidebarOpen={sidebarOpen}
                  onClick={() => navigate("/admin/owner-verification")}
                />
              </nav>
            </div>

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
                  onClick={() => navigate("/admin/analytics")}
                />
                <NavItem
                  icon={Gem}
                  label="Subscription"
                  sidebarOpen={sidebarOpen}
                  onClick={() => navigate("/admin/subscription")}
                />
                <NavItem
                  icon={FileText}
                  label="Reports"
                  sidebarOpen={sidebarOpen}
                  onClick={() => navigate("/admin/reports")}
                />
              </nav>
            </div>

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
                  onClick={() => navigate("/admin/users")}
                />
                <NavItem
                  icon={Settings}
                  label="System Settings"
                  sidebarOpen={sidebarOpen}
                  onClick={() => navigate("/admin/settings")}
                />
                <NavItem
                  icon={History}
                  label="Audit Logs"
                  sidebarOpen={sidebarOpen}
                  onClick={() => navigate("/admin/audit-logs")}
                />
              </nav>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-slate-100 space-y-2">
          {sidebarOpen && (
            <button
              type="button"
              onClick={() => navigate("/admin/reports")}
              className="w-full py-2.5 px-3 border border-blue-200 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2 mb-2"
            >
              <FileText className="w-4 h-4" />
              Generate Reports
            </button>
          )}
          <NavItem
            icon={HelpCircle}
            label="Help Center"
            sidebarOpen={sidebarOpen}
            onClick={() => navigate("/help")}
          />
          <NavItem
            icon={LogOut}
            label="Logout"
            sidebarOpen={sidebarOpen}
            onClick={handleLogout}
          />
        </div>
      </aside>

      <div
        className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button
              type="button"
              onClick={() => setSidebarOpen((previous) => !previous)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition"
              title="Toggle sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="relative w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search hostel, owner, location..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-12 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600"
              title={`Dashboard auto-refreshes every ${REFRESH_INTERVAL_MS / 1000} seconds`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  refreshing ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                }`}
              />
              {refreshing ? "Updating" : "Live"}
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/user-issues")}
              className="relative cursor-pointer p-2 hover:bg-slate-100 rounded-full text-slate-600 transition"
              title="Open user issues"
            >
              <Bell className="w-6 h-6" />
              {stats.openIssues.length > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-2.5 h-2.5 px-1 bg-rose-500 rounded-full text-[7px] text-white flex items-center justify-center" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setDateOpen((previous) => !previous)}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition"
              title="Change date window"
            >
              <Calendar className="w-6 h-6" />
            </button>

            <div className="h-6 w-px bg-slate-200" />

            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((previous) => !previous)}
                className="flex items-center gap-3 pl-2 rounded-xl px-2 py-1.5 hover:bg-slate-50 transition"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                title="Open admin profile menu"
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  A
                </div>
                <div className="text-left hidden md:block leading-tight">
                  <p className="text-sm font-semibold text-slate-800">Admin User</p>
                  <p className="text-xs text-slate-400">Super Admin</p>
                </div>
                <ChevronDown
                  className={`hidden md:block w-4 h-4 text-slate-400 transition-transform ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-900/10 overflow-hidden z-50"
                  role="menu"
                >
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800">
                      Admin User
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Super Admin
                    </p>
                  </div>

                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Welcome back, Admin!
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Here's what's happening on your platform today.
              </p>
            </div>

            <div className="flex items-center gap-2.5 relative">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDateOpen((previous) => !previous)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
                >
                  <span>
                    Last {period} days · {formatDate(new Date())}
                  </span>
                  <Calendar className="w-4 h-4 text-slate-400" />
                </button>
                {dateOpen && (
                  <div className="absolute right-0 mt-2 z-50 w-40 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5">
                    {[7, 14, 30].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => {
                          setPeriod(days);
                          setDateOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                          period === days
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        Last {days} days
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={executeRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition disabled:opacity-60"
              >
                {refreshing ? "Updating" : "Refresh"}
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-xs font-semibold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard
              icon={FileText}
              iconColor="text-blue-500"
              iconBg="bg-blue-50"
              title="Pending Reviews"
              value={stats.pendingReviews}
              change={percentage(stats.pendingReviews, Math.max(1, reviews.length))}
              btnText="Review Now"
              btnBorder="border-blue-200 text-blue-600 hover:bg-blue-50"
              loading={loading}
              onClick={() => navigate("/admin/reupload")}
            />
            <StatCard
              icon={AlertTriangle}
              iconColor="text-amber-500"
              iconBg="bg-amber-50"
              title="Open Issues"
              value={stats.openIssues.length}
              change={percentage(stats.openIssues.length, Math.max(1, issues.length))}
              btnText="Resolve Now"
              btnBorder="border-amber-200 text-amber-600 hover:bg-amber-50"
              loading={loading}
              onClick={() => navigate("/admin/user-issues")}
            />
            <StatCard
              icon={Flag}
              iconColor="text-rose-500"
              iconBg="bg-rose-50"
              title="Flagged Hostels"
              value={stats.flaggedHostels.length}
              change={0}
              btnText="Investigate"
              btnBorder="border-rose-200 text-rose-600 hover:bg-rose-50"
              loading={loading}
              onClick={() => navigate("/admin/hostel-management")}
            />
            <StatCard
              icon={ShieldCheck}
              iconColor="text-emerald-500"
              iconBg="bg-emerald-50"
              title="Owner Verifications"
              value={stats.ownerVerificationPending.length}
              change={0}
              btnText="Verify Now"
              btnBorder="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              loading={loading}
              onClick={() => navigate("/admin/owner-verification")}
            />
            <StatCard
              icon={Building2}
              iconColor="text-indigo-500"
              iconBg="bg-indigo-50"
              title="Total Hostels"
              value={stats.totalHostels}
              change={percentage(stats.newHostelsCurrent, Math.max(1, stats.newHostelsPrevious))}
              btnText="View All"
              btnBorder="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
              loading={loading}
              onClick={() => navigate("/admin/hostel-management")}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 text-base">Platform Overview</h3>
                <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600">
                  {period} Days
                </span>
              </div>

              <div className="h-44 w-full flex items-end gap-1.5 border-b border-dashed border-slate-200 px-1 pb-1 overflow-hidden">
                {overviewBars.map((item, index) => {
                  const hostelHeight = Math.max(4, (item.hostelCount / maxOverviewValue) * 100);
                  const issueHeight = Math.max(3, (item.issueCount / maxOverviewValue) * 100);
                  return (
                    <div key={`${item.label}-${index}`} className="flex-1 h-full flex items-end justify-center gap-0.5 group min-w-[10px]">
                      <div
                        className="w-[42%] bg-blue-500 rounded-t-sm transition-all"
                        style={{ height: `${hostelHeight}%` }}
                        title={`${item.hostelCount} hostel submissions on ${item.label}`}
                      />
                      <div
                        className="w-[42%] bg-amber-400 rounded-t-sm transition-all"
                        style={{ height: `${issueHeight}%` }}
                        title={`${item.issueCount} issues on ${item.label}`}
                      />
                    </div>
                  );
                })}
                {overviewBars.length === 0 && (
                  <div className="flex-1 h-full flex items-center justify-center text-sm text-slate-400">
                    No data available yet.
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 mt-3 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> New hostels
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Issues
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 mt-2">
                <div>
                  <p className="text-xs text-slate-400 font-medium">New Hostels</p>
                  <p className="text-lg font-bold text-slate-800 mt-0.5">
                    {formatNumber(stats.newHostelsCurrent)}
                  </p>
                  <span className={`text-xs font-medium ${percentage(stats.newHostelsCurrent, stats.newHostelsPrevious) >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                    {percentage(stats.newHostelsCurrent, stats.newHostelsPrevious) > 0 ? "+" : ""}
                    {percentage(stats.newHostelsCurrent, stats.newHostelsPrevious)}%
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">New Owners</p>
                  <p className="text-lg font-bold text-slate-800 mt-0.5">
                    {formatNumber(stats.newOwnersCurrent)}
                  </p>
                  <span className={`text-xs font-medium ${percentage(stats.newOwnersCurrent, stats.newOwnersPrevious) >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                    {percentage(stats.newOwnersCurrent, stats.newOwnersPrevious) > 0 ? "+" : ""}
                    {percentage(stats.newOwnersCurrent, stats.newOwnersPrevious)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 text-base">Real-time Activity</h3>
                <button
                  type="button"
                  onClick={() => navigate("/admin/user-issues")}
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {activity.length > 0 ? (
                  activity.map((item) => (
                    <div key={item.id} className="flex items-start gap-3.5">
                      <div
                        className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                          item.kind === "issue"
                            ? "bg-amber-50 text-amber-600"
                            : item.kind === "review"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {item.kind === "issue" ? (
                          <MessageSquareWarning className="w-4 h-4" />
                        ) : item.kind === "review" ? (
                          <RotateCw className="w-4 h-4" />
                        ) : (
                          <Building2 className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{item.title}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getStatusTone(item.status)}`}>
                            {titleCase(item.status)}
                          </span>
                          <span className="text-[10px] text-slate-400">{formatDate(item.date, true)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-sm text-slate-400">
                    No recent activity to display.
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-800 text-base">Status Breakdown</h3>
                <button
                  type="button"
                  onClick={() => navigate("/admin/hostel-management")}
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  View Report
                </button>
              </div>

              <div className="h-44 flex items-center justify-center gap-4">
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center"
                  style={{
                    background: `conic-gradient(#10b981 ${
                      statusBreakdown.find((item) => item.key === "APPROVED")?.percentage || 0
                    }%, #f59e0b 0 70%, #3b82f6 0 85%, #f43f5e 0 100%)`,
                  }}
                >
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center flex-col">
                    <span className="text-xl font-bold text-slate-800">{hostels.length}</span>
                    <span className="text-[10px] text-slate-400">hostels</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {statusBreakdown.map((item, index) => {
                    const colorClass = [
                      "bg-emerald-500",
                      "bg-amber-500",
                      "bg-blue-500",
                      "bg-rose-500",
                    ][index];
                    const label = {
                      APPROVED: "Approved",
                      IN_REVIEW: "In Review",
                      PENDING_INFO: "Pending Info",
                      REJECTED: "Rejected",
                    }[item.key];
                    return (
                      <div key={item.key} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-slate-600 font-medium">
                          <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
                          {label}
                        </span>
                        <span className="font-semibold text-slate-800">{item.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                <span className="text-sm text-slate-400 font-medium flex items-center gap-1.5">
                  <Activity className="w-4 h-4" /> {approvedIn30Days} approved in 30 days
                </span>
                <button
                  type="button"
                  onClick={() => navigate("/admin/hostel-management")}
                  className="px-3.5 py-2 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl text-sm font-semibold transition"
                >
                  View All Hostels
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800 text-base">Recent Submissions</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {search ? `${recentSubmissions.length} search results` : "Latest hostel applications from the backend"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/admin/hostel-management")}
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="w-full overflow-x-auto">
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-6 text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-100">
                    <span className="col-span-1">HOSTEL DETAILS</span>
                    <span className="col-span-1">LOCATION</span>
                    <span className="col-span-1">OWNER</span>
                    <span className="col-span-1">STATUS</span>
                    <span className="col-span-1">SUBMITTED</span>
                    <span className="col-span-1 text-right">ACTIONS</span>
                  </div>

                  {recentSubmissions.length > 0 ? (
                    recentSubmissions.map((hostel) => {
                      const hostelId = hostel?.hostelId ?? hostel?.id;
                      return (
                        <div
                          key={hostelId}
                          className="grid grid-cols-6 items-center gap-2 py-3 border-b border-slate-50 last:border-b-0"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {hostel?.hostelName || "Unnamed Hostel"}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {hostel?.hostelType || "Hostel"}
                            </p>
                          </div>
                          <p className="text-xs text-slate-500 truncate">
                            {hostel?.locality || hostel?.city || "—"}
                          </p>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-700 truncate">{hostel?.ownerName || "—"}</p>
                            <p className="text-[10px] text-slate-400 truncate">{hostel?.ownerEmail || "—"}</p>
                          </div>
                          <div>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-semibold ${getStatusTone(hostel?.approvalStatus)}`}>
                              {normalizeStatus(hostel?.approvalStatus) === "APPROVED" ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : normalizeStatus(hostel?.approvalStatus) === "REJECTED" ? (
                                <XCircle className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                              {titleCase(hostel?.approvalStatus)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{formatDate(hostel?.submittedAt)}</p>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                hostelId
                                  ? navigate(`/admin/hostel-management/${hostelId}`)
                                  : navigate("/admin/hostel-management")
                              }
                              className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {normalizeStatus(hostel?.approvalStatus) !== "APPROVED" && (
                              <button
                                type="button"
                                onClick={() => navigate(getHostelStatusPath(hostel))}
                                className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                                title="Open pending approval"
                              >
                                <ArrowUpRight className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        {loading ? "Loading submissions…" : "No submissions found."}
                      </p>
                      <span className="text-xs text-slate-400 mt-1">
                        {search
                          ? "Try another search term."
                          : "Submitted hostels will appear here."}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 text-base mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3.5">
                <QuickActionCard
                  icon={UserPlus}
                  iconBg="bg-blue-50"
                  iconColor="text-blue-500"
                  title="Add New Admin"
                  subtitle="Open admin/user management"
                  onClick={() => navigate("/admin/users")}
                />
                <QuickActionCard
                  icon={FileCheck}
                  iconBg="bg-emerald-50"
                  iconColor="text-emerald-500"
                  title="Bulk Verify Owners"
                  subtitle="Review owner verification queue"
                  onClick={() => navigate("/admin/owner-verification")}
                />
                <QuickActionCard
                  icon={Download}
                  iconBg="bg-amber-50"
                  iconColor="text-amber-500"
                  title="Export Data"
                  subtitle="Open reports and exports"
                  onClick={() => navigate("/admin/reports")}
                />
                <QuickActionCard
                  icon={Activity}
                  iconBg="bg-cyan-50"
                  iconColor="text-cyan-500"
                  title="System Health"
                  subtitle="Open system settings"
                  onClick={() => navigate("/admin/settings")}
                />
              </div>

              <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Live queue</p>
                    <p className="text-lg font-bold text-slate-800 mt-0.5">
                      {formatNumber(stats.pendingReviews + stats.openIssues.length)}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 border border-slate-200">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Pending reviews + open issues currently requiring admin attention.
                </p>
              </div>
            </div>
          </div>


          {refreshingDetails && (
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating detailed photo and verification metrics…
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
