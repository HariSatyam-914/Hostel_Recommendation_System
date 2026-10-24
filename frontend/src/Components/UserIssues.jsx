import React, { useEffect, useMemo, useState } from "react";

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
  ChevronDown,
  Building,
  Menu,
  MessageSquareWarning,
  Gem,
  Filter,
  Eye,
  MoreHorizontal,
  Flag,
  AlertCircle,
  CheckCircle2,
  Clock3,
  XCircle,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  MessageCircle,
  CircleAlert,
  UserRound,
  FileWarning,
} from "lucide-react";

const API_BASE =
  (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(
    /\/$/,
    ""
  );

const apiUrl = (path) => `${API_BASE}${path}`;

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt") ||
    localStorage.getItem("jwtToken");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

const titleCase = (value) => {
  if (!value) return "—";

  return String(value)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const normalizeIssue = (issue = {}) => {
  return {
    ...issue,

    id: issue.id ?? issue.issueId ?? null,

    issueId:
      issue.issueId ??
      issue.id ??
      "—",

    subject:
      issue.subject ??
      issue.title ??
      "Reported issue",

    description:
      issue.description ??
      "",

    reportedBy:
      issue.userName ??
      issue.reportedBy ??
      issue.user?.name ??
      "User",

    reportedByEmail:
      issue.userEmail ??
      issue.reportedByEmail ??
      issue.user?.email ??
      "",

    hostel:
      issue.hostelName ??
      issue.hostel ??
      "—",

    hostelId:
      issue.hostelId ??
      issue.hostel?.id ??
      null,

    category:
      issue.category ??
      "OTHER",

    priority:
      issue.priority ??
      "MEDIUM",

    status:
      issue.status ??
      "OPEN",

    createdAt:
      issue.createdAt ??
      issue.reportedAt ??
      null,

    updatedAt:
      issue.updatedAt ??
      null,

    resolvedAt:
      issue.resolvedAt ??
      null,

    responses:
      Array.isArray(issue.responses)
        ? issue.responses
        : [],

    attachments:
      Array.isArray(issue.attachments)
        ? issue.attachments
        : [],
  };
};

const UserIssues = () => {
  // ============================================================
  // STATE
  // ============================================================

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [priorityFilter, setPriorityFilter] =
    useState("All Priority");

  const [categoryFilter, setCategoryFilter] =
    useState("All Categories");

  const [openMenu, setOpenMenu] =
    useState(null);

  const [issues, setIssues] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  // NEW: Profile dropdown state
  const [profileOpen, setProfileOpen] =
    useState(false);

  const navigate = useNavigate();

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("jwt");
    localStorage.removeItem("jwtToken");

    // Close dropdown before navigation
    setProfileOpen(false);

    navigate("/");
  };

  // ============================================================
  // LOAD ADMIN ISSUES
  // ============================================================

  const loadIssues = async () => {
    try {
      setError("");

      const response = await fetch(
        apiUrl("/api/admin/issues"),
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...getAuthHeaders(),
          },
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          "You are not authorized to view admin issues."
        );
      }

      if (!response.ok) {
        throw new Error(
          `Unable to load admin issues (${response.status}).`
        );
      }

      const data = await response.json();

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.issues)
        ? data.issues
        : Array.isArray(data?.content)
        ? data.content
        : [];

      setIssues(
        items.map(normalizeIssue)
      );
    } catch (err) {
      console.error(
        "Failed to load admin issues:",
        err
      );

      setIssues([]);

      setError(
        err?.message ||
          "Unable to load user issues right now."
      );
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadInitialIssues = async () => {
      try {
        setLoading(true);

        await loadIssues();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadInitialIssues();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setOpenMenu(null);

      await loadIssues();
    } finally {
      setRefreshing(false);
    }
  };

  // ============================================================
  // NAVIGATION ITEM
  // ============================================================

  const NavItem = ({
    icon: Icon,
    label,
    active,
    onClick,
  }) => (
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
          active
            ? "text-white"
            : "text-slate-500"
        }`}
      />

      {sidebarOpen && (
        <span>{label}</span>
      )}
    </button>
  );

  // ============================================================
  // STATUS BADGE
  // ============================================================

  const StatusBadge = ({
    status,
  }) => {
    const normalized =
      String(status || "").toUpperCase();

    const config = {
      OPEN: {
        icon: AlertCircle,
        classes:
          "bg-amber-50 text-amber-700 border-amber-200",
      },

      OWNER_REVIEW: {
        icon: Clock3,
        classes:
          "bg-blue-50 text-blue-700 border-blue-200",
      },

      OWNER_RESPONDED: {
        icon: MessageCircle,
        classes:
          "bg-purple-50 text-purple-700 border-purple-200",
      },

      ADMIN_REVIEW: {
        icon: ShieldCheck,
        classes:
          "bg-indigo-50 text-indigo-700 border-indigo-200",
      },

      RESOLVED: {
        icon: CheckCircle2,
        classes:
          "bg-emerald-50 text-emerald-700 border-emerald-200",
      },

      REJECTED: {
        icon: XCircle,
        classes:
          "bg-rose-50 text-rose-700 border-rose-200",
      },

      CLOSED: {
        icon: CheckCircle2,
        classes:
          "bg-slate-50 text-slate-600 border-slate-200",
      },
    };

    const item =
      config[normalized] || {
        icon: CircleAlert,
        classes:
          "bg-slate-50 text-slate-600 border-slate-200",
      };

    const Icon = item.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${item.classes}`}
      >
        <Icon className="w-3.5 h-3.5" />

        {titleCase(status)}
      </span>
    );
  };

  // ============================================================
  // PRIORITY BADGE
  // ============================================================

  const PriorityBadge = ({
    priority,
  }) => {
    const normalized =
      String(priority || "").toUpperCase();

    const config = {
      LOW: {
        classes:
          "bg-slate-50 text-slate-600 border-slate-200",
      },

      MEDIUM: {
        classes:
          "bg-blue-50 text-blue-700 border-blue-200",
      },

      HIGH: {
        classes:
          "bg-amber-50 text-amber-700 border-amber-200",
      },

      CRITICAL: {
        classes:
          "bg-rose-50 text-rose-700 border-rose-200",
      },
    };

    const item =
      config[normalized] || {
        classes:
          "bg-slate-50 text-slate-500 border-slate-200",
      };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${item.classes}`}
      >
        {titleCase(priority)}
      </span>
    );
  };

  // ============================================================
  // CATEGORY LIST
  // ============================================================

  const categories = useMemo(() => {
    const unique = new Set();

    issues.forEach((issue) => {
      if (issue.category) {
        unique.add(issue.category);
      }
    });

    return Array.from(unique);
  }, [issues]);

  // ============================================================
  // FILTERING
  // ============================================================

  const filteredIssues = useMemo(() => {
    const search =
      searchTerm
        .trim()
        .toLowerCase();

    return issues.filter(
      (issue) => {
        const subject =
          String(
            issue.subject || ""
          ).toLowerCase();

        const issueId =
          String(
            issue.issueId || ""
          ).toLowerCase();

        const reportedBy =
          String(
            issue.reportedBy || ""
          ).toLowerCase();

        const hostel =
          String(
            issue.hostel || ""
          ).toLowerCase();

        const description =
          String(
            issue.description || ""
          ).toLowerCase();

        const matchesSearch =
          !search ||
          subject.includes(search) ||
          issueId.includes(search) ||
          reportedBy.includes(search) ||
          hostel.includes(search) ||
          description.includes(search);

        const matchesStatus =
          statusFilter ===
            "All Status" ||
          issue.status ===
            statusFilter;

        const matchesPriority =
          priorityFilter ===
            "All Priority" ||
          issue.priority ===
            priorityFilter;

        const matchesCategory =
          categoryFilter ===
            "All Categories" ||
          issue.category ===
            categoryFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority &&
          matchesCategory
        );
      }
    );
  }, [
    issues,
    searchTerm,
    statusFilter,
    priorityFilter,
    categoryFilter,
  ]);

  // ============================================================
  // SUMMARY COUNTS
  // ============================================================

  const totalIssues =
    issues.length;

  const openIssues =
    issues.filter(
      (issue) =>
        issue.status ===
        "OPEN"
    ).length;

  const inProgressIssues =
    issues.filter(
      (issue) =>
        issue.status ===
          "OWNER_REVIEW" ||
        issue.status ===
          "OWNER_RESPONDED" ||
        issue.status ===
          "ADMIN_REVIEW"
    ).length;

  const resolvedIssues =
    issues.filter(
      (issue) =>
        issue.status ===
          "RESOLVED" ||
        issue.status ===
          "CLOSED"
    ).length;

  const escalatedIssues =
    issues.filter(
      (issue) =>
        issue.status ===
        "ADMIN_REVIEW"
    ).length;

  // ============================================================
  // SUMMARY CARD
  // ============================================================

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
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}
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
          {value}
        </h3>

        <p className="text-xs text-slate-400 mt-1">
          {subtitle}
        </p>
      </div>
    </div>
  );

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading user issues...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased overflow-hidden">

      {/* SIDEBAR */}

      <aside
        className={`fixed top-0 left-0 h-screen ${
          sidebarOpen
            ? "w-64"
            : "w-20"
        } transition-all duration-300 bg-white border-r border-slate-200 flex flex-col justify-between z-30`}
      >
        <div>

          {/* LOGO */}

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

          {/* NAVIGATION */}

          <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-180px)]">

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

            <div>
              {sidebarOpen && (
                <p className="px-3 text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2">
                  Management
                </p>
              )}

              <nav className="space-y-1">

                <NavItem
                  icon={Building2}
                  label="Hostel Management"
                  onClick={() =>
                    navigate(
                      "/admin/hostel-management"
                    )
                  }
                />

                <NavItem
                  icon={Clock}
                  label="Pending Approvals"
                  onClick={() =>
                    navigate(
                      "/admin/pending-approvals/:hostel-id"
                    )
                  }
                />

                <NavItem
                  icon={RefreshCw}
                  label="Reupload Review"
                  onClick={() =>
                    navigate(
                      "/admin/reupload"
                    )
                  }
                />

                <NavItem
                  icon={MessageSquareWarning}
                  label="User Issues"
                  active
                  onClick={() =>
                    navigate(
                      "/admin/user-issues"
                    )
                  }
                />

                <NavItem
                  icon={ShieldCheck}
                  label="Owner Verification"
                  onClick={() =>
                    navigate(
                      "/admin/owner-verification"
                    )
                  }
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
                    onClick={() =>
                    navigate("/admin/analytics")
                  }
                />

                <NavItem
                                  icon={Gem}
                                  label="Subscription"
                                  onClick={() =>
                                    navigate(
                                      "/admin/subscription"
                                    )
                                  }
                                />

                <NavItem
                                  icon={FileText}
                                  label="Reports"
                                  onClick={() =>
                                    navigate("/admin/reports")
                                  }
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
                  onClick={
                    () =>navigate("/admin/users")
                  }
                />

                <NavItem
                  icon={Settings}
                  label="System Settings"
                  onClick={()=>navigate("/admin/settings")}
                />

                <NavItem
                  icon={History}
                  label="Audit Logs"
                />

              </nav>
            </div>

          </div>
        </div>

        {/* SIDEBAR FOOTER */}

        <div className="p-3 border-t border-slate-100 space-y-2">

          {sidebarOpen && (
            <button
              type="button"
              className="w-full py-2.5 px-3 border border-blue-200 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2 mb-2"
            >
              <FileText className="w-4 h-4" />
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

      {/* MAIN CONTENT */}

      <div
        className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${
          sidebarOpen
            ? "ml-64"
            : "ml-20"
        }`}
      >

        {/* TOP NAVBAR */}

        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">

          <div className="flex items-center gap-4 flex-1 max-w-xl">

            <button
              type="button"
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
                placeholder="Search issue, user, hostel..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
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
              type="button"
              className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition"
            >
              <Moon className="w-6 h-6" />
            </button>

            <div className="h-6 w-px bg-slate-200" />

            {/* PROFILE DROPDOWN */}

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setProfileOpen(
                    !profileOpen
                  )
                }
                className="flex items-center gap-3 pl-2 cursor-pointer rounded-xl hover:bg-slate-50 transition px-2 py-1.5"
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
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    profileOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />

              </button>

              {/* DROPDOWN MENU */}

              {profileOpen && (
                <div className="absolute right-0 top-14 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2">

                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800">
                      Admin User
                    </p>

                    <p className="text-xs text-slate-400 mt-0.5">
                      Super Admin
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>

                </div>
              )}

            </div>

          </div>
        </header>

        {/* PAGE CONTENT */}

        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* PAGE HEADER */}

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

            <div>

              <div className="flex items-center gap-2">

                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                  User Issues
                </h2>

                {issues.length > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-xs font-semibold">
                    {issues.length} Issues
                  </span>
                )}

              </div>

              <p className="text-sm text-slate-500 mt-1">
                Review and manage issues reported by platform users.
              </p>

            </div>

            <div className="flex items-center gap-2.5">

              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
              >
                <Calendar className="w-4 h-4 text-slate-400" />

                <span>
                  Current Period
                </span>

                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700 transition disabled:opacity-60"
              >

                <RefreshCw
                  className={`w-4 h-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}

              </button>

            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* SUMMARY CARDS */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

            <SummaryCard
              title="Total Issues"
              value={totalIssues}
              subtitle="All reported issues"
              icon={MessageSquareWarning}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />

            <SummaryCard
              title="Open"
              value={openIssues}
              subtitle="Waiting for review"
              icon={AlertCircle}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
            />

            <SummaryCard
              title="In Progress"
              value={inProgressIssues}
              subtitle="Currently being handled"
              icon={Clock3}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />

            <SummaryCard
              title="Resolved"
              value={resolvedIssues}
              subtitle="Completed issues"
              icon={CheckCircle2}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
            />

            <SummaryCard
              title="Escalated"
              value={escalatedIssues}
              subtitle="Admin review required"
              icon={Flag}
              iconBg="bg-orange-50"
              iconColor="text-orange-600"
            />

          </div>

          {/* ISSUES TABLE CARD */}

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

            {/* TABLE HEADER */}

            <div className="p-5 border-b border-slate-200">

              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">

                <div>

                  <h3 className="text-base font-semibold text-slate-900">
                    Reported Issues
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    Review issues submitted by users and track their resolution.
                  </p>

                </div>

                <div className="flex flex-wrap items-center gap-2">

                  {/* Search */}

                  <div className="relative">

                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                    <input
                      type="text"
                      placeholder="Search issues..."
                      value={searchTerm}
                      onChange={(e) =>
                        setSearchTerm(
                          e.target.value
                        )
                      }
                      className="w-56 pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />

                  </div>

                  {/* Status */}

                  <div className="relative">

                    <select
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(
                          e.target.value
                        )
                      }
                      className="appearance-none pl-9 pr-8 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >

                      <option>
                        All Status
                      </option>

                      <option value="OPEN">
                        Open
                      </option>

                      <option value="OWNER_REVIEW">
                        Owner Review
                      </option>

                      <option value="OWNER_RESPONDED">
                        Owner Responded
                      </option>

                      <option value="ADMIN_REVIEW">
                        Admin Review
                      </option>

                      <option value="RESOLVED">
                        Resolved
                      </option>

                      <option value="REJECTED">
                        Rejected
                      </option>

                      <option value="CLOSED">
                        Closed
                      </option>

                    </select>

                    <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                  </div>

                  {/* Priority */}

                  <select
                    value={priorityFilter}
                    onChange={(e) =>
                      setPriorityFilter(
                        e.target.value
                      )
                    }
                    className="appearance-none px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >

                    <option>
                      All Priority
                    </option>

                    <option value="LOW">
                      Low
                    </option>

                    <option value="MEDIUM">
                      Medium
                    </option>

                    <option value="HIGH">
                      High
                    </option>

                    <option value="CRITICAL">
                      Critical
                    </option>

                  </select>

                  {/* Category */}

                  <select
                    value={categoryFilter}
                    onChange={(e) =>
                      setCategoryFilter(
                        e.target.value
                      )
                    }
                    className="appearance-none px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >

                    <option>
                      All Categories
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {titleCase(
                            category
                          )}
                        </option>
                      )
                    )}

                  </select>

                  <button
                    type="button"
                    className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"
                    title="More filters"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>

                </div>

              </div>
            </div>

            {/* TABLE */}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px]">

                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">

                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Issue
                    </th>

                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Reported By
                    </th>

                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Related Hostel
                    </th>

                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Category
                    </th>

                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Priority
                    </th>

                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Status
                    </th>

                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Created
                    </th>

                    <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredIssues.map(
                    (issue) => (
                      <tr
                        key={issue.id}
                        className="border-b border-slate-100 hover:bg-slate-50/70 transition"
                      >

                        {/* Issue */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                              <MessageCircle className="w-5 h-5" />
                            </div>

                            <div>

                              <p className="text-sm font-semibold text-slate-800">
                                {issue.subject}
                              </p>

                              <p className="text-xs text-slate-400 mt-0.5">
                                #{issue.issueId}
                              </p>

                            </div>

                          </div>
                        </td>

                        {/* Reported By */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                              <UserRound className="w-3.5 h-3.5 text-slate-500" />
                            </div>

                            <div>

                              <span className="text-sm text-slate-700">
                                {issue.reportedBy}
                              </span>

                              {issue.reportedByEmail && (
                                <div className="text-[11px] text-slate-400">
                                  {issue.reportedByEmail}
                                </div>
                              )}

                            </div>

                          </div>
                        </td>

                        {/* Hostel */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2 text-sm text-slate-600">

                            <Building2 className="w-4 h-4 text-slate-400" />

                            {issue.hostel}

                          </div>
                        </td>

                        {/* Category */}

                        <td className="px-5 py-4">

                          <span className="text-sm text-slate-600">
                            {titleCase(
                              issue.category
                            )}
                          </span>

                        </td>

                        {/* Priority */}

                        <td className="px-5 py-4">

                          <PriorityBadge
                            priority={
                              issue.priority
                            }
                          />

                        </td>

                        {/* Status */}

                        <td className="px-5 py-4">

                          <StatusBadge
                            status={
                              issue.status
                            }
                          />

                        </td>

                        {/* Created */}

                        <td className="px-5 py-4">

                          <span className="text-sm text-slate-500">
                            {formatDate(
                              issue.createdAt
                            )}
                          </span>

                        </td>

                        {/* Actions */}

                        <td className="px-5 py-4">

                          <div className="flex items-center justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/issues/${issue.id}`
                                )
                              }
                              className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                              title="View Issue"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <div className="relative">

                              <button
                                type="button"
                                onClick={() =>
                                  setOpenMenu(
                                    openMenu ===
                                      issue.id
                                      ? null
                                      : issue.id
                                  )
                                }
                                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>

                              {openMenu ===
                                issue.id && (
                                <div className="absolute right-0 top-10 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigate(
                                        `/admin/issues/${issue.id}`
                                      )
                                    }
                                    className="w-full px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                                  >
                                    View Details
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigate(
                                        `/admin/issues/${issue.id}`
                                      )
                                    }
                                    className="w-full px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                                  >
                                    Review Issue
                                  </button>

                                </div>
                              )}

                            </div>

                          </div>
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

              {/* EMPTY STATE */}

              {filteredIssues.length ===
                0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center">

                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                    <FileWarning className="w-7 h-7" />
                  </div>

                  <p className="text-sm font-semibold text-slate-700">

                    {issues.length ===
                    0
                      ? "No user issues reported"
                      : "No issues match your filters"}

                  </p>

                  <p className="text-xs text-slate-400 mt-1 max-w-sm">

                    {issues.length ===
                    0
                      ? "Reported issues will appear here once users submit them."
                      : "Try changing the search or filter values."}

                  </p>

                </div>
              )}

            </div>

            {/* PAGINATION */}

            {filteredIssues.length >
              0 && (
              <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">

                <p className="text-xs text-slate-400">

                  Showing{" "}

                  <span className="font-semibold text-slate-600">
                    1
                  </span>

                  {" "}to{" "}

                  <span className="font-semibold text-slate-600">
                    {filteredIssues.length}
                  </span>

                  {" "}of{" "}

                  <span className="font-semibold text-slate-600">
                    {issues.length}
                  </span>

                  {" "}issues

                </p>

                <div className="flex items-center gap-1">

                  <button
                    type="button"
                    disabled
                    className="p-2 border border-slate-200 rounded-lg text-slate-400"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    className="w-8 h-8 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                  >
                    1
                  </button>

                  <button
                    type="button"
                    disabled
                    className="p-2 border border-slate-200 rounded-lg text-slate-400"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                </div>

              </div>
            )}

          </div>

        </main>
      </div>
    </div>
  );
};

export default UserIssues;