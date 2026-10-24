import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Building2,
  Users,
  AlertTriangle,
  BarChart3,
  FileText,
  CreditCard,
  Settings as SettingsIcon,
  ClipboardList,
  Search,
  Filter,
  Download,
  Bell,
  UserCircle,
  ChevronDown,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Eye,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  Clock,
  RefreshCw,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Globe,
  Database,
  Activity,
  Loader2,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* CONFIG                                                                     */
/* -------------------------------------------------------------------------- */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt") ||
    localStorage.getItem("jwtToken");

  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

const formatDateLabel = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const formatTimeLabel = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const normalizeStatus = (value) => {
  const s = String(value || "").trim().toUpperCase();
  if (s === "SUCCESS" || s === "SUCCESSFUL" || s === "OK") return "Success";
  if (s === "WARNING" || s === "WARN") return "Warning";
  if (s === "FAILED" || s === "FAILURE" || s === "ERROR") return "Failed";
  return value ? String(value) : "Success";
};

const extractArray = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  for (const k of keys) {
    if (Array.isArray(payload[k])) return payload[k];
  }
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.content)) return payload.content;
  if (Array.isArray(payload.logs)) return payload.logs;
  return [];
};

const normalizeLog = (raw, index) => {
  const createdAt =
    raw?.createdAt ||
    raw?.timestamp ||
    raw?.time ||
    raw?.date ||
    raw?.loggedAt ||
    null;

  const dateLabel = raw?.dateLabel || formatDateLabel(createdAt);
  const timeLabel = raw?.timeLabel || formatTimeLabel(createdAt);

  return {
    id: raw?.id ?? raw?.logId ?? `log-${index}`,
    createdAt,
    date: dateLabel,
    time: timeLabel,
    user:
      raw?.userName ||
      raw?.user ||
      raw?.performedBy ||
      raw?.actorName ||
      "System",
    role:
      raw?.userRole ||
      raw?.role ||
      raw?.actorRole ||
      "System",
    action:
      raw?.action ||
      raw?.actionType ||
      raw?.eventType ||
      "Activity",
    module:
      raw?.module ||
      raw?.moduleName ||
      raw?.category ||
      "System",
    target:
      raw?.target ||
      raw?.targetName ||
      raw?.entityName ||
      raw?.description ||
      "—",
    targetId:
      raw?.targetId ||
      raw?.entityId ||
      raw?.referenceId ||
      "—",
    ip:
      raw?.ipAddress ||
      raw?.ip ||
      raw?.clientIp ||
      "—",
    status: normalizeStatus(raw?.status || raw?.result),
    description:
      raw?.description ||
      raw?.details ||
      raw?.message ||
      "",
    changes:
      raw?.changes ||
      raw?.changeSummary ||
      raw?.diff ||
      "",
  };
};

/* -------------------------------------------------------------------------- */
/* SIDEBAR DATA                                                               */
/* -------------------------------------------------------------------------- */

const managementItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
  },
  {
    label: "Hostel Requests",
    icon: Building2,
    path: "/admin/hostel-requests",
  },
  {
    label: "Pending Approvals",
    icon: ClipboardList,
    path: "/admin/pending-approvals",
  },
  {
    label: "Users",
    icon: Users,
    path: "/admin/users",
  },
  {
    label: "User Issues",
    icon: AlertTriangle,
    path: "/admin/user-issues",
  },
];

const analyticsItems = [
  {
    label: "Analytics",
    icon: BarChart3,
    path: "/admin/analytics",
  },
  {
    label: "Reports",
    icon: FileText,
    path: "/admin/reports",
  },
  {
    label: "Subscription",
    icon: CreditCard,
    path: "/admin/subscription",
  },
];

const systemItems = [
  {
    label: "System Settings",
    icon: SettingsIcon,
    path: "/admin/system-settings",
  },
  {
    label: "Audit Logs",
    icon: ClipboardList,
    path: "/admin/audit-logs",
  },
];

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

