import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Building2,
  Clock,
  MessageSquareWarning,
  ShieldCheck,
  BarChart3,
  Gem,
  FileText,
  Users,
  Settings,
  History,
  Bell,
  Moon,
  UserCircle,
  ChevronDown,
  Search,
  Menu,
  X,
  Download,
  RefreshCw,
  CalendarDays,
  HelpCircle,
  LogOut,
  FileBarChart,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ClipboardList,
  MapPin,
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import {
  Line,
  Doughnut,
  Bar,
} from "react-chartjs-2";

import api from "../api/axiosConfig";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const PRIMARY_BLUE = "#165DFC";

/* ========================================================================
   HELPERS
   ======================================================================== */

const normalizeStatus = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
};

const getArrayFromResponse = (response) => {
  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.hostels)) {
    return response.data.hostels;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.data?.content)) {
    return response.data.content;
  }

  return [];
};

const getHostelId = (hostel) => {
  return (
    hostel?.hostelId ??
    hostel?.id ??
    hostel?.hostel?.hostelId ??
    hostel?.hostel?.id ??
    null
  );
};

const getHostelName = (hostel) => {
  return (
    hostel?.hostelName ??
    hostel?.name ??
    hostel?.hostel?.hostelName ??
    hostel?.hostel?.name ??
    "Unnamed Hostel"
  );
};

const getApprovalStatus = (hostel) => {
  return normalizeStatus(
    hostel?.approvalStatus ??
      hostel?.status ??
      hostel?.approval?.status ??
      hostel?.hostel?.approvalStatus ??
      hostel?.hostel?.status
  );
};

const getOwnerName = (hostel) => {
  return (
    hostel?.ownerName ??
    hostel?.owner?.name ??
    hostel?.owner?.fullName ??
    hostel?.hostel?.ownerName ??
    hostel?.hostel?.owner?.name ??
    "Owner"
  );
};

const getLocation = (hostel) => {
  const location =
    hostel?.location ??
    hostel?.hostelLocation ??
    hostel?.hostel?.location ??
    hostel?.hostel?.hostelLocation ??
    {};

  if (typeof location === "string") {
    return location;
  }

  const parts = [
    location?.area,
    location?.locality,
    location?.city,
    location?.state,
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(", ");
  }

  return (
    hostel?.city ??
    hostel?.area ??
    hostel?.locality ??
    hostel?.hostel?.city ??
    "Location unavailable"
  );
};

const getCreatedDate = (hostel) => {
  return (
    hostel?.createdAt ??
    hostel?.createdDate ??
    hostel?.submittedAt ??
    hostel?.submissionDate ??
    hostel?.hostel?.createdAt ??
    hostel?.hostel?.createdDate ??
    null
  );
};

const formatNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "—";
  }

  return Number(value).toLocaleString("en-IN");
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatShortDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const getStatusLabel = (status) => {
  switch (normalizeStatus(status)) {
    case "APPROVED":
      return "Approved";

    case "PENDING":
      return "Pending";

    case "OWNER_VERIFICATION_PENDING":
      return "Owner Verification";

    case "REJECTED":
      return "Rejected";

    case "SUSPENDED":
      return "Suspended";

    case "DRAFT":
      return "Draft";

    case "IN_REVIEW":
      return "In Review";

    default:
      return status
        ? String(status)
            .toLowerCase()
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) =>
              char.toUpperCase()
            )
        : "Unknown";
  }
};

/* ========================================================================
   SMALL COMPONENTS
   ======================================================================== */

