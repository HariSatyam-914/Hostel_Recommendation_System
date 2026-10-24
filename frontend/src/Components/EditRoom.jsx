import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import {
  X,
  Lock,
  Users,
  Settings,
  Calculator,
  Image as ImageIcon,
  Plus,
  Save,
  Building2,
  DoorOpen,
  BedDouble,
} from "lucide-react";

const API_BASE_URL = "http://localhost:8080";

const MAX_PHOTO_SIZE = 10 * 1024 * 1024;

/*
 * IMPORTANT:
 *
 * Existing photos uploaded during Add Hostel Details
 * are displayed separately.
 *
 * Owner can add maximum 3 NEW photos from Edit Room.
 */
const MAX_NEW_PHOTOS = 3;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const EditRoom = ({
  room,
  onCancel,
  onSave,
}) => {
  /*
   * Expected room shape:
   *
   * {
   *   id: 52,
   *   roomType: "TRIPLE",
   *   roomTypeLabel: "Triple Sharing",
   *   numberOfRooms: 8,
   *   bedsPerRoom: 3,
   *   rentPerBed: 9000,
   *   occupiedRooms: 5,
   *   occupiedBeds: 11,
   *   photos: [
   *     {
   *       id: 101,
   *       photoUrl: "uploads/rooms/..."
   *     }
   *   ]
   * }
   */

  const fileInputRef = useRef(null);

  // ------------------------------------------------------------
  // FORM DATA
  // ------------------------------------------------------------

  const [formData, setFormData] = useState({
    numberOfRooms:
      room?.numberOfRooms ?? 0,

    bedsPerRoom:
      room?.bedsPerRoom ?? 0,

    rentPerBed:
      room?.rentPerBed ?? 0,

    occupiedRooms:
      room?.occupiedRooms ?? 0,

    occupiedBeds:
      room?.occupiedBeds ?? 0,
  });

  // ------------------------------------------------------------
  // NORMALIZE PHOTO URL
  // ------------------------------------------------------------

  const normalizePhotoUrl = (photo) => {
    if (!photo) {
      return null;
    }

    const rawUrl =
      typeof photo === "string"
        ? photo
        : photo?.url ??
          photo?.photoUrl ??
          photo?.photo_url ??
          photo?.fileUrl ??
          photo?.file_url ??
          photo?.filePath ??
          photo?.file_path ??
          photo?.path ??
          null;

    if (!rawUrl) {
      return null;
    }

    const value = String(rawUrl).trim();

    if (!value) {
      return null;
    }

    /*
     * Already a complete URL.
     */
    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("data:")
    ) {
      return value;
    }

    /*
     * Relative backend path.
     *
     * Example:
     * uploads/rooms/33/68/file.jpg
     */
    return `${API_BASE_URL}/${value.replace(
      /^\/+/,
      ""
    )}`;
  };

  // ------------------------------------------------------------
  // EXISTING PHOTOS
  // ------------------------------------------------------------

  const [existingPhotos, setExistingPhotos] =
    useState(() => {
      const photos = Array.isArray(
        room?.photos
      )
        ? room.photos
        : [];

      return photos
        .map((photo, index) => {
          /*
           * Photo may already be a URL string.
           */
          if (
            typeof photo ===
            "string"
          ) {
            const photoUrl =
              normalizePhotoUrl(
                photo
              );

            if (!photoUrl) {
              return null;
            }

            return {
              id:
                `existing-${index}-${photo}`,
              url: photoUrl,
              originalId: null,
            };
          }

          if (!photo) {
            return null;
          }

          const photoId =
            photo?.id ??
            photo?.photoId ??
            photo?.photo_id ??
            null;

          const photoUrl =
            normalizePhotoUrl(
              photo
            );

          if (!photoUrl) {
            return null;
          }

          return {
            id:
              photoId ??
              `existing-${index}`,
            url: photoUrl,
            originalId:
              photoId,
          };
        })
        .filter(Boolean);
    });

  // ------------------------------------------------------------
  // NEW PHOTOS
  // ------------------------------------------------------------

  const [newPhotos, setNewPhotos] =
    useState([]);

  // ------------------------------------------------------------
  // PREVIEW
  // ------------------------------------------------------------

  const [previewPhoto, setPreviewPhoto] =
    useState(null);

  // ------------------------------------------------------------
  // ERRORS
  // ------------------------------------------------------------

  const [errors, setErrors] =
    useState({});

  // ------------------------------------------------------------
  // SAVING
  // ------------------------------------------------------------

  const [isSaving, setIsSaving] =
    useState(false);

  // ------------------------------------------------------------
  // CLEANUP NEW PHOTO PREVIEWS
  // ------------------------------------------------------------

  useEffect(() => {
    return () => {
      newPhotos.forEach(
        (photo) => {
          if (
            photo?.previewUrl
          ) {
            URL.revokeObjectURL(
              photo.previewUrl
            );
          }
        }
      );
    };
  }, [newPhotos]);

  // ------------------------------------------------------------
  // CALCULATED VALUES
  // ------------------------------------------------------------

  const totalBeds = useMemo(() => {
    return (
      Number(
        formData.numberOfRooms ||
          0
      ) *
      Number(
        formData.bedsPerRoom ||
          0
      )
    );
  }, [
    formData.numberOfRooms,
    formData.bedsPerRoom,
  ]);

  const availableRooms =
    useMemo(() => {
      return Math.max(
        Number(
          formData.numberOfRooms ||
            0
        ) -
          Number(
            formData.occupiedRooms ||
              0
          ),
        0
      );
    }, [
      formData.numberOfRooms,
      formData.occupiedRooms,
    ]);

  const availableBeds =
    useMemo(() => {
      return Math.max(
        totalBeds -
          Number(
            formData.occupiedBeds ||
              0
          ),
        0
      );
    }, [
      totalBeds,
      formData.occupiedBeds,
    ]);

  const occupancyRate =
    useMemo(() => {
      if (totalBeds <= 0) {
        return 0;
      }

      return (
        (Number(
          formData.occupiedBeds ||
            0
        ) /
          totalBeds) *
        100
      );
    }, [
      totalBeds,
      formData.occupiedBeds,
    ]);

  // ------------------------------------------------------------
  // INPUT HANDLERS
  // ------------------------------------------------------------

  const handleChange = (
    field,
    value
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
      occupied: "",
      save: "",
    }));
  };

  // ------------------------------------------------------------
  // PHOTO SELECT
  // ------------------------------------------------------------

  const handlePhotoSelect = (
    event
  ) => {
    const files = Array.from(
      event.target.files || []
    );

    if (files.length === 0) {
      event.target.value = "";
      return;
    }

    /*
     * IMPORTANT:
     *
     * Existing photos do NOT count against
     * the maximum of 3 NEW photos.
     *
     * Owner can add maximum 3 new photos.
     */
    const remainingNewSlots =
      MAX_NEW_PHOTOS -
      newPhotos.length;

    if (remainingNewSlots <= 0) {
      setErrors((prev) => ({
        ...prev,
        photos:
          "You can add a maximum of 3 new photos.",
      }));

      event.target.value = "";
      return;
    }

    const filesToProcess =
      files.slice(
        0,
        remainingNewSlots
      );

    const validFiles = [];
    const photoErrors = [];

    if (
      files.length >
      remainingNewSlots
    ) {
      photoErrors.push(
        "You can add a maximum of 3 new photos."
      );
    }

    filesToProcess.forEach(
      (file) => {
        // ------------------------------------------------------
        // IMAGE TYPE
        // ------------------------------------------------------

        if (
          !ALLOWED_IMAGE_TYPES.includes(
            file.type
          )
        ) {
          photoErrors.push(
            `${file.name}: only JPG, PNG or WEBP images are allowed.`
          );

          return;
        }

        // ------------------------------------------------------
        // IMAGE SIZE
        // ------------------------------------------------------

        if (
          file.size >
          MAX_PHOTO_SIZE
        ) {
          photoErrors.push(
            `${file.name}: image size cannot exceed 10 MB.`
          );

          return;
        }

        // ------------------------------------------------------
        // ADD FILE
        // ------------------------------------------------------

        validFiles.push({
          id:
            `${file.name}-${file.lastModified}-${Math.random()}`,
          file,
          previewUrl:
            URL.createObjectURL(
              file
            ),
        });
      }
    );

    setNewPhotos(
      (prev) => [
        ...prev,
        ...validFiles,
      ]
    );

    setErrors((prev) => ({
      ...prev,
      photos:
        photoErrors.length > 0
          ? photoErrors.join(" ")
          : "",
    }));

    event.target.value = "";
  };

  // ------------------------------------------------------------
  // REMOVE EXISTING PHOTO
  // ------------------------------------------------------------

  const removeExistingPhoto = (
    photoId
  ) => {
    setExistingPhotos(
      (prev) =>
        prev.filter(
          (photo) =>
            photo.id !==
            photoId
        )
    );

    setErrors((prev) => ({
      ...prev,
      photos: "",
      save: "",
    }));
  };

  // ------------------------------------------------------------
  // REMOVE NEW PHOTO
  // ------------------------------------------------------------

  const removeNewPhoto = (
    photoId
  ) => {
    setNewPhotos((prev) => {
      const photoToRemove =
        prev.find(
          (photo) =>
            photo.id ===
            photoId
        );

      if (
        photoToRemove?.previewUrl
      ) {
        URL.revokeObjectURL(
          photoToRemove.previewUrl
        );
      }

      return prev.filter(
        (photo) =>
          photo.id !== photoId
      );
    });

    setErrors((prev) => ({
      ...prev,
      photos: "",
      save: "",
    }));
  };

  // ------------------------------------------------------------
  // VALIDATION
  // ------------------------------------------------------------

  const validateForm = () => {
    const nextErrors = {};

    const totalRooms =
      Number(
        formData.numberOfRooms
      );

    const bedsPerRoom =
      Number(
        formData.bedsPerRoom
      );

    const rentPerBed =
      Number(
        formData.rentPerBed
      );

    const occupiedRooms =
      Number(
        formData.occupiedRooms
      );

    const occupiedBeds =
      Number(
        formData.occupiedBeds
      );

    // ----------------------------------------------------------
    // TOTAL ROOMS
    // ----------------------------------------------------------

    if (
      !Number.isInteger(
        totalRooms
      ) ||
      totalRooms <= 0
    ) {
      nextErrors.numberOfRooms =
        "Total rooms must be greater than 0.";
    }

    // ----------------------------------------------------------
    // BEDS PER ROOM
    // ----------------------------------------------------------

    if (
      !Number.isInteger(
        bedsPerRoom
      ) ||
      bedsPerRoom <= 0
    ) {
      nextErrors.bedsPerRoom =
        "Beds per room must be greater than 0.";
    }

    // ----------------------------------------------------------
    // RENT
    // ----------------------------------------------------------

    if (
      Number.isNaN(
        rentPerBed
      ) ||
      rentPerBed <= 0
    ) {
      nextErrors.rentPerBed =
        "Rent per bed must be greater than 0.";
    }

    // ----------------------------------------------------------
    // OCCUPIED ROOMS
    // ----------------------------------------------------------

    if (
      !Number.isInteger(
        occupiedRooms
      ) ||
      occupiedRooms < 0
    ) {
      nextErrors.occupiedRooms =
        "Occupied rooms cannot be negative.";
    }

    // ----------------------------------------------------------
    // OCCUPIED BEDS
    // ----------------------------------------------------------

    if (
      !Number.isInteger(
        occupiedBeds
      ) ||
      occupiedBeds < 0
    ) {
      nextErrors.occupiedBeds =
        "Occupied beds cannot be negative.";
    }

    // ----------------------------------------------------------
    // OCCUPIED ROOMS <= TOTAL ROOMS
    // ----------------------------------------------------------

    if (
      totalRooms > 0 &&
      occupiedRooms >
        totalRooms
    ) {
      nextErrors.occupiedRooms =
        "Occupied rooms cannot exceed total rooms.";
    }

    // ----------------------------------------------------------
    // TOTAL BEDS
    // ----------------------------------------------------------

    const calculatedTotalBeds =
      totalRooms *
      bedsPerRoom;

    // ----------------------------------------------------------
    // OCCUPIED BEDS <= TOTAL BEDS
    // ----------------------------------------------------------

    if (
      calculatedTotalBeds >
        0 &&
      occupiedBeds >
        calculatedTotalBeds
    ) {
      nextErrors.occupiedBeds =
        "Occupied beds cannot exceed total beds.";
    }

    // ----------------------------------------------------------
    // OCCUPIED BEDS >= OCCUPIED ROOMS
    // ----------------------------------------------------------

    if (
      occupiedRooms > 0 &&
      occupiedBeds <
        occupiedRooms
    ) {
      nextErrors.occupied =
        "Occupied beds must be at least equal to occupied rooms.";
    }

    // ----------------------------------------------------------
    // NEW PHOTO COUNT
    // ----------------------------------------------------------

    if (
      newPhotos.length >
      MAX_NEW_PHOTOS
    ) {
      nextErrors.photos =
        "You can add a maximum of 3 new photos.";
    }

    setErrors(
      nextErrors
    );

    return (
      Object.keys(
        nextErrors
      ).length === 0
    );
  };

  // ------------------------------------------------------------
  // SAVE
  // ------------------------------------------------------------

  const handleSave = async () => {
    if (
      !validateForm()
    ) {
      return;
    }

    if (!room?.id) {
      setErrors((prev) => ({
        ...prev,
        save:
          "Room ID is missing. Unable to save changes.",
      }));

      return;
    }

    try {
      setIsSaving(true);

      // ========================================================
      // FIND DELETED EXISTING PHOTO IDS
      // ========================================================

      const originalPhotos =
        Array.isArray(
          room?.photos
        )
          ? room.photos
          : [];

      const deletedPhotoIds =
        originalPhotos
          .map((photo) => {
            if (
              typeof photo ===
              "string"
            ) {
              return null;
            }

            return (
              photo?.id ??
              photo?.photoId ??
              photo?.photo_id ??
              null
            );
          })
          .filter(
            (photoId) =>
              photoId !==
                null &&
              photoId !==
                undefined
          )
          .filter(
            (originalId) =>
              !existingPhotos.some(
                (photo) =>
                  String(
                    photo.originalId ??
                      photo.id
                  ) ===
                  String(
                    originalId
                  )
              )
          );

      // ========================================================
      // PAYLOAD
      // ========================================================

      const payload = {
        roomId:
          room.id,

        roomType:
          room.roomType,

        numberOfRooms:
          Number(
            formData.numberOfRooms
          ),

        bedsPerRoom:
          Number(
            formData.bedsPerRoom
          ),

        rentPerBed:
          Number(
            formData.rentPerBed
          ),

        occupiedRooms:
          Number(
            formData.occupiedRooms
          ),

        occupiedBeds:
          Number(
            formData.occupiedBeds
          ),

        deletedPhotoIds,

        newPhotos:
          newPhotos.map(
            (photo) =>
              photo.file
          ),
      };

      console.log(
        "========== EDIT ROOM PAYLOAD =========="
      );

      console.log(
        "Room ID:",
        payload.roomId
      );

      console.log(
        "Room Type:",
        payload.roomType
      );

      console.log(
        "Number Of Rooms:",
        payload.numberOfRooms
      );

      console.log(
        "Beds Per Room:",
        payload.bedsPerRoom
      );

      console.log(
        "Rent Per Bed:",
        payload.rentPerBed
      );

      console.log(
        "Occupied Rooms:",
        payload.occupiedRooms
      );

      console.log(
        "Occupied Beds:",
        payload.occupiedBeds
      );

      console.log(
        "Deleted Photo IDs:",
        payload.deletedPhotoIds
      );

      console.log(
        "New Photos:",
        payload.newPhotos
      );

      console.log(
        "Existing Photos:",
        existingPhotos
      );

      console.log(
        "Existing Photo Count:",
        existingPhotos.length
      );

      console.log(
        "New Photo Count:",
        newPhotos.length
      );

      console.log(
        "========================================"
      );

      /*
       * EditRoom sends the payload to Rooms.jsx.
       *
       * Rooms.jsx handles the actual PUT request.
       */
      await onSave?.(
        payload
      );

    } catch (error) {
      console.error(
        "Failed to save room:",
        error
      );

      setErrors((prev) => ({
        ...prev,
        save:
          error?.message ||
          "Failed to save room changes. Please try again.",
      }));
    } finally {
      setIsSaving(
        false
      );
    }
  };

  // ------------------------------------------------------------
  // INPUT STYLES
  // ------------------------------------------------------------

  const inputBase =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-[15px] text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  const errorInput =
    "border-red-400 focus:border-red-500 focus:ring-red-100";

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">

      <div className="mx-auto max-w-6xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 md:px-8">

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              EDIT ROOM
            </h1>

            <div className="mt-2 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600">

                <Users
                  size={20}
                  className="text-white"
                />

              </div>

              <span className="text-2xl font-semibold text-slate-800">
                {room?.roomTypeLabel ||
                  room?.roomType ||
                  "Room"}
              </span>

            </div>
          </div>

          <button
            type="button"
            onClick={
              onCancel
            }
            disabled={
              isSaving
            }
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >

            <X size={18} />

            Cancel

          </button>

        </div>

        <div className="space-y-5 p-5 md:p-6">

          {/* ================================================== */}
          {/* ROOM CONFIGURATION */}
          {/* ================================================== */}

          <section className="overflow-hidden rounded-lg border border-slate-200">

            <div className="flex items-center gap-3 border-b border-slate-200 bg-indigo-50/70 px-4 py-3">

              <Settings
                size={21}
                className="text-indigo-600"
              />

              <h2 className="text-lg font-semibold text-slate-800">
                ROOM CONFIGURATION
              </h2>

            </div>

            <div className="space-y-5 p-5">

              {/* Room type */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Room Type
                </label>

                <div className="flex overflow-hidden rounded-lg border border-slate-300 bg-slate-100">

                  <input
                    type="text"
                    value={
                      room?.roomTypeLabel ||
                      room?.roomType ||
                      ""
                    }
                    disabled
                    className="w-full bg-transparent px-4 py-3 text-[15px] text-slate-500 outline-none"
                  />

                  <div className="flex items-center justify-center border-l border-slate-300 px-4">

                    <Lock
                      size={18}
                      className="text-slate-500"
                    />

                  </div>

                </div>

                <p className="mt-1.5 text-xs text-slate-500">
                  Room type cannot be changed after creation.
                </p>

              </div>

              {/* Total Rooms + Beds Per Room */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* Total Rooms */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Total Rooms
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      formData.numberOfRooms
                    }
                    onChange={(e) =>
                      handleChange(
                        "numberOfRooms",
                        e.target.value
                      )
                    }
                    className={`${inputBase} ${
                      errors.numberOfRooms
                        ? errorInput
                        : ""
                    }`}
                  />

                  {errors.numberOfRooms && (
                    <p className="mt-1 text-xs text-red-600">
                      {
                        errors.numberOfRooms
                      }
                    </p>
                  )}

                </div>

                {/* Beds Per Room */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Beds per Room
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      formData.bedsPerRoom
                    }
                    onChange={(e) =>
                      handleChange(
                        "bedsPerRoom",
                        e.target.value
                      )
                    }
                    className={`${inputBase} ${
                      errors.bedsPerRoom
                        ? errorInput
                        : ""
                    }`}
                  />

                  {errors.bedsPerRoom && (
                    <p className="mt-1 text-xs text-red-600">
                      {
                        errors.bedsPerRoom
                      }
                    </p>
                  )}

                </div>

              </div>

              {/* Rent */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Rent per Bed / Month
                </label>

                <div className="flex overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">

                  <div className="flex items-center px-4 text-slate-600">
                    ₹
                  </div>

                  <input
                    type="number"
                    min="0"
                    value={
                      formData.rentPerBed
                    }
                    onChange={(e) =>
                      handleChange(
                        "rentPerBed",
                        e.target.value
                      )
                    }
                    className="w-full px-1 py-3 text-[15px] outline-none"
                  />

                </div>

                {errors.rentPerBed && (
                  <p className="mt-1 text-xs text-red-600">
                    {
                      errors.rentPerBed
                    }
                  </p>
                )}

              </div>

            </div>

          </section>

          {/* ================================================== */}
          {/* CURRENT OCCUPANCY */}
          {/* ================================================== */}

          <section className="overflow-hidden rounded-lg border border-slate-200">

            <div className="flex items-center gap-3 border-b border-slate-200 bg-green-50/70 px-4 py-3">

              <Users
                size={21}
                className="text-green-600"
              />

              <h2 className="text-lg font-semibold text-slate-800">
                CURRENT OCCUPANCY
              </h2>

            </div>

            <div className="space-y-5 p-5">

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* Occupied Rooms */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Occupied Rooms
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      formData.occupiedRooms
                    }
                    onChange={(e) =>
                      handleChange(
                        "occupiedRooms",
                        e.target.value
                      )
                    }
                    className={`${inputBase} ${
                      errors.occupiedRooms ||
                      errors.occupied
                        ? errorInput
                        : ""
                    }`}
                  />

                  {errors.occupiedRooms && (
                    <p className="mt-1 text-xs text-red-600">
                      {
                        errors.occupiedRooms
                      }
                    </p>
                  )}

                </div>

                {/* Occupied Beds */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Occupied Beds
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      formData.occupiedBeds
                    }
                    onChange={(e) =>
                      handleChange(
                        "occupiedBeds",
                        e.target.value
                      )
                    }
                    className={`${inputBase} ${
                      errors.occupiedBeds ||
                      errors.occupied
                        ? errorInput
                        : ""
                    }`}
                  />

                  {errors.occupiedBeds && (
                    <p className="mt-1 text-xs text-red-600">
                      {
                        errors.occupiedBeds
                      }
                    </p>
                  )}

                </div>

              </div>

              {errors.occupied && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {
                    errors.occupied
                  }
                </div>
              )}

            </div>

          </section>

          {/* ================================================== */}
          {/* INVENTORY SUMMARY */}
          {/* ================================================== */}

          <section className="overflow-hidden rounded-lg border border-slate-200">

            <div className="flex items-center justify-between border-b border-slate-200 bg-blue-50/70 px-4 py-3">

              <div className="flex items-center gap-3">

                <Calculator
                  size={21}
                  className="text-blue-600"
                />

                <h2 className="text-lg font-semibold text-slate-800">
                  INVENTORY SUMMARY
                </h2>

              </div>

              <span className="rounded-md bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                AUTO CALCULATED
              </span>

            </div>

            <div className="space-y-5 p-5">

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <InventoryCard
                  title="Total Rooms"
                  value={
                    formData.numberOfRooms
                  }
                  icon={
                    <Building2
                      size={23}
                    />
                  }
                  valueClass="text-blue-600"
                  iconClass="bg-blue-50 text-blue-600"
                />

                <InventoryCard
                  title="Available Rooms"
                  value={
                    availableRooms
                  }
                  icon={
                    <DoorOpen
                      size={23}
                    />
                  }
                  valueClass="text-green-600"
                  iconClass="bg-green-50 text-green-600"
                />

                <InventoryCard
                  title="Total Beds"
                  value={
                    totalBeds
                  }
                  icon={
                    <BedDouble
                      size={23}
                    />
                  }
                  valueClass="text-blue-600"
                  iconClass="bg-blue-50 text-blue-600"
                />

                <InventoryCard
                  title="Available Beds"
                  value={
                    availableBeds
                  }
                  icon={
                    <BedDouble
                      size={23}
                    />
                  }
                  valueClass="text-green-600"
                  iconClass="bg-green-50 text-green-600"
                />

              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5">

                <div className="mb-4 flex items-center justify-between">

                  <span className="text-base font-semibold text-slate-700">
                    Occupancy Rate
                  </span>

                  <span className="text-2xl font-bold text-slate-800">
                    {
                      occupancyRate.toFixed(
                        2
                      )
                    }%
                  </span>

                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">

                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        occupancyRate,
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>

            </div>

          </section>

          {/* ================================================== */}
          {/* ROOM PHOTOS */}
          {/* ================================================== */}

          <section className="overflow-hidden rounded-lg border border-slate-200">

            <div className="flex items-center gap-3 border-b border-slate-200 bg-amber-50/70 px-4 py-3">

              <ImageIcon
                size={21}
                className="text-amber-600"
              />

              <h2 className="text-lg font-semibold text-slate-800">
                ROOM PHOTOS
              </h2>

            </div>

            <div className="p-5">

              <h3 className="mb-4 text-sm font-semibold text-slate-700">
                Existing Photos
              </h3>

              {/* ================================================== */}
              {/* EXISTING PHOTOS FROM ADD HOSTEL DETAILS */}
              {/* ================================================== */}

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

                {existingPhotos.map(
                  (photo) => (
                    <div
                      key={
                        photo.id
                      }
                      className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                    >

                      <img
                        src={
                          photo.url
                        }
                        alt="Room"
                        onClick={() =>
                          setPreviewPhoto(
                            photo.url
                          )
                        }
                        onError={(event) => {
                          console.error(
                            "Failed to load existing room photo:",
                            {
                              photo,
                              url:
                                photo.url,
                            }
                          );

                          event.currentTarget.style.display =
                            "none";
                        }}
                        className="h-40 w-full cursor-pointer object-cover transition group-hover:scale-105"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeExistingPhoto(
                            photo.id
                          )
                        }
                        disabled={
                          isSaving
                        }
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Delete photo"
                      >

                        <X
                          size={18}
                          className="text-slate-700"
                        />

                      </button>

                    </div>
                  )
                )}

                {/* ================================================== */}
                {/* NEW PHOTOS */}
                {/* ================================================== */}

                {newPhotos.map(
                  (photo) => (
                    <div
                      key={
                        photo.id
                      }
                      className="group relative overflow-hidden rounded-lg border border-indigo-200 bg-indigo-50"
                    >

                      <img
                        src={
                          photo.previewUrl
                        }
                        alt="New room"
                        onClick={() =>
                          setPreviewPhoto(
                            photo.previewUrl
                          )
                        }
                        className="h-40 w-full cursor-pointer object-cover transition group-hover:scale-105"
                      />

                      <div className="absolute left-2 top-2 rounded-md bg-indigo-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                        New
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeNewPhoto(
                            photo.id
                          )
                        }
                        disabled={
                          isSaving
                        }
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                        title="Remove photo"
                      >

                        <X
                          size={18}
                          className="text-slate-700"
                        />

                      </button>

                    </div>
                  )
                )}

              </div>

              {/* ================================================== */}
              {/* UPLOAD NEW PHOTOS */}
              {/* ================================================== */}

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={
                  isSaving ||
                  newPhotos.length >=
                    MAX_NEW_PHOTOS
                }
                className="mt-5 flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 px-5 py-7 transition hover:border-indigo-400 hover:bg-indigo-50/30 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50"
              >

                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">

                  <Plus
                    size={21}
                    className="text-indigo-600"
                  />

                </div>

                <span className="text-base font-semibold text-indigo-600">

                  {newPhotos.length >=
                  MAX_NEW_PHOTOS
                    ? "Maximum 3 New Photos Reached"
                    : "Add New Room Photos"}

                </span>

                <span className="mt-1 text-xs text-slate-500">
                  Add up to 3 new photos • JPG, PNG or WEBP • Max 10MB each
                </span>

                <span className="mt-2 text-[11px] font-medium text-slate-400">
                  {newPhotos.length} /{" "}
                  {MAX_NEW_PHOTOS}{" "}
                  new photos selected
                </span>

              </button>

              <input
                ref={
                  fileInputRef
                }
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={
                  handlePhotoSelect
                }
              />

              {errors.photos && (
                <p className="mt-2 text-sm text-red-600">
                  {
                    errors.photos
                  }
                </p>
              )}

            </div>

          </section>

          {/* ================================================== */}
          {/* SAVE ERROR */}
          {/* ================================================== */}

          {errors.save && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {
                errors.save
              }
            </div>
          )}

        </div>

        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-5 py-5 md:px-6">

          <button
            type="button"
            onClick={
              onCancel
            }
            disabled={
              isSaving
            }
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={
              handleSave
            }
            disabled={
              isSaving
            }
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <Save size={18} />

            {isSaving
              ? "Saving..."
              : "Save Changes"}

          </button>

        </div>

      </div>

      {/* ================================================== */}
      {/* FULLSCREEN PHOTO PREVIEW */}
      {/* ================================================== */}

      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() =>
            setPreviewPhoto(null)
          }
        >

          <button
            type="button"
            onClick={() =>
              setPreviewPhoto(null)
            }
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/90"
          >

            <X
              size={22}
              className="text-slate-800"
            />

          </button>

          <img
            src={
              previewPhoto
            }
            alt="Room preview"
            onClick={(e) =>
              e.stopPropagation()
            }
            className="max-h-[92vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
          />

        </div>
      )}

    </div>
  );
};

// ============================================================
// INVENTORY CARD
// ============================================================

const InventoryCard = ({
  title,
  value,
  icon,
  valueClass,
  iconClass,
}) => {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5">

      <div>

        <p className="text-sm font-semibold text-slate-700">
          {title}
        </p>

        <p
          className={`mt-2 text-3xl font-bold ${valueClass}`}
        >
          {Number(
            value || 0
          ).toLocaleString(
            "en-IN"
          )}
        </p>

      </div>

      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full ${iconClass}`}
      >
        {icon}
      </div>

    </div>
  );
};

export default EditRoom;