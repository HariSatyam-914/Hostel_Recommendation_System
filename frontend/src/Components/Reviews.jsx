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
  BedDouble,
  Images,
  MessageSquare,
  Star,
  BarChart3,
  Settings,
  Bell,
  UserCircle,
  ChevronDown,
  ChevronRight,
  Eye,
  Search,
  Pencil,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  Loader2,
  Utensils,
  Send,
  MessageSquareText,
  CalendarDays,
  Image as ImageIcon,
  Headphones,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080";

function Reviews() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All Ratings");
  const [responseFilter, setResponseFilter] = useState("All Status");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [sendingResponse, setSendingResponse] = useState(false);
  const [error, setError] = useState("");

  const profileMenuRef = useRef(null);

  /* =========================================================
     CLOSE PROFILE DROPDOWN WHEN CLICKING OUTSIDE
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

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* =========================================================
     FETCH OWNER DASHBOARD DATA
     
     Dashboard data is still used for the existing owner /
     hostel header information.

     REVIEWS ARE NO LONGER READ FROM THIS RESPONSE.
     ========================================================= */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/owner/dashboard`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Unable to load owner information (${response.status})`
          );
        }

        const data = await response.json();

        console.log("Owner dashboard data:", data);

        setDashboardData(data);
      } catch (err) {
        console.error(
          "Failed to load owner dashboard data:",
          err
        );

        /*
         * Do not stop the Reviews page from loading if the
         * dashboard endpoint fails. Reviews have their own
         * dedicated endpoint.
         */
      }
    };

    fetchDashboardData();
  }, []);

  /* =========================================================
     FETCH REAL OWNER REVIEWS
     
     Backend endpoint:
     GET /api/reviews/owner
     
     This is the dedicated endpoint provided by
     ReviewController.java.
     ========================================================= */
  useEffect(() => {
    const fetchOwnerReviews = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/reviews/owner`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          let message = `Unable to load reviews (${response.status})`;

          try {
            const errorData = await response.json();

            if (errorData?.message) {
              message = errorData.message;
            }
          } catch {
            // Keep the default error message.
          }

          throw new Error(message);
        }

        const data = await response.json();

        console.log("Owner reviews API response:", data);

        /*
         * ReviewController returns List<ReviewResponse>
         * directly, therefore the response should be an array.
         */
        const normalizedReviews = Array.isArray(data)
          ? data
          : [];

        setReviews(normalizedReviews);

        if (normalizedReviews.length > 0) {
          setSelectedReviewId(
            normalizedReviews[0]?.id ??
              normalizedReviews[0]?.reviewId ??
              null
          );

          /*
           * If the first review already has an owner response,
           * show it in the response editor when editing.
           */
          setResponseText(
            normalizedReviews[0]?.ownerResponse || ""
          );
        } else {
          setSelectedReviewId(null);
          setResponseText("");
        }
      } catch (err) {
        console.error(
          "Failed to load owner reviews:",
          err
        );

        setError(
          err?.message ||
            "Unable to load reviews. Please try again."
        );

        setReviews([]);
        setSelectedReviewId(null);
        setResponseText("");
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerReviews();
  }, []);

  /* =========================================================
     OWNER / HOSTEL DATA
     ========================================================= */
  const owner =
    dashboardData?.owner ||
    dashboardData?.data?.owner ||
    {};

  const hostel =
    dashboardData?.hostel ||
    dashboardData?.data?.hostel ||
    {};

  const analytics =
    dashboardData?.analytics ||
    dashboardData?.data?.analytics ||
    {};

  const ownerName =
    owner?.name ||
    owner?.fullName ||
    owner?.ownerName ||
    owner?.username ||
    "Hostel Owner";

  const hostelName =
    hostel?.name ||
    hostel?.hostelName ||
    "Your Hostel";

  /* =========================================================
     NORMALIZE REVIEW HELPERS
     ========================================================= */
  const getReviewId = (review) =>
    review?.id ?? review?.reviewId;

  const getReviewerName = (review) =>
    review?.userName ||
    review?.studentName ||
    review?.reviewerName ||
    review?.name ||
    review?.user?.name ||
    review?.user?.fullName ||
    "User";

  const getReviewerRole = (review) =>
    review?.userRole ||
    review?.reviewerRole ||
    review?.role ||
    review?.user?.role ||
    "Resident";

  const getRating = (review) => {
    const rating = Number(
      review?.rating ??
        review?.stars ??
        review?.score ??
        0
    );

    return Number.isFinite(rating) ? rating : 0;
  };

  const getReviewText = (review) =>
    review?.reviewText ||
    review?.comment ||
    review?.feedback ||
    review?.description ||
    "";

  const getCreatedAt = (review) =>
    review?.createdAt ||
    review?.reviewDate ||
    review?.date ||
    review?.submittedAt ||
    null;

  const getRoom = (review) =>
    review?.roomNumber ||
    review?.roomName ||
    review?.room ||
    review?.roomType ||
    null;

  const getStayDuration = (review) =>
    review?.stayDuration ||
    review?.duration ||
    review?.monthsStayed ||
    null;

  const getOwnerResponse = (review) =>
    review?.ownerResponse ||
    review?.response ||
    review?.ownerReply ||
    null;

  const hasOwnerResponse = (review) =>
    Boolean(
      String(getOwnerResponse(review) || "").trim()
    );

  const getReviewImages = (review) => {
    const source =
      review?.photos ||
      review?.images ||
      review?.reviewPhotos ||
      review?.proofImages ||
      [];

    if (!Array.isArray(source)) {
      return [];
    }

    return source
      .map((image) => {
        if (typeof image === "string") {
          return image;
        }

        return (
          image?.fileUrl ||
          image?.photoUrl ||
          image?.url ||
          null
        );
      })
      .filter(Boolean);
  };

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

    return `${API_BASE_URL}/${String(imagePath).replace(
      /^\/+/,
      ""
    )}`;
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

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

  /* =========================================================
     FILTER REVIEWS
     ========================================================= */
  const filteredReviews = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return reviews.filter((review) => {
      const reviewer = getReviewerName(review).toLowerCase();
      const text = getReviewText(review).toLowerCase();
      const room = String(getRoom(review) || "").toLowerCase();
      const rating = getRating(review);

      const matchesSearch =
        !search ||
        reviewer.includes(search) ||
        text.includes(search) ||
        room.includes(search);

      const matchesRating =
        ratingFilter === "All Ratings" ||
        rating === Number(ratingFilter);

      const responded = hasOwnerResponse(review);

      const matchesResponse =
        responseFilter === "All Status" ||
        (responseFilter === "Responded" && responded) ||
        (responseFilter === "Not Responded" && !responded);

      return (
        matchesSearch &&
        matchesRating &&
        matchesResponse
      );
    });
  }, [
    reviews,
    searchTerm,
    ratingFilter,
    responseFilter,
  ]);

  /* =========================================================
     SELECTED REVIEW
     ========================================================= */
  const selectedReview = useMemo(() => {
    if (selectedReviewId == null) {
      return null;
    }

    return (
      reviews.find(
        (review) =>
          String(getReviewId(review)) ===
          String(selectedReviewId)
      ) || null
    );
  }, [reviews, selectedReviewId]);

  /* =========================================================
     REVIEW STATISTICS
     ========================================================= */
  const totalReviews = reviews.length;

  const reviewRatings = reviews.map(getRating);

  const calculatedAverageRating =
    reviewRatings.length > 0
      ? reviewRatings.reduce(
          (sum, value) => sum + value,
          0
        ) / reviewRatings.length
      : 0;

  const averageRating =
    analytics?.averageRating != null
      ? Number(analytics.averageRating)
      : calculatedAverageRating;

  const fiveStarReviews = reviews.filter(
    (review) => getRating(review) === 5
  ).length;

  const needsAttention = reviews.filter(
    (review) => getRating(review) <= 2
  ).length;

  const ratingDistribution = [5, 4, 3, 2, 1].map(
    (rating) => ({
      rating,
      count: reviews.filter(
        (review) => getRating(review) === rating
      ).length,
    })
  );

  const maxRatingCount = Math.max(
    ...ratingDistribution.map(
      (item) => item.count
    ),
    1
  );

  /* =========================================================
     NAVIGATION
     ========================================================= */
  const handleNavigation = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

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
    localStorage.removeItem("hostelId");

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
     RESPONSE HANDLERS
     ========================================================= */

  /*
   * Start editing the existing owner response.
   */
  const startResponse = () => {
    if (!selectedReview) {
      return;
    }

    setResponseText(
      getOwnerResponse(selectedReview) || ""
    );
  };

  /*
   * Save owner response to the backend.
   *
   * Backend:
   * PUT /api/reviews/{reviewId}/response
   *
   * Request body:
   * {
   *   "response": "..."
   * }
   */
  const handleSendResponse = async () => {
    if (!selectedReview) {
      return;
    }

    const reviewId = getReviewId(selectedReview);

    if (reviewId == null) {
      setError(
        "Unable to save response because the review ID is missing."
      );
      return;
    }

    const text = responseText.trim();

    if (!text) {
      setError("Response cannot be empty.");
      return;
    }

    if (text.length > 500) {
      setError(
        "Response cannot exceed 500 characters."
      );
      return;
    }

    setSendingResponse(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/reviews/${reviewId}/response`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            response: text,
          }),
        }
      );

      /*
       * Backend returns ReviewResponse on success.
       */
      const data = await response.json().catch(
        () => null
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Unable to save response (${response.status})`
        );
      }

      console.log(
        "Owner response saved successfully:",
        data
      );

      /*
       * Replace the review with the exact ReviewResponse
       * returned by the backend.
       *
       * This ensures the UI reflects the database-backed
       * value instead of only changing local text.
       */
      setReviews((currentReviews) =>
        currentReviews.map((review) => {
          if (
            String(getReviewId(review)) !==
            String(reviewId)
          ) {
            return review;
          }

          return data && typeof data === "object"
            ? data
            : {
                ...review,
                ownerResponse: text,
              };
        })
      );

      /*
       * Keep the current review selected.
       */
      setSelectedReviewId(reviewId);

      /*
       * Keep the saved response in the editor state.
       */
      setResponseText(
        data?.ownerResponse ?? text
      );
    } catch (err) {
      console.error(
        "Failed to save owner response:",
        err
      );

      setError(
        err?.message ||
          "Unable to save your response. Please try again."
      );
    } finally {
      setSendingResponse(false);
    }
  };

  /* =========================================================
     SIDEBAR
     ========================================================= */
  const sidebarGroups = [
    {
      label: "MAIN",
      items: [
        {
          label: "Dashboard",
          icon: LayoutDashboard,
          path: "/owner/dashboard",
        },
      ],
    },
    {
      label: "MY HOSTEL",
      items: [
        {
          label: "Hostel Profile",
          icon: Building2,
          path: "/owner/hostel",
        },
        {
          label: "Rooms",
          icon: BedDouble,
          path: "/owner/rooms",
        },
        {
          label: "Amenities",
          icon: Utensils,
          path: "/owner/amenities",
        },
        {
          label: "Photos",
          icon: Images,
          path: "/owner/photos",
        },
      ],
    },
    {
      label: "DISCOVERY",
      items: [
        {
          label: "Issues",
          icon: MessageSquare,
          path: "/owner/issues",
        },
        {
          label: "Reviews",
          icon: Star,
          path: "/owner/reviews",
          active: true,
        },
      ],
    },
    {
      label: "INSIGHTS",
      items: [
        {
          label: "Analytics",
          icon: BarChart3,
          path: "/owner/analytics",
        },
      ],
    },
    {
      label: "ACCOUNT",
      items: [
        {
          label: "Settings",
          icon: Settings,
          path: "/owner/settings",
        },
        {
          label: "Support",
          icon: Headphones,
          path: "/owner/support",
        },
      ],
    },
  ];

  /* =========================================================
     LOADING
     ========================================================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
          <p className="text-sm">
            Loading your reviews...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen w-[250px]
          border-r border-slate-200 bg-white
          transition-transform duration-300 lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* LOGO */}
        <div className="h-[72px] flex items-center px-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
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
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden p-2 text-slate-500 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}
        <div className="px-3 py-5 overflow-y-auto h-[calc(100vh-72px)]">
          {sidebarGroups.map((group) => (
            <div key={group.label}>
              <SidebarLabel label={group.label} />

              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <SidebarItem
                    key={item.label}
                    icon={<Icon size={18} />}
                    label={item.label}
                    active={item.active}
                    onClick={() =>
                      handleNavigation(item.path)
                    }
                  />
                );
              })}
            </div>
          ))}

          <div className="mt-8 pt-5 border-t border-slate-100">
            <button
              onClick={() =>
                handleNavigation("/hostel")
              }
              className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition"
            >
              <Eye size={16} />
              View Public Listing
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main className="lg:ml-[250px] h-screen flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <header className="h-[72px] flex-shrink-0 bg-white border-b border-slate-200 px-5 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu size={21} />
            </button>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Hostel Owner Portal
              </p>
              <p className="hidden sm:block text-sm font-semibold text-slate-800">
                {hostelName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              type="button"
              className="relative w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center"
            >
              <Bell size={19} />
            </button>

            {/* Public Listing */}
            <button
              onClick={() =>
                handleNavigation("/hostel")
              }
              className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm font-medium"
            >
              View Public Listing
              <ExternalLink size={14} />
            </button>

            {/* OWNER PROFILE */}
            <div
              className="relative"
              ref={profileMenuRef}
            >
              <button
                type="button"
                onClick={() =>
                  setProfileMenuOpen(
                    (prev) => !prev
                  )
                }
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50 transition focus:outline-none"
                title="Owner Profile"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {ownerName}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hostel Owner
                  </p>
                </div>

                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                  {owner?.profileImage ? (
                    <img
                      src={getImageUrl(
                        owner.profileImage
                      )}
                      alt={ownerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle
                      size={23}
                      className="text-blue-600"
                    />
                  )}
                </div>

                <ChevronDown
                  size={16}
                  className={`text-slate-400 hidden sm:block transition-transform ${
                    profileMenuOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/60 overflow-hidden z-[100]">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {ownerName}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Hostel Owner
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleNavigation(
                        "/owner/settings"
                      );
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition"
                  >
                    <UserCircle
                      size={17}
                      className="text-slate-500"
                    />
                    <span>
                      Profile & Settings
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition border-t border-slate-100"
                  >
                    <LogOut
                      size={17}
                      className="text-red-500"
                    />
                    <span className="font-medium">
                      Log Out
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* =====================================================
            SCROLLABLE CONTENT AREA
        ===================================================== */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 lg:p-8 max-w-[1500px] mx-auto">
            {/* BREADCRUMB */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <span>My Hostel</span>
              <ChevronRight size={14} />
              <span className="font-medium text-slate-700">
                Reviews
              </span>
            </div>

            {/* PAGE TITLE */}
            <div className="mb-6">
              <h2 className="text-2xl lg:text-[28px] font-bold tracking-tight">
                Reviews
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                See what residents say about your hostel and respond to their feedback.
              </p>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-3">
                <AlertTriangle
                  size={18}
                  className="text-red-500"
                />
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
              <ReviewMetricCard
                icon={<Star size={19} />}
                iconClass="bg-amber-50 text-amber-600"
                label="Overall Rating"
                value={
                  totalReviews > 0
                    ? `${averageRating.toFixed(1)} / 5`
                    : "—"
                }
                supportingText={
                  totalReviews > 0
                    ? "Based on your reviews"
                    : "No reviews yet"
                }
              />

              <ReviewMetricCard
                icon={
                  <MessageSquare size={19} />
                }
                iconClass="bg-blue-50 text-blue-600"
                label="Total Reviews"
                value={totalReviews}
                supportingText="All resident reviews"
              />

              <ReviewMetricCard
                icon={
                  <CheckCircle2 size={19} />
                }
                iconClass="bg-emerald-50 text-emerald-600"
                label="5 Star Reviews"
                value={fiveStarReviews}
                supportingText={
                  totalReviews > 0
                    ? `${Math.round(
                        (fiveStarReviews /
                          totalReviews) *
                          100
                      )}% of reviews`
                    : "No reviews yet"
                }
              />

              <ReviewMetricCard
                icon={
                  <AlertTriangle size={19} />
                }
                iconClass="bg-rose-50 text-rose-600"
                label="Needs Attention"
                value={needsAttention}
                supportingText="1–2 star reviews"
              />
            </section>

            {/* =================================================
                RATING DISTRIBUTION
            ================================================= */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 mb-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-semibold text-base">
                    Rating Distribution
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Understand how residents rate your hostel.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Star
                    size={16}
                    className="fill-amber-400 text-amber-400"
                  />
                  <span className="font-semibold">
                    {totalReviews > 0
                      ? averageRating.toFixed(1)
                      : "—"}
                  </span>
                </div>
              </div>

              {totalReviews > 0 ? (
                <div className="space-y-3 max-w-[850px]">
                  {ratingDistribution.map(
                    (item) => (
                      <div
                        key={item.rating}
                        className="flex items-center gap-3"
                      >
                        <div className="w-8 flex items-center gap-1 text-xs font-medium text-slate-600">
                          <span>
                            {item.rating}
                          </span>
                          <Star
                            size={11}
                            className="fill-amber-400 text-amber-400"
                          />
                        </div>

                        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber-400 transition-all"
                            style={{
                              width: `${
                                (item.count /
                                  maxRatingCount) *
                                100
                              }%`,
                            }}
                          />
                        </div>

                        <span className="w-8 text-right text-xs font-medium text-slate-500">
                          {item.count}
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={
                    <Star size={21} />
                  }
                  title="No ratings yet"
                  description="Rating distribution will appear here after residents submit reviews."
                />
              )}
            </section>

            {/* =================================================
                SEARCH + FILTERS
            ================================================= */}
            <section className="bg-white border border-slate-200 rounded-xl p-2 mb-5">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value
                      )
                    }
                    placeholder="Search reviews..."
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="relative">
                  <select
                    value={ratingFilter}
                    onChange={(event) =>
                      setRatingFilter(
                        event.target.value
                      )
                    }
                    className="h-11 min-w-[145px] appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option>
                      All Ratings
                    </option>
                    <option value="5">
                      5 Stars
                    </option>
                    <option value="4">
                      4 Stars
                    </option>
                    <option value="3">
                      3 Stars
                    </option>
                    <option value="2">
                      2 Stars
                    </option>
                    <option value="1">
                      1 Star
                    </option>
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                <div className="relative">
                  <select
                    value={responseFilter}
                    onChange={(event) =>
                      setResponseFilter(
                        event.target.value
                      )
                    }
                    className="h-11 min-w-[150px] appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option>
                      All Status
                    </option>
                    <option>
                      Not Responded
                    </option>
                    <option>
                      Responded
                    </option>
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </section>

            {/* =================================================
                REVIEW WORKSPACE
            ================================================= */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              {/* REVIEW LIST */}
              <div className="xl:col-span-1 bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-base">
                      Reviews
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {filteredReviews.length} review
                      {filteredReviews.length === 1
                        ? ""
                        : "s"}
                    </p>
                  </div>
                </div>

                <div className="max-h-[680px] overflow-y-auto">
                  {filteredReviews.length > 0 ? (
                    filteredReviews.map(
                      (review, index) => {
                        const reviewId =
                          getReviewId(review) ??
                          index;

                        const isSelected =
                          String(reviewId) ===
                          String(
                            selectedReviewId
                          );

                        const rating =
                          getRating(review);

                        const reviewer =
                          getReviewerName(
                            review
                          );

                        const room =
                          getRoom(review);

                        return (
                          <button
                            key={reviewId}
                            type="button"
                            onClick={() => {
                              setSelectedReviewId(
                                reviewId
                              );
                              setResponseText(
                                getOwnerResponse(
                                  review
                                ) || ""
                              );
                              setError("");
                            }}
                            className={`w-full text-left px-4 py-4 border-b border-slate-100 last:border-b-0 transition ${
                              isSelected
                                ? "bg-blue-50/80 ring-1 ring-inset ring-blue-400"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-1">
                                <ReviewStars
                                  rating={rating}
                                  size={14}
                                />
                              </div>

                              {hasOwnerResponse(
                                review
                              ) ? (
                                <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                                  Responded
                                </span>
                              ) : (
                                <span className="rounded-md bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                                  Not Responded
                                </span>
                              )}
                            </div>

                            <div className="mt-3 flex items-start gap-2">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                                {reviewer
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h4 className="truncate text-[13px] font-semibold text-slate-800">
                                  {reviewer}
                                </h4>

                                <p className="mt-0.5 text-[11px] text-slate-500">
                                  {getReviewerRole(
                                    review
                                  )}
                                  {room
                                    ? ` • ${room}`
                                    : ""}
                                </p>

                                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">
                                  {getReviewText(
                                    review
                                  ) ||
                                    "No written review provided."}
                                </p>

                                <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                                  <CalendarDays
                                    size={13}
                                  />
                                  {formatDate(
                                    getCreatedAt(
                                      review
                                    )
                                  )}
                                </div>
                              </div>

                              <ChevronRight
                                size={17}
                                className="mt-1 shrink-0 text-slate-400"
                              />
                            </div>
                          </button>
                        );
                      }
                    )
                  ) : (
                    <EmptyState
                      icon={
                        <MessageSquare
                          size={22}
                        />
                      }
                      title={
                        totalReviews === 0
                          ? "No reviews yet"
                          : "No reviews found"
                      }
                      description={
                        totalReviews === 0
                          ? "When residents submit reviews for your hostel, they will appear here."
                          : "Try changing the search or filters."
                      }
                    />
                  )}
                </div>
              </div>

              {/* REVIEW DETAILS */}
              <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
                {selectedReview ? (
                  <div className="flex h-full min-h-[680px] flex-col">
                    {/* HEADER */}
                    <div className="px-5 py-5 border-b border-slate-100">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <ReviewStars
                            rating={getRating(
                              selectedReview
                            )}
                            size={18}
                          />

                          <h2 className="text-xl font-bold mt-3">
                            {getReviewerName(
                              selectedReview
                            )}
                          </h2>

                          <p className="text-xs text-slate-500 mt-1">
                            {getReviewerRole(
                              selectedReview
                            )}
                            {getRoom(
                              selectedReview
                            )
                              ? ` • ${getRoom(
                                  selectedReview
                                )}`
                              : ""}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-900">
                            {getRating(
                              selectedReview
                            ).toFixed(1)}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            out of 5
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <CalendarDays
                          size={14}
                        />
                        <span>
                          {formatDate(
                            getCreatedAt(
                              selectedReview
                            )
                          )}
                        </span>

                        {getRoom(
                          selectedReview
                        ) && (
                          <>
                            <span>•</span>
                            <span>
                              Room: {getRoom(selectedReview)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* BODY */}
                    <div className="flex-1 overflow-y-auto p-5">
                      {/* REVIEW */}
                      <section>
                        <div className="mb-3 flex items-center gap-2">
                          <MessageSquareText
                            size={19}
                            className="text-slate-700"
                          />
                          <h3 className="text-[15px] font-semibold text-slate-800">
                            Review
                          </h3>
                        </div>

                        <div className="rounded-lg bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700 whitespace-pre-wrap">
                          {getReviewText(
                            selectedReview
                          ) ||
                            "No written review provided."}
                        </div>
                      </section>

                      {/* STAY INFORMATION */}
                      <section className="mt-7">
                        <h3 className="mb-4 text-[15px] font-semibold text-slate-800">
                          Stay Information
                        </h3>

                        <div className="overflow-hidden rounded-lg border border-slate-100">
                          <div className="grid grid-cols-[150px_1fr] border-b border-slate-100 px-4 py-3 text-sm">
                            <span className="text-slate-500">
                              Room
                            </span>
                            <span className="font-medium text-slate-800">
                              {getRoom(
                                selectedReview
                              ) ||
                                "Not specified"}
                            </span>
                          </div>

                          <div className="grid grid-cols-[150px_1fr] border-b border-slate-100 px-4 py-3 text-sm">
                            <span className="text-slate-500">
                              Stay Duration
                            </span>
                            <span className="font-medium text-slate-800">
                              {getStayDuration(
                                selectedReview
                              ) ||
                                "Not specified"}
                            </span>
                          </div>

                          <div className="grid grid-cols-[150px_1fr] px-4 py-3 text-sm">
                            <span className="text-slate-500">
                              Rating
                            </span>
                            <span>
                              <ReviewStars
                                rating={getRating(
                                  selectedReview
                                )}
                                size={15}
                              />
                            </span>
                          </div>
                        </div>
                      </section>

                      {/* REVIEW PHOTOS */}
                      <section className="mt-7">
                        <div className="mb-3 flex items-center gap-2">
                          <ImageIcon
                            size={19}
                            className="text-slate-700"
                          />
                          <h3 className="text-[15px] font-semibold text-slate-800">
                            Review Photos
                          </h3>
                        </div>

                        {getReviewImages(
                          selectedReview
                        ).length > 0 ? (
                          <div className="flex flex-wrap gap-3">
                            {getReviewImages(
                              selectedReview
                            ).map(
                              (
                                image,
                                index
                              ) => (
                                <div
                                  key={`${image}-${index}`}
                                  className="h-28 w-40 overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                                >
                                  <img
                                    src={getImageUrl(
                                      image
                                    )}
                                    alt={`Review photo ${
                                      index + 1
                                    }`}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-7 text-center">
                            <ImageIcon
                              size={23}
                              className="mx-auto text-slate-300"
                            />
                            <p className="mt-2 text-xs text-slate-500">
                              No photos attached to this review.
                            </p>
                          </div>
                        )}
                      </section>

                      {/* OWNER RESPONSE */}
                      <section className="mt-7">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <MessageSquare
                              size={19}
                              className="text-slate-700"
                            />
                            <h3 className="text-[15px] font-semibold text-slate-800">
                              Owner Response
                            </h3>
                          </div>

                          {hasOwnerResponse(
                            selectedReview
                          ) && (
                            <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                              Responded
                            </span>
                          )}
                        </div>

                        {hasOwnerResponse(
                          selectedReview
                        ) ? (
                          <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-4">
                            <p className="text-sm leading-6 text-slate-700 whitespace-pre-wrap">
                              {getOwnerResponse(
                                selectedReview
                              )}
                            </p>

                            <button
                              type="button"
                              onClick={
                                startResponse
                              }
                              className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                            >
                              <Pencil
                                size={14}
                              />
                              Edit Response
                            </button>
                          </div>
                        ) : (
                          <div>
                            <textarea
                              value={responseText}
                              onChange={(event) =>
                                setResponseText(
                                  event.target.value
                                )
                              }
                              maxLength={500}
                              rows={5}
                              placeholder="Write a professional response to this review..."
                              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            />

                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-[11px] text-slate-400">
                                Your response will be visible to users.
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {responseText.length}/500
                              </span>
                            </div>

                            <button
                              type="button"
                              disabled={
                                !responseText.trim() ||
                                sendingResponse
                              }
                              onClick={
                                handleSendResponse
                              }
                              className={`mt-3 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition ${
                                responseText.trim() &&
                                !sendingResponse
                                  ? "bg-blue-600 hover:bg-blue-700"
                                  : "cursor-not-allowed bg-slate-300"
                              }`}
                            >
                              {sendingResponse ? (
                                <>
                                  <Loader2
                                    size={16}
                                    className="animate-spin"
                                  />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Send size={16} />
                                  Send Response
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </section>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[680px] flex items-center justify-center px-6">
                    <EmptyState
                      large
                      icon={
                        <Star size={28} />
                      }
                      title={
                        totalReviews === 0
                          ? "No reviews yet"
                          : "Select a review"
                      }
                      description={
                        totalReviews === 0
                          ? "When residents review your hostel, their ratings and feedback will appear here."
                          : "Select a review from the list to see its details and respond."
                      }
                    />
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   SIDEBAR LABEL
============================================================ */
const SidebarLabel = ({ label }) => {
  return (
    <div className="px-3 pt-5 pb-2">
      <p className="text-[10px] font-bold tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  );
};

/* ============================================================
   SIDEBAR ITEM
============================================================ */
const SidebarItem = ({
  icon,
  label,
  active,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full h-10 px-3 rounded-lg flex items-center gap-3
        text-sm transition
        ${
          active
            ? "bg-blue-50 text-blue-700 font-semibold"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }
      `}
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
    </button>
  );
};

/* ============================================================
   REVIEW METRIC CARD
============================================================ */
const ReviewMetricCard = ({
  icon,
  iconClass,
  label,
  value,
  supportingText,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconClass}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs text-slate-500 font-medium">
            {label}
          </p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {value}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {supportingText}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   REVIEW STARS
============================================================ */
const ReviewStars = ({
  rating,
  size = 15,
}) => {
  const rounded = Math.round(
    Number(rating) || 0
  );

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(
        (star) => (
          <Star
            key={star}
            size={size}
            className={
              star <= rounded
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300"
            }
          />
        )
      )}
    </div>
  );
};

/* ============================================================
   EMPTY STATE
============================================================ */
const EmptyState = ({
  icon,
  title,
  description,
  large = false,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-6 ${
        large
          ? "min-h-[300px]"
          : "min-h-[260px] py-8"
      }`}
    >
      <div
        className={`${
          large
            ? "w-14 h-14"
            : "w-11 h-11"
        } rounded-full bg-slate-100 flex items-center justify-center text-slate-400`}
      >
        {icon}
      </div>

      <h4 className="text-sm font-semibold text-slate-700 mt-4">
        {title}
      </h4>

      <p className="text-xs leading-5 text-slate-400 max-w-sm mt-1">
        {description}
      </p>
    </div>
  );
};

export default Reviews;