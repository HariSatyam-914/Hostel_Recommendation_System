import React, {
  useEffect,
  useRef,
  useState,
} from "react";

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
  ChevronDown,
  Eye,
  ExternalLink,
  Upload,
  Maximize2,
  CheckCircle2,
  Clock3,
  Headphones,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

function StatusBadge({ status }) {
  const normalizedStatus = String(
    status || ""
  ).toUpperCase();

  const approved =
    normalizedStatus === "APPROVED" ||
    normalizedStatus === "VERIFIED";

  const rejected =
    normalizedStatus === "REJECTED";

  let displayStatus = "Pending Review";

  if (approved) {
    displayStatus = "Approved";
  } else if (rejected) {
    displayStatus = "Rejected";
  } else if (
    normalizedStatus === "PENDING"
  ) {
    displayStatus = "Pending Review";
  } else if (normalizedStatus) {
    displayStatus = normalizedStatus
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (char) => char.toUpperCase()
      );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        approved
          ? "bg-emerald-50 text-emerald-600"
          : rejected
          ? "bg-red-50 text-red-600"
          : "bg-orange-50 text-orange-500"
      }`}
    >
      {approved ? (
        <CheckCircle2
          size={14}
          strokeWidth={2.5}
        />
      ) : (
        <Clock3
          size={14}
          strokeWidth={2.5}
        />
      )}

      {displayStatus}
    </span>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  active = false,
  badge,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
        active
          ? "bg-blue-50 text-blue-600"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon
        size={18}
        strokeWidth={
          active ? 2.5 : 2
        }
        className={
          active
            ? "text-blue-600"
            : "text-slate-500"
        }
      />

      <span className="flex-1 text-left font-medium">
        {label}
      </span>

      {badge !== undefined &&
        badge !== null &&
        badge !== "" && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 px-1.5 text-[11px] font-semibold text-blue-600">
            {badge}
          </span>
        )}
    </button>
  );
}

function ReplaceButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-300 bg-white px-5 py-2.5 text-sm font-semibold text-blue-600 transition hover:border-blue-500 hover:bg-blue-50"
    >
      <Upload
        size={17}
        strokeWidth={2.2}
      />
      Replace Image
    </button>
  );
}

function PhotoPreviewButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600 shadow-md transition hover:bg-blue-50 hover:text-blue-600"
      title="View image"
    >
      <Maximize2 size={16} />
    </button>
  );
}

function Photos() {
  const navigate = useNavigate();

  const [hostelId, setHostelId] =
    useState(null);

  const [hostelName, setHostelName] =
    useState("");

  const [ownerName, setOwnerName] =
    useState("");

  const [ownerRole, setOwnerRole] =
    useState("Hostel Owner");

  const [photos, setPhotos] = useState({
    cover: null,
    additional: [],
  });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [previewImage, setPreviewImage] =
    useState(null);

  // ============================================================
  // PROFILE DROPDOWN STATE
  // ============================================================
  const [profileMenuOpen, setProfileMenuOpen] =
    useState(false);

  const profileMenuRef =
    useRef(null);

  const coverInputRef =
    useRef(null);

  const additionalInputRefs =
    useRef({});

  // ============================================================
  // LOGOUT
  // ============================================================
  const handleLogout = () => {
    // Remove authentication/token data
    localStorage.removeItem("token");
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userData");
    localStorage.removeItem("role");
    localStorage.removeItem("admin");
    localStorage.removeItem("hostelId");

    // Remove session authentication data
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("jwtToken");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("admin");

    setProfileMenuOpen(false);

    navigate("/", {
      replace: true,
    });
  };

  // ============================================================
  // CLOSE PROFILE DROPDOWN WHEN CLICKING OUTSIDE
  // ============================================================
  useEffect(() => {
    const handleClickOutside = (
      event
    ) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(
          event.target
        )
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

  // ============================================================
  // NORMALIZE BACKEND PHOTO URL
  // ============================================================
  const normalizePhotoUrl = (
    value
  ) => {
    if (
      !value ||
      typeof value !== "string"
    ) {
      return null;
    }

    const trimmed =
      value.trim();

    if (!trimmed) {
      return null;
    }

    if (
      trimmed.startsWith("blob:") ||
      trimmed.startsWith("data:")
    ) {
      return trimmed;
    }

    if (
      /^https?:\/\//i.test(
        trimmed
      )
    ) {
      return trimmed;
    }

    let baseUrl = String(
      api?.defaults?.baseURL ||
        "http://localhost:8080"
    ).replace(/\/$/, "");

    baseUrl = baseUrl.replace(
      /\/api$/i,
      ""
    );

    if (
      trimmed.startsWith("/")
    ) {
      return `${baseUrl}${trimmed}`;
    }

    return `${baseUrl}/${trimmed}`;
  };

    // ============================================================
  // HOSTEL PHOTO VERIFICATION HELPERS
  // ============================================================

  const getHostelPhotoStatus = (photo) =>
    String(
      photo?.verificationStatus ||
        photo?.status ||
        photo?.approvalStatus ||
        ""
    )
      .trim()
      .toUpperCase();

  const getHostelPhotoRejectionReason = (photo) =>
    photo?.rejectionReason ||
    photo?.rejection_reason ||
    photo?.reason ||
    photo?.verificationReason ||
    photo?.remarks ||
    photo?.adminComment ||
    "No rejection reason was provided.";

  const getHostelPhotoUrl = (photo) => {
    const rawUrl =
      photo?.fileUrl ||
      photo?.photoUrl ||
      photo?.filePath ||
      photo?.url ||
      null;

    return normalizePhotoUrl(rawUrl);
  };

  // ============================================================
  // LOAD PROTECTED IMAGE
  // ============================================================
  const loadPersistedPhoto =
    async (photoUrl) => {
      if (!photoUrl) {
        return null;
      }

      if (
        photoUrl.startsWith("blob:") ||
        photoUrl.startsWith("data:")
      ) {
        return photoUrl;
      }

      try {
        const response =
          await api.get(
            photoUrl,
            {
              responseType:
                "blob",
              validateStatus:
                (status) =>
                  status >= 200 &&
                  status < 300,
            }
          );

        const contentType =
          String(
            response?.headers?.[
              "content-type"
            ] ||
              response?.data?.type ||
              ""
          ).toLowerCase();

        if (!response?.data) {
          return null;
        }

        if (
          contentType &&
          !contentType.startsWith(
            "image/"
          )
        ) {
          console.warn(
            "Photo endpoint did not return an image:",
            photoUrl,
            contentType
          );

          return null;
        }

        return URL.createObjectURL(
          response.data
        );
      } catch (error) {
        console.warn(
          "Unable to load persisted photo:",
          photoUrl,
          error
        );

        return null;
      }
    };

  // ============================================================
  // LOAD OWNER + HOSTEL + PHOTOS
  // ============================================================
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        // ======================================================
        // 1. CURRENT USER
        // ======================================================
        let storedUser = null;

        try {
          const rawUser =
            localStorage.getItem(
              "user"
            );

          if (rawUser) {
            storedUser =
              JSON.parse(
                rawUser
              );
          }
        } catch (userError) {
          console.warn(
            "Unable to read logged-in user:",
            userError
          );
        }

        if (
          storedUser?.name &&
          !cancelled
        ) {
          setOwnerName(
            storedUser.name
          );
        }

        if (
          storedUser?.role &&
          !cancelled
        ) {
          setOwnerRole(
            storedUser.role ===
              "OWNER"
              ? "Hostel Owner"
              : storedUser.role
          );
        }

        // ======================================================
        // 2. GET OWNER HOSTEL STATUS
        // ======================================================
        const statusResponse =
          await api.get(
            "/api/owner/hostels/status"
          );

        const statusData =
          statusResponse?.data ||
          {};

        const backendHostelId =
          statusData?.hostelId ||
          localStorage.getItem(
            "hostelId"
          );

        if (!backendHostelId) {
          throw new Error(
            "No hostel is associated with the logged-in owner."
          );
        }

        if (cancelled) {
          return;
        }

        setHostelId(
          String(
            backendHostelId
          )
        );

        localStorage.setItem(
          "hostelId",
          String(
            backendHostelId
          )
        );

        // ======================================================
        // 3. GET BASIC HOSTEL INFORMATION
        // ======================================================
        try {
          const basicInfoResponse =
            await api.get(
              `/api/owner/hostels/${backendHostelId}/basic-info`
            );

          const basicInfo =
            basicInfoResponse?.data ||
            {};

          if (!cancelled) {
            setHostelName(
              basicInfo?.hostelName ||
                ""
            );

            if (
              basicInfo?.ownerName
            ) {
              setOwnerName(
                basicInfo.ownerName
              );
            }
          }
        } catch (
          basicInfoError
        ) {
          console.warn(
            "Unable to load hostel basic information:",
            basicInfoError
          );
        }

        // ======================================================
        // 4. GET ACTUAL HOSTEL PHOTOS
        // ======================================================
        const photosResponse =
          await api.get(
            `/api/owner/hostels/${backendHostelId}/photos`
          );

        const backendPhotos =
          Array.isArray(
            photosResponse?.data
          )
            ? photosResponse.data
            : [];

        if (cancelled) {
          return;
        }

        const sortedPhotos =
          [...backendPhotos].sort(
            (a, b) =>
              Number(
                a?.displayOrder ??
                  0
              ) -
              Number(
                b?.displayOrder ??
                  0
              )
          );

        // ======================================================
        // COVER
        // ======================================================
        const coverPhoto =
          sortedPhotos.find(
            (photo) =>
              String(
                photo?.photoType ||
                  ""
              ).toUpperCase() ===
              "COVER"
          );

        // ======================================================
        // ADDITIONAL
        // ======================================================
        const additionalPhotos =
          sortedPhotos
            .filter(
              (photo) =>
                String(
                  photo?.photoType ||
                    ""
                ).toUpperCase() ===
                "ADDITIONAL"
            )
            .slice(0, 4);

        // ======================================================
        // LOAD COVER
        // ======================================================
        let loadedCover =
          null;

        if (coverPhoto) {
          const rawUrl =
            coverPhoto?.fileUrl ||
            coverPhoto?.photoUrl ||
            coverPhoto?.filePath ||
            coverPhoto?.url ||
            null;

          const normalizedUrl =
            normalizePhotoUrl(
              rawUrl
            );

          const imageUrl =
            await loadPersistedPhoto(
              normalizedUrl
            );

          if (imageUrl) {
            loadedCover = {
              id:
                coverPhoto.id,

              title:
                "Main Hostel Photo",

              /*
               * Reads the actual backend
               * verificationStatus.
               */
              status:
                coverPhoto?.verificationStatus ||
                coverPhoto?.status ||
                "PENDING",

              image:
                imageUrl,

              originalUrl:
                normalizedUrl,

              fileName:
                coverPhoto?.fileName ||
                "",
            };
          }
        }

        // ======================================================
        // LOAD ADDITIONAL
        // ======================================================
        const loadedAdditional =
          await Promise.all(
            additionalPhotos.map(
              async (
                photo,
                index
              ) => {
                const rawUrl =
                  photo?.fileUrl ||
                  photo?.photoUrl ||
                  photo?.filePath ||
                  photo?.url ||
                  null;

                const normalizedUrl =
                  normalizePhotoUrl(
                    rawUrl
                  );

                const imageUrl =
                  await loadPersistedPhoto(
                    normalizedUrl
                  );

                return {
                  id:
                    photo?.id ||
                    `additional-${index}`,

                  title:
                    `Image ${index + 1}`,

                  /*
                   * Reads the actual backend
                   * verificationStatus.
                   */
                  status:
                    photo?.verificationStatus ||
                    photo?.status ||
                    "PENDING",

                  image:
                    imageUrl,

                  originalUrl:
                    normalizedUrl,

                  fileName:
                    photo?.fileName ||
                    "",

                  displayOrder:
                    photo?.displayOrder ??
                    index + 1,
                };
              }
            )
          );

        if (!cancelled) {
          setPhotos({
            cover:
              loadedCover,

            additional:
              loadedAdditional,
          });
        }
      } catch (
        loadError
      ) {
        console.error(
          "Failed to load Photos page data:",
          loadError
        );

        if (!cancelled) {
          setError(
            loadError?.response
              ?.data?.message ||
              loadError?.message ||
              "Unable to load hostel photos."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // COVER UPLOAD
  // ============================================================
  const handleCoverUpload =
    async (
      event
    ) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        alert(
          "Please select an image file."
        );
        event.target.value = "";
        return;
      }

      if (
        file.size >
        10 * 1024 * 1024
      ) {
        alert(
          "Image size must be less than 10MB."
        );
        event.target.value = "";
        return;
      }

      if (!hostelId) {
        alert(
          "Hostel information is not available."
        );
        event.target.value = "";
        return;
      }

      try {
        const previewUrl =
          URL.createObjectURL(
            file
          );

        const formData =
          new FormData();

        formData.append(
          "coverImage",
          file
        );

        const response =
          await api.post(
            `/api/owner/hostels/${hostelId}/photos`,
            formData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        const responsePhotos =
          Array.isArray(
            response?.data
          )
            ? response.data
            : [];

        const responseCover =
          responsePhotos.find(
            (photo) =>
              String(
                photo?.photoType ||
                  ""
              ).toUpperCase() ===
              "COVER"
          );

        const savedPhotoUrl =
          normalizePhotoUrl(
            responseCover?.fileUrl ||
              responseCover?.photoUrl ||
              null
          );

        let finalImage =
          previewUrl;

        if (savedPhotoUrl) {
          const backendImage =
            await loadPersistedPhoto(
              savedPhotoUrl
            );

          if (backendImage) {
            URL.revokeObjectURL(
              previewUrl
            );

            finalImage =
              backendImage;
          }
        }

        setPhotos(
          (prev) => ({
            ...prev,

            cover: {
              id:
                responseCover?.id ||
                prev.cover?.id ||
                "cover",

              title:
                "Main Hostel Photo",

              /*
               * Newly replaced image must be pending
               * until admin reviews it.
               */
              status:
                responseCover?.verificationStatus ||
                responseCover?.status ||
                "APPROVED",

              image:
                finalImage,

              originalUrl:
                savedPhotoUrl ||
                null,

              fileName:
                responseCover?.fileName ||
                file.name,
            },
          })
        );
        // ADD THIS ALERT HERE
        alert(
          "Hostel cover image replaced successfully. The new image has been automatically approved and is now visible on the public hostel listing."
        );
      } catch (
        uploadError
      ) {
        console.error(
          "Failed to replace cover photo:",
          uploadError
        );

        alert(
          uploadError?.response
            ?.data?.message ||
            "Failed to replace the cover image."
        );
      } finally {
        event.target.value = "";
      }
    };

  // ============================================================
  // ADDITIONAL PHOTO UPLOAD
  // ============================================================
  const handleAdditionalUpload =
    async (
      id,
      event
    ) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        alert(
          "Please select an image file."
        );
        event.target.value = "";
        return;
      }

      if (
        file.size >
        10 * 1024 * 1024
      ) {
        alert(
          "Image size must be less than 10MB."
        );
        event.target.value = "";
        return;
      }

      if (!hostelId) {
        alert(
          "Hostel information is not available."
        );
        event.target.value = "";
        return;
      }

      /*
       * Current backend supports adding/deleting additional
       * photos but does not yet expose a dedicated replacement
       * endpoint for an existing additional photo.
       */

      const previewUrl =
        URL.createObjectURL(
          file
        );

      setPhotos(
        (prev) => ({
          ...prev,

          additional:
            prev.additional.map(
              (photo) =>
                String(
                  photo.id
                ) ===
                String(id)
                  ? {
                      ...photo,
                      image:
                        previewUrl,
                      status:
                        "PENDING",
                    }
                  : photo
            ),
        })
      );

      event.target.value = "";

      alert(
        "The image was selected locally. A backend endpoint is required to permanently replace an additional photo."
      );
    };

  // ============================================================
  // NAVIGATION
  // ============================================================
  const handleNavigation =
    (path) => {
      navigate(path);
    };

  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fbff] text-slate-900">
        <div className="flex min-h-screen items-center justify-center">
          <div className="rounded-xl border border-slate-200 bg-white px-8 py-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-700">
              Loading hostel photos...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================
  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fbff] text-slate-900">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="max-w-md rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Unable to load hostel photos
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-900">
      {/* =========================================================
          SIDEBAR
      ========================================================= */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-[235px] flex-col border-r border-slate-200 bg-white">
        {/* Logo */}
        <div className="flex h-[58px] items-center border-b border-slate-200 px-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Building2 size={21} />
            </div>

            <div>
              <div className="text-[17px] font-bold leading-5 text-blue-600">
                FindMyHostel
              </div>

              <div className="mt-0.5 text-[9px] font-bold tracking-wider text-slate-400">
                OWNER PORTAL
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 py-6">
          {/* MAIN */}
          <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Main
          </div>

          <div className="space-y-1">
            <SidebarItem
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={() =>
                handleNavigation(
                  "/owner/dashboard"
                )
              }
            />
          </div>

          {/* MY HOSTEL */}
          <div className="mb-2 mt-6 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            My Hostel
          </div>

          <div className="space-y-1">
            <SidebarItem
              icon={Building2}
              label="Hostel Profile"
              onClick={() =>
                handleNavigation(
                  "/owner/hostel"
                )
              }
            />

            <SidebarItem
              icon={BedDouble}
              label="Rooms"
              onClick={() => {
                if (
                  hostelId
                ) {
                  handleNavigation(
                    `/owner/hostel/rooms/${hostelId}`
                  );
                } else {
                  handleNavigation(
                    "/owner/hostel/rooms"
                  );
                }
              }}
            />

            <SidebarItem
              icon={Images}
              label="Amenities"
              onClick={() =>
                handleNavigation(
                  "/owner/amenities"
                )
              }
            />

            <SidebarItem
              icon={Images}
              label="Photos"
              active
              onClick={() =>
                handleNavigation(
                  "/owner/photos"
                )
              }
            />
          </div>

          {/* DISCOVERY */}
          <div className="mb-2 mt-6 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Discovery
          </div>

          <div className="space-y-1">
            <SidebarItem
              icon={MessageSquare}
              label="Issues"
              onClick={() =>
                handleNavigation(
                  "/owner/issues"
                )
              }
            />

            <SidebarItem
              icon={Star}
              label="Reviews"
              onClick={() =>
                handleNavigation(
                  "/owner/reviews"
                )
              }
            />
          </div>

          {/* INSIGHTS */}
          <div className="mb-2 mt-6 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Insights
          </div>

          <SidebarItem
            icon={BarChart3}
            label="Analytics"
            onClick={() =>
              handleNavigation(
                "/owner/analytics"
              )
            }
          />

          {/* ACCOUNT */}
          <div className="mb-2 mt-6 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Account
          </div>

          <div className="space-y-1">
            <SidebarItem
              icon={Settings}
              label="Settings"
              onClick={() =>
                handleNavigation(
                  "/owner/settings"
                )
              }
            />

            <SidebarItem
              icon={Headphones}
              label="Support"
              onClick={() =>
                handleNavigation(
                  "/owner/support"
                )
              }
            />
          </div>
        </div>

        {/* Sidebar bottom */}
        <div className="border-t border-slate-200 px-2.5 py-3">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Eye size={15} />
            View Public Listing
            <ExternalLink size={13} />
          </button>
        </div>
      </aside>

      {/* =========================================================
          MAIN AREA
      ========================================================= */}
      <div className="ml-[235px] h-screen flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="flex h-[58px] flex-shrink-0 items-center justify-end border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-4">
            {/* Notification */}
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100"
            >
              <Bell size={19} />
            </button>

            <div className="h-7 w-px bg-slate-200" />

            {/* Profile */}
            <div
              ref={
                profileMenuRef
              }
              className="relative"
            >
              <button
                type="button"
                onClick={() =>
                  setProfileMenuOpen(
                    (prev) =>
                      !prev
                  )
                }
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {(
                    ownerName ||
                    "O"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="text-left">
                  <div className="max-w-[160px] truncate text-xs font-bold text-slate-800">
                    {ownerName ||
                      "Owner"}
                  </div>

                  <div className="text-[10px] text-slate-400">
                    {ownerRole}
                  </div>
                </div>

                <ChevronDown
                  size={16}
                  className={`ml-1 text-slate-500 transition-transform ${
                    profileMenuOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {/* =================================================
                  PROFILE DROPDOWN
              ================================================= */}
              {profileMenuOpen && (
                <div className="absolute right-0 top-[48px] z-[80] w-[210px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.12)]">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {ownerName ||
                        "Owner"}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {ownerRole}
                    </p>
                  </div>

                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={
                        handleLogout
                      }
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut
                        size={17}
                        strokeWidth={
                          2.2
                        }
                      />

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

        {/* =====================================================
            SCROLLABLE CONTENT AREA
        ===================================================== */}
        <div className="flex-1 overflow-y-auto">
          <main className="w-full px-6 py-6">
            {/* Breadcrumb */}
            <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
              <span>
                My Hostel
              </span>

              <span className="text-slate-300">
                ›
              </span>

              <span className="font-medium text-slate-700">
                Photos
              </span>
            </div>

            {/* Page heading */}
            <div className="mb-5">
              <h1 className="text-[27px] font-bold tracking-tight text-slate-900">
                Photos
              </h1>

              <p className="mt-0.5 text-sm text-slate-500">
                {hostelName
                  ? `Manage photos for ${hostelName}. Replace images whenever needed.`
                  : "Manage your hostel photos. Replace images whenever needed."}
              </p>
            </div>

            {/* ===================================================
                COVER PHOTO
            =================================================== */}
            <section className="mb-4 w-full rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-800">
                Hostel Cover / Main Photo
              </h2>

              <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(250px,1fr)] gap-6">
                {/* Image */}
                <div
                  className="relative min-h-[265px] cursor-zoom-in overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                  onClick={() => {
                    if (
                      photos.cover?.image
                    ) {
                      setPreviewImage(
                        photos
                          .cover
                          .image
                      );
                    }
                  }}
                >
                  {photos.cover?.image ? (
                    <>
                      <img
                        src={
                          photos.cover
                            .image
                        }
                        alt={
                          hostelName ||
                          "Main hostel"
                        }
                        className="h-[265px] w-full object-cover transition-transform duration-200 hover:scale-[1.01]"
                      />

                      {/* Existing corner expand button remains */}
                      <PhotoPreviewButton
                        onClick={() =>
                          setPreviewImage(
                            photos
                              .cover
                              .image
                          )
                        }
                      />
                    </>
                  ) : (
                    <div className="flex h-[265px] cursor-default items-center justify-center px-6 text-center">
                      <div>
                        <Images
                          size={38}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-sm font-semibold text-slate-500">
                          No cover photo uploaded
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Upload your main hostel photo.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Information */}
                              {/* Information */}
                <div className="flex flex-col justify-center">
                  <h3 className="text-base font-bold text-slate-900">
                    Main Hostel Photo
                  </h3>

                  {photos.cover ? (
                    <div className="mt-3">
                      <StatusBadge
                        status={
                          photos.cover.status
                        }
                      />
                    </div>
                  ) : null}

                  {photos.cover &&
                    getHostelPhotoStatus(
                      photos.cover
                    ) === "REJECTED" && (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-semibold text-red-700">
                          Hostel cover image rejected
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          {getHostelPhotoRejectionReason(
                            photos.cover
                          )}
                        </p>

                        <div className="mt-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                          Replacement required
                        </div>
                      </div>
                    )}

                  <p className="mt-4 max-w-[320px] text-sm leading-6 text-slate-500">
                    This is the primary photo shown for your hostel.
                  </p>

                  <div className="mt-5">
                    <ReplaceButton
                      onClick={() =>
                        coverInputRef.current?.click()
                      }
                    />

                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleCoverUpload}
                    />
                  </div>
                </div>

              </div>
            </section>

            {/* ===================================================
                ADDITIONAL PHOTOS
            =================================================== */}
            <section className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
              {/* Header */}
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">
                    Additional Hostel Images
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Add up to 4 additional photos of your hostel.
                  </p>
                </div>

                <div className="rounded-full bg-blue-50 px-4 py-1.5 text-sm font-bold text-blue-600">
                  {
                    photos
                      .additional
                      .length
                  }{" "}
                  / 4
                </div>
              </div>

              {/* 2 x 2 Grid */}
              <div className="grid grid-cols-2 gap-4">
                {Array.from(
                  {
                    length: 4,
                  },
                  (
                    _,
                    index
                  ) => {
                    const photo =
                      photos
                        .additional[
                        index
                      ];

                    return (
                      <div
                        key={
                          photo?.id ||
                          `slot-${index}`
                        }
                        className="rounded-xl border border-slate-200 bg-white p-3.5"
                      >
                        {/* Image */}
                        <div
                          className="relative cursor-zoom-in overflow-hidden rounded-lg border border-slate-100 bg-slate-100"
                          onClick={() => {
                            if (
                              photo?.image
                            ) {
                              setPreviewImage(
                                photo.image
                              );
                            }
                          }}
                        >
                          {photo?.image ? (
                            <>
                              <img
                                src={
                                  photo.image
                                }
                                alt={`Additional hostel image ${
                                  index +
                                  1
                                }`}
                                className="h-[175px] w-full object-cover transition-transform duration-200 hover:scale-[1.01]"
                              />

                              {/* Existing corner expand button remains */}
                              <PhotoPreviewButton
                                onClick={() =>
                                  setPreviewImage(
                                    photo.image
                                  )
                                }
                              />
                            </>
                          ) : (
                            <div className="flex h-[175px] cursor-default items-center justify-center">
                              <div className="text-center">
                                <Images
                                  size={
                                    32
                                  }
                                  className="mx-auto text-slate-300"
                                />

                                <p className="mt-2 text-sm font-semibold text-slate-500">
                                  No image uploaded
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Bottom information */}
                                              {/* Bottom information */}
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-slate-800">
                            {photo?.title ||
                              `Image ${
                                index +
                                1
                              }`}
                          </span>

                          {photo ? (
                            <StatusBadge
                              status={
                                photo.status
                              }
                            />
                          ) : null}
                        </div>

                        {/* Rejected Photo Information */}
                        {photo &&
                          getHostelPhotoStatus(
                            photo
                          ) === "REJECTED" && (
                            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
                              <p className="text-sm font-semibold text-red-700">
                                Hostel image rejected
                              </p>

                              <p className="mt-1 text-xs leading-5 text-slate-600">
                                {getHostelPhotoRejectionReason(
                                  photo
                                )}
                              </p>

                              <div className="mt-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                                Replacement required
                              </div>
                            </div>
                          )}

                        {/* Replace */}
                        <div className="mt-3">
                          <ReplaceButton
                            onClick={() =>
                              additionalInputRefs.current[
                                photo?.id ||
                                  `slot-${index}`
                              ]?.click()
                            }
                          />

                          <input
                            ref={(
                              element
                            ) => {
                              additionalInputRefs.current[
                                photo?.id ||
                                  `slot-${index}`
                              ] =
                                element;
                            }}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(
                              event
                            ) =>
                              handleAdditionalUpload(
                                photo?.id ||
                                  `slot-${index}`,
                                event
                              )
                            }
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* =========================================================
          FULLSCREEN IMAGE PREVIEW
      ========================================================= */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-8"
          onClick={() =>
            setPreviewImage(
              null
            )
          }
        >
          <button
            type="button"
            onClick={() =>
              setPreviewImage(
                null
              )
            }
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg hover:bg-slate-100"
          >
            ×
          </button>

          <img
            src={
              previewImage
            }
            alt="Fullscreen preview"
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          />
        </div>
      )}
    </div>
  );
}

export default Photos;