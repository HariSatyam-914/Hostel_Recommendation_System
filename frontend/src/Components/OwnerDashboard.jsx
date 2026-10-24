import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
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
  Plus,
  MapPin,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  Loader2,
  Utensils,
  CircleHelp,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080";

/* =========================================================
   DYNAMIC APP CONFIG (from environment)
   ========================================================= */

const APP_NAME =
  import.meta.env.VITE_APP_NAME ||
  "FindMyHostel";

const APP_TAGLINE =
  import.meta.env.VITE_APP_TAGLINE ||
  "OWNER PORTAL";

const OWNER_PORTAL_LABEL =
  import.meta.env.VITE_OWNER_PORTAL_LABEL ||
  "Hostel Owner Portal";

/* =========================================================
   DYNAMIC GREETING HELPER (time-based)
   ========================================================= */

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

/* =========================================================
   PERIOD → DAYS MAP (for performance filtering)
   ========================================================= */

const PERIOD_TO_DAYS = {
  "7D": 7,
  "30D": 30,
  "90D": 90,
};

/* =========================================================
   PERIOD → HUMAN LABEL (for delta subtitle)
   ========================================================= */

const PERIOD_TO_LABEL = {
  "7D": "7 days",
  "30D": "30 days",
  "90D": "90 days",
};

/* =========================================================
   SAFE NUMBER COERCION
   ========================================================= */

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

/* =========================================================
   DATE PARSING HELPER (returns null on invalid)
   ========================================================= */

