import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Building2,
  Clock,
  MessageSquare,
  ShieldCheck,
  BarChart3,
  CreditCard,
  Users,
  Settings,
  FileText,
  HelpCircle,
  Bell,
  UserCircle,
  ChevronDown,
  RefreshCw,
  Download,
  Eye,
  MoreVertical,
  X,
  Plus,
  FileBarChart,
  TrendingUp,
  IndianRupee,
  CheckCircle2,
  CalendarDays,
  ChevronRight,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";

import { Line, Doughnut } from "react-chartjs-2";

import api from "../api/axiosConfig";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const Reports = () => {
  const navigate = useNavigate();

  // =========================================================
  // UI STATE
  // =========================================================

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [dateRange, setDateRange] = useState("30");
  const [reportType, setReportType] = useState("ALL");
  const [reportFormat, setReportFormat] = useState("PDF");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [subscriptionData, setSubscriptionData] = useState(null);

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportDetails, setShowReportDetails] = useState(false);

  const [reportMetric, setReportMetric] = useState("revenue");

  const [showReportTypeMenu, setShowReportTypeMenu] =
    useState(false);

  const [showDateMenu, setShowDateMenu] =
    useState(false);

  // =========================================================
  // GENERATE REPORT FORM
  // =========================================================

  const [generateForm, setGenerateForm] = useState({
    type: "REVENUE",
    startDate: "",
    endDate: "",
    format: "PDF",
    includeSummary: true,
    includeDetails: true,
    includeCharts: false,
  });

  // =========================================================
  // SIDEBAR NAVIGATION
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
      icon: Clock,
      path: "/admin/pending-approvals",
    },
    {
      label: "ReUpload Review",
      icon : RefreshCw,
      path: "/admin/reupload"
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
      icon: CreditCard,
      path: "/admin/subscription",
    },
    {
      label: "Reports",
      icon: FileText,
      path: "/admin/reports",
      active: true,
    },
  ];

  const systemItems = [
    {
      label: "Users",
      icon: Users,
      path: "/admin/users",
    },
    {
      label: "System Settings",
      icon: Settings,
      path: "/admin/settings",
    },
    {
      label: "Audit Logs",
      icon: FileBarChart,
      path: "/admin/audit-logs",
    },
  ];

  // =========================================================
  // FETCH REPORT DATA
  // =========================================================

  const fetchReports = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get("/api/admin/reports", {
        params: {
          range: dateRange,
          reportType,
        },
      });

      setSubscriptionData(response.data || {});
    } catch (error) {
      console.error(
        "Failed to fetch reports:",
        error
      );

      setSubscriptionData({});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [dateRange, reportType]);

  // =========================================================
  // SAFE DATA EXTRACTION
  // =========================================================

  const data = subscriptionData || {};

  const totalHostels =
    Number(data.totalHostels) || 0;

  const totalRevenue =
    Number(data.totalRevenue) || 0;

  const newUsers =
    Number(data.newUsers) || 0;

  const approvalRate =
    Number(data.approvalRate) || 0;

  const revenueGrowth =
    Number(data.revenueGrowth) || 0;

  const hostelGrowth =
    Number(data.hostelGrowth) || 0;

  const userGrowth =
    Number(data.userGrowth) || 0;

  const approvalGrowth =
    Number(data.approvalGrowth) || 0;

  const reportOverview =
    Array.isArray(data.reportOverview)
      ? data.reportOverview
      : [];

  const reportCategories =
    Array.isArray(data.reportCategories)
      ? data.reportCategories
      : [];

  const recentReports =
    Array.isArray(data.recentReports)
      ? data.recentReports
      : [];

  const reports =
    Array.isArray(data.reports)
      ? data.reports
      : [];

  // =========================================================
  // HELPERS
  // =========================================================

  const formatCurrency = (value) => {
    const number = Number(value) || 0;

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("en-IN").format(
      Number(value) || 0
    );
  };

  const formatDate = (value) => {
    if (!value) return "—";

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

  const getGrowthText = (value) => {
    const number = Number(value) || 0;

    if (number > 0) {
      return `↑ ${number.toFixed(1)}%`;
    }

    if (number < 0) {
      return `↓ ${Math.abs(number).toFixed(1)}%`;
    }

    return "0%";
  };

  const getGrowthColor = (value) => {
    const number = Number(value) || 0;

    if (number > 0) {
      return "text-emerald-600";
    }

    if (number < 0) {
      return "text-red-500";
    }

    return "text-gray-500";
  };

  const getDateRangeLabel = () => {
    const ranges = {
      "1": "Today",
      "7": "Last 7 Days",
      "30": "Last 30 Days",
      "90": "Last 3 Months",
      "180": "Last 6 Months",
      "365": "This Year",
    };

    return ranges[dateRange] || "Last 30 Days";
  };

  const getReportTypeLabel = (type) => {
    const labels = {
      ALL: "All Reports",
      HOSTEL: "Hostel Reports",
      USER: "User Reports",
      OWNER: "Owner Reports",
      REVENUE: "Revenue Reports",
      SUBSCRIPTION: "Subscription Reports",
      APPROVAL: "Approval Reports",
      ACTIVITY: "Activity Reports",
    };

    return labels[type] || "All Reports";
  };

  // =========================================================
  // KPI CARDS
  // =========================================================

  const kpiCards = [
    {
      title: "Total Hostels",
      value: formatNumber(totalHostels),
      growth: hostelGrowth,
      icon: Building2,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      growth: revenueGrowth,
      icon: IndianRupee,
    },
    {
      title: "New Users",
      value: formatNumber(newUsers),
      growth: userGrowth,
      icon: Users,
    },
    {
      title: "Approval Rate",
      value: `${approvalRate.toFixed(1)}%`,
      growth: approvalGrowth,
      icon: CheckCircle2,
    },
  ];

  // =========================================================
  // CHART DATA
  // =========================================================

  const chartLabels = reportOverview.map(
    (item) =>
      item.label ||
      item.month ||
      item.date ||
      ""
  );

  const getMetricValue = (item) => {
    if (reportMetric === "revenue") {
      return Number(item.revenue) || 0;
    }

    if (reportMetric === "hostels") {
      return Number(item.hostels) || 0;
    }

    if (reportMetric === "users") {
      return Number(item.users) || 0;
    }

    if (reportMetric === "approvals") {
      return Number(item.approvals) || 0;
    }

    return 0;
  };

  const chartValues = reportOverview.map(
    getMetricValue
  );

  const lineChartData = {
    labels: chartLabels,
    datasets: [
      {
        label:
          reportMetric === "revenue"
            ? "Revenue"
            : reportMetric === "hostels"
            ? "Hostels"
            : reportMetric === "users"
            ? "Users"
            : "Approvals",
        data: chartValues,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw || 0;

            if (reportMetric === "revenue") {
              return ` Revenue: ${formatCurrency(
                value
              )}`;
            }

            return ` ${
              reportMetric === "hostels"
                ? "Hostels"
                : reportMetric === "users"
                ? "Users"
                : "Approvals"
            }: ${formatNumber(value)}`;
          },
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#94a3b8",
          font: {
            size: 10,
          },
        },
      },

      y: {
        beginAtZero: true,
        grid: {
          color: "#f1f5f9",
        },
        ticks: {
          color: "#94a3b8",
          font: {
            size: 10,
          },
          callback: function (value) {
            if (reportMetric === "revenue") {
              return `₹${Number(value).toLocaleString(
                "en-IN"
              )}`;
            }

            return Number(value).toLocaleString(
              "en-IN"
            );
          },
        },
      },
    },
  };

  // =========================================================
  // CATEGORY DOUGHNUT
  // =========================================================

  const categoryLabels = reportCategories.map(
    (item) =>
      item.name ||
      item.label ||
      item.type ||
      ""
  );

  const categoryValues = reportCategories.map(
    (item) =>
      Number(
        item.count ??
          item.value ??
          item.total ??
          0
      ) || 0
  );

  const doughnutData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryValues,
        borderWidth: 0,
        hoverOffset: 5,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,

    cutout: "70%",

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        callbacks: {
          label: function (context) {
            return ` ${context.label}: ${context.raw}`;
          },
        },
      },
    },
  };

  // =========================================================
  // REPORT TYPE OPTIONS
  // =========================================================

  const reportTypes = [
    {
      value: "ALL",
      label: "All Reports",
    },
    {
      value: "HOSTEL",
      label: "Hostel Reports",
    },
    {
      value: "USER",
      label: "User Reports",
    },
    {
      value: "OWNER",
      label: "Owner Reports",
    },
    {
      value: "REVENUE",
      label: "Revenue Reports",
    },
    {
      value: "SUBSCRIPTION",
      label: "Subscription Reports",
    },
    {
      value: "APPROVAL",
      label: "Approval Reports",
    },
    {
      value: "ACTIVITY",
      label: "Activity Reports",
    },
  ];

  const dateRanges = [
    {
      value: "1",
      label: "Today",
    },
    {
      value: "7",
      label: "Last 7 Days",
    },
    {
      value: "30",
      label: "Last 30 Days",
    },
    {
      value: "90",
      label: "Last 3 Months",
    },
    {
      value: "180",
      label: "Last 6 Months",
    },
    {
      value: "365",
      label: "This Year",
    },
  ];

  // =========================================================
  // REPORT GENERATION
  // =========================================================

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);

      const response = await api.post(
        "/api/admin/reports/generate",
        {
          type: generateForm.type,
          startDate: generateForm.startDate || null,
          endDate: generateForm.endDate || null,
          format: generateForm.format,
          includeSummary:
            generateForm.includeSummary,
          includeDetails:
            generateForm.includeDetails,
          includeCharts:
            generateForm.includeCharts,
        },
        {
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type:
            generateForm.format === "PDF"
              ? "application/pdf"
              : "application/octet-stream",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      const extension =
        generateForm.format === "PDF"
          ? "pdf"
          : generateForm.format === "CSV"
          ? "csv"
          : "xlsx";

      link.download = `admin-report-${Date.now()}.${extension}`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      setShowGenerateModal(false);

      await fetchReports(true);
    } catch (error) {
      console.error(
        "Failed to generate report:",
        error
      );
    } finally {
      setGeneratingReport(false);
    }
  };

  // =========================================================
  // DOWNLOAD EXISTING REPORT
  // =========================================================

  const handleDownloadReport = async (report) => {
    if (!report) return;

    try {
      const reportId =
        report.id ||
        report.reportId;

      if (!reportId) {
        console.warn(
          "Report ID is missing."
        );
        return;
      }

      const response = await api.get(
        `/api/admin/reports/${reportId}/download`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([
        response.data,
      ]);

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      const format =
        String(
          report.format || "PDF"
        ).toLowerCase();

      const extension =
        format === "excel"
          ? "xlsx"
          : format;

      link.download =
        `${report.name || "report"}.${extension}`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Failed to download report:",
        error
      );
    }
  };

  // =========================================================
  // VIEW REPORT
  // =========================================================

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowReportDetails(true);
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");

    navigate("/");
  };

  // =========================================================
  // FORMAT BADGE
  // =========================================================

  const getFormatBadge = (format) => {
    const normalized =
      String(format || "PDF").toUpperCase();

    if (normalized === "PDF") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">
          <FileText size={11} />
          PDF
        </span>
      );
    }

    if (
      normalized === "CSV" ||
      normalized === "EXCEL" ||
      normalized === "XLSX"
    ) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
          <FileSpreadsheet size={11} />
          {normalized === "XLSX"
            ? "Excel"
            : normalized}
        </span>
      );
    }

    return (
      <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
        {normalized}
      </span>
    );
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const getStatusBadge = (status) => {
    const normalized =
      String(status || "READY").toUpperCase();

    if (
      normalized === "READY" ||
      normalized === "COMPLETED" ||
      normalized === "SUCCESS"
    ) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Ready
        </span>
      );
    }

    if (
      normalized === "PROCESSING" ||
      normalized === "GENERATING"
    ) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-600">
          <Loader2
            size={10}
            className="animate-spin"
          />
          Processing
        </span>
      );
    }

    if (
      normalized === "FAILED" ||
      normalized === "ERROR"
    ) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-600">
          Failed
        </span>
      );
    }

    return (
      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
        {normalized}
      </span>
    );
  };

  // =========================================================
  // EMPTY CHART
  // =========================================================

  const EmptyChart = () => (
    <div className="flex h-full min-h-[260px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gray-50">
          <BarChart3
            size={20}
            className="text-gray-300"
          />
        </div>

        <p className="text-sm font-medium text-gray-500">
          No report data available
        </p>

        <p className="mt-1 text-xs text-gray-400">
          Data will appear here once reports are
          available.
        </p>
      </div>
    </div>
  );

  // =========================================================
  // EMPTY TABLE
  // =========================================================

  const EmptyTable = ({
    message = "No reports available",
  }) => (
    <div className="flex min-h-[180px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-50">
          <FileText
            size={18}
            className="text-gray-300"
          />
        </div>

        <p className="text-sm font-medium text-gray-500">
          {message}
        </p>

        <p className="mt-1 text-xs text-gray-400">
          Generated reports will appear here.
        </p>
      </div>
    </div>
  );

  // =========================================================
  // REPORT CATEGORY FALLBACK
  // =========================================================

  const displayCategories =
    reportCategories.length > 0
      ? reportCategories
      : [
          {
            name: "Hostel Reports",
            description:
              "Platform hostel statistics",
            count: 0,
            icon: "hostel",
          },
          {
            name: "User Reports",
            description:
              "User registrations and activity",
            count: 0,
            icon: "user",
          },
          {
            name: "Owner Reports",
            description:
              "Owner registrations and status",
            count: 0,
            icon: "owner",
          },
          {
            name: "Revenue Reports",
            description:
              "Revenue and transactions",
            count: 0,
            icon: "revenue",
          },
        ];

  // =========================================================
  // CATEGORY ICON
  // =========================================================

  const getCategoryIcon = (category) => {
    const icon =
      String(
        category.icon ||
          category.type ||
          category.name ||
          ""
      ).toLowerCase();

    if (icon.includes("user")) {
      return Users;
    }

    if (icon.includes("owner")) {
      return ShieldCheck;
    }

    if (icon.includes("revenue")) {
      return IndianRupee;
    }

    if (icon.includes("subscription")) {
      return CreditCard;
    }

    if (icon.includes("approval")) {
      return CheckCircle2;
    }

    return Building2;
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-800">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[235px] border-r border-gray-200 bg-white transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}

        <div className="flex h-[74px] items-center border-b border-gray-100 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2161F5] text-white">
              <Building2 size={17} />
            </div>

            <div>
              <p className="text-base font-bold text-gray-900">
                HostelHub
              </p>

              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar navigation */}

        <div className="h-[calc(100vh-74px)] overflow-y-auto px-3 py-5">
          {/* Management */}

          <div>
            <p className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.08em] text-gray-400">
              Management
            </p>

            <div className="space-y-0.5">
              {managementItems.map(
                (item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.label}
                      onClick={() =>
                        navigate(item.path)
                      }
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                    >
                      <Icon
                        size={16}
                        strokeWidth={1.8}
                      />

                      <span>
                        {item.label}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Analytics */}

          <div className="mt-6">
            <p className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.08em] text-gray-400">
              Analytics & Reports
            </p>

            <div className="space-y-0.5">
              {analyticsItems.map(
                (item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.label}
                      onClick={() =>
                        navigate(item.path)
                      }
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                        item.active
                          ? "bg-blue-50 text-[#2161F5]"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon
                        size={16}
                        strokeWidth={1.8}
                      />

                      <span>
                        {item.label}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* System */}

          <div className="mt-6">
            <p className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.08em] text-gray-400">
              System
            </p>

            <div className="space-y-0.5">
              {systemItems.map(
                (item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.label}
                      onClick={() =>
                        navigate(item.path)
                      }
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                    >
                      <Icon
                        size={16}
                        strokeWidth={1.8}
                      />

                      <span>
                        {item.label}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Bottom utility links */}

          <div className="mt-8 border-t border-gray-100 pt-4">
            <button
              onClick={() =>
                setShowGenerateModal(true)
              }
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <FileBarChart
                size={16}
                strokeWidth={1.8}
              />

              <span>
                Generate Reports
              </span>
            </button>

            <button
              onClick={() =>
                navigate("/admin/help")
              }
              className="mt-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <HelpCircle
                size={16}
                strokeWidth={1.8}
              />

              <span>
                Help Center
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}

      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
        />
      )}

      {/* =====================================================
          MAIN AREA
      ====================================================== */}

      <div className="lg:pl-[235px]">
        {/* ===================================================
            NAVBAR
        ==================================================== */}

        <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-50 lg:hidden"
            >
              <LayoutDashboard
                size={18}
              />
            </button>

            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Reports
              </h1>

              <p className="mt-0.5 hidden text-xs text-gray-400 sm:block">
                Generate, view and download platform
                reports
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification */}

            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50">
              <Bell size={17} />

              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>

            {/* Admin profile */}

            <div className="relative">
              <button
                onClick={() =>
                  setProfileOpen(
                    (prev) => !prev
                  )
                }
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2161F5] text-white">
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
                  size={14}
                  className="text-gray-400"
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-[180px] rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl">
                  <button
                    onClick={() =>
                      navigate(
                        "/admin/settings"
                      )
                    }
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <Settings size={14} />

                    Settings
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50"
                  >
                    <X size={14} />

                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ===================================================
            CONTENT
        ==================================================== */}

        <main className="px-4 py-5 sm:px-6 lg:px-7">
          {/* =================================================
              PAGE ACTIONS
          ================================================== */}

          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Reports Overview
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Monitor platform performance and generate
                detailed reports.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Date range */}

              <div className="relative">
                <button
                  onClick={() =>
                    setShowDateMenu(
                      (prev) => !prev
                    )
                  }
                  className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50"
                >
                  <CalendarDays
                    size={14}
                  />

                  {getDateRangeLabel()}

                  <ChevronDown
                    size={13}
                  />
                </button>

                {showDateMenu && (
                  <div className="absolute right-0 top-11 z-20 w-[155px] rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl">
                    {dateRanges.map(
                      (range) => (
                        <button
                          key={
                            range.value
                          }
                          onClick={() => {
                            setDateRange(
                              range.value
                            );

                            setShowDateMenu(
                              false
                            );
                          }}
                          className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm ${
                            dateRange ===
                            range.value
                              ? "bg-blue-50 font-semibold text-[#2161F5]"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {range.label}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Refresh */}

              <button
                onClick={() =>
                  fetchReports(true)
                }
                disabled={refreshing}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />
              </button>

              {/* Generate */}

              <button
                onClick={() =>
                  setShowGenerateModal(
                    true
                  )
                }
                className="flex h-9 items-center gap-2 rounded-lg bg-[#2161F5] px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                <Plus size={14} />

                Generate Report
              </button>
            </div>
          </div>

          {/* =================================================
              FILTER BAR
          ================================================== */}

          <section className="mb-5 rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {/* Report Type */}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Report Type
                </label>

                <div className="relative">
                  <button
                    onClick={() =>
                      setShowReportTypeMenu(
                        (prev) => !prev
                      )
                    }
                    className="flex h-9 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-2">
                      <FileText
                        size={13}
                      />

                      {getReportTypeLabel(
                        reportType
                      )}
                    </span>

                    <ChevronDown
                      size={13}
                    />
                  </button>

                  {showReportTypeMenu && (
                    <div className="absolute left-0 right-0 top-11 z-20 max-h-[260px] overflow-y-auto rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl">
                      {reportTypes.map(
                        (type) => (
                          <button
                            key={
                              type.value
                            }
                            onClick={() => {
                              setReportType(
                                type.value
                              );

                              setShowReportTypeMenu(
                                false
                              );
                            }}
                            className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm ${
                              reportType ===
                              type.value
                                ? "bg-blue-50 font-semibold text-[#2161F5]"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {type.label}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Date range */}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Date Range
                </label>

                <div className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm text-gray-600">
                  <CalendarDays
                    size={13}
                    className="text-gray-400"
                  />

                  {getDateRangeLabel()}
                </div>
              </div>

              {/* Format */}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Default Format
                </label>

                <select
                  value={reportFormat}
                  onChange={(e) =>
                    setReportFormat(
                      e.target.value
                    )
                  }
                  className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 outline-none focus:border-[#2161F5]"
                >
                  <option value="PDF">
                    PDF
                  </option>

                  <option value="CSV">
                    CSV
                  </option>

                  <option value="EXCEL">
                    Excel
                  </option>
                </select>
              </div>
            </div>
          </section>

          {/* =================================================
              KPI CARDS
          ================================================== */}

          <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {kpiCards.map(
              (card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">
                          {card.title}
                        </p>

                        {loading ? (
                          <div className="mt-2 h-6 w-20 animate-pulse rounded bg-gray-100" />
                        ) : (
                          <p className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900">
                            {card.value}
                          </p>
                        )}
                      </div>

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#2161F5]">
                        <Icon
                          size={16}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5">
                      <span
                        className={`text-sm font-semibold ${getGrowthColor(
                          card.growth
                        )}`}
                      >
                        {getGrowthText(
                          card.growth
                        )}
                      </span>

                      <span className="text-xs text-gray-400">
                        vs previous period
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </section>

          {/* =================================================
              REPORT OVERVIEW CHART
          ================================================== */}

          <section className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Report Overview
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  Platform performance for{" "}
                  {getDateRangeLabel().toLowerCase()}
                </p>
              </div>

              <select
                value={reportMetric}
                onChange={(e) =>
                  setReportMetric(
                    e.target.value
                  )
                }
                className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 outline-none focus:border-[#2161F5]"
              >
                <option value="revenue">
                  Revenue
                </option>

                <option value="hostels">
                  Hostels
                </option>

                <option value="users">
                  Users
                </option>

                <option value="approvals">
                  Approvals
                </option>
              </select>
            </div>

            <div className="h-[290px]">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2
                    size={20}
                    className="animate-spin text-gray-300"
                  />
                </div>
              ) : reportOverview.length >
                0 ? (
                <Line
                  data={lineChartData}
                  options={
                    lineChartOptions
                  }
                />
              ) : (
                <EmptyChart />
              )}
            </div>
          </section>

          {/* =================================================
              CATEGORY + RECENT REPORTS
          ================================================== */}

          <section className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
            {/* Report Categories */}

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900">
                  Report Categories
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  Available platform reports
                </p>
              </div>

              <div className="space-y-2.5">
                {displayCategories.map(
                  (category, index) => {
                    const Icon =
                      getCategoryIcon(
                        category
                      );

                    return (
                      <button
                        key={
                          category.id ||
                          category.name ||
                          index
                        }
                        onClick={() => {
                          const categoryType =
                            category.type ||
                            category.code;

                          if (
                            categoryType
                          ) {
                            setReportType(
                              String(
                                categoryType
                              ).toUpperCase()
                            );
                          }
                        }}
                        className="flex w-full items-center gap-3 rounded-lg border border-gray-100 p-3 text-left transition hover:border-blue-100 hover:bg-blue-50/40"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                          <Icon
                            size={15}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-800">
                            {category.name ||
                              category.label ||
                              "Report"}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-gray-400">
                            {category.description ||
                              "Platform report"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-500">
                            {formatNumber(
                              category.count ??
                                category.value ??
                                category.total ??
                                0
                            )}
                          </span>

                          <ChevronRight
                            size={14}
                            className="text-gray-300"
                          />
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Recent Reports */}

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Recent Reports
                  </h3>

                  <p className="mt-1 text-xs text-gray-400">
                    Recently generated reports
                  </p>
                </div>

                <button
                  onClick={() =>
                    setReportType("ALL")
                  }
                  className="text-sm font-semibold text-[#2161F5] hover:underline"
                >
                  View All
                </button>
              </div>

              {recentReports.length ===
              0 ? (
                <EmptyTable message="No recent reports" />
              ) : (
                <div className="space-y-1">
                  {recentReports
                    .slice(0, 5)
                    .map(
                      (report, index) => (
                        <div
                          key={
                            report.id ||
                            report.reportId ||
                            index
                          }
                          className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-gray-50"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2161F5]">
                            <FileText
                              size={14}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-800">
                              {report.name ||
                                report.reportName ||
                                "Report"}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-400">
                              {formatDate(
                                report.createdAt ||
                                  report.date ||
                                  report.generatedAt
                              )}
                            </p>
                          </div>

                          <div className="hidden sm:block">
                            {getFormatBadge(
                              report.format
                            )}
                          </div>

                          <button
                            onClick={() =>
                              handleDownloadReport(
                                report
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            title="Download"
                          >
                            <Download
                              size={14}
                            />
                          </button>
                        </div>
                      )
                    )}
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              DETAILED REPORTS
          ================================================== */}

          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Detailed Reports
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  View and download generated reports
                </p>
              </div>

              <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-500">
                {formatNumber(
                  reports.length
                )}{" "}
                reports
              </span>
            </div>

            {reports.length === 0 ? (
              <EmptyTable />
            ) : (
              <>
                {/* Desktop table */}

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Report Name
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Type
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Generated By
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Date
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Format
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Status
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {reports.map(
                        (report, index) => (
                          <tr
                            key={
                              report.id ||
                              report.reportId ||
                              index
                            }
                            className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-50 text-gray-500">
                                  <FileText
                                    size={13}
                                  />
                                </div>

                                <div className="min-w-0">
                                  <p className="max-w-[200px] truncate text-sm font-semibold text-gray-800">
                                    {report.name ||
                                      report.reportName ||
                                      "Report"}
                                  </p>

                                  {report.description && (
                                    <p className="mt-0.5 max-w-[200px] truncate text-xs text-gray-400">
                                      {
                                        report.description
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-600">
                              {getReportTypeLabel(
                                String(
                                  report.type ||
                                    "ALL"
                                ).toUpperCase()
                              )}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-600">
                              {report.generatedBy ||
                                report.createdBy ||
                                "—"}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-500">
                              {formatDate(
                                report.createdAt ||
                                  report.generatedAt ||
                                  report.date
                              )}
                            </td>

                            <td className="px-4 py-3">
                              {getFormatBadge(
                                report.format
                              )}
                            </td>

                            <td className="px-4 py-3">
                              {getStatusBadge(
                                report.status
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() =>
                                    handleViewReport(
                                      report
                                    )
                                  }
                                  className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                                  title="View"
                                >
                                  <Eye
                                    size={13}
                                  />
                                </button>

                                <button
                                  onClick={() =>
                                    handleDownloadReport(
                                      report
                                    )
                                  }
                                  className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                                  title="Download"
                                >
                                  <Download
                                    size={13}
                                  />
                                </button>

                                <button
                                  className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                                  title="More"
                                >
                                  <MoreVertical
                                    size={13}
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}

                <div className="space-y-2 p-3 md:hidden">
                  {reports.map(
                    (report, index) => (
                      <div
                        key={
                          report.id ||
                          report.reportId ||
                          index
                        }
                        className="rounded-lg border border-gray-100 p-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2161F5]">
                            <FileText
                              size={14}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-800">
                              {report.name ||
                                report.reportName ||
                                "Report"}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {report.generatedBy ||
                                report.createdBy ||
                                "—"}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {getFormatBadge(
                                report.format
                              )}

                              {getStatusBadge(
                                report.status
                              )}

                              <span className="text-xs text-gray-400">
                                {formatDate(
                                  report.createdAt ||
                                    report.generatedAt ||
                                    report.date
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex gap-2 border-t border-gray-100 pt-2">
                          <button
                            onClick={() =>
                              handleViewReport(
                                report
                              )
                            }
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600"
                          >
                            <Eye
                              size={13}
                            />

                            View
                          </button>

                          <button
                            onClick={() =>
                              handleDownloadReport(
                                report
                              )
                            }
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#2161F5] py-2 text-sm font-medium text-white"
                          >
                            <Download
                              size={13}
                            />

                            Download
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      {/* =====================================================
          GENERATE REPORT MODAL
      ====================================================== */}

      {showGenerateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-[500px] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal header */}

            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Generate Report
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  Configure the report you want to generate.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowGenerateModal(
                    false
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}

            <div className="space-y-4 p-5">
              {/* Report type */}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Report Type
                </label>

                <select
                  value={generateForm.type}
                  onChange={(e) =>
                    setGenerateForm(
                      (prev) => ({
                        ...prev,
                        type: e.target.value,
                      })
                    )
                  }
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 outline-none focus:border-[#2161F5]"
                >
                  {reportTypes
                    .filter(
                      (type) =>
                        type.value !==
                        "ALL"
                    )
                    .map((type) => (
                      <option
                        key={type.value}
                        value={
                          type.value
                        }
                      >
                        {type.label}
                      </option>
                    ))}
                </select>
              </div>

              {/* Dates */}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Date Range
                </label>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-gray-400">
                      Start Date
                    </label>

                    <input
                      type="date"
                      value={
                        generateForm.startDate
                      }
                      onChange={(e) =>
                        setGenerateForm(
                          (prev) => ({
                            ...prev,
                            startDate:
                              e.target
                                .value,
                          })
                        )
                      }
                      className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:border-[#2161F5]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-gray-400">
                      End Date
                    </label>

                    <input
                      type="date"
                      value={
                        generateForm.endDate
                      }
                      onChange={(e) =>
                        setGenerateForm(
                          (prev) => ({
                            ...prev,
                            endDate:
                              e.target
                                .value,
                          })
                        )
                      }
                      className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:border-[#2161F5]"
                    />
                  </div>
                </div>
              </div>

              {/* Format */}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Format
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    "PDF",
                    "CSV",
                    "EXCEL",
                  ].map((format) => (
                    <button
                      key={format}
                      onClick={() =>
                        setGenerateForm(
                          (prev) => ({
                            ...prev,
                            format,
                          })
                        )
                      }
                      className={`flex h-9 items-center justify-center rounded-lg border text-sm font-semibold ${
                        generateForm.format ===
                        format
                          ? "border-[#2161F5] bg-blue-50 text-[#2161F5]"
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              {/* Include */}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Include
                </label>

                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-100 p-2.5">
                    <input
                      type="checkbox"
                      checked={
                        generateForm.includeSummary
                      }
                      onChange={(e) =>
                        setGenerateForm(
                          (prev) => ({
                            ...prev,
                            includeSummary:
                              e.target
                                .checked,
                          })
                        )
                      }
                      className="h-3.5 w-3.5 rounded border-gray-300 text-[#2161F5] focus:ring-[#2161F5]"
                    />

                    <span className="text-sm text-gray-600">
                      Summary
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-100 p-2.5">
                    <input
                      type="checkbox"
                      checked={
                        generateForm.includeDetails
                      }
                      onChange={(e) =>
                        setGenerateForm(
                          (prev) => ({
                            ...prev,
                            includeDetails:
                              e.target
                                .checked,
                          })
                        )
                      }
                      className="h-3.5 w-3.5 rounded border-gray-300 text-[#2161F5] focus:ring-[#2161F5]"
                    />

                    <span className="text-sm text-gray-600">
                      Detailed Data
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-100 p-2.5">
                    <input
                      type="checkbox"
                      checked={
                        generateForm.includeCharts
                      }
                      onChange={(e) =>
                        setGenerateForm(
                          (prev) => ({
                            ...prev,
                            includeCharts:
                              e.target
                                .checked,
                          })
                        )
                      }
                      className="h-3.5 w-3.5 rounded border-gray-300 text-[#2161F5] focus:ring-[#2161F5]"
                    />

                    <span className="text-sm text-gray-600">
                      Charts
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal footer */}

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button
                onClick={() =>
                  setShowGenerateModal(
                    false
                  )
                }
                disabled={
                  generatingReport
                }
                className="h-9 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={
                  handleGenerateReport
                }
                disabled={
                  generatingReport
                }
                className="flex h-9 items-center gap-2 rounded-lg bg-[#2161F5] px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {generatingReport ? (
                  <>
                    <Loader2
                      size={13}
                      className="animate-spin"
                    />

                    Generating...
                  </>
                ) : (
                  <>
                    <FileBarChart
                      size={13}
                    />

                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          REPORT DETAILS MODAL
      ====================================================== */}

      {showReportDetails &&
        selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4 py-6">
            <div className="w-full max-w-[460px] rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Report Details
                  </h3>

                  <p className="mt-1 text-xs text-gray-400">
                    Information about the selected report.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowReportDetails(
                      false
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 p-5">
                <DetailRow
                  label="Report Name"
                  value={
                    selectedReport.name ||
                    selectedReport.reportName ||
                    "—"
                  }
                />

                <DetailRow
                  label="Type"
                  value={getReportTypeLabel(
                    String(
                      selectedReport.type ||
                        "ALL"
                    ).toUpperCase()
                  )}
                />

                <DetailRow
                  label="Generated By"
                  value={
                    selectedReport.generatedBy ||
                    selectedReport.createdBy ||
                    "—"
                  }
                />

                <DetailRow
                  label="Generated Date"
                  value={formatDate(
                    selectedReport.createdAt ||
                      selectedReport.generatedAt ||
                      selectedReport.date
                  )}
                />

                <DetailRow
                  label="Format"
                  value={
                    selectedReport.format ||
                    "PDF"
                  }
                />

                <DetailRow
                  label="Status"
                  value={
                    selectedReport.status ||
                    "READY"
                  }
                />

                {selectedReport.description && (
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Description
                    </p>

                    <p className="mt-1 text-sm leading-5 text-gray-600">
                      {
                        selectedReport.description
                      }
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
                <button
                  onClick={() =>
                    setShowReportDetails(
                      false
                    )
                  }
                  className="h-9 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Close
                </button>

                <button
                  onClick={() =>
                    handleDownloadReport(
                      selectedReport
                    )
                  }
                  className="flex h-9 items-center gap-2 rounded-lg bg-[#2161F5] px-4 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Download
                    size={13}
                  />

                  Download
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

// =============================================================
// DETAIL ROW
// =============================================================

const DetailRow = ({
  label,
  value,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 px-3 py-2.5">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-gray-700">
        {value}
      </span>
    </div>
  );
};

export default Reports;