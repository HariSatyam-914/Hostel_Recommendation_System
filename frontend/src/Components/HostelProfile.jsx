import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Menu,
  X,
  Bell,
  UserCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Pencil,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Images,
  BedDouble,
  MessageSquare,
  Star,
  BarChart3,
  Settings,
  LogOut,
  HelpCircle,
  ShieldCheck,
  Users,
  FileText,
  WalletCards,
  Clock3,
  Navigation,
  Map,
  Plus,
  Loader2,
  CircleDollarSign,
  DoorOpen,
  Wifi,
  Utensils,
  Phone,
} from "lucide-react";

const API_BASE_URL = "http://localhost:8080";

/* ============================================================
   TOAST SYSTEM
   ============================================================ */

const ToastContext = React.createContext(null);

const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const addToast = (message, type = "info", duration = 4000) => {
    const id = ++toastIdRef.current;

    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type,
      },
    ]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const toast = useMemo(
    () => ({
      success: (message, duration) =>
        addToast(message, "success", duration),
      error: (message, duration) =>
        addToast(message, "error", duration),
      warning: (message, duration) =>
        addToast(message, "warning", duration),
      info: (message, duration) =>
        addToast(message, "info", duration),
      remove: removeToast,
    }),
    []
  );

  const value = useMemo(
    () => ({
      toast,
    }),
    [toast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* TOAST CONTAINER */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toastItem) => (
          <ToastItem
            key={toastItem.id}
            toast={toastItem}
            onClose={() => removeToast(toastItem.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const { id, message, type } = toast;

  const typeConfig = {
    success: {
      bg: "bg-white",
      border: "border-emerald-200",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      textColor: "text-emerald-800",
      Icon: CheckCircle2,
      progressColor: "bg-emerald-500",
    },
    error: {
      bg: "bg-white",
      border: "border-red-200",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      textColor: "text-red-800",
      Icon: AlertTriangle,
      progressColor: "bg-red-500",
    },
    warning: {
      bg: "bg-white",
      border: "border-amber-200",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      textColor: "text-amber-800",
      Icon: AlertTriangle,
      progressColor: "bg-amber-500",
    },
    info: {
      bg: "bg-white",
      border: "border-blue-200",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      textColor: "text-blue-800",
      Icon: HelpCircle,
      progressColor: "bg-blue-500",
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const { Icon } = config;

  return (
    <div
      className={`
        pointer-events-auto
        min-w-[320px]
        max-w-[420px]
        rounded-xl
        border
        ${config.border}
        ${config.bg}
        shadow-lg
        shadow-slate-200/60
        overflow-hidden
        animate-[toastIn_0.3s_ease-out]
      `}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <div
          className={`
            w-8
            h-8
            rounded-full
            ${config.iconBg}
            flex
            items-center
            justify-center
            shrink-0
            mt-0.5
          `}
        >
          <Icon size={16} className={config.iconColor} />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`
              text-sm
              font-medium
              ${config.textColor}
              leading-5
            `}
          >
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="
            w-6
            h-6
            rounded-md
            flex
            items-center
            justify-center
            text-slate-400
            hover:text-slate-600
            hover:bg-slate-100
            transition
            shrink-0
          "
        >
          <X size={14} />
        </button>
      </div>

      <div className="h-0.5 w-full bg-slate-100">
        <div
          className={`
            h-full
            ${config.progressColor}
            animate-[toastProgress_4s_linear_forwards]
          `}
        />
      </div>
    </div>
  );
};

/* ============================================================
   HOSTEL PROFILE
   ============================================================ */

const HostelProfileContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [dashboardData, setDashboardData] = useState(null);
  const [photos, setPhotos] = useState([]);

  const [error, setError] = useState("");

  /* ==========================================================
     EDIT MODALS
     ========================================================== */

  const [editModal, setEditModal] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [basicInfoForm, setBasicInfoForm] = useState({
    hostelName: "",
    hostelType: "",
    phoneNumber: "",
    description: "",
  });

  const [rulesForm, setRulesForm] = useState({
    noSmoking: false,
    noAlcohol: false,
    noPets: false,
    visitorsAllowed: false,
    curfewEnabled: false,
    additionalRules: "",
  });

  const [depositForm, setDepositForm] = useState({
    refundPolicy: "",
  });

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

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

  /* ==========================================================
     FETCH DATA
     ========================================================== */

  const fetchHostelData = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const currentToken = localStorage.getItem("token");

      if (!currentToken) {
        throw new Error(
          "Authentication token is missing. Please log in again."
        );
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      };

      console.log("=================================");
      console.log("Loading Owner Hostel Profile");
      console.log("API:", `${API_BASE_URL}/api/owner/dashboard`);
      console.log("Token available:", Boolean(currentToken));
      console.log("=================================");

      const dashboardResponse = await fetch(
        `${API_BASE_URL}/api/owner/dashboard`,
        {
          method: "GET",
          headers,
        }
      );

      const responseText = await dashboardResponse.text();

      if (
        responseText
          .trim()
          .toLowerCase()
          .startsWith("<!doctype html") ||
        responseText.trim().toLowerCase().startsWith("<html")
      ) {
        console.error(
          "API returned HTML instead of JSON. Backend may be down or misconfigured."
        );

        throw new Error(
          `Backend API is not available. Please make sure the server is running at: ${API_BASE_URL}`
        );
      }

      let dashboard = null;

      try {
        dashboard = responseText ? JSON.parse(responseText) : null;
      } catch {
        dashboard = responseText;
      }

      console.log("Owner dashboard HTTP status:", dashboardResponse.status);
      console.log("Owner dashboard response:", dashboard);

      if (!dashboardResponse.ok) {
        let backendMessage = "";

        if (typeof dashboard === "string") {
          backendMessage = dashboard;
        } else if (dashboard?.message) {
          backendMessage = dashboard.message;
        } else if (dashboard?.error) {
          backendMessage = dashboard.error;
        } else if (dashboard?.detail) {
          backendMessage = dashboard.detail;
        }

        throw new Error(
          backendMessage ||
            `Unable to load hostel information (${dashboardResponse.status})`
        );
      }

      const normalizedDashboard =
        dashboard?.data && typeof dashboard.data === "object"
          ? dashboard.data
          : dashboard;

      if (!normalizedDashboard || typeof normalizedDashboard !== "object") {
        throw new Error(
          "The server returned an invalid owner dashboard response."
        );
      }

      console.log("Normalized owner dashboard:", normalizedDashboard);

      setDashboardData(normalizedDashboard);

      /* --------------------------------------------------------
         FIND HOSTEL ID
         -------------------------------------------------------- */

      const hostelId =
        normalizedDashboard?.hostel?.hostelId ??
        normalizedDashboard?.hostel?.id ??
        normalizedDashboard?.hostel?.hostel?.id ??
        normalizedDashboard?.hostelId ??
        normalizedDashboard?.id;

      console.log("Detected hostel ID:", hostelId);

      /* --------------------------------------------------------
         LOAD PHOTOS
         -------------------------------------------------------- */

      if (hostelId) {
        try {
          const photoResponse = await fetch(
            `${API_BASE_URL}/api/owner/hostels/${hostelId}/photos`,
            {
              method: "GET",
              headers,
            }
          );

          const photoText = await photoResponse.text();

          let photoData = null;

          try {
            photoData = photoText ? JSON.parse(photoText) : null;
          } catch {
            photoData = photoText;
          }

          console.log("Owner hostel photos HTTP status:", photoResponse.status);
          console.log("Owner hostel photos:", photoData);

          if (photoResponse.ok) {
            const loadedPhotos = Array.isArray(photoData)
              ? photoData
              : Array.isArray(photoData?.photos)
              ? photoData.photos
              : Array.isArray(photoData?.data)
              ? photoData.data
              : [];

            setPhotos(loadedPhotos);
          } else {
            console.warn("Unable to load hostel photos:", photoData);
            setPhotos([]);
          }
        } catch (photoError) {
          console.error("Failed to load hostel photos:", photoError);
          setPhotos([]);
        }
      } else {
        console.warn("No hostel ID found in owner dashboard response.");
        setPhotos([]);
      }
    } catch (err) {
      console.error("Failed to load hostel profile:", err);

      setError(
        err?.message || "Unable to load your hostel profile. Please try again."
      );

      setDashboardData(null);
      setPhotos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHostelData(true);
  }, []);

  /* ==========================================================
     BACKEND DATA
     ========================================================== */

  const owner = dashboardData?.owner || {};

  const hostel = dashboardData?.hostel || {};

  // Resolve the hostel ID from the loaded dashboard data so all edit handlers can use it.
  const hostelId =
    hostel?.hostelId ??
    hostel?.id ??
    dashboardData?.hostelId ??
    dashboardData?.id;

  const rooms = Array.isArray(dashboardData?.rooms)
    ? dashboardData.rooms
    : [];

  /*
   * IMPORTANT:
   *
   * Amenities can come from different backend DTO shapes.
   * We normalize all supported shapes here before rendering.
   */
  const amenities = useMemo(
    () =>
      normalizeAmenities(
        hostel?.amenities ??
          dashboardData?.amenities ??
          hostel?.amenityList ??
          dashboardData?.amenityList ??
          hostel?.hostelAmenities ??
          dashboardData?.hostelAmenities ??
          hostel?.amenityNames ??
          dashboardData?.amenityNames ??
          hostel?.amenityCodes ??
          dashboardData?.amenityCodes ??
          hostel?.amenityTypes ??
          dashboardData?.amenityTypes ??
          hostel?.amenityOptions ??
          dashboardData?.amenityOptions ??
          []
      ),
    [hostel, dashboardData]
  );

  console.log("Normalized amenities:", amenities);

  const rules = normalizeRules(
    hostel?.rules ??
      dashboardData?.rules ??
      hostel?.policies ??
      dashboardData?.policies ??
      []
  );

  const deposit = normalizeDeposit(
    hostel?.deposit ??
      dashboardData?.deposit ??
      hostel?.depositPolicy ??
      dashboardData?.depositPolicy ??
      hostel ??
      dashboardData
  );

  const approvalStatus = normalizeStatus(
    dashboardData?.approvalStatus ??
      hostel?.approvalStatus ??
      hostel?.status
  );

  /* ==========================================================
     BASIC INFORMATION
     ========================================================== */

  const hostelName = hostel?.name || hostel?.hostelName || "";

  const hostelType = hostel?.hostelType || hostel?.type || "";

  const gender =
    hostel?.gender ||
    hostel?.genderPreference ||
    hostel?.preferredGender ||
    "";

  const description = hostel?.description || "";

  const capacity =
    hostel?.capacity ??
    hostel?.totalCapacity ??
    hostel?.totalResidents ??
    "";

  /* ==========================================================
     LOCATION
     ========================================================== */

  const address = hostel?.address || hostel?.location?.address || "";

  const area = hostel?.area || hostel?.location?.area || "";

  const city = hostel?.city || hostel?.location?.city || "";

  const state = hostel?.state || hostel?.location?.state || "";

  const pincode =
    hostel?.pincode ||
    hostel?.postalCode ||
    hostel?.location?.pincode ||
    "";

  const landmark = hostel?.landmark || hostel?.location?.landmark || "";

  const latitude =
    hostel?.latitude ??
    hostel?.location?.latitude ??
    hostel?.coordinates?.latitude ??
    null;

  const longitude =
    hostel?.longitude ??
    hostel?.location?.longitude ??
    hostel?.coordinates?.longitude ??
    null;

  const formattedAddress = [address, area, city, state, pincode]
    .filter(Boolean)
    .join(", ");

  /* ==========================================================
     OWNER
     ========================================================== */

  const ownerName = owner?.name || owner?.fullName || "";

  const ownerEmail = owner?.email || "";

  const ownerPhone =
    hostel?.phoneNumber ||
    hostel?.phone ||
    owner?.phone ||
    owner?.mobile ||
    owner?.phoneNumber ||
    "";

  const emailVerified =
    owner?.emailVerified === true ||
    owner?.emailVerificationStatus === "VERIFIED";

  /* ==========================================================
     COVER PHOTO
     ========================================================== */

  const coverPhoto = useMemo(() => {
    if (!Array.isArray(photos)) {
      return null;
    }

    return (
      photos.find(
        (photo) => normalizeStatus(photo?.photoType) === "COVER"
      ) ||
      photos.find((photo) => photo?.isCover === true) ||
      null
    );
  }, [photos]);

  const coverImage = getImageUrl(
    coverPhoto?.fileUrl ?? coverPhoto?.photoUrl ?? coverPhoto?.url
  );

  /* ==========================================================
     LISTING COMPLETENESS
     ========================================================== */

  const listingChecks = useMemo(() => {
    return [
      {
        key: "basic",
        label: "Basic Information",
        complete:
          Boolean(hostelName) && Boolean(hostelType || description),
      },
      {
        key: "location",
        label: "Location & Directions",
        complete: Boolean(
          formattedAddress ||
            landmark ||
            (latitude !== null && longitude !== null)
        ),
      },
      {
        key: "amenities",
        label: "Amenities",
        complete: Array.isArray(amenities) && amenities.length > 0,
      },
      {
        key: "rooms",
        label: "Room Configurations",
        complete: Array.isArray(rooms) && rooms.length > 0,
      },
      {
        key: "photos",
        label: "Photos",
        complete: Boolean(coverImage) || photos.length > 0,
      },
      {
        key: "verification",
        label: "Owner Verification",
        complete: emailVerified,
      },
    ];
  }, [
    hostelName,
    hostelType,
    description,
    formattedAddress,
    landmark,
    latitude,
    longitude,
    amenities,
    rooms,
    coverImage,
    photos,
    emailVerified,
  ]);

  const completedChecks = listingChecks.filter((item) => item.complete).length;

  const listingPercentage =
    listingChecks.length > 0
      ? Math.round((completedChecks / listingChecks.length) * 100)
      : 0;

  /* ==========================================================
     APPROVAL
     ========================================================== */

  const isApproved = approvalStatus === "APPROVED";

  const reviewMessage = getApprovalMessage(approvalStatus);

  /* ==========================================================
     EDIT BASIC INFORMATION
     ========================================================== */

  const openBasicInfoEdit = () => {
    setBasicInfoForm({
      hostelName: hostel?.name || hostel?.hostelName || "",
      hostelType: hostel?.hostelType || hostel?.type || "",
      phoneNumber: hostel?.phoneNumber || hostel?.phone || "",
      description: hostel?.description || "",
    });

    setEditModal("basic");
  };

  const saveBasicInformation = async () => {
    /*
     * Resolve the hostel ID from the already loaded dashboard data.
     *
     * hostelId was previously declared inside fetchHostelData(),
     * so it was not available inside this function.
     */
    const currentHostelId =
      hostel?.hostelId ??
      hostel?.id ??
      dashboardData?.hostelId ??
      dashboardData?.id;

    if (!currentHostelId) {
      toast.error("Hostel information is not available.");
      return;
    }

    if (!basicInfoForm.hostelName.trim()) {
      toast.error("Hostel name is required.");
      return;
    }

    if (!basicInfoForm.hostelType.trim()) {
      toast.error("Hostel type is required.");
      return;
    }

    if (!basicInfoForm.phoneNumber.trim()) {
      toast.error("Phone number is required.");
      return;
    }

    try {
      setSavingEdit(true);

      const currentToken = localStorage.getItem("token");

      if (!currentToken) {
        throw new Error(
          "Authentication token is missing. Please log in again."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/owner/hostels/${currentHostelId}/basic-info`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },

          body: JSON.stringify({
            hostelName: basicInfoForm.hostelName.trim(),
            hostelType: basicInfoForm.hostelType.trim(),
            phoneNumber: basicInfoForm.phoneNumber.trim(),
            description: basicInfoForm.description.trim(),
          }),
        }
      );

      const responseText = await response.text();

      let data = null;

      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch {
        data = responseText;
      }

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data?.message ||
                data?.error ||
                "Failed to update basic information."
        );
      }

      /*
       * Refresh the profile so the updated
       * information is displayed immediately.
       */
      await fetchHostelData(false);

      setEditModal(null);

      toast.success("Basic information updated successfully.");
    } catch (err) {
      console.error("Failed to update basic information:", err);

      toast.error(
        err?.message || "Failed to update basic information."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  /* ==========================================================
     EDIT RULES
     ========================================================== */

  const openRulesEdit = () => {
    const currentRules = normalizeRules(
      hostel?.rules ??
        dashboardData?.rules ??
        hostel?.policies ??
        dashboardData?.policies ??
        []
    );

    const rulesSource =
      hostel?.rules ??
      dashboardData?.rules ??
      hostel?.policies ??
      dashboardData?.policies ??
      {};

    const rulesObject =
      rulesSource &&
      typeof rulesSource === "object" &&
      !Array.isArray(rulesSource)
        ? rulesSource
        : {};

    setRulesForm({
      noSmoking:
        rulesObject.noSmoking === true ||
        currentRules.some((rule) => rule?.key === "noSmoking"),

      noAlcohol:
        rulesObject.noAlcohol === true ||
        currentRules.some((rule) => rule?.key === "noAlcohol"),

      noPets:
        rulesObject.noPets === true ||
        currentRules.some((rule) => rule?.key === "noPets"),

      visitorsAllowed:
        rulesObject.visitorsAllowed === true ||
        currentRules.some((rule) => rule?.key === "visitorsAllowed"),

      curfewEnabled:
        rulesObject.curfewEnabled === true ||
        currentRules.some((rule) => rule?.key === "curfewEnabled"),

      additionalRules:
        rulesObject.additionalRules ||
        currentRules
          .filter((rule) =>
            String(rule?.key || "").startsWith("additional-")
          )
          .map((rule) => rule.text)
          .join("\n") ||
        "",
    });

    setEditModal("rules");
  };

  const saveRules = async () => {
    if (!hostelId) {
      toast.error("Hostel information is not available.");
      return;
    }

    try {
      setSavingEdit(true);

      const currentToken = localStorage.getItem("token");

      if (!currentToken) {
        throw new Error(
          "Authentication token is missing. Please log in again."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/owner/hostels/${hostelId}/rules`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },

          body: JSON.stringify({
            noSmoking: Boolean(rulesForm.noSmoking),
            noAlcohol: Boolean(rulesForm.noAlcohol),
            noPets: Boolean(rulesForm.noPets),
            visitorsAllowed: Boolean(rulesForm.visitorsAllowed),
            curfewEnabled: Boolean(rulesForm.curfewEnabled),
            additionalRules: rulesForm.additionalRules.trim(),
          }),
        }
      );

      const responseText = await response.text();

      let data = null;

      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch {
        data = responseText;
      }

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data?.message || data?.error || "Failed to update rules."
        );
      }

      await fetchHostelData(false);

      setEditModal(null);

      toast.success("Rules and policies updated successfully.");
    } catch (err) {
      console.error("Failed to update rules:", err);

      toast.error(err?.message || "Failed to update rules.");
    } finally {
      setSavingEdit(false);
    }
  };

  /* ==========================================================
     EDIT DEPOSIT POLICY
     ========================================================== */

  const openDepositEdit = () => {
    const currentDeposit = normalizeDeposit(
      hostel?.deposit ??
        dashboardData?.deposit ??
        hostel?.depositPolicy ??
        dashboardData?.depositPolicy ??
        hostel ??
        dashboardData
    );

    setDepositForm({
      refundPolicy:
        currentDeposit?.refundPolicy ||
        currentDeposit?.policy ||
        currentDeposit?.depositPolicy ||
        currentDeposit?.level ||
        currentDeposit?.type ||
        "",
    });

    setEditModal("deposit");
  };

  const saveDepositPolicy = async () => {
    if (!hostelId) {
      toast.error("Hostel information is not available.");
      return;
    }

    if (!depositForm.refundPolicy) {
      toast.error("Please select a refund policy.");
      return;
    }

    try {
      setSavingEdit(true);

      const currentToken = localStorage.getItem("token");

      if (!currentToken) {
        throw new Error(
          "Authentication token is missing. Please log in again."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/owner/hostels/${hostelId}/deposit-policy`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },

          body: JSON.stringify({
            refundPolicy: depositForm.refundPolicy,
          }),
        }
      );

      const responseText = await response.text();

      let data = null;

      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch {
        data = responseText;
      }

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data?.message ||
                data?.error ||
                "Failed to update deposit policy."
        );
      }

      await fetchHostelData(false);

      setEditModal(null);

      toast.success("Deposit policy updated successfully.");
    } catch (err) {
      console.error("Failed to update deposit policy:", err);

      toast.error(err?.message || "Failed to update deposit policy.");
    } finally {
      setSavingEdit(false);
    }
  };

  /* ==========================================================
     NAVIGATION
     ========================================================== */

  const handleNavigation = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/");
  };

  /* ==========================================================
     LOADING
     ========================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-7 h-7 animate-spin text-blue-600" />

          <p className="text-sm">Loading your hostel profile...</p>
        </div>
      </div>
    );
  }

  /* ==========================================================
     UI
     ========================================================== */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          h-screen
          w-[235px]
          bg-white
          border-r
          border-slate-200
          transition-transform
          duration-300
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}

        <div className="h-[76px] px-5 border-b border-slate-100 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2 size={21} className="text-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">FindMyHostel</h1>

              <p className="text-[9px] font-semibold tracking-widest text-slate-500">
                OWNER PORTAL
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}

        <div className="h-[calc(100vh-76px)] overflow-y-auto px-3 py-4">
          <SidebarLabel label="MAIN" />

          <SidebarItem
            icon={<Building2 size={17} />}
            label="Dashboard"
            onClick={() => handleNavigation("/owner/dashboard")}
          />

          <SidebarLabel label="MY HOSTEL" />

          <SidebarItem
            icon={<Building2 size={17} />}
            label="Hostel Profile"
            active
            onClick={() => handleNavigation("/owner/hostel")}
          />

          <SidebarItem
            icon={<BedDouble size={17} />}
            label="Rooms"
            onClick={() =>
              handleNavigation("/owner/hostel/rooms/${hostelId}")
            }
          />

          <SidebarItem
            icon={<Utensils size={18} />}
            label="Amenities"
            onClick={() => handleNavigation("/owner/amenities")}
          />

          <SidebarItem
            icon={<Images size={17} />}
            label="Photos"
            onClick={() => handleNavigation("/owner/photos")}
          />

          <SidebarLabel label="DISCOVERY" />

          <SidebarItem
            icon={<MessageSquare size={17} />}
            label="Issues"
            onClick={() => handleNavigation("/owner/issues")}
          />

          <SidebarItem
            icon={<Star size={17} />}
            label="Reviews"
            onClick={() => handleNavigation("/owner/reviews")}
          />

          <SidebarLabel label="INSIGHTS" />

          <SidebarItem
            icon={<BarChart3 size={17} />}
            label="Analytics"
            onClick={() => handleNavigation("/owner/analytics")}
          />

          <SidebarLabel label="ACCOUNT" />

          <SidebarItem
            icon={<Settings size={17} />}
            label="Settings"
            onClick={() => handleNavigation("/owner/settings")}
          />

          <SidebarItem
            icon={<HelpCircle size={17} />}
            label="Support"
            onClick={() => handleNavigation("/owner/support")}
          />

          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={() => handleNavigation("/hostel")}
              className="
                w-full
                h-10
                rounded-lg
                bg-blue-600
                hover:bg-blue-700
                text-white
                text-sm
                font-semibold
                flex
                items-center
                justify-center
                gap-2
              "
            >
              <ExternalLink size={15} />
              View Public Listing
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}

      <main className="lg:ml-[235px] h-screen flex flex-col overflow-hidden">
        {/* HEADER */}

        <header className="h-[76px] flex-shrink-0 bg-white border-b border-slate-200 px-5 lg:px-7 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2"
            >
              <Menu size={21} />
            </button>

            <div>
              <h2 className="text-xl font-bold">My Hostel</h2>

              <p className="text-xs text-slate-500 mt-0.5">
                Manage your hostel information and public listing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}

            <button
              className="
                relative
                w-9
                h-9
                rounded-lg
                hover:bg-slate-100
                flex
                items-center
                justify-center
              "
            >
              <Bell size={19} />

              {dashboardData?.notifications?.unread > 0 && (
                <span
                  className="
                    absolute
                    top-1
                    right-1
                    w-2
                    h-2
                    rounded-full
                    bg-red-500
                  "
                />
              )}
            </button>

            {/* Public Listing */}

            <button
              onClick={() => handleNavigation("/hostel")}
              className="
                hidden
                sm:flex
                items-center
                gap-2
                h-9
                px-4
                rounded-lg
                border
                border-slate-300
                bg-white
                hover:bg-slate-50
                text-sm
                font-medium
              "
            >
              View Public Listing
              <ExternalLink size={14} />
            </button>

            {/* OWNER PROFILE */}

            <div className="relative" ref={profileMenuRef}>
              {/* Profile Trigger */}

              <button
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className="
                  flex
                  items-center
                  gap-3
                  rounded-lg
                  px-2
                  py-1.5
                  hover:bg-slate-50
                  transition
                  focus:outline-none
                "
                title="Owner Profile"
              >
                {/* Owner Name */}

                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {ownerName}
                  </p>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Hostel Owner
                  </p>
                </div>

                {/* Profile Image */}

                <div
                  className="
                    w-9
                    h-9
                    rounded-full
                    bg-blue-100
                    flex
                    items-center
                    justify-center
                    overflow-hidden
                    hover:bg-blue-200
                    transition
                  "
                >
                  {owner.profileImage ? (
                    <img
                      src={owner.profileImage}
                      alt={ownerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle size={23} className="text-blue-600" />
                  )}
                </div>

                {/* Dropdown Arrow */}

                <ChevronDown
                  size={16}
                  className={`
                    text-slate-400
                    hidden
                    sm:block
                    transition-transform
                    duration-200
                    ${profileMenuOpen ? "rotate-180" : ""}
                  `}
                />
              </button>

              {/* PROFILE DROPDOWN */}

              {profileMenuOpen && (
                <div
                  className="
                    absolute
                    right-0
                    top-full
                    mt-2
                    w-56
                    bg-white
                    border
                    border-slate-200
                    rounded-xl
                    shadow-lg
                    shadow-slate-200/60
                    overflow-hidden
                    z-[100]
                  "
                >
                  {/* Owner Information */}

                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {ownerName}
                    </p>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Hostel Owner
                    </p>
                  </div>

                  {/* Profile / Settings */}

                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleNavigation("/owner/settings");
                    }}
                    className="
                      w-full
                      flex
                      items-center
                      gap-3
                      px-4
                      py-3
                      text-sm
                      text-slate-700
                      hover:bg-slate-50
                      transition
                    "
                  >
                    <UserCircle size={17} className="text-slate-500" />

                    <span>Profile & Settings</span>
                  </button>

                  {/* Logout */}

                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="
                      w-full
                      flex
                      items-center
                      gap-3
                      px-4
                      py-3
                      text-sm
                      text-red-600
                      hover:bg-red-50
                      transition
                      border-t
                      border-slate-100
                    "
                  >
                    <LogOut size={17} className="text-red-500" />

                    <span className="font-medium">Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ===================================================
            SCROLLABLE CONTENT AREA
        =================================================== */}

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-[1500px] mx-auto">
            {/* Error */}

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-3">
                <AlertTriangle size={18} className="text-red-500" />

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-red-700">
                    Unable to load hostel profile
                  </p>

                  <p className="text-xs text-red-600 mt-0.5">{error}</p>
                </div>

                <button
                  onClick={() => fetchHostelData(false)}
                  className="ml-auto text-xs font-semibold text-red-700"
                >
                  Retry
                </button>
              </div>
            )}

            {/* HERO */}

            <section className="bg-white border border-slate-200 rounded-xl p-4 lg:p-5">
              <div className="grid grid-cols-1 xl:grid-cols-[390px_1fr_430px] gap-5 items-stretch">
                {/* COVER */}

                <div className="relative min-h-[220px] xl:min-h-[205px] rounded-xl overflow-hidden bg-slate-100">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={hostelName || "Hostel cover"}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <EmptyImageState />
                  )}

                  {coverImage && (
                    <div className="absolute left-3 bottom-3">
                      <button
                        onClick={() => handleNavigation("/owner/photos")}
                        className="
                          px-3
                          py-1.5
                          rounded-lg
                          bg-white/95
                          backdrop-blur
                          shadow-sm
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wide
                          flex
                          items-center
                          gap-1.5
                        "
                      >
                        <Images size={13} />
                        Cover Photo
                      </button>
                    </div>
                  )}
                </div>

                {/* BASIC SUMMARY */}

                <div className="flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl lg:text-2xl font-bold">
                      {hostelName || "Hostel Profile"}
                    </h1>

                    {isApproved && (
                      <StatusBadge type="approved" label="APPROVED" />
                    )}

                    {!isApproved && approvalStatus && (
                      <StatusBadge
                        type="neutral"
                        label={formatStatus(approvalStatus)}
                      />
                    )}
                  </div>

                  {formattedAddress && (
                    <div className="flex items-start gap-2 mt-3 text-sm text-slate-600">
                      <MapPin
                        size={16}
                        className="text-slate-500 mt-0.5 shrink-0"
                      />

                      <span>{formattedAddress}</span>
                    </div>
                  )}

                  {(hostelType || gender) && (
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {hostelType && (
                        <InfoPill
                          icon={<Building2 size={13} />}
                          value={hostelType}
                        />
                      )}

                      {gender && (
                        <InfoPill
                          icon={<Users size={13} />}
                          value={gender}
                        />
                      )}
                    </div>
                  )}

                  {description && (
                    <p className="text-sm leading-6 text-slate-600 mt-4 max-w-xl line-clamp-3">
                      {description}
                    </p>
                  )}

                  {isApproved && (
                    <div className="flex items-center gap-2 mt-4 text-sm text-emerald-700">
                      <CheckCircle2 size={17} />

                      <span>
                        Your listing is live and visible to students.
                      </span>
                    </div>
                  )}

                  {!isApproved && approvalStatus && (
                    <div className="flex items-center gap-2 mt-4 text-sm text-slate-600">
                      <Clock3 size={16} />

                      <span>{reviewMessage}</span>
                    </div>
                  )}
                </div>

                {/* COMPLETENESS */}

                <div className="xl:border-l xl:border-slate-200 xl:pl-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      Listing Completeness
                    </p>

                    <span
                      className={`
                        text-xl
                        font-bold
                        ${
                          listingPercentage === 100
                            ? "text-emerald-600"
                            : "text-blue-600"
                        }
                      `}
                    >
                      {listingPercentage}%
                    </span>
                  </div>

                  <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`
                        h-full
                        rounded-full
                        transition-all
                        ${
                          listingPercentage === 100
                            ? "bg-emerald-500"
                            : "bg-blue-600"
                        }
                      `}
                      style={{
                        width: `${listingPercentage}%`,
                      }}
                    />
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {listingChecks.map((item) => (
                      <CompletenessRow
                        key={item.key}
                        label={item.label}
                        complete={item.complete}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* FIRST ROW */}

            <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
              {/* BASIC */}

              <ProfileCard
                title="Basic Information"
                action={<EditButton onClick={openBasicInfoEdit} />}
              >
                <InfoList>
                  <InfoRow
                    icon={<Building2 size={15} />}
                    label="Hostel Name"
                    value={hostelName}
                  />

                  <InfoRow
                    icon={<Building2 size={15} />}
                    label="Hostel Type"
                    value={hostelType}
                  />

                  <InfoRow
                    icon={<Users size={15} />}
                    label="Gender"
                    value={gender}
                  />

                  <InfoRow
                    icon={<Users size={15} />}
                    label="Capacity"
                    value={
                      capacity !== "" ? formatCapacity(capacity) : ""
                    }
                  />

                  <InfoRow
                    icon={<Phone size={15} />}
                    label="Phone Number"
                    value={ownerPhone}
                  />

                  <InfoRow
                    icon={<FileText size={15} />}
                    label="Description"
                    value={description}
                    multiline
                  />
                </InfoList>
              </ProfileCard>

              {/* LOCATION */}

              <ProfileCard
                title="Location"
                action={
                  <EditButton
                    onClick={() => handleNavigation("/owner/hostel")}
                  />
                }
              >
                <LocationPreview
                  latitude={latitude}
                  longitude={longitude}
                />

                <div className="mt-4 space-y-3">
                  <InfoRow
                    icon={<MapPin size={15} />}
                    label="Address"
                    value={formattedAddress}
                    multiline
                  />

                  <InfoRow
                    icon={<Navigation size={15} />}
                    label="Landmark"
                    value={landmark}
                  />

                  {latitude !== null && longitude !== null && (
                    <InfoRow
                      icon={<Map size={15} />}
                      label="Coordinates"
                      value={`${latitude}, ${longitude}`}
                    />
                  )}
                </div>
              </ProfileCard>

              {/* AMENITIES */}

              <ProfileCard
                title="Amenities"
                action={
                  <EditButton
                    onClick={() => handleNavigation("/owner/amenities")}
                  />
                }
              >
                <p className="text-xs text-slate-500 mb-3">
                  {amenities.length > 0
                    ? `${amenities.length} ${
                        amenities.length === 1 ? "Amenity" : "Amenities"
                      } Available`
                    : "No amenities available"}
                </p>

                {amenities.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {amenities.slice(0, 6).map((amenity, index) => (
                        <AmenityItem
                          key={
                            amenity?.id ??
                            amenity?.amenityId ??
                            amenity?.code ??
                            amenity?.amenityCode ??
                            (getAmenityName(amenity) || index)
                          }
                          amenity={amenity}
                        />
                      ))}
                    </div>

                    {amenities.length > 6 && (
                      <button
                        onClick={() => handleNavigation("/owner/hostel")}
                        className="
                          w-full
                          mt-3
                          h-9
                          rounded-lg
                          border
                          border-slate-200
                          text-xs
                          font-semibold
                          text-blue-700
                          hover:bg-blue-50
                          flex
                          items-center
                          justify-center
                          gap-1
                        "
                      >
                        View All Amenities ({amenities.length})
                        <ChevronRight size={14} />
                      </button>
                    )}
                  </>
                ) : (
                  <EmptySection
                    icon={<ShieldCheck size={20} />}
                    message="No amenities have been added yet."
                  />
                )}
              </ProfileCard>
            </section>

            {/* SECOND ROW */}

            <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
              {/* ROOMS */}

              <ProfileCard
                title="Room Configurations"
                action={
                  <button
                    onClick={() => handleNavigation("/owner/rooms")}
                    className="
                      h-8
                      px-3
                      rounded-lg
                      border
                      border-slate-300
                      text-[11px]
                      font-semibold
                      text-slate-700
                      hover:bg-slate-50
                      flex
                      items-center
                      gap-1
                    "
                  >
                    Manage Rooms
                  </button>
                }
              >
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <span>
                    {rooms.length}{" "}
                    {rooms.length === 1 ? "Room Type" : "Room Types"}
                  </span>

                  {getTotalBeds(rooms) > 0 && (
                    <>
                      <span>•</span>
                      <span>{getTotalBeds(rooms)} Total Beds</span>
                    </>
                  )}
                </div>

                {rooms.length > 0 ? (
                  <div className="space-y-1">
                    {rooms.map((room, index) => (
                      <RoomRow
                        key={room?.id ?? room?.roomId ?? index}
                        room={room}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptySection
                    icon={<BedDouble size={20} />}
                    message="No room configurations have been added yet."
                  />
                )}

                {rooms.length > 0 && (
                  <button
                    onClick={() => handleNavigation("/owner/rooms")}
                    className="
                      w-full
                      mt-3
                      h-9
                      rounded-lg
                      border
                      border-slate-200
                      text-xs
                      font-semibold
                      text-blue-700
                      hover:bg-blue-50
                      flex
                      items-center
                      justify-center
                      gap-1
                    "
                  >
                    View All Rooms
                    <ChevronRight size={14} />
                  </button>
                )}
              </ProfileCard>

              {/* RULES */}

              <ProfileCard
                title="Rules & Policies"
                action={<EditButton onClick={openRulesEdit} />}
              >
                {rules.length > 0 ? (
                  <div className="space-y-3">
                    {rules.map((rule, index) => (
                      <RuleItem
                        key={rule?.id ?? rule?.ruleId ?? index}
                        rule={rule}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptySection
                    icon={<FileText size={20} />}
                    message="No rules have been added yet."
                  />
                )}
              </ProfileCard>

              {/* DEPOSIT */}

              <ProfileCard
                title="Deposit Policy"
                action={<EditButton onClick={openDepositEdit} />}
              >
                {hasDepositData(deposit) ? (
                  <DepositContent deposit={deposit} />
                ) : (
                  <EmptySection
                    icon={<WalletCards size={20} />}
                    message="No deposit policy information is available."
                  />
                )}
              </ProfileCard>
            </section>

            {/* PHOTOS + APPROVAL */}

            <section className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-4 mt-4">
              {/* PHOTOS */}

              <ProfileCard
                title="Hostel Photos"
                action={
                  <button
                    onClick={() => handleNavigation("/owner/photos")}
                    className="
                      h-8
                      px-3
                      rounded-lg
                      border
                      border-slate-300
                      text-[11px]
                      font-semibold
                      text-slate-700
                      hover:bg-slate-50
                    "
                  >
                    Manage Photos
                  </button>
                }
              >
                {photos.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2">
                      {photos.map((photo, index) => (
                        <PhotoItem
                          key={photo?.id ?? photo?.photoId ?? index}
                          photo={photo}
                          isCover={photo === coverPhoto}
                        />
                      ))}

                      <button
                        onClick={() => handleNavigation("/owner/photos")}
                        className="
                          min-h-[100px]
                          rounded-lg
                          border
                          border-dashed
                          border-slate-300
                          bg-slate-50
                          hover:bg-blue-50
                          hover:border-blue-300
                          flex
                          flex-col
                          items-center
                          justify-center
                          gap-1
                          text-blue-600
                        "
                      >
                        <Plus size={20} />

                        <span className="text-[10px] font-semibold">
                          Add Photos
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                      <span>
                        {photos.length}{" "}
                        {photos.length === 1 ? "Photo" : "Photos"}
                      </span>

                      {coverPhoto && (
                        <>
                          <span>•</span>
                          <span>Cover photo selected</span>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="py-8">
                    <EmptySection
                      icon={<Images size={22} />}
                      message="No hostel photos have been uploaded yet."
                    />

                    <button
                      onClick={() => handleNavigation("/owner/photos")}
                      className="
                        mx-auto
                        mt-3
                        h-9
                        px-4
                        rounded-lg
                        bg-blue-600
                        hover:bg-blue-700
                        text-white
                        text-xs
                        font-semibold
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <Plus size={14} />
                      Add Photos
                    </button>
                  </div>
                )}
              </ProfileCard>

              {/* APPROVAL */}

              <ProfileCard title="Review / Approval Status">
                <ApprovalContent
                  status={approvalStatus}
                  isApproved={isApproved}
                  emailVerified={emailVerified}
                  ownerEmail={ownerEmail}
                />

                <button
                  onClick={() => handleNavigation("/owner/hostel")}
                  className="
                    w-full
                    mt-4
                    h-9
                    rounded-lg
                    border
                    border-slate-300
                    text-xs
                    font-semibold
                    text-slate-700
                    hover:bg-slate-50
                    flex
                    items-center
                    justify-center
                    gap-2
                  "
                >
                  View Profile
                  <ChevronRight size={14} />
                </button>
              </ProfileCard>
            </section>

            {/* REFRESH */}

            <div className="flex justify-end mt-4">
              <button
                disabled={refreshing}
                onClick={() => fetchHostelData(false)}
                className="
                  text-xs
                  font-medium
                  text-slate-500
                  hover:text-blue-600
                  flex
                  items-center
                  gap-2
                  disabled:opacity-50
                "
              >
                <Loader2
                  size={13}
                  className={refreshing ? "animate-spin" : ""}
                />

                Refresh profile data
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================
            EDIT MODALS
            ====================================================== */}

        {editModal === "basic" && (
          <EditModal
            title="Edit Basic Information"
            subtitle="Update the basic information of your hostel."
            onClose={() => setEditModal(null)}
            onSave={saveBasicInformation}
            saving={savingEdit}
          >
            <div className="space-y-4">
              <FormField label="Hostel Name" required>
                <input
                  type="text"
                  value={basicInfoForm.hostelName}
                  onChange={(event) =>
                    setBasicInfoForm((prev) => ({
                      ...prev,
                      hostelName: event.target.value,
                    }))
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    text-slate-700
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                  placeholder="Enter hostel name"
                />
              </FormField>

              <FormField label="Hostel Type" required>
                <input
                  type="text"
                  value={basicInfoForm.hostelType}
                  onChange={(event) =>
                    setBasicInfoForm((prev) => ({
                      ...prev,
                      hostelType: event.target.value,
                    }))
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    text-slate-700
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                  placeholder="Enter hostel type"
                />
              </FormField>

              <FormField label="Phone Number" required>
                <input
                  type="tel"
                  value={basicInfoForm.phoneNumber}
                  onChange={(event) =>
                    setBasicInfoForm((prev) => ({
                      ...prev,
                      phoneNumber: event.target.value,
                    }))
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    text-slate-700
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                  placeholder="Enter phone number"
                />
              </FormField>

              <FormField label="Description">
                <textarea
                  rows={5}
                  value={basicInfoForm.description}
                  onChange={(event) =>
                    setBasicInfoForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    text-slate-700
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                    resize-none
                  "
                  placeholder="Describe your hostel"
                />
              </FormField>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">Owner Name</p>

                <p className="text-sm font-semibold text-slate-700 mt-1">
                  {ownerName || "Authenticated owner"}
                </p>

                <p className="text-[10px] text-slate-400 mt-1">
                  Owner name is managed from your account and cannot be
                  changed here.
                </p>
              </div>
            </div>
          </EditModal>
        )}

        {editModal === "rules" && (
          <EditModal
            title="Edit Rules & Policies"
            subtitle="Update the rules and policies for your hostel."
            onClose={() => setEditModal(null)}
            onSave={saveRules}
            saving={savingEdit}
          >
            <div className="space-y-3">
              <RuleToggle
                label="No Smoking"
                checked={rulesForm.noSmoking}
                onChange={(checked) =>
                  setRulesForm((prev) => ({
                    ...prev,
                    noSmoking: checked,
                  }))
                }
              />

              <RuleToggle
                label="No Alcohol"
                checked={rulesForm.noAlcohol}
                onChange={(checked) =>
                  setRulesForm((prev) => ({
                    ...prev,
                    noAlcohol: checked,
                  }))
                }
              />

              <RuleToggle
                label="No Pets"
                checked={rulesForm.noPets}
                onChange={(checked) =>
                  setRulesForm((prev) => ({
                    ...prev,
                    noPets: checked,
                  }))
                }
              />

              <RuleToggle
                label="Visitors Allowed"
                checked={rulesForm.visitorsAllowed}
                onChange={(checked) =>
                  setRulesForm((prev) => ({
                    ...prev,
                    visitorsAllowed: checked,
                  }))
                }
              />

              <RuleToggle
                label="Curfew Enabled"
                checked={rulesForm.curfewEnabled}
                onChange={(checked) =>
                  setRulesForm((prev) => ({
                    ...prev,
                    curfewEnabled: checked,
                  }))
                }
              />

              <FormField label="Additional Rules">
                <textarea
                  rows={5}
                  value={rulesForm.additionalRules}
                  onChange={(event) =>
                    setRulesForm((prev) => ({
                      ...prev,
                      additionalRules: event.target.value,
                    }))
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    text-slate-700
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                    resize-none
                  "
                  placeholder="Enter additional rules"
                />
              </FormField>
            </div>
          </EditModal>
        )}

        {editModal === "deposit" && (
          <EditModal
            title="Edit Deposit Policy"
            subtitle="Update the refund policy for your hostel."
            onClose={() => setEditModal(null)}
            onSave={saveDepositPolicy}
            saving={savingEdit}
          >
            <FormField label="Refund Policy" required>
              <select
                value={depositForm.refundPolicy}
                onChange={(event) =>
                  setDepositForm((prev) => ({
                    ...prev,
                    refundPolicy: event.target.value,
                  }))
                }
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  px-3
                  py-2.5
                  text-sm
                  text-slate-700
                  outline-none
                  transition
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              >
                <option value="">Select refund policy</option>

                <option value="FLEXIBLE">Flexible</option>

                <option value="MODERATE">Moderate</option>

                <option value="STRICT">Strict</option>
              </select>
            </FormField>
          </EditModal>
        )}
      </main>
    </div>
  );
};

/* ============================================================
   WRAPPER WITH TOAST PROVIDER
   ============================================================ */

const HostelProfile = () => {
  return (
    <ToastProvider>
      <HostelProfileContent />
    </ToastProvider>
  );
};

/* ============================================================
   SIDEBAR
   ============================================================ */

const SidebarLabel = ({ label }) => (
  <div className="px-3 pt-4 pb-2">
    <p className="text-[9px] font-bold tracking-widest text-slate-400">
      {label}
    </p>
  </div>
);

const SidebarItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
      w-full
      h-10
      px-3
      rounded-lg
      flex
      items-center
      gap-3
      text-sm
      transition
      ${
        active
          ? "bg-blue-50 text-blue-700 font-semibold"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }
    `}
  >
    <span className={active ? "text-blue-600" : "text-slate-500"}>
      {icon}
    </span>

    <span className="flex-1 text-left">{label}</span>
  </button>
);

/* ============================================================
   PROFILE CARD
   ============================================================ */

const ProfileCard = ({ title, action, children }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 lg:p-5">
    <div className="flex items-center justify-between gap-3 mb-4">
      <h3 className="text-sm font-semibold">{title}</h3>

      {action}
    </div>

    {children}
  </div>
);

/* ============================================================
   EDIT BUTTON
   ============================================================ */

const EditButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="
      h-8
      px-3
      rounded-lg
      border
      border-slate-300
      text-[11px]
      font-semibold
      text-blue-700
      hover:bg-blue-50
      flex
      items-center
      gap-1
    "
  >
    <Pencil size={12} />
    Edit
  </button>
);

/* ============================================================
   EDIT MODAL
   ============================================================ */

const EditModal = ({ title, subtitle, children, onClose, onSave, saving }) => {
  return (
    <div
      className="
        fixed
        inset-0
        z-[200]
        bg-slate-900/40
        backdrop-blur-[2px]
        flex
        items-center
        justify-center
        p-4
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          w-full
          max-w-lg
          max-h-[90vh]
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
          border
          border-slate-200
          flex
          flex-col
        "
      >
        {/* HEADER */}

        <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>

            {subtitle && (
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="
              w-8
              h-8
              rounded-lg
              flex
              items-center
              justify-center
              text-slate-500
              hover:bg-slate-100
              disabled:opacity-50
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}

        <div className="overflow-y-auto px-5 py-5">{children}</div>

        {/* FOOTER */}

        <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="
              h-9
              px-4
              rounded-lg
              border
              border-slate-300
              text-xs
              font-semibold
              text-slate-700
              hover:bg-slate-50
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="
              h-9
              px-5
              rounded-lg
              bg-blue-600
              hover:bg-blue-700
              text-white
              text-xs
              font-semibold
              flex
              items-center
              justify-center
              gap-2
              disabled:opacity-60
            "
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   FORM FIELD
   ============================================================ */

const FormField = ({ label, required = false, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
      {label}

      {required && <span className="text-red-500 ml-1">*</span>}
    </label>

    {children}
  </div>
);

/* ============================================================
   RULE TOGGLE
   ============================================================ */

const RuleToggle = ({ label, checked, onChange }) => (
  <label
    className="
      flex
      items-center
      justify-between
      gap-4
      rounded-xl
      border
      border-slate-200
      px-4
      py-3
      cursor-pointer
      hover:bg-slate-50
      transition
    "
  >
    <span className="text-sm font-medium text-slate-700">{label}</span>

    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative
        w-11
        h-6
        rounded-full
        transition
        shrink-0
        ${checked ? "bg-blue-600" : "bg-slate-300"}
      `}
    >
      <span
        className={`
          absolute
          top-1
          w-4
          h-4
          rounded-full
          bg-white
          shadow-sm
          transition
          ${checked ? "left-6" : "left-1"}
        `}
      />
    </button>
  </label>
);

/* ============================================================
   INFO LIST
   ============================================================ */

const InfoList = ({ children }) => <div className="space-y-3">{children}</div>;

const InfoRow = ({ icon, label, value, multiline = false }) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div className="grid grid-cols-[20px_90px_1fr] gap-2 items-start">
      <span className="text-slate-500 mt-0.5">{icon}</span>

      <span className="text-[11px] text-slate-500">{label}</span>

      <span
        className={`
          text-xs
          text-slate-700
          ${multiline ? "leading-4" : ""}
        `}
      >
        {value}
      </span>
    </div>
  );
};

/* ============================================================
   LOCATION
   ============================================================ */

const LocationPreview = ({ latitude, longitude }) => {
  const hasCoordinates =
    latitude !== null &&
    latitude !== undefined &&
    longitude !== null &&
    longitude !== undefined;

  if (!hasCoordinates) {
    return (
      <div className="h-[105px] rounded-lg border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-center">
        <MapPin size={21} className="text-slate-400" />

        <p className="text-[11px] text-slate-500 mt-1">
          Coordinates not available
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-[105px] rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
      <iframe
        title="Hostel location"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${
          Number(longitude) - 0.01
        }%2C${
          Number(latitude) - 0.01
        }%2C${
          Number(longitude) + 0.01
        }%2C${
          Number(latitude) + 0.01
        }&layer=mapnik&marker=${latitude}%2C${longitude}`}
        className="w-full h-full border-0"
        loading="lazy"
      />

      <a
        href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="
          absolute
          right-2
          bottom-2
          px-2.5
          py-1.5
          rounded-lg
          bg-white
          shadow
          border
          border-slate-200
          text-[10px]
          font-semibold
          text-blue-700
          flex
          items-center
          gap-1
        "
      >
        Open in Map
        <ExternalLink size={11} />
      </a>
    </div>
  );
};

/* ============================================================
   AMENITY
   ============================================================ */

const AmenityItem = ({ amenity }) => {
  const name = getAmenityName(amenity);

  if (!name) {
    return null;
  }

  return (
    <div className="min-h-[58px] rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
        {getAmenityIcon(name)}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-700 truncate">
          {name}
        </p>

        <p className="text-[10px] text-emerald-600 mt-0.5">Available</p>
      </div>
    </div>
  );
};

/* ============================================================
   ROOM
   ============================================================ */

const RoomRow = ({ room }) => {
  const roomType = room?.roomType || room?.type || room?.name || "";

  const rent =
    room?.rentPerBed ?? room?.rent ?? room?.monthlyRent ?? null;

  const totalBeds =
    room?.totalBeds ?? room?.capacity ?? room?.numberOfBeds ?? null;

  const occupiedBeds = room?.occupiedBeds ?? room?.occupied ?? null;

  const availableBeds =
    totalBeds !== null && occupiedBeds !== null
      ? Math.max(Number(totalBeds) - Number(occupiedBeds), 0)
      : null;

  if (!roomType && rent === null) {
    return null;
  }

  return (
    <div className="min-h-[54px] rounded-lg border border-slate-200 px-3 py-2 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
        <BedDouble size={16} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-700 truncate">
          {roomType || "Room"}
        </p>

        {rent !== null && rent !== undefined && (
          <p className="text-[10px] text-slate-500 mt-0.5">
            {formatCurrency(rent)} / bed / month
          </p>
        )}
      </div>

      <div className="text-right">
        {totalBeds !== null && totalBeds !== undefined && (
          <p className="text-[10px] font-medium text-slate-600">
            {totalBeds} Beds
          </p>
        )}

        {availableBeds !== null && (
          <p className="text-[10px] text-emerald-600">
            {availableBeds} Available
          </p>
        )}
      </div>

      <ChevronRight size={15} className="text-slate-400" />
    </div>
  );
};

/* ============================================================
   RULE
   ============================================================ */

const RuleItem = ({ rule }) => {
  const value =
    typeof rule === "string"
      ? rule
      : rule?.text ||
        rule?.rule ||
        rule?.description ||
        rule?.name ||
        "";

  if (!value) {
    return null;
  }

  return (
    <div className="flex items-start gap-2.5">
      <CheckCircle2 size={15} className="text-slate-500 shrink-0 mt-0.5" />

      <p className="text-xs text-slate-700 leading-4">{value}</p>
    </div>
  );
};

/* ============================================================
   DEPOSIT
   ============================================================ */

const DepositContent = ({ deposit }) => {
  /*
   * Backend currently returns:
   *
   * {
   *   "refundPolicy": "MODERATE"
   * }
   *
   * Support the other possible field names too.
   */
  const refundPolicy =
    deposit?.refundPolicy ??
    deposit?.policy ??
    deposit?.depositPolicy ??
    deposit?.level ??
    deposit?.type ??
    "";

  const amount =
    deposit?.securityDeposit ??
    deposit?.amount ??
    deposit?.depositAmount ??
    null;

  const refundable =
    deposit?.refundable ?? deposit?.isRefundable ?? null;

  const noticePeriod =
    deposit?.noticePeriod ?? deposit?.noticePeriodDays ?? null;

  const advanceRent =
    deposit?.advanceRent ?? deposit?.advanceRentMonths ?? null;

  /*
   * Backend may currently only provide refundPolicy.
   * So don't hide the entire section just because
   * amount/refundable/etc. aren't available.
   */
  const hasPolicy =
    refundPolicy !== null &&
    refundPolicy !== undefined &&
    String(refundPolicy).trim() !== "";

  const hasRefundable = refundable !== null && refundable !== undefined;

  const hasAmount = amount !== null && amount !== undefined && amount !== "";

  const hasNoticePeriod =
    noticePeriod !== null && noticePeriod !== undefined && noticePeriod !== "";

  const hasAdvanceRent =
    advanceRent !== null && advanceRent !== undefined && advanceRent !== "";

  return (
    <div>
      {(hasPolicy || hasRefundable) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 rounded-lg border border-emerald-200 bg-emerald-50/50 overflow-hidden">
          {hasPolicy && (
            <div className="p-3">
              <p className="text-[10px] text-slate-500">Refund Policy</p>

              <p className="text-xs font-bold text-emerald-700 mt-1">
                {formatStatus(refundPolicy)}
              </p>
            </div>
          )}

          {hasRefundable && (
            <div
              className={`
                p-3
                ${
                  hasPolicy
                    ? "border-t sm:border-t-0 sm:border-l border-emerald-200"
                    : ""
                }
              `}
            >
              <p className="text-[10px] text-slate-500">Refundable</p>

              <p className="text-xs font-bold text-emerald-700 mt-1">
                {formatBoolean(refundable)}
              </p>
            </div>
          )}
        </div>
      )}

      {(hasAmount || hasNoticePeriod || hasAdvanceRent) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {hasAmount && (
            <SmallValue
              label="Security Deposit"
              value={formatCurrency(amount)}
            />
          )}

          {hasNoticePeriod && (
            <SmallValue
              label="Notice Period"
              value={formatDuration(noticePeriod)}
            />
          )}

          {hasAdvanceRent && (
            <SmallValue
              label="Advance Rent"
              value={formatDuration(advanceRent)}
            />
          )}
        </div>
      )}

      {!hasPolicy &&
        !hasRefundable &&
        !hasAmount &&
        !hasNoticePeriod &&
        !hasAdvanceRent && (
          <EmptySection
            icon={<WalletCards size={20} />}
            message="No deposit policy information is available."
          />
        )}
    </div>
  );
};

/* ============================================================
   PHOTOS
   ============================================================ */

const PhotoItem = ({ photo, isCover }) => {
  const image = getImageUrl(
    photo?.fileUrl ?? photo?.photoUrl ?? photo?.url
  );

  if (!image) {
    return (
      <div className="min-h-[100px] rounded-lg bg-slate-100 flex items-center justify-center">
        <Images size={20} className="text-slate-400" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[100px] rounded-lg overflow-hidden bg-slate-100 group">
      <img
        src={image}
        alt={photo?.photoType || "Hostel photo"}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {isCover && (
        <span className="absolute top-2 left-2 px-2 py-1 rounded-full bg-blue-600 text-white text-[9px] font-bold">
          COVER
        </span>
      )}
    </div>
  );
};

/* ============================================================
   APPROVAL
   ============================================================ */

const ApprovalContent = ({ status, isApproved, emailVerified, ownerEmail }) => {
  if (isApproved) {
    return (
      <div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 size={22} className="text-emerald-600" />
            </div>

            <div>
              <p className="text-sm font-bold text-emerald-700">
                All sections are approved
              </p>

              <p className="text-xs text-slate-600 mt-1">
                Your hostel listing is fully approved and visible according to
                the current approval status.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <StatusDetail label="Listing Status" value="Approved" positive />

          {ownerEmail && (
            <StatusDetail label="Owner Email" value={ownerEmail} />
          )}

          <StatusDetail
            label="Owner Verification"
            value={emailVerified ? "Verified" : "Not verified"}
            positive={emailVerified}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
            <Clock3 size={21} className="text-slate-600" />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-700">
              {status ? formatStatus(status) : "Status unavailable"}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              The current listing status is provided by the backend.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <StatusDetail
          label="Owner Verification"
          value={emailVerified ? "Verified" : "Not verified"}
          positive={emailVerified}
        />

        {ownerEmail && <StatusDetail label="Owner Email" value={ownerEmail} />}
      </div>
    </div>
  );
};

const StatusDetail = ({ label, value, positive = false }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
    <span className="text-xs text-slate-500">{label}</span>

    <span
      className={`
        text-xs
        font-semibold
        ${positive ? "text-emerald-600" : "text-slate-700"}
      `}
    >
      {value}
    </span>
  </div>
);

/* ============================================================
   COMPLETENESS
   ============================================================ */

const CompletenessRow = ({ label, complete }) => (
  <div className="flex items-center gap-2">
    {complete ? (
      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
    ) : (
      <AlertTriangle size={16} className="text-amber-500 shrink-0" />
    )}

    <span className="text-xs text-slate-700 flex-1">{label}</span>

    <span
      className={`
        text-[10px]
        font-semibold
        ${complete ? "text-emerald-600" : "text-amber-600"}
      `}
    >
      {complete ? "Complete" : "Needs attention"}
    </span>
  </div>
);

/* ============================================================
   SMALL COMPONENTS
   ============================================================ */

const InfoPill = ({ icon, value }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-medium text-slate-600">
    {icon}
    {value}
  </span>
);

const SmallValue = ({ label, value }) => (
  <div>
    <p className="text-[10px] text-slate-500">{label}</p>

    <p className="text-sm font-semibold text-slate-800 mt-1">{value}</p>
  </div>
);

const EmptySection = ({ icon, message }) => (
  <div className="py-6 flex flex-col items-center justify-center text-center">
    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
      {icon}
    </div>

    <p className="text-xs text-slate-500 mt-2 max-w-xs">{message}</p>
  </div>
);

const EmptyImageState = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
    <Images size={30} />

    <p className="text-xs mt-2">No cover photo</p>
  </div>
);

const StatusBadge = ({ type, label }) => (
  <span
    className={`
      inline-flex
      items-center
      gap-1.5
      px-2.5
      py-1
      rounded-full
      text-[10px]
      font-semibold
      ${
        type === "approved"
          ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
          : "bg-slate-100 border border-slate-200 text-slate-600"
      }
    `}
  >
    {type === "approved" ? (
      <CheckCircle2 size={12} />
    ) : (
      <Clock3 size={12} />
    )}

    {label}
  </span>
);

/* ============================================================
   NORMALIZATION FUNCTIONS
   ============================================================ */

/*
 * Converts technical backend names into readable names.
 *
 * Examples:
 *
 * WIFI              -> WiFi
 * WIFI_INTERNET     -> WiFi Internet
 * CCTV_CAMERA       -> CCTV Camera
 * LAUNDRY           -> Laundry
 * COMMON_ROOM       -> Common Room
 */
const formatAmenityLabel = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  let text = String(value).trim();

  if (!text) {
    return "";
  }

  text = text
    .replace(/^amenity[_\s-]*/i, "")
    .replace(/^hostel[_\s-]*/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return "";
  }

  /*
   * Keep common abbreviations readable.
   */
  const abbreviationMap = {
    wifi: "WiFi",
    wiFi: "WiFi",
    cctv: "CCTV",
    ac: "AC",
    tv: "TV",
    otp: "OTP",
    gps: "GPS",
    atm: "ATM",
    geyser: "Geyser",
  };

  const words = text.split(" ");

  return words
    .map((word) => {
      const lower = word.toLowerCase();

      if (abbreviationMap[lower]) {
        return abbreviationMap[lower];
      }

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};

/*
 * Extract a readable amenity name from
 * virtually any common backend object.
 */
const getAmenityName = (amenity) => {
  if (amenity === null || amenity === undefined) {
    return "";
  }

  if (typeof amenity === "string") {
    return formatAmenityLabel(amenity);
  }

  if (typeof amenity === "number") {
    return String(amenity);
  }

  if (typeof amenity === "boolean") {
    return "";
  }

  if (typeof amenity === "object") {
    /*
     * Most specific/common fields first.
     */
    const candidates = [
      amenity.name,
      amenity.amenityName,
      amenity.label,
      amenity.displayName,
      amenity.title,
      amenity.amenityCode,
      amenity.code,
      amenity.amenityType,
      amenity.type,
      amenity.description,
      amenity.value,
      amenity.amenity?.name,
      amenity.amenity?.amenityName,
      amenity.amenity?.label,
      amenity.amenity?.code,
      amenity.amenity?.amenityCode,
      amenity.amenity?.type,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === "string") {
        const cleaned = candidate.trim();

        if (cleaned) {
          return formatAmenityLabel(cleaned);
        }
      }
    }

    /*
     * Sometimes backend returns:
     *
     * {
     *   amenity: "WIFI"
     * }
     */
    if (typeof amenity.amenity === "string") {
      return formatAmenityLabel(amenity.amenity);
    }

    /*
     * Last fallback:
     * look for a meaningful string property.
     */
    for (const key of Object.keys(amenity)) {
      const candidate = amenity[key];

      if (typeof candidate === "string") {
        const cleaned = candidate.trim();

        if (
          cleaned &&
          !["id", "createdAt", "updatedAt"].includes(key)
        ) {
          return formatAmenityLabel(cleaned);
        }
      }
    }
  }

  return "";
};

/*
 * Normalizes amenity data regardless of
 * whether backend returns an array, object,
 * wrapper object, string, or boolean map.
 */
const normalizeAmenities = (value) => {
  const result = [];

  const addAmenity = (item) => {
    if (item === null || item === undefined || item === "") {
      return;
    }

    /*
     * Strings can sometimes contain
     * comma-separated values.
     */
    if (typeof item === "string") {
      const parts = item
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

      parts.forEach((part) => {
        const name = formatAmenityLabel(part);

        if (name) {
          result.push({
            name,
          });
        }
      });

      return;
    }

    /*
     * Numbers may represent amenity IDs.
     */
    if (typeof item === "number") {
      result.push({
        name: String(item),
      });

      return;
    }

    /*
     * Ignore plain booleans here.
     */
    if (typeof item === "boolean") {
      return;
    }

    /*
     * Arrays.
     */
    if (Array.isArray(item)) {
      item.forEach((nestedItem) => addAmenity(nestedItem));

      return;
    }

    /*
     * Objects.
     */
    if (typeof item === "object") {
      const directName = getAmenityName(item);

      if (directName) {
        result.push({
          ...item,
          name: directName,
        });

        return;
      }

      /*
       * Common wrapper properties.
       */
      const wrapperKeys = [
        "data",
        "items",
        "content",
        "list",
        "amenities",
        "amenityList",
        "hostelAmenities",
        "amenityNames",
        "amenityCodes",
        "amenityTypes",
        "amenityOptions",
        "values",
        "results",
      ];

      let handledWrapper = false;

      wrapperKeys.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
          handledWrapper = true;

          addAmenity(item[key]);
        }
      });

      if (handledWrapper) {
        return;
      }

      /*
       * Handle boolean maps such as:
       *
       * {
       *   wifi: true,
       *   parking: true,
       *   laundry: false
       * }
       */
      const entries = Object.entries(item);

      const booleanEntries = entries.filter(
        ([, entryValue]) => typeof entryValue === "boolean"
      );

      if (booleanEntries.length > 0) {
        booleanEntries
          .filter(([, entryValue]) => entryValue === true)
          .forEach(([key]) => {
            const name = formatAmenityLabel(key);

            if (name) {
              result.push({
                name,
                code: key,
              });
            }
          });

        /*
         * Do not continue treating
         * boolean-map metadata as normal
         * object properties.
         */
        return;
      }

      /*
       * If it is an object containing
       * arbitrary nested arrays, inspect them.
       */
      let foundNestedArray = false;

      entries.forEach(([, entryValue]) => {
        if (Array.isArray(entryValue)) {
          foundNestedArray = true;

          addAmenity(entryValue);
        }
      });

      if (foundNestedArray) {
        return;
      }

      /*
       * Finally inspect nested objects.
       */
      entries.forEach(([, entryValue]) => {
        if (entryValue && typeof entryValue === "object") {
          addAmenity(entryValue);
        }
      });
    }
  };

  addAmenity(value);

  /*
   * Remove duplicate amenities
   * while preserving their first occurrence.
   */
  const seen = new Set();

  return result.filter((amenity) => {
    const name = getAmenityName(amenity);

    if (!name) {
      return false;
    }

    const key = name.toLowerCase().trim();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
};

const normalizeRules = (value) => {
  if (value === null || value === undefined || value === "") {
    return [];
  }

  /*
   * Backend RulesInfo object:
   *
   * {
   *   noSmoking: true,
   *   noAlcohol: false,
   *   noPets: true,
   *   visitorsAllowed: true,
   *   curfewEnabled: true,
   *   additionalRules: "..."
   * }
   */

  if (value && typeof value === "object" && !Array.isArray(value)) {
    /*
     * If the backend ever returns a wrapper object.
     */
    if (
      value.data &&
      typeof value.data === "object" &&
      !Array.isArray(value.data)
    ) {
      return normalizeRules(value.data);
    }

    if (Array.isArray(value.rules)) {
      return normalizeRules(value.rules);
    }

    const rules = [];

    if (value.noSmoking === true) {
      rules.push({
        key: "noSmoking",
        text: "No Smoking",
      });
    }

    if (value.noAlcohol === true) {
      rules.push({
        key: "noAlcohol",
        text: "No Alcohol",
      });
    }

    if (value.noPets === true) {
      rules.push({
        key: "noPets",
        text: "No Pets",
      });
    }

    if (value.visitorsAllowed === true) {
      rules.push({
        key: "visitorsAllowed",
        text: "Visitors Allowed",
      });
    }

    if (value.curfewEnabled === true) {
      rules.push({
        key: "curfewEnabled",
        text: "Curfew Enabled",
      });
    }

    /*
     * Additional custom rules.
     */
    if (
      value.additionalRules !== null &&
      value.additionalRules !== undefined &&
      String(value.additionalRules).trim() !== ""
    ) {
      const additionalRules = String(value.additionalRules)
        .split(/\r?\n|,/)
        .map((rule) => rule.trim())
        .filter(Boolean);

      additionalRules.forEach((rule, index) => {
        rules.push({
          key: `additional-${index}`,
          text: rule,
        });
      });
    }

    return rules;
  }

  /*
   * Existing array support.
   */
  if (Array.isArray(value)) {
    return value
      .filter(
        (item) => item !== null && item !== undefined && item !== ""
      )
      .map((item, index) => {
        if (typeof item === "string") {
          return {
            key: `rule-${index}`,
            text: item,
          };
        }

        if (typeof item === "object") {
          return {
            ...item,
            key: item.key ?? item.id ?? item.ruleId ?? `rule-${index}`,
            text:
              item.text ??
              item.rule ??
              item.description ??
              item.name ??
              "",
          };
        }

        return null;
      })
      .filter((item) => item && item.text);
  }

  /*
   * Single string rule.
   */
  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((rule, index) => ({
        key: `rule-${index}`,
        text: rule.trim(),
      }))
      .filter((rule) => rule.text);
  }

  return [];
};

const normalizeDeposit = (value) => {
  if (value === null || value === undefined || value === "") {
    return {};
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    if (
      value.data &&
      typeof value.data === "object" &&
      !Array.isArray(value.data)
    ) {
      return value.data;
    }

    if (
      value.deposit &&
      typeof value.deposit === "object" &&
      !Array.isArray(value.deposit)
    ) {
      return value.deposit;
    }

    if (
      value.depositPolicy &&
      typeof value.depositPolicy === "object" &&
      !Array.isArray(value.depositPolicy)
    ) {
      return value.depositPolicy;
    }

    return value;
  }

  if (typeof value === "string") {
    return {
      policy: value,
    };
  }

  if (typeof value === "number") {
    return {
      securityDeposit: value,
    };
  }

  return {};
};

/* ============================================================
   HELPERS
   ============================================================ */

const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return null;
  }

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }

  const cleanPath = imagePath.replace(/^\/+/, "");

  return `${API_BASE_URL}/${cleanPath}`;
};

const normalizeStatus = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim().toUpperCase().replace(/\s+/g, "_");
};

const formatStatus = (value) => {
  if (!value) {
    return "";
  }

  return String(value)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatBoolean = (value) => {
  if (value === true || String(value).toLowerCase() === "true") {
    return "Yes";
  }

  if (value === false || String(value).toLowerCase() === "false") {
    return "No";
  }

  return String(value);
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(number);
};

const formatDuration = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (typeof value === "string" && /day|month|year/i.test(value)) {
    return value;
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return `${number} ${number === 1 ? "Month" : "Months"}`;
};

const formatCapacity = (value) => {
  if (
    typeof value === "string" &&
    /resident|bed|person|people/i.test(value)
  ) {
    return value;
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return `${number} Residents`;
};

const getAmenityIcon = (name) => {
  const normalized = String(name).toLowerCase();

  if (
    normalized.includes("wifi") ||
    normalized.includes("internet") ||
    normalized.includes("wireless")
  ) {
    return <Wifi size={16} />;
  }

  if (
    normalized.includes("bed") ||
    normalized.includes("room") ||
    normalized.includes("accommodation")
  ) {
    return <BedDouble size={16} />;
  }

  if (
    normalized.includes("parking") ||
    normalized.includes("car") ||
    normalized.includes("vehicle")
  ) {
    return <Building2 size={16} />;
  }

  if (
    normalized.includes("security") ||
    normalized.includes("cctv") ||
    normalized.includes("guard") ||
    normalized.includes("safety")
  ) {
    return <ShieldCheck size={16} />;
  }

  if (
    normalized.includes("mess") ||
    normalized.includes("food") ||
    normalized.includes("dining") ||
    normalized.includes("meal") ||
    normalized.includes("cafeteria")
  ) {
    return <Users size={16} />;
  }

  if (
    normalized.includes("laundry") ||
    normalized.includes("wash") ||
    normalized.includes("washing")
  ) {
    return <Building2 size={16} />;
  }

  if (
    normalized.includes("ac") ||
    normalized.includes("air") ||
    normalized.includes("cooling") ||
    normalized.includes("conditioning")
  ) {
    return <Building2 size={16} />;
  }

  if (
    normalized.includes("womens") ||
    normalized.includes("women") ||
    normalized.includes("female") ||
    normalized.includes("girls")
  ) {
    return <Users size={16} />;
  }

  if (
    normalized.includes("mens") ||
    normalized.includes("men") ||
    normalized.includes("male") ||
    normalized.includes("boys")
  ) {
    return <Users size={16} />;
  }

  if (
    normalized.includes("excellent") ||
    normalized.includes("good") ||
    normalized.includes("best") ||
    normalized.includes("top") ||
    normalized.includes("premium") ||
    normalized.includes("luxury")
  ) {
    return <Star size={16} />;
  }

  return <CheckCircle2 size={16} />;
};

const getTotalBeds = (rooms) => {
  if (!Array.isArray(rooms)) {
    return 0;
  }

  return rooms.reduce((total, room) => {
    const beds = Number(
      room?.totalBeds ?? room?.capacity ?? room?.numberOfBeds ?? 0
    );

    return total + (Number.isNaN(beds) ? 0 : beds);
  }, 0);
};

const hasDepositData = (deposit) => {
  if (!deposit || typeof deposit !== "object") {
    return false;
  }

  return Object.values(deposit).some(
    (value) => value !== null && value !== undefined && value !== ""
  );
};

const getApprovalMessage = (status) => {
  switch (status) {
    case "APPROVED":
      return "Your hostel has been approved.";

    case "PENDING":
    case "PENDING_APPROVAL":
      return "Your hostel is waiting for admin approval.";

    case "UNDER_REVIEW":
    case "IN_REVIEW":
      return "Your hostel is currently under admin review.";

    case "CHANGES_PENDING":
      return "Changes to your hostel are waiting for review.";

    case "REJECTED":
      return "Your hostel listing was rejected. Please review the requested changes.";

    default:
      return "The current listing status is being provided by the server.";
  }
};

export default HostelProfile;