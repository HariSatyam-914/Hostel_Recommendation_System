import React, { useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Images,
  MessageSquare,
  Star,
  BarChart3,
  Settings,
  Headphones,
  Bell,
  UserCircle,
  ChevronDown,
  ChevronRight,
  Eye,
  Search,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Loader2,
  Utensils,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  CircleDollarSign
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const arr = (v) => (Array.isArray(v) ? v : []);

const first = (...v) =>
  v.find((x) => x !== undefined && x !== null && x !== "");

const num = (v) => {
  const n = Number(v);

  return Number.isFinite(n) ? n : null;
};

const fmtNum = (v) => {
  const n = num(v);

  return n === null ? "—" : n.toLocaleString("en-IN");
};

const fmtMoney = (v) => {
  const n = num(v);

  return n === null
    ? "—"
    : `₹${n.toLocaleString("en-IN", {
        maximumFractionDigits: 0
      })}`;
};

const fmtPct = (v) => {
  const n = num(v);

  return n === null ? "—" : `${n.toFixed(0)}%`;
};

const roomTotals = (r) => {
  const total0 =
    num(first(r?.totalBeds, r?.total_beds)) || 0;

  const rooms =
    num(
      first(
        r?.numberOfRooms,
        r?.number_of_rooms,
        r?.totalRooms,
        r?.total_rooms
      )
    ) || 0;

  const beds =
    num(first(r?.bedsPerRoom, r?.beds_per_room)) || 0;

  const total =
    total0 > 0
      ? total0
      : rooms > 0 && beds > 0
      ? rooms * beds
      : 0;

  const occupied =
    num(
      first(
        r?.occupiedBeds,
        r?.occupied_beds,
        r?.occupied
      )
    ) || 0;

  const occupiedRooms =
    num(
      first(
        r?.occupiedRooms,
        r?.occupied_rooms
      )
    ) || 0;

  return {
    total,
    occupied,
    available: Math.max(total - occupied, 0),
    rooms,
    occupiedRooms,
    availableRooms: Math.max(
      rooms - occupiedRooms,
      0
    )
  };
};

const roomName = (r) =>
  String(
    first(
      r?.roomType,
      r?.type,
      r?.name
    ) || "Room"
  )
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const reviewRating = (r) =>
  num(
    first(
      r?.rating,
      r?.stars,
      r?.score
    )
  );

const statusOf = (r) =>
  String(
    first(
      r?.status,
      r?.issueStatus,
      r?.state
    ) || ""
  ).toUpperCase();

/**
 * Filters historical analytics data according to
 * the selected period.
 */
const periodData = (data, days) => {
  if (!Array.isArray(data) || !data.length) {
    return [];
  }

  const limit = Number(days);

  if (!Number.isFinite(limit) || limit <= 0) {
    return data;
  }

  if (data.length <= limit) {
    return data;
  }

  return data.slice(-limit);
};

/**
 * Safely extracts an array from common backend response
 * structures without creating any fallback/dummy data.
 */
const extractArray = (value, keys = []) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  for (const key of keys) {
    if (Array.isArray(value?.[key])) {
      return value[key];
    }
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  return [];
};

const SidebarLabel = ({ label }) => (
  <p className="px-3 mb-2 mt-5 text-[10px] font-bold tracking-[0.14em] text-slate-400">
    {label}
  </p>
);

const SidebarItem = ({
  icon,
  label,
  active,
  badge,
  onClick
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition ${
      active
        ? "bg-blue-50 text-blue-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`}
  >
    <span
      className={
        active
          ? "text-blue-600"
          : "text-slate-500"
      }
    >
      {icon}
    </span>

    <span className="flex-1 text-left">
      {label}
    </span>

    {badge ? (
      <span className="min-w-5 h-5 px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
        {badge}
      </span>
    ) : null}
  </button>
);

const EmptyData = ({
  icon,
  title,
  description,
  actionLabel,
  onAction
}) => (
  <div className="min-h-[180px] flex items-center justify-center">
    <div className="max-w-md text-center px-5 py-8">
      <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
        {icon}
      </div>

      <h4 className="mt-4 text-sm font-semibold text-slate-800">
        {title}
      </h4>

      <p className="mt-1.5 text-xs leading-5 text-slate-500">
        {description}
      </p>

      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
        >
          {actionLabel}
          <ChevronRight size={14} />
        </button>
      ) : null}
    </div>
  </div>
);

const MetricCard = ({
  icon,
  iconClass,
  label,
  value,
  delta,
  supportingText
}) => {
  const d = num(delta);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconClass}`}
        >
          {icon}
        </div>

        <p className="text-sm font-medium text-slate-700">
          {label}
        </p>
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight">
          {value}
        </p>

        {d !== null ? (
          <div className="flex items-center gap-2 mt-1">
            {d >= 0 ? (
              <TrendingUp
                size={13}
                className="text-emerald-600"
              />
            ) : (
              <TrendingDown
                size={13}
                className="text-rose-600"
              />
            )}

            <span
              className={`text-xs font-semibold ${
                d >= 0
                  ? "text-emerald-600"
                  : "text-rose-600"
              }`}
            >
              {Math.abs(d)}%
            </span>

            <span className="text-[11px] text-slate-400">
              vs previous period
            </span>
          </div>
        ) : (
          <p className="text-xs text-slate-500 mt-2">
            {supportingText || "No data available"}
          </p>
        )}
      </div>
    </div>
  );
};

const LineChart = ({
  data,
  series,
  emptyTitle,
  emptyDescription
}) => {
  if (!data.length) {
    return (
      <EmptyData
        icon={<BarChart3 size={20} />}
        title={
          emptyTitle ||
          "No trend data yet"
        }
        description={
          emptyDescription ||
          "Trend data will appear here when the backend provides historical records."
        }
      />
    );
  }

  const W = 760;
  const H = 260;
  const pl = 48;
  const pr = 22;
  const pt = 18;
  const pb = 42;
  const cw = W - pl - pr;
  const ch = H - pt - pb;

  const values = data.flatMap((i) =>
    series.map(
      (s) => Number(i?.[s.key]) || 0
    )
  );

  const max = Math.max(...values, 1);

  const x = (i) =>
    data.length === 1
      ? pl
      : pl +
        (i / (data.length - 1)) * cw;

  const y = (v) =>
    pt + ch - (v / max) * ch;

  const path = (k) =>
    data
      .map(
        (i, idx) =>
          `${idx === 0 ? "M" : "L"} ${x(idx)} ${y(
            Number(i?.[k]) || 0
          )}`
      )
      .join(" ");

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-5 mb-4">
        {series.map((s) => (
          <div
            key={s.key}
            className="flex items-center gap-2 text-xs text-slate-600"
          >
            <span
              className="w-3 h-0.5 rounded-full"
              style={{ background: s.stroke }}
            />
            {s.label}
          </div>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        {[0, 25, 50, 75, 100].map(
          (t) => {
            const yy =
              pt +
              ch -
              (t / 100) * ch;

            return (
              <g key={t}>
                <line
                  x1={pl}
                  x2={W - pr}
                  y1={yy}
                  y2={yy}
                  stroke="#e2e8f0"
                />

                <text
                  x={pl - 10}
                  y={yy + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94a3b8"
                >
                  {Math.round(
                    (max * t) / 100
                  )}
                </text>
              </g>
            );
          }
        )}

        <line
          x1={pl}
          x2={pl}
          y1={pt}
          y2={pt + ch}
          stroke="#e2e8f0"
        />

        <line
          x1={pl}
          x2={W - pr}
          y1={pt + ch}
          y2={pt + ch}
          stroke="#e2e8f0"
        />

        {data.map((i, idx) => (
          <text
            key={idx}
            x={x(idx)}
            y={H - 14}
            textAnchor="middle"
            fontSize="10"
            fill="#94a3b8"
          >
            {String(
              first(
                i?.label,
                i?.date,
                i?.day,
                i?.month
              ) || ""
            )}
          </text>
        ))}

        {series.map((s) => (
          <path
            key={s.key}
            d={path(s.key)}
            fill="none"
            stroke={s.stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {series.flatMap((s) =>
          data.map((i, idx) => (
            <circle
              key={`${s.key}-${idx}`}
              cx={x(idx)}
              cy={y(
                Number(i?.[s.key]) || 0
              )}
              r="3"
              fill="white"
              stroke={s.stroke}
              strokeWidth="2"
            />
          ))
        )}
      </svg>
    </div>
  );
};

const BarList = ({ items }) => {
  if (!items.length) {
    return (
      <EmptyData
        icon={<BarChart3 size={20} />}
        title="No room performance data"
        description="Room-level performance will appear here when the backend returns occupancy metrics."
      />
    );
  }

  const max = Math.max(
    ...items.map(
      (i) => Number(i.value) || 0
    ),
    1
  );

  return (
    <div className="space-y-5">
      {items.map((i, idx) => (
        <div key={idx}>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-slate-700">
              {i.label}
            </span>

            <span className="text-xs font-semibold text-slate-700">
              {i.value}%
            </span>
          </div>

          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{
                width: `${Math.min(
                  (i.value / max) * 100,
                  100
                )}%`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const RatingDistribution = ({ reviews }) => {
  if (!reviews.length) {
    return (
      <EmptyData
        icon={<Star size={20} />}
        title="No reviews yet"
        description="Rating distribution will appear here after users submit reviews."
      />
    );
  }

  const rows = [5, 4, 3, 2, 1].map(
    (r) => ({
      r,
      count: reviews.filter(
        (x) => reviewRating(x) === r
      ).length
    })
  );

  const max = Math.max(
    ...rows.map((x) => x.count),
    1
  );

  return (
    <div className="space-y-3.5">
      {rows.map((x) => (
        <div
          key={x.r}
          className="flex items-center gap-3"
        >
          <span className="w-8 text-xs text-slate-600">
            {x.r} ★
          </span>

          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-400"
              style={{
                width: `${(x.count / max) * 100}%`
              }}
            />
          </div>

          <span className="w-8 text-right text-xs font-medium text-slate-600">
            {x.count}
          </span>
        </div>
      ))}
    </div>
  );
};

const Analytics = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [data, setData] =
    useState(null);

  const [rooms, setRooms] =
    useState([]);

  const [reviewsData, setReviewsData] =
    useState(null);

  const [issuesData, setIssuesData] =
    useState(null);

  const [menu, setMenu] =
    useState(false);

  const menuRef = useRef(null);

  const [period, setPeriod] =
    useState("30");

  useEffect(() => {
    const f = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      f
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        f
      );
  }, []);

  const nav = (p) => {
    setSidebarOpen(false);
    navigate(p);
  };

  const logout = () => {
    [
      "token",
      "jwtToken",
      "accessToken",
      "user",
      "userData",
      "role",
      "admin",
      "hostelId"
    ].forEach((k) =>
      localStorage.removeItem(k)
    );

    [
      "token",
      "jwtToken",
      "accessToken",
      "user",
      "userData",
      "role"
    ].forEach((k) =>
      sessionStorage.removeItem(k)
    );

    navigate("/");
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token");

        const authHeaders = {
          Accept: "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`
              }
            : {})
        };

        /*
         * ---------------------------------------------------------
         * 1. LOAD REAL OWNER DASHBOARD DATA
         * ---------------------------------------------------------
         */
        const r = await fetch(
          `${API_BASE_URL}/api/owner/dashboard`,
          {
            headers: authHeaders
          }
        );

        if (!r.ok) {
          throw new Error(
            `Unable to load analytics data (${r.status})`
          );
        }

        const d = await r.json();

        setData(d);

        /*
         * ---------------------------------------------------------
         * 2. RESOLVE HOSTEL ID FROM DASHBOARD RESPONSE
         * ---------------------------------------------------------
         */
        const h =
          d?.hostel ||
          d?.data?.hostel ||
          d?.data ||
          {};

        const id = first(
          h?.hostelId,
          h?.id,
          d?.hostelId,
          d?.data?.hostelId
        );

        /*
         * ---------------------------------------------------------
         * 3. CHECK WHETHER DASHBOARD ALREADY CONTAINS REVIEWS
         * ---------------------------------------------------------
         */
        const dashboardReviews = extractArray(
          d?.reviews ??
            d?.data?.reviews ??
            d?.analytics?.reviews ??
            d?.data?.analytics?.reviews,
          ["reviews"]
        );

        /*
         * ---------------------------------------------------------
         * 4. CHECK WHETHER DASHBOARD ALREADY CONTAINS ISSUES
         * ---------------------------------------------------------
         */
        const dashboardIssues = extractArray(
          d?.issues ??
            d?.data?.issues ??
            d?.analytics?.issues ??
            d?.data?.analytics?.issues,
          ["issues"]
        );

        if (dashboardReviews.length) {
          setReviewsData(
            dashboardReviews
          );
        } else {
          setReviewsData([]);
        }

        if (dashboardIssues.length) {
          setIssuesData(
            dashboardIssues
          );
        } else {
          setIssuesData([]);
        }

        if (id) {
          /*
           * -------------------------------------------------------
           * 5. LOAD ROOMS FROM DEDICATED ROOMS API
           * -------------------------------------------------------
           */
          try {
            const rr = await fetch(
              `${API_BASE_URL}/api/owner/hostels/${id}/rooms`,
              {
                headers: authHeaders
              }
            );

            if (rr.ok) {
              const j = await rr.json();

              const roomList =
                extractArray(j, [
                  "rooms",
                  "data",
                  "content",
                  "results"
                ]);

              setRooms(roomList);
            } else {
              console.error(
                "Room analytics API failed:",
                rr.status
              );

              setRooms([]);
            }
          } catch (e) {
            console.error(
              "Room analytics load failed",
              e
            );

            setRooms([]);
          }

          /*
           * -------------------------------------------------------
           * 6. LOAD REVIEWS ONLY WHEN DASHBOARD DID NOT RETURN THEM
           * -------------------------------------------------------
           */
          if (!dashboardReviews.length) {
            try {
              const reviewResponse =
                await fetch(
                  `${API_BASE_URL}/api/reviews/hostel/${id}`,
                  {
                    headers: authHeaders
                  }
                );

              if (reviewResponse.ok) {
                const reviewJson =
                  await reviewResponse.json();

                const fetchedReviews =
                  extractArray(
                    reviewJson,
                    [
                      "reviews",
                      "data",
                      "content",
                      "results"
                    ]
                  );

                setReviewsData(
                  fetchedReviews
                );
              } else {
                console.error(
                  "Review analytics API failed:",
                  reviewResponse.status
                );

                setReviewsData([]);
              }
            } catch (e) {
              console.error(
                "Review analytics load failed",
                e
              );

              setReviewsData([]);
            }
          }

          /*
           * -------------------------------------------------------
           * 7. LOAD ISSUES ONLY WHEN DASHBOARD DID NOT RETURN THEM
           * -------------------------------------------------------
           */
          if (!dashboardIssues.length) {
            try {
              const issueResponse =
                await fetch(
                  `${API_BASE_URL}/api/owner/issues`,
                  {
                    headers: authHeaders
                  }
                );

              if (issueResponse.ok) {
                const issueJson =
                  await issueResponse.json();

                const fetchedIssues =
                  extractArray(
                    issueJson,
                    [
                      "issues",
                      "data",
                      "content",
                      "results"
                    ]
                  );

                setIssuesData(
                  fetchedIssues
                );
              } else {
                console.error(
                  "Issue analytics API failed:",
                  issueResponse.status
                );

                setIssuesData([]);
              }
            } catch (e) {
              console.error(
                "Issue analytics load failed",
                e
              );

              setIssuesData([]);
            }
          }
        } else {
          /*
           * No hostel ID means the dedicated APIs cannot
           * be requested. Do not fabricate any data.
           */
          setRooms([]);

          if (!dashboardReviews.length) {
            setReviewsData([]);
          }

          if (!dashboardIssues.length) {
            setIssuesData([]);
          }
        }
      } catch (e) {
        console.error(e);

        setError(
          "Unable to load analytics data. Please try again."
        );

        setData(null);
        setRooms([]);
        setReviewsData([]);
        setIssuesData([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const owner =
    data?.owner ||
    data?.data?.owner ||
    {};

  const hostel =
    data?.hostel ||
    data?.data?.hostel ||
    {};

  const a =
    data?.analytics ||
    data?.data?.analytics ||
    {};

  /*
   * Dashboard reviews are preferred when present.
   * Otherwise reviewsData contains the real review API response.
   */
  const dashboardReviews = extractArray(
    data?.reviews ??
      data?.data?.reviews ??
      a?.reviews,
    ["reviews"]
  );

  const reviews =
    dashboardReviews.length
      ? dashboardReviews
      : reviewsData !== null
      ? arr(reviewsData)
      : [];

  /*
   * Dashboard issues are preferred when present.
   * Otherwise issuesData contains the real issue API response.
   */
  const dashboardIssues = extractArray(
    data?.issues ??
      data?.data?.issues ??
      a?.issues,
    ["issues"]
  );

  const issues =
    dashboardIssues.length
      ? dashboardIssues
      : issuesData !== null
      ? arr(issuesData)
      : [];

  const ownerName =
    first(
      owner.name,
      owner.fullName,
      owner.ownerName,
      owner.username
    ) || "Hostel Owner";

  const hostelName =
    first(
      hostel.name,
      hostel.hostelName
    ) || "Your Hostel";

  const location = [
    hostel.area,
    hostel.city,
    hostel.state
  ]
    .filter(Boolean)
    .join(", ");

  /*
   * Enquiries are ONLY read from backend analytics/dashboard data.
   * There is no fabricated fallback value.
   */
  const totalEnquiries = first(
    a?.enquiries,
    a?.enquiryCount,
    a?.enquiriesCount,
    data?.enquiries,
    data?.data?.enquiries,
    data?.enquiryCount,
    data?.data?.enquiryCount
  );

  const occ = useMemo(() => {
    if (!rooms.length) {
      return {
        total: 0,
        occupied: 0,
        available: 0,
        rooms: 0,
        pct: null
      };
    }

    let t = 0;
    let o = 0;
    let r = 0;

    rooms.forEach((x) => {
      const q = roomTotals(x);

      t += q.total;
      o += q.occupied;
      r += q.rooms;
    });

    return {
      total: t,
      occupied: o,
      available: Math.max(t - o, 0),
      rooms: r,
      pct: t
        ? Math.round((o / t) * 100)
        : null
    };
  }, [rooms]);

  const occupancyTrend = useMemo(() => {
    const s = [
      a?.occupancyTrend,
      a?.occupancyHistory,
      a?.occupancyData
    ].find(Array.isArray) || [];

    return periodData(
      s,
      Number(period)
    );
  }, [a, period]);

  /*
   * Backend occupancy rate is preferred.
   * If it is not returned, calculate it from real room records.
   */
  const occupancyRate = first(
    a?.occupancyRate,
    a?.occupancyPercentage,
    occ.pct
  );

  const avg = useMemo(() => {
    const b = num(
      first(
        a?.averageRating,
        a?.ratingAverage
      )
    );

    if (b !== null) {
      return b;
    }

    const rs = reviews
      .map(reviewRating)
      .filter((x) => x !== null);

    return rs.length
      ? rs.reduce(
          (s, x) => s + x,
          0
        ) / rs.length
      : null;
  }, [a, reviews]);

  const roomPerformance = rooms.map(
    (r) => {
      const q = roomTotals(r);

      return {
        label: roomName(r),
        value: q.total
          ? Math.round(
              (q.occupied / q.total) *
                100
            )
          : 0,
        total: q.total,
        occupied: q.occupied,
        available: q.available,
        revenue: num(
          first(
            r?.revenue,
            r?.totalRevenue,
            r?.revenueGenerated
          )
        )
      };
    }
  );

  const issueCounts = useMemo(() => {
    if (issues.length) {
      return {
        total: issues.length,

        open: issues.filter((x) =>
          [
            "OPEN",
            "PENDING",
            "REOPENED"
          ].includes(statusOf(x))
        ).length,

        inProgress: issues.filter(
          (x) =>
            statusOf(x) ===
            "IN_PROGRESS"
        ).length,

        resolved: issues.filter(
          (x) =>
            statusOf(x) ===
            "RESOLVED"
        ).length
      };
    }

    /*
     * If the actual issue records are unavailable,
     * use backend-provided aggregate analytics values only.
     */
    if (a?.issueCount !== undefined) {
      return {
        total: num(a.issueCount),
        open: num(a.openIssues),
        inProgress: num(
          a.inProgressIssues
        ),
        resolved: num(
          a.resolvedIssues
        )
      };
    }

    return {
      total: null,
      open: null,
      inProgress: null,
      resolved: null
    };
  }, [issues, a]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-7 h-7 animate-spin text-blue-600" />

          <p className="text-sm">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[250px] border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="h-[72px] flex items-center px-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2
                size={20}
                className="text-white"
              />
            </div>

            <div>
              <h1 className="text-lg font-bold text-blue-700 leading-none">
                FindMyHostel
              </h1>

              <p className="text-[10px] font-semibold tracking-wider text-slate-500 mt-1">
                OWNER PORTAL
              </p>
            </div>
          </div>

          <button
            className="ml-auto lg:hidden p-2 text-slate-500"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-3 py-5 overflow-y-auto h-[calc(100vh-72px)]">
          <SidebarLabel label="MAIN" />

          <SidebarItem
            icon={
              <LayoutDashboard size={18} />
            }
            label="Dashboard"
            onClick={() =>
              nav("/owner/dashboard")
            }
          />

          <SidebarLabel label="MY HOSTEL" />

          <SidebarItem
            icon={<Building2 size={18} />}
            label="Hostel Profile"
            onClick={() =>
              nav("/owner/hostel")
            }
          />

          <SidebarItem
            icon={<BedDouble size={18} />}
            label="Rooms"
            onClick={() =>
              nav("/owner/rooms")
            }
          />

          <SidebarItem
            icon={<Utensils size={18} />}
            label="Amenities"
            onClick={() =>
              nav("/owner/amenities")
            }
          />

          <SidebarItem
            icon={<Images size={18} />}
            label="Photos"
            onClick={() =>
              nav("/owner/photos")
            }
          />

          <SidebarLabel label="DISCOVERY" />

          <SidebarItem
            icon={
              <MessageSquare size={18} />
            }
            label="Issues"
            badge={
              issueCounts.open > 0
                ? issueCounts.open
                : null
            }
            onClick={() =>
              nav("/owner/issues")
            }
          />

          <SidebarItem
            icon={<Star size={18} />}
            label="Reviews"
            onClick={() =>
              nav("/owner/reviews")
            }
          />

          <SidebarLabel label="INSIGHTS" />

          <SidebarItem
            icon={
              <BarChart3 size={18} />
            }
            label="Analytics"
            active
            onClick={() =>
              nav("/owner/analytics")
            }
          />

          <SidebarLabel label="ACCOUNT" />

          <SidebarItem
            icon={<Settings size={18} />}
            label="Settings"
            onClick={() =>
              nav("/owner/settings")
            }
          />

          <SidebarItem
            icon={<Headphones size={18} />}
            label="Support"
            onClick={() =>
              nav("/owner/support")
            }
          />

          <div className="mt-8 pt-5 border-t border-slate-100">
            <button
              onClick={() =>
                nav("/hostel")
              }
              className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Eye size={16} />

              View Public Listing

              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </aside>

      <main className="lg:ml-[250px] h-screen flex flex-col overflow-hidden">
        <header className="h-[72px] flex-shrink-0 bg-white border-b border-slate-200 px-5 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu size={21} />
            </button>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Hostel Owner Portal
              </p>

              <div className="flex items-center gap-2 mt-0.5">
                <h2 className="text-sm font-semibold text-slate-800">
                  {hostelName}
                </h2>

                {location ? (
                  <>
                    <span className="text-slate-300">
                      /
                    </span>

                    <span className="text-xs text-slate-500">
                      {location}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-lg hover:bg-slate-100 text-slate-500 flex items-center justify-center">
              <Bell size={18} />
            </button>

            <div
              className="relative"
              ref={menuRef}
            >
              <button
                onClick={() =>
                  setMenu((v) => !v)
                }
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50"
              >
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                  <UserCircle size={20} />
                </div>

                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-800">
                    {ownerName}
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Hostel Owner
                  </p>
                </div>

                <ChevronDown
                  size={15}
                  className="text-slate-400"
                />
              </button>

              {menu ? (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
                  <button
                    onClick={() =>
                      nav(
                        "/owner/settings"
                      )
                    }
                    className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50"
                  >
                    Account Settings
                  </button>

                  <button
                    onClick={logout}
                    className="w-full px-4 py-3 border-t text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-5 lg:p-8 max-w-[1600px] mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>My Hostel</span>
                  <ChevronRight size={13} />
                  <span className="text-slate-700 font-medium">
                    Analytics
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight mt-2">
                  Analytics
                </h1>

                <p className="text-sm text-slate-500 mt-1">
                  Track your hostel&apos;s performance using real backend data only.
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 h-10 rounded-lg border border-slate-200 bg-white">
                <CalendarDays
                  size={15}
                  className="text-slate-400"
                />

                <select
                  value={period}
                  onChange={(e) =>
                    setPeriod(e.target.value)
                  }
                  className="bg-transparent outline-none text-sm font-medium"
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
              </div>
            </div>

            {error ? (
              <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 flex gap-3">
                <AlertTriangle
                  size={18}
                  className="text-rose-600"
                />

                <p className="text-sm text-rose-800">
                  {error}
                </p>
              </div>
            ) : null}

            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
              <MetricCard
                icon={<Eye size={19} />}
                iconClass="bg-blue-50 text-blue-600"
                label="Profile Views"
                value={fmtNum(
                  a?.profileViews
                )}
                delta={
                  a?.profileViewsDelta
                }
              />

              <MetricCard
                icon={<Search size={19} />}
                iconClass="bg-indigo-50 text-indigo-600"
                label="Search Appearances"
                value={fmtNum(
                  a?.searchAppearances
                )}
                delta={
                  a?.searchAppearancesDelta
                }
              />

              <MetricCard
                icon={
                  <MessageSquare size={19} />
                }
                iconClass="bg-violet-50 text-violet-600"
                label="Issues"
                value={
                  issueCounts.total === null
                    ? "—"
                    : fmtNum(
                        issueCounts.total
                      )
                }
                supportingText={
                  issueCounts.open === null
                    ? "No issue data yet"
                    : `${fmtNum(
                        issueCounts.open
                      )} open`
                }
              />

              <MetricCard
                icon={<Star size={19} />}
                iconClass="bg-amber-50 text-amber-600"
                label="Rating"
                value={
                  avg === null
                    ? "—"
                    : `${avg.toFixed(1)} / 5`
                }
                supportingText={
                  reviews.length
                    ? `Based on ${
                        reviews.length
                      } review${
                        reviews.length === 1
                          ? ""
                          : "s"
                      }`
                    : "No reviews yet"
                }
              />
            </section>

            <section className="mb-5">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden max-w-none">
                <div className="px-5 py-4 border-b">
                  <h3 className="font-semibold text-base">
                    Quick Performance
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Current values from the owner dashboard response.
                  </p>
                </div>

                <div className="p-5 space-y-5">
                  {[
                    [
                      Eye,
                      "Profile Views",
                      a?.profileViews,
                      a?.profileViewsDelta,
                      "bg-blue-50 text-blue-600"
                    ],
                    [
                      Search,
                      "Search Appearances",
                      a?.searchAppearances,
                      a?.searchAppearancesDelta,
                      "bg-indigo-50 text-indigo-600"
                    ],
                    [
                      Star,
                      "Average Rating",
                      avg === null
                        ? null
                        : avg.toFixed(1),
                      null,
                      "bg-amber-50 text-amber-600"
                    ],
                    [
                      MessageSquare,
                      "Enquiries",
                      totalEnquiries,
                      a?.enquiriesDelta,
                      "bg-violet-50 text-violet-600"
                    ]
                  ].map(
                    (
                      [
                        I,
                        l,
                        v,
                        d,
                        c
                      ],
                      i
                    ) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center ${c}`}
                          >
                            <I size={17} />
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">
                              {l}
                            </p>

                            <p className="text-sm font-semibold mt-0.5">
                              {v === null ||
                              v === undefined
                                ? "—"
                                : i === 2
                                ? `${v} / 5`
                                : fmtNum(v)}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs text-slate-400">
                          {d !== undefined &&
                          d !== null
                            ? `${d}%`
                            : "—"}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
              <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b">
                  <h3 className="font-semibold text-base">
                    Occupancy Overview
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Occupied versus available beds from your room records.
                  </p>
                </div>

                <div className="p-5">
                  {occupancyTrend.length ? (
                    <LineChart
                      data={occupancyTrend.map(
                        (x) => ({
                          label: first(
                            x.label,
                            x.date,
                            x.day,
                            x.month
                          ),

                          occupied:
                            Number(
                              first(
                                x.occupied,
                                x.occupiedBeds,
                                0
                              )
                            ) || 0,

                          available:
                            Number(
                              first(
                                x.available,
                                x.availableBeds,
                                0
                              )
                            ) || 0
                        })
                      )}
                      series={[
                        {
                          key: "occupied",
                          label: "Occupied Beds",
                          stroke:
                            "#2563eb"
                        },
                        {
                          key: "available",
                          label: "Available Beds",
                          stroke:
                            "#94a3b8"
                        }
                      ]}
                    />
                  ) : occ.pct !== null ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="relative w-[150px] h-[150px] mx-auto">
                        <svg
                          width="150"
                          height="150"
                          viewBox="0 0 150 150"
                          className="-rotate-90"
                        >
                          <circle
                            cx="75"
                            cy="75"
                            r="58"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="11"
                          />

                          <circle
                            cx="75"
                            cy="75"
                            r="58"
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="11"
                            strokeLinecap="round"
                            strokeDasharray={`${
                              2 * Math.PI * 58
                            }`}
                            strokeDashoffset={`${
                              2 *
                              Math.PI *
                              58 *
                              (1 -
                                occ.pct /
                                  100)
                            }`}
                          />
                        </svg>

                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold">
                            {occ.pct}%
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <p className="text-xs text-slate-500">
                            Total Beds
                          </p>

                          <p className="text-lg font-bold mt-1">
                            {fmtNum(
                              occ.total
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Occupied
                          </p>

                          <p className="text-lg font-bold mt-1">
                            {fmtNum(
                              occ.occupied
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Available
                          </p>

                          <p className="text-lg font-bold mt-1">
                            {fmtNum(
                              occ.available
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Rooms
                          </p>

                          <p className="text-lg font-bold mt-1">
                            {fmtNum(
                              occ.rooms
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EmptyData
                      icon={
                        <BedDouble size={20} />
                      }
                      title="No occupancy data yet"
                      description="Add room information and occupancy values to track utilization."
                      actionLabel="Manage Rooms"
                      onAction={() =>
                        nav("/owner/rooms")
                      }
                    />
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b">
                  <h3 className="font-semibold text-base">
                    Room Availability
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Current availability calculated from real room records.
                  </p>
                </div>

                <div className="p-5">
                  {roomPerformance.length ? (
                    <div className="space-y-5">
                      {roomPerformance.map(
                        (r, i) => (
                          <div key={i}>
                            <div className="flex justify-between mb-1.5">
                              <span className="text-xs text-slate-600">
                                {r.label}
                              </span>

                              <span className="text-xs font-semibold">
                                {r.occupied} /{" "}
                                {r.total}
                              </span>
                            </div>

                            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-blue-600"
                                style={{
                                  width: `${r.value}%`
                                }}
                              />
                            </div>

                            <div className="flex justify-between mt-1">
                              <span className="text-[10px] text-slate-400">
                                {r.available}{" "}
                                beds available
                              </span>

                              <span className="text-[10px] text-slate-400">
                                {r.value}% occupied
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <EmptyData
                      icon={
                        <BedDouble size={20} />
                      }
                      title="No room availability data"
                      description="Room availability appears after room records are loaded."
                      actionLabel="Manage Rooms"
                      onAction={() =>
                        nav("/owner/rooms")
                      }
                    />
                  )}
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b">
                  <h3 className="font-semibold text-base">
                    Room Type Performance
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Occupancy rate by room configuration.
                  </p>
                </div>

                <div className="p-5">
                  <BarList
                    items={roomPerformance.map(
                      (x) => ({
                        label: x.label,
                        value: x.value
                      })
                    )}
                  />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b">
                  <h3 className="font-semibold text-base">
                    Revenue by Room Type
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Only shown when room-level revenue is returned by the backend.
                  </p>
                </div>

                <div className="p-5">
                  {roomPerformance.some(
                    (x) =>
                      x.revenue !== null
                  ) ? (
                    <div className="space-y-4">
                      {roomPerformance
                        .filter(
                          (x) =>
                            x.revenue !==
                            null
                        )
                        .map((r, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between border-b last:border-b-0 pb-3 last:pb-0"
                          >
                            <span className="text-sm text-slate-700">
                              {r.label}
                            </span>

                            <span className="text-sm font-semibold">
                              {fmtMoney(
                                r.revenue
                              )}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <EmptyData
                      icon={
                        <CircleDollarSign size={20} />
                      }
                      title="No room revenue data"
                      description="Revenue distribution will appear when room-level revenue is returned by the backend."
                    />
                  )}
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b flex justify-between">
                  <div>
                    <h3 className="font-semibold text-base">
                      Review Performance
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                      Rating quality from actual user reviews.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      nav("/owner/reviews")
                    }
                    className="text-xs font-semibold text-blue-600"
                  >
                    View Reviews
                  </button>
                </div>

                <div className="p-5">
                  {reviews.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="rounded-xl bg-slate-50 border p-5">
                        <div className="flex items-center gap-2">
                          <Star
                            size={19}
                            className="text-amber-500 fill-amber-500"
                          />

                          <span className="text-2xl font-bold">
                            {avg === null
                              ? "—"
                              : avg.toFixed(
                                  1
                                )}
                          </span>

                          <span className="text-xs text-slate-400">
                            / 5
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-2">
                          Based on{" "}
                          {reviews.length}{" "}
                          review
                          {reviews.length ===
                          1
                            ? ""
                            : "s"}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mt-5">
                          <div>
                            <p className="text-[11px] text-slate-500">
                              5 Star
                            </p>

                            <p className="text-lg font-bold mt-1">
                              {
                                reviews.filter(
                                  (x) =>
                                    reviewRating(
                                      x
                                    ) === 5
                                ).length
                              }
                            </p>
                          </div>

                          <div>
                            <p className="text-[11px] text-slate-500">
                              Needs Attention
                            </p>

                            <p className="text-lg font-bold mt-1">
                              {
                                reviews.filter(
                                  (x) => {
                                    const r =
                                      reviewRating(
                                        x
                                      );

                                    return (
                                      r !==
                                        null &&
                                      r <= 2
                                    );
                                  }
                                ).length
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      <RatingDistribution
                        reviews={reviews}
                      />
                    </div>
                  ) : (
                    <EmptyData
                      icon={
                        <Star size={20} />
                      }
                      title="No reviews yet"
                      description="Review analytics will appear after users submit reviews."
                      actionLabel="Open Reviews"
                      onAction={() =>
                        nav("/owner/reviews")
                      }
                    />
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b flex justify-between">
                  <div>
                    <h3 className="font-semibold text-base">
                      Issue Performance
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                      Issue volume and resolution status from actual data.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      nav("/owner/issues")
                    }
                    className="text-xs font-semibold text-blue-600"
                  >
                    View Issues
                  </button>
                </div>

                <div className="p-5">
                  {issueCounts.total !==
                  null ? (
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        [
                          MessageSquare,
                          "Total Issues",
                          issueCounts.total,
                          "bg-slate-50"
                        ],
                        [
                          Clock3,
                          "Pending",
                          issueCounts.open,
                          "bg-amber-50"
                        ],
                        [
                          TrendingUp,
                          "In Progress",
                          issueCounts.inProgress,
                          "bg-blue-50"
                        ],
                        [
                          CheckCircle2,
                          "Resolved",
                          issueCounts.resolved,
                          "bg-emerald-50"
                        ]
                      ].map(
                        (
                          [
                            I,
                            l,
                            v,
                            c
                          ],
                          i
                        ) => (
                          <div
                            key={i}
                            className={`rounded-xl border p-4 ${c}`}
                          >
                            <div className="flex items-center gap-2 text-slate-600">
                              <I size={15} />

                              <span className="text-xs">
                                {l}
                              </span>
                            </div>

                            <p className="text-2xl font-bold mt-2">
                              {fmtNum(v)}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <EmptyData
                      icon={
                        <MessageSquare size={20} />
                      }
                      title="No issue analytics yet"
                      description="Issue analytics will appear once real issue data is available."
                      actionLabel="Open Issues"
                      onAction={() =>
                        nav("/owner/issues")
                      }
                    />
                  )}
                </div>
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b">
                <h3 className="font-semibold text-base">
                  Hostel Insights
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Only calculated from real data currently available.
                </p>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {occ.pct !== null ? (
                    <div className="rounded-xl border p-4">
                      <div className="flex items-center gap-2 text-blue-600">
                        <BedDouble size={16} />

                        <span className="text-xs font-semibold">
                          Current Occupancy
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 mt-3">
                        {occ.occupied} of{" "}
                        {occ.total} beds are
                        occupied ({occ.pct}%).
                      </p>
                    </div>
                  ) : null}

                  {roomPerformance.length ? (
                    <div className="rounded-xl border p-4">
                      <div className="flex items-center gap-2 text-indigo-600">
                        <BarChart3 size={16} />

                        <span className="text-xs font-semibold">
                          Highest Occupancy Room Type
                        </span>
                      </div>

                      {(() => {
                        const x = [
                          ...roomPerformance
                        ].sort(
                          (a, b) =>
                            b.value -
                            a.value
                        )[0];

                        return (
                          <p className="text-sm text-slate-700 mt-3">
                            {x.label} currently
                            has the highest
                            occupancy at{" "}
                            {x.value}%.
                          </p>
                        );
                      })()}
                    </div>
                  ) : null}

                  {reviews.length ? (
                    <div className="rounded-xl border p-4">
                      <div className="flex items-center gap-2 text-amber-600">
                        <Star size={16} />

                        <span className="text-xs font-semibold">
                          Review Health
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 mt-3">
                        Average rating is{" "}
                        {avg === null
                          ? "—"
                          : avg.toFixed(
                              1
                            )}{" "}
                        from{" "}
                        {reviews.length}{" "}
                        review
                        {reviews.length ===
                        1
                          ? ""
                          : "s"}.
                      </p>
                    </div>
                  ) : null}

                  {issueCounts.total !==
                  null ? (
                    <div className="rounded-xl border p-4">
                      <div className="flex items-center gap-2 text-violet-600">
                        <MessageSquare
                          size={16}
                        />

                        <span className="text-xs font-semibold">
                          Issue Resolution
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 mt-3">
                        {issueCounts.resolved}{" "}
                        of{" "}
                        {issueCounts.total}{" "}
                        tracked issues are
                        marked resolved.
                      </p>
                    </div>
                  ) : null}

                  {a?.profileViews !==
                  undefined ? (
                    <div className="rounded-xl border p-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Eye size={16} />

                        <span className="text-xs font-semibold">
                          Listing Visibility
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 mt-3">
                        {fmtNum(
                          a.profileViews
                        )}{" "}
                        recorded profile
                        views.
                      </p>
                    </div>
                  ) : null}

                  {a?.searchAppearances !==
                  undefined ? (
                    <div className="rounded-xl border p-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Search size={16} />

                        <span className="text-xs font-semibold">
                          Search Visibility
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 mt-3">
                        {fmtNum(
                          a.searchAppearances
                        )}{" "}
                        search appearances
                        recorded.
                      </p>
                    </div>
                  ) : null}

                  {!occ.pct &&
                  roomPerformance.length ===
                    0 &&
                  !reviews.length &&
                  issueCounts.total ===
                    null &&
                  a?.profileViews ===
                    undefined &&
                  a?.searchAppearances ===
                    undefined ? (
                    <div className="md:col-span-2 xl:col-span-3">
                      <EmptyData
                        icon={
                          <BarChart3 size={20} />
                        }
                        title="No insights available yet"
                        description="Insights will appear automatically when real analytics data becomes available."
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;