import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Building2,
  BedDouble,
  MessageSquare,
  Star,
  BarChart3,
  Settings as SettingsIcon,
  Bell,
  UserCircle,
  ChevronDown,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Users as UsersIcon,
  FileText,
  HelpCircle,
  Search,
  RefreshCw,
  Download,
  Filter,
  MoreHorizontal,
  Eye,
  Edit3,
  UserX,
  UserCheck,
  Ban,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ShieldCheck,
  GraduationCap,
  Building,
  Activity,
  CalendarDays,
  Mail,
  Phone,
  Hash,
  Clock3,
  AlertCircle,
  UserRound,
  UserPlus,
  UserCog,
  CircleDot,
  SlidersHorizontal,
  Check,
  ChevronUp,
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";

import api from "../api/axiosConfig";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const Users = () => {
  const navigate = useNavigate();

  // =========================================================
  // SIDEBAR
  // =========================================================

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  // =========================================================
  // FILTERS
  // =========================================================

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [dateRange, setDateRange] = useState("30d");

  const [showFilters, setShowFilters] =
    useState(false);

  const [showRoleMenu, setShowRoleMenu] =
    useState(false);

  const [showStatusMenu, setShowStatusMenu] =
    useState(false);

  // =========================================================
  // DATA
  // =========================================================

  const [users, setUsers] = useState([]);

  const [summary, setSummary] = useState({
    totalUsers: 0,
    activeUsers: 0,
    students: 0,
    hostelOwners: 0,
  });

  const [activityData, setActivityData] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  // =========================================================
  // PAGINATION
  // =========================================================

  const [page, setPage] = useState(0);

  const [pageSize, setPageSize] =
    useState(10);

  const [totalPages, setTotalPages] =
    useState(0);

  const [totalElements, setTotalElements] =
    useState(0);

  // =========================================================
  // SORT
  // =========================================================

  const [sortBy, setSortBy] =
    useState("createdAt");

  const [sortDirection, setSortDirection] =
    useState("desc");

  // =========================================================
  // USER MODAL
  // =========================================================

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [showUserDetails, setShowUserDetails] =
    useState(false);

  // =========================================================
  // ACTION MENU
  // =========================================================

  const [showActionMenu, setShowActionMenu] =
    useState(null);

  // =========================================================
  // STATUS MODAL
  // =========================================================

  const [showStatusModal, setShowStatusModal] =
    useState(false);

  const [statusAction, setStatusAction] =
    useState(null);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  // =========================================================
  // EXPORT
  // =========================================================

  const [showExportModal, setShowExportModal] =
    useState(false);

  const [exporting, setExporting] =
    useState(false);

  const [exportForm, setExportForm] =
    useState({
      format: "CSV",
      includeBasicInfo: true,
      includeAccountStatus: true,
      includeRegistrationDate: true,
      includeActivity: true,
    });

  // =========================================================
  // FETCH USERS
  // =========================================================

  const fetchUsers = async (
    showRefreshLoader = false
  ) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get(
        "/api/admin/users",
        {
          params: {
            page,
            size: pageSize,
            search:
              search.trim() || undefined,
            role:
              role !== "ALL"
                ? role
                : undefined,
            status:
              status !== "ALL"
                ? status
                : undefined,
            range: dateRange,
            sortBy,
            sortDirection,
          },
        }
      );

      const data =
        response?.data || {};

      const content = Array.isArray(data)
        ? data
        : data.content ||
          data.users ||
          data.data ||
          [];

      setUsers(
        Array.isArray(content)
          ? content
          : []
      );

      if (!Array.isArray(data)) {
        setTotalPages(
          Number(
            data.totalPages ??
              data.pages ??
              0
          )
        );

        setTotalElements(
          Number(
            data.totalElements ??
              data.total ??
              content.length
          )
        );

        const stats =
          data.summary ||
          data.statistics ||
          data.stats;

        if (stats) {
          setSummary({
            totalUsers: Number(
              stats.totalUsers ?? 0
            ),
            activeUsers: Number(
              stats.activeUsers ?? 0
            ),
            students: Number(
              stats.students ?? 0
            ),
            hostelOwners: Number(
              stats.hostelOwners ??
                stats.owners ??
                0
            ),
          });
        }

        setActivityData(
          data.activity ||
            data.userActivity ||
            data.activityData ||
            []
        );
      } else {
        setTotalPages(1);
        setTotalElements(content.length);
      }
    } catch (error) {
      console.error(
        "Failed to fetch users:",
        error
      );

      setUsers([]);

      setSummary({
        totalUsers: 0,
        activeUsers: 0,
        students: 0,
        hostelOwners: 0,
      });

      setActivityData([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // INITIAL / FILTER FETCH
  // =========================================================

  useEffect(() => {
    fetchUsers();
  }, [
    page,
    pageSize,
    role,
    status,
    dateRange,
    sortBy,
    sortDirection,
  ]);

  // =========================================================
  // SEARCH DEBOUNCE
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchUsers();
    }, 500);

    return () =>
      clearTimeout(timer);
  }, [search]);

  // =========================================================
  // NORMALIZE USER
  // =========================================================

  const normalizeUser = (user) => {
    const firstName =
      user?.firstName ?? "";

    const lastName =
      user?.lastName ?? "";

    const combinedName =
      `${firstName} ${lastName}`.trim();

    return {
      id:
        user?.id ??
        user?.userId ??
        user?.uuid ??
        "-",

      name:
        user?.name ??
        user?.fullName ??
        combinedName ??
        "Unknown User",

      email:
        user?.email ??
        user?.emailAddress ??
        "-",

      phone:
        user?.phone ??
        user?.phoneNumber ??
        "-",

      role:
        user?.role ??
        user?.userRole ??
        "USER",

      status:
        user?.status ??
        user?.accountStatus ??
        "ACTIVE",

      createdAt:
        user?.createdAt ??
        user?.registeredAt ??
        user?.registrationDate ??
        null,

      lastActive:
        user?.lastActive ??
        user?.lastLoginAt ??
        user?.lastLogin ??
        null,

      avatar:
        user?.avatar ??
        user?.profileImage ??
        user?.profilePhoto ??
        null,

      ...user,
    };
  };

  const normalizedUsers = useMemo(
    () =>
      users.map(normalizeUser),
    [users]
  );

  // =========================================================
  // SORT
  // =========================================================

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection((prev) =>
        prev === "asc"
          ? "desc"
          : "asc"
      );
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }

    setPage(0);
  };

  // =========================================================
  // USER DETAILS
  // =========================================================

  const handleViewUser = async (
    user
  ) => {
    setShowActionMenu(null);

    try {
      const response =
        await api.get(
          `/api/admin/users/${user.id}`
        );

      setSelectedUser(
        response?.data || user
      );
    } catch (error) {
      console.error(
        "Failed to fetch user details:",
        error
      );

      setSelectedUser(user);
    }

    setShowUserDetails(true);
  };

  // =========================================================
  // EDIT USER
  // =========================================================

  const handleEditUser = (
    user
  ) => {
    setShowActionMenu(null);

    navigate(
      `/admin/users/${user.id}/edit`
    );
  };

  // =========================================================
  // STATUS
  // =========================================================

  const openStatusModal = (
    user,
    action
  ) => {
    setShowActionMenu(null);
    setSelectedUser(user);
    setStatusAction(action);
    setShowStatusModal(true);
  };

  const handleStatusUpdate =
    async () => {
      if (
        !selectedUser ||
        !statusAction
      ) {
        return;
      }

      try {
        setUpdatingStatus(true);

        let newStatus = "ACTIVE";

        if (
          statusAction ===
          "ACTIVATE"
        ) {
          newStatus = "ACTIVE";
        }

        if (
          statusAction ===
          "DEACTIVATE"
        ) {
          newStatus = "INACTIVE";
        }

        if (
          statusAction ===
          "SUSPEND"
        ) {
          newStatus = "SUSPENDED";
        }

        if (
          statusAction ===
          "BLOCK"
        ) {
          newStatus = "BLOCKED";
        }

        await api.patch(
          `/api/admin/users/${selectedUser.id}/status`,
          {
            status: newStatus,
          }
        );

        setShowStatusModal(false);
        setSelectedUser(null);
        setStatusAction(null);

        await fetchUsers(true);
      } catch (error) {
        console.error(
          "Failed to update user status:",
          error
        );
      } finally {
        setUpdatingStatus(false);
      }
    };

  // =========================================================
  // EXPORT
  // =========================================================

  const handleExport =
    async () => {
      try {
        setExporting(true);

        const response =
          await api.get(
            "/api/admin/users/export",
            {
              params: {
                format:
                  exportForm.format,

                search:
                  search.trim() ||
                  undefined,

                role:
                  role !== "ALL"
                    ? role
                    : undefined,

                status:
                  status !== "ALL"
                    ? status
                    : undefined,

                range: dateRange,

                includeBasicInfo:
                  exportForm.includeBasicInfo,

                includeAccountStatus:
                  exportForm.includeAccountStatus,

                includeRegistrationDate:
                  exportForm.includeRegistrationDate,

                includeActivity:
                  exportForm.includeActivity,
              },

              responseType: "blob",
            }
          );

        const blob = new Blob(
          [response.data],
          {
            type:
              response.headers?.[
                "content-type"
              ] ||
              "application/octet-stream",
          }
        );

        const url =
          window.URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href = url;

        link.download =
          `users-${new Date()
            .toISOString()
            .slice(
              0,
              10
            )}.${exportForm.format.toLowerCase()}`;

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        window.URL.revokeObjectURL(
          url
        );

        setShowExportModal(
          false
        );
      } catch (error) {
        console.error(
          "Failed to export users:",
          error
        );
      } finally {
        setExporting(false);
      }
    };

  // =========================================================
  // HELPERS
  // =========================================================

  const formatNumber = (
    value
  ) =>
    Number(
      value || 0
    ).toLocaleString(
      "en-IN"
    );

  const formatDate = (
    value
  ) => {
    if (!value) return "—";

    const date = new Date(
      value
    );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return String(value);
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (
    value
  ) => {
    if (!value) return "—";

    const date = new Date(
      value
    );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return String(value);
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getRoleLabel = (
    roleValue
  ) => {
    const value =
      String(
        roleValue || ""
      ).toUpperCase();

    if (
      value.includes(
        "OWNER"
      )
    ) {
      return "Hostel Owner";
    }

    if (
      value.includes(
        "STUDENT"
      )
    ) {
      return "Student";
    }

    if (
      value.includes(
        "PROFESSIONAL"
      )
    ) {
      return "Professional";
    }

    if (
      value.includes(
        "ADMIN"
      )
    ) {
      return "Admin";
    }

    return "User";
  };

  const getRoleIcon = (
    roleValue
  ) => {
    const value =
      String(
        roleValue || ""
      ).toUpperCase();

    if (
      value.includes(
        "OWNER"
      )
    ) {
      return Building;
    }

    if (
      value.includes(
        "STUDENT"
      )
    ) {
      return GraduationCap;
    }

    if (
      value.includes(
        "PROFESSIONAL"
      )
    ) {
      return UserRound;
    }

    if (
      value.includes(
        "ADMIN"
      )
    ) {
      return ShieldCheck;
    }

    return UsersIcon;
  };

  const getStatusConfig = (
    statusValue
  ) => {
    const value =
      String(
        statusValue || ""
      ).toUpperCase();

    if (
      value ===
      "ACTIVE"
    ) {
      return {
        label: "Active",
        badge:
          "bg-emerald-50 text-emerald-700 border-emerald-100",
        dot:
          "bg-emerald-500",
      };
    }

    if (
      value ===
      "INACTIVE"
    ) {
      return {
        label: "Inactive",
        badge:
          "bg-gray-50 text-gray-600 border-gray-200",
        dot:
          "bg-gray-400",
      };
    }

    if (
      value ===
      "SUSPENDED"
    ) {
      return {
        label: "Suspended",
        badge:
          "bg-amber-50 text-amber-700 border-amber-100",
        dot:
          "bg-amber-500",
      };
    }

    if (
      value ===
      "BLOCKED"
    ) {
      return {
        label: "Blocked",
        badge:
          "bg-red-50 text-red-700 border-red-100",
        dot:
          "bg-red-500",
      };
    }

    return {
      label:
        statusValue ||
        "Unknown",
      badge:
        "bg-gray-50 text-gray-600 border-gray-200",
      dot:
        "bg-gray-400",
    };
  };

  // =========================================================
  // FILTER RESET
  // =========================================================

  const clearFilters = () => {
    setSearch("");
    setRole("ALL");
    setStatus("ALL");
    setDateRange("30d");
    setPage(0);
  };

  const activeFilterCount =
    [
      search.trim(),
      role !== "ALL",
      status !== "ALL",
    ].filter(Boolean)
      .length;

  // =========================================================
  // CHART
  // =========================================================

  const chartLabels =
    activityData.length > 0
      ? activityData.map(
          (item) =>
            item.label ??
            item.date ??
            item.name ??
            ""
        )
      : [];

  const newUsersData =
    activityData.length > 0
      ? activityData.map(
          (item) =>
            Number(
              item.newUsers ??
                item.new ??
                item.count ??
                0
            )
        )
      : [];

  const activeUsersData =
    activityData.length > 0
      ? activityData.map(
          (item) =>
            Number(
              item.activeUsers ??
                item.active ??
                0
            )
        )
      : [];

  const chartData = {
    labels: chartLabels,

    datasets: [
      {
        label: "New Users",
        data: newUsersData,
        borderWidth: 2,
        tension: 0.35,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
      {
        label: "Active Users",
        data: activeUsersData,
        borderWidth: 2,
        tension: 0.35,
        fill: false,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "top",
        align: "end",

        labels: {
          boxWidth: 7,
          boxHeight: 7,
          usePointStyle: true,
          pointStyle: "circle",
          padding: 14,

          font: {
            size: 10,
          },
        },
      },

      tooltip: {
        mode: "index",
        intersect: false,
      },
    },

    interaction: {
      mode: "index",
      intersect: false,
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          font: {
            size: 9,
          },

          color: "#94A3B8",
        },
      },

      y: {
        beginAtZero: true,

        grid: {
          color: "#F1F5F9",
        },

        ticks: {
          font: {
            size: 9,
          },

          color: "#94A3B8",
          precision: 0,
        },
      },
    },
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const managementItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      label: "Hostel Requests",
      icon: Building2,
      path: "/admin/hostel-management",
    },
    {
      label: "Pending Approvals",
      icon: BedDouble,
      path: "/admin/pending-approvals",
    },
    {
      label: "User Issues",
      icon: MessageSquare,
      path: "/admin/user-issues",
    },
    {
      label: "Owner Verification",
      icon: ShieldCheck,
      path: "/admin/owner-verification",
    },
  ];

  const analyticsItems = [
    {
      label: "Analytics",
      icon: BarChart3,
      path: "/admin/analytics",
    },
    {
      label: "Subscription",
      icon: Star,
      path: "/admin/subscription",
    },
    {
      label: "Reports",
      icon: FileText,
      path: "/admin/reports",
    },
  ];

  const systemItems = [
    {
      label: "Users",
      icon: UsersIcon,
      path: "/admin/users",
    },
    {
      label: "System Settings",
      icon: SettingsIcon,
      path: "/admin/settings",
    },
    {
      label: "Audit Logs",
      icon: Activity,
      path: "/admin/audit-logs",
    },
  ];

  const renderNavItem = (
    item
  ) => {
    const Icon = item.icon;

    return (
      <button
        key={item.label}
        onClick={() => {
          navigate(item.path);
          setSidebarOpen(false);
        }}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
          item.path ===
          "/admin/users"
            ? "bg-blue-50 text-[#2161F5]"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        <Icon size={15} />

        <span className="truncate">
          {item.label}
        </span>
      </button>
    );
  };

  // =========================================================
  // KPI CARD
  // =========================================================

  const KpiCard = ({
    title,
    value,
    icon: Icon,
    description,
    subtle,
  }) => {
    return (
      <div className="group rounded-2xl border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
              {title}
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
              {formatNumber(value)}
            </p>

            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-xs text-gray-400">
                {description}
              </span>

              {subtle && (
                <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-600">
                  {subtle}
                </span>
              )}
            </div>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#2161F5] transition group-hover:bg-[#2161F5] group-hover:text-white">
            <Icon size={17} />
          </div>
        </div>
      </div>
    );
  };

  // =========================================================
  // PAGINATION
  // =========================================================

  const paginationStart =
    totalElements === 0
      ? 0
      : page * pageSize + 1;

  const paginationEnd =
    Math.min(
      (page + 1) *
        pageSize,
      totalElements
    );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-gray-900">

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Logo */}

        <div className="flex h-[72px] items-center border-b border-gray-100 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2161F5] text-white shadow-sm">
              <Building2 size={18} />
            </div>

            <div>
              <p className="text-base font-bold tracking-tight text-gray-900">
                HostelHub
              </p>

              <p className="text-xs text-gray-400">
                Admin Portal
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              setSidebarOpen(false)
            }
            className="ml-auto rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 lg:hidden"
          >
            <X size={17} />
          </button>
        </div>

        {/* Navigation */}

        <div className="flex-1 overflow-y-auto px-3 py-5">

          <p className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
            Management
          </p>

          <div className="space-y-1">
            {managementItems.map(
              renderNavItem
            )}
          </div>

          <p className="mb-2 mt-7 px-2 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
            Analytics
          </p>

          <div className="space-y-1">
            {analyticsItems.map(
              renderNavItem
            )}
          </div>

          <p className="mb-2 mt-7 px-2 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
            System
          </p>

          <div className="space-y-1">
            {systemItems.map(
              renderNavItem
            )}
          </div>
        </div>

        {/* Bottom */}

        <div className="border-t border-gray-100 p-3">
          <button
            onClick={() =>
              navigate(
                "/admin/reports"
              )
            }
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <FileText size={15} />
            Generate Reports
          </button>

          <button
            onClick={() =>
              navigate(
                "/admin/user-issues"
              )
            }
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <HelpCircle size={15} />
            Help Center
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="lg:pl-[240px]">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6">

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-50 lg:hidden"
            >
              <Menu size={19} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-gray-900">
                  Users
                </h1>

                <span className="hidden rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-[#2161F5] sm:inline-flex">
                  ADMIN
                </span>
              </div>

              <p className="mt-0.5 text-xs text-gray-400">
                Manage platform users and account access
              </p>
            </div>
          </div>

          {/* Header right */}

          <div className="flex items-center gap-2">

            <button
              className="relative rounded-lg p-2 text-gray-500 transition hover:bg-gray-50"
              title="Notifications"
            >
              <Bell size={17} />

              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>

            <div className="mx-1 hidden h-6 w-px bg-gray-200 sm:block" />

            <div className="relative">

              <button
                onClick={() =>
                  setProfileOpen(
                    (prev) =>
                      !prev
                  )
                }
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-[#2161F5]">
                  <UserCircle
                    size={17}
                  />
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-gray-800">
                    Admin User
                  </p>

                  <p className="text-xs text-gray-400">
                    Super Admin
                  </p>
                </div>

                <ChevronDown
                  size={13}
                  className="text-gray-400"
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">

                  <button
                    onClick={() =>
                      navigate(
                        "/admin/settings"
                      )
                    }
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <SettingsIcon
                      size={14}
                    />
                    Settings
                  </button>

                  <button
                    onClick={() =>
                      navigate("/")
                    }
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <ExternalLink
                      size={14}
                    />
                    View Website
                  </button>

                  <div className="my-1 border-t border-gray-100" />

                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut
                      size={14}
                    />
                    Logout
                  </button>

                </div>
              )}
            </div>
          </div>
        </header>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <main className="p-4 sm:p-6">

          {/* =================================================
              PAGE INTRO
          ================================================= */}

          <section className="mb-5">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#2161F5]">
                    <UsersIcon
                      size={16}
                    />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      User Management
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-400">
                      View, search and manage all registered accounts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">

                <button
                  onClick={() =>
                    fetchUsers(true)
                  }
                  disabled={
                    refreshing
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
                >
                  <RefreshCw
                    size={13}
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Refresh
                </button>

                <button
                  onClick={() =>
                    setShowExportModal(
                      true
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg bg-[#2161F5] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  <Download
                    size={13}
                  />

                  Export
                </button>

              </div>
            </div>
          </section>

          {/* =================================================
              KPI
          ================================================= */}

          <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

            <KpiCard
              title="Total Users"
              value={
                summary.totalUsers
              }
              icon={
                UsersIcon
              }
              description="Registered accounts"
            />

            <KpiCard
              title="Active Users"
              value={
                summary.activeUsers
              }
              icon={
                UserCheck
              }
              description="Currently active"
            />

            <KpiCard
              title="Students"
              value={
                summary.students
              }
              icon={
                GraduationCap
              }
              description="Student accounts"
            />

            <KpiCard
              title="Hostel Owners"
              value={
                summary.hostelOwners
              }
              icon={
                Building
              }
              description="Owner accounts"
            />

          </section>

          {/* =================================================
              ACTIVITY + QUICK STATS
          ================================================= */}

          <section className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_280px]">

            {/* Chart */}

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

              <div className="mb-4 flex items-start justify-between">

                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    User Activity
                  </h3>

                  <p className="mt-0.5 text-xs text-gray-400">
                    Registration and active-user trends
                  </p>
                </div>

                <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5">
                  <CalendarDays
                    size={12}
                    className="text-gray-400"
                  />

                  <span className="text-xs font-medium text-gray-500">
                    {dateRange ===
                    "7d"
                      ? "7 days"
                      : dateRange ===
                        "30d"
                      ? "30 days"
                      : dateRange ===
                        "90d"
                      ? "90 days"
                      : "1 year"}
                  </span>
                </div>

              </div>

              <div className="h-[240px]">

                {activityData.length >
                0 ? (
                  <Line
                    data={
                      chartData
                    }
                    options={
                      chartOptions
                    }
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center rounded-xl bg-gray-50">

                    <Activity
                      size={25}
                      className="text-gray-300"
                    />

                    <p className="mt-2 text-sm font-semibold text-gray-500">
                      No activity data
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Activity will appear when data is available.
                    </p>

                  </div>
                )}

              </div>
            </div>

            {/* Quick overview */}

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

              <div className="mb-4">
                <h3 className="text-base font-bold text-gray-900">
                  User Overview
                </h3>

                <p className="mt-0.5 text-xs text-gray-400">
                  Account distribution
                </p>
              </div>

              <div className="space-y-3">

                <OverviewRow
                  icon={
                    GraduationCap
                  }
                  label="Students"
                  value={
                    summary.students
                  }
                  total={
                    summary.totalUsers
                  }
                />

                <OverviewRow
                  icon={
                    Building
                  }
                  label="Hostel Owners"
                  value={
                    summary.hostelOwners
                  }
                  total={
                    summary.totalUsers
                  }
                />

                <OverviewRow
                  icon={
                    UserCheck
                  }
                  label="Active"
                  value={
                    summary.activeUsers
                  }
                  total={
                    summary.totalUsers
                  }
                />

              </div>

              <div className="mt-5 rounded-xl bg-blue-50 p-3">

                <div className="flex items-start gap-2">

                  <Activity
                    size={14}
                    className="mt-0.5 text-[#2161F5]"
                  />

                  <div>
                    <p className="text-xs font-semibold text-blue-900">
                      Keep an eye on inactive accounts
                    </p>

                    <p className="mt-1 text-xs leading-4 text-blue-700">
                      Regular account reviews help keep your platform clean.
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              FILTER / SEARCH
          ================================================= */}

          <section className="mb-5 rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="p-3 sm:p-4">

              <div className="flex flex-col gap-3 xl:flex-row xl:items-center">

                {/* Search */}

                <div className="relative flex-1">

                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target
                          .value
                      )
                    }
                    placeholder="Search by name, email, phone or user ID..."
                    className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-50"
                  />

                </div>

                {/* Desktop filters */}

                <div className="hidden items-center gap-2 xl:flex">

                  <FilterButton
                    icon={
                      UsersIcon
                    }
                    label={
                      role ===
                      "ALL"
                        ? "All Roles"
                        : getRoleLabel(
                            role
                          )
                    }
                    active={
                      role !==
                      "ALL"
                    }
                    onClick={() =>
                      setShowRoleMenu(
                        (prev) =>
                          !prev
                      )
                    }
                  />

                  <FilterButton
                    icon={
                      CircleDot
                    }
                    label={
                      status ===
                      "ALL"
                        ? "All Statuses"
                        : getStatusConfig(
                            status
                          ).label
                    }
                    active={
                      status !==
                      "ALL"
                    }
                    onClick={() =>
                      setShowStatusMenu(
                        (prev) =>
                          !prev
                      )
                    }
                  />

                  <button
                    onClick={() =>
                      setShowFilters(
                        (prev) =>
                          !prev
                      )
                    }
                    className="flex h-10 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <SlidersHorizontal
                      size={13}
                    />

                    More
                  </button>

                </div>

                {/* Mobile filter */}

                <button
                  onClick={() =>
                    setShowFilters(
                      (prev) =>
                        !prev
                    )
                  }
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-600 xl:hidden"
                >
                  <SlidersHorizontal
                    size={13}
                  />

                  Filters

                  {activeFilterCount >
                    0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2161F5] px-1 text-xs text-white">
                      {
                        activeFilterCount
                      }
                    </span>
                  )}
                </button>

              </div>

              {/* Filter menus */}

              {(showFilters ||
                showRoleMenu ||
                showStatusMenu) && (
                <div className="mt-3 border-t border-gray-100 pt-3">

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

                    {/* Role */}

                    <FilterSelect
                      label="Role"
                      value={role}
                      options={[
                        [
                          "ALL",
                          "All Roles",
                        ],
                        [
                          "STUDENT",
                          "Student",
                        ],
                        [
                          "PROFESSIONAL",
                          "Professional",
                        ],
                        [
                          "OWNER",
                          "Hostel Owner",
                        ],
                        [
                          "ADMIN",
                          "Admin",
                        ],
                      ]}
                      onChange={(
                        value
                      ) => {
                        setRole(
                          value
                        );
                        setPage(
                          0
                        );
                        setShowRoleMenu(
                          false
                        );
                      }}
                    />

                    {/* Status */}

                    <FilterSelect
                      label="Account Status"
                      value={
                        status
                      }
                      options={[
                        [
                          "ALL",
                          "All Statuses",
                        ],
                        [
                          "ACTIVE",
                          "Active",
                        ],
                        [
                          "INACTIVE",
                          "Inactive",
                        ],
                        [
                          "SUSPENDED",
                          "Suspended",
                        ],
                        [
                          "BLOCKED",
                          "Blocked",
                        ],
                      ]}
                      onChange={(
                        value
                      ) => {
                        setStatus(
                          value
                        );
                        setPage(
                          0
                        );
                        setShowStatusMenu(
                          false
                        );
                      }}
                    />

                    {/* Date */}

                    <div>

                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Registration Range
                      </p>

                      <div className="flex flex-wrap gap-1.5">

                        {[
                          [
                            "7d",
                            "7 days",
                          ],
                          [
                            "30d",
                            "30 days",
                          ],
                          [
                            "90d",
                            "90 days",
                          ],
                          [
                            "1y",
                            "1 year",
                          ],
                        ].map(
                          ([
                            value,
                            label,
                          ]) => (
                            <button
                              key={
                                value
                              }
                              onClick={() => {
                                setDateRange(
                                  value
                                );
                                setPage(
                                  0
                                );
                              }}
                              className={`rounded-lg px-2.5 py-2 text-xs font-medium ${
                                dateRange ===
                                value
                                  ? "bg-blue-50 text-[#2161F5]"
                                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                              }`}
                            >
                              {
                                label
                              }
                            </button>
                          )
                        )}

                      </div>
                    </div>

                  </div>

                  {activeFilterCount >
                    0 && (
                    <button
                      onClick={
                        clearFilters
                      }
                      className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600"
                    >
                      <X
                        size={11}
                      />
                      Clear filters
                    </button>
                  )}

                </div>
              )}

            </div>
          </section>

          {/* =================================================
              USERS TABLE
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* Table header */}

            <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-900">
                    All Users
                  </h3>

                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                    {formatNumber(
                      totalElements
                    )}
                  </span>
                </div>

                <p className="mt-1 text-xs text-gray-400">
                  {totalElements >
                  0
                    ? `Showing ${paginationStart}–${paginationEnd}`
                    : "No users available"}
                </p>
              </div>

              <div className="flex items-center gap-2">

                <span className="text-xs text-gray-400">
                  Rows
                </span>

                <select
                  value={
                    pageSize
                  }
                  onChange={(
                    e
                  ) => {
                    setPageSize(
                      Number(
                        e.target
                          .value
                      )
                    );
                    setPage(
                      0
                    );
                  }}
                  className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium text-gray-600 outline-none"
                >
                  <option value={10}>
                    10
                  </option>

                  <option value={20}>
                    20
                  </option>

                  <option value={50}>
                    50
                  </option>
                </select>

              </div>
            </div>

            {/* Loading */}

            {loading ? (
              <LoadingState />
            ) : normalizedUsers.length ===
              0 ? (
              <EmptyState
                clearFilters={
                  clearFilters
                }
              />
            ) : (
              <>
                {/* Desktop */}

                <div className="hidden overflow-x-auto lg:block">

                  <table className="w-full min-w-[1000px]">

                    <thead>

                      <tr className="border-b border-gray-100 bg-gray-50/70">

                        <th className="px-5 py-3 text-left">
                          <SortButton
                            label="User"
                            active={
                              sortBy ===
                              "name"
                            }
                            direction={
                              sortDirection
                            }
                            onClick={() =>
                              handleSort(
                                "name"
                              )
                            }
                          />
                        </th>

                        <th className="px-5 py-3 text-left">
                          <span className="text-xs font-bold uppercase tracking-[0.08em] text-gray-400">
                            Contact
                          </span>
                        </th>

                        <th className="px-5 py-3 text-left">
                          <span className="text-xs font-bold uppercase tracking-[0.08em] text-gray-400">
                            Role
                          </span>
                        </th>

                        <th className="px-5 py-3 text-left">
                          <SortButton
                            label="Joined"
                            active={
                              sortBy ===
                              "createdAt"
                            }
                            direction={
                              sortDirection
                            }
                            onClick={() =>
                              handleSort(
                                "createdAt"
                              )
                            }
                          />
                        </th>

                        <th className="px-5 py-3 text-left">
                          <span className="text-xs font-bold uppercase tracking-[0.08em] text-gray-400">
                            Status
                          </span>
                        </th>

                        <th className="px-5 py-3 text-left">
                          <span className="text-xs font-bold uppercase tracking-[0.08em] text-gray-400">
                            Last Active
                          </span>
                        </th>

                        <th className="px-5 py-3 text-right">
                          <span className="text-xs font-bold uppercase tracking-[0.08em] text-gray-400">
                            Actions
                          </span>
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {normalizedUsers.map(
                        (user) => (
                          <UserTableRow
                            key={
                              user.id
                            }
                            user={
                              user
                            }
                            getRoleIcon={
                              getRoleIcon
                            }
                            getRoleLabel={
                              getRoleLabel
                            }
                            getStatusConfig={
                              getStatusConfig
                            }
                            formatDate={
                              formatDate
                            }
                            showActionMenu={
                              showActionMenu
                            }
                            setShowActionMenu={
                              setShowActionMenu
                            }
                            handleViewUser={
                              handleViewUser
                            }
                            handleEditUser={
                              handleEditUser
                            }
                            openStatusModal={
                              openStatusModal
                            }
                          />
                        )
                      )}

                    </tbody>

                  </table>

                </div>

                {/* Mobile / Tablet cards */}

                <div className="divide-y divide-gray-100 lg:hidden">

                  {normalizedUsers.map(
                    (user) => (
                      <UserMobileCard
                        key={
                          user.id
                        }
                        user={
                          user
                        }
                        getRoleIcon={
                          getRoleIcon
                        }
                        getRoleLabel={
                          getRoleLabel
                        }
                        getStatusConfig={
                          getStatusConfig
                        }
                        formatDate={
                          formatDate
                        }
                        handleViewUser={
                          handleViewUser
                        }
                        handleEditUser={
                          handleEditUser
                        }
                        openStatusModal={
                          openStatusModal
                        }
                      />
                    )
                  )}

                </div>
              </>
            )}

            {/* Pagination */}

            {!loading &&
              normalizedUsers.length >
                0 && (
                <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

                  <p className="text-xs text-gray-400">
                    Showing{" "}
                    <span className="font-semibold text-gray-600">
                      {paginationStart}
                    </span>{" "}
                    –{" "}
                    <span className="font-semibold text-gray-600">
                      {paginationEnd}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-600">
                      {formatNumber(
                        totalElements
                      )}
                    </span>
                  </p>

                  <div className="flex items-center gap-1">

                    <button
                      disabled={
                        page <=
                        0
                      }
                      onClick={() =>
                        setPage(
                          (
                            prev
                          ) =>
                            Math.max(
                              0,
                              prev -
                                1
                            )
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft
                        size={13}
                      />
                    </button>

                    {Array.from(
                      {
                        length:
                          Math.min(
                            totalPages ||
                              1,
                            5
                          ),
                      },
                      (
                        _,
                        index
                      ) => {

                        let pageNumber =
                          index;

                        if (
                          totalPages >
                          5
                        ) {
                          if (
                            page <=
                            2
                          ) {
                            pageNumber =
                              index;
                          } else if (
                            page >=
                            totalPages -
                              3
                          ) {
                            pageNumber =
                              totalPages -
                              5 +
                              index;
                          } else {
                            pageNumber =
                              page -
                              2 +
                              index;
                          }
                        }

                        return (
                          <button
                            key={
                              pageNumber
                            }
                            onClick={() =>
                              setPage(
                                pageNumber
                              )
                            }
                            className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold ${
                              page ===
                              pageNumber
                                ? "bg-[#2161F5] text-white shadow-sm"
                                : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {
                              pageNumber +
                              1
                            }
                          </button>
                        );
                      }
                    )}

                    <button
                      disabled={
                        totalPages ===
                          0 ||
                        page >=
                          totalPages -
                            1
                      }
                      onClick={() =>
                        setPage(
                          (
                            prev
                          ) =>
                            Math.min(
                              totalPages -
                                1,
                              prev +
                                1
                            )
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight
                        size={13}
                      />
                    </button>

                  </div>

                </div>
              )}

          </section>
        </main>
      </div>

      {/* =====================================================
          USER DETAILS MODAL
      ===================================================== */}

      {showUserDetails &&
        selectedUser && (
          <UserDetailsModal
            user={
              normalizeUser(
                selectedUser
              )
            }
            onClose={() => {
              setShowUserDetails(
                false
              );
              setSelectedUser(
                null
              );
            }}
            onEdit={() =>
              handleEditUser(
                normalizeUser(
                  selectedUser
                )
              )
            }
            getRoleIcon={
              getRoleIcon
            }
            getRoleLabel={
              getRoleLabel
            }
            getStatusConfig={
              getStatusConfig
            }
            formatDateTime={
              formatDateTime
            }
          />
        )}

      {/* =====================================================
          EXPORT MODAL
      ===================================================== */}

      {showExportModal && (
        <ExportModal
          exportForm={
            exportForm
          }
          setExportForm={
            setExportForm
          }
          exporting={
            exporting
          }
          onClose={() =>
            setShowExportModal(
              false
            )
          }
          onExport={
            handleExport
          }
          search={
            search
          }
          role={role}
          status={status}
          getRoleLabel={
            getRoleLabel
          }
          getStatusConfig={
            getStatusConfig
          }
        />
      )}

      {/* =====================================================
          STATUS MODAL
      ===================================================== */}

      {showStatusModal &&
        selectedUser && (
          <StatusModal
            user={
              normalizeUser(
                selectedUser
              )
            }
            action={
              statusAction
            }
            updating={
              updatingStatus
            }
            onCancel={() => {
              setShowStatusModal(
                false
              );
              setSelectedUser(
                null
              );
              setStatusAction(
                null
              );
            }}
            onConfirm={
              handleStatusUpdate
            }
          />
        )}
    </div>
  );
};

// =============================================================
// OVERVIEW ROW
// =============================================================

const OverviewRow = ({
  icon: Icon,
  label,
  value,
  total,
}) => {
  const percentage =
    total > 0
      ? Math.round(
          (value / total) *
            100
        )
      : 0;

  return (
    <div>

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">

          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
            <Icon size={13} />
          </div>

          <span className="text-sm font-medium text-gray-600">
            {label}
          </span>

        </div>

        <span className="text-sm font-bold text-gray-800">
          {Number(
            value || 0
          ).toLocaleString(
            "en-IN"
          )}
        </span>

      </div>

      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-[#2161F5] transition-all"
          style={{
            width: `${Math.min(
              percentage,
              100
            )}%`,
          }}
        />
      </div>

      <p className="mt-1 text-right text-xs text-gray-400">
        {percentage}% of users
      </p>

    </div>
  );
};

// =============================================================
// FILTER BUTTON
// =============================================================

const FilterButton = ({
  icon: Icon,
  label,
  active,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex h-10 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition ${
        active
          ? "border-blue-100 bg-blue-50 text-[#2161F5]"
          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
      }`}
    >
      <Icon size={13} />

      {label}

      <ChevronDown
        size={12}
        className="ml-1 text-gray-400"
      />
    </button>
  );
};

// =============================================================
// FILTER SELECT
// =============================================================

const FilterSelect = ({
  label,
  value,
  options,
  onChange,
}) => {
  return (
    <div>

      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <select
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
      >
        {options.map(
          ([
            optionValue,
            optionLabel,
          ]) => (
            <option
              key={
                optionValue
              }
              value={
                optionValue
              }
            >
              {optionLabel}
            </option>
          )
        )}
      </select>

    </div>
  );
};

// =============================================================
// SORT BUTTON
// =============================================================

const SortButton = ({
  label,
  active,
  direction,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] ${
        active
          ? "text-[#2161F5]"
          : "text-gray-400"
      }`}
    >
      {label}

      {active ? (
        direction ===
        "asc" ? (
          <ChevronUp
            size={11}
          />
        ) : (
          <ChevronDown
            size={11}
          />
        )
      ) : (
        <ChevronsUpDown
          size={11}
        />
      )}
    </button>
  );
};

// =============================================================
// USER TABLE ROW
// =============================================================

const UserTableRow = ({
  user,
  getRoleIcon,
  getRoleLabel,
  getStatusConfig,
  formatDate,
  showActionMenu,
  setShowActionMenu,
  handleViewUser,
  handleEditUser,
  openStatusModal,
}) => {
  const RoleIcon =
    getRoleIcon(
      user.role
    );

  const statusConfig =
    getStatusConfig(
      user.status
    );

  return (
    <tr className="group border-b border-gray-50 transition hover:bg-blue-50/20">

      {/* User */}

      <td className="px-5 py-3.5">

        <div className="flex items-center gap-3">

          {user.avatar ? (
            <img
              src={
                user.avatar
              }
              alt={
                user.name
              }
              className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#2161F5]">
              {user.name
                ?.charAt(
                  0
                )
                ?.toUpperCase()}
            </div>
          )}

          <div className="min-w-0">

            <p className="max-w-[180px] truncate text-sm font-semibold text-gray-800">
              {user.name}
            </p>

            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
              <Hash
                size={8}
              />

              <span className="max-w-[130px] truncate">
                {user.id}
              </span>
            </p>

          </div>
        </div>
      </td>

      {/* Contact */}

      <td className="px-5 py-3.5">

        <div className="space-y-1">

          <div className="flex items-center gap-1.5">
            <Mail
              size={10}
              className="text-gray-300"
            />

            <span className="max-w-[190px] truncate text-sm text-gray-600">
              {user.email}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Phone
              size={10}
              className="text-gray-300"
            />

            <span className="text-xs text-gray-400">
              {user.phone}
            </span>
          </div>

        </div>
      </td>

      {/* Role */}

      <td className="px-5 py-3.5">

        <div className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-1.5">

          <RoleIcon
            size={11}
            className="text-gray-500"
          />

          <span className="text-sm font-medium text-gray-600">
            {getRoleLabel(
              user.role
            )}
          </span>

        </div>

      </td>

      {/* Joined */}

      <td className="px-5 py-3.5">

        <span className="text-sm text-gray-500">
          {formatDate(
            user.createdAt
          )}
        </span>

      </td>

      {/* Status */}

      <td className="px-5 py-3.5">

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-semibold ${statusConfig.badge}`}
        >

          <span
            className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
          />

          {
            statusConfig.label
          }

        </span>

      </td>

      {/* Last active */}

      <td className="px-5 py-3.5">

        <span className="text-sm text-gray-500">
          {formatDate(
            user.lastActive
          )}
        </span>

      </td>

      {/* Actions */}

      <td className="relative px-5 py-3.5 text-right">

        <button
          onClick={() =>
            setShowActionMenu(
              showActionMenu ===
                user.id
                ? null
                : user.id
            )
          }
          className="rounded-lg p-1.5 text-gray-400 opacity-60 transition hover:bg-gray-100 hover:text-gray-700 group-hover:opacity-100"
        >
          <MoreHorizontal
            size={16}
          />
        </button>

        {showActionMenu ===
          user.id && (
          <div className="absolute right-5 top-11 z-40 w-44 rounded-xl border border-gray-200 bg-white p-1.5 text-left shadow-xl">

            <button
              onClick={() =>
                handleViewUser(
                  user
                )
              }
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              <Eye
                size={13}
              />
              View Profile
            </button>

            <button
              onClick={() =>
                handleEditUser(
                  user
                )
              }
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              <Edit3
                size={13}
              />
              Edit User
            </button>

            <div className="my-1 border-t border-gray-100" />

            {String(
              user.status
            ).toUpperCase() ===
            "ACTIVE" ? (
              <>
                <button
                  onClick={() =>
                    openStatusModal(
                      user,
                      "DEACTIVATE"
                    )
                  }
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <UserX
                    size={13}
                  />
                  Deactivate
                </button>

                <button
                  onClick={() =>
                    openStatusModal(
                      user,
                      "SUSPEND"
                    )
                  }
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-amber-600 hover:bg-amber-50"
                >
                  <Clock3
                    size={13}
                  />
                  Suspend
                </button>

                <button
                  onClick={() =>
                    openStatusModal(
                      user,
                      "BLOCK"
                    )
                  }
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Ban
                    size={13}
                  />
                  Block User
                </button>
              </>
            ) : (
              <button
                onClick={() =>
                  openStatusModal(
                    user,
                    "ACTIVATE"
                  )
                }
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50"
              >
                <UserCheck
                  size={13}
                />
                Activate
              </button>
            )}

          </div>
        )}

      </td>
    </tr>
  );
};

// =============================================================
// MOBILE CARD
// =============================================================

const UserMobileCard = ({
  user,
  getRoleIcon,
  getRoleLabel,
  getStatusConfig,
  formatDate,
  handleViewUser,
  handleEditUser,
  openStatusModal,
}) => {
  const RoleIcon =
    getRoleIcon(
      user.role
    );

  const statusConfig =
    getStatusConfig(
      user.status
    );

  return (
    <div className="p-4">

      <div className="flex items-start justify-between gap-3">

        <div className="flex min-w-0 items-center gap-3">

          {user.avatar ? (
            <img
              src={
                user.avatar
              }
              alt={
                user.name
              }
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#2161F5]">
              {user.name
                ?.charAt(
                  0
                )
                ?.toUpperCase()}
            </div>
          )}

          <div className="min-w-0">

            <p className="truncate text-sm font-semibold text-gray-800">
              {user.name}
            </p>

            <p className="mt-0.5 truncate text-xs text-gray-400">
              {user.email}
            </p>

          </div>
        </div>

        <button
          onClick={() =>
            handleViewUser(
              user
            )
          }
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-50"
        >
          <Eye
            size={14}
          />
        </button>

      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Role
          </p>

          <div className="mt-1.5 flex items-center gap-1.5">

            <RoleIcon
              size={11}
              className="text-gray-400"
            />

            <span className="text-sm text-gray-600">
              {getRoleLabel(
                user.role
              )}
            </span>

          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Status
          </p>

          <span
            className={`mt-1.5 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${statusConfig.badge}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
            />

            {
              statusConfig.label
            }
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Joined
          </p>

          <p className="mt-1.5 text-sm text-gray-600">
            {formatDate(
              user.createdAt
            )}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Last Active
          </p>

          <p className="mt-1.5 text-sm text-gray-600">
            {formatDate(
              user.lastActive
            )}
          </p>
        </div>

      </div>

      <div className="mt-4 flex gap-2">

        <button
          onClick={() =>
            handleViewUser(
              user
            )
          }
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          <Eye
            size={12}
          />
          View
        </button>

        <button
          onClick={() =>
            handleEditUser(
              user
            )
          }
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-50 py-2 text-sm font-semibold text-[#2161F5] hover:bg-blue-100"
        >
          <Edit3
            size={12}
          />
          Edit
        </button>

        {String(
          user.status
        ).toUpperCase() ===
        "ACTIVE" ? (
          <button
            onClick={() =>
              openStatusModal(
                user,
                "SUSPEND"
              )
            }
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-50 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-100"
          >
            <Clock3
              size={12}
            />
            Suspend
          </button>
        ) : (
          <button
            onClick={() =>
              openStatusModal(
                user,
                "ACTIVATE"
              )
            }
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-50 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-100"
          >
            <UserCheck
              size={12}
            />
            Activate
          </button>
        )}

      </div>

    </div>
  );
};

// =============================================================
// LOADING
// =============================================================

const LoadingState = () => {
  return (
    <div className="flex h-64 items-center justify-center">

      <div className="flex items-center gap-2 text-sm text-gray-400">

        <RefreshCw
          size={15}
          className="animate-spin"
        />

        Loading users...

      </div>

    </div>
  );
};

// =============================================================
// EMPTY
// =============================================================

const EmptyState = ({
  clearFilters,
}) => {
  return (
    <div className="flex h-64 flex-col items-center justify-center px-5">

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50">
        <UsersIcon
          size={21}
          className="text-gray-300"
        />
      </div>

      <p className="mt-3 text-sm font-semibold text-gray-600">
        No users found
      </p>

      <p className="mt-1 max-w-xs text-center text-xs text-gray-400">
        Try changing your search or filters.
      </p>

      <button
        onClick={
          clearFilters
        }
        className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-[#2161F5] hover:bg-blue-100"
      >
        Clear filters
      </button>

    </div>
  );
};

// =============================================================
// USER DETAILS MODAL
// =============================================================

const UserDetailsModal = ({
  user,
  onClose,
  onEdit,
  getRoleIcon,
  getRoleLabel,
  getStatusConfig,
  formatDateTime,
}) => {
  const RoleIcon =
    getRoleIcon(
      user.role
    );

  const statusConfig =
    getStatusConfig(
      user.status
    );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >

      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* Header */}

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

          <div>
            <h3 className="text-base font-bold text-gray-900">
              User Profile
            </h3>

            <p className="mt-0.5 text-xs text-gray-400">
              Account information and activity
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50"
          >
            <X size={17} />
          </button>

        </div>

        {/* Body */}

        <div className="max-h-[72vh] overflow-y-auto p-5">

          {/* Profile */}

          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">

            {user.avatar ? (
              <img
                src={
                  user.avatar
                }
                alt={
                  user.name
                }
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-[#2161F5]">
                {user.name
                  ?.charAt(
                    0
                  )
                  ?.toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">

              <h4 className="truncate text-base font-bold text-gray-900">
                {user.name}
              </h4>

              <p className="mt-0.5 truncate text-xs text-gray-400">
                {user.email}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">

                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-semibold text-gray-600">
                  <RoleIcon
                    size={10}
                  />
                  {getRoleLabel(
                    user.role
                  )}
                </span>

                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${statusConfig.badge}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
                  />

                  {
                    statusConfig.label
                  }
                </span>

              </div>
            </div>
          </div>

          {/* Information */}

          <div className="mt-4">

            <p className="mb-2 text-sm font-bold text-gray-700">
              Account Information
            </p>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

              <DetailBox
                icon={
                  Hash
                }
                label="User ID"
                value={
                  user.id
                }
              />

              <DetailBox
                icon={
                  Phone
                }
                label="Phone"
                value={
                  user.phone
                }
              />

              <DetailBox
                icon={
                  Mail
                }
                label="Email"
                value={
                  user.email
                }
              />

              <DetailBox
                icon={
                  CalendarDays
                }
                label="Registered"
                value={formatDateTime(
                  user.createdAt
                )}
              />

              <DetailBox
                icon={
                  Clock3
                }
                label="Last Active"
                value={formatDateTime(
                  user.lastActive
                )}
              />

              <DetailBox
                icon={
                  UserCog
                }
                label="Role"
                value={getRoleLabel(
                  user.role
                )}
              />

            </div>
          </div>

          {/* Activity */}

          <div className="mt-5">

            <p className="mb-2 text-sm font-bold text-gray-700">
              Account Activity
            </p>

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">

              <div className="flex items-start gap-2">

                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#2161F5]">
                  <Activity
                    size={13}
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-blue-900">
                    Account activity
                  </p>

                  <p className="mt-1 text-xs leading-4 text-blue-700">
                    Detailed activity information can be displayed here when provided by the backend.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">

          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Close
          </button>

          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-lg bg-[#2161F5] px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Edit3
              size={12}
            />
            Edit User
          </button>

        </div>

      </div>

    </div>
  );
};

// =============================================================
// DETAIL BOX
// =============================================================

const DetailBox = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-gray-100 p-3">

      <div className="flex items-center gap-2">

        <Icon
          size={13}
          className="text-gray-400"
        />

        <span className="text-xs font-medium text-gray-400">
          {label}
        </span>

      </div>

      <p className="mt-1.5 break-all text-sm font-semibold text-gray-700">
        {value || "—"}
      </p>

    </div>
  );
};

// =============================================================
// EXPORT MODAL
// =============================================================

const ExportModal = ({
  exportForm,
  setExportForm,
  exporting,
  onClose,
  onExport,
  search,
  role,
  status,
  getRoleLabel,
  getStatusConfig,
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">

      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

          <div>
            <h3 className="text-base font-bold text-gray-900">
              Export Users
            </h3>

            <p className="mt-0.5 text-xs text-gray-400">
              Export the users matching your current filters.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50"
          >
            <X size={17} />
          </button>

        </div>

        <div className="space-y-5 p-5">

          {/* Format */}

          <div>

            <p className="mb-2 text-sm font-semibold text-gray-700">
              File format
            </p>

            <div className="grid grid-cols-2 gap-2">

              {[
                "CSV",
                "EXCEL",
              ].map(
                (format) => (
                  <button
                    key={
                      format
                    }
                    onClick={() =>
                      setExportForm(
                        (
                          prev
                        ) => ({
                          ...prev,
                          format,
                        })
                      )
                    }
                    className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                      exportForm.format ===
                      format
                        ? "border-blue-200 bg-blue-50 text-[#2161F5]"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {format}
                  </button>
                )
              )}

            </div>

          </div>

          {/* Fields */}

          <div>

            <p className="mb-2 text-sm font-semibold text-gray-700">
              Include
            </p>

            <div className="space-y-2">

              {[
                [
                  "includeBasicInfo",
                  "Basic Information",
                ],
                [
                  "includeAccountStatus",
                  "Account Status",
                ],
                [
                  "includeRegistrationDate",
                  "Registration Date",
                ],
                [
                  "includeActivity",
                  "Activity",
                ],
              ].map(
                ([
                  key,
                  label,
                ]) => (
                  <label
                    key={
                      key
                    }
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-gray-100 p-3 hover:bg-gray-50"
                  >

                    <input
                      type="checkbox"
                      checked={
                        exportForm[
                          key
                        ]
                      }
                      onChange={(
                        e
                      ) =>
                        setExportForm(
                          (
                            prev
                          ) => ({
                            ...prev,
                            [key]:
                              e
                                .target
                                .checked,
                          })
                        )
                      }
                      className="h-3.5 w-3.5 rounded border-gray-300 text-[#2161F5] focus:ring-[#2161F5]"
                    />

                    <span className="text-sm font-medium text-gray-600">
                      {label}
                    </span>

                  </label>
                )
              )}

            </div>
          </div>

          {/* Filters */}

          <div className="rounded-xl bg-gray-50 p-3">

            <p className="text-xs font-semibold text-gray-500">
              Current filters
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">

              {search && (
                <span className="rounded-full bg-white px-2 py-1 text-xs text-gray-500">
                  Search:{" "}
                  {search}
                </span>
              )}

              {role !==
                "ALL" && (
                <span className="rounded-full bg-white px-2 py-1 text-xs text-gray-500">
                  Role:{" "}
                  {getRoleLabel(
                    role
                  )}
                </span>
              )}

              {status !==
                "ALL" && (
                <span className="rounded-full bg-white px-2 py-1 text-xs text-gray-500">
                  Status:{" "}
                  {
                    getStatusConfig(
                      status
                    ).label
                  }
                </span>
              )}

              {!search &&
                role ===
                  "ALL" &&
                status ===
                  "ALL" && (
                  <span className="text-xs text-gray-400">
                    All users
                  </span>
                )}

            </div>
          </div>

        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">

          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={onExport}
            disabled={
              exporting
            }
            className="flex items-center gap-1.5 rounded-lg bg-[#2161F5] px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >

            {exporting ? (
              <RefreshCw
                size={12}
                className="animate-spin"
              />
            ) : (
              <Download
                size={12}
              />
            )}

            {exporting
              ? "Exporting..."
              : "Export Users"}

          </button>

        </div>

      </div>

    </div>
  );
};

// =============================================================
// STATUS MODAL
// =============================================================

const StatusModal = ({
  user,
  action,
  updating,
  onCancel,
  onConfirm,
}) => {
  const isActivate =
    action ===
    "ACTIVATE";

  const isBlock =
    action ===
    "BLOCK";

  const isSuspend =
    action ===
    "SUSPEND";

  const title =
    isActivate
      ? "Activate User"
      : isBlock
      ? "Block User"
      : isSuspend
      ? "Suspend User"
      : "Deactivate User";

  const actionLabel =
    action
      ?.toLowerCase()
      .replace(
        "_",
        " "
      );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">

      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">

        <div className="p-5">

          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
              isActivate
                ? "bg-emerald-50 text-emerald-600"
                : isBlock
                ? "bg-red-50 text-red-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >

            {isActivate ? (
              <UserCheck
                size={19}
              />
            ) : isBlock ? (
              <Ban
                size={19}
              />
            ) : (
              <UserX
                size={19}
              />
            )}

          </div>

          <h3 className="mt-4 text-base font-bold text-gray-900">
            {title}
          </h3>

          <p className="mt-1.5 text-sm leading-5 text-gray-500">

            Are you sure you want to{" "}

            <span className="font-semibold text-gray-700">
              {actionLabel}
            </span>{" "}

            <span className="font-semibold text-gray-800">
              {user.name}
            </span>
            ?

          </p>

          {isBlock && (
            <div className="mt-4 flex gap-2 rounded-xl border border-red-100 bg-red-50 p-3">

              <AlertCircle
                size={14}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <p className="text-xs leading-4 text-red-600">
                A blocked user will not be able to access the platform until their account is activated again.
              </p>

            </div>
          )}

        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">

          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={
              updating
            }
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
              isActivate
                ? "bg-emerald-600 hover:bg-emerald-700"
                : isBlock
                ? "bg-red-600 hover:bg-red-700"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >

            {updating && (
              <RefreshCw
                size={12}
                className="animate-spin"
              />
            )}

            Confirm

          </button>

        </div>

      </div>

    </div>
  );
};

export default Users;