const AuditLogs = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("All Dates");
  const [userFilter, setUserFilter] = useState("All Users");
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [moduleFilter, setModuleFilter] = useState("All Modules");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);

  const [showFilters, setShowFilters] = useState(true);

  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const refreshInProgressRef = useRef(false);

  const ITEMS_PER_PAGE = 10;

  /* ---------------------------------------------------------------------- */
  /* FETCH AUDIT LOGS                                                        */
  /* ---------------------------------------------------------------------- */

  const fetchAuditLogs = useCallback(async ({ silent = false } = {}) => {
    if (refreshInProgressRef.current) return;
    refreshInProgressRef.current = true;

    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/api/admin/audit-logs`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error(`Unable to load audit logs (${res.status})`);
      }

      const payload = await res.json();
      const rawLogs = extractArray(payload, ["logs", "auditLogs"]);

      const normalized = rawLogs
        .map(normalizeLog)
        .filter((log) => log && log.id !== null && log.id !== undefined);

      setLogs(normalized);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      setError(err?.message || "Failed to load audit logs.");
      setLogs([]);
    } finally {
      refreshInProgressRef.current = false;
      if (silent) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  /* ---------------------------------------------------------------------- */
  /* FETCH AUDIT STATS                                                       */
  /* ---------------------------------------------------------------------- */

  const fetchAuditStats = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/audit-logs/stats`,
        { headers: getAuthHeaders() }
      );

      if (!res.ok) return;

      const payload = await res.json();
      setStats(payload?.data || payload);
    } catch (err) {
      // Not fatal — fall back to local calculation.
      console.warn("Audit stats endpoint unavailable:", err);
    }
  }, []);

  /* ---------------------------------------------------------------------- */
  /* INITIAL LOAD + REAL-TIME POLLING                                        */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    fetchAuditLogs({ silent: false });
    fetchAuditStats();
  }, [fetchAuditLogs, fetchAuditStats]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchAuditLogs({ silent: true });
        fetchAuditStats();
      }
    }, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAuditLogs({ silent: true });
        fetchAuditStats();
      }
    };

    const handleFocus = () => {
      fetchAuditLogs({ silent: true });
      fetchAuditStats();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchAuditLogs, fetchAuditStats]);

  /* ---------------------------------------------------------------------- */
  /* CLOSE PROFILE DROPDOWN ON OUTSIDE CLICK                                 */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* FILTER OPTIONS (derived from real data)                                 */
  /* ---------------------------------------------------------------------- */

  const actionOptions = useMemo(() => {
    const unique = new Set();
    logs.forEach((log) => {
      if (log.action) unique.add(log.action);
    });
    return ["All Actions", ...Array.from(unique).sort()];
  }, [logs]);

  const moduleOptions = useMemo(() => {
    const unique = new Set();
    logs.forEach((log) => {
      if (log.module) unique.add(log.module);
    });
    return ["All Modules", ...Array.from(unique).sort()];
  }, [logs]);

  /* ---------------------------------------------------------------------- */
  /* FILTERING                                                               */
  /* ---------------------------------------------------------------------- */

  const filteredLogs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    return logs.filter((log) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          log.user,
          log.role,
          log.action,
          log.module,
          log.target,
          log.targetId,
          log.ip,
          log.description,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      let matchesDate = true;
      if (dateFilter !== "All Dates" && log.createdAt) {
        const logDate = new Date(log.createdAt);
        if (!Number.isNaN(logDate.getTime())) {
          if (dateFilter === "Today" && logDate < startOfToday) {
            matchesDate = false;
          } else if (
            dateFilter === "Yesterday" &&
            (logDate < startOfYesterday || logDate >= startOfToday)
          ) {
            matchesDate = false;
          }
        }
      }

      const matchesUser =
        userFilter === "All Users" ||
        (userFilter === "Administrators" && log.role === "Administrator") ||
        (userFilter === "Hostel Owners" && log.role === "Hostel Owner") ||
        (userFilter === "End Users" && log.role === "End User") ||
        (userFilter === "System" && log.role === "System");

      const matchesAction =
        actionFilter === "All Actions" ||
        log.action === actionFilter;

      const matchesModule =
        moduleFilter === "All Modules" ||
        log.module === moduleFilter;

      const matchesStatus =
        statusFilter === "All Status" ||
        log.status === statusFilter;

      return (
        matchesSearch &&
        matchesDate &&
        matchesUser &&
        matchesAction &&
        matchesModule &&
        matchesStatus
      );
    });
  }, [
    logs,
    searchTerm,
    dateFilter,
    userFilter,
    actionFilter,
    moduleFilter,
    statusFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLogs.length / ITEMS_PER_PAGE)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedLogs = filteredLogs.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  /* ---------------------------------------------------------------------- */
  /* SUMMARY COUNTS (from stats endpoint, or calculated locally)             */
  /* ---------------------------------------------------------------------- */

  const successCount = useMemo(() => {
    if (stats?.successCount != null)
      return Number(stats.successCount) || 0;
    return logs.filter((log) => log.status === "Success").length;
  }, [stats, logs]);

  const warningCount = useMemo(() => {
    if (stats?.warningCount != null)
      return Number(stats.warningCount) || 0;
    return logs.filter((log) => log.status === "Warning").length;
  }, [stats, logs]);

  const failedCount = useMemo(() => {
    if (stats?.failedCount != null)
      return Number(stats.failedCount) || 0;
    return logs.filter((log) => log.status === "Failed").length;
  }, [stats, logs]);

  const todayCount = useMemo(() => {
    if (stats?.todayCount != null)
      return Number(stats.todayCount) || 0;
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    return logs.filter((log) => {
      if (!log.createdAt) return false;
      const d = new Date(log.createdAt);
      return !Number.isNaN(d.getTime()) && d >= startOfToday;
    }).length;
  }, [stats, logs]);

  const totalActivities = useMemo(() => {
    if (stats?.totalCount != null) return Number(stats.totalCount) || 0;
    return logs.length;
  }, [stats, logs]);

  const securityEvents = useMemo(() => {
    if (stats?.securityCount != null)
      return Number(stats.securityCount) || 0;
    return logs.filter((log) => log.module === "Authentication").length;
  }, [stats, logs]);

  const totalDeltaPercent = useMemo(() => {
    if (stats?.totalDeltaPercent != null)
      return Number(stats.totalDeltaPercent);
    return null;
  }, [stats]);

  const todayDeltaPercent = useMemo(() => {
    if (stats?.todayDeltaPercent != null)
      return Number(stats.todayDeltaPercent);
    return null;
  }, [stats]);

  const securityDeltaPercent = useMemo(() => {
    if (stats?.securityDeltaPercent != null)
      return Number(stats.securityDeltaPercent);
    return null;
  }, [stats]);

  const failedDeltaPercent = useMemo(() => {
    if (stats?.failedDeltaPercent != null)
      return Number(stats.failedDeltaPercent);
    return null;
  }, [stats]);

  /* ---------------------------------------------------------------------- */
  /* HELPERS                                                                 */
  /* ---------------------------------------------------------------------- */

  const handleNavigation = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDateFilter("All Dates");
    setUserFilter("All Users");
    setActionFilter("All Actions");
    setModuleFilter("All Modules");
    setStatusFilter("All Status");
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleManualRefresh = async () => {
    await fetchAuditLogs({ silent: false });
    await fetchAuditStats();
  };

  /* ---------------------------------------------------------------------- */
  /* EXPORT                                                                  */
  /* ---------------------------------------------------------------------- */

  const handleExport = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/audit-logs/export`,
        {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            search: searchTerm,
            dateFilter,
            userFilter,
            actionFilter,
            moduleFilter,
            statusFilter,
          }),
        }
      );

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `audit-logs-${new Date()
          .toISOString()
          .slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }

      // Fallback to client-side CSV generation.
      throw new Error("Server export unavailable");
    } catch (err) {
      console.warn("Falling back to client-side CSV export:", err);

      const headers = [
        "Date",
        "Time",
        "User",
        "Role",
        "Action",
        "Module",
        "Target",
        "Target ID",
        "IP Address",
        "Status",
        "Description",
        "Changes",
      ];

      const csvRows = filteredLogs.map((log) => [
        log.date,
        log.time,
        log.user,
        log.role,
        log.action,
        log.module,
        log.target,
        log.targetId,
        log.ip,
        log.status,
        log.description,
        log.changes,
      ]);

      const csvContent = [headers, ...csvRows]
        .map((row) =>
          row
            .map((value) => {
              const stringValue = String(value ?? "");
              return `"${stringValue.replace(/"/g, '""')}"`;
            })
            .join(",")
        )
        .join("\n");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit-logs-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "Success":
        return {
          icon: CheckCircle2,
          badgeClass:
            "bg-emerald-50 text-emerald-700 border border-emerald-200",
          iconClass: "text-emerald-600",
        };

      case "Warning":
        return {
          icon: AlertCircle,
          badgeClass:
            "bg-amber-50 text-amber-700 border border-amber-200",
          iconClass: "text-amber-600",
        };

      case "Failed":
        return {
          icon: XCircle,
          badgeClass: "bg-red-50 text-red-700 border border-red-200",
          iconClass: "text-red-600",
        };

      default:
        return {
          icon: Activity,
          badgeClass: "bg-gray-50 text-gray-700 border border-gray-200",
          iconClass: "text-gray-600",
        };
    }
  };

  const getActionIcon = (action) => {
    const a = String(action || "").toLowerCase();

    if (
      a.includes("login") ||
      a.includes("password") ||
      a.includes("otp") ||
      a.includes("verif")
    ) {
      return ShieldCheck;
    }

    if (
      a.includes("backup") ||
      a.includes("report") ||
      a.includes("scheduled")
    ) {
      return Database;
    }

    if (a.includes("approved") || a.includes("rejected")) {
      return ClipboardList;
    }

    if (a.includes("user") || a.includes("owner")) {
      return Users;
    }

    return Activity;
  };

  const hasActiveFilters =
    searchTerm ||
    dateFilter !== "All Dates" ||
    userFilter !== "All Users" ||
    actionFilter !== "All Actions" ||
    moduleFilter !== "All Modules" ||
    statusFilter !== "All Status";

  /* ---------------------------------------------------------------------- */
  /* SIDEBAR                                                                 */
  /* ---------------------------------------------------------------------- */

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-[72px] items-center border-b border-gray-200 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Building2 size={22} strokeWidth={2.2} />
          </div>

          <div>
            <h1 className="text-[17px] font-semibold text-gray-900">
              HostelAdmin
            </h1>
            <p className="text-xs text-gray-500">Administration Panel</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="ml-auto rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        <div className="mb-7">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Management
          </p>

          <div className="mt-2 space-y-1">
            {managementItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavigation(item.path)}
                  className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                >
                  <Icon
                    size={18}
                    strokeWidth={2}
                    className="text-gray-500 group-hover:text-gray-700"
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-7">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Analytics & Reports
          </p>

          <div className="mt-2 space-y-1">
            {analyticsItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavigation(item.path)}
                  className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                >
                  <Icon
                    size={18}
                    strokeWidth={2}
                    className="text-gray-500 group-hover:text-gray-700"
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            System
          </p>

          <div className="mt-2 space-y-1">
            {systemItems.map((item) => {
              const Icon = item.icon;

              const isActive = item.label === "Audit Logs";

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavigation(item.path)}
                  className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={2}
                    className={
                      isActive
                        ? "text-blue-600"
                        : "text-gray-500 group-hover:text-gray-700"
                    }
                  />

                  <span>{item.label}</span>

                  {isActive && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 p-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
        >
          <ExternalLink size={18} />
          <span>View Website</span>
        </button>

        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-700"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] border-r border-gray-200 lg:block">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[250px] transform border-r border-gray-200 bg-white transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderSidebarContent()}
      </aside>

      {/* Main */}
      <div className="lg:pl-[240px]">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-[72px] border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="flex h-full items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu size={21} />
              </button>

              <div className="hidden text-sm text-gray-500 sm:block">
                Admin /{" "}
                <span className="font-medium text-gray-900">Audit Logs</span>
              </div>

              <div className="sm:hidden">
                <p className="text-sm font-semibold text-gray-900">
                  Audit Logs
                </p>
              </div>

              {/* Live refresh indicator */}
              <div
                className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600"
                title="Audit logs refresh automatically every 15 seconds"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    refreshing
                      ? "bg-amber-500 animate-pulse"
                      : "bg-emerald-500"
                  }`}
                />
                {refreshing ? "Updating" : "Live"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="relative rounded-lg p-2.5 text-gray-600 transition hover:bg-gray-100"
                aria-label="Notifications"
              >
                <Bell size={19} />

                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-gray-50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                    <UserCircle size={23} />
                  </div>

                  <div className="hidden text-left md:block">
                    <p className="text-sm font-semibold text-gray-800">
                      Admin
                    </p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>

                  <ChevronDown
                    size={16}
                    className={`hidden text-gray-500 transition md:block ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 w-52 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
                    <button
                      type="button"
                      onClick={() => navigate("/admin/profile")}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <UserCircle size={17} />
                      My Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/admin/system-settings")}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <SettingsIcon size={17} />
                      Settings
                    </button>

                    <div className="my-1 border-t border-gray-100" />

                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/");
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={17} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1600px]">
            {/* Page Heading */}
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                  <ClipboardList size={17} />
                  <span>System Activity</span>
                </div>

                <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
                  Audit Logs
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Monitor and review important actions performed across the
                  admin system.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={loading || refreshing}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
                >
                  <RefreshCw
                    size={17}
                    className={loading || refreshing ? "animate-spin" : ""}
                  />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                >
                  <Download size={17} />
                  Export Logs
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {/* Total Activities */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Activities
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      {totalActivities.toLocaleString("en-IN")}
                    </p>

                    <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <Activity size={14} />
                      <span>
                        {totalDeltaPercent != null
                          ? `${Math.abs(totalDeltaPercent)}% this month`
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Activity size={20} />
                  </div>
                </div>
              </div>

              {/* Today */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Today
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      {todayCount}
                    </p>

                    <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <TrendingUpIcon />
                      <span>
                        {todayDeltaPercent != null
                          ? `${Math.abs(todayDeltaPercent)}% vs yesterday`
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Clock size={20} />
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Security Events
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      {securityEvents}
                    </p>

                    <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600">
                      <ShieldCheck size={14} />
                      <span>
                        {securityDeltaPercent != null
                          ? `${Math.abs(securityDeltaPercent)}% this month`
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <ShieldCheck size={20} />
                  </div>
                </div>
              </div>

              {/* Failed */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Failed Actions
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      {failedCount}
                    </p>

                    <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <ChevronDown size={14} />
                      <span>
                        {failedDeltaPercent != null
                          ? `${Math.abs(failedDeltaPercent)}% this month`
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <XCircle size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Search + Filter Card */}
            <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative min-w-0 flex-1">
                    <Search
                      size={18}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) =>
                        handleSearchChange(e.target.value)
                      }
                      placeholder="Search by user, action, hostel, IP address..."
                      className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowFilters((prev) => !prev)}
                      className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                        showFilters
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Filter size={17} />
                      Filters
                    </button>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      >
                        <RotateCcw size={16} />
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {showFilters && (
                <div className="px-5 py-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                    <FilterSelect
                      label="Date Range"
                      icon={CalendarDays}
                      value={dateFilter}
                      onChange={handleFilterChange(setDateFilter)}
                      options={["All Dates", "Today", "Yesterday"]}
                    />

                    <FilterSelect
                      label="User"
                      icon={UserCircle}
                      value={userFilter}
                      onChange={handleFilterChange(setUserFilter)}
                      options={[
                        "All Users",
                        "Administrators",
                        "Hostel Owners",
                        "End Users",
                        "System",
                      ]}
                    />

                    <FilterSelect
                      label="Action"
                      icon={Activity}
                      value={actionFilter}
                      onChange={handleFilterChange(setActionFilter)}
                      options={actionOptions}
                    />

                    <FilterSelect
                      label="Module"
                      icon={Building2}
                      value={moduleFilter}
                      onChange={handleFilterChange(setModuleFilter)}
                      options={moduleOptions}
                    />

                    <FilterSelect
                      label="Status"
                      icon={CheckCircle2}
                      value={statusFilter}
                      onChange={handleFilterChange(setStatusFilter)}
                      options={[
                        "All Status",
                        "Success",
                        "Warning",
                        "Failed",
                      ]}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Results Info */}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Activity History
                </h3>

                <p className="mt-0.5 text-sm text-gray-500">
                  Showing {filteredLogs.length} matching audit events
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>
                  Success{" "}
                  <span className="font-semibold text-emerald-600">
                    {successCount}
                  </span>
                </span>

                <span>
                  Warning{" "}
                  <span className="font-semibold text-amber-600">
                    {warningCount}
                  </span>
                </span>

                <span>
                  Failed{" "}
                  <span className="font-semibold text-red-600">
                    {failedCount}
                  </span>
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {loading ? (
                <div className="flex items-center justify-center gap-3 py-20 text-sm text-gray-500">
                  <Loader2 size={18} className="animate-spin text-blue-600" />
                  Loading audit logs...
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-[1050px] w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/80">
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Date & Time
                          </th>

                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            User
                          </th>

                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Action
                          </th>

                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Module
                          </th>

                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Target
                          </th>

                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            IP Address
                          </th>

                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Status
                          </th>

                          <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {paginatedLogs.length > 0 ? (
                          paginatedLogs.map((log) => {
                            const statusConfig = getStatusConfig(log.status);
                            const StatusIcon = statusConfig.icon;
                            const ActionIcon = getActionIcon(log.action);

                            return (
                              <tr
                                key={log.id}
                                className="transition hover:bg-gray-50/70"
                              >
                                {/* Date */}
                                <td className="px-5 py-4 align-top">
                                  <div className="flex items-start gap-2.5">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                                      <Clock size={16} />
                                    </div>

                                    <div>
                                      <p className="text-sm font-medium text-gray-800">
                                        {log.time}
                                      </p>

                                      <p className="mt-0.5 text-xs text-gray-500">
                                        {log.date}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                {/* User */}
                                <td className="px-5 py-4 align-top">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                                      {String(log.user || "?")
                                        .split(" ")
                                        .map((word) => word[0])
                                        .join("")
                                        .slice(0, 2)
                                        .toUpperCase()}
                                    </div>

                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-semibold text-gray-800">
                                        {log.user}
                                      </p>

                                      <p className="mt-0.5 text-xs text-gray-500">
                                        {log.role}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                {/* Action */}
                                <td className="px-5 py-4 align-top">
                                  <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-600">
                                      <ActionIcon size={16} />
                                    </div>

                                    <span className="text-sm font-medium text-gray-800">
                                      {log.action}
                                    </span>
                                  </div>
                                </td>

                                {/* Module */}
                                <td className="px-5 py-4 align-top">
                                  <span className="inline-flex rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600">
                                    {log.module}
                                  </span>
                                </td>

                                {/* Target */}
                                <td className="px-5 py-4 align-top">
                                  <p className="max-w-[190px] truncate text-sm font-medium text-gray-800">
                                    {log.target}
                                  </p>

                                  <p className="mt-0.5 text-xs text-gray-500">
                                    {log.targetId}
                                  </p>
                                </td>

                                {/* IP */}
                                <td className="px-5 py-4 align-top">
                                  <div className="flex items-center gap-1.5">
                                    <Globe
                                      size={15}
                                      className="text-gray-400"
                                    />

                                    <span className="font-mono text-xs text-gray-600">
                                      {log.ip}
                                    </span>
                                  </div>
                                </td>

                                {/* Status */}
                                <td className="px-5 py-4 align-top">
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold ${statusConfig.badgeClass}`}
                                  >
                                    <StatusIcon
                                      size={14}
                                      className={statusConfig.iconClass}
                                    />
                                    {log.status}
                                  </span>
                                </td>

                                {/* View */}
                                <td className="px-5 py-4 align-top text-right">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedLog(log)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                  >
                                    <Eye size={15} />
                                    View
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="8" className="px-6 py-16">
                              <div className="mx-auto max-w-md text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                                  <ClipboardList size={28} />
                                </div>

                                <h4 className="mt-4 text-base font-semibold text-gray-900">
                                  No audit logs found
                                </h4>

                                <p className="mt-1.5 text-sm text-gray-500">
                                  Try changing your search or filter criteria.
                                </p>

                                <button
                                  type="button"
                                  onClick={clearFilters}
                                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                  <RotateCcw size={16} />
                                  Clear Filters
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-500">
                      Showing{" "}
                      <span className="font-medium text-gray-800">
                        {filteredLogs.length === 0
                          ? 0
                          : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}
                      </span>{" "}
                      –{" "}
                      <span className="font-medium text-gray-800">
                        {Math.min(
                          safeCurrentPage * ITEMS_PER_PAGE,
                          filteredLogs.length
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium text-gray-800">
                        {filteredLogs.length}
                      </span>{" "}
                      logs
                    </p>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={safeCurrentPage === 1}
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Previous page"
                      >
                        <ChevronLeft size={17} />
                      </button>

                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                      )
                        .slice(0, 5)
                        .map((page) => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition ${
                              safeCurrentPage === page
                                ? "bg-blue-600 text-white"
                                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                      {totalPages > 5 && (
                        <>
                          <span className="px-1 text-gray-400">...</span>

                          <button
                            type="button"
                            onClick={() => setCurrentPage(totalPages)}
                            className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium transition ${
                              safeCurrentPage === totalPages
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        disabled={safeCurrentPage === totalPages}
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Next page"
                      >
                        <ChevronRight size={17} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* DETAIL DRAWER                                                       */}
      {/* ------------------------------------------------------------------ */}

      {selectedLog && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
            onClick={() => setSelectedLog(null)}
          />

          <aside className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Audit Event
                </p>

                <h3 className="mt-1 text-lg font-semibold text-gray-900">
                  Log Details
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="border-b border-gray-100 px-5 py-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Activity size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-semibold text-gray-900">
                      {selectedLog.action}
                    </h4>

                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      {selectedLog.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  {(() => {
                    const config = getStatusConfig(selectedLog.status);
                    const StatusIcon = config.icon;

                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${config.badgeClass}`}
                      >
                        <StatusIcon
                          size={14}
                          className={config.iconClass}
                        />
                        {selectedLog.status}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div className="px-5 py-5">
                <DetailRow
                  icon={UserCircle}
                  label="Performed By"
                  value={selectedLog.user}
                  subValue={selectedLog.role}
                />

                <DetailRow
                  icon={Clock}
                  label="Date & Time"
                  value={`${selectedLog.date} · ${selectedLog.time}`}
                />

                <DetailRow
                  icon={Building2}
                  label="Module"
                  value={selectedLog.module}
                />

                <DetailRow
                  icon={ExternalLink}
                  label="Target"
                  value={selectedLog.target}
                  subValue={selectedLog.targetId}
                />

                <DetailRow
                  icon={Globe}
                  label="IP Address"
                  value={selectedLog.ip}
                  mono
                />

                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Changes
                  </p>

                  <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm leading-6 text-gray-700">
                      {selectedLog.changes || "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 px-5 py-5">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <ShieldCheck size={15} />
                  <span>
                    This event is stored as part of the system audit trail.
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-4">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* FILTER SELECT COMPONENT                                                    */
/* -------------------------------------------------------------------------- */

const FilterSelect = ({
  label,
  icon: Icon,
  value,
  onChange,
  options,
}) => {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </label>

      <div className="relative">
        <Icon
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white pl-9 pr-9 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* DETAIL ROW                                                                 */
/* -------------------------------------------------------------------------- */

const DetailRow = ({
  icon: Icon,
  label,
  value,
  subValue,
  mono = false,
}) => {
  return (
    <div className="mb-5 flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </p>

        <p
          className={`mt-1 text-sm font-medium text-gray-800 ${
            mono ? "font-mono" : ""
          }`}
        >
          {value}
        </p>

        {subValue && (
          <p className="mt-0.5 text-xs text-gray-500">{subValue}</p>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* SMALL ICON                                                                  */
/* -------------------------------------------------------------------------- */

const TrendingUpIcon = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
  >
    <path
      d="M3.75 13.75L7.08333 10.4167L9.58333 12.9167L16.25 6.25"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.9167 6.25H16.25V9.58333"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default AuditLogs;