const parseDateSafe = (raw) => {
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/* =========================================================
   PERCENTAGE DELTA HELPER
   ========================================================= */

const computeDelta = (current, previous) => {
  const c = toNumber(current, 0);
  const p = toNumber(previous, 0);

  if (p === 0) {
    // If there was nothing before but there is something now → +100%
    // If both are zero → no meaningful delta (null)
    return c > 0 ? 100 : null;
  }

  return Math.round(((c - p) / p) * 100);
};

/* =========================================================
   NORMALIZE ISSUE (mirrors the logic used on the Issues page)
   ========================================================= */

const normalizeIssue = (issue = {}) => {
  const responses = Array.isArray(issue.responses)
    ? issue.responses
    : [];

  const latestResponse =
    responses.length > 0
      ? responses[responses.length - 1]
      : null;

  const status = String(
    issue.status || "OPEN"
  ).toUpperCase();

  return {
    ...issue,
    id: issue.id ?? issue.issueId,
    title:
      issue.subject ||
      issue.title ||
      "Reported issue",
    subject:
      issue.subject ||
      issue.title ||
      "Reported issue",
    description:
      issue.description ||
      issue.issueDescription ||
      issue.message ||
      "",
    reporter:
      issue.userName ||
      issue.reporter ||
      "User",
    room:
      issue.roomNumber ||
      issue.roomName ||
      issue.room ||
      issue.roomType ||
      "—",
    priority:
      issue.priority ||
      issue.priorityLevel ||
      "—",
    status,
    responses,
    latestResponse,
    createdAt:
      issue.createdAt ||
      issue.reportedAt ||
      issue.date ||
      null,
  };
};

/* =========================================================
   NORMALIZE REVIEW (mirrors the logic used on Reviews page)
   ========================================================= */

const normalizeReview = (review = {}) => {
  const rating = Number(
    review.rating ??
      review.stars ??
      review.score ??
      0
  );

  return {
    ...review,
    id: review.id ?? review.reviewId,
    rating: Number.isFinite(rating) ? rating : 0,
    reviewText:
      review.reviewText ||
      review.comment ||
      review.feedback ||
      review.description ||
      "",
    createdAt:
      review.createdAt ||
      review.reviewDate ||
      review.date ||
      review.submittedAt ||
      null,
    ownerResponse:
      review.ownerResponse ||
      review.response ||
      review.ownerReply ||
      null,
  };
};

const OwnerDashboard = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [dashboardData, setDashboardData] =
    useState(null);

  /* =========================================================
     REAL-TIME DASHBOARD REFRESH
     ========================================================= */

  const [refreshing, setRefreshing] =
    useState(false);

  const refreshInProgressRef =
    useRef(false);

  /*
   * IMPORTANT:
   *
   * Room availability is loaded directly from the
   * rooms API instead of depending only on dashboardData.rooms.
   */
  const [roomsData, setRoomsData] =
    useState([]);

  /*
   * Issues and reviews are loaded from their own dedicated
   * endpoints so the dashboard KPIs and Recent Issues list
   * always match what the Issues and Reviews pages display.
   */
  const [issuesData, setIssuesData] =
    useState([]);

  const [reviewsData, setReviewsData] =
    useState([]);

  const [error, setError] =
    useState("");

  const [coverImage, setCoverImage] =
    useState(null);

  /*
   * Owner photo data is kept separately so the dashboard can
   * show admin-rejected photos to the owner while the public
   * listing continues to use only approved photos.
   */
  const [hostelPhotos, setHostelPhotos] = useState([]);
  const [amenityPhotos, setAmenityPhotos] = useState([]);
  const [roomPhotos, setRoomPhotos] = useState([]);


  const [profileMenuOpen, setProfileMenuOpen] =
    useState(false);

  const profileMenuRef =
    useRef(null);

  const photoApprovalSectionRef =
    useRef(null);

  const [period, setPeriod] =
    useState("30D");

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
     FETCH DASHBOARD DATA
     ========================================================= */

  const loadDashboardData = useCallback(
    async ({ silent = false } = {}) => {
      if (refreshInProgressRef.current) {
        return;
      }

      refreshInProgressRef.current = true;

      try {
        if (!silent) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const token =
          localStorage.getItem("token");

        const authHeaders = {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        };

        const response = await fetch(
          `${API_BASE_URL}/api/owner/dashboard`,
          {
            method: "GET",
            headers: authHeaders,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Unable to load dashboard (${response.status})`
          );
        }

        const data =
          await response.json();

        console.log(
          "Dashboard Data:",
          data
        );

        setDashboardData(data);

        // ---------------------------------------------------------
        // RESOLVE HOSTEL ID
        // ---------------------------------------------------------

        const dashboardHostel =
          data?.hostel ||
          data?.data?.hostel ||
          data?.data ||
          {};

        const hostelId =
          dashboardHostel?.hostelId ||
          dashboardHostel?.id;

        // ---------------------------------------------------------
        // LOAD OWNER ISSUES FROM DEDICATED ENDPOINT
        // ---------------------------------------------------------
        //
        // The dashboard backend may return aggregate issue
        // counts, but the Issues page always fetches the full
        // list from /api/owner/issues. Fetch the same list here
        // so the dashboard reflects exactly what the owner sees
        // on the Issues page.
        // ---------------------------------------------------------

        try {
          const issuesResponse = await fetch(
            `${API_BASE_URL}/api/owner/issues`,
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

          if (issuesResponse.ok) {
            const issuesRaw =
              await issuesResponse.json();

            const issuesList = Array.isArray(issuesRaw)
              ? issuesRaw
              : Array.isArray(issuesRaw?.issues)
                ? issuesRaw.issues
                : Array.isArray(issuesRaw?.content)
                  ? issuesRaw.content
                  : Array.isArray(issuesRaw?.data)
                    ? issuesRaw.data
                    : [];

            const normalizedIssues =
              issuesList
                .map(normalizeIssue)
                .filter(
                  (issue) =>
                    issue &&
                    issue.id !== null &&
                    issue.id !== undefined
                );

            // Remove duplicate IDs to avoid React key warnings
            const uniqueIssues = Array.from(
              new Map(
                normalizedIssues.map((issue) => [
                  String(issue.id),
                  issue,
                ])
              ).values()
            );

            setIssuesData(uniqueIssues);
          } else {
            console.warn(
              "Owner issues API status:",
              issuesResponse.status
            );
            setIssuesData([]);
          }
        } catch (issuesError) {
          console.error(
            "Failed to load owner issues:",
            issuesError
          );
          setIssuesData([]);
        }

        // ---------------------------------------------------------
        // LOAD OWNER REVIEWS FROM DEDICATED ENDPOINT
        // ---------------------------------------------------------
        //
        // The Reviews page fetches /api/reviews/owner. Fetch the
        // same endpoint here so the dashboard Rating card and
        // rating delta match what the owner sees on Reviews.
        // ---------------------------------------------------------

        try {
          const reviewsResponse = await fetch(
            `${API_BASE_URL}/api/reviews/owner`,
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

          if (reviewsResponse.ok) {
            const reviewsRaw =
              await reviewsResponse.json();

            const reviewsList = Array.isArray(reviewsRaw)
              ? reviewsRaw
              : Array.isArray(reviewsRaw?.reviews)
                ? reviewsRaw.reviews
                : Array.isArray(reviewsRaw?.content)
                  ? reviewsRaw.content
                  : Array.isArray(reviewsRaw?.data)
                    ? reviewsRaw.data
                    : [];

            const normalizedReviews =
              reviewsList
                .map(normalizeReview)
                .filter(
                  (review) =>
                    review &&
                    review.id !== null &&
                    review.id !== undefined
                );

            const uniqueReviews = Array.from(
              new Map(
                normalizedReviews.map((review) => [
                  String(review.id),
                  review,
                ])
              ).values()
            );

            setReviewsData(uniqueReviews);
          } else {
            console.warn(
              "Owner reviews API status:",
              reviewsResponse.status
            );
            setReviewsData([]);
          }
        } catch (reviewsError) {
          console.error(
            "Failed to load owner reviews:",
            reviewsError
          );
          setReviewsData([]);
        }

        // ---------------------------------------------------------
        // LOAD HOSTEL COVER PHOTO
        // ---------------------------------------------------------

        if (hostelId) {
          try {
            const photoResponse =
              await fetch(
                `${API_BASE_URL}/api/owner/hostels/${hostelId}/photos`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type":
                      "application/json",
                    ...(token
                      ? {
                          Authorization: `Bearer ${token}`,
                        }
                      : {}),
                  },
                }
              );

            if (photoResponse.ok) {
              const photos =
                await photoResponse.json();

              console.log(
                "Hostel Photos:",
                photos
              );

              const normalizedHostelPhotos =
                Array.isArray(photos)
                  ? photos.map(
                      (photo) => ({
                        ...photo,
                        photoCategory:
                          "HOSTEL",
                      })
                    )
                  : [];

              setHostelPhotos(
                normalizedHostelPhotos
              );

              /*
               * ---------------------------------------------------------
               * RESOLVE HOSTEL COVER IMAGE
               * ---------------------------------------------------------
               *
               * A rejected cover photo can remain in the owner photo
               * response even after its physical file is no longer
               * available under /uploads/hostels/....
               *
               * Prefer an APPROVED cover first, then PENDING, and never
               * use a REJECTED cover when another usable hostel photo
               * exists. This prevents the dashboard from rendering a
               * stale/deleted cover URL.
               */
              const normalizedPhotos = Array.isArray(photos)
                ? photos
                : [];

              const getPhotoStatus = (photo) =>
                String(
                  photo?.status ||
                    photo?.verificationStatus ||
                    photo?.approvalStatus ||
                    ""
                )
                  .trim()
                  .toUpperCase();

              const getPhotoUrl = (photo) => {
                const rawUrl =
                  photo?.fileUrl ||
                  photo?.photoUrl ||
                  photo?.url ||
                  photo?.imageUrl ||
                  photo?.photo_url ||
                  photo?.filePath ||
                  photo?.path ||
                  null;

                if (
                  typeof rawUrl !== "string" ||
                  !rawUrl.trim()
                ) {
                  return null;
                }

                const imagePath = rawUrl.trim();

                return imagePath.startsWith("http://") ||
                  imagePath.startsWith("https://") ||
                  imagePath.startsWith("data:")
                  ? imagePath
                  : `${API_BASE_URL}/${imagePath.replace(
                      /^\/+/,
                      ""
                    )}`;
              };

              const coverPhotos = normalizedPhotos.filter(
                (photo) =>
                  String(
                    photo?.photoType ||
                      photo?.type ||
                      ""
                  )
                    .trim()
                    .toUpperCase() === "COVER"
              );

              const usableCoverPhotos =
                coverPhotos.filter(
                  (photo) =>
                    getPhotoStatus(photo) !==
                    "REJECTED"
                );

              const approvedCover =
                usableCoverPhotos.find(
                  (photo) =>
                    getPhotoStatus(photo) ===
                    "APPROVED"
                );

              const pendingCover =
                usableCoverPhotos.find(
                  (photo) =>
                    getPhotoStatus(photo) ===
                    "PENDING"
                );

              const fallbackCover =
                usableCoverPhotos.find(
                  (photo) => Boolean(getPhotoUrl(photo))
                );

              /*
               * If there is no usable COVER photo, use the first
               * non-rejected hostel photo as a safe visual fallback.
               */
              const fallbackHostelPhoto =
                normalizedPhotos.find(
                  (photo) =>
                    getPhotoStatus(photo) !==
                      "REJECTED" &&
                    Boolean(getPhotoUrl(photo))
                );

              const coverPhoto =
                approvedCover ||
                pendingCover ||
                fallbackCover ||
                fallbackHostelPhoto ||
                null;

              const imageUrl =
                coverPhoto
                  ? getPhotoUrl(coverPhoto)
                  : null;

              if (imageUrl) {
                console.log(
                  "Cover Image URL:",
                  imageUrl
                );

                setCoverImage(
                  imageUrl
                );
              } else {
                console.warn(
                  "No usable hostel cover photo found."
                );

                setCoverImage(null);
              }
            } else {
              console.warn(
                "Failed to load hostel photos:",
                photoResponse.status
              );
            }
          } catch (
            photoError
          ) {
            console.error(
              "Failed to load hostel cover photo:",
              photoError
            );
          }
        }

        // ---------------------------------------------------------
        // LOAD AMENITY PHOTOS - FIXED SECTION
        // ---------------------------------------------------------

        if (hostelId) {
          try {
            const amenityResponse =
              await fetch(
                `${API_BASE_URL}/api/owner/hostels/${hostelId}/amenities`,
                {
                  method: "GET",
                  headers: {
                    Accept:
                      "application/json",

                    ...(token
                      ? {
                          Authorization: `Bearer ${token}`,
                        }
                      : {}),
                  },
                }
              );

            console.log(
              "Owner amenities API status:",
              amenityResponse.status
            );

            if (amenityResponse.ok) {

              const amenityData =
                await amenityResponse.json();

              console.log(
                "========== OWNER AMENITIES RESPONSE =========="
              );

              console.log(
                JSON.stringify(
                  amenityData,
                  null,
                  2
                )
              );

              const amenities =
                Array.isArray(
                  amenityData
                )
                  ? amenityData
                  : Array.isArray(
                      amenityData?.amenities
                    )
                    ? amenityData.amenities
                    : Array.isArray(
                        amenityData?.data
                      )
                      ? amenityData.data
                      : [];

              /*
               * HostelAmenityResponse contains:
               *
               * photo: AmenityPhotoResponse
               *
               * Therefore we extract the photo object while
               * retaining amenityCode and amenityName.
               * 
               * FIX: Ensure we properly extract the photo URL
               * and handle different possible field names.
               */
              const extractedAmenityPhotos =
                [];

              amenities.forEach(
                (amenity) => {

                  if (!amenity) {
                    return;
                  }

                  /*
                   * Current backend returns a single photo.
                   *
                   * The additional array handling makes this
                   * safe if the response is expanded later.
                   */
                  /*
                   * The owner amenities endpoint can return the image
                   * either inside `photo` / `photos` OR directly on the
                   * amenity object. Support both shapes so the rejected
                   * amenity card always receives the real image URL.
                   */
                  const photos = [];

                  if (Array.isArray(amenity?.photos)) {
                    photos.push(...amenity.photos);
                  } else if (amenity?.photo) {
                    photos.push(amenity.photo);
                  }

                  /*
                   * Some backend response variants expose the URL
                   * directly on the amenity object instead of inside
                   * the nested photo object.
                   */
                  const directAmenityUrl =
                    amenity?.fileUrl ||
                    amenity?.photoUrl ||
                    amenity?.url ||
                    amenity?.imageUrl ||
                    amenity?.photo_url ||
                    amenity?.filePath ||
                    amenity?.path ||
                    null;

                  if (
                    directAmenityUrl &&
                    !photos.some(
                      (photo) =>
                        photo?.fileUrl === directAmenityUrl ||
                        photo?.photoUrl === directAmenityUrl ||
                        photo?.url === directAmenityUrl ||
                        photo?.imageUrl === directAmenityUrl
                    )
                  ) {
                    photos.push({
                      id:
                        amenity?.photoId ||
                        amenity?.id ||
                        null,
                      fileUrl:
                        directAmenityUrl,
                      verificationStatus:
                        amenity?.verificationStatus ||
                        amenity?.status ||
                        null,
                      rejectionReason:
                        amenity?.rejectionReason ||
                        amenity?.reason ||
                        null,
                      amenityId:
                        amenity?.amenityId ||
                        null,
                      amenityCode:
                        amenity?.amenityCode ||
                        null,
                    });
                  }

                  photos.forEach(
                    (photo) => {

                      if (!photo) {
                        return;
                      }

                      /*
                       * Accept all URL field variants used by the
                       * owner/admin photo responses.
                       */
                      const rawFileUrl =
                        photo?.fileUrl ||
                        photo?.photoUrl ||
                        photo?.url ||
                        photo?.imageUrl ||
                        photo?.photo_url ||
                        photo?.filePath ||
                        photo?.path ||
                        null;

                      const fileUrl =
                        typeof rawFileUrl === "string"
                          ? rawFileUrl.trim()
                          : rawFileUrl;

                      if (!fileUrl) {
                        console.warn(
                          "Amenity photo missing URL:",
                          photo
                        );
                        return;
                      }

                      extractedAmenityPhotos.push({
                        ...photo,

                        id:
                          photo?.id ||
                          photo?.photoId ||
                          null,

                        fileUrl:
                          fileUrl,

                        photoId:
                          photo?.photoId ||
                          photo?.id ||
                          null,

                        verificationStatus:
                          photo?.verificationStatus ||
                          photo?.status ||
                          null,

                        rejectionReason:
                          photo?.rejectionReason ||
                          photo?.reason ||
                          null,

                        status:
                          photo?.status ||
                          photo?.verificationStatus ||
                          null,

                        amenityId:
                          amenity?.amenityId ||
                          photo?.amenityId ||
                          null,

                        amenityCode:
                          photo?.amenityCode ||
                          amenity?.amenityCode ||
                          null,

                        amenityName:
                          amenity?.amenityName ||
                          amenity?.name ||
                          photo?.amenityName ||
                          null,

                        photoCategory:
                          "AMENITY",
                      });
                    }
                  );
                }
              );

              console.log(
                "========== OWNER AMENITY PHOTOS =========="
              );

              console.log(
                extractedAmenityPhotos
              );

              setAmenityPhotos(
                extractedAmenityPhotos
              );

            } else {

              console.warn(
                "Failed to load owner amenities:",
                amenityResponse.status
              );

              setAmenityPhotos([]);
            }

          } catch (
            amenityError
          ) {

            console.error(
              "Failed to load owner amenity photos:",
              amenityError
            );

            setAmenityPhotos([]);
          }
        } else {
          setAmenityPhotos([]);
        }

        // ---------------------------------------------------------
        // LOAD ROOM AVAILABILITY
        // ---------------------------------------------------------

        if (hostelId) {
          await loadRoomAvailability(
            hostelId
          );
        } else {
          console.warn(
            "Hostel ID not available. Cannot load room availability."
          );

          setRoomsData([]);
        }
      } catch (err) {
        console.error(
          "Failed to load owner dashboard",
          err
        );

        if (!silent) {
          setError(
            "Unable to load dashboard data. Please try again."
          );
        }

        if (!silent) {
          setRoomsData([]);
        }
      } finally {
        refreshInProgressRef.current = false;

        if (!silent) {
          setLoading(false);
        }

        if (silent) {
          setRefreshing(false);
        }
      }
    },
    []
  );

  /* =========================================================
     REAL-TIME REFRESH FOR ALL DASHBOARD SECTIONS
     ========================================================= */

  useEffect(() => {
    // Initial load.
    loadDashboardData({ silent: false });

    // Refresh dashboard, hostel photos, amenities, rooms,
    // issues and reviews every 5 seconds.
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadDashboardData({ silent: true });
      }
    }, 5000);

    // Refresh immediately when the owner returns to this tab/window.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadDashboardData({ silent: true });
      }
    };

    const handleFocus = () => {
      loadDashboardData({ silent: true });
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      clearInterval(intervalId);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [loadDashboardData]);

  /* =========================================================
     LOAD ROOM AVAILABILITY DIRECTLY
     ========================================================= */

  async function loadRoomAvailability(hostelId) {
      if (
        !hostelId ||
        hostelId === "null" ||
        hostelId === "undefined"
      ) {
        setRoomsData([]);
        return [];
      }

      try {
        const token =
          localStorage.getItem("token");

        const cleanHostelId =
          String(hostelId).trim();

        console.log(
          "=============================================="
        );

        console.log(
          "Loading dashboard room availability"
        );

        console.log(
          "Hostel ID:",
          cleanHostelId
        );

        console.log(
          "URL:",
          `${API_BASE_URL}/api/owner/hostels/${cleanHostelId}/rooms`
        );

        console.log(
          "=============================================="
        );

        const response =
          await fetch(
            `${API_BASE_URL}/api/owner/hostels/${cleanHostelId}/rooms`,
            {
              method: "GET",
              headers: {
                Accept:
                  "application/json",

                ...(token
                  ? {
                      Authorization: `Bearer ${token}`,
                    }
                  : {}),
              },
            }
          );

        console.log(
          "Dashboard rooms API status:",
          response.status
        );

        if (!response.ok) {
          const errorText =
            await response.text();

          console.error(
            "Dashboard rooms API error:",
            errorText
          );

          throw new Error(
            `Failed to load room availability (${response.status})`
          );
        }

        const data =
          await response.json();

        console.log(
          "========== DASHBOARD ROOMS RESPONSE =========="
        );

        console.log(
          JSON.stringify(
            data,
            null,
            2
          )
        );

        console.log(
          "==============================================="
        );

        const rooms =
          Array.isArray(data)
            ? data
            : Array.isArray(
                  data?.rooms
                )
              ? data.rooms
              : Array.isArray(
                    data?.data
                  )
                ? data.data
                : [];

                const normalizedRooms =
          Array.isArray(rooms)
            ? rooms
            : [];

        setRoomsData(
          normalizedRooms
        );

        /*
         * -------------------------------------------------------
         * EXTRACT ROOM PHOTOS
         * -------------------------------------------------------
         *
         * Room photos are already returned inside each
         * HostelRoomResponse.
         *
         * Example:
         *
         * room.photos = [
         *   {
         *     id,
         *     roomId,
         *     fileUrl,
         *     verificationStatus,
         *     rejectionReason
         *   }
         * ]
         */
        const extractedRoomPhotos = [];

        normalizedRooms.forEach(
          (room) => {

            const photos =
              Array.isArray(
                room?.photos
              )
                ? room.photos
                : [];

            photos.forEach(
              (photo) => {

                if (!photo) {
                  return;
                }

                extractedRoomPhotos.push({
                  ...photo,

                  /*
                   * Keep the room information so the owner
                   * can identify which room the rejected
                   * photo belongs to.
                   */
                  roomId:
                    photo?.roomId ||
                    room?.id ||
                    room?.roomId ||
                    null,

                  roomType:
                    room?.roomType ||
                    room?.type ||
                    room?.name ||
                    null,

                  photoCategory:
                    "ROOM",
                });
              }
            );
          }
        );

        console.log(
          "========== OWNER ROOM PHOTOS =========="
        );

        console.log(
          extractedRoomPhotos
        );

        setRoomPhotos(
          extractedRoomPhotos
        );

        return normalizedRooms;
      } catch (roomError) {
        console.error(
          "Failed to load dashboard room availability:",
          roomError
        );

        setRoomsData([]);

        return [];
      }
  }

  /* =========================================================
     DERIVED DATA
     ========================================================= */

  const owner =
    dashboardData?.owner || {};

  const hostel =
    dashboardData?.hostel || {};

  /*
   * IMPORTANT:
   *
   * Do NOT use:
   *
   * const rooms = dashboardData?.rooms || [];
   *
   * because room availability is now controlled by the
   * dedicated rooms API.
   */
  const rooms = roomsData;

  const analytics =
    dashboardData?.analytics || {};

  /*
   * ISSUES
   *
   * Prefer the dedicated issues API (already normalized and
   * stored in issuesData). If it returned nothing, fall back
   * to whatever the dashboard payload contained so we never
   * regress on data that used to work.
   */
  const issues = useMemo(() => {
    if (
      Array.isArray(issuesData) &&
      issuesData.length > 0
    ) {
      return issuesData;
    }

    const fallbackIssues =
      dashboardData?.issues ||
      dashboardData?.data?.issues ||
      [];

    return Array.isArray(fallbackIssues)
      ? fallbackIssues.map(normalizeIssue)
      : [];
  }, [issuesData, dashboardData]);

  /*
   * REVIEWS
   *
   * Prefer the dedicated reviews API (already normalized and
   * stored in reviewsData). If it returned nothing, fall back
   * to whatever the dashboard payload contained.
   */
  const reviews = useMemo(() => {
    if (
      Array.isArray(reviewsData) &&
      reviewsData.length > 0
    ) {
      return reviewsData;
    }

    const fallbackReviews =
      dashboardData?.reviews ||
      dashboardData?.data?.reviews ||
      [];

    return Array.isArray(fallbackReviews)
      ? fallbackReviews.map(normalizeReview)
      : [];
  }, [reviewsData, dashboardData]);

  const ownerName =
    owner.name ||
    owner.fullName ||
    "Hostel Owner";

  const ownerRole =
    owner.role ||
    owner.userType ||
    owner.designation ||
    "Hostel Owner";

  const hostelName =
    hostel.name ||
    "Your Hostel";

  const hostelLocation = [
    hostel.area,
    hostel.city,
    hostel.state,
  ]
    .filter(Boolean)
    .join(", ");

  /* =========================================================
     PUBLIC LISTING PATH (owner's own hostel, seen as a user)
     ========================================================= */

  /*
   * Resolve the current owner's hostel ID from the dashboard
   * payload using the same fallback chain used elsewhere on
   * this page. This makes the "View Public Listing" buttons
   * open the specific hostel view (/hostel/:hostelId) instead
   * of the generic listing page.
   */
  const publicHostelId =
    hostel?.hostelId ||
    hostel?.id ||
    dashboardData?.hostel?.hostelId ||
    dashboardData?.hostel?.id ||
    dashboardData?.data?.hostel?.hostelId ||
    dashboardData?.data?.hostel?.id ||
    dashboardData?.data?.hostelId ||
    dashboardData?.data?.id ||
    null;

  const publicListingPath =
    publicHostelId != null &&
    String(publicHostelId).trim() !== "" &&
    String(publicHostelId).trim() !== "null" &&
    String(publicHostelId).trim() !== "undefined"
      ? `/hostel/${String(publicHostelId).trim()}`
      : "/hostel";

  // FIX: Updated getImageUrl to handle amenity photos properly
  const getImageUrl = (
    imagePath
  ) => {
    if (!imagePath) {
      return null;
    }

    // If it's already a full URL (http, https, data:)
    if (
      imagePath.startsWith(
        "http://"
      ) ||
      imagePath.startsWith(
        "https://"
      ) ||
      imagePath.startsWith(
        "data:"
      )
    ) {
      return imagePath;
    }

    // If it's an amenity photo API endpoint, we need to check if it's a valid endpoint
    // Since the backend may not serve images via this endpoint, we should try to 
    // extract the photo ID and use a different approach, or fallback to a placeholder
    if (
      imagePath.includes("/amenities/photos/") ||
      imagePath.includes("amenities/photos/")
    ) {
      // Try to get the photo ID from the path
      const match = imagePath.match(/\/amenities\/photos\/(\d+)/);
      if (match && match[1]) {
        const photoId = match[1];
        // Try to find this photo in the amenityPhotos state to get the actual URL
        const foundPhoto = amenityPhotos.find(
          (p) => String(p.id) === photoId || String(p.photoId) === photoId
        );
        if (foundPhoto && foundPhoto.fileUrl) {
          // Use the actual file URL from the amenity photo
          const actualUrl = foundPhoto.fileUrl;
          if (actualUrl.startsWith("http://") || actualUrl.startsWith("https://")) {
            return actualUrl;
          }
          // Clean the path and prepend API_BASE_URL
          const cleanPath = actualUrl.replace(/^\/+/, "");
          return `${API_BASE_URL}/${cleanPath}`;
        }
      }
      // If we can't find the photo, return null to show placeholder
      console.warn("Could not find amenity photo for path:", imagePath);
      return null;
    }

    // For regular file paths like /uploads/rooms/...
    const cleanPath =
      imagePath.replace(
        /^\/+/,
        ""
      );

    return `${API_BASE_URL}/${cleanPath}`;
  };

  /* =========================================================
     PHOTO APPROVAL / ADMIN FEEDBACK
     ========================================================= */

  /*
   * Prefer a dedicated photoApproval object from the backend
   * when available. Otherwise derive the information from the
   * owner's photo response.
   *
   * This data is intentionally owner-facing. Rejected photos
   * must never be used by the public hostel listing.
   */
    const photoApproval =
    useMemo(() => {

      const backendPhotoApproval =
        dashboardData?.photoApproval ||
        dashboardData?.photoApprovalStatus ||
        dashboardData?.data?.photoApproval ||
        {};

      /*
       * -------------------------------------------------------
       * COMBINE ALL OWNER PHOTO TYPES
       * -------------------------------------------------------
       *
       * 1. Hostel photos
       * 2. Amenity photos
       * 3. Room photos
       *
       * This is important because the admin can reject any
       * of these three categories.
       */
      const ownerPhotos = [
        ...(Array.isArray(
          hostelPhotos
        )
          ? hostelPhotos
          : []),

        ...(Array.isArray(
          amenityPhotos
        )
          ? amenityPhotos
          : []),

        ...(Array.isArray(
          roomPhotos
        )
          ? roomPhotos
          : []),
      ];

      /*
       * -------------------------------------------------------
       * NORMALIZE PHOTO STATUS
       * -------------------------------------------------------
       */
      const getStatus = (
        photo
      ) =>
        String(
          photo?.status ||
            photo?.verificationStatus ||
            photo?.approvalStatus ||
            photo?.verification_state ||
            ""
        )
          .trim()
          .toUpperCase();

      /*
       * -------------------------------------------------------
       * NORMALIZE ALL OWNER PHOTOS
       * -------------------------------------------------------
       *
       * This also guarantees every photo has a category.
       */
      const normalizedOwnerPhotos =
        ownerPhotos.map(
          (photo) => ({
            ...photo,

            photoCategory:
              photo?.photoCategory ||
              "HOSTEL",
          })
        );

      /*
       * -------------------------------------------------------
       * BACKEND REJECTED PHOTOS
       * -------------------------------------------------------
       *
       * If the dashboard backend already supplies rejected
       * photos, include them too.
       *
       * This keeps compatibility with any existing
       * photoApproval response.
       */
      const rejectedFromBackend =
        Array.isArray(
          backendPhotoApproval?.rejectedPhotos
        )
          ? backendPhotoApproval.rejectedPhotos
          : [];

      /*
       * -------------------------------------------------------
       * COMBINE BACKEND + OWNER API PHOTOS
       * WITHOUT DUPLICATES
       * -------------------------------------------------------
       */
      const combinedPhotos = [];

      const photoKeys =
        new Set();

      const addPhoto = (
        photo
      ) => {

        if (!photo) {
          return;
        }

        const category =
          String(
            photo?.photoCategory ||
              "HOSTEL"
          )
            .trim()
            .toUpperCase();

        const id =
          photo?.id ||
          photo?.photoId ||
          null;

        const url =
          photo?.fileUrl ||
          photo?.photoUrl ||
          photo?.url ||
          photo?.imageUrl ||
          "";

        /*
         * Prefer category + database ID.
         *
         * If no ID exists, use the URL.
         */
        const key =
          id != null
            ? `${category}-${id}`
            : `${category}-${url}`;

        if (
          photoKeys.has(key)
        ) {
          return;
        }

        photoKeys.add(key);

        combinedPhotos.push({
          ...photo,
          photoCategory:
            category,
        });
      };

      /*
       * First add photos retrieved directly from the owner
       * APIs.
       */
      normalizedOwnerPhotos.forEach(
        addPhoto
      );

      /*
       * Then add backend rejected photos.
       *
       * IMPORTANT:
       * The dashboard backend may return an amenity rejection
       * containing the amenity name/reason but not the actual
       * image URL. In that case, enrich the rejected record from
       * the owner amenity-photo response before rendering it.
       */
      rejectedFromBackend.forEach(
        (photo) => {

          if (!photo) {
            return;
          }

          const backendCategory =
            String(
              photo?.photoCategory ||
                photo?.type ||
                photo?.category ||
                ""
            )
              .trim()
              .toUpperCase();

          const isAmenityPhoto =
            backendCategory === "AMENITY" ||
            photo?.amenityId != null ||
            Boolean(photo?.amenityCode) ||
            Boolean(photo?.amenityName);

          let enrichedPhoto = {
            ...photo,
          };

          if (isAmenityPhoto) {
            // Try to find matching amenity photo by ID first
            const photoId = photo?.photoId || photo?.id;
            let matchesAmenity = null;

            if (photoId) {
              matchesAmenity = (amenityPhotos || []).find(
                (amenityPhoto) => 
                  String(amenityPhoto?.photoId) === String(photoId) ||
                  String(amenityPhoto?.id) === String(photoId)
              );
            }

            // If not found by ID, try by amenity name/code
            if (!matchesAmenity) {
              matchesAmenity = (amenityPhotos || []).find(
                (amenityPhoto) => {

                  const sameAmenityId =
                    photo?.amenityId != null &&
                    amenityPhoto?.amenityId != null &&
                    String(photo.amenityId) ===
                      String(amenityPhoto.amenityId);

                  const sameAmenityCode =
                    photo?.amenityCode &&
                    amenityPhoto?.amenityCode &&
                    String(photo.amenityCode)
                      .trim()
                      .toUpperCase() ===
                      String(amenityPhoto.amenityCode)
                        .trim()
                        .toUpperCase();

                  const sameAmenityName =
                    photo?.amenityName &&
                    amenityPhoto?.amenityName &&
                    String(photo.amenityName)
                      .trim()
                      .toLowerCase() ===
                      String(amenityPhoto.amenityName)
                        .trim()
                        .toLowerCase();

                  return (
                    sameAmenityId ||
                    sameAmenityCode ||
                    sameAmenityName
                  );
                }
              );
            }

            if (matchesAmenity) {
              // Use the actual file URL from the amenity photo
              const actualFileUrl = 
                matchesAmenity?.fileUrl ||
                matchesAmenity?.photoUrl ||
                matchesAmenity?.url ||
                matchesAmenity?.imageUrl;

              enrichedPhoto = {
                ...matchesAmenity,
                ...photo,
                // IMPORTANT: Prefer the actual stored file URL from the owner
                // amenity-photo response. The rejected-photo object can contain
                // the API endpoint (/amenities/photos/{id}) instead of the real
                // stored file path, and spreading `photo` after `matchesAmenity`
                // would otherwise overwrite the correct URL.
                fileUrl: actualFileUrl || photo?.fileUrl || photo?.photoUrl,
                photoId: photo?.photoId || photo?.id || matchesAmenity?.photoId || matchesAmenity?.id,
                amenityId: photo?.amenityId ?? matchesAmenity?.amenityId ?? null,
                amenityCode: photo?.amenityCode || matchesAmenity?.amenityCode || null,
                amenityName: photo?.amenityName || matchesAmenity?.amenityName || null,
                photoCategory: "AMENITY",
              };
            }
          }

          addPhoto({
            ...enrichedPhoto,

            photoCategory:
              enrichedPhoto?.photoCategory ||
              enrichedPhoto?.type ||
              enrichedPhoto?.category ||
              (isAmenityPhoto
                ? "AMENITY"
                : "HOSTEL"),
          });
        }
      );

      /*
       * -------------------------------------------------------
       * NORMALIZED PHOTO LIST
       * -------------------------------------------------------
       */
      const normalizedPhotos =
        combinedPhotos;

      /*
       * -------------------------------------------------------
       * REJECTED
       * -------------------------------------------------------
       */
      const rejectedPhotos =
        normalizedPhotos.filter(
          (photo) =>
            getStatus(photo) ===
            "REJECTED"
        );

      /*
       * -------------------------------------------------------
       * APPROVED
       * -------------------------------------------------------
       */
      const approvedPhotos =
        normalizedPhotos.filter(
          (photo) =>
            getStatus(photo) ===
            "APPROVED"
        );

      /*
       * -------------------------------------------------------
       * PENDING
       * -------------------------------------------------------
       */
      const pendingPhotos =
        normalizedPhotos.filter(
          (photo) =>
            getStatus(photo) ===
            "PENDING"
        );

      /*
       * -------------------------------------------------------
       * BACKEND AGGREGATES
       * -------------------------------------------------------
       *
       * We only use backend aggregate values when they exist
       * AND no complete owner-side photo list is available.
       *
       * Otherwise we calculate from all three photo types.
       */
      const backendTotal =
        Number(
          backendPhotoApproval?.total
        );

      const backendApproved =
        Number(
          backendPhotoApproval?.approved
        );

      const backendRejected =
        Number(
          backendPhotoApproval?.rejected
        );

      const hasOwnerPhotoData =
        normalizedPhotos.length >
        0;

      return {
        total:
          hasOwnerPhotoData
            ? normalizedPhotos.length
            : Number.isFinite(
                  backendTotal
                ) &&
                backendTotal >=
                  0
              ? backendTotal
              : 0,

        approved:
          hasOwnerPhotoData
            ? approvedPhotos.length
            : Number.isFinite(
                  backendApproved
                ) &&
                backendApproved >=
                  0
              ? backendApproved
              : 0,

        rejected:
          hasOwnerPhotoData
            ? rejectedPhotos.length
            : Number.isFinite(
                  backendRejected
                ) &&
                backendRejected >=
                  0
              ? backendRejected
              : 0,

        pending:
          hasOwnerPhotoData
            ? pendingPhotos.length
            : 0,

        hasRejectedPhotos:
          rejectedPhotos.length >
          0,

        rejectedPhotos,
      };

    }, [
      dashboardData,
      hostelPhotos,
      amenityPhotos,
      roomPhotos,
    ]);

  /* =========================================================
     OCCUPANCY
     ========================================================= */

  const occupancy =
    useMemo(() => {
      if (
        !Array.isArray(rooms) ||
        rooms.length === 0
      ) {
        return {
          totalBeds: 0,
          occupiedBeds: 0,
          availableBeds: 0,
          totalRooms: 0,
          occupiedRooms: 0,
          availableRooms: 0,
          percentage: null,
        };
      }

      let totalBeds = 0;
      let occupiedBeds = 0;

      let totalRooms = 0;
      let occupiedRooms = 0;

      rooms.forEach(
        (room) => {
          /*
           * Prefer the backend's calculated totalBeds.
           *
           * Fallback:
           * numberOfRooms × bedsPerRoom
           */
          const backendTotalBeds =
            Number(
              room?.totalBeds ??
                room?.total_beds ??
                0
            );

          const numberOfRooms =
            Number(
              room?.numberOfRooms ??
                room?.number_of_rooms ??
                0
            );

          const bedsPerRoom =
            Number(
              room?.bedsPerRoom ??
                room?.beds_per_room ??
                0
            );

          const calculatedTotalBeds =
            numberOfRooms > 0 &&
            bedsPerRoom > 0
              ? numberOfRooms *
                bedsPerRoom
              : 0;

          const total =
            backendTotalBeds > 0
              ? backendTotalBeds
              : calculatedTotalBeds;

          const occupied =
            Number(
              room?.occupiedBeds ??
                room?.occupied_beds ??
                room?.occupied ??
                0
            );

          const roomCount =
            Number(
              room?.numberOfRooms ??
                room?.number_of_rooms ??
                room?.totalRooms ??
                room?.total_rooms ??
                0
            );

          const occupiedRoomCount =
            Number(
              room?.occupiedRooms ??
                room?.occupied_rooms ??
                0
            );

          totalBeds +=
            Math.max(
              total,
              0
            );

          occupiedBeds +=
            Math.min(
              Math.max(
                occupied,
                0
              ),
              Math.max(
                total,
                0
              )
            );

          totalRooms +=
            Math.max(
              roomCount,
              0
            );

          occupiedRooms +=
            Math.min(
              Math.max(
                occupiedRoomCount,
                0
              ),
              Math.max(
                roomCount,
                0
              )
            );
        }
      );

      const availableBeds =
        Math.max(
          totalBeds -
            occupiedBeds,
          0
        );

      const availableRooms =
        Math.max(
          totalRooms -
            occupiedRooms,
          0
        );

      const percentage =
        totalBeds > 0
          ? Math.round(
              (occupiedBeds /
                totalBeds) *
                100
            )
          : null;

      return {
        totalBeds,
        occupiedBeds,
        availableBeds,
        totalRooms,
        occupiedRooms,
        availableRooms,
        percentage,
      };
    }, [rooms]);

  /* =========================================================
     LISTING HEALTH
     ========================================================= */

  const listingHealth =
    useMemo(() => {
      /*
       * IMPORTANT:
       *
       * Do not directly compare:
       *
       * dashboardData?.approvalStatus === "APPROVED"
       *
       * because the backend may return APPROVED, Approved,
       * approved, etc.
       *
       * Normalize the value first.
       */

      const normalizedApprovalStatus =
        String(
          dashboardData?.approvalStatus ??
            dashboardData?.approval
              ?.status ??
            dashboardData?.status ??
            ""
        )
          .trim()
          .toUpperCase();

      const isApproved =
        normalizedApprovalStatus ===
        "APPROVED";

      /*
       * Section-level approval information, when supplied by
       * the backend, is preferred over guessing from the
       * presence of frontend fields.
       *
       * This keeps Listing Health compatible with future
       * section-level approval/request change data.
       */

      const sectionStatuses =
        dashboardData?.sectionStatuses ||
        dashboardData?.sectionApprovalStatuses ||
        dashboardData?.approvalSections ||
        dashboardData?.approval?.sections ||
        {};

      const getSectionStatus = (
        key
      ) => {
        const possibleKeys = {
          basic: [
            "basic",
            "basicInfo",
            "basicInformation",
          ],
          location: [
            "location",
            "locationDirections",
            "locationAndDirections",
          ],
          amenities: [
            "amenities",
            "amenity",
          ],
          rooms: [
            "rooms",
            "roomConfigurations",
            "roomsPricing",
          ],
          photos: [
            "photos",
            "hostelPhotos",
          ],
        };

        const keys =
          possibleKeys[key] || [
            key,
          ];

        for (const possibleKey of keys) {
          const value =
            sectionStatuses?.[
              possibleKey
            ];

          if (
            value === undefined ||
            value === null
          ) {
            continue;
          }

          if (
            typeof value ===
              "string" ||
            typeof value ===
              "boolean"
          ) {
            return value;
          }

          if (
            typeof value ===
            "object"
          ) {
            return (
              value.status ??
              value.approvalStatus ??
              value.state ??
              value.approved
            );
          }
        }

        return null;
      };

      const isSectionApproved = (
        key
      ) => {
        const status =
          getSectionStatus(
            key
          );

        if (
          status === null ||
          status === undefined
        ) {
          return null;
        }

        if (
          typeof status ===
          "boolean"
        ) {
          return status;
        }

        const normalizedStatus =
          String(status)
            .trim()
            .toUpperCase();

        return [
          "APPROVED",
          "ACCEPTED",
          "VERIFIED",
          "COMPLETE",
          "COMPLETED",
          "TRUE",
        ].includes(
          normalizedStatus
        );
      };

      if (isApproved) {
        const checks = [
          {
            key: "basic",
            label:
              "Basic Information",
            complete:
              isSectionApproved(
                "basic"
              ) ?? true,
          },
          {
            key: "location",
            label:
              "Location & Directions",
            complete:
              isSectionApproved(
                "location"
              ) ?? true,
          },
          {
            key: "amenities",
            label:
              "Amenities",
            complete:
              isSectionApproved(
                "amenities"
              ) ?? true,
          },
          {
            key: "rooms",
            label:
              "Room Configurations",
            complete:
              isSectionApproved(
                "rooms"
              ) ?? true,
          },
          {
            key: "photos",
            label:
              "Photos",
            /*
             * A rejected photo is admin feedback, not a reason
             * to make an already-approved hostel incomplete.
             * The rejected photo is handled separately below.
             */
            complete: true,
          },
        ];

        const completed =
          checks.filter(
            (item) =>
              item.complete
          ).length;

        return {
          percentage:
            Math.round(
              (completed /
                checks.length) *
                100
            ),
          checks,
        };
      }

      const checks = [
        {
          key: "basic",
          label:
            "Basic Information",
          complete:
            Boolean(
              hostel.name
            ) &&
            Boolean(
              hostel.hostelType ||
                hostel.description
            ),
        },
        {
          key: "location",
          label:
            "Location & Directions",
          complete:
            Boolean(
              hostel.address ||
                hostel.area ||
                hostel.city ||
                hostel.state
            ),
        },
        {
          key: "amenities",
          label:
            "Amenities",
          complete:
            Array.isArray(
              hostel.amenities
            ) &&
            hostel.amenities.length >
              0,
        },
        {
          key: "rooms",
          label:
            "Room Configurations",
          complete:
            Array.isArray(
              rooms
            ) &&
            rooms.length > 0,
        },
        {
          key: "photos",
          label:
            "Photos",
          complete:
            Boolean(
              coverImage
            ) ||
            (Array.isArray(
              hostel.photos
            ) &&
              hostel.photos.length >
                0),
        },
      ];

      const completed =
        checks.filter(
          (item) =>
            item.complete
        ).length;

      return {
        percentage:
          Math.round(
            (completed /
              checks.length) *
              100
          ),
        checks,
      };
    }, [
      dashboardData,
      hostel,
      rooms,
      coverImage,
    ]);

  /* =========================================================
     PERFORMANCE DATA SOURCE (single source of truth)
     ========================================================= */

  const performanceSource =
    useMemo(() => {
      return (
        analytics.performance ||
        dashboardData?.performance ||
        dashboardData?.analytics?.performance ||
        dashboardData?.data?.performance ||
        []
      );
    }, [
      analytics.performance,
      dashboardData?.performance,
      dashboardData?.analytics?.performance,
      dashboardData?.data?.performance,
    ]);

  /* =========================================================
     PERIOD-FILTERED PERFORMANCE DATA (dynamic)
     ========================================================= */

  const filteredPerformance =
    useMemo(() => {
      if (
        !Array.isArray(performanceSource) ||
        performanceSource.length === 0
      ) {
        return [];
      }

      const days =
        PERIOD_TO_DAYS[period] || 30;

      /*
       * If the API returns date/label values we filter
       * by date range. Otherwise fall back to slicing the
       * most recent `days` entries.
       */
      const hasDateFields =
        performanceSource.some(
          (item) =>
            item?.date ||
            item?.label
        );

      if (hasDateFields) {
        const cutoff =
          new Date();

        cutoff.setHours(
          0,
          0,
          0,
          0
        );

        cutoff.setDate(
          cutoff.getDate() -
            (days - 1)
        );

        const filtered =
          performanceSource.filter(
            (item) => {
              const raw =
                item?.date ||
                item?.label;

              if (!raw) {
                return false;
              }

              const parsed =
                parseDateSafe(raw);

              if (!parsed) {
                return true;
              }

              return (
                parsed >=
                cutoff
              );
            }
          );

        return filtered.length >
          0
          ? filtered
          : performanceSource;
      }

      return performanceSource.slice(
        -days
      );
    }, [
      performanceSource,
      period,
    ]);

  /* =========================================================
     PERIOD-AWARE KPI METRICS
     (Profile Views + Search Appearances)
     ========================================================= */

  const periodMetrics =
    useMemo(() => {
      const source =
        Array.isArray(performanceSource)
          ? performanceSource
          : [];

      const days =
        PERIOD_TO_DAYS[period] || 30;

      const analyticsViews =
        toNumber(analytics.profileViews, 0);

      const analyticsSearches =
        toNumber(
          analytics.searchAppearances,
          0
        );

      const analyticsViewsDelta =
        analytics.profileViewsDelta;

      const analyticsSearchesDelta =
        analytics.searchAppearancesDelta;

      /*
       * If no time series is available, fall back to the
       * aggregate values that the analytics API already gave us.
       */
      if (source.length === 0) {
        return {
          profileViews: analyticsViews,
          searchAppearances:
            analyticsSearches,
          profileViewsDelta:
            analyticsViewsDelta,
          searchAppearancesDelta:
            analyticsSearchesDelta,
        };
      }

      const hasDateFields =
        source.some(
          (item) =>
            item?.date ||
            item?.label
        );

      let currentSlice = [];
      let previousSlice = [];

      if (hasDateFields) {
        const now = new Date();
        now.setHours(
          23,
          59,
          59,
          999
        );

        const currentStart =
          new Date();
        currentStart.setHours(
          0,
          0,
          0,
          0
        );
        currentStart.setDate(
          currentStart.getDate() -
            (days - 1)
        );

        const previousEnd =
          new Date(currentStart);
        previousEnd.setMilliseconds(-1);

        const previousStart =
          new Date(previousEnd);
        previousStart.setHours(
          0,
          0,
          0,
          0
        );
        previousStart.setDate(
          previousStart.getDate() -
            (days - 1)
        );

        const sorted = [
          ...source,
        ].sort((a, b) => {
          const da =
            parseDateSafe(
              a?.date ||
                a?.label
            )?.getTime() || 0;
          const db =
            parseDateSafe(
              b?.date ||
                b?.label
            )?.getTime() || 0;
          return da - db;
        });

        currentSlice =
          sorted.filter((item) => {
            const d =
              parseDateSafe(
                item?.date ||
                  item?.label
              );
            return (
              d &&
              d >= currentStart &&
              d <= now
            );
          });

        previousSlice =
          sorted.filter((item) => {
            const d =
              parseDateSafe(
                item?.date ||
                  item?.label
              );
            return (
              d &&
              d >= previousStart &&
              d <= previousEnd
            );
          });

        if (currentSlice.length === 0) {
          currentSlice =
            sorted.slice(-days);
          previousSlice =
            sorted.slice(
              -(days * 2),
              -days
            );
        }
      } else {
        currentSlice =
          source.slice(-days);
        previousSlice =
          source.slice(
            -(days * 2),
            -days
          );
      }

      const sumBy = (
        arr,
        keyA,
        keyB
      ) =>
        arr.reduce((acc, item) => {
          const v = toNumber(
            item?.[keyA] ??
              item?.[keyB],
            0
          );
          return acc + v;
        }, 0);

      const currentViews = sumBy(
        currentSlice,
        "views",
        "profileViews"
      );

      const currentSearches = sumBy(
        currentSlice,
        "searchAppearances",
        "searches"
      );

      const previousViews = sumBy(
        previousSlice,
        "views",
        "profileViews"
      );

      const previousSearches = sumBy(
        previousSlice,
        "searchAppearances",
        "searches"
      );

      const resolvedViews =
        currentViews > 0
          ? currentViews
          : analyticsViews;

      const resolvedSearches =
        currentSearches > 0
          ? currentSearches
          : analyticsSearches;

      const resolvedViewsDelta =
        previousViews > 0
          ? computeDelta(
              currentViews,
              previousViews
            )
          : analyticsViewsDelta;

      const resolvedSearchesDelta =
        previousSearches > 0
          ? computeDelta(
              currentSearches,
              previousSearches
            )
          : analyticsSearchesDelta;

      return {
        profileViews: resolvedViews,
        searchAppearances:
          resolvedSearches,
        profileViewsDelta:
          resolvedViewsDelta,
        searchAppearancesDelta:
          resolvedSearchesDelta,
      };
    }, [
      performanceSource,
      period,
      analytics.profileViews,
      analytics.searchAppearances,
      analytics.profileViewsDelta,
      analytics.searchAppearancesDelta,
    ]);

  /* =========================================================
     PERIOD-AWARE ISSUES METRIC
     ========================================================= */

  const issuesMetric =
    useMemo(() => {
      const all = Array.isArray(issues)
        ? issues
        : [];

      const days =
        PERIOD_TO_DAYS[period] || 30;

      const getIssueDate = (issue) =>
        parseDateSafe(
          issue?.createdAt ||
            issue?.reportedAt ||
            issue?.date ||
            issue?.updatedAt
        );

      /*
       * If the dashboard analytics block already exposes an
       * issues/enquiries aggregate, prefer it when there is
       * no raw list to filter.
       */
      const analyticsIssues = toNumber(
        analytics.issues ??
          analytics.enquiries,
        NaN
      );

      if (all.length === 0) {
        return {
          count: Number.isFinite(
            analyticsIssues
          )
            ? analyticsIssues
            : 0,
          delta:
            analytics.issuesDelta ??
            analytics.enquiriesDelta ??
            null,
        };
      }

      const hasDates = all.some(
        (item) =>
          getIssueDate(item) !== null
      );

      if (!hasDates) {
        return {
          count: all.length,
          delta:
            analytics.issuesDelta ??
            analytics.enquiriesDelta ??
            null,
        };
      }

      const now = new Date();
      now.setHours(
        23,
        59,
        59,
        999
      );

      const currentStart = new Date();
      currentStart.setHours(
        0,
        0,
        0,
        0
      );
      currentStart.setDate(
        currentStart.getDate() -
          (days - 1)
      );

      const previousEnd =
        new Date(currentStart);
      previousEnd.setMilliseconds(-1);

      const previousStart =
        new Date(previousEnd);
      previousStart.setHours(
        0,
        0,
        0,
        0
      );
      previousStart.setDate(
        previousStart.getDate() -
          (days - 1)
      );

      const currentCount = all.filter(
        (item) => {
          const d = getIssueDate(item);
          return (
            d &&
            d >= currentStart &&
            d <= now
          );
        }
      ).length;

      const previousCount = all.filter(
        (item) => {
          const d = getIssueDate(item);
          return (
            d &&
            d >= previousStart &&
            d <= previousEnd
          );
        }
      ).length;

      const delta =
        previousCount > 0
          ? computeDelta(
              currentCount,
              previousCount
            )
          : null;

      return {
        count: currentCount,
        delta:
          delta ??
          analytics.issuesDelta ??
          analytics.enquiriesDelta ??
          null,
      };
    }, [
      issues,
      period,
      analytics.issues,
      analytics.enquiries,
      analytics.issuesDelta,
      analytics.enquiriesDelta,
    ]);

  /* =========================================================
     PERIOD-AWARE RATING METRIC
     ========================================================= */

  const ratingMetric =
    useMemo(() => {
      const all = Array.isArray(reviews)
        ? reviews
        : [];

      const days =
        PERIOD_TO_DAYS[period] || 30;

      const getReviewDate = (review) =>
        parseDateSafe(
          review?.createdAt ||
            review?.date ||
            review?.reviewedAt ||
            review?.updatedAt
        );

      const getRating = (review) =>
        toNumber(
          review?.rating ??
            review?.stars ??
            review?.score,
          0
        );

      const analyticsAvg = toNumber(
        analytics.averageRating,
        0
      );

      const analyticsCount = toNumber(
        analytics.reviewCount,
        0
      );

      if (all.length === 0) {
        return {
          average:
            analyticsAvg > 0
              ? analyticsAvg
              : null,
          count: analyticsCount,
          delta: null,
        };
      }

      const hasDates = all.some(
        (item) =>
          getReviewDate(item) !== null
      );

      if (!hasDates) {
        const avg =
          all.reduce(
            (acc, item) =>
              acc + getRating(item),
            0
          ) / all.length;

        return {
          average: avg,
          count: all.length,
          delta: null,
        };
      }

      const now = new Date();
      now.setHours(
        23,
        59,
        59,
        999
      );

      const currentStart = new Date();
      currentStart.setHours(
        0,
        0,
        0,
        0
      );
      currentStart.setDate(
        currentStart.getDate() -
          (days - 1)
      );

      const previousEnd =
        new Date(currentStart);
      previousEnd.setMilliseconds(-1);

      const previousStart =
        new Date(previousEnd);
      previousStart.setHours(
        0,
        0,
        0,
        0
      );
      previousStart.setDate(
        previousStart.getDate() -
          (days - 1)
      );

      let currentReviews = all.filter(
        (item) => {
          const d = getReviewDate(item);
          return (
            d &&
            d >= currentStart &&
            d <= now
          );
        }
      );

      const previousReviews = all.filter(
        (item) => {
          const d = getReviewDate(item);
          return (
            d &&
            d >= previousStart &&
            d <= previousEnd
          );
        }
      );

      /*
       * If nothing fell inside the current window (e.g. the
       * period selector is very narrow), fall back to all
       * reviews so the user still sees a meaningful value.
       */
      if (currentReviews.length === 0) {
        currentReviews = all;
      }

      const currentAvg =
        currentReviews.length > 0
          ? currentReviews.reduce(
              (acc, item) =>
                acc + getRating(item),
              0
            ) / currentReviews.length
          : 0;

      const previousAvg =
        previousReviews.length > 0
          ? previousReviews.reduce(
              (acc, item) =>
                acc + getRating(item),
              0
            ) / previousReviews.length
          : 0;

      const delta =
        previousAvg > 0
          ? computeDelta(
              currentAvg,
              previousAvg
            )
          : null;

      return {
        average:
          currentAvg > 0
            ? currentAvg
            : analyticsAvg > 0
              ? analyticsAvg
              : null,
        count:
          currentReviews.length > 0
            ? currentReviews.length
            : analyticsCount,
        delta,
      };
    }, [
      reviews,
      period,
      analytics.averageRating,
      analytics.reviewCount,
    ]);

  /* =========================================================
     ROOM DATA IS INCLUDED IN THE FULL REAL-TIME DASHBOARD
     REFRESH ABOVE, SO NO SECOND ROOM POLLING LOOP IS NEEDED.
     ========================================================= */

  /* =========================================================
     NAVIGATION
     ========================================================= */

  const handleNavigation = (
    path
  ) => {
    setSidebarOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    navigate("/");
  };

  /* =========================================================
     LOADING STATE
     ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-7 h-7 animate-spin text-blue-600" />

          <p className="text-sm">
            Loading your hostel dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN UI
     ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={() =>
            setSidebarOpen(
              false
            )
          }
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          h-screen
          w-[250px]
          border-r
          border-slate-200
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
                {APP_NAME}
              </h1>

              <p className="text-[10px] font-semibold tracking-wider text-slate-500 mt-1">
                {APP_TAGLINE}
              </p>

            </div>

          </div>

          <button
            onClick={() =>
              setSidebarOpen(
                false
              )
            }
            className="ml-auto lg:hidden p-2 text-slate-500 hover:text-slate-900"
          >
            <X size={20} />
          </button>

        </div>

        {/* Navigation */}

        <div className="px-3 py-5 overflow-y-auto h-[calc(100vh-72px)]">

          <SidebarLabel label="MAIN" />

          <SidebarItem
            icon={
              <LayoutDashboard
                size={18}
              />
            }
            label="Dashboard"
            active
            onClick={() =>
              handleNavigation(
                "/owner/dashboard"
              )
            }
          />

          <SidebarLabel label="MY HOSTEL" />

          <SidebarItem
            icon={
              <Building2
                size={18}
              />
            }
            label="Hostel Profile"
            onClick={() =>
              handleNavigation(
                "/owner/hostel"
              )
            }
          />

          <SidebarItem
            icon={
              <BedDouble
                size={18}
              />
            }
            label="Rooms"
            onClick={() =>
              handleNavigation(
                "/owner/rooms"
              )
            }
          />

          <SidebarItem
            icon={
              <Utensils
                size={18}
              />
            }
            label="Amenities"
            onClick={() =>
              handleNavigation(
                "/owner/amenities"
              )
            }
          />

          <SidebarItem
            icon={
              <Images size={18} />
            }
            label="Photos"
            onClick={() =>
              handleNavigation(
                "/owner/photos"
              )
            }
          />

          <SidebarLabel label="DISCOVERY" />

          <SidebarItem
            icon={
              <MessageSquare
                size={18}
              />
            }
            label="Issues"
            onClick={() =>
              handleNavigation(
                "/owner/issues"
              )
            }
            badge={
              issues.length > 0
                ? issues.filter(
                    (item) => {
                      const status =
                        String(
                          item?.status ||
                            ""
                        )
                          .trim()
                          .toUpperCase();

                      return [
                        "OPEN",
                        "PENDING",
                        "IN_PROGRESS",
                        "IN PROGRESS",
                        "REOPENED",
                        "RESOLUTION_SUBMITTED",
                        "RESOLUTION SUBMITTED",
                      ].includes(
                        status
                      );
                    }
                  ).length ||
                  null
                : null
            }
          />

          <SidebarItem
            icon={
              <Star size={18} />
            }
            label="Reviews"
            onClick={() =>
              handleNavigation(
                "/owner/reviews"
              )
            }
          />

          <SidebarLabel label="INSIGHTS" />

          <SidebarItem
            icon={
              <BarChart3
                size={18}
              />
            }
            label="Analytics"
            onClick={() =>
              handleNavigation(
                "/owner/analytics"
              )
            }
          />

          <SidebarLabel label="ACCOUNT" />

          <SidebarItem
            icon={
              <Settings
                size={18}
              />
            }
            label="Settings"
            onClick={() =>
              handleNavigation(
                "/owner/settings"
              )
            }
          />

          {/* =================================================
              SUPPORT
              ================================================= */}

          <SidebarItem
            icon={
              <CircleHelp
                size={18}
              />
            }
            label="Support"
            onClick={() =>
              handleNavigation(
                "/owner/support"
              )
            }
          />

          <div className="mt-8 pt-5 border-t border-slate-100">

            <button              onClick={() =>
                handleNavigation(
                  publicListingPath
                )
              }
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
                transition
              "
            >
              <Eye size={16} />

              View Public Listing

              <ExternalLink
                size={14}
              />
            </button>

          </div>

        </div>

      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="lg:ml-[250px] h-screen flex flex-col overflow-hidden">

        {/* ===================================================
            TOP HEADER
        =================================================== */}

        <header className="h-[72px] flex-shrink-0 bg-white border-b border-slate-200 px-5 lg:px-8 flex items-center justify-between">

          <div className="flex items-center gap-4">

            <button
              onClick={() =>
                setSidebarOpen(
                  true
                )
              }
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu size={21} />
            </button>

            <div>

              <p className="text-xs font-medium text-slate-500">
                {OWNER_PORTAL_LABEL}
              </p>

              <p className="hidden sm:block text-sm font-semibold text-slate-800">
                {hostelName}
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            {/* Live refresh status */}

            <div
              className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600"
              title="Dashboard refreshes automatically every 5 seconds"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  refreshing
                    ? "bg-amber-500 animate-pulse"
                    : "bg-emerald-500"
                }`}
              />
              {refreshing ? "Updating" : "Live"}
            </div>

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

              {dashboardData?.notifications
                ?.unread >
                0 && (
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
              onClick={() =>
                handleNavigation(
                  publicListingPath
                )
              }
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
              <ExternalLink
                size={14}
              />
            </button>

            {/* OWNER PROFILE */}

            <div
              className="relative"
              ref={
                profileMenuRef
              }
            >

              <button
                type="button"
                onClick={() =>
                  setProfileMenuOpen(
                    (prev) =>
                      !prev
                  )
                }
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
                title={ownerRole}
              >

                <div className="text-right hidden sm:block">

                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {ownerName}
                  </p>

                  <p className="text-xs text-slate-500 mt-0.5">
                    {ownerRole}
                  </p>

                </div>

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
                      src={
                        owner.profileImage
                      }
                      alt={
                        ownerName
                      }
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
                  className={`
                    text-slate-400
                    hidden
                    sm:block
                    transition-transform
                    duration-200
                    ${
                      profileMenuOpen
                        ? "rotate-180"
                        : ""
                    }
                  `}
                />

              </button>

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

                  <div className="px-4 py-3 border-b border-slate-100">

                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {ownerName}
                    </p>

                    <p className="text-xs text-slate-500 mt-0.5">
                      {ownerRole}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(
                        false
                      );

                      handleNavigation(
                        "/owner/settings"
                      );
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
                      setProfileMenuOpen(
                        false
                      );

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

        {/* ===================================================
            SCROLLABLE CONTENT AREA
        =================================================== */}

        <div className="flex-1 overflow-y-auto">

          <div className="p-5 lg:p-8 max-w-[1500px] mx-auto">

          {/* Greeting */}
<div className="mb-6">
  <h2 className="text-2xl lg:text-[28px] font-bold tracking-tight">
    {getTimeBasedGreeting()}, {ownerName} 👋
  </h2>
  <p className="mt-1 text-sm text-slate-500">
    Here's how your hostel is performing today.
  </p>
</div>

{/* =====================================================
    REJECTED APPLICATION BANNER
===================================================== */}
{String(
  dashboardData?.approvalStatus ||
    dashboardData?.approval?.status ||
    dashboardData?.status ||
    ""
)
  .trim()
  .toUpperCase() === "REJECTED" && (
  <section className="mb-5 rounded-xl border border-red-200 bg-red-50/70 p-5">
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
        <AlertTriangle size={20} className="text-red-600" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-red-900">
          Your hostel application was rejected
        </h3>
        <p className="text-sm text-red-800/80 mt-1">
          You can review the admin feedback and submit a new application.
          Your owner account remains active.
        </p>
      </div>

      <button
        onClick={() => handleNavigation("/owner/add-hostel")}
        className="h-9 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center justify-center gap-2 flex-shrink-0"
      >
        Start New Application
        <ChevronRight size={15} />
      </button>
    </div>
  </section>
)}

          {/* Error */}

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
              HOSTEL HERO
          ================================================= */}

          <section className="bg-white border border-slate-200 rounded-xl p-4 lg:p-5 mb-5">

            <div className="flex flex-col lg:flex-row lg:items-center gap-5">

              <div className="w-full lg:w-[250px] h-[145px] rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">

                {coverImage ? (
                  <img
                    src={
                      coverImage
                    }
                    alt={
                      hostelName
                    }
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error(
                        "Failed to load hostel cover image:",
                        coverImage
                      );

                      console.error(
                        "Image error:",
                        e
                      );

                      /*
                       * Do not leave a broken <img> element visible.
                       * Clearing the state renders the existing
                       * dashboard placeholder instead.
                       */
                      setCoverImage(null);
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Images
                      size={32}
                    />
                  </div>
                )}

              </div>

              <div className="flex-1 min-w-0">

                <div className="flex items-center gap-2 mb-2">

                  {String(
                    dashboardData?.approvalStatus ||
                      ""
                  )
                    .trim()
                    .toUpperCase() ===
                    "APPROVED" && (
                    <span className="
                      inline-flex
                      items-center
                      gap-1.5
                      px-2.5
                      py-1
                      rounded-full
                      bg-emerald-50
                      border
                      border-emerald-200
                      text-emerald-700
                      text-xs
                      font-semibold
                    ">

                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />

                      Live & Approved

                    </span>
                  )}

                  {owner.emailVerified && (
                    <span className="
                      inline-flex
                      items-center
                      gap-1
                      px-2.5
                      py-1
                      rounded-full
                      bg-slate-100
                      text-slate-700
                      text-xs
                      font-medium
                    ">

                      <CheckCircle2
                        size={13}
                      />

                      Owner Verified

                    </span>
                  )}

                </div>

                <h3 className="text-xl lg:text-2xl font-bold truncate">
                  {hostelName}
                </h3>

                {hostelLocation && (
                  <div className="flex items-center gap-1.5 mt-2 text-sm text-slate-500">

                    <MapPin size={15} />

                    {hostelLocation}

                  </div>
                )}

                {hostel.hostelType && (
                  <div className="mt-1 text-sm text-slate-600">
                    Type:{" "}
                    {hostel.hostelType}
                  </div>
                )}

                {hostel.description && (
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                    {
                      hostel.description
                    }
                  </p>
                )}

              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2">

                <button
                  onClick={() =>
                    handleNavigation(
                      "/owner/hostel"
                    )
                  }
                  className="
                    h-10
                    px-4
                    rounded-lg
                    border
                    border-slate-300
                    bg-white
                    hover:bg-slate-50
                    text-sm
                    font-medium
                    flex
                    items-center
                    justify-center
                    gap-2
                  "
                >

                  <Pencil
                    size={15}
                  />

                  Edit Hostel Profile

                </button>

                <button
                  onClick={() =>
                    handleNavigation(
                      publicListingPath
                    )
                  }
                  className="
                    h-10
                    px-4
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

                  View Public Listing

                  <ExternalLink
                    size={14}
                  />

                </button>

              </div>

            </div>

          </section>

          {/* =================================================
              ADMIN FEEDBACK
          ================================================= */}

          {String(
            dashboardData?.approvalStatus ||
              dashboardData?.approval?.status ||
              dashboardData?.status ||
              ""
          )
            .trim()
            .toUpperCase() ===
            "APPROVED" &&
            photoApproval.hasRejectedPhotos && (
              <section className="mb-5 rounded-xl border border-amber-200 bg-amber-50/70 p-4 lg:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle
                      size={20}
                      className="text-amber-600"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-amber-900">
                        Admin Feedback
                      </h3>

                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                        {photoApproval.rejected}{" "}
                        {photoApproval.rejected === 1
                          ? "Photo"
                          : "Photos"}{" "}
                        Need Attention
                      </span>
                    </div>

                    <p className="text-sm text-amber-800/80 mt-1">
                      Your hostel has been approved, but some
                      photos were not approved by the admin.
                      Review the feedback and replace the
                      rejected photos.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      photoApprovalSectionRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                    className="
                      h-9
                      px-4
                      rounded-lg
                      border
                      border-amber-300
                      bg-white
                      hover:bg-amber-50
                      text-sm
                      font-semibold
                      text-amber-800
                      flex
                      items-center
                      justify-center
                      gap-2
                      flex-shrink-0
                    "
                  >
                    Review Photos
                    <ChevronRight
                      size={15}
                    />
                  </button>
                </div>
              </section>
            )}

          {/* =================================================
              KPI CARDS
          ================================================= */}

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">

            <MetricCard
              icon={
                <Eye size={19} />
              }
              iconClass="bg-blue-50 text-blue-600"
              label="Profile Views"
              value={formatMetric(
                periodMetrics.profileViews
              )}
              delta={
                periodMetrics.profileViewsDelta
              }
              periodLabel={period}
            />

            <MetricCard
              icon={
                <Search size={19} />
              }
              iconClass="bg-indigo-50 text-indigo-600"
              label="Search Appearances"
              value={formatMetric(
                periodMetrics.searchAppearances
              )}
              delta={
                periodMetrics.searchAppearancesDelta
              }
              periodLabel={period}
            />

            <MetricCard
              icon={
                <MessageSquare size={19} />
              }
              iconClass="bg-violet-50 text-violet-600"
              label="Issues"
              value={formatMetric(
                issuesMetric.count
              )}
              delta={
                issuesMetric.delta
              }
              periodLabel={period}
            />

            <MetricCard
              icon={
                <Star size={19} />
              }
              iconClass="bg-amber-50 text-amber-600"
              label="Rating"
              value={
                ratingMetric.average !=
                  null &&
                ratingMetric.average > 0
                  ? `${ratingMetric.average.toFixed(
                      1
                    )} / 5`
                  : "—"
              }
              delta={ratingMetric.delta}
              supportingText={
                ratingMetric.count > 0
                  ? `Based on ${ratingMetric.count} reviews`
                  : "No reviews yet"
              }
              periodLabel={period}
            />

          </section>

          {/* =================================================
              PERFORMANCE + AVAILABILITY
          ================================================= */}

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">

            {/* Listing Performance */}

            <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">

              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">

                <div>
                  <h3 className="font-semibold text-base">
                    Listing Performance
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Track how users discover and view your hostel
                  </p>
                </div>

                <div className="flex items-center rounded-lg border border-slate-200 p-0.5">

                  {[
                    "7D",
                    "30D",
                    "90D",
                  ].map(
                    (item) => (
                      <button
                        key={
                          item
                        }
                        onClick={() =>
                          setPeriod(
                            item
                          )
                        }
                        className={`
                          px-3
                          py-1.5
                          rounded-md
                          text-xs
                          font-medium
                          transition
                          ${
                            period ===
                            item
                              ? "bg-blue-50 text-blue-700"
                              : "text-slate-500 hover:text-slate-800"
                          }
                        `}
                      >
                        {item}
                      </button>
                    )
                  )}

                </div>

              </div>

              <div className="p-5">

                {filteredPerformance.length >
                0 ? (
                  <PerformanceChart
                    data={
                      filteredPerformance
                    }
                    period={
                      period
                    }
                  />
                ) : (
                  <EmptyChartState />
                )}

              </div>

            </div>

            {/* =================================================
                ROOM AVAILABILITY
            ================================================= */}

            <div className="bg-white border border-slate-200 rounded-xl p-5">

              <div className="flex items-center justify-between">

                <h3 className="font-semibold text-base">
                  Room Availability
                </h3>

                {rooms.length >
                  0 && (
                  <span className="text-[10px] font-medium text-slate-400">
                    Live
                  </span>
                )}

              </div>

              {occupancy.percentage !==
              null ? (
                <>

                  {/* Overall room/beds summary */}

                  <div className="flex items-center gap-5 mt-5">

                    <RadialProgress
                      percentage={
                        occupancy.percentage
                      }
                    />

                    <div>

                      <p className="text-sm font-semibold text-slate-800">
                        {
                          occupancy.occupiedBeds
                        }{" "}
                        of{" "}
                        {
                          occupancy.totalBeds
                        }{" "}
                        beds occupied
                      </p>

                      <p className="text-sm text-blue-600 mt-1">
                        {
                          occupancy.availableBeds
                        }{" "}
                        beds available
                      </p>

                      {occupancy.totalRooms >
                        0 && (
                        <p className="text-xs text-slate-500 mt-1">
                          {
                            occupancy.availableRooms
                          }{" "}
                          of{" "}
                          {
                            occupancy.totalRooms
                          }{" "}
                          rooms available
                        </p>
                      )}

                    </div>

                  </div>

                  {/* Room rows */}

                  <div className="mt-6 space-y-4">

                    {rooms.map(
                      (
                        room,
                        index
                      ) => (
                        <RoomAvailabilityRow
                          key={
                            room.id ||
                            room.roomId ||
                            index
                          }
                          room={
                            room
                          }
                        />
                      )
                    )}

                  </div>

                </>
              ) : (
                <EmptyState
                  icon={
                    <BedDouble
                      size={22}
                    />
                  }
                  title="No room availability data"
                  description="Add room information to track availability."
                  actionLabel="Manage Rooms"
                  onAction={() =>
                    handleNavigation(
                      "/owner/rooms"
                    )
                  }
                />
              )}

            </div>

          </section>

          {/* =================================================
              ISSUES + QUICK ACTIONS
          ================================================= */}

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">

            {/* Recent Issues */}
            <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">

              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">

                <div>
                  <h3 className="font-semibold text-base">
                    Recent Issues
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Review issues reported by users for your hostel
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleNavigation(
                      "/owner/issues"
                    )
                  }
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  View All
                </button>

              </div>

              {issues.length > 0 ? (
                <div className="divide-y divide-slate-100">

                  {issues
                    .slice(0, 5)
                    .map((issue, index) => (
                      <IssueRow
                        key={
                          issue.id ||
                          issue.issueId ||
                          index
                        }
                        issue={issue}
                        onClick={() =>
                          handleNavigation(
                            "/owner/issues"
                          )
                        }
                      />
                    ))}

                </div>
              ) : (
                <EmptyState
                  icon={
                    <MessageSquare
                      size={22}
                    />
                  }
                  title="No issues reported yet"
                  description="When users report issues for your hostel, they will appear here for review and resolution."
                  actionLabel="View Issues"
                  onAction={() =>
                    handleNavigation(
                      "/owner/issues"
                    )
                  }
                />
              )}

            </div>

            {/* Quick Actions */}

            <div className="bg-white border border-slate-200 rounded-xl p-5">

              <h3 className="font-semibold text-base">
                Quick Actions
              </h3>

              <div className="mt-3 divide-y divide-slate-100">

                <QuickAction
                  icon={
                    <Plus size={17} />
                  }
                  label="Add Room"
                  onClick={() =>
                    handleNavigation(
                      "/owner/rooms"
                    )
                  }
                />

                <QuickAction
                  icon={
                    <Pencil
                      size={17}
                    />
                  }
                  label="Edit Hostel Profile"
                  onClick={() =>
                    handleNavigation(
                      "/owner/hostel"
                    )
                  }
                />

                <QuickAction
                  icon={
                    <Images
                      size={17}
                    />
                  }
                  label="Manage Photos"
                  onClick={() =>
                    handleNavigation(
                      "/owner/photos"
                    )
                  }
                />

                <QuickAction
                  icon={
                    <MapPin
                      size={17}
                    />
                  }
                  label="Update Location / Landmarks"
                  onClick={() =>
                    handleNavigation(
                      "/owner/hostel"
                    )
                  }
                />

                <QuickAction
                  icon={
                    <Eye size={17} />
                  }
                  label="View Public Listing"
                  highlighted
                  onClick={() =>
                    handleNavigation(
                      publicListingPath
                    )
                  }
                />

              </div>

            </div>

          </section>

          {/* =================================================
              LISTING HEALTH
          ================================================= */}

          <section className="bg-white border border-slate-200 rounded-xl p-5 mb-5">

            <div className="flex flex-col lg:flex-row lg:items-center gap-4">

              <div className="flex items-center gap-3 min-w-[180px]">

                <h3 className="font-semibold">
                  Listing Health
                </h3>

                <span className="text-lg font-bold text-emerald-600">
                  {
                    listingHealth.percentage
                  }%
                </span>

              </div>

              <div className="flex-1">

                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{
                      width: `${listingHealth.percentage}%`,
                    }}
                  />

                </div>

              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-5">

              {listingHealth.checks.map(
                (item) => (
                  <div
                    key={
                      item.key
                    }
                    className="
                      rounded-lg
                      border
                      border-slate-200
                      p-3
                      bg-white
                    "
                  >

                    <div className="flex items-center gap-2">

                      {item.complete ? (
                        <CheckCircle2
                          size={17}
                          className="text-emerald-600"
                        />
                      ) : (
                        <AlertTriangle
                          size={17}
                          className="text-amber-500"
                        />
                      )}

                      <span className="text-xs font-medium">
                        {
                          item.label
                        }
                      </span>

                    </div>

                    <p
                      className={`
                        text-sm
                        font-bold
                        mt-2
                        ${
                          item.complete
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }
                      `}
                    >
                      {item.complete
                        ? "Complete"
                        : "Needs attention"}
                    </p>

                  </div>
                )
              )}

            </div>

          </section>

          {/* =================================================
              PHOTO APPROVAL
          ================================================= */}

          {String(
            dashboardData?.approvalStatus ||
              dashboardData?.approval?.status ||
              dashboardData?.status ||
              ""
          )
            .trim()
            .toUpperCase() ===
            "APPROVED" &&
            (photoApproval.total > 0 ||
              photoApproval.hasRejectedPhotos) && (
              <section
                ref={photoApprovalSectionRef}
                className="bg-white border border-slate-200 rounded-xl p-5 mb-5 scroll-mt-24"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-base">
                      Photo Approval
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                      Admin verification status for your hostel photos
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleNavigation(
                        "/owner/photos"
                      )
                    }
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    Manage Photos
                    <ChevronRight
                      size={14}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                    <p className="text-xs font-medium text-emerald-700">
                      Approved
                    </p>

                    <p className="text-2xl font-bold text-emerald-700 mt-1">
                      {photoApproval.approved}
                    </p>
                  </div>

                  <div
                    className={`rounded-lg border p-3 ${
                      photoApproval.rejected > 0
                        ? "border-red-200 bg-red-50/60"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <p
                      className={`text-xs font-medium ${
                        photoApproval.rejected > 0
                          ? "text-red-700"
                          : "text-slate-600"
                      }`}
                    >
                      Rejected
                    </p>

                    <p
                      className={`text-2xl font-bold mt-1 ${
                        photoApproval.rejected > 0
                          ? "text-red-700"
                          : "text-slate-700"
                      }`}
                    >
                      {photoApproval.rejected}
                    </p>
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                    <p className="text-xs font-medium text-amber-700">
                      Pending Review
                    </p>

                    <p className="text-2xl font-bold text-amber-700 mt-1">
                      {photoApproval.pending}
                    </p>
                  </div>
                </div>

                {photoApproval.rejectedPhotos.length >
                0 ? (
                  <div className="mt-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">
                          Rejected Photos
                        </h4>

                        <p className="text-xs text-slate-500 mt-1">
                          These photos are visible only to you
                          and are not shown on the public listing.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {photoApproval.rejectedPhotos
                        .slice(0, 6)
                        .map(
                          (photo, index) => {
                            const reason =
                              photo?.rejectionReason ||
                              photo?.reason ||
                              photo?.verificationReason ||
                              photo?.remarks ||
                              photo?.adminComment ||
                              "This photo was not approved by the admin.";

                            const photoId =
                              photo?.photoId ||
                              photo?.id ||
                              index;

                            const category =
                              String(
                                photo?.photoCategory ||
                                photo?.type ||
                                photo?.category ||
                                "HOSTEL"
                              )
                                .trim()
                                .toUpperCase();

                            const sectionPath =
                              category === "AMENITY"
                                ? "/owner/amenities"
                                : category === "ROOM"
                                  ? "/owner/rooms"
                                  : "/owner/photos";

                            const sectionName =
                              category === "AMENITY"
                                ? "Amenities"
                                : category === "ROOM"
                                  ? "Rooms"
                                  : "Hostel Photos";

                            return (
                              <div
                                key={photoId}
                                className="rounded-xl border border-red-200 bg-red-50/30 p-4"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-wide text-red-700">
                                      Rejected {category.toLowerCase()} photo
                                    </p>

                                    {photo?.amenityName && (
                                      <p className="text-sm font-semibold text-slate-800 mt-2">
                                        Amenity: {photo.amenityName}
                                      </p>
                                    )}

                                    {!photo?.amenityName && photo?.amenityCode && (
                                      <p className="text-sm font-semibold text-slate-800 mt-2">
                                        Amenity: {photo.amenityCode}
                                      </p>
                                    )}

                                    {photo?.roomType && (
                                      <p className="text-sm font-semibold text-slate-800 mt-2">
                                        Room: {photo.roomType}
                                      </p>
                                    )}

                                    <div className="mt-3">
                                      <p className="text-xs font-semibold text-red-700">
                                        Rejection reason
                                      </p>
                                      <p className="text-sm text-slate-700 mt-1 leading-5">
                                        {reason}
                                      </p>
                                    </div>
                                  </div>

                                  <span className="flex-shrink-0 inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-[10px] font-bold text-red-700">
                                    REJECTED
                                  </span>
                                </div>

                                <div className="mt-4 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleNavigation(sectionPath)
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                                  >
                                    Go to {sectionName}
                                    <ChevronRight size={14} />
                                  </button>
                                </div>
                              </div>
                            );
                          }
                        )}
                    </div>

                    {photoApproval.rejectedPhotos.length >
                      6 && (
                      <button
                        type="button"
                        onClick={() =>
                          handleNavigation(
                            "/owner/photos"
                          )
                        }
                        className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View all rejected photos →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3 flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="text-emerald-600 flex-shrink-0"
                    />

                    <p className="text-sm text-emerald-800">
                      All submitted photos are currently approved.
                    </p>
                  </div>
                )}
              </section>
            )}

          {/* =================================================
              ATTENTION
          ================================================= */}

          {listingHealth.percentage <
            100 &&
            !(
              String(
                dashboardData?.approvalStatus ||
                  dashboardData?.approval?.status ||
                  dashboardData?.status ||
                  ""
              )
                .trim()
                .toUpperCase() ===
                "APPROVED" &&
              photoApproval.hasRejectedPhotos
            ) && (
            <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">

                  <AlertTriangle
                    size={20}
                    className="text-amber-600"
                  />

                </div>

                <div className="flex-1">

                  <h3 className="font-semibold text-amber-900">
                    Improve Your Listing
                  </h3>

                  <p className="text-sm text-amber-800/80 mt-1">
                    Some sections of your hostel listing
                    still need information. Completing them
                    helps users make better decisions.
                  </p>

                </div>

                <button
                  onClick={() =>
                    handleNavigation(
                      "/owner/hostel"
                    )
                  }
                  className="
                    h-9
                    px-4
                    rounded-lg
                    border
                    border-amber-300
                    bg-white
                    hover:bg-amber-50
                    text-sm
                    font-semibold
                    text-amber-800
                    flex
                    items-center
                    gap-2
                    flex-shrink-0
                  "
                >
                  Improve Listing

                  <ChevronRight
                    size={15}
                  />

                </button>

              </div>

            </section>
          )}

          </div>

        </div>

      </main>

    </div>
  );
};

/* ============================================================
   SIDEBAR COMPONENTS
   ============================================================ */

const SidebarLabel = ({
  label,
}) => {
  return (
    <div className="px-3 pt-5 pb-2">

      <p className="text-[10px] font-bold tracking-wider text-slate-400">
        {label}
      </p>

    </div>
  );
};

const SidebarItem = ({
  icon,
  label,
  active,
  onClick,
  badge,
}) => {
  return (
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
        <span className="min-w-5 h-5 px-1.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
          {badge}
        </span>
      ) : null}

    </button>
  );
};

/* ============================================================
   METRIC CARD
   ============================================================ */

const MetricCard = ({
  icon,
  iconClass,
  label,
  value,
  delta,
  supportingText,
  periodLabel,
}) => {
  const numericDelta =
    delta === null ||
    delta === undefined ||
    delta === ""
      ? null
      : Number(delta);

  const hasDelta =
    numericDelta !== null &&
    Number.isFinite(numericDelta);

  const isPositive =
    hasDelta && numericDelta >= 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">

      <div className="flex items-start justify-between">

        <div className="flex items-center gap-3">

          <div
            className={`
              w-9
              h-9
              rounded-full
              flex
              items-center
              justify-center
              ${iconClass}
            `}
          >
            {icon}
          </div>

          <p className="text-sm font-medium text-slate-700">
            {label}
          </p>

        </div>

      </div>

      <div className="mt-4">

        <p className="text-2xl font-bold tracking-tight">
          {value}
        </p>

        {hasDelta ? (
          <div className="flex items-center gap-2 mt-1">

            <span
              className={`text-xs font-semibold ${
                isPositive
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {isPositive ? "↑" : "↓"}{" "}
              {Math.abs(numericDelta)}
              %
            </span>

            <span className="text-[11px] text-slate-400">
              vs previous{" "}
              {PERIOD_TO_LABEL[periodLabel] ||
                "30 days"}
            </span>

          </div>
        ) : supportingText ? (
          <p className="text-xs text-slate-500 mt-2">
            {supportingText}
          </p>
        ) : (
          <p className="text-xs text-slate-400 mt-2">
            No trend data available
          </p>
        )}

      </div>

    </div>
  );
};

/* ============================================================
   RADIAL PROGRESS
   ============================================================ */

const RadialProgress = ({
  percentage,
}) => {
  const radius = 42;

  const circumference =
    2 *
    Math.PI *
    radius;

  const offset =
    circumference -
    (percentage / 100) *
      circumference;

  return (
    <div className="relative w-[105px] h-105px flex-shrink-0">

      <svg
        width="105"
        height="105"
        viewBox="0 0 105 105"
        className="-rotate-90"
      >

        <circle
          cx="52.5"
          cy="52.5"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="7"
        />

        <circle
          cx="52.5"
          cy="52.5"
          r={radius}
          fill="none"
          stroke="#2563eb"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={
            circumference
          }
          strokeDashoffset={
            offset
          }
        />

      </svg>

      <div className="absolute inset-0 flex items-center justify-center">

        <span className="text-xl font-bold">
          {percentage}%
        </span>

      </div>

    </div>
  );
};

/* ============================================================
   ROOM AVAILABILITY ROW
   ============================================================ */

const RoomAvailabilityRow = ({
  room,
}) => {
  /*
   * Prefer totalBeds returned by the backend.
   *
   * Fallback to:
   * numberOfRooms × bedsPerRoom
   */
  const backendTotalBeds =
    Number(
      room?.totalBeds ??
        room?.total_beds ??
        0
    );

  const numberOfRooms =
    Number(
      room?.numberOfRooms ??
        room?.number_of_rooms ??
        room?.totalRooms ??
        room?.total_rooms ??
        0
    );

  const bedsPerRoom =
    Number(
      room?.bedsPerRoom ??
        room?.beds_per_room ??
        0
    );

  const calculatedTotalBeds =
    numberOfRooms > 0 &&
    bedsPerRoom > 0
      ? numberOfRooms *
        bedsPerRoom
      : 0;

  const total =
    backendTotalBeds > 0
      ? backendTotalBeds
      : calculatedTotalBeds;

  const occupied =
    Number(
      room?.occupiedBeds ??
        room?.occupied_beds ??
        room?.occupied ??
        0
    ) || 0;

  const occupiedRooms =
    Number(
      room?.occupiedRooms ??
        room?.occupied_rooms ??
        0
    ) || 0;

  const availableBeds =
    Math.max(
      total -
        occupied,
      0
    );

  const availableRooms =
    Math.max(
      numberOfRooms -
        occupiedRooms,
      0
    );

  const percentage =
    total > 0
      ? Math.round(
          (occupied / total) *
            100
        )
      : 0;

  const roomName =
    room?.roomType ||
    room?.type ||
    room?.name ||
    "Room";

  const formattedRoomName =
    String(roomName)
      .replace(
        /_/g,
        " "
      )
      .toLowerCase()
      .replace(
        /\b\w/g,
        (char) =>
          char.toUpperCase()
      );

  return (
    <div>

      <div className="flex items-center justify-between mb-1.5">

        <span className="text-xs text-slate-600">
          {formattedRoomName}
        </span>

        <span className="text-xs font-medium text-slate-700">
          {total > 0
            ? `${occupied} / ${total}`
            : "—"}
        </span>

      </div>

      <div className="flex items-center gap-3">

        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">

          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(
                percentage,
                100
              )}%`,
            }}
          />

        </div>

        <span className="text-[11px] text-slate-500 w-8 text-right">
          {total > 0
            ? `${percentage}%`
            : "—"}
        </span>

      </div>

      {total > 0 && (
        <div className="flex items-center justify-between mt-1">

          <span className="text-[10px] text-slate-400">
            {availableBeds}{" "}
            beds available
          </span>

          {numberOfRooms >
            0 && (
            <span className="text-[10px] text-slate-400">
              {availableRooms}{" "}
              rooms available
            </span>
          )}

        </div>
      )}

    </div>
  );
};

/* ============================================================
   PERFORMANCE CHART
   ============================================================ */

const PerformanceChart = ({
  data,
}) => {
  const width = 720;
  const height = 250;

  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth =
    width -
    paddingLeft -
    paddingRight;

  const chartHeight =
    height -
    paddingTop -
    paddingBottom;

  const views = data.map(
    (item) =>
      Number(
        item.views || 0
      )
  );

  const searches =
    data.map(
      (item) =>
        Number(
          item.searchAppearances ||
            item.searches ||
            0
        )
    );

  const maxValue =
    Math.max(
      ...views,
      ...searches,
      1
    );

  const getX = (
    index
  ) => {
    if (
      data.length <=
      1
    ) {
      return paddingLeft;
    }

    return (
      paddingLeft +
      (index /
        (data.length -
          1)) *
        chartWidth
    );
  };

  const getY = (
    value
  ) => {
    return (
      paddingTop +
      chartHeight -
      (value /
        maxValue) *
        chartHeight
    );
  };

  const createPath = (
    values
  ) => {
    return values
      .map(
        (
          value,
          index
        ) => {
          const x =
            getX(
              index
            );

          const y =
            getY(
              value
            );

          return `${
            index ===
            0
              ? "M"
              : "L"
          } ${x} ${y}`;
        }
      )
      .join(" ");
  };

  return (
    <div className="w-full overflow-hidden">

      <div className="flex items-center gap-5 mb-4">

        <div className="flex items-center gap-2 text-xs text-slate-600">

          <span className="w-3 h-0.5 bg-blue-600 rounded-full" />

          Profile Views

        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">

          <span className="w-3 border-t-2 border-dashed border-slate-400" />

          Search Appearances

        </div>

      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        preserveAspectRatio="none"
      >

        {[0, 25, 50, 75, 100].map(
          (value) => {
            const y =
              paddingTop +
              chartHeight -
              (value /
                100) *
                chartHeight;

            return (
              <line
                key={
                  value
                }
                x1={
                  paddingLeft
                }
                y1={y}
                x2={
                  width -
                  paddingRight
                }
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            );
          }
        )}

        <path
          d={createPath(
            searches
          )}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="3"
          strokeDasharray="8 8"
        />

        <path
          d={createPath(
            views
          )}
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {data.map(
          (
            item,
            index
          ) => {
            if (
              data.length >
                7 &&
              index %
                  Math.ceil(
                    data.length /
                      6
                  ) !==
                0 &&
              index !==
                data.length -
                  1
            ) {
              return null;
            }

            return (
              <text
                key={
                  index
                }
                x={getX(
                  index
                )}
                y={
                  height -
                  10
                }
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
              >
                {
                  item.label ||
                  item.date ||
                  ""
                }
              </text>
            );
          }
        )}

      </svg>

    </div>
  );
};

/* ============================================================
   EMPTY CHART
   ============================================================ */

const EmptyChartState =
  () => {
    return (
      <div className="h-[250px] rounded-lg bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-5">

        <BarChart3
          size={28}
          className="text-slate-300"
        />

        <p className="text-sm font-medium text-slate-600 mt-3">
          No performance data yet
        </p>

        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Performance metrics will appear here once users
          start discovering and viewing your hostel.
        </p>

      </div>
    );
  };

/* ============================================================
   ISSUE ROW
   ============================================================ */

const IssueRow = ({
  issue,
  onClick,
}) => {
  const title =
    issue?.title ||
    issue?.issueTitle ||
    issue?.subject ||
    "Issue reported by user";

  const description =
    issue?.description ||
    issue?.issueDescription ||
    issue?.message ||
    "No issue description provided.";

  const room =
    issue?.roomName ||
    issue?.roomNumber ||
    issue?.room ||
    issue?.roomType ||
    "—";

  const priority =
    issue?.priority ||
    issue?.priorityLevel ||
    "—";

  const status =
    issue?.status ||
    "—";

  const createdAt =
    issue?.createdAt ||
    issue?.reportedAt ||
    issue?.date ||
    null;

  const normalizedPriority =
    String(
      priority
    )
      .trim()
      .toUpperCase();

  const normalizedStatus =
    String(
      status
    )
      .trim()
      .toUpperCase();

  const priorityClasses =
    {
      URGENT:
        "bg-red-100 text-red-700",
      HIGH:
        "bg-rose-100 text-rose-600",
      MEDIUM:
        "bg-amber-100 text-amber-600",
      LOW:
        "bg-emerald-100 text-emerald-600",
    }[
      normalizedPriority
    ] ||
    "bg-slate-100 text-slate-600";

  const statusClasses =
    {
      OPEN:
        "bg-orange-100 text-orange-600",
      PENDING:
        "bg-orange-100 text-orange-600",
      IN_PROGRESS:
        "bg-blue-100 text-blue-600",
      "IN PROGRESS":
        "bg-blue-100 text-blue-600",
      RESOLUTION_SUBMITTED:
        "bg-purple-100 text-purple-600",
      "RESOLUTION SUBMITTED":
        "bg-purple-100 text-purple-600",
      REOPENED:
        "bg-red-100 text-red-600",
      RESOLVED:
        "bg-emerald-100 text-emerald-600",
    }[
      normalizedStatus
    ] ||
    "bg-slate-100 text-slate-600";

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full px-5 py-4 text-left hover:bg-slate-50 transition"
    >

      <div className="flex items-start gap-4">

        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
          <MessageSquare
            size={17}
          />
        </div>

        <div className="flex-1 min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <span
              className={`inline-flex px-2 py-1 rounded-md text-[10px] font-semibold ${priorityClasses}`}
            >
              {priority}
            </span>

            <span
              className={`inline-flex px-2 py-1 rounded-md text-[10px] font-semibold ${statusClasses}`}
            >
              {status}
            </span>

          </div>

          <div className="mt-2 flex items-start gap-3">

            <div className="flex-1 min-w-0">

              <p className="text-sm font-semibold text-slate-800 truncate">
                {title}
              </p>

              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                {description}
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] text-slate-400">

                <span>
                  Room: {room}
                </span>

                {createdAt && (
                  <span>
                    {formatDate(
                      createdAt
                    )}
                  </span>
                )}

              </div>

            </div>

            <ChevronRight
              size={17}
              className="text-slate-400 flex-shrink-0 mt-1"
            />

          </div>

        </div>

      </div>

    </button>
  );
};

/* ============================================================
   QUICK ACTION
   ============================================================ */

const QuickAction = ({
  icon,
  label,
  onClick,
  highlighted,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full
        flex
        items-center
        gap-3
        px-2
        py-3
        rounded-lg
        text-left
        transition
        ${
          highlighted
            ? "bg-blue-50 text-blue-700"
            : "text-slate-700 hover:bg-slate-50"
        }
      `}
    >

      <span
        className={
          highlighted
            ? "text-blue-600"
            : "text-slate-500"
        }
      >
        {icon}
      </span>

      <span className="flex-1 text-xs font-medium">
        {label}
      </span>

      <ChevronRight
        size={15}
      />

    </button>
  );
};

/* ============================================================
   EMPTY STATE
   ============================================================ */

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="py-10 px-5 flex flex-col items-center text-center">

      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        {icon}
      </div>

      <h4 className="text-sm font-semibold text-slate-700 mt-3">
        {title}
      </h4>

      <p className="text-xs text-slate-400 max-w-sm mt-1">
        {description}
      </p>

      {actionLabel && (
        <button
          onClick={
            onAction
          }
          className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          {
            actionLabel
          }{" "}
          →
        </button>
      )}

    </div>
  );
};



/* ============================================================
   HELPERS
   ============================================================ */

const formatMetric = (
  value
) => {
  if (
    value ===
      null ||
    value ===
      undefined ||
    value === ""
  ) {
    return "—";
  }

  const number =
    Number(value);

  if (
    Number.isNaN(
      number
    )
  ) {
    return value;
  }

  return new Intl.NumberFormat(
    "en-IN"
  ).format(
    number
  );
};

const formatDate = (
  value
) => {
  if (
    !value ||
    value ===
      "—"
  ) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
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

export default OwnerDashboard;