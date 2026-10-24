import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Clock,
  MessageSquare,
  ShieldCheck,
  BarChart3,
  Settings,
  Bell,
  UserCircle,
  ChevronDown,
  Search,
  Menu,
  X,
  Download,
  TrendingUp,
  Users,
  CreditCard,
  IndianRupee,
  CalendarClock,
  MoreHorizontal,
  RefreshCw,
  Plus,
  Eye,
  Pencil,
  Ban,
  CheckCircle2,
  AlertCircle,
  CircleDollarSign,
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line, Doughnut } from "react-chartjs-2";

import api from "../api/axiosConfig";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const Subscription = () => {
  const navigate = useNavigate();

  /* ================================================================
     STATE
     ================================================================ */

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [dateRange, setDateRange] = useState("Last 30 Days");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [subscriptionData, setSubscriptionData] = useState(null);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanMenu, setShowPlanMenu] = useState(null);

  /* ================================================================
     SIDEBAR
     ================================================================ */

  const navigationItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      title: "Hostel Requests",
      icon: Building2,
      path: "/admin/hostel-management",
    },
    {
      title: "Pending Approvals",
      icon: Clock,
      path: "/admin/pending-approvals",
    },
    {
      title: "ReUpload Review",
      icon : RefreshCw,
      path: "/admin/reupload"
    },
    {
      title: "User Issues",
      icon: MessageSquare,
      path: "/admin/user-issues",
    },
    {
      title: "Owner Verification",
      icon: ShieldCheck,
      path: "/admin/owner-verification",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      path: "/admin/analytics",
    },
  ];

  const systemItems = [
    {
      title: "Users",
      icon: Users,
      path: "/admin/users",
    },
    {
      title: "System Settings",
      icon: Settings,
      path: "/admin/settings",
    },
    {
      title: "Audit Logs",
      icon: CalendarClock,
      path: "/admin/audit-logs",
    },
  ];

  const handleNavigation = (path) => {
    setSidebarOpen(false);
    setProfileOpen(false);
    setShowPlanMenu(null);

    if (path) {
      navigate(path);
    }
  };

  /* ================================================================
     FETCH SUBSCRIPTION DATA
     ================================================================ */

  const fetchSubscriptionData = useCallback(async () => {
    try {
      setRefreshing(true);

      const response = await api.get(
        "/api/admin/subscriptions",
        {
          params: {
            range: dateRange,
          },
        }
      );

      setSubscriptionData(response.data || null);
    } catch (error) {
      console.error(
        "Failed to fetch subscription analytics:",
        error
      );

      setSubscriptionData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  /* ================================================================
     SAFE DATA
     ================================================================ */

  const activeSubscriptions =
    subscriptionData?.activeSubscriptions ?? 0;

  const totalSubscribers =
    subscriptionData?.totalSubscribers ?? 0;

  const monthlyRevenue =
    subscriptionData?.monthlyRevenue ?? 0;

  const expiringSoon =
    subscriptionData?.expiringSoon ?? 0;

  const subscriptionGrowth = Array.isArray(
    subscriptionData?.subscriptionGrowth
  )
    ? subscriptionData.subscriptionGrowth
    : [];

  const planDistribution = Array.isArray(
    subscriptionData?.planDistribution
  )
    ? subscriptionData.planDistribution
    : [];

  const plans = Array.isArray(subscriptionData?.plans)
    ? subscriptionData.plans
    : [];

  const recentSubscriptions = Array.isArray(
    subscriptionData?.recentSubscriptions
  )
    ? subscriptionData.recentSubscriptions
    : [];

  /* ================================================================
     FORMATTERS
     ================================================================ */

  const formatNumber = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0";
    }

    return number.toLocaleString("en-IN");
  };

  const formatCurrency = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "₹0";
    }

    return `₹${number.toLocaleString("en-IN")}`;
  };

  const formatCompactCurrency = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "₹0";
    }

    if (number >= 10000000) {
      return `₹${(number / 10000000).toFixed(1)}Cr`;
    }

    if (number >= 100000) {
      return `₹${(number / 100000).toFixed(1)}L`;
    }

    if (number >= 1000) {
      return `₹${(number / 1000).toFixed(1)}K`;
    }

    return `₹${number.toLocaleString("en-IN")}`;
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatBillingCycle = (value) => {
    if (!value) {
      return "—";
    }

    return String(value)
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  /* ================================================================
     KPI CARDS
     ================================================================ */

  const summaryCards = [
    {
      title: "Active Subscriptions",
      value: formatNumber(activeSubscriptions),
      description: "Currently active",
      icon: CreditCard,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      title: "Monthly Revenue",
      value: formatCompactCurrency(monthlyRevenue),
      description: "Current subscription revenue",
      icon: IndianRupee,
      iconClass: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Total Subscribers",
      value: formatNumber(totalSubscribers),
      description: "Registered subscribers",
      icon: Users,
      iconClass: "bg-violet-50 text-violet-600",
    },
    {
      title: "Expiring Soon",
      value: formatNumber(expiringSoon),
      description: "Next 30 days",
      icon: CalendarClock,
      iconClass: "bg-amber-50 text-amber-600",
    },
  ];

  /* ================================================================
     SUBSCRIPTION GROWTH CHART
     ================================================================ */

  const growthLabels = subscriptionGrowth.map(
    (item) => item.label
  );

  const growthValues = subscriptionGrowth.map(
    (item) => Number(item.value) || 0
  );

  const subscriptionGrowthChartData = useMemo(
    () => ({
      labels: growthLabels,
      datasets: [
        {
          label: "Subscriptions",
          data: growthValues,
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5,

          backgroundColor:
            "rgba(33, 97, 245, 0.08)",

          borderColor: "#2161F5",

          pointBackgroundColor: "#2161F5",
          pointBorderColor: "#FFFFFF",
          pointBorderWidth: 2,
        },
      ],
    }),
    [subscriptionGrowth]
  );

  const subscriptionGrowthChartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      intersect: false,
      mode: "index",
    },

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        padding: 10,
        displayColors: false,

        callbacks: {
          label: (context) =>
            `${formatNumber(context.raw)} subscriptions`,
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          color: "#64748B",
          font: {
            size: 10,
          },
        },
      },

      y: {
        beginAtZero: true,

        grid: {
          color: "#F1F5F9",
        },

        ticks: {
          color: "#64748B",
          font: {
            size: 10,
          },

          callback: (value) =>
            formatNumber(value),
        },
      },
    },
  };

  /* ================================================================
     PLAN DISTRIBUTION
     ================================================================ */

  const distributionLabels = planDistribution.map(
    (item) => item.name
  );

  const distributionValues = planDistribution.map(
    (item) => Number(item.count) || 0
  );

  const doughnutData = useMemo(
    () => ({
      labels: distributionLabels,
      datasets: [
        {
          data: distributionValues,
          borderWidth: 0,
          hoverOffset: 5,

          backgroundColor: [
            "#2161F5",
            "#10B981",
            "#8B5CF6",
            "#F59E0B",
            "#F43F5E",
            "#64748B",
          ],
        },
      ],
    }),
    [planDistribution]
  );

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,

    cutout: "72%",

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: "#111827",
        padding: 10,
        displayColors: false,

        callbacks: {
          label: (context) => {
            const item =
              planDistribution[context.dataIndex];

            const percentage =
              item?.percentage != null
                ? `${item.percentage}%`
                : `${context.raw}`;

            return `${context.label}: ${percentage}`;
          },
        },
      },
    },
  };

  /* ================================================================
     PLAN STATUS
     ================================================================ */

  const getPlanStatusClass = (status) => {
    const normalized = String(
      status || ""
    ).toUpperCase();

    if (normalized === "ACTIVE") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (normalized === "INACTIVE") {
      return "bg-gray-100 text-gray-600";
    }

    if (normalized === "DRAFT") {
      return "bg-amber-50 text-amber-700";
    }

    if (normalized === "SUSPENDED") {
      return "bg-rose-50 text-rose-700";
    }

    return "bg-gray-100 text-gray-600";
  };

  const getSubscriptionStatusClass = (status) => {
    const normalized = String(
      status || ""
    ).toUpperCase();

    if (normalized === "ACTIVE") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (
      normalized === "PENDING" ||
      normalized === "PROCESSING"
    ) {
      return "bg-amber-50 text-amber-700";
    }

    if (
      normalized === "EXPIRED" ||
      normalized === "CANCELLED"
    ) {
      return "bg-rose-50 text-rose-700";
    }

    return "bg-gray-100 text-gray-600";
  };

  /* ================================================================
     EXPORT
     ================================================================ */

  const handleExport = () => {
    if (!plans.length && !recentSubscriptions.length) {
      return;
    }

    const rows = [
      [
        "Plan",
        "Price",
        "Billing Cycle",
        "Subscribers",
        "Revenue",
        "Status",
      ],

      ...plans.map((plan) => [
        plan.name ?? "",
        plan.price ?? "",
        formatBillingCycle(plan.billingCycle),
        plan.subscribers ?? 0,
        plan.revenue ?? 0,
        plan.status ?? "",
      ]),
    ];

    const csvContent = rows
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "admin-subscriptions.csv";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* ================================================================
     REFRESH
     ================================================================ */

  const handleRefresh = () => {
    fetchSubscriptionData();
  };

  /* ================================================================
     LOADING
     ================================================================ */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-gray-800">
        <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[235px] border-r border-gray-200 bg-white lg:block">
          <div className="flex h-[74px] items-center border-b border-gray-100 px-5">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">
                Hostel<span className="text-gray-500">Hub</span>
              </h1>

              <p className="mt-0.5 text-sm text-gray-400">
                Admin Console
              </p>
            </div>
          </div>
        </aside>

        <div className="lg:pl-[235px]">
          <header className="flex h-[74px] items-center border-b border-gray-200 bg-white px-4 sm:px-6">
            <div className="h-9 w-64 animate-pulse rounded-lg bg-gray-100" />
          </header>

          <main className="px-4 py-5 sm:px-6 lg:px-7">
            <div className="mb-6">
              <div className="h-7 w-36 animate-pulse rounded bg-gray-200" />

              <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-[130px] animate-pulse rounded-xl border border-gray-200 bg-white"
                />
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
              <div className="h-[390px] animate-pulse rounded-xl border border-gray-200 bg-white" />

              <div className="h-[390px] animate-pulse rounded-xl border border-gray-200 bg-white" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* ================================================================
     RENDER
     ================================================================ */

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-800">
      {/* ================================================================
          MOBILE OVERLAY
          ================================================================ */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================================================================
          SIDEBAR
          ================================================================ */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          h-screen
          w-[235px]
          border-r
          border-gray-200
          bg-white
          transition-transform
          duration-300
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Logo */}

        <div className="flex h-[74px] items-center justify-between border-b border-gray-100 px-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              Hostel<span className="text-gray-500">Hub</span>
            </h1>

            <p className="mt-0.5 text-sm text-gray-400">
              Admin Console
            </p>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}

        <nav className="px-3 py-5">
          {/* Main Menu */}

          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Management
          </p>

          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.title}
                  onClick={() =>
                    handleNavigation(item.path)
                  }
                  className="
                    group
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-lg
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    font-medium
                    text-gray-600
                    transition
                    hover:bg-gray-50
                    hover:text-gray-900
                  "
                >
                  <Icon
                    size={17}
                    strokeWidth={1.8}
                    className="text-gray-500 group-hover:text-gray-800"
                  />

                  <span>{item.title}</span>
                </button>
              );
            })}
          </div>

          {/* Analytics */}

          <p className="mb-2 mt-7 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Analytics & Reports
          </p>

          <div className="space-y-1">
            {/* Analytics */}

            <button
              onClick={() =>
                handleNavigation("/admin/analytics")
              }
              className="
                group
                flex
                w-full
                items-center
                gap-3
                rounded-lg
                px-3
                py-2.5
                text-left
                text-sm
                font-medium
                text-gray-600
                transition
                hover:bg-gray-50
                hover:text-gray-900
              "
            >
              <BarChart3
                size={17}
                strokeWidth={1.8}
                className="text-gray-500"
              />

              <span>Analytics</span>
            </button>

            {/* Subscription - ACTIVE */}

            <button
              onClick={() =>
                handleNavigation("/admin/subscription")
              }
              className="
                group
                flex
                w-full
                items-center
                gap-3
                rounded-lg
                bg-[#2161F5]
                px-3
                py-2.5
                text-left
                text-sm
                font-medium
                text-white
                shadow-sm
              "
            >
              <CircleDollarSign
                size={17}
                strokeWidth={1.8}
                className="text-white"
              />

              <span>Subscription</span>
            </button>

            {/* Reports */}

            <button
              onClick={() =>
                handleNavigation("/admin/reports")
              }
              className="
                group
                flex
                w-full
                items-center
                gap-3
                rounded-lg
                px-3
                py-2.5
                text-left
                text-sm
                font-medium
                text-gray-600
                transition
                hover:bg-gray-50
                hover:text-gray-900
              "
            >
              <CalendarClock
                size={17}
                strokeWidth={1.8}
                className="text-gray-500"
              />

              <span>Reports</span>
            </button>
          </div>

          {/* System */}

          <p className="mb-2 mt-7 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            System
          </p>

          <div className="space-y-1">
            {systemItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.title}
                  onClick={() =>
                    handleNavigation(item.path)
                  }
                  className="
                    group
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-lg
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    font-medium
                    text-gray-600
                    transition
                    hover:bg-gray-50
                    hover:text-gray-900
                  "
                >
                  <Icon
                    size={17}
                    strokeWidth={1.8}
                    className="text-gray-500 group-hover:text-gray-800"
                  />

                  <span>{item.title}</span>
                </button>
              );
            })}
          </div>

          {/* Generate Reports */}

          <button
            onClick={() =>
              handleNavigation("/admin/reports/generate")
            }
            className="
              mt-6
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-[#BFD2FF]
              bg-white
              px-3
              py-2.5
              text-xs
              font-semibold
              text-[#2161F5]
              transition
              hover:bg-blue-50
            "
          >
            <Download size={15} />

            <span>Generate Reports</span>
          </button>

          {/* Help Center */}

          <button
            onClick={() =>
              handleNavigation("/admin/help")
            }
            className="
              mt-2
              flex
              w-full
              items-center
              gap-3
              rounded-lg
              px-3
              py-2.5
              text-left
              text-sm
              font-medium
              text-gray-600
              transition
              hover:bg-gray-50
              hover:text-gray-900
            "
          >
            <AlertCircle
              size={17}
              strokeWidth={1.8}
              className="text-gray-500"
            />

            <span>Help Center</span>
          </button>
        </nav>
      </aside>

      {/* ================================================================
          MAIN
          ================================================================ */}

      <div className="lg:pl-[235px]">
        {/* ================================================================
            HEADER
            ================================================================ */}

        <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Menu size={20} />
            </button>

            {/* Search */}

            <div className="relative hidden sm:block">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search hostel, owner, location..."
                className="
                  h-10
                  w-[280px]
                  rounded-lg
                  border
                  border-gray-200
                  bg-gray-50
                  pl-9
                  pr-3
                  text-sm
                  text-gray-700
                  outline-none
                  transition
                  focus:border-[#2161F5]
                  focus:bg-white
                "
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notification */}

            <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
              <Bell size={19} />

              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
            </button>

            <div className="h-6 w-px bg-gray-200" />

            {/* Profile */}

            <div className="relative">
              <button
                onClick={() =>
                  setProfileOpen((prev) => !prev)
                }
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-[#2161F5]">
                  <span className="text-sm font-semibold">
                    A
                  </span>
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
                  size={14}
                  className="text-gray-400"
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-40 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg">
                  <button
                    onClick={() =>
                      handleNavigation(
                        "/admin/settings"
                      )
                    }
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <Settings size={14} />

                    Settings
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <LogOutIcon />

                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ================================================================
            CONTENT
            ================================================================ */}

        <main className="px-4 py-5 sm:px-6 lg:px-7">
          {/* ==============================================================
              PAGE TITLE
              ============================================================== */}

          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Subscription
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage subscription plans, billing and
                platform subscriptions
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Date Range */}

              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) =>
                    setDateRange(e.target.value)
                  }
                  className="
                    h-9
                    appearance-none
                    rounded-lg
                    border
                    border-gray-200
                    bg-white
                    pl-3
                    pr-8
                    text-sm
                    font-medium
                    text-gray-600
                    outline-none
                    hover:border-gray-300
                    focus:border-[#2161F5]
                  "
                >
                  <option>Today</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 6 Months</option>
                  <option>This Year</option>
                </select>

                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>

              {/* Refresh */}

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="
                  flex
                  h-9
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-gray-200
                  bg-white
                  px-3
                  text-sm
                  font-medium
                  text-gray-600
                  transition
                  hover:border-gray-300
                  hover:bg-gray-50
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
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

              {/* Export */}

              <button
                onClick={handleExport}
                disabled={
                  !plans.length &&
                  !recentSubscriptions.length
                }
                className="
                  flex
                  h-9
                  items-center
                  gap-2
                  rounded-lg
                  bg-[#2161F5]
                  px-3
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-[#1854DD]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Download size={14} />

                Export
              </button>
            </div>
          </div>

          {/* ==============================================================
              KPI CARDS
              ============================================================== */}

          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    p-4
                    shadow-[0_1px_2px_rgba(0,0,0,0.03)]
                  "
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {card.title}
                      </p>

                      <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                        {card.value}
                      </p>
                    </div>

                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.iconClass}`}
                    >
                      <Icon size={17} />
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-gray-400">
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ==============================================================
              CHARTS
              ============================================================== */}

          <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
            {/* Subscription Overview */}

            <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Subscription Overview
                  </h3>

                  <p className="mt-1 text-xs text-gray-400">
                    Subscription activity over time
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="h-2 w-2 rounded-full bg-[#2161F5]" />

                    Subscriptions
                  </span>
                </div>
              </div>

              {subscriptionGrowth.length > 0 ? (
                <div className="h-[285px]">
                  <Line
                    data={subscriptionGrowthChartData}
                    options={
                      subscriptionGrowthChartOptions
                    }
                  />
                </div>
              ) : (
                <EmptyChart
                  message="No subscription trend data available"
                />
              )}
            </section>

            {/* Plan Distribution */}

            <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900">
                  Plan Distribution
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  Active subscriptions by plan
                </p>
              </div>

              {planDistribution.length > 0 ? (
                <>
                  <div className="relative mx-auto h-[205px] w-[205px]">
                    <Doughnut
                      data={doughnutData}
                      options={doughnutOptions}
                    />

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatNumber(
                          activeSubscriptions
                        )}
                      </span>

                      <span className="text-xs text-gray-400">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {planDistribution.map(
                      (item, index) => (
                        <div
                          key={`${item.name}-${index}`}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor:
                                  [
                                    "#2161F5",
                                    "#10B981",
                                    "#8B5CF6",
                                    "#F59E0B",
                                    "#F43F5E",
                                    "#64748B",
                                  ][index % 6],
                              }}
                            />

                            <span className="text-xs text-gray-500">
                              {item.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-gray-700">
                              {formatNumber(item.count)}
                            </span>

                            {item.percentage != null && (
                              <span className="w-9 text-right text-xs font-semibold text-gray-800">
                                {item.percentage}%
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </>
              ) : (
                <EmptyChart
                  message="No plan distribution data available"
                />
              )}
            </section>
          </div>

          {/* ==============================================================
              SUBSCRIPTION PLANS
              ============================================================== */}

          <section className="mb-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex flex-col justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Subscription Plans
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  Manage plans available to hostel owners
                </p>
              </div>

              <button
                onClick={() =>
                  navigate("/admin/subscription/add")
                }
                className="
                  flex
                  h-8
                  items-center
                  justify-center
                  gap-1.5
                  rounded-lg
                  bg-[#2161F5]
                  px-3
                  text-xs
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#1854DD]
                "
              >
                <Plus size={14} />

                Add Plan
              </button>
            </div>

            {/* Desktop */}

            <div className="hidden overflow-x-auto md:block">
              {plans.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Plan
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Price
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Billing Cycle
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Subscribers
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Revenue
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Status
                      </th>

                      <th className="px-5 py-3" />
                    </tr>
                  </thead>

                  <tbody>
                    {plans.map((plan, index) => (
                      <tr
                        key={
                          plan.id ??
                          `${plan.name}-${index}`
                        }
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#2161F5]">
                              <CreditCard size={14} />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {plan.name || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="text-sm font-medium text-gray-700">
                            {formatCurrency(
                              plan.price
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="text-sm text-gray-500">
                            {formatBillingCycle(
                              plan.billingCycle
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="text-sm font-medium text-gray-700">
                            {formatNumber(
                              plan.subscribers
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="text-sm font-medium text-gray-700">
                            {formatCurrency(
                              plan.revenue
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPlanStatusClass(
                              plan.status
                            )}`}
                          >
                            {plan.status || "—"}
                          </span>
                        </td>

                        <td className="relative px-5 py-3.5">
                          <button
                            onClick={() =>
                              setShowPlanMenu(
                                showPlanMenu ===
                                  plan.id
                                  ? null
                                  : plan.id
                              )
                            }
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          >
                            <MoreHorizontal
                              size={15}
                            />
                          </button>

                          {showPlanMenu ===
                            plan.id && (
                            <PlanActionMenu
                              onView={() => {
                                setSelectedPlan(
                                  plan
                                );
                                setShowPlanMenu(
                                  null
                                );
                              }}
                              onEdit={() => {
                                navigate(
                                  `/admin/subscription/edit/${plan.id}`
                                );
                                setShowPlanMenu(
                                  null
                                );
                              }}
                              onDisable={() => {
                                setShowPlanMenu(
                                  null
                                );
                              }}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyTable
                  title="No subscription plans found"
                  message="Subscription plans from the backend will appear here."
                />
              )}
            </div>

            {/* Mobile */}

            <div className="divide-y divide-gray-100 md:hidden">
              {plans.length > 0 ? (
                plans.map((plan, index) => (
                  <div
                    key={
                      plan.id ??
                      `${plan.name}-${index}`
                    }
                    className="p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#2161F5]">
                          <CreditCard size={14} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {plan.name || "—"}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-400">
                            {formatBillingCycle(
                              plan.billingCycle
                            )}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${getPlanStatusClass(
                          plan.status
                        )}`}
                      >
                        {plan.status || "—"}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-gray-400">
                          Price
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          {formatCurrency(
                            plan.price
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Subscribers
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          {formatNumber(
                            plan.subscribers
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Revenue
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          {formatCompactCurrency(
                            plan.revenue
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() =>
                          setSelectedPlan(plan)
                        }
                        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <Eye size={13} />

                        View
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyTable
                  title="No subscription plans found"
                  message="Subscription plans from the backend will appear here."
                />
              )}
            </div>
          </section>

          {/* ==============================================================
              RECENT SUBSCRIPTIONS
              ============================================================== */}

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex flex-col justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Recent Subscriptions
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  Latest subscription activity
                </p>
              </div>

              <button
                onClick={() =>
                  navigate(
                    "/admin/subscription/subscribers"
                  )
                }
                className="text-xs font-medium text-[#2161F5] hover:text-[#1854DD]"
              >
                View All
              </button>
            </div>

            {/* Desktop */}

            <div className="hidden overflow-x-auto md:block">
              {recentSubscriptions.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Hostel / Owner
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Plan
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Amount
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Started
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Status
                      </th>

                      <th className="px-5 py-3" />
                    </tr>
                  </thead>

                  <tbody>
                    {recentSubscriptions.map(
                      (subscription, index) => (
                        <tr
                          key={
                            subscription.id ??
                            index
                          }
                          className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50"
                        >
                          <td className="px-5 py-3.5">
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {subscription.hostelName ||
                                  "—"}
                              </p>

                              <p className="mt-0.5 text-xs text-gray-400">
                                {subscription.ownerName ||
                                  "—"}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="text-sm text-gray-600">
                              {subscription.planName ||
                                "—"}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="text-sm font-medium text-gray-700">
                              {formatCurrency(
                                subscription.amount
                              )}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="text-sm text-gray-500">
                              {formatDate(
                                subscription.startedAt
                              )}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getSubscriptionStatusClass(
                                subscription.status
                              )}`}
                            >
                              {subscription.status ||
                                "—"}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <button
                              onClick={() =>
                                setSelectedPlan(
                                  subscription
                                )
                              }
                              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            >
                              <Eye size={15} />
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              ) : (
                <EmptyTable
                  title="No recent subscriptions"
                  message="Recent subscription activity will appear here once available."
                />
              )}
            </div>

            {/* Mobile */}

            <div className="divide-y divide-gray-100 md:hidden">
              {recentSubscriptions.length > 0 ? (
                recentSubscriptions.map(
                  (subscription, index) => (
                    <div
                      key={
                        subscription.id ??
                        index
                      }
                      className="p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {subscription.hostelName ||
                              "—"}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-400">
                            {subscription.ownerName ||
                              "—"}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${getSubscriptionStatusClass(
                            subscription.status
                          )}`}
                        >
                          {subscription.status ||
                            "—"}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-gray-400">
                            Plan
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {subscription.planName ||
                              "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">
                            Amount
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {formatCurrency(
                              subscription.amount
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">
                            Started
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {formatDate(
                              subscription.startedAt
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )
              ) : (
                <EmptyTable
                  title="No recent subscriptions"
                  message="Recent subscription activity will appear here once available."
                />
              )}
            </div>
          </section>

          <div className="h-6" />
        </main>
      </div>

      {/* ================================================================
          PLAN DETAILS MODAL
          ================================================================ */}

      {selectedPlan && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4"
          onClick={() => setSelectedPlan(null)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {selectedPlan.name ||
                    selectedPlan.planName ||
                    "Subscription Details"}
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  Subscription information
                </p>
              </div>

              <button
                onClick={() => setSelectedPlan(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <DetailRow
                label="Plan"
                value={
                  selectedPlan.name ||
                  selectedPlan.planName ||
                  "—"
                }
              />

              <DetailRow
                label="Price"
                value={
                  selectedPlan.price != null
                    ? formatCurrency(
                        selectedPlan.price
                      )
                    : selectedPlan.amount != null
                    ? formatCurrency(
                        selectedPlan.amount
                      )
                    : "—"
                }
              />

              <DetailRow
                label="Billing Cycle"
                value={formatBillingCycle(
                  selectedPlan.billingCycle
                )}
              />

              <DetailRow
                label="Subscribers"
                value={
                  selectedPlan.subscribers != null
                    ? formatNumber(
                        selectedPlan.subscribers
                      )
                    : "—"
                }
              />

              <DetailRow
                label="Revenue"
                value={
                  selectedPlan.revenue != null
                    ? formatCurrency(
                        selectedPlan.revenue
                      )
                    : "—"
                }
              />

              <DetailRow
                label="Status"
                value={
                  selectedPlan.status || "—"
                }
              />
            </div>

            <div className="flex justify-end border-t border-gray-100 px-5 py-3">
              <button
                onClick={() => setSelectedPlan(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ========================================================================
   EMPTY CHART
   ======================================================================== */

const EmptyChart = ({ message }) => {
  return (
    <div className="flex h-[285px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-50">
          <BarChart3
            size={18}
            className="text-gray-300"
          />
        </div>

        <p className="mt-3 text-sm font-medium text-gray-500">
          {message}
        </p>

        <p className="mt-1 text-xs text-gray-400">
          Data will appear when available.
        </p>
      </div>
    </div>
  );
};

/* ========================================================================
   EMPTY TABLE
   ======================================================================== */

const EmptyTable = ({ title, message }) => {
  return (
    <div className="flex min-h-[170px] items-center justify-center px-5 py-8">
      <div className="text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-50">
          <CreditCard
            size={18}
            className="text-gray-300"
          />
        </div>

        <p className="mt-3 text-sm font-semibold text-gray-500">
          {title}
        </p>

        <p className="mt-1 max-w-xs text-xs text-gray-400">
          {message}
        </p>
      </div>
    </div>
  );
};

/* ========================================================================
   DETAIL ROW
   ======================================================================== */

const DetailRow = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-b-0">
      <span className="text-xs text-gray-400">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-gray-800">
        {value}
      </span>
    </div>
  );
};

/* ========================================================================
   PLAN ACTION MENU
   ======================================================================== */

const PlanActionMenu = ({
  onView,
  onEdit,
  onDisable,
}) => {
  return (
    <div className="absolute right-5 top-10 z-20 w-32 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
      <button
        onClick={onView}
        className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-gray-600 hover:bg-gray-50"
      >
        <Eye size={13} />

        View
      </button>

      <button
        onClick={onEdit}
        className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-gray-600 hover:bg-gray-50"
      >
        <Pencil size={13} />

        Edit
      </button>

      <button
        onClick={onDisable}
        className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-rose-600 hover:bg-rose-50"
      >
        <Ban size={13} />

        Disable
      </button>
    </div>
  );
};

/* ========================================================================
   LOGOUT ICON
   ======================================================================== */

const LogOutIcon = () => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line
        x1="21"
        y1="12"
        x2="9"
        y2="12"
      />
    </svg>
  );
};

export default Subscription;