const NavItem = ({
  icon: Icon,
  label,
  active = false,
  badge,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
        active
          ? "bg-[#165DFC] text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon
        size={19}
        strokeWidth={1.8}
        className={
          active
            ? "text-white"
            : "text-slate-500 group-hover:text-slate-700"
        }
      />

      <span className="flex-1 text-sm font-medium">
        {label}
      </span>

      {badge !== undefined &&
        badge !== null && (
          <span
            className={`min-w-[22px] rounded-full px-1.5 py-0.5 text-xs font-bold ${
              active
                ? "bg-white/20 text-white"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {badge}
          </span>
        )}
    </button>
  );
};

const SectionLabel = ({ children }) => {
  return (
    <p className="px-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
      {children}
    </p>
  );
};

const MetricCard = ({
  icon: Icon,
  title,
  value,
  supportingText,
  iconClass,
  valueClass = "text-slate-900",
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p
            className={`mt-2 text-2xl font-bold tracking-tight ${valueClass}`}
          >
            {value}
          </p>

          {supportingText && (
            <p className="mt-1 text-xs text-slate-400">
              {supportingText}
            </p>
          )}
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={19} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const normalized = normalizeStatus(status);

  let classes =
    "bg-slate-50 text-slate-500 border-slate-200";

  if (normalized === "APPROVED") {
    classes =
      "bg-emerald-50 text-emerald-600 border-emerald-100";
  } else if (
    normalized === "PENDING" ||
    normalized === "OWNER_VERIFICATION_PENDING"
  ) {
    classes =
      "bg-amber-50 text-amber-600 border-amber-100";
  } else if (normalized === "REJECTED") {
    classes =
      "bg-rose-50 text-rose-600 border-rose-100";
  } else if (normalized === "SUSPENDED") {
    classes =
      "bg-red-50 text-red-600 border-red-100";
  } else if (normalized === "DRAFT") {
    classes =
      "bg-slate-50 text-slate-500 border-slate-200";
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${classes}`}
    >
      {getStatusLabel(status)}
    </span>
  );
};

/* ========================================================================
   MAIN COMPONENT
   ======================================================================== */

const AdminAnalytics = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [dateRange, setDateRange] =
    useState("7");

  const [hostels, setHostels] = useState([]);

  const [verificationStatuses, setVerificationStatuses] =
    useState({});

  const [verificationAvailable, setVerificationAvailable] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [overviewMode, setOverviewMode] =
    useState("hostels");

  /* ======================================================================
     LOAD REAL HOSTEL DATA
     ====================================================================== */

  const loadAnalyticsData = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        /*
         * Existing admin endpoint from your project.
         */
        const response = await api.get(
          "/api/admin/hostels"
        );

        const hostelList =
          getArrayFromResponse(response);

        setHostels(hostelList);

        /*
         * Owner verification is loaded separately because
         * your owner verification status is exposed per hostel.
         */
        const nextVerificationStatuses = {};

        let verificationEndpointWorked = true;

        await Promise.all(
          hostelList
            .map((hostel) => getHostelId(hostel))
            .filter(Boolean)
            .map(async (hostelId) => {
              try {
                const verificationResponse =
                  await api.get(
                    `/api/admin/hostels/${hostelId}/owner/email-verification-status`
                  );

                const data =
                  verificationResponse?.data || {};

                nextVerificationStatuses[
                  String(hostelId)
                ] =
                  data?.emailVerificationStatus ??
                  data?.status ??
                  data?.verificationStatus ??
                  null;
              } catch (verificationError) {
                /*
                 * Do not make the whole Analytics page fail
                 * just because the optional verification endpoint
                 * is unavailable.
                 */
                verificationEndpointWorked = false;

                nextVerificationStatuses[
                  String(hostelId)
                ] = null;
              }
            })
        );

        setVerificationStatuses(
          nextVerificationStatuses
        );

        setVerificationAvailable(
          verificationEndpointWorked
        );
      } catch (err) {
        console.error(
          "Failed to load admin analytics:",
          err
        );

        setHostels([]);

        setError(
          err?.response?.data?.message ||
            "Unable to load analytics data from the server."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  /* ======================================================================
     REFRESH
     ====================================================================== */

  const handleRefresh = () => {
    loadAnalyticsData({
      silent: true,
    });
  };

  /* ======================================================================
     REAL HOSTEL STATUS COUNTS
     ====================================================================== */

  const statusCounts = useMemo(() => {
    const counts = {
      total: hostels.length,
      approved: 0,
      pending: 0,
      rejected: 0,
      draft: 0,
      suspended: 0,
      ownerVerificationPending: 0,
      inReview: 0,
    };

    hostels.forEach((hostel) => {
      const status =
        getApprovalStatus(hostel);

      if (status === "APPROVED") {
        counts.approved += 1;
      } else if (status === "PENDING") {
        counts.pending += 1;
      } else if (status === "REJECTED") {
        counts.rejected += 1;
      } else if (status === "DRAFT") {
        counts.draft += 1;
      } else if (status === "SUSPENDED") {
        counts.suspended += 1;
      } else if (
        status === "OWNER_VERIFICATION_PENDING"
      ) {
        counts.ownerVerificationPending += 1;
      } else if (status === "IN_REVIEW") {
        counts.inReview += 1;
      }
    });

    return counts;
  }, [hostels]);

  /* ======================================================================
     OWNER VERIFICATION COUNT
     ====================================================================== */

  const pendingOwnerVerifications = useMemo(() => {
    if (!verificationAvailable) {
      return null;
    }

    let count = 0;

    Object.values(
      verificationStatuses
    ).forEach((status) => {
      const normalized =
        normalizeStatus(status);

      if (
        normalized === "OTP_SENT" ||
        normalized ===
          "OWNER_VERIFICATION_PENDING" ||
        normalized === "PENDING"
      ) {
        count += 1;
      }
    });

    return count;
  }, [
    verificationStatuses,
    verificationAvailable,
  ]);

  /* ======================================================================
     LOCATION DATA
     ====================================================================== */

  const locationStats = useMemo(() => {
    const map = new Map();

    hostels.forEach((hostel) => {
      const location = getLocation(hostel);

      if (
        !location ||
        location === "Location unavailable"
      ) {
        return;
      }

      /*
       * Use city/area text returned by backend as-is.
       */
      const key = location.trim();

      map.set(
        key,
        (map.get(key) || 0) + 1
      );
    });

    return Array.from(map.entries())
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort(
        (a, b) => b.count - a.count
      )
      .slice(0, 6);
  }, [hostels]);

  /* ======================================================================
     SEARCH
     ====================================================================== */

  const filteredHostels = useMemo(() => {
    const query =
      searchTerm.trim().toLowerCase();

    if (!query) {
      return hostels;
    }

    return hostels.filter((hostel) => {
      const text = [
        getHostelName(hostel),
        getOwnerName(hostel),
        getLocation(hostel),
        getApprovalStatus(hostel),
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [hostels, searchTerm]);

  /* ======================================================================
     DATE RANGE
     ====================================================================== */

  const rangeDays = Number(dateRange);

  const dateRangeLabel = useMemo(() => {
    switch (dateRange) {
      case "30":
        return "Last 30 Days";

      case "90":
        return "Last 3 Months";

      case "365":
        return "Last 1 Year";

      default:
        return "Last 7 Days";
    }
  }, [dateRange]);

  /* ======================================================================
     HOSTEL REGISTRATION TREND
     *
     * This chart is only populated when the API actually provides a
     * usable created/submitted date. Otherwise it intentionally shows
     * "No date data available".
     * ====================================================================== */

  const registrationTrend = useMemo(() => {
    const now = new Date();

    const buckets = [];

    if (rangeDays <= 7) {
      for (let i = rangeDays - 1; i >= 0; i -= 1) {
        const date = new Date(now);

        date.setHours(0, 0, 0, 0);
        date.setDate(
          now.getDate() - i
        );

        buckets.push({
          key: date.toISOString().slice(0, 10),
          label: date.toLocaleDateString(
            "en-IN",
            {
              day: "2-digit",
              month: "short",
            }
          ),
          count: 0,
        });
      }
    } else if (rangeDays <= 90) {
      for (let i = 11; i >= 0; i -= 1) {
        const date = new Date(now);

        date.setHours(0, 0, 0, 0);
        date.setDate(
          now.getDate() - i * 7
        );

        buckets.push({
          key: `${date.getFullYear()}-${date.getMonth()}-${Math.floor(
            date.getDate() / 7
          )}`,
          label: date.toLocaleDateString(
            "en-IN",
            {
              day: "2-digit",
              month: "short",
            }
          ),
          count: 0,
        });
      }
    } else {
      for (let i = 11; i >= 0; i -= 1) {
        const date = new Date(
          now.getFullYear(),
          now.getMonth() - i,
          1
        );

        buckets.push({
          key: `${date.getFullYear()}-${date.getMonth()}`,
          label: date.toLocaleDateString(
            "en-IN",
            {
              month: "short",
            }
          ),
          count: 0,
        });
      }
    }

    let hasDateData = false;

    hostels.forEach((hostel) => {
      const rawDate =
        getCreatedDate(hostel);

      if (!rawDate) {
        return;
      }

      const date = new Date(rawDate);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      hasDateData = true;

      if (rangeDays <= 7) {
        const key = date
          .toISOString()
          .slice(0, 10);

        const bucket = buckets.find(
          (item) => item.key === key
        );

        if (bucket) {
          bucket.count += 1;
        }
      } else if (rangeDays <= 90) {
        const diff =
          Math.floor(
            (now.getTime() -
              date.getTime()) /
              86400000
          );

        if (
          diff >= 0 &&
          diff < rangeDays
        ) {
          const bucketIndex =
            buckets.length -
            1 -
            Math.floor(diff / 7);

          if (
            buckets[bucketIndex]
          ) {
            buckets[bucketIndex].count += 1;
          }
        }
      } else {
        const key = `${date.getFullYear()}-${date.getMonth()}`;

        const bucket = buckets.find(
          (item) => item.key === key
        );

        if (bucket) {
          bucket.count += 1;
        }
      }
    });

    return {
      hasDateData,
      labels: buckets.map(
        (item) => item.label
      ),
      values: buckets.map(
        (item) => item.count
      ),
    };
  }, [hostels, rangeDays]);

  /* ======================================================================
     CHART DATA
     ====================================================================== */

  const overviewChartData = useMemo(() => {
    return {
      labels:
        registrationTrend.labels,
      datasets: [
        {
          label: "New Hostels",
          data:
            registrationTrend.values,
          borderColor: PRIMARY_BLUE,
          backgroundColor:
            "rgba(22,93,252,0.08)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor:
            PRIMARY_BLUE,
          pointBorderColor:
            "#ffffff",
          pointBorderWidth: 2,
        },
      ],
    };
  }, [registrationTrend]);

  const overviewChartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: "#0F172A",
        titleColor: "#FFFFFF",
        bodyColor: "#FFFFFF",
        padding: 10,
        displayColors: false,
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          color: "#94A3B8",
          font: {
            size: 10,
          },

          maxRotation: 0,
        },
      },

      y: {
        beginAtZero: true,

        grid: {
          color: "#E2E8F0",
          borderDash: [3, 3],
        },

        ticks: {
          color: "#94A3B8",
          font: {
            size: 10,
          },

          precision: 0,
        },
      },
    },
  };

  /* ======================================================================
     STATUS DONUT
     ====================================================================== */

  const statusDonutData = useMemo(() => {
    return {
      labels: [
        "Approved",
        "Pending",
        "In Review",
        "Rejected",
      ],

      datasets: [
        {
          data: [
            statusCounts.approved,
            statusCounts.pending,
            statusCounts.inReview,
            statusCounts.rejected,
          ],

          backgroundColor: [
            "#10B981",
            "#F59E0B",
            "#3B82F6",
            "#F43F5E",
          ],

          borderWidth: 0,
          hoverOffset: 5,
        },
      ],
    };
  }, [statusCounts]);

  const statusDonutOptions = {
    responsive: true,
    maintainAspectRatio: false,

    cutout: "72%",

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: "#0F172A",
        padding: 10,
        displayColors: false,
      },
    },
  };

  /* ======================================================================
     TOP LOCATIONS BAR
     ====================================================================== */

  const locationChartData = useMemo(() => {
    return {
      labels: locationStats.map(
        (item) => item.name
      ),

      datasets: [
        {
          label: "Hostels",
          data: locationStats.map(
            (item) => item.count
          ),

          backgroundColor:
            "rgba(22,93,252,0.85)",

          borderRadius: 6,
          borderSkipped: false,
          barThickness: 15,
        },
      ],
    };
  }, [locationStats]);

  const locationChartOptions = {
    indexAxis: "y",

    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: "#0F172A",
        padding: 10,
        displayColors: false,

        callbacks: {
          label: (context) =>
            `${context.raw} hostel${
              context.raw === 1
                ? ""
                : "s"
            }`,
        },
      },
    },

    scales: {
      x: {
        beginAtZero: true,

        grid: {
          color: "#E2E8F0",
        },

        ticks: {
          color: "#94A3B8",
          font: {
            size: 10,
          },
          precision: 0,
        },
      },

      y: {
        grid: {
          display: false,
        },

        ticks: {
          color: "#475569",
          font: {
            size: 10,
          },
        },
      },
    },
  };

  /* ======================================================================
     RECENT HOSTELS
     ====================================================================== */

  const recentHostels = useMemo(() => {
    return [...filteredHostels]
      .sort((a, b) => {
        const aDate =
          getCreatedDate(a);

        const bDate =
          getCreatedDate(b);

        if (!aDate && !bDate) {
          return 0;
        }

        if (!aDate) {
          return 1;
        }

        if (!bDate) {
          return -1;
        }

        return (
          new Date(bDate).getTime() -
          new Date(aDate).getTime()
        );
      })
      .slice(0, 6);
  }, [filteredHostels]);

  /* ======================================================================
     SIDEBAR NAVIGATION
     ====================================================================== */

  const go = (path) => {
    setSidebarOpen(false);
    setProfileOpen(false);
    navigate(path);
  };

  /* ======================================================================
     EXPORT REAL HOSTEL DATA
     ====================================================================== */

  const handleExport = () => {
    if (!hostels.length) {
      return;
    }

    const rows = [
      [
        "Hostel",
        "Owner",
        "Location",
        "Status",
        "Submitted",
      ],
      ...hostels.map((hostel) => [
        getHostelName(hostel),
        getOwnerName(hostel),
        getLocation(hostel),
        getStatusLabel(
          getApprovalStatus(hostel)
        ),
        formatDate(
          getCreatedDate(hostel)
        ),
      ]),
    ];

    const csvContent = rows
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(
              /"/g,
              '""'
            )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "hostelhub-admin-analytics.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* ======================================================================
     RENDER
     ====================================================================== */

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800">
      {/* ==================================================================
          MOBILE OVERLAY
          ================================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* ==================================================================
          SIDEBAR
          ================================================================== */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[292px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Logo */}

        <div className="flex h-[74px] shrink-0 items-center border-b border-slate-200 px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#165DFC] shadow-[0_4px_10px_rgba(22,93,252,0.20)]">
              <Building2
                size={23}
                color="#FFFFFF"
                strokeWidth={1.9}
              />
            </div>

            <div>
              <h1 className="text-xl font-bold leading-none tracking-tight text-slate-900">
                HostelHub
              </h1>

              <p className="mt-1.5 text-sm font-medium text-slate-400">
                Admin Console
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-5">
            {/* MAIN */}

            <div>
              <SectionLabel>
                Main
              </SectionLabel>

              <nav className="mt-2 space-y-1">
                <NavItem
                  icon={LayoutDashboard}
                  label="Dashboard"
                  onClick={() =>
                    go("/admin/dashboard")
                  }
                />
              </nav>
            </div>

            {/* MANAGEMENT */}

            <div>
              <SectionLabel>
                Management
              </SectionLabel>

              <nav className="mt-2 space-y-1">
                <NavItem
                  icon={Building2}
                  label="Hostel Requests"
                  onClick={() =>
                    go(
                      "/admin/hostel-management"
                    )
                  }
                />

                <NavItem
                  icon={Clock}
                  label="Pending Approvals"
                  badge={
                    statusCounts.pending ||
                    undefined
                  }
                  onClick={() =>
                    go(
                      "/admin/pending-approvals"
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
                  onClick={() =>
                    go(
                      "/admin/user-issues"
                    )
                  }
                />

                <NavItem
                  icon={ShieldCheck}
                  label="Owner Verification"
                  badge={
                    pendingOwnerVerifications ??
                    undefined
                  }
                  onClick={() =>
                    go(
                      "/admin/owner-verification"
                    )
                  }
                />
              </nav>
            </div>

            {/* ANALYTICS & REPORTS */}

            <div>
              <SectionLabel>
                Analytics & Reports
              </SectionLabel>

              <nav className="mt-2 space-y-1">
                <NavItem
                  icon={BarChart3}
                  label="Analytics"
                  active
                  onClick={() =>
                    go("/admin/analytics")
                  }
                />

                <NavItem
                  icon={Gem}
                  label="Subscription"
                  onClick={() =>
                    go(
                      "/admin/subscription"
                    )
                  }
                />

                <NavItem
                  icon={FileText}
                  label="Reports"
                  onClick={() =>
                    go("/admin/reports")
                  }
                />
              </nav>
            </div>

            {/* SYSTEM */}

            <div>
              <SectionLabel>
                System
              </SectionLabel>

              <nav className="mt-2 space-y-1">
                <NavItem
                  icon={Users}
                  label="Users"
                  onClick={() =>
                    go("/admin/users")
                  }
                />

                <NavItem
                  icon={Settings}
                  label="System Settings"
                  onClick={() =>
                    go("/admin/settings")
                  }
                />

                <NavItem
                  icon={History}
                  label="Audit Logs"
                  onClick={() =>
                    go("/admin/audit-logs")
                  }
                />
              </nav>
            </div>
          </div>
        </div>

        {/* Generate Reports */}

        <div className="shrink-0 border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={() =>
              go("/admin/reports")
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#BFD3FF] bg-white px-3 py-3 text-sm font-semibold text-[#165DFC] transition hover:bg-blue-50"
          >
            <FileBarChart size={17} />
            Generate Reports
          </button>

          <button
            type="button"
            onClick={() =>
              go("/admin/help")
            }
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          >
            <HelpCircle size={18} />
            Help Center
          </button>

          <button
            type="button"
            onClick={() => {
              /*
               * Keep your existing logout implementation here
               * if you already have one in your Admin pages.
               */
              localStorage.removeItem(
                "token"
              );

              localStorage.removeItem(
                "adminToken"
              );

              go("/");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* ==================================================================
          MAIN AREA
          ================================================================== */}

      <main className="min-h-screen lg:ml-[292px]">
        {/* ==================================================================
            HEADER
            ================================================================== */}

        <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                setSidebarOpen(true)
              }
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 lg:hidden"
            >
              <Menu size={21} />
            </button>

            {/* Search */}

            <div className="relative hidden md:block">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                placeholder="Search hostel, owner, location..."
                className="h-10 w-[360px] rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-16 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-200 focus:bg-white"
              />

              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-400">
                ⌘ K
              </span>
            </div>
          </div>

          {/* Right header */}

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notification */}

            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50"
            >
              <Bell size={20} />

              <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500" />
            </button>

            {/* Dark mode */}

            <button
              type="button"
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 sm:flex"
            >
              <Moon size={20} />
            </button>

            <div className="hidden h-7 w-px bg-slate-200 sm:block" />

            {/* Admin */}

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setProfileOpen(
                    (value) => !value
                  )
                }
                className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-[#165DFC]">
                  <UserCircle
                    size={20}
                  />
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-slate-800">
                    Admin User
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Super Admin
                  </p>
                </div>

                <ChevronDown
                  size={15}
                  className="text-slate-400"
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                  <button
                    type="button"
                    onClick={() =>
                      go(
                        "/admin/settings"
                      )
                    }
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <Settings
                      size={15}
                    />
                    Settings
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem(
                        "token"
                      );

                      localStorage.removeItem(
                        "adminToken"
                      );

                      go("/");
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut
                      size={15}
                    />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ==================================================================
            CONTENT
            ================================================================== */}

        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-7">
          {/* =================================================================
              PAGE TITLE
              ================================================================= */}

          <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Analytics
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Platform performance and activity
                overview.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Date */}

              <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
                <CalendarDays
                  size={16}
                  className="text-slate-400"
                />

                <select
                  value={dateRange}
                  onChange={(e) =>
                    setDateRange(
                      e.target.value
                    )
                  }
                  className="bg-transparent text-sm font-medium text-slate-600 outline-none"
                >
                  <option value="7">
                    Last 7 Days
                  </option>

                  <option value="30">
                    Last 30 Days
                  </option>

                  <option value="90">
                    Last 3 Months
                  </option>

                  <option value="365">
                    Last 1 Year
                  </option>
                </select>

                <ChevronDown
                  size={13}
                  className="text-slate-400"
                />
              </div>

              {/* Refresh */}

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex h-10 items-center gap-2 rounded-xl bg-[#165DFC] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCw
                  size={15}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />
                Refresh
              </button>
            </div>
          </div>

          {/* =================================================================
              ERROR
              ================================================================= */}

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0 text-rose-500"
              />

              <div>
                <p className="text-sm font-semibold text-rose-700">
                  Analytics data could not
                  be loaded
                </p>

                <p className="mt-0.5 text-xs text-rose-600">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* =================================================================
              KPI CARDS
              ================================================================= */}

          <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              icon={ClipboardList}
              title="Pending Reviews"
              value={
                loading
                  ? "—"
                  : formatNumber(
                      statusCounts.pending
                    )
              }
              supportingText="Hostels awaiting review"
              iconClass="bg-blue-50 text-[#165DFC]"
            />

            <MetricCard
              icon={AlertTriangle}
              title="Open Issues"
              value="—"
              supportingText="Live issue data unavailable"
              iconClass="bg-amber-50 text-amber-500"
            />

            <MetricCard
              icon={FlagIcon}
              title="Flagged Hostels"
              value="—"
              supportingText="Flag data unavailable"
              iconClass="bg-rose-50 text-rose-500"
            />

            <MetricCard
              icon={ShieldCheck}
              title="Owner Verifications"
              value={
                loading ||
                pendingOwnerVerifications ===
                  null
                  ? "—"
                  : formatNumber(
                      pendingOwnerVerifications
                    )
              }
              supportingText={
                verificationAvailable
                  ? "Pending owner verification"
                  : "Verification data unavailable"
              }
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <MetricCard
              icon={Building2}
              title="Total Hostels"
              value={
                loading
                  ? "—"
                  : formatNumber(
                      statusCounts.total
                    )
              }
              supportingText="Registered hostels"
              iconClass="bg-indigo-50 text-indigo-600"
            />
          </section>

          {/* =================================================================
              MAIN ANALYTICS ROW
              ================================================================= */}

          <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
            {/* Platform Overview */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">
                    Platform Overview
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Actual hostel registration
                    activity for {dateRangeLabel.toLowerCase()}.
                  </p>
                </div>

                <div className="flex rounded-lg border border-slate-200 p-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      setOverviewMode(
                        "hostels"
                      )
                    }
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                      overviewMode ===
                      "hostels"
                        ? "bg-[#165DFC] text-white"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    New Hostels
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setOverviewMode(
                        "owners"
                      )
                    }
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                      overviewMode ===
                      "owners"
                        ? "bg-[#165DFC] text-white"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    Owners
                  </button>
                </div>
              </div>

              {overviewMode ===
              "owners" ? (
                <div className="flex h-[275px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                  <div className="text-center">
                    <Users
                      size={25}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-medium text-slate-500">
                      Owner trend data unavailable
                    </p>

                    <p className="mt-1 max-w-[260px] text-xs leading-5 text-slate-400">
                      The current admin API does not
                      provide owner registration history,
                      so no owner numbers are fabricated.
                    </p>
                  </div>
                </div>
              ) : registrationTrend.hasDateData ? (
                <div className="h-[275px]">
                  <Line
                    data={
                      overviewChartData
                    }
                    options={
                      overviewChartOptions
                    }
                  />
                </div>
              ) : (
                <div className="flex h-[275px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                  <div className="text-center">
                    <BarChart3
                      size={27}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-medium text-slate-500">
                      No registration date data available
                    </p>

                    <p className="mt-1 max-w-[280px] text-xs leading-5 text-slate-400">
                      The hostel API returned hostel
                      records without a usable created or
                      submitted date.
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom metrics */}

              <div className="mt-5 grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 pt-4">
                <div className="pr-4">
                  <p className="text-xs text-slate-400">
                    Total Hostels
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-800">
                    {loading
                      ? "—"
                      : formatNumber(
                          statusCounts.total
                        )}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Current database total
                  </p>
                </div>

                <div className="pl-4">
                  <p className="text-xs text-slate-400">
                    Approved Hostels
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-800">
                    {loading
                      ? "—"
                      : formatNumber(
                          statusCounts.approved
                        )}
                  </p>

                  <p className="mt-0.5 text-xs text-emerald-500">
                    Currently approved
                  </p>
                </div>
              </div>
            </section>

            {/* Status Breakdown */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">
                    Status Breakdown
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Current hostel status distribution
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    go(
                      "/admin/hostel-management"
                    )
                  }
                  className="text-sm font-semibold text-[#165DFC] hover:text-blue-700"
                >
                  View Report
                </button>
              </div>

              <div className="relative mx-auto mt-5 h-[205px] w-[205px]">
                <Doughnut
                  data={statusDonutData}
                  options={
                    statusDonutOptions
                  }
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-800">
                    {loading
                      ? "—"
                      : statusCounts.total}
                  </span>

                  <span className="mt-0.5 text-xs text-slate-400">
                    Total Hostels
                  </span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3">
                <StatusLegend
                  label="Approved"
                  value={
                    statusCounts.approved
                  }
                  dotClass="bg-emerald-500"
                />

                <StatusLegend
                  label="Pending"
                  value={
                    statusCounts.pending
                  }
                  dotClass="bg-amber-500"
                />

                <StatusLegend
                  label="In Review"
                  value={
                    statusCounts.inReview
                  }
                  dotClass="bg-blue-500"
                />

                <StatusLegend
                  label="Rejected"
                  value={
                    statusCounts.rejected
                  }
                  dotClass="bg-rose-500"
                />
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <p className="text-xs text-slate-400">
                    Other statuses
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    Draft{" "}
                    {formatNumber(
                      statusCounts.draft
                    )}{" "}
                    · Suspended{" "}
                    {formatNumber(
                      statusCounts.suspended
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    go(
                      "/admin/hostel-management"
                    )
                  }
                  className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-[#165DFC] hover:bg-blue-50"
                >
                  View All Hostels
                </button>
              </div>
            </section>
          </div>

          {/* =================================================================
              LOCATION + RECENT HOSTELS
              ================================================================= */}

          <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
            {/* Top Locations */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">
                    Top Locations
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Hostels grouped from actual location data
                  </p>
                </div>

                <MapPin
                  size={18}
                  className="text-slate-400"
                />
              </div>

              {locationStats.length > 0 ? (
                <div className="h-[255px]">
                  <Bar
                    data={
                      locationChartData
                    }
                    options={
                      locationChartOptions
                    }
                  />
                </div>
              ) : (
                <div className="flex h-[255px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                  <div className="text-center">
                    <MapPin
                      size={26}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-medium text-slate-500">
                      No location data available
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Hostel location information was not
                      returned by the API.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Hostel Status Summary */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
              <div className="mb-5">
                <h2 className="text-base font-semibold text-slate-800">
                  Hostel Status Summary
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Actual records currently returned by the admin API
                </p>
              </div>

              <div className="space-y-4">
                <StatusProgress
                  label="Approved"
                  value={
                    statusCounts.approved
                  }
                  total={
                    statusCounts.total
                  }
                  barClass="bg-emerald-500"
                />

                <StatusProgress
                  label="Pending"
                  value={
                    statusCounts.pending
                  }
                  total={
                    statusCounts.total
                  }
                  barClass="bg-amber-500"
                />

                <StatusProgress
                  label="Rejected"
                  value={
                    statusCounts.rejected
                  }
                  total={
                    statusCounts.total
                  }
                  barClass="bg-rose-500"
                />

                <StatusProgress
                  label="Draft"
                  value={
                    statusCounts.draft
                  }
                  total={
                    statusCounts.total
                  }
                  barClass="bg-slate-400"
                />

                <StatusProgress
                  label="Suspended"
                  value={
                    statusCounts.suspended
                  }
                  total={
                    statusCounts.total
                  }
                  barClass="bg-red-500"
                />
              </div>
            </section>
          </div>

          {/* =================================================================
              RECENT HOSTELS
              ================================================================= */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-semibold text-slate-800">
                  Recent Hostels
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Latest hostel records returned by the backend
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                  {filteredHostels.length} result
                  {filteredHostels.length ===
                  1
                    ? ""
                    : "s"}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    go(
                      "/admin/hostel-management"
                    )
                  }
                  className="text-sm font-semibold text-[#165DFC] hover:text-blue-700"
                >
                  View All
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex h-[250px] items-center justify-center">
                <div className="text-center">
                  <RefreshCw
                    size={23}
                    className="mx-auto animate-spin text-[#165DFC]"
                  />

                  <p className="mt-3 text-sm text-slate-500">
                    Loading hostel data...
                  </p>
                </div>
              </div>
            ) : recentHostels.length ===
              0 ? (
              <div className="flex h-[250px] items-center justify-center">
                <div className="text-center">
                  <Building2
                    size={30}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-semibold text-slate-500">
                    No hostels found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    No records match the current search.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop table */}

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70">
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                          Hostel Details
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                          Location
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                          Owner
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                          Status
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                          Submitted
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentHostels.map(
                        (hostel) => {
                          const hostelId =
                            getHostelId(
                              hostel
                            );

                          const status =
                            getApprovalStatus(
                              hostel
                            );

                          return (
                            <tr
                              key={
                                hostelId ??
                                getHostelName(
                                  hostel
                                )
                              }
                              className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50"
                            >
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#165DFC]">
                                    <Building2
                                      size={
                                        16
                                      }
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="max-w-[230px] truncate text-sm font-semibold text-slate-800">
                                      {getHostelName(
                                        hostel
                                      )}
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                      Hostel ID:{" "}
                                      {hostelId ??
                                        "—"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-3.5">
                                <div className="flex max-w-[190px] items-center gap-1.5">
                                  <MapPin
                                    size={
                                      13
                                    }
                                    className="shrink-0 text-slate-400"
                                  />

                                  <span className="truncate text-xs text-slate-500">
                                    {getLocation(
                                      hostel
                                    )}
                                  </span>
                                </div>
                              </td>

                              <td className="px-5 py-3.5 text-sm text-slate-600">
                                {getOwnerName(
                                  hostel
                                )}
                              </td>

                              <td className="px-5 py-3.5">
                                <StatusBadge
                                  status={
                                    status
                                  }
                                />
                              </td>

                              <td className="px-5 py-3.5 text-xs text-slate-500">
                                {formatDate(
                                  getCreatedDate(
                                    hostel
                                  )
                                )}
                              </td>

                              <td className="px-5 py-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (
                                      hostelId
                                    ) {
                                      navigate(
                                        `/admin/pending-approvals/${hostelId}`
                                      );
                                    }
                                  }}
                                  disabled={
                                    !hostelId
                                  }
                                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-[#165DFC] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}

                <div className="divide-y divide-slate-100 md:hidden">
                  {recentHostels.map(
                    (hostel) => {
                      const hostelId =
                        getHostelId(
                          hostel
                        );

                      return (
                        <div
                          key={
                            hostelId ??
                            getHostelName(
                              hostel
                            )
                          }
                          className="p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#165DFC]">
                                <Building2
                                  size={
                                    16
                                  }
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {getHostelName(
                                    hostel
                                  )}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  {getOwnerName(
                                    hostel
                                  )}
                                </p>
                              </div>
                            </div>

                            <StatusBadge
                              status={getApprovalStatus(
                                hostel
                              )}
                            />
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-slate-400">
                                Location
                              </p>

                              <p className="mt-1 truncate text-xs font-medium text-slate-600">
                                {getLocation(
                                  hostel
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-slate-400">
                                Submitted
                              </p>

                              <p className="mt-1 text-xs font-medium text-slate-600">
                                {formatDate(
                                  getCreatedDate(
                                    hostel
                                  )
                                )}
                              </p>
                            </div>
                          </div>

                          {hostelId && (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/pending-approvals/${hostelId}`
                                )
                              }
                              className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-[#165DFC]"
                            >
                              View Hostel
                            </button>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </>
            )}
          </section>

          {/* =================================================================
              DATA AVAILABILITY NOTE
              ================================================================= */}

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
            <CheckCircle2
              size={16}
              className="mt-0.5 shrink-0 text-[#165DFC]"
            />

            <div>
              <p className="text-sm font-semibold text-slate-700">
                Analytics uses backend data only
              </p>

              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                Hostel totals, approval statuses,
                locations and available owner verification
                statuses are calculated from your existing API
                responses. Metrics that your current backend
                does not expose are intentionally shown as
                “—” instead of using placeholder numbers.
              </p>
            </div>
          </div>

          <div className="h-5" />
        </div>
      </main>
    </div>
  );
};

/* ========================================================================
   STATUS LEGEND
   ======================================================================== */

const StatusLegend = ({
  label,
  value,
  dotClass,
}) => {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${dotClass}`}
        />

        <span className="text-xs text-slate-500">
          {label}
        </span>
      </div>

      <span className="text-xs font-semibold text-slate-700">
        {formatNumber(value)}
      </span>
    </div>
  );
};

/* ========================================================================
   STATUS PROGRESS
   ======================================================================== */

const StatusProgress = ({
  label,
  value,
  total,
  barClass,
}) => {
  const percentage =
    total > 0
      ? Math.round(
          (value / total) * 100
        )
      : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">
          {label}
        </span>

        <span className="text-xs font-semibold text-slate-700">
          {value}{" "}
          <span className="font-normal text-slate-400">
            ({percentage}%)
          </span>
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${barClass}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
};

/* ========================================================================
   FLAG ICON
   ======================================================================== */

const FlagIcon = ({
  size = 19,
  strokeWidth = 1.8,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 21V4"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      <path
        d="M5 5C8 2.5 11 7.5 14 5C17 2.5 19 5 20 6V14C18 12.5 16 11.5 14 13C11 15 8 10 5 12"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default AdminAnalytics;