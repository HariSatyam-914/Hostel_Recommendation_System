import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  LayoutDashboard,
  Building2,
  Clock3,
  MessageSquare,
  ShieldCheck,
  BarChart3,
  Gem,
  FileText,
  Users,
  Settings,
  History,
  HelpCircle,
  FileBarChart,
  Menu,
  Search,
  Bell,
  Moon,
  UserCircle,
  CalendarDays,
  ChevronDown,
  RefreshCw,
  Filter,
  Eye,
  CheckCircle2,
  Mail,
  Send,
  XCircle,
  AlertCircle,
  LogOut,
} from "lucide-react";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

const OwnerVerification = () => {
  /* =========================================================
     STATE
  ========================================================= */

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("All Status");

  const [dateFilter, setDateFilter] = useState("All Date");

  const [showStatusDropdown, setShowStatusDropdown] =
    useState(false);

  const [showDateDropdown, setShowDateDropdown] =
    useState(false);

  const [selectedOwner, setSelectedOwner] = useState(null);

  const [verificationRequests, setVerificationRequests] =
    useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [sendingOtp, setSendingOtp] = useState(false);

  const [profileMenuOpen, setProfileMenuOpen] =
    useState(false);

  const profileMenuRef = useRef(null);

  const navigate = useNavigate();

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userData");
    localStorage.removeItem("role");
    localStorage.removeItem("admin");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("jwtToken");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("admin");

    setProfileMenuOpen(false);

    navigate("/", { replace: true });
  };

  /* =========================================================
     CLOSE PROFILE MENU
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =========================================================
     NORMALIZE VERIFICATION STATUS
  ========================================================= */

  const normalizeVerificationStatus = (status) => {
  if (!status) {
    return "PENDING";
  }

  const normalized = String(status)
    .trim()
    .toUpperCase();

  switch (normalized) {
    case "OTP_SENT":
    case "OTP SENT":
      return "OTP SENT";

    case "VERIFIED":
      return "VERIFIED";

    case "REJECTED":
      return "REJECTED";

    case "PENDING":
    case "NOT_REQUESTED":
    case "NOT_VERIFIED":
    case "UNVERIFIED":
    case "NOT_STARTED":
      return "PENDING";

    default:
      return normalized;
  }
};
  /* =========================================================
     EXTRACT OWNER EMAIL VERIFICATION STATUS
  =========================================================
     The backend response may contain the status in
     different fields depending on the DTO/controller.

     This function checks the possible response structures
     without changing the API or the rest of the workflow.
  ========================================================= */

  const extractEmailVerificationStatus = (
    responseData
  ) => {
    if (
      responseData === null ||
      responseData === undefined
    ) {
      return null;
    }

    /* -----------------------------------------
       Direct string response

       Example:
       "VERIFIED"
       ----------------------------------------- */

    if (
      typeof responseData === "string"
    ) {
      const value =
        responseData.trim();

      if (value) {
        return value;
      }

      return null;
    }

    /* -----------------------------------------
       Direct boolean response

       Example:
       true / false
       ----------------------------------------- */

    if (
      typeof responseData === "boolean"
    ) {
      return responseData
        ? "VERIFIED"
        : "PENDING";
    }

    /* -----------------------------------------
       Direct object response
       ----------------------------------------- */

    if (
      typeof responseData === "object"
    ) {
      /*
       * Most likely field names.
       */

      const directStatus =
        responseData.status ??
        responseData.emailVerificationStatus ??
        responseData.verificationStatus ??
        responseData.ownerEmailVerificationStatus ??
        responseData.ownerVerificationStatus ??
        responseData.emailStatus ??
        responseData.emailVerification ??
        responseData.verification;

      if (
        typeof directStatus === "string" &&
        directStatus.trim()
      ) {
        return directStatus;
      }

      /*
       * Some backend responses may return
       * an enum/object.
       *
       * Example:
       * {
       *   status: {
       *      name: "VERIFIED"
       *   }
       * }
       */

      if (
        directStatus &&
        typeof directStatus === "object"
      ) {
        const nestedStatus =
          directStatus.status ??
          directStatus.name ??
          directStatus.value ??
          directStatus.code;

        if (
          typeof nestedStatus === "string" &&
          nestedStatus.trim()
        ) {
          return nestedStatus;
        }
      }

      /*
       * Nested data response.
       *
       * Example:
       * {
       *   data: {
       *     status: "VERIFIED"
       *   }
       * }
       */

      if (
        responseData.data !==
        undefined
      ) {
        const nestedDataStatus =
          extractEmailVerificationStatus(
            responseData.data
          );

        if (nestedDataStatus) {
          return nestedDataStatus;
        }
      }

      /*
       * Nested result response.
       */

      if (
        responseData.result !==
        undefined
      ) {
        const nestedResultStatus =
          extractEmailVerificationStatus(
            responseData.result
          );

        if (nestedResultStatus) {
          return nestedResultStatus;
        }
      }

      /*
       * Some DTOs may return an explicit
       * boolean field.
       */

      if (
        typeof responseData.emailVerified ===
        "boolean"
      ) {
        return responseData.emailVerified
          ? "VERIFIED"
          : "PENDING";
      }

      if (
        typeof responseData.ownerEmailVerified ===
        "boolean"
      ) {
        return responseData.ownerEmailVerified
          ? "VERIFIED"
          : "PENDING";
      }

      if (
        typeof responseData.verified ===
        "boolean"
      ) {
        return responseData.verified
          ? "VERIFIED"
          : "PENDING";
      }

      /*
       * Another possible nested structure:
       *
       * {
       *   emailVerification: {
       *      status: "VERIFIED"
       *   }
       * }
       */

      if (
        responseData.emailVerification &&
        typeof responseData.emailVerification ===
          "object"
      ) {
        const nestedEmailVerification =
          extractEmailVerificationStatus(
            responseData.emailVerification
          );

        if (nestedEmailVerification) {
          return nestedEmailVerification;
        }
      }

      /*
       * Another possible structure:
       *
       * {
       *   ownerVerification: {
       *      status: "OTP_SENT"
       *   }
       * }
       */

      if (
        responseData.ownerVerification &&
        typeof responseData.ownerVerification ===
          "object"
      ) {
        const nestedOwnerVerification =
          extractEmailVerificationStatus(
            responseData.ownerVerification
          );

        if (nestedOwnerVerification) {
          return nestedOwnerVerification;
        }
      }
    }

    return null;
  };

  /* =========================================================
     FETCH OWNER VERIFICATION REQUESTS
  ========================================================= */

  const fetchVerificationRequests = async () => {
    try {
      setRefreshing(true);

      console.log(
        "======================================"
      );
      console.log(
        "FETCHING OWNER VERIFICATION REQUESTS"
      );
      console.log(
        "======================================"
      );

      /*
       * GET /api/admin/hostels
       */

      const response = await api.get(
        "/api/admin/hostels"
      );

      console.log(
        "Admin hostels response:",
        response.data
      );

      const hostels = Array.isArray(response.data)
        ? response.data
        : response.data?.hostels || [];

      /*
       * Get actual email verification status
       * for every hostel.
       */

      const requests = await Promise.all(
        hostels.map(async (hostel) => {
          let emailVerificationStatus = null;

          const hostelId =
            hostel.hostelId ?? hostel.id;

          try {
            if (!hostelId) {
              throw new Error(
                "Hostel ID is unavailable."
              );
            }

            const statusResponse =
              await api.get(
                `/api/admin/hostels/${hostelId}/owner/email-verification-status`
              );

            console.log(
              `Verification status response for hostel ${hostelId}:`,
              statusResponse.data
            );

            /*
             * Extract the real verification
             * status from the backend response.
             */

            emailVerificationStatus =
              extractEmailVerificationStatus(
                statusResponse.data
              );

            console.log(
              `Extracted verification status for hostel ${hostelId}:`,
              emailVerificationStatus
            );
          } catch (error) {
            console.error(
              `Failed to fetch verification status for hostel ${hostelId}`,
              error
            );

            /*
             * If the dedicated verification endpoint
             * fails, use a status supplied by the
             * hostel listing if one exists.
             *
             * Otherwise keep it unknown rather than
             * falsely saying PENDING.
             */

            emailVerificationStatus =
              extractEmailVerificationStatus(
                {
                  ownerEmailVerificationStatus:
                    hostel.ownerEmailVerificationStatus,

                  ownerVerificationStatus:
                    hostel.ownerVerificationStatus,

                  emailVerificationStatus:
                    hostel.emailVerificationStatus,
                }
              );
          }

          return {
            id: hostelId,

            hostelId: hostelId,

            ownerName:
              hostel.ownerName ||
              hostel.owner?.name ||
              hostel.owner?.fullName ||
              "Owner information unavailable",

            hostelName:
              hostel.hostelName ||
              hostel.name ||
              "Hostel information unavailable",

            email:
              hostel.ownerEmail ||
              hostel.email ||
              hostel.owner?.email ||
              "",

            phone:
              hostel.ownerPhone ||
              hostel.phone ||
              hostel.owner?.phone ||
              "",

            submittedAt:
              hostel.submittedAt ||
              hostel.createdAt ||
              null,

            approvalStatus:
              hostel.approvalStatus ||
              hostel.status ||
              null,

            status: emailVerificationStatus
              ? normalizeVerificationStatus(
                  emailVerificationStatus
                )
              : "UNKNOWN",
          };
        })
      );

      console.log(
        "FINAL OWNER VERIFICATION DATA:",
        requests
      );

      setVerificationRequests(requests);

      return requests;
    } catch (error) {
      console.error(
        "Failed to fetch owner verification requests:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to load owner verification requests."
      );

      setVerificationRequests([]);

      return [];
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchVerificationRequests();
  }, []);

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "—";
    }

    try {
      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return "—";
      }

      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  /* =========================================================
     DATE FILTER
  ========================================================= */

  const isDateMatch = (
    submittedAt,
    selectedDate
  ) => {
    if (selectedDate === "All Date") {
      return true;
    }

    if (!submittedAt) {
      return false;
    }

    const submittedDate =
      new Date(submittedAt);

    if (
      Number.isNaN(
        submittedDate.getTime()
      )
    ) {
      return false;
    }

    const now = new Date();

    if (selectedDate === "Today") {
      return (
        submittedDate.getDate() ===
          now.getDate() &&
        submittedDate.getMonth() ===
          now.getMonth() &&
        submittedDate.getFullYear() ===
          now.getFullYear()
      );
    }

    if (selectedDate === "This Week") {
      const startOfWeek = new Date(now);

      const day = startOfWeek.getDay();

      startOfWeek.setDate(
        startOfWeek.getDate() - day
      );

      startOfWeek.setHours(
        0,
        0,
        0,
        0
      );

      return submittedDate >= startOfWeek;
    }

    if (selectedDate === "This Month") {
      return (
        submittedDate.getMonth() ===
          now.getMonth() &&
        submittedDate.getFullYear() ===
          now.getFullYear()
      );
    }

    return true;
  };

  /* =========================================================
     FILTER DATA
  ========================================================= */

  const filteredRequests = useMemo(() => {
    return verificationRequests.filter(
      (owner) => {
        const search =
          searchTerm.trim().toLowerCase();

        const matchesSearch =
          !search ||
          String(
            owner.ownerName || ""
          )
            .toLowerCase()
            .includes(search) ||
          String(
            owner.hostelName || ""
          )
            .toLowerCase()
            .includes(search) ||
          String(
            owner.email || ""
          )
            .toLowerCase()
            .includes(search);

        const matchesStatus =
          statusFilter === "All Status" ||
          owner.status === statusFilter;

        const matchesDate =
          isDateMatch(
            owner.submittedAt,
            dateFilter
          );

        return (
          matchesSearch &&
          matchesStatus &&
          matchesDate
        );
      }
    );
  }, [
    verificationRequests,
    searchTerm,
    statusFilter,
    dateFilter,
  ]);

  /* =========================================================
     SUMMARY COUNTS
  ========================================================= */

  const summaryCounts = useMemo(() => {
    const total =
      verificationRequests.length;

    const pending =
      verificationRequests.filter(
        (owner) =>
          owner.status === "PENDING"
      ).length;

    const otpSent =
      verificationRequests.filter(
        (owner) =>
          owner.status === "OTP SENT"
      ).length;

    const verified =
      verificationRequests.filter(
        (owner) =>
          owner.status === "VERIFIED"
      ).length;

    const rejected =
      verificationRequests.filter(
        (owner) =>
          owner.status === "REJECTED"
      ).length;

    return {
      total,
      pending,
      otpSent,
      verified,
      rejected,
    };
  }, [verificationRequests]);

  /* =========================================================
     STATUS BADGE
  ========================================================= */

  const getStatusStyle = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-100";

      case "OTP SENT":
        return "bg-blue-50 text-blue-700 border-blue-100";

      case "VERIFIED":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";

      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-100";

      case "UNKNOWN":
        return "bg-slate-50 text-slate-500 border-slate-200";

      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <Clock3 size={14} />;

      case "OTP SENT":
        return <Mail size={14} />;

      case "VERIFIED":
        return (
          <CheckCircle2 size={14} />
        );

      case "REJECTED":
        return <XCircle size={14} />;

      default:
        return <AlertCircle size={14} />;
    }
  };

  /* =========================================================
     MASK EMAIL
  ========================================================= */

  const maskEmail = (email) => {
    if (!email || !email.includes("@")) {
      return email || "—";
    }

    const [username, domain] =
      email.split("@");

    if (!username) {
      return `***@${domain}`;
    }

    if (username.length <= 2) {
      return `${username[0] || ""}***@${domain}`;
    }

    return `${username.substring(
      0,
      2
    )}***@${domain}`;
  };

  /* =========================================================
     VIEW OWNER
  ========================================================= */

  const handleViewOwner = (owner) => {
    setSelectedOwner(owner);
  };

  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = async () => {
    await fetchVerificationRequests();
  };

  /* =========================================================
     SEND OTP
  ========================================================= */

  const handleSendOtp = async () => {
    if (!selectedOwner?.hostelId) {
      toast.error(
        "Hostel information is unavailable."
      );
      return;
    }

    try {
      setSendingOtp(true);

      console.log(
        "Sending owner verification OTP for hostel:",
        selectedOwner.hostelId
      );

      await api.post(
        `/api/admin/hostels/${selectedOwner.hostelId}/owner-email-verification/send-otp`
      );

      toast.success(
        "OTP sent successfully to the owner's registered email."
      );

      /*
       * Fetch fresh backend data.
       */

      const updatedRequests =
        await fetchVerificationRequests();

      /*
       * Find the updated owner from the
       * fresh response.
       */

      const updatedOwner =
        updatedRequests.find(
          (owner) =>
            owner.hostelId ===
            selectedOwner.hostelId
        );

      if (updatedOwner) {
        setSelectedOwner(
          updatedOwner
        );
      }
    } catch (error) {
      console.error(
        "Failed to send owner email OTP:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to send owner email OTP."
      );
    } finally {
      setSendingOtp(false);
    }
  };

  /* =========================================================
     RESEND OTP
  ========================================================= */

  const handleResendOtp = async () => {
    if (!selectedOwner?.hostelId) {
      toast.error(
        "Hostel information is unavailable."
      );
      return;
    }

    try {
      setSendingOtp(true);

      await api.post(
        `/api/admin/hostels/${selectedOwner.hostelId}/owner/resend-email-otp`
      );

      toast.success(
        "A new OTP has been sent to the owner's registered email."
      );

      /*
       * Fetch fresh backend data.
       */

      const updatedRequests =
        await fetchVerificationRequests();

      const updatedOwner =
        updatedRequests.find(
          (owner) =>
            owner.hostelId ===
            selectedOwner.hostelId
        );

      if (updatedOwner) {
        setSelectedOwner(
          updatedOwner
        );
      }
    } catch (error) {
      console.error(
        "Failed to resend owner email OTP:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to resend owner email OTP."
      );
    } finally {
      setSendingOtp(false);
    }
  };

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handlePendingApprovalsNavigation =
    () => {
      /*
       * Existing route requires a hostel ID:
       *
       * /admin/pending-approvals/:hostelId
       *
       * Therefore use the first hostel whose
       * approval status is currently pending.
       */

      const pendingHostel =
        verificationRequests.find(
          (owner) => {
            const status =
              String(
                owner.approvalStatus ||
                  ""
              ).toUpperCase();

            return (
              status === "PENDING" ||
              status ===
                "OWNER_VERIFICATION_PENDING"
            );
          }
        );

      if (pendingHostel?.hostelId) {
        navigate(
          `/admin/pending-approvals/${pendingHostel.hostelId}`
        );
        return;
      }

      /*
       * If no pending hostel exists, do not
       * navigate to an invalid URL.
       */

      toast.info(
        "There are no pending hostel approvals."
      );
    };

  /* =========================================================
     SIDEBAR NAVIGATION
  ========================================================= */

  const navigation = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      onClick: () =>
        navigate("/admin/dashboard"),
    },

    {
      section: "MANAGEMENT",
    },

    {
      title: "Hostel Requests",
      icon: Building2,
      onClick: () =>
        navigate(
          "/admin/hostel-management"
        ),
    },

    {
      title: "Pending Approvals",
      icon: Clock3,
      onClick:
        handlePendingApprovalsNavigation,
    },

    {
      title: "User Issues",
      icon: MessageSquare,
      onClick: () =>
        navigate(
          "/admin/user-issues"
        ),
    },
    

    {
      title: "Owner Verification",
      icon: ShieldCheck,
      active: true,
      onClick: () =>
        navigate(
          "/admin/owner-verification"
        ),
    },

    {
      section: "ANALYTICS & REPORTS",
    },

    {
      title: "Analytics",
      icon: BarChart3,
      onClick: () =>
        navigate(
          "/admin/analytics"
        ),
    },

    {
      title: "Subscription",
      icon: Gem,
    },

    {
      title: "Reports",
      icon: FileText,
    },

    {
      section: "SYSTEM",
    },

    {
      title: "Users",
      icon: Users,
    },

    {
      title: "System Settings",
      icon: Settings,
    },

    {
      title: "Audit Logs",
      icon: History,
    },
  ];

  /* =========================================================
     NAVIGATION ITEM
  ========================================================= */

  const NavItem = ({
    icon: Icon,
    label,
    active,
    onClick,
  }) => (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3.5
        px-3.5 py-2.5
        rounded-xl
        font-medium text-sm
        transition
        ${
          active
            ? "bg-blue-600 text-white shadow-sm"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        }
      `}
    >
      <Icon
        className={`
          w-5 h-5 shrink-0
          ${
            active
              ? "text-white"
              : "text-slate-500"
          }
        `}
      />

      {sidebarOpen && (
        <span>{label}</span>
      )}
    </button>
  );

  /* =========================================================
     SIDEBAR
  ========================================================= */

  const Sidebar = () => {
    return (
      <>
        {/* Mobile Overlay */}

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/20 lg:hidden"
            onClick={() =>
              setSidebarOpen(false)
            }
          />
        )}

        <aside
          className={`
            fixed top-0 left-0 h-screen
            ${
              sidebarOpen
                ? "w-64"
                : "w-20"
            }
            transition-all duration-300
            bg-white
            border-r border-slate-200
            flex flex-col
            justify-between
            z-30
          `}
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
                  onClick={() =>
                    navigate(
                      "/admin/dashboard"
                    )
                  }
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
                    onClick={() =>
                      navigate(
                        "/admin/hostel-management"
                      )
                    }
                  />

                  <NavItem
                    icon={Clock3}
                    label="Pending Approvals"
                    onClick={
                      handlePendingApprovalsNavigation
                    }
                  />

                  <NavItem
                 icon={RefreshCw}
                 label="Reupload Review"
                 onClick={() =>
                   navigate('/admin/reupload')
                 }
               />

                  <NavItem
                    icon={MessageSquare}
                    label="User Issues"
                    onClick={() =>
                      navigate(
                        "/admin/user-issues"
                      )
                    }
                  />

                  <NavItem
                    icon={ShieldCheck}
                    label="Owner Verification"
                    active
                    onClick={() =>
                      navigate(
                        "/admin/owner-verification"
                      )
                    }
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
                    onClick={() =>
                      navigate(
                        "/admin/analytics"
                      )
                    }
                  />

                  <NavItem
                    icon={Gem}
                    label="Subscription"
                  />

                  <NavItem
                    icon={FileText}
                    label="Reports"
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
                  />

                  <NavItem
                    icon={Settings}
                    label="System Settings"
                  />

                  <NavItem
                    icon={History}
                    label="Audit Logs"
                  />
                </nav>
              </div>
            </div>
          </div>

          {/* Footer */}

          <div className="p-3 border-t border-slate-100 space-y-2">
            {sidebarOpen && (
              <button
                className="
                  w-full py-2.5 px-3
                  border border-blue-200
                  text-blue-600
                  rounded-xl
                  text-sm font-semibold
                  hover:bg-blue-50
                  transition
                  flex items-center
                  justify-center gap-2
                  mb-2
                "
              >
                <FileBarChart className="w-4 h-4" />

                Generate Reports
              </button>
            )}

            <NavItem
              icon={HelpCircle}
              label="Help Center"
            />

            <NavItem
              icon={LogOut}
              label="Logout"
              onClick={handleLogout}
            />
          </div>
        </aside>
      </>
    );
  };

  /* =========================================================
     SUMMARY CARD
  ========================================================= */

  const SummaryCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    iconBg,
    iconColor,
  }) => (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={`
            w-10 h-10
            rounded-xl
            flex items-center
            justify-center
            ${iconBg}
            ${iconColor}
          `}
        >
          <Icon className="w-5 h-5" />
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Current
        </span>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <h3 className="text-2xl font-bold text-slate-900 mt-1">
          {value ?? "—"}
        </h3>

        <p className="text-xs text-slate-400 mt-1">
          {subtitle || "Data unavailable"}
        </p>
      </div>
    </div>
  );

  /* =========================================================
     EMPTY STATE
  ========================================================= */

  const EmptyState = () => (
    <div className="py-20 px-6 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <ShieldCheck className="w-7 h-7" />
      </div>

      <h4 className="text-sm font-semibold text-slate-800">
        No verification requests
      </h4>

      <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">
        Owner verification requests
        will appear here once they
        are available from the backend.
      </p>

      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className="
          mt-5
          flex items-center gap-2
          px-4 py-2
          border border-slate-200
          bg-white
          rounded-lg
          text-xs font-semibold
          text-slate-600
          hover:bg-slate-50
          transition
          disabled:opacity-50
        "
      >
        <RefreshCw
          className={`
            w-4 h-4
            ${
              refreshing
                ? "animate-spin"
                : ""
            }
          `}
        />

        Refresh Data
      </button>
    </div>
  );

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased overflow-hidden">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div
        className={`
          flex-1
          flex flex-col
          min-w-0
          overflow-hidden
          transition-all duration-300
          ${
            sidebarOpen
              ? "ml-64"
              : "ml-20"
          }
        `}
      >
        {/* ===================================================
            TOP NAVBAR
        =================================================== */}

        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
          {/* Left */}

          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button
              onClick={() =>
                setSidebarOpen(
                  !sidebarOpen
                )
              }
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="relative w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

              <input
                type="text"
                placeholder="Search owner, hostel, email..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                className="
                  w-full
                  bg-slate-50
                  border border-slate-200
                  rounded-xl
                  pl-10 pr-12
                  py-2
                  text-sm
                  text-slate-800
                  placeholder-slate-400
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500/20
                  focus:border-blue-500
                  transition
                "
              />

              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 border border-slate-200 bg-white rounded text-xs text-slate-400 font-mono">
                ⌘ K
              </div>
            </div>
          </div>

          {/* Right */}

          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer p-2 hover:bg-slate-100 rounded-full text-slate-600 transition">
              <Bell className="w-6 h-6" />
            </div>

            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition">
              <Moon className="w-6 h-6" />
            </button>

            <div className="h-6 w-px bg-slate-200" />

            {/* Admin Profile */}

            <div
              ref={profileMenuRef}
              className="relative"
            >
              <button
                onClick={() =>
                  setProfileMenuOpen(
                    !profileMenuOpen
                  )
                }
                className="
                  flex items-center
                  gap-3
                  pl-2
                  cursor-pointer
                  rounded-xl
                  px-2 py-1.5
                  hover:bg-slate-50
                  transition
                "
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  A
                </div>

                <div className="text-left hidden md:block leading-tight">
                  <p className="text-sm font-semibold text-slate-800">
                    Admin User
                  </p>

                  <p className="text-xs text-slate-400">
                    Super Admin
                  </p>
                </div>

                <ChevronDown
                  className={`
                    w-4 h-4
                    text-slate-400
                    hidden md:block
                    transition-transform
                    ${
                      profileMenuOpen
                        ? "rotate-180"
                        : ""
                    }
                  `}
                />
              </button>

              {/* Profile Dropdown */}

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
                      onClick={
                        handleLogout
                      }
                      className="
                        w-full
                        flex items-center
                        gap-3
                        px-3 py-2.5
                        text-sm font-medium
                        text-rose-600
                        hover:bg-rose-50
                        rounded-lg
                        transition
                      "
                    >
                      <LogOut className="w-4 h-4" />

                      <span>
                        Logout
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* PAGE HEADER */}

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                  Owner Verification
                </h2>
              </div>

              <p className="text-sm text-slate-500 mt-1">
                Verify and manage hostel
                owner verification requests.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                className="
                  flex items-center
                  gap-2
                  px-4 py-2
                  bg-white
                  border border-slate-200
                  rounded-xl
                  text-sm
                  font-medium
                  text-slate-700
                  shadow-sm
                "
              >
                <CalendarDays className="w-4 h-4 text-slate-400" />

                <span>
                  Current Data
                </span>
              </button>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="
                  flex items-center
                  gap-2
                  px-4 py-2
                  bg-blue-600
                  text-white
                  rounded-xl
                  text-sm
                  font-medium
                  shadow-sm
                  hover:bg-blue-700
                  transition
                  disabled:opacity-70
                "
              >
                <RefreshCw
                  className={`
                    w-4 h-4
                    ${
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  `}
                />

                Refresh
              </button>
            </div>
          </div>

          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title="Total Requests"
              value={
                summaryCounts.total
              }
              subtitle="All verification requests"
              icon={ShieldCheck}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />

            <SummaryCard
              title="Pending Verification"
              value={
                summaryCounts.pending
              }
              subtitle="Waiting for OTP"
              icon={Clock3}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
            />

            <SummaryCard
              title="OTP Sent"
              value={
                summaryCounts.otpSent
              }
              subtitle="Waiting for owner"
              icon={Mail}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />

            <SummaryCard
              title="Verified"
              value={
                summaryCounts.verified
              }
              subtitle="Successfully verified"
              icon={CheckCircle2}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
            />
          </div>

          {/* =================================================
              VERIFICATION REQUESTS
          ================================================= */}

          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Section Header */}

            <div className="px-5 py-4 border-b border-slate-200">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Verification Requests
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    Review owner contact
                    verification and
                    manage OTP verification.
                  </p>
                </div>

                {/* Filters */}

                <div className="flex flex-wrap items-center gap-2">
                  {/* Search */}

                  <div className="relative">
                    <Search
                      size={17}
                      className="
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                      "
                    />

                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) =>
                        setSearchTerm(
                          e.target.value
                        )
                      }
                      placeholder="Search owner..."
                      className="
                        h-10
                        w-[210px]
                        rounded-xl
                        border border-slate-200
                        bg-white
                        pl-9 pr-4
                        text-sm
                        outline-none
                        placeholder:text-slate-400
                        focus:border-blue-300
                        focus:ring-2
                        focus:ring-blue-500/10
                      "
                    />
                  </div>

                  {/* Status */}

                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowStatusDropdown(
                          !showStatusDropdown
                        )
                      }
                      className="
                        flex h-10
                        min-w-[145px]
                        items-center
                        justify-between
                        gap-3
                        rounded-xl
                        border border-slate-200
                        bg-white
                        px-3
                        text-sm
                        font-medium
                        text-slate-600
                      "
                    >
                      <div className="flex items-center gap-2">
                        <Filter
                          size={15}
                          className="text-slate-400"
                        />

                        {statusFilter}
                      </div>

                      <ChevronDown
                        size={14}
                      />
                    </button>

                    {showStatusDropdown && (
                      <div className="absolute right-0 top-full z-40 mt-2 w-[170px] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                        {[
                          "All Status",
                          "PENDING",
                          "OTP SENT",
                          "VERIFIED",
                          "REJECTED",
                        ].map(
                          (status) => (
                            <button
                              key={status}
                              onClick={() => {
                                setStatusFilter(
                                  status
                                );

                                setShowStatusDropdown(
                                  false
                                );
                              }}
                              className={`
                                flex w-full
                                rounded-lg
                                px-3 py-2
                                text-left
                                text-xs
                                ${
                                  statusFilter ===
                                  status
                                    ? "bg-blue-50 font-semibold text-blue-600"
                                    : "text-slate-600 hover:bg-slate-50"
                                }
                              `}
                            >
                              {status}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {/* Date */}

                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowDateDropdown(
                          !showDateDropdown
                        )
                      }
                      className="
                        flex h-10
                        min-w-[125px]
                        items-center
                        justify-between
                        gap-3
                        rounded-xl
                        border border-slate-200
                        bg-white
                        px-3
                        text-sm
                        font-medium
                        text-slate-600
                      "
                    >
                      {dateFilter}

                      <ChevronDown
                        size={14}
                      />
                    </button>

                    {showDateDropdown && (
                      <div className="absolute right-0 top-full z-40 mt-2 w-[150px] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                        {[
                          "All Date",
                          "Today",
                          "This Week",
                          "This Month",
                        ].map(
                          (date) => (
                            <button
                              key={date}
                              onClick={() => {
                                setDateFilter(
                                  date
                                );

                                setShowDateDropdown(
                                  false
                                );
                              }}
                              className={`
                                flex w-full
                                rounded-lg
                                px-3 py-2
                                text-left
                                text-xs
                                ${
                                  dateFilter ===
                                  date
                                    ? "bg-blue-50 font-semibold text-blue-600"
                                    : "text-slate-600 hover:bg-slate-50"
                                }
                              `}
                            >
                              {date}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {/* Clear Filters */}

                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter(
                        "All Status"
                      );
                      setDateFilter(
                        "All Date"
                      );
                    }}
                    className="
                      flex h-10 w-10
                      items-center
                      justify-center
                      rounded-xl
                      border border-slate-200
                      bg-white
                      text-slate-500
                      transition
                      hover:bg-slate-50
                    "
                    title="Clear filters"
                  >
                    <Filter size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <RefreshCw
                    className="w-7 h-7 text-blue-600 animate-spin"
                  />

                  <p className="mt-4 text-sm font-medium text-slate-600">
                    Loading owner verification
                    requests...
                  </p>
                </div>
              ) : filteredRequests.length > 0 ? (
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Owner
                      </th>

                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Hostel
                      </th>

                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Email
                      </th>

                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Submitted
                      </th>

                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Status
                      </th>

                      <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRequests.map(
                      (owner) => (
                        <tr
                          key={owner.id}
                          className="
                            border-b
                            border-slate-100
                            hover:bg-slate-50/70
                            transition
                          "
                        >
                          {/* Owner */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                <UserCircle
                                  className="w-5 h-5"
                                  strokeWidth={
                                    1.8
                                  }
                                />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {
                                    owner.ownerName
                                  }
                                </p>

                                <p className="text-xs text-slate-400 mt-0.5">
                                  Hostel Owner
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Hostel */}

                          <td className="px-5 py-4">
                            <span className="text-sm font-medium text-slate-700">
                              {
                                owner.hostelName
                              }
                            </span>
                          </td>

                          {/* Email */}

                          <td className="px-5 py-4">
                            <span className="text-sm text-slate-500">
                              {maskEmail(
                                owner.email
                              )}
                            </span>
                          </td>

                          {/* Submitted */}

                          <td className="px-5 py-4">
                            <span className="text-sm text-slate-500">
                              {formatDate(
                                owner.submittedAt
                              )}
                            </span>
                          </td>

                          {/* Status */}

                          <td className="px-5 py-4">
                            <span
                              className={`
                                inline-flex
                                items-center
                                gap-1.5
                                px-2.5 py-1
                                rounded-full
                                border
                                text-xs
                                font-semibold
                                ${getStatusStyle(
                                  owner.status
                                )}
                              `}
                            >
                              {getStatusIcon(
                                owner.status
                              )}

                              {owner.status}
                            </span>
                          </td>

                          {/* Action */}

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end">
                              <button
                                onClick={() =>
                                  handleViewOwner(
                                    owner
                                  )
                                }
                                className="
                                  p-2
                                  rounded-lg
                                  text-slate-500
                                  hover:text-blue-600
                                  hover:bg-blue-50
                                  transition
                                "
                                title="View owner verification"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              ) : (
                <EmptyState />
              )}
            </div>

            {/* =================================================
                TABLE FOOTER
            ================================================= */}

            {filteredRequests.length >
              0 && (
              <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Showing{" "}
                  <span className="font-semibold text-slate-600">
                    {
                      filteredRequests.length
                    }
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-600">
                    {
                      verificationRequests.length
                    }
                  </span>{" "}
                  verification requests
                </p>

                <div className="flex items-center gap-1">
                  <button
                    disabled
                    className="
                      p-2
                      border border-slate-200
                      rounded-lg
                      text-slate-300
                      cursor-not-allowed
                    "
                  >
                    Previous
                  </button>

                  <button
                    className="
                      w-8 h-8
                      rounded-lg
                      bg-blue-600
                      text-white
                      text-xs
                      font-semibold
                    "
                  >
                    1
                  </button>

                  <button
                    disabled
                    className="
                      p-2
                      border border-slate-200
                      rounded-lg
                      text-slate-300
                      cursor-not-allowed
                    "
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* =====================================================
          OWNER DETAIL MODAL
      ===================================================== */}

      {selectedOwner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Owner Verification
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Review owner verification
                  details.
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedOwner(
                    null
                  )
                }
                className="
                  rounded-lg p-2
                  text-slate-400
                  hover:bg-slate-100
                  hover:text-slate-600
                "
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}

            <div className="space-y-4 p-5">
              {/* Owner */}

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <UserCircle className="w-6 h-6" />
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">
                      {
                        selectedOwner.ownerName
                      }
                    </h4>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Hostel Owner
                    </p>
                  </div>

                  <span
                    className={`
                      ml-auto
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      px-2.5 py-1
                      text-xs
                      font-semibold
                      ${getStatusStyle(
                        selectedOwner.status
                      )}
                    `}
                  >
                    {getStatusIcon(
                      selectedOwner.status
                    )}

                    {
                      selectedOwner.status
                    }
                  </span>
                </div>
              </div>

              {/* Information */}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Email
                  </p>

                  <p className="mt-1 break-all text-sm font-medium text-slate-700">
                    {selectedOwner.email ||
                      "Not available"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Hostel
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {
                      selectedOwner.hostelName
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Hostel ID
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {
                      selectedOwner.hostelId
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Submitted
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {formatDate(
                      selectedOwner.submittedAt
                    )}
                  </p>
                </div>
              </div>

              {/* Verification */}

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">
                      Email Verification
                    </h4>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Verify the owner's
                      registered email.
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500">
                        Registered Email
                      </p>

                      <p className="mt-1 break-all text-sm font-semibold text-slate-700">
                        {selectedOwner.email ||
                          "Email not available"}
                      </p>
                    </div>

                    <span
                      className={`
                        shrink-0
                        rounded-full
                        border
                        px-2.5 py-1
                        text-xs
                        font-semibold
                        ${getStatusStyle(
                          selectedOwner.status
                        )}
                      `}
                    >
                      {
                        selectedOwner.status
                      }
                    </span>
                  </div>
                </div>

                {/* Pending */}

                {selectedOwner.status ===
                  "PENDING" && (
                  <button
                    onClick={
                      handleSendOtp
                    }
                    disabled={
                      sendingOtp
                    }
                    className="
                      mt-3
                      flex w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-blue-600
                      px-4 py-2.5
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-blue-700
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {sendingOtp ? (
                      <>
                        <RefreshCw
                          className="w-4 h-4 animate-spin"
                        />

                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />

                        Send Email OTP
                      </>
                    )}
                  </button>
                )}

                {/* OTP Sent */}

                {selectedOwner.status ===
                  "OTP SENT" && (
                  <div className="mt-3">
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 mt-0.5 shrink-0 text-blue-600" />

                        <div>
                          <p className="text-sm font-semibold text-blue-700">
                            OTP sent successfully
                          </p>

                          <p className="mt-1 text-xs text-blue-500">
                            An OTP has been
                            sent to the
                            owner's
                            registered email.
                          </p>

                          <p className="mt-1 text-xs text-blue-500">
                            The owner must
                            enter the OTP
                            on the owner
                            verification
                            page.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={
                        handleResendOtp
                      }
                      disabled={
                        sendingOtp
                      }
                      className="
                        mt-3
                        flex w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border border-blue-200
                        px-4 py-2.5
                        text-sm
                        font-semibold
                        text-blue-600
                        transition
                        hover:bg-blue-50
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      {sendingOtp ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />

                          Resending OTP...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />

                          Resend OTP
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Verified */}

                {selectedOwner.status ===
                  "VERIFIED" && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />

                    <div>
                      <p className="text-sm font-semibold text-emerald-700">
                        Owner email verified
                      </p>

                      <p className="mt-1 text-xs text-emerald-600">
                        The owner has
                        successfully
                        completed email
                        verification.
                      </p>
                    </div>
                  </div>
                )}

                {/* Rejected */}

                {selectedOwner.status ===
                  "REJECTED" && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
                    <XCircle className="w-5 h-5 text-red-600" />

                    <div>
                      <p className="text-sm font-semibold text-red-700">
                        Verification rejected
                      </p>

                      <p className="mt-1 text-xs text-red-600">
                        This owner's
                        verification
                        request has
                        been rejected.
                      </p>
                    </div>
                  </div>
                )}

                {/* Unknown */}

                {selectedOwner.status ===
                  "UNKNOWN" && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <AlertCircle className="w-5 h-5 text-slate-500" />

                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Verification status unavailable
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        The backend did not
                        provide the current
                        verification status.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}

            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button
                onClick={() =>
                  setSelectedOwner(
                    null
                  )
                }
                className="
                  rounded-xl
                  border border-slate-200
                  bg-white
                  px-4 py-2
                  text-sm
                  font-semibold
                  text-slate-600
                  hover:bg-slate-50
                "
              >
                Close
              </button>

              {selectedOwner.status ===
                "VERIFIED" && (
                <button
                  onClick={() => {
                    const hostelId =
                      selectedOwner.hostelId;

                    setSelectedOwner(
                      null
                    );

                    navigate(
                      `/admin/pending-approvals/${hostelId}`
                    );
                  }}
                  className="
                    rounded-xl
                    bg-blue-600
                    px-4 py-2
                    text-sm
                    font-semibold
                    text-white
                    hover:bg-blue-700
                  "
                >
                  Continue Hostel Review
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerVerification;