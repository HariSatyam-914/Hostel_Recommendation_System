import React, {
  useEffect,
  useMemo,
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
  UserCircle,
  ChevronDown,
  ChevronRight,
  Eye,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  Pencil,
  Maximize2,
  Upload,
  Wifi,
  Droplets,
  Zap,
  WashingMachine,
  Car,
  Cctv,
  Dumbbell,
  CircleHelp,
  Info,
  Clock3,
  Loader2,
  Utensils,
  ShieldCheck,
  Tv,
  Wind,
  Bath,
  Flame,
  Shirt,
  ParkingSquare,
  BookOpen,
  Coffee,
  Network,
  Bed,
  Fan,
  Video,
  Building,
  Sparkles,
  Droplet,
  Refrigerator,
} from "lucide-react";

import api from "../api/axiosConfig";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080";

const MAX_PHOTO_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

/* =========================================================
   COMPLETE AMENITY CATALOG
========================================================= */
const amenityCategories = [
  {
    title: "Internet",
    icon: Wifi,
    items: [
      {
        id: "wifi",
        label: "High-Speed WiFi",
        Icon: Wifi,
        photoRequired: false,
      },
      {
        id: "lan",
        label: "LAN",
        Icon: Network,
        photoRequired: false,
      },
    ],
  },
  {
    title: "Room",
    icon: Bed,
    items: [
      {
        id: "ac",
        label: "AC",
        Icon: Wind,
        photoRequired: true,
      },
      {
        id: "fan",
        label: "Fan",
        Icon: Fan,
        photoRequired: true,
      },
      {
        id: "bathroom",
        label: "Attached Bathroom",
        Icon: Bath,
        photoRequired: true,
      },
      {
        id: "geyser",
        label: "Geyser",
        Icon: Flame,
        photoRequired: true,
      },
      {
        id: "table",
        label: "Study Table",
        Icon: BookOpen,
        photoRequired: true,
      },
      {
        id: "wardrobe",
        label: "Wardrobe",
        Icon: Shirt,
        photoRequired: true,
      },
      {
        id: "balcony",
        label: "Balcony",
        Icon: Building2,
        photoRequired: true,
      },
    ],
  },
  {
    title: "Building",
    icon: Building,
    items: [
      {
        id: "lift",
        label: "Lift",
        Icon: Building2,
        photoRequired: false,
      },
      {
        id: "cctv",
        label: "CCTV",
        Icon: Video,
        photoRequired: true,
      },
      {
        id: "guard",
        label: "Security Guard",
        Icon: ShieldCheck,
        photoRequired: false,
      },
      {
        id: "firesafety",
        label: "Fire Safety",
        Icon: ShieldCheck,
        photoRequired: true,
      },
      {
        id: "powerbackup",
        label: "Power Backup",
        Icon: Zap,
        photoRequired: true,
      },
      {
        id: "parking",
        label: "Parking",
        Icon: ParkingSquare,
        photoRequired: true,
      },
    ],
  },
  {
    title: "Services",
    icon: Sparkles,
    items: [
      {
        id: "housekeeping",
        label: "Housekeeping",
        Icon: Sparkles,
        photoRequired: false,
      },
      {
        id: "laundry",
        label: "Laundry",
        Icon: WashingMachine,
        photoRequired: false,
      },
      {
        id: "washing_machine",
        label: "Washing Machine",
        Icon: WashingMachine,
        photoRequired: true,
      },
      {
        id: "ro_water",
        label: "RO Water",
        Icon: Droplets,
        photoRequired: false,
      },
      {
        id: "refrigerator",
        label: "Refrigerator",
        Icon: Refrigerator,
        photoRequired: true,
      },
      {
        id: "tv",
        label: "TV",
        Icon: Tv,
        photoRequired: true,
      },
    ],
  },
];

const allAmenityDefinitions =
  amenityCategories.flatMap((category) =>
    category.items.map((item) => ({
      ...item,
      categoryTitle: category.title,
    }))
  );

const normalizeAmenityKey = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const getCatalogKeys = (item) => {
  const keys = [
    item?.id,
    item?.label,
    item?.amenityCode,
    item?.amenityName,
    item?.name,
    item?.code,
  ]
    .map(normalizeAmenityKey)
    .filter(Boolean);

  const label = normalizeAmenityKey(item?.label);

  const aliases = {
    wifi: ["highspeedwifi", "wifi", "internet"],
    lan: ["lan", "localareanetwork"],
    bathroom: ["attachedbathroom", "bathroom", "attachedwashroom"],
    guard: ["securityguard", "guard", "security"],
    firesafety: ["firesafety", "firesecurity", "fireprotection"],
    powerbackup: ["powerbackup", "powerbackupups", "backup"],
    parking: ["parking", "carparking", "bikeparking"],
    ro_water: ["rowater", "waterpurifier", "ro"],
    washing_machine: ["washingmachine", "washing"],
    cctv: ["cctv", "videocctv", "surveillance"],
    ac: ["ac", "airconditioner", "airconditioning"],
    fan: ["fan", "ceilingfan"],
    table: ["studytable", "table"],
    wardrobe: ["wardrobe", "cupboard"],
    geyser: ["geyser", "waterheater"],
  };

  return new Set([
    ...keys,
    ...(aliases[item?.id] || []),
    label,
  ].map(normalizeAmenityKey).filter(Boolean));
};

const findCatalogDefinition = (amenity) => {
  const amenityKeys = getCatalogKeys(amenity);

  return (
    allAmenityDefinitions.find((definition) => {
      const definitionKeys = getCatalogKeys(definition);

      return [...definitionKeys].some((key) =>
        amenityKeys.has(key)
      );
    }) || null
  );
};

const Amenity = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [profileMenuOpen, setProfileMenuOpen] =
    useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState("All Categories");

  const [activeSection, setActiveSection] =
    useState("my");

  const [previewImage, setPreviewImage] =
    useState(null);

  const [editingAmenity, setEditingAmenity] =
    useState(null);

  const [selectedToAdd, setSelectedToAdd] =
    useState({});

  const [newAmenityPhotos, setNewAmenityPhotos] =
    useState({});

  const [amenities, setAmenities] =
    useState([]);

  const [availableAmenities, setAvailableAmenities] =
    useState([]);

  const [pendingAmenities, setPendingAmenities] =
    useState([]);

  const [dashboardData, setDashboardData] =
    useState(null);

  const [hostelId, setHostelId] =
    useState(
      () =>
        localStorage.getItem("hostelId") ||
        null
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [replaceFile, setReplaceFile] =
    useState(null);

  /*
   * =========================================================
   * NEW:
   * Keep successfully uploaded local previews alive.
   *
   * This prevents loadAmenities() from immediately replacing
   * the newly uploaded image with an old rejected record.
   * =========================================================
   */
  const replacementPreviewUrlsRef =
    useRef({});

  const profileMenuRef =
    useRef(null);

  const replacePhotoInputRef =
    useRef(null);

  const newAmenityPhotoInputRefs =
    useRef({});

  /* =========================================================
     CLOSE PROFILE DROPDOWN
  ========================================================= */

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

  /* =========================================================
     AUTO CLEAR SUCCESS MESSAGE
  ========================================================= */

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  /*
   * =========================================================
   * CLEANUP REPLACEMENT PREVIEW URLS
   * =========================================================
   */
  useEffect(() => {
    return () => {
      Object.values(
        replacementPreviewUrlsRef.current
      ).forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  /* =========================================================
     IMAGE URL HELPERS
  ========================================================= */

  const getImageUrl = (
    photo
  ) => {
    if (!photo) {
      return null;
    }

    const directValue =
      typeof photo === "string"
        ? photo
        : photo?.fileUrl ??
          photo?.photoUrl ??
          photo?.photo_url ??
          photo?.url ??
          photo?.filePath ??
          photo?.file_path ??
          null;

    if (!directValue) {
      return null;
    }

    const value =
      String(directValue).trim();

    if (!value) {
      return null;
    }

    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("data:") ||
      value.startsWith("blob:")
    ) {
      return value;
    }

    return `${API_BASE_URL}/${value.replace(
      /^\/+/,
      ""
    )}`;
  };

  const getAmenityPhotoUrl = (
    photo
  ) => {
    if (!photo) {
      return null;
    }

    const photoId =
      photo?.id ??
      photo?.photoId ??
      photo?.photo_id ??
      null;

    if (
      photoId !== null &&
      photoId !== undefined &&
      photoId !== ""
    ) {
      return (
        `${API_BASE_URL}` +
        `/api/owner/hostels/amenities/photos/` +
        `${photoId}`
      );
    }

    return getImageUrl(photo);
  };

  /*
   * =========================================================
   * UPDATED:
   * Load authenticated image.
   *
   * Important:
   * - If authenticated endpoint fails, use the actual URL
   *   supplied by backend.
   * - Do not destroy an already available preview.
   * =========================================================
   */
  const loadAuthenticatedAmenityImage = async (
    photo
  ) => {
    if (!photo) {
      return null;
    }

    const photoId =
      photo?.id ??
      photo?.photoId ??
      photo?.photo_id ??
      null;

    try {
      if (
        photoId !== null &&
        photoId !== undefined &&
        photoId !== ""
      ) {
        const response = await api.get(
          `/api/owner/hostels/amenities/photos/${photoId}`,
          {
            responseType: "blob",
            validateStatus: (status) =>
              status >= 200 && status < 300,
          }
        );

        const contentType = String(
          response?.headers?.["content-type"] ||
            response?.data?.type ||
            ""
        ).toLowerCase();

        if (
          response?.data &&
          contentType.startsWith("image/")
        ) {
          return URL.createObjectURL(
            response.data
          );
        }
      }

      const directUrl = getImageUrl(photo);

      if (directUrl) {
        return directUrl;
      }
    } catch (
      imageError
    ) {
      console.error(
        "Failed to load authenticated amenity image:",
        photoId,
        imageError
      );

      /*
       * Even if the authenticated endpoint returns 404,
       * the backend may have supplied a usable direct URL.
       */
      const directUrl =
        getImageUrl(photo);

      if (directUrl) {
        return directUrl;
      }
    }

    return null;
  };

  const getPhotoStatus = (
    photo
  ) => {
    const status =
      photo?.verificationStatus ??
      photo?.verification_status ??
      photo?.status ??
      "PENDING";

    return String(status)
      .trim()
      .toUpperCase();
  };

  /* =========================================================
     ICON HELPERS
  ========================================================= */

  const getAmenityIcon = (
    amenity
  ) => {
    const catalogDefinition =
      findCatalogDefinition(amenity);

    if (catalogDefinition?.Icon) {
      return catalogDefinition.Icon;
    }

    const code = String(
      amenity?.amenityCode ??
        amenity?.code ??
        amenity?.amenity_name ??
        amenity?.amenityName ??
        ""
    )
      .toLowerCase()
      .replace(/[_-]/g, " ");

    const name = String(
      amenity?.amenityName ??
        amenity?.name ??
        amenity?.label ??
        ""
    ).toLowerCase();

    const value =
      `${code} ${name}`;

    if (
      value.includes("wifi") ||
      value.includes("internet")
    ) {
      return Wifi;
    }

    if (value.includes("lan")) {
      return Network;
    }

    if (
      value.includes("water") ||
      value.includes("drinking")
    ) {
      return Droplets;
    }

    if (
      value.includes("power") ||
      value.includes("backup") ||
      value.includes("electric")
    ) {
      return Zap;
    }

    if (
      value.includes("washing machine") ||
      value.includes("washing") ||
      value.includes("laundry")
    ) {
      return WashingMachine;
    }

    if (
      value.includes("parking") ||
      value.includes("vehicle") ||
      value.includes("bike")
    ) {
      return ParkingSquare;
    }

    if (
      value.includes("cctv") ||
      value.includes("surveillance")
    ) {
      return Video;
    }

    if (
      value.includes("security") ||
      value.includes("guard")
    ) {
      return ShieldCheck;
    }

    if (
      value.includes("gym") ||
      value.includes("fitness")
    ) {
      return Dumbbell;
    }

    if (
      value.includes("kitchen") ||
      value.includes("food")
    ) {
      return Utensils;
    }

    if (
      value.includes("refrigerator") ||
      value.includes("fridge")
    ) {
      return Refrigerator;
    }

    if (
      value.includes("tv") ||
      value.includes("television")
    ) {
      return Tv;
    }

    if (
      value.includes("fan")
    ) {
      return Fan;
    }

    if (
      value.includes("ac") ||
      value.includes("air conditioner")
    ) {
      return Wind;
    }

    if (
      value.includes("bath") ||
      value.includes("washroom") ||
      value.includes("toilet")
    ) {
      return Bath;
    }

    if (
      value.includes("geyser") ||
      value.includes("fire") ||
      value.includes("gas")
    ) {
      return Flame;
    }

    if (
      value.includes("wardrobe") ||
      value.includes("cupboard") ||
      value.includes("cloth") ||
      value.includes("iron")
    ) {
      return Shirt;
    }

    if (
      value.includes("study table") ||
      value.includes("table") ||
      value.includes("study")
    ) {
      return BookOpen;
    }

    if (
      value.includes("balcony") ||
      value.includes("building") ||
      value.includes("lift")
    ) {
      return Building2;
    }

    if (
      value.includes("housekeeping")
    ) {
      return Sparkles;
    }

    if (
      value.includes("coffee")
    ) {
      return Coffee;
    }

    return CircleHelp;
  };

  const getAmenityIconClass = (
    amenity
  ) => {
    const value = String(
      `${amenity?.amenityCode ?? ""} ${
        amenity?.amenityName ??
        amenity?.name ??
        ""
      }`
    ).toLowerCase();

    if (
      value.includes("wifi") ||
      value.includes("internet")
    ) {
      return "bg-emerald-50 text-emerald-600";
    }

    if (value.includes("water")) {
      return "bg-blue-50 text-blue-600";
    }

    if (
      value.includes("power") ||
      value.includes("backup")
    ) {
      return "bg-amber-50 text-amber-600";
    }

    if (value.includes("laundry")) {
      return "bg-violet-50 text-violet-600";
    }

    if (
      value.includes("security") ||
      value.includes("cctv")
    ) {
      return "bg-red-50 text-red-600";
    }

    return "bg-slate-100 text-slate-600";
  };

  const getAmenityCategory = (
    amenity
  ) => {
    const value = String(
      `${amenity?.amenityCode ?? ""} ${
        amenity?.amenityName ??
        amenity?.name ??
        ""
      }`
    ).toLowerCase();

    if (
      value.includes("wifi") ||
      value.includes("internet") ||
      value.includes("network")
    ) {
      return "Connectivity";
    }

    if (
      value.includes("water") ||
      value.includes("power") ||
      value.includes("electric")
    ) {
      return "Utilities";
    }

    if (
      value.includes("laundry") ||
      value.includes("clean") ||
      value.includes("food") ||
      value.includes("meal")
    ) {
      return "Services";
    }

    if (
      value.includes("cctv") ||
      value.includes("security") ||
      value.includes("guard")
    ) {
      return "Security";
    }

    if (
      value.includes("gym") ||
      value.includes("fitness") ||
      value.includes("game") ||
      value.includes("study")
    ) {
      return "Recreation";
    }

    if (
      value.includes("parking") ||
      value.includes("lift") ||
      value.includes("kitchen")
    ) {
      return "Facilities";
    }

    return (
      amenity?.category ||
      "Other"
    );
  };

  /* =========================================================
     NORMALIZE AMENITY
  ========================================================= */

  const normalizeAmenity = (
    amenity,
    fallbackStatus = "APPROVED"
  ) => {
    const status = String(
      amenity?.approvalStatus ??
        amenity?.approval_status ??
        amenity?.requestStatus ??
        amenity?.request_status ??
        amenity?.status ??
        fallbackStatus
    )
      .trim()
      .toUpperCase();

    const amenityId =
      amenity?.hostelAmenityId ??
      amenity?.hostel_amenity_id ??
      amenity?.amenityId ??
      amenity?.id ??
      null;

    const code =
      amenity?.amenityCode ??
      amenity?.code ??
      amenity?.amenity_code ??
      null;

    return {
      ...amenity,
      id: amenityId,
      hostelAmenityId:
        amenity?.hostelAmenityId ??
        amenity?.hostel_amenity_id ??
        amenityId,
      amenityCode: code,
      name:
        amenity?.amenityName ??
        amenity?.name ??
        amenity?.label ??
        "Amenity",
      category:
        amenity?.category ??
        getAmenityCategory(amenity),
      approvalStatus: status,
      photo:
        amenity?.photo ??
        amenity?.image ??
        null,
      photoId:
        amenity?.photoId ??
        null,
    };
  };

  /* =========================================================
     LOAD AMENITY MANAGEMENT DATA
  ========================================================= */

  const loadAmenities = async (
    currentHostelId
  ) => {
    if (!currentHostelId) {
      setAmenities([]);
      setAvailableAmenities([]);
      setPendingAmenities([]);
      return;
    }

    try {
      console.log(
        "========================================"
      );
      console.log(
        "LOADING OWNER AMENITY MANAGEMENT"
      );
      console.log(
        "Hostel ID:",
        currentHostelId
      );
      console.log(
        "========================================"
      );

      const response =
        await api.get(
          `/api/owner/hostels/${currentHostelId}/amenities`
        );

      const responseData =
        response?.data ?? {};

      console.log(
        "AMENITY MANAGEMENT RESPONSE:",
        responseData
      );

      const managementSource =
        responseData?.data ??
        responseData;

      let selectedRaw =
        Array.isArray(
          managementSource?.selectedAmenities
        )
          ? managementSource.selectedAmenities
          : null;

      let availableRaw =
        Array.isArray(
          managementSource?.availableAmenities
        )
          ? managementSource.availableAmenities
          : null;

      let pendingRaw =
        Array.isArray(
          managementSource?.pendingAmenities
        )
          ? managementSource.pendingAmenities
          : null;

      if (!selectedRaw) {
        selectedRaw =
          Array.isArray(
            managementSource
          )
            ? managementSource
            : Array.isArray(
                managementSource?.amenities
              )
              ? managementSource.amenities
              : [];
      }

      const normalizedSelected =
        await Promise.all(
          selectedRaw.map(
            async (amenity) => {
              const normalized =
                normalizeAmenity(
                  amenity,
                  "APPROVED"
                );

              const amenityId =
                normalized.hostelAmenityId ||
                normalized.id;

              let photos = [];

              if (amenityId) {
                try {
                  const photoResponse =
                    await api.get(
                      `/api/owner/hostels/amenities/${amenityId}/photos`
                    );

                  photos =
                    Array.isArray(
                      photoResponse.data
                    )
                      ? photoResponse.data
                      : Array.isArray(
                          photoResponse.data?.photos
                        )
                        ? photoResponse.data.photos
                        : Array.isArray(
                            photoResponse.data?.data
                          )
                          ? photoResponse.data.data
                          : [];

                  console.log(
                    `Amenity ${amenityId} photo response:`,
                    photos
                  );
                } catch (
                  photoError
                ) {
                  console.error(
                    "Failed to load amenity photos:",
                    amenityId,
                    photoError
                  );
                }
              }

              if (
                photos.length === 0 &&
                (normalized.photo ||
                  normalized.photoId)
              ) {
                photos = [
                  {
                    id: normalized.photoId,
                    url: normalized.photo,
                    verificationStatus:
                      normalized.photoStatus ||
                      "PENDING",
                    rejectionReason:
                      normalized.rejectionReason ||
                      null,
                  },
                ];
              }

              const approvedPhoto =
                photos.find(
                  (photo) =>
                    getPhotoStatus(photo) ===
                    "APPROVED"
                );

              const pendingPhoto =
                photos.find(
                  (photo) =>
                    [
                      "PENDING",
                      "PENDING_REVIEW",
                      "SUBMITTED",
                    ].includes(
                      getPhotoStatus(photo)
                    )
                );

              const rejectedPhoto =
                photos.find(
                  (photo) =>
                    getPhotoStatus(photo) ===
                    "REJECTED"
                );

              const usablePhoto =
                approvedPhoto ||
                pendingPhoto ||
                null;

              const hasRejectedPhoto =
                Boolean(
                  rejectedPhoto
                ) &&
                !usablePhoto;

              let loadedPhotoUrl =
                usablePhoto
                  ? await loadAuthenticatedAmenityImage(
                      usablePhoto
                    )
                  : null;

              /*
               * =====================================================
               * IMPORTANT FIX
               *
               * If this amenity has just been re-uploaded and the
               * backend GET still returns the old rejected record,
               * preserve the successful local preview.
               * =====================================================
               */
              const preservedPreview =
                replacementPreviewUrlsRef
                  .current[
                  String(
                    normalized.hostelAmenityId ||
                      normalized.id
                  )
                ];

              if (
                preservedPreview
              ) {
                loadedPhotoUrl =
                  preservedPreview;
              }

              const catalogDefinition =
                findCatalogDefinition(
                  amenity
                );

              const currentPhotoStatus =
                preservedPreview
                  ? "PENDING"
                  : usablePhoto
                    ? getPhotoStatus(
                        usablePhoto
                      )
                    : hasRejectedPhoto
                      ? "REJECTED"
                      : null;

              const rejectionReason =
                rejectedPhoto?.rejectionReason ||
                rejectedPhoto?.reason ||
                rejectedPhoto?.verificationReason ||
                rejectedPhoto?.remarks ||
                rejectedPhoto?.adminComment ||
                null;

              return {
                ...normalized,
                photos,
                photoRecord:
                  usablePhoto ||
                  rejectedPhoto,
                photo:
                  loadedPhotoUrl,
                photoId:
                  usablePhoto?.id ??
                  usablePhoto?.photoId ??
                  null,
                photoStatus:
                  currentPhotoStatus,
                hasRejectedPhoto:
                  preservedPreview
                    ? false
                    : hasRejectedPhoto,
                rejectedPhoto:
                  preservedPreview
                    ? null
                    : rejectedPhoto,
                rejectionReason:
                  preservedPreview
                    ? null
                    : rejectionReason,
                category:
                  catalogDefinition?.categoryTitle ||
                  normalized.category,
              };
            }
          )
        );

      /*
       * Include both kinds of items in Pending Review:
       * 1. Amenities whose request itself is pending.
       * 2. Already-approved amenities whose replacement photo is pending.
       *
       * A rejected-photo re-upload keeps the amenity approval status as
       * APPROVED, so checking only approvalStatus would incorrectly leave
       * the re-uploaded image out of the Pending Review section.
       */
      const approvalPendingAmenities =
        (pendingRaw ||
          normalizedSelected.filter(
            (amenity) =>
              [
                "PENDING",
                "PENDING_REVIEW",
                "SUBMITTED",
              ].includes(
                String(
                  amenity.approvalStatus
                )
                  .trim()
                  .toUpperCase()
              )
          ))
          .map((amenity) =>
            normalizeAmenity(
              amenity,
              "PENDING"
            )
          );

      const photoPendingAmenities =
        normalizedSelected
          .filter(
            (amenity) =>
              String(
                amenity.photoStatus ?? ""
              )
                .trim()
                .toUpperCase() ===
              "PENDING"
          )
          .map((amenity) =>
            normalizeAmenity(
              amenity,
              "PENDING"
            )
          );

      /*
       * IMPORTANT:
       * Keep locally-created pending amenity requests while refreshing
       * the server data.
       *
       * The backend can return the pending list without a just-created
       * draft while another photo is being re-uploaded. If we replace
       * pendingAmenities directly with that server response, the local
       * amenity disappears from Pending Review and is calculated as
       * "available" again.
       *
       * Draft amenities are merged back into the refreshed pending list.
       * Once the draft is submitted, handleSubmitPending clears the local
       * draft state, so it will not remain here permanently.
       */
      const localDraftPendingAmenities =
        pendingAmenities
          .filter(
            (amenity) =>
              amenity?.isDraftPending === true
          )
          .map((amenity) => ({
            ...amenity,
            approvalStatus: "PENDING",
            status: "PENDING",
            requestStatus: "PENDING",
          }));

      const normalizedPending = [
        ...approvalPendingAmenities,
        ...photoPendingAmenities,
        ...localDraftPendingAmenities,
      ].reduce((result, amenity) => {
        const key = String(
          amenity?.hostelAmenityId ??
            amenity?.id ??
            amenity?.amenityId ??
            amenity?.amenityCode ??
            amenity?.code ??
            amenity?.name ??
            ""
        );

        const existingIndex = result.findIndex(
          (item) => {
            const itemKey = String(
              item?.hostelAmenityId ??
                item?.id ??
                item?.amenityId ??
                item?.amenityCode ??
                item?.code ??
                item?.name ??
                ""
            );

            return itemKey === key;
          }
        );

        if (existingIndex === -1) {
          result.push(amenity);
        } else {
          /*
           * Prefer the normalized selected amenity because it contains
           * the latest photo/photoStatus and the preserved local preview.
           */
          result[existingIndex] = {
            ...result[existingIndex],
            ...amenity,
            photo:
              amenity?.photo ||
              result[existingIndex]?.photo ||
              null,
            photoStatus:
              amenity?.photoStatus ||
              result[existingIndex]?.photoStatus ||
              "PENDING",
          };
        }

        return result;
      }, []);

      const myAmenities =
        normalizedSelected.filter(
          (amenity) =>
            String(
              amenity.approvalStatus
            ).toUpperCase() ===
            "APPROVED"
        );

      const existingAmenities = [
        ...myAmenities,
        ...normalizedPending,
      ];

      const normalizedAvailable =
        allAmenityDefinitions
          .filter((definition) => {
            const definitionKeys =
              getCatalogKeys(
                definition
              );

            const alreadyExists =
              existingAmenities.some(
                (item) => {
                  const itemKeys =
                    getCatalogKeys(
                      item
                    );

                  return [
                    ...definitionKeys,
                  ].some((key) =>
                    itemKeys.has(
                      key
                    )
                  );
                }
              );

            return !alreadyExists;
          })
          .map((definition) => ({
            id: definition.id,
            amenityId: definition.id,
            amenityCode:
              definition.id,
            code: definition.id,
            name: definition.label,
            amenityName:
              definition.label,
            category:
              definition.categoryTitle,
            photoRequired:
              definition.photoRequired,
            approvalStatus:
              "AVAILABLE",
            status: "AVAILABLE",
            available: true,
            photo: null,
            photoId: null,
            photoRecord: null,
            photos: [],
            Icon: definition.Icon,
            photoStatus: null,
            hasRejectedPhoto:
              false,
            rejectedPhoto: null,
            rejectionReason:
              null,
          }));

      setAmenities(
        myAmenities
      );

      setPendingAmenities(
        normalizedPending
      );

      setAvailableAmenities(
        normalizedAvailable
      );
    } catch (
      amenitiesError
    ) {
      console.error(
        "Failed to load amenities:",
        amenitiesError
      );

      throw amenitiesError;
    }
  };

  /* =========================================================
     LOAD OWNER + HOSTEL
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const loadPageData =
      async () => {
        try {
          setLoading(true);
          setError("");

          let currentHostelId =
            localStorage.getItem(
              "hostelId"
            );

          try {
            const dashboardResponse =
              await api.get(
                "/api/owner/dashboard"
              );

            if (!mounted) {
              return;
            }

            const data =
              dashboardResponse.data;

            setDashboardData(
              data
            );

            const dashboardHostel =
              data?.hostel ||
              data?.data?.hostel ||
              {};

            const resolvedHostelId =
              dashboardHostel?.hostelId ??
              dashboardHostel?.id ??
              currentHostelId;

            if (resolvedHostelId) {
              currentHostelId =
                String(
                  resolvedHostelId
                );

              localStorage.setItem(
                "hostelId",
                currentHostelId
              );

              if (mounted) {
                setHostelId(
                  currentHostelId
                );
              }
            }
          } catch (
            dashboardError
          ) {
            console.warn(
              "Could not load dashboard information:",
              dashboardError
            );
          }

          if (!currentHostelId) {
            if (mounted) {
              setAmenities([]);
              setAvailableAmenities([]);
              setPendingAmenities([]);
              setError(
                "No hostel is associated with this owner."
              );
            }

            return;
          }

          await loadAmenities(
            currentHostelId
          );
        } catch (
          pageError
        ) {
          console.error(
            "Failed to load amenity page:",
            pageError
          );

          if (mounted) {
            setError(
              pageError?.response
                ?.data
                ?.message ||
                "Unable to load amenities for this hostel."
            );
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    loadPageData();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================================================
     OWNER
  ========================================================= */

  const owner =
    dashboardData?.owner ||
    dashboardData?.data?.owner ||
    dashboardData?.user ||
    dashboardData?.data?.user ||
    {};

  const ownerName =
    owner?.name ||
    owner?.fullName ||
    owner?.ownerName ||
    owner?.username ||
    "Hostel Owner";

  const ownerInitial =
    ownerName
      .charAt(0)
      .toUpperCase();

  /* =========================================================
     CATEGORIES
  ========================================================= */

  const categories =
    useMemo(() => {
      const all = [
        ...amenities,
        ...availableAmenities,
        ...pendingAmenities,
      ];

      return [
        "All Categories",
        ...new Set(
          all.map(
            (amenity) =>
              amenity?.category ||
              getAmenityCategory(
                amenity
              )
          )
        ),
      ];
    }, [
      amenities,
      availableAmenities,
      pendingAmenities,
    ]);

  /* =========================================================
     ACTIVE LIST
  ========================================================= */

  const activeAmenities =
    useMemo(() => {
      if (activeSection === "my") {
        return amenities;
      }

      if (activeSection === "available") {
        return availableAmenities;
      }

      return pendingAmenities;
    }, [
      activeSection,
      amenities,
      availableAmenities,
      pendingAmenities,
    ]);

  const filteredAmenities =
    useMemo(() => {
      return activeAmenities.filter(
        (amenity) => {
          return (
            selectedCategory ===
              "All Categories" ||
            (amenity?.category ||
              getAmenityCategory(
                amenity
              )) ===
              selectedCategory
          );
        }
      );
    }, [
      activeAmenities,
      selectedCategory,
    ]);

  /* =========================================================
     COUNTS
  ========================================================= */

  const myAmenitiesCount =
    amenities.length;

  const availableAmenitiesCount =
    availableAmenities.length;

  const pendingAmenitiesCount =
    pendingAmenities.length;

  const totalPhotos =
    amenities.filter(
      (amenity) =>
        Boolean(amenity.photo)
    ).length;

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handleNavigation = (
    path
  ) => {
    setSidebarOpen(false);
    window.location.href =
      path;
  };

  /* =========================================================
     OPEN IMAGE PREVIEW
  ========================================================= */

  const openPreview = (
    amenity
  ) => {
    if (!amenity?.photo) {
      return;
    }

    setPreviewImage({
      src: amenity.photo,
      name: amenity.name,
    });
  };

  /* =========================================================
     TOGGLE AVAILABLE AMENITY
  ========================================================= */

  const toggleAvailableAmenity = (
    amenity
  ) => {
    const key =
      amenity?.amenityCode ??
      amenity?.code ??
      amenity?.id;

    if (!key) {
      return;
    }

    const alreadySelected = Boolean(
      selectedToAdd[key]
    );

    if (alreadySelected) {
      return;
    }

    /*
     * IMPORTANT:
     * Selecting a new amenity does NOT submit it to the backend.
     * It is first moved into Pending Review as a local draft.
     * The owner can then verify all details and finally submit
     * the complete pending batch to the admin.
     */
    const draftPendingAmenity = {
      ...amenity,
      approvalStatus: "PENDING",
      status: "PENDING",
      requestStatus: "PENDING",
      isDraftPending: true,
      photoStatus: newAmenityPhotos[key]?.file
        ? "PENDING"
        : null,
      photo:
        newAmenityPhotos[key]?.previewUrl ||
        null,
      photoId: null,
      photoRecord: newAmenityPhotos[key]?.file
        ? {
            url:
              newAmenityPhotos[key]
                ?.previewUrl,
            verificationStatus:
              "PENDING",
          }
        : null,
      photos: [],
      hasRejectedPhoto: false,
      rejectedPhoto: null,
      rejectionReason: null,
    };

    setSelectedToAdd((prev) => ({
      ...prev,
      [key]: true,
    }));

    setPendingAmenities((prev) => {
      const exists = prev.some(
        (item) =>
          String(
            item?.amenityCode ??
              item?.code ??
              item?.id
          ) === String(key)
      );

      if (exists) {
        return prev;
      }

      return [
        ...prev,
        draftPendingAmenity,
      ];
    });

    setAvailableAmenities((prev) =>
      prev.filter((item) => {
        const itemKey =
          item?.amenityCode ??
          item?.code ??
          item?.id;

        return (
          String(itemKey) !==
          String(key)
        );
      })
    );

    setError("");

    /*
     * Automatically open Pending Review so the owner
     * can verify the newly selected amenity.
     */
    setActiveSection("pending");
  };

  /* =========================================================
     SELECT PHOTO FOR AVAILABLE AMENITY
  ========================================================= */

  const handleSelectNewAmenityPhoto = (
    event,
    amenity
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file || !amenity) {
      return;
    }

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type
      )
    ) {
      window.alert(
        "Only JPG, PNG or WEBP images are allowed."
      );
      return;
    }

    if (
      file.size >
      MAX_PHOTO_SIZE
    ) {
      window.alert(
        "Image size cannot exceed 10 MB."
      );
      return;
    }

    const key =
      amenity?.amenityCode ??
      amenity?.code ??
      amenity?.id;

    if (!key) {
      return;
    }

    const previewUrl =
      URL.createObjectURL(file);

    setNewAmenityPhotos((prev) => {
      const previous =
        prev[key];

      if (previous?.previewUrl) {
        URL.revokeObjectURL(
          previous.previewUrl
        );
      }

      return {
        ...prev,
        [key]: {
          file,
          previewUrl,
        },
      };
    });

    setError("");
  };

  /* =========================================================
     SAVE NEW AMENITY REQUESTS
  ========================================================= */

  const handleSubmitPending = async () => {
    const draftPendingAmenities =
      pendingAmenities.filter(
        (amenity) =>
          amenity?.isDraftPending
      );

    if (
      draftPendingAmenities.length ===
      0
    ) {
      setError(
        "There are no new amenities ready to submit."
      );
      return;
    }

    const missingPhotoAmenities =
      draftPendingAmenities.filter(
        (amenity) => {
          const key =
            amenity?.amenityCode ??
            amenity?.code ??
            amenity?.id;

          if (
            !amenity?.photoRequired
          ) {
            return false;
          }

          return !newAmenityPhotos[
            key
          ]?.file;
        }
      );

    if (
      missingPhotoAmenities.length >
      0
    ) {
      const amenityNames =
        missingPhotoAmenities
          .map(
            (a) =>
              a?.name || "Unnamed"
          )
          .join(", ");

      setError(
        `Photo required for: ${amenityNames}. Please upload an image for each selected amenity that requires one.`
      );
      return;
    }

    if (!hostelId) {
      setError(
        "Hostel ID is missing."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const formData =
        new FormData();

      const requestPayload =
        draftPendingAmenities.map(
          (amenity) => ({
            amenityCode:
              amenity?.amenityCode ??
              amenity?.code ??
              null,
            amenityName:
              amenity?.name ??
              amenity?.amenityName ??
              null,
            category:
              amenity?.category ??
              getAmenityCategory(
                amenity
              ),
            photoRequired:
              amenity?.photoRequired !==
              false,
          })
        );

      formData.append(
        "requests",
        JSON.stringify(
          requestPayload
        )
      );

      draftPendingAmenities.forEach(
        (amenity) => {
          const key =
            amenity?.amenityCode ??
            amenity?.code ??
            amenity?.id;

          const file =
            newAmenityPhotos[
              key
            ]?.file;

          if (file) {
            formData.append(
              `photo_${key}`,
              file
            );
          }
        }
      );

      /*
       * This is the actual point at which the owner
       * submits the verified pending batch to admin.
       */
      const response =
        await api.post(
          `/api/owner/hostels/${hostelId}/amenities/request`,
          formData
        );

      console.log(
        "Pending amenities submitted to admin:",
        response.data
      );

      /*
       * Save the preview URLs before clearing the
       * draft state so they can be revoked safely.
       */
      const previewUrls =
        Object.values(
          newAmenityPhotos
        )
          .map(
            (item) =>
              item?.previewUrl
          )
          .filter(Boolean);

      /*
       * Backend now owns these requests.
       * Refresh from the server so Pending Review contains
       * the submitted records returned by the backend.
       */
      await loadAmenities(
        hostelId
      );

      previewUrls.forEach(
        (url) => {
          URL.revokeObjectURL(url);
        }
      );

      setSelectedToAdd({});
      setNewAmenityPhotos({});
      setActiveSection("pending");
      setSuccessMessage(
        "All pending amenities were submitted successfully and sent to admin for review."
      );
    } catch (
      submitError
    ) {
      console.error(
        "Failed to submit pending amenities:",
        submitError
      );

      setError(
        submitError?.response
          ?.data?.message ||
          submitError?.response
            ?.data?.error ||
          "Failed to submit pending amenities. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     REPLACE EXISTING AMENITY PHOTO
  ========================================================= */

  const handleEdit = (
    amenity
  ) => {
    setEditingAmenity(
      amenity
    );
  };

  const handleOpenReplacePicker =
    () => {
      if (saving) {
        return;
      }

      replacePhotoInputRef.current?.click();
    };

  /*
   * =========================================================
   * UPDATED RE-UPLOAD FUNCTION
   *
   * This is the important fix.
   * =========================================================
   */
  const handleReplacePhoto =
    async (event) => {
      const file =
        event.target.files?.[0];

      event.target.value = "";

      if (
        !file ||
        !editingAmenity
      ) {
        return;
      }

      if (
        !ALLOWED_IMAGE_TYPES.includes(
          file.type
        )
      ) {
        window.alert(
          "Only JPG, PNG or WEBP images are allowed."
        );
        return;
      }

      if (
        file.size >
        MAX_PHOTO_SIZE
      ) {
        window.alert(
          "Image size cannot exceed 10 MB."
        );
        return;
      }

      const targetAmenityId =
        editingAmenity.hostelAmenityId ??
        editingAmenity.id ??
        editingAmenity.amenityId;

      if (
        targetAmenityId === null ||
        targetAmenityId === undefined ||
        targetAmenityId === ""
      ) {
        window.alert(
          "Amenity ID is missing."
        );
        return;
      }

      /*
       * Create preview BEFORE upload.
       * This lets the owner immediately see the selected
       * image and also gives us a fallback if the subsequent
       * GET still returns the rejected record.
       */
      const localBlobUrl =
        URL.createObjectURL(file);

      try {
        setSaving(true);
        setError("");

        /*
         * Store the preview against the HOSTEL AMENITY ID.
         */
        replacementPreviewUrlsRef.current[
          String(targetAmenityId)
        ] = localBlobUrl;

        const formData =
          new FormData();

        /*
         * IMPORTANT:
         * Keep the backend field name as "file".
         */
        formData.append(
          "file",
          file,
          file.name
        );

        console.log(
          "========================================"
        );
        console.log(
          "RE-UPLOADING REJECTED AMENITY PHOTO"
        );
        console.log(
          "Hostel ID:",
          hostelId
        );
        console.log(
          "Hostel Amenity ID:",
          targetAmenityId
        );
        console.log(
          "File:",
          file.name
        );
        console.log(
          "File Type:",
          file.type
        );
        console.log(
          "File Size:",
          file.size
        );
        console.log(
          "========================================"
        );

        const uploadResponse =
          await api.post(
            `/api/owner/hostels/amenities/${targetAmenityId}/photo/reupload`,
            formData
          );

        console.log(
          "Amenity re-upload response:",
          uploadResponse.data
        );

        /*
         * =====================================================
         * IMPORTANT:
         * Do NOT immediately discard the local image.
         *
         * Update the existing amenity in the UI first.
         * =====================================================
         */
        setAmenities((prevList) =>
          prevList.map((item) => {
            const currentId =
              item.hostelAmenityId ??
              item.id ??
              item.amenityId;

            if (
              String(currentId) ===
              String(targetAmenityId)
            ) {
              return {
                ...item,

                /*
                 * Show newly uploaded image.
                 */
                photo:
                  localBlobUrl,

                /*
                 * New photo is waiting for admin.
                 */
                photoStatus:
                  "PENDING",

                /*
                 * Very important:
                 * remove rejected state from UI.
                 */
                hasRejectedPhoto:
                  false,

                rejectedPhoto:
                  null,

                rejectionReason:
                  null,

                /*
                 * Keep a photo record even before
                 * backend GET catches up.
                 */
                photoRecord: {
                  id:
                    uploadResponse?.data
                      ?.photoId ??
                    uploadResponse?.data
                      ?.photo?.id ??
                    null,
                  photoId:
                    uploadResponse?.data
                      ?.photoId ??
                    uploadResponse?.data
                      ?.photo?.id ??
                    null,
                  url:
                    uploadResponse?.data
                      ?.photoUrl ||
                    uploadResponse?.data
                      ?.photo?.photoUrl ||
                    localBlobUrl,
                  verificationStatus:
                    "PENDING",
                },
              };
            }

            return item;
          })
        );

        /*
         * =====================================================
         * Also update editingAmenity so if the modal is still
         * referenced anywhere, it contains the new image.
         * =====================================================
         */
        setEditingAmenity(
          (previous) => {
            if (!previous) {
              return null;
            }

            const previousId =
              previous.hostelAmenityId ??
              previous.id ??
              previous.amenityId;

            if (
              String(previousId) !==
              String(targetAmenityId)
            ) {
              return previous;
            }

            return {
              ...previous,
              photo:
                localBlobUrl,
              photoStatus:
                "PENDING",
              hasRejectedPhoto:
                false,
              rejectedPhoto:
                null,
              rejectionReason:
                null,
            };
          }
        );

        /*
         * Close the modal after successful upload.
         */
        setEditingAmenity(
          null
        );

        /*
         * Show Pending Review because the replacement image is now
         * awaiting admin approval.
         */
        setActiveSection(
          "pending"
        );

        setSuccessMessage(
          "Amenity image uploaded successfully. The new image is now pending admin approval."
        );

        /*
         * =====================================================
         * Refresh backend data AFTER updating the UI.
         *
         * loadAmenities() now preserves the local preview
         * through replacementPreviewUrlsRef, so an old
         * rejected record cannot overwrite it.
         * =====================================================
         */
        if (hostelId) {
          try {
            await loadAmenities(
              hostelId
            );
          } catch (
            refreshError
          ) {
            /*
             * Upload already succeeded.
             * A refresh failure must NOT make the owner think
             * that the upload failed.
             */
            console.warn(
              "Amenity uploaded successfully, but refresh failed:",
              refreshError
            );
          }
        }

        /*
         * Do NOT revoke localBlobUrl here.
         *
         * It is still being used by the page.
         * It will be revoked when the component unmounts.
         */
      } catch (
        replaceError
      ) {
        /*
         * Upload actually failed.
         * Now the local preview can safely be discarded.
         */
        delete replacementPreviewUrlsRef.current[
          String(targetAmenityId)
        ];

        URL.revokeObjectURL(
          localBlobUrl
        );

        console.error(
          "Failed to replace amenity image:",
          replaceError
        );

        console.error(
          "Upload error response:",
          replaceError?.response?.data
        );

        setError(
          replaceError?.response
            ?.data?.message ||
            replaceError?.response
              ?.data?.error ||
            "Failed to replace amenity image. Please try again."
        );
      } finally {
        setSaving(false);
      }
    };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );
    localStorage.removeItem(
      "user"
    );
    localStorage.removeItem(
      "hostelId"
    );

    window.location.href = "/";
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          <p className="text-sm">
            Loading amenities...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen w-[205px]
          border-r border-slate-200 bg-white
          transition-transform duration-300
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        <div className="flex h-[62px] items-center border-b border-slate-100 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <Building2
                size={20}
                className="text-white"
              />
            </div>

            <div>
              <h1 className="text-lg font-bold leading-none text-blue-700">
                FindMyHostel
              </h1>
              <p className="mt-1 text-[9px] font-semibold tracking-widest text-slate-500">
                OWNER PORTAL
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="ml-auto lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <div className="h-[calc(100vh-62px)] overflow-y-auto px-2.5 py-4">
          <SidebarLabel label="MAIN" />

          <SidebarItem
            icon={
              <LayoutDashboard size={17} />
            }
            label="Dashboard"
            onClick={() =>
              handleNavigation(
                "/owner/dashboard"
              )
            }
          />

          <SidebarLabel label="MY HOSTEL" />

          <SidebarItem
            icon={
              <Building2 size={17} />
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
              <BedDouble size={17} />
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
              <CircleHelp size={17} />
            }
            label="Amenities"
            active
            onClick={() =>
              handleNavigation(
                "/owner/amenities"
              )
            }
          />

          <SidebarItem
            icon={
              <Images size={17} />
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
              <MessageSquare size={17} />
            }
            label="Issues"
            onClick={() =>
              handleNavigation(
                "/owner/issues"
              )
            }
          />

          <SidebarItem
            icon={
              <Star size={17} />
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
              <BarChart3 size={17} />
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
              <Settings size={17} />
            }
            label="Settings"
            onClick={() =>
              handleNavigation(
                "/owner/settings"
              )
            }
          />

          <SidebarItem
            icon={
              <CircleHelp size={17} />
            }
            label="Support"
            onClick={() =>
              handleNavigation(
                "/owner/support"
              )
            }
          />

          <div className="mt-7 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() =>
                handleNavigation(
                  "/hostel"
                )
              }
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Eye size={15} />
              View Public Listing
              <ExternalLink
                size={13}
              />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}

      <main className="lg:ml-[205px] h-screen flex flex-col overflow-hidden">

        {/* HEADER */}

        <header className="flex h-[62px] flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-7">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setSidebarOpen(true)
              }
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div className="text-sm text-slate-500">
              My Hostel
              <ChevronRight
                size={14}
                className="mx-1 inline"
              />
              <span className="font-medium text-slate-700">
                Amenities
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100"
              title="Notifications"
            >
              <Bell size={18} />

              {pendingAmenitiesCount >
                0 && (
                <span className="absolute right-[2px] top-[1px] flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white">
                  {pendingAmenitiesCount}
                </span>
              )}
            </button>

            <div
              className="relative"
              ref={profileMenuRef}
            >
              <button
                type="button"
                onClick={() =>
                  setProfileMenuOpen(
                    (prev) =>
                      !prev
                  )
                }
                className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  {ownerInitial}
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-xs font-semibold text-slate-800">
                    {ownerName}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Hostel Owner
                  </p>
                </div>

                <ChevronDown
                  size={14}
                  className="text-slate-400"
                />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-800">
                      {ownerName}
                    </p>
                    <p className="text-xs text-slate-500">
                      Hostel Owner
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleNavigation(
                        "/owner/settings"
                      )
                    }
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <UserCircle
                      size={16}
                    />
                    Profile & Settings
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut
                      size={16}
                    />
                    Log Out
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

          <div className="mx-auto max-w-[1440px] p-5 lg:p-7">

          {/* PAGE HEADER */}

          <div className="mb-5 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-[28px] font-bold tracking-tight text-slate-900">
                Amenities
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage your hostel amenities and their original images
              </p>
            </div>

            {activeSection ===
              "pending" &&
              pendingAmenities.some(
                (amenity) =>
                  amenity?.isDraftPending
              ) && (
              <button
                type="button"
                onClick={
                  handleSubmitPending
                }
                disabled={saving}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <CheckCircle2
                    size={15}
                  />
                )}
                Submit to Admin
              </button>
            )}
          </div>

          {/* SUCCESS */}

          {successMessage && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2
                size={18}
                className="shrink-0"
              />
              <span>
                {successMessage}
              </span>
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle
                size={18}
                className="shrink-0"
              />
              <span>
                {error}
              </span>
              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="ml-auto rounded-md p-1 hover:bg-red-100"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* SUMMARY */}

          <section className="mb-5 grid grid-cols-1 overflow-hidden rounded-xl border border-slate-200 bg-white md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={
                <CheckCircle2
                  size={20}
                />
              }
              iconClass="bg-emerald-50 text-emerald-600"
              label="My Amenities"
              value={
                myAmenitiesCount
              }
              supporting="Approved amenities"
            />

            <StatCard
              icon={
                <Plus size={20} />
              }
              iconClass="bg-blue-50 text-blue-600"
              label="Remaining Amenities"
              value={
                availableAmenitiesCount
              }
              supporting="Amenities not yet added or requested"
            />

            <StatCard
              icon={
                <Clock3 size={20} />
              }
              iconClass="bg-amber-50 text-amber-600"
              label="Pending Review"
              value={
                pendingAmenitiesCount
              }
              supporting="Waiting for admin approval"
            />

            <StatCard
              icon={
                <Images size={20} />
              }
              iconClass="bg-violet-50 text-violet-600"
              label="Total Photos"
              value={totalPhotos}
              supporting="Original hostel images"
            />
          </section>

          {/* TABS + CATEGORY */}

          <div className="mb-4 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <div className="flex flex-wrap items-center gap-1 rounded-lg bg-white p-1">
              <SectionTab
                active={
                  activeSection ===
                  "my"
                }
                onClick={() =>
                  setActiveSection(
                    "my"
                  )
                }
                label="My Amenities"
                count={
                  myAmenitiesCount
                }
              />

              <SectionTab
                active={
                  activeSection ===
                  "available"
                }
                onClick={() =>
                  setActiveSection(
                    "available"
                  )
                }
                label="Remaining Amenities"
                count={
                  availableAmenitiesCount
                }
              />

              <SectionTab
                active={
                  activeSection ===
                  "pending"
                }
                onClick={() =>
                  setActiveSection(
                    "pending"
                  )
                }
                label="Pending Review"
                count={
                  pendingAmenitiesCount
                }
              />
            </div>

            <select
              value={
                selectedCategory
              }
              onChange={(e) =>
                setSelectedCategory(
                  e.target.value
                )
              }
              className="h-9 min-w-[170px] rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
            >
              {categories.map(
                (category) => (
                  <option
                    key={
                      category
                    }
                    value={
                      category
                    }
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </div>

          {/* MAIN GRID */}

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_255px]">

            {/* LIST */}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

              {filteredAmenities.map(
                (
                  amenity,
                  index
                ) => {
                  const Icon =
                    amenity?.Icon ||
                    getAmenityIcon(
                      amenity
                    );

                  const iconClass =
                    getAmenityIconClass(
                      amenity
                    );

                  const amenityKey =
                    amenity?.amenityCode ??
                    amenity?.code ??
                    amenity?.id;

                  const isSelected =
                    Boolean(
                      selectedToAdd[
                        amenityKey
                      ]
                    );

                  const newPhoto =
                    newAmenityPhotos[
                      amenityKey
                    ];

                  const isPending =
                    activeSection ===
                      "pending" ||
                    [
                      "PENDING",
                      "PENDING_REVIEW",
                      "SUBMITTED",
                    ].includes(
                      String(
                        amenity?.approvalStatus
                      )
                        .toUpperCase()
                    );

                  const requiresPhoto =
                    Boolean(
                      amenity?.photoRequired
                    );

                  const hasPhoto =
                    Boolean(
                      newPhoto?.file
                    );

                  const hasRejectedPhoto =
                    Boolean(
                      amenity?.hasRejectedPhoto
                    );

                  const rejectionReason =
                    amenity?.rejectionReason ||
                    null;

                  const isPhotoPending =
                    amenity?.photoStatus ===
                    "PENDING";

                  return (
                    <div
                      key={
                        amenity.id ??
                        `${amenity.name}-${index}`
                      }
                      className={`px-4 py-4 ${
                        index <
                        filteredAmenities.length -
                          1
                          ? "border-b border-slate-100"
                          : ""
                      } ${
                        activeSection ===
                          "available" &&
                        isSelected &&
                        requiresPhoto &&
                        !hasPhoto
                          ? "border-l-4 border-l-amber-500"
                          : ""
                      } ${
                        activeSection ===
                          "my" &&
                        hasRejectedPhoto
                          ? "border-l-4 border-l-red-500 bg-red-50/30"
                          : ""
                      }`}
                    >
                      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[76px_minmax(180px,1fr)_280px_120px]">

                        {/* ICON / CHECKBOX */}

                        <div className="flex items-center justify-center gap-2">
                          {activeSection ===
                            "available" && (
                            <input
                              type="checkbox"
                              checked={
                                isSelected
                              }
                              onChange={() =>
                                toggleAvailableAmenity(
                                  amenity
                                )
                              }
                              className="h-4 w-4 accent-blue-600"
                              aria-label={`Select ${amenity.name}`}
                            />
                          )}

                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconClass}`}
                          >
                            <Icon
                              size={23}
                            />
                          </div>
                        </div>

                        {/* DETAILS */}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="truncate text-sm font-bold text-slate-900">
                              {
                                amenity.name
                              }
                            </h3>

                            {activeSection ===
                              "available" &&
                              requiresPhoto && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-amber-700 border border-amber-200">
                                  <Camera
                                    size={10}
                                  />
                                  Photo Required
                                </span>
                              )}

                            {activeSection ===
                              "available" &&
                              !requiresPhoto && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-slate-500 border border-slate-200">
                                  <span className="opacity-50">
                                    ●
                                  </span>
                                  No Photo Needed
                                </span>
                              )}

                            {activeSection ===
                              "my" &&
                              hasRejectedPhoto && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-red-700 border border-red-300">
                                  <AlertTriangle
                                    size={10}
                                  />
                                  Photo Rejected
                                </span>
                              )}

                            {activeSection ===
                              "my" &&
                              isPhotoPending &&
                              !hasRejectedPhoto && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-amber-700 border border-amber-300">
                                  <Clock3
                                    size={10}
                                  />
                                  Photo Pending
                                </span>
                              )} 

                            {activeSection ===
                              "pending" &&
                              amenity?.isDraftPending && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-blue-700 border border-blue-300">
                                  <Clock3
                                    size={10}
                                  />
                                  Ready to Submit
                                </span>
                              )}
                          </div>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {
                              amenity.category
                            }
                          </p>

                          {activeSection ===
                            "available" && (
                            <p className="mt-2 text-[11px] text-slate-400">
                              {requiresPhoto
                                ? "Select this amenity and upload a clear photo to request it."
                                : "Select this amenity to add it without requiring a photo."}
                            </p>
                          )}

                          {activeSection ===
                            "pending" && (
                            <p className="mt-2 text-[11px] text-slate-400">
                              {amenity?.isDraftPending
                                ? "Verify this amenity and its information. It will be sent to admin when you click Submit to Admin."
                                : "This amenity will move to My Amenities only after admin approval."}
                            </p>
                          )}

                          {activeSection ===
                            "my" &&
                            hasRejectedPhoto &&
                            rejectionReason && (
                              <div className="mt-2 rounded-lg border border-red-200 bg-red-50/70 px-3 py-2">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-red-700">
                                  Admin Rejection Reason
                                </p>

                                <p className="mt-0.5 text-[11px] leading-4 text-red-700">
                                  {
                                    rejectionReason
                                  }
                                </p>
                              </div>
                            )}

                          {activeSection ===
                            "my" &&
                            isPhotoPending &&
                            !hasRejectedPhoto && (
                              <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">
                                  Photo Under Review
                                </p>

                                <p className="mt-0.5 text-[11px] leading-4 text-amber-700">
                                  Your new photo has been submitted and is waiting for admin approval.
                                </p>
                              </div>
                            )}
                        </div>

                        {/* PHOTO */}

                        <div>
                          {activeSection ===
                            "available" ||
                            (activeSection ===
                              "pending" &&
                              amenity?.isDraftPending) ? (
                            <div className="flex flex-col gap-2">
                              {requiresPhoto ? (
                                newPhoto ? (
                                  <div className="group relative overflow-hidden rounded-lg border border-blue-200 bg-blue-50">
                                    <img
                                      src={
                                        newPhoto.previewUrl
                                      }
                                      alt={
                                        amenity.name
                                      }
                                      onClick={() =>
                                        setPreviewImage(
                                          {
                                            src: newPhoto.previewUrl,
                                            name: amenity.name,
                                          }
                                        )
                                      }
                                      className="h-[108px] w-full cursor-pointer object-cover"
                                    />

                                    <span className="absolute left-2 top-2 rounded-md bg-blue-600 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white">
                                      {activeSection ===
                                      "pending"
                                        ? "Pending Photo"
                                        : "Request Photo"}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        URL.revokeObjectURL(
                                          newPhoto.previewUrl
                                        );

                                        setNewAmenityPhotos(
                                          (prev) => {
                                            const next = {
                                              ...prev,
                                            };

                                            delete next[
                                              amenityKey
                                            ];

                                            return next;
                                          }
                                        );
                                      }}
                                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-700 shadow"
                                      title="Remove selected image"
                                    >
                                      <X
                                        size={15}
                                      />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      newAmenityPhotoInputRefs.current[
                                        amenityKey
                                      ]?.click()
                                    }
                                    className={`flex h-[108px] w-full flex-col items-center justify-center rounded-lg border border-dashed text-center transition ${
                                      isSelected
                                        ? "border-amber-400 bg-amber-50/30 hover:border-blue-400 hover:bg-blue-50/40"
                                        : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40"
                                    }`}
                                  >
                                    <Upload
                                      size={20}
                                      className={
                                        isSelected
                                          ? "text-amber-600"
                                          : "text-blue-600"
                                      }
                                    />

                                    <span
                                      className={`mt-1 text-xs font-semibold ${
                                        isSelected
                                          ? "text-amber-700"
                                          : "text-blue-700"
                                      }`}
                                    >
                                      Upload Image
                                    </span>

                                    <span className="mt-0.5 text-[9px] text-slate-400">
                                      Required • Max 10MB
                                    </span>

                                    {isSelected &&
                                      !newPhoto && (
                                        <span className="mt-1 text-[9px] font-semibold text-amber-600">
                                          ⚠️ Photo required
                                        </span>
                                      )}
                                  </button>
                                )
                              ) : (
                                <div className="flex h-[108px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50">
                                  <div className="text-center">
                                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                                      <CheckCircle2
                                        size={18}
                                        className="text-slate-400"
                                      />
                                    </div>

                                    <p className="mt-2 text-[10px] font-medium text-slate-500">
                                      No photo required
                                    </p>

                                    <p className="text-[8px] text-slate-400">
                                      This amenity doesn't need an image
                                    </p>
                                  </div>
                                </div>
                              )}

                              <input
                                ref={(
                                  node
                                ) => {
                                  newAmenityPhotoInputRefs.current[
                                    amenityKey
                                  ] = node;
                                }}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(
                                  event
                                ) =>
                                  handleSelectNewAmenityPhoto(
                                    event,
                                    amenity
                                  )
                                }
                              />
                            </div>
                          ) : isPhotoPending &&
                            amenity.photo ? (
                            <div className="group relative overflow-hidden rounded-lg border border-amber-300 bg-amber-50">
                              <img
                                src={
                                  amenity.photo
                                }
                                alt={
                                  amenity.name
                                }
                                onClick={() =>
                                  openPreview(
                                    amenity
                                  )
                                }
                                className="h-[108px] w-full cursor-pointer object-cover"
                              />

                              <span className="absolute left-2 top-2 rounded-md bg-amber-600 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white">
                                Under Review
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  openPreview(
                                    amenity
                                  )
                                }
                                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-slate-700 opacity-0 shadow transition group-hover:opacity-100"
                                title="View image"
                              >
                                <Maximize2
                                  size={15}
                                />
                              </button>
                            </div>
                          ) : hasRejectedPhoto ? (
                            <div className="flex h-[108px] flex-col items-center justify-center rounded-lg border-2 border-red-300 bg-red-50/50">
                              <div className="text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                  <AlertTriangle
                                    size={22}
                                    className="text-red-600"
                                  />
                                </div>

                                <p className="mt-2 text-[10px] font-bold text-red-700">
                                  Photo Rejected
                                </p>

                                <p className="text-[8px] text-red-500">
                                  Click Re-upload to submit a new image
                                </p>
                              </div>
                            </div>
                          ) : isPhotoPending ? (
                            <div className="flex h-[108px] flex-col items-center justify-center rounded-lg border-2 border-amber-300 bg-amber-50/50">
                              <div className="text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                                  <Clock3
                                    size={22}
                                    className="text-amber-600"
                                  />
                                </div>

                                <p className="mt-2 text-[10px] font-bold text-amber-700">
                                  Photo Pending
                                </p>

                                <p className="text-[8px] text-amber-500">
                                  Waiting for admin review
                                </p>
                              </div>
                            </div>
                          ) : amenity.photo ? (
                            <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                              <img
                                src={
                                  amenity.photo
                                }
                                alt={
                                  amenity.name
                                }
                                onClick={() =>
                                  openPreview(
                                    amenity
                                  )
                                }
                                className="h-[108px] w-full cursor-pointer object-cover transition duration-300 group-hover:scale-[1.025]"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  openPreview(
                                    amenity
                                  )
                                }
                                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-slate-700 opacity-0 shadow transition group-hover:opacity-100"
                                title="View original image"
                              >
                                <Maximize2
                                  size={15}
                                />
                              </button>
                            </div>
                          ) : (
                            <div className="flex h-[108px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
                              <div className="text-center">
                                <Images
                                  size={20}
                                  className="mx-auto text-slate-400"
                                />

                                <p className="mt-1 text-[10px] text-slate-500">
                                  No image
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* STATUS / ACTION */}

                        <div className="flex items-center justify-start gap-2 md:flex-col md:items-end">
                          {activeSection ===
                          "available" ? (
                            <>
                              <span
                                className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1.5 text-[10px] font-semibold ${
                                  isSelected
                                    ? requiresPhoto &&
                                      !hasPhoto
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-blue-50 text-blue-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {isSelected
                                  ? requiresPhoto &&
                                    !hasPhoto
                                    ? "⚠️ Photo Needed"
                                    : "Selected"
                                  : "Available"}
                              </span>

                              {isSelected &&
                                requiresPhoto &&
                                !hasPhoto && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      newAmenityPhotoInputRefs.current[
                                        amenityKey
                                      ]?.click()
                                    }
                                    className="inline-flex h-7 items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 text-[10px] font-semibold text-amber-700 transition hover:bg-amber-100"
                                  >
                                    <Upload
                                      size={11}
                                    />
                                    Add Photo
                                  </button>
                                )}
                            </>
                          ) : (
                            <span
                              className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1.5 text-[10px] font-semibold ${
                                hasRejectedPhoto
                                  ? "bg-red-50 text-red-700"
                                  : isPhotoPending ||
                                      isPending
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {hasRejectedPhoto
                                ? "Photo Rejected"
                                : isPhotoPending
                                  ? "Photo Pending"
                                  : isPending
                                    ? "Pending Review"
                                    : "Approved"}
                            </span>
                          )}

                          {activeSection ===
                            "my" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  amenity
                                )
                              }
                              className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition ${
                                hasRejectedPhoto
                                  ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                  : "border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100"
                              }`}
                            >
                              <Pencil
                                size={13}
                              />

                              {hasRejectedPhoto
                                ? "Re-upload"
                                : "Edit"}
                            </button>
                          )}

                          {activeSection ===
                            "pending" &&
                            amenity?.isDraftPending && (
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => {
                                  const key =
                                    amenity?.amenityCode ??
                                    amenity?.code ??
                                    amenity?.id;

                                  const selectedPhoto =
                                    newAmenityPhotos[
                                      key
                                    ]?.previewUrl;

                                  if (
                                    selectedPhoto
                                  ) {
                                    URL.revokeObjectURL(
                                      selectedPhoto
                                    );
                                  }

                                  setNewAmenityPhotos(
                                    (prev) => {
                                      const next = {
                                        ...prev,
                                      };
                                      delete next[
                                        key
                                      ];
                                      return next;
                                    }
                                  );

                                  setPendingAmenities(
                                    (prev) =>
                                      prev.filter(
                                        (item) =>
                                          String(
                                            item?.amenityCode ??
                                              item?.code ??
                                              item?.id
                                          ) !==
                                          String(key)
                                      )
                                  );

                                  setAvailableAmenities(
                                    (prev) => {
                                      const alreadyExists =
                                        prev.some(
                                          (item) =>
                                            String(
                                              item?.amenityCode ??
                                                item?.code ??
                                                item?.id
                                            ) ===
                                            String(key)
                                        );

                                      return alreadyExists
                                        ? prev
                                        : [
                                            ...prev,
                                            {
                                              ...amenity,
                                              approvalStatus:
                                                "AVAILABLE",
                                              status:
                                                "AVAILABLE",
                                              requestStatus:
                                                "AVAILABLE",
                                              isDraftPending:
                                                false,
                                              photo: null,
                                              photoStatus:
                                                null,
                                            },
                                          ];
                                    }
                                  );

                                  setSelectedToAdd(
                                    (prev) => {
                                      const next = {
                                        ...prev,
                                      };
                                      delete next[
                                        key
                                      ];
                                      return next;
                                    }
                                  );
                                }}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                              >
                                <X
                                  size={13}
                                />
                                Remove
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}

              {filteredAmenities.length ===
                0 && (
                <div className="flex min-h-[280px] flex-col items-center justify-center px-5 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    {activeSection ===
                    "pending" ? (
                      <Clock3
                        size={23}
                      />
                    ) : (
                      <CircleHelp
                        size={23}
                      />
                    )}
                  </div>

                  <h3 className="mt-3 text-sm font-semibold text-slate-700">
                    {activeSection ===
                    "my"
                      ? "No approved amenities yet"
                      : activeSection ===
                          "available"
                        ? "No remaining amenities to add"
                        : "No pending amenity requests"}
                  </h3>

                  <p className="mt-1 max-w-sm text-xs text-slate-400">
                    {activeSection ===
                    "my"
                      ? "Amenities approved for your hostel will appear here."
                      : activeSection ===
                          "available"
                        ? "Amenities not yet added to your hostel will appear here for you to request."
                        : "New amenity requests will remain here until the admin reviews them."}
                  </p>
                </div>
              )}
            </section>

            {/* RIGHT COLUMN */}

            <aside className="space-y-4">
              <InfoCard
                icon={
                  <Info size={17} />
                }
                iconClass="bg-blue-50 text-blue-600"
                title="Amenity Workflow"
              >
                <p>
                  Use My Amenities for
                  amenities already approved
                  for your hostel.
                </p>

                <CheckLine>
                  Remaining Amenities contains amenities not yet added or requested for your hostel.
                </CheckLine>

                <CheckLine>
                  Selected amenities with photos are sent to admin for review.
                </CheckLine>

                <CheckLine>
                  Approved requests automatically move to My Amenities.
                </CheckLine>
              </InfoCard>

              <InfoCard
                icon={
                  <Images size={17} />
                }
                iconClass="bg-amber-50 text-amber-600"
                title="Photo Guidelines"
              >
                <Guideline>
                  One clear photo per amenity
                </Guideline>

                <Guideline>
                  Supported formats: JPG, PNG, WEBP
                </Guideline>

                <Guideline>
                  Maximum size: 10MB per photo
                </Guideline>

                <Guideline>
                  Photo must represent the actual amenity at your hostel
                </Guideline>

                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/50 p-2.5">
                  <p className="text-[10px] font-semibold text-amber-700">
                    📸 Photo Required for 14 Amenities
                  </p>

                  <p className="mt-0.5 text-[9px] text-amber-600">
                    AC, Fan, Attached Bathroom, Geyser, Study Table, Wardrobe, Balcony, CCTV, Fire Safety, Power Backup, Parking, Washing Machine, Refrigerator, TV
                  </p>
                </div>

                <div className="mt-2 rounded-lg border border-red-200 bg-red-50/50 p-2.5">
                  <p className="text-[10px] font-semibold text-red-700">
                    ⚠️ Rejected Photos
                  </p>

                  <p className="mt-0.5 text-[9px] text-red-600">
                    If your photo is rejected, you'll see a red banner with the admin's reason. Click "Re-upload" to submit a new image.
                  </p>
                </div>
              </InfoCard>

              <InfoCard
                icon={
                  <CircleHelp size={17} />
                }
                iconClass="bg-violet-50 text-violet-600"
                title="Need Help?"
              >
                <p>
                  Approved amenities become part
                  of your hostel listing. Pending
                  requests stay private until admin
                  approval.
                </p>

                <button
                  type="button"
                  className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-blue-600 hover:bg-slate-50"
                >
                  View Guide
                  <ExternalLink
                    size={13}
                  />
                </button>
              </InfoCard>
            </aside>
          </div>

          </div>

        </div>
      </main>

      {/* FULLSCREEN IMAGE PREVIEW */}

      {previewImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5"
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
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-800 shadow-lg"
          >
            <X size={20} />
          </button>

          <div
            className="relative max-h-[92vh] max-w-[92vw]"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <img
              src={
                previewImage.src
              }
              alt={
                previewImage.name
              }
              className="max-h-[88vh] max-w-[88vw] rounded-xl object-contain shadow-2xl"
            />

            <div className="absolute bottom-3 left-3 rounded-lg bg-black/65 px-3 py-2 text-xs font-medium text-white">
              {
                previewImage.name
              }
            </div>
          </div>
        </div>
      )}

      {/* EDIT / REPLACE IMAGE MODAL */}

      {editingAmenity && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => {
            if (!saving) {
              setEditingAmenity(
                null
              );
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Pencil
                    size={19}
                  />
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  {editingAmenity.hasRejectedPhoto
                    ? "Re-upload"
                    : "Edit"}{" "}
                  {
                    editingAmenity.name
                  }
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {editingAmenity.hasRejectedPhoto
                    ? "The admin rejected the previous photo. Please upload a new image that meets the guidelines."
                    : "Replace the original image for this amenity."}
                </p>

                {editingAmenity.hasRejectedPhoto &&
                  editingAmenity.rejectionReason && (
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-red-700">
                        Rejection Reason
                      </p>

                      <p className="mt-0.5 text-xs text-red-700">
                        {
                          editingAmenity.rejectionReason
                        }
                      </p>
                    </div>
                  )}
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  setEditingAmenity(
                    null
                  )
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              {editingAmenity.photo ? (
                <img
                  src={
                    editingAmenity.photo
                  }
                  alt={
                    editingAmenity.name
                  }
                  className="h-56 w-full cursor-pointer object-cover"
                  onClick={() =>
                    openPreview(
                      editingAmenity
                    )
                  }
                />
              ) : editingAmenity.hasRejectedPhoto ? (
                <div className="flex h-56 flex-col items-center justify-center bg-red-50/50">
                  <AlertTriangle
                    size={40}
                    className="text-red-400"
                  />

                  <p className="mt-2 text-sm font-medium text-red-600">
                    Photo was rejected
                  </p>

                  <p className="text-xs text-red-400">
                    Upload a new image below
                  </p>
                </div>
              ) : (
                <div className="flex h-56 items-center justify-center text-slate-400">
                  <Images size={30} />
                </div>
              )}
            </div>

            <p className="mt-3 text-[11px] leading-5 text-slate-500">
              {editingAmenity.hasRejectedPhoto
                ? "Upload a new image that clearly shows this amenity at your hostel. The admin will review it again."
                : "Replacing the image uploads a new photo for this hostel and removes the previous photo record."}
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  setEditingAmenity(
                    null
                  )
                }
                className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={
                  handleOpenReplacePicker
                }
                className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${
                  editingAmenity.hasRejectedPhoto
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {saving ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload
                      size={15}
                    />
                    Re-upload Image
                  </>
                )}
              </button>
            </div>

            <input
              ref={
                replacePhotoInputRef
              }
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={
                handleReplacePhoto
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   SIDEBAR LABEL
============================================================ */

const SidebarLabel = ({
  label,
}) => {
  return (
    <div className="px-3 pb-2 pt-4">
      <p className="text-[9px] font-bold tracking-widest text-slate-400">
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
  badge,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        h-10
        w-full
        items-center
        gap-3
        rounded-lg
        px-3
        text-sm
        transition
        ${
          active
            ? "bg-blue-50 font-semibold text-blue-700"
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
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 px-1.5 text-[10px] font-bold text-blue-700">
          {badge}
        </span>
      ) : null}
    </button>
  );
};

/* ============================================================
   STAT CARD
============================================================ */

const StatCard = ({
  icon,
  iconClass,
  label,
  value,
  supporting,
}) => {
  return (
    <div className="flex items-center gap-4 border-slate-100 p-5 md:border-r last:border-r-0">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconClass}`}
      >
        {icon}
      </div>

      <div>
        <p className="text-[11px] font-medium text-slate-500">
          {label}
        </p>

        <p className="mt-1 text-2xl font-bold text-slate-900">
          {value}
        </p>

        <p className="mt-0.5 text-[10px] text-slate-400">
          {supporting}
        </p>
      </div>
    </div>
  );
};

/* ============================================================
   SECTION TAB
============================================================ */

const SectionTab = ({
  label,
  count,
  active,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-2 text-xs font-medium transition ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
      }`}
    >
      {label}
      {` (${count})`}
    </button>
  );
};

/* ============================================================
   INFO CARD
============================================================ */

const InfoCard = ({
  icon,
  iconClass,
  title,
  children,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${iconClass}`}
        >
          {icon}
        </div>

        <h3 className="text-sm font-bold text-slate-800">
          {title}
        </h3>
      </div>

      <div className="mt-4 text-[11px] leading-5 text-slate-500">
        {children}
      </div>
    </div>
  );
};

/* ============================================================
   CHECK LINE
============================================================ */

const CheckLine = ({
  children,
}) => {
  return (
    <div className="mt-2 flex items-start gap-2">
      <CheckCircle2
        size={13}
        className="mt-[3px] shrink-0 text-emerald-500"
      />
      <span>{children}</span>
    </div>
  );
};

/* ============================================================
   GUIDELINE
============================================================ */

const Guideline = ({
  children,
}) => {
  return (
    <div className="mb-2 flex items-start gap-2">
      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
      <span>{children}</span>
    </div>
  );
};

/* ============================================================
   CAMERA ICON
============================================================ */

const Camera = ({
  size = 16,
  className = "",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
};

export default Amenity;