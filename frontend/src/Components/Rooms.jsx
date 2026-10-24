import React, { useEffect, useMemo, useState, useRef } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  Building2,
  BedDouble,
  Images,
  MessageSquare,
  Star,
  BarChart3,
  Settings,
  HelpCircle,
  ExternalLink,
  Plus,
  Pencil,
  MoreVertical,
  TrendingUp,
  LayoutGrid,
  Users,
  ShieldCheck,
  UserCircle,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Loader2,
  Bell,
  Utensils,
  Upload,
} from "lucide-react";

import EditRoom from "./EditRoom";

const API_BASE_URL = "http://localhost:8080";

// ============================================================
// SIDEBAR COMPONENTS
// ============================================================

const SidebarLabel = ({ label }) => (
  <div className="px-3 pt-4 pb-2">
    <p className="text-[9px] font-bold tracking-widest text-slate-400">
      {label}
    </p>
  </div>
);

const SidebarItem = ({ icon, label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      w-full h-10 px-3 rounded-lg flex items-center gap-3 text-sm transition
      ${
        active
          ? "bg-blue-50 text-blue-700 font-semibold"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }
    `}
  >
    <span className={active ? "text-blue-600" : "text-slate-500"}>
      {icon}
    </span>

    <span className="flex-1 text-left">{label}</span>
  </button>
);

// ============================================================
// ROOM HELPERS
// ============================================================

function getRoomId(room) {
  return (
    room?.id ??
    room?.roomId ??
    room?.room_id ??
    room?.roomID ??
    room?.hostelRoomId ??
    room?.hostel_room_id ??
    null
  );
}

function getRoomType(room) {
  return (
    room?.roomType ??
    room?.room_type ??
    room?.type ??
    "Room"
  );
}

// ============================================================
// NEW: ROOM COOLING TYPE
// ============================================================

function getCoolingType(room) {
  const value =
    room?.coolingType ??
    room?.cooling_type ??
    room?.roomCoolingType ??
    room?.room_cooling_type ??
    room?.acType ??
    room?.ac_type ??
    null;

  if (!value) {
    return "NON_AC";
  }

  const normalized = String(value)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (
    normalized === "AC" ||
    normalized === "AIR_CONDITIONED" ||
    normalized === "AIR_CONDITIONING"
  ) {
    return "AC";
  }

  if (
    normalized === "NON_AC" ||
    normalized === "NONAC" ||
    normalized === "NON_AIR_CONDITIONED" ||
    normalized === "WITHOUT_AC"
  ) {
    return "NON_AC";
  }

  return normalized;
}

function formatCoolingType(value) {
  const normalized = String(
    value || "NON_AC"
  )
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (normalized === "AC") {
    return "AC";
  }

  return "Non-AC";
}

function getRoomConfigurationKey(room) {
  return `${String(
    getRoomType(room)
  ).trim()}__${String(
    getCoolingType(room)
  ).trim()}`;
}

function getRent(room) {
  return (
    room?.rentPerBed ??
    room?.rent_per_bed ??
    room?.rent ??
    null
  );
}

function getNumberOfRooms(room) {
  return (
    room?.numberOfRooms ??
    room?.number_of_rooms ??
    room?.totalRooms ??
    room?.total_rooms ??
    room?.roomsCount ??
    room?.rooms_count ??
    null
  );
}

function getBedsPerRoom(room) {
  return (
    room?.bedsPerRoom ??
    room?.beds_per_room ??
    room?.sharing ??
    room?.capacityPerRoom ??
    null
  );
}

function getCapacity(room) {
  return (
    room?.capacity ??
    room?.totalBeds ??
    room?.total_beds ??
    room?.beds ??
    null
  );
}

function getOccupied(room) {
  return (
    room?.occupiedBeds ??
    room?.occupied_beds ??
    room?.occupied ??
    null
  );
}

function getOccupiedRooms(room) {
  return (
    room?.occupiedRooms ??
    room?.occupied_rooms ??
    null
  );
}

function getAvailable(room) {
  const capacity = getCapacity(room);
  const occupied = getOccupied(room);

  if (
    capacity !== null &&
    occupied !== null &&
    !Number.isNaN(Number(capacity)) &&
    !Number.isNaN(Number(occupied))
  ) {
    return Math.max(
      Number(capacity) - Number(occupied),
      0
    );
  }

  return (
    room?.availableBeds ??
    room?.available_beds ??
    room?.available ??
    null
  );
}

function getAvailableRooms(room) {
  const totalRooms = getNumberOfRooms(room);
  const occupiedRooms = getOccupiedRooms(room);

  if (
    totalRooms !== null &&
    occupiedRooms !== null &&
    !Number.isNaN(Number(totalRooms)) &&
    !Number.isNaN(Number(occupiedRooms))
  ) {
    return Math.max(
      Number(totalRooms) - Number(occupiedRooms),
      0
    );
  }

  return null;
}

function getStatus(room) {
  const explicitStatus =
    room?.status ??
    room?.availabilityStatus ??
    room?.availability_status ??
    null;

  if (explicitStatus) {
    return String(explicitStatus).toUpperCase();
  }

  const capacity = getCapacity(room);
  const occupied = getOccupied(room);
  const available = getAvailable(room);

  if (
    capacity !== null &&
    occupied !== null &&
    !Number.isNaN(Number(capacity)) &&
    !Number.isNaN(Number(occupied))
  ) {
    if (Number(occupied) >= Number(capacity)) {
      return "FULL";
    }

    if (Number(available) > 0) {
      return Number(occupied) > 0
        ? "PARTIALLY OCCUPIED"
        : "AVAILABLE";
    }
  }

  return "AVAILABLE";
}

// ============================================================
// PHOTO HELPERS
// ============================================================

function extractPhotoUrl(photo) {
  if (!photo) return null;

  const value =
    typeof photo === "string"
      ? photo
      : photo?.fileUrl ??
        photo?.file_url ??
        photo?.photoUrl ??
        photo?.photo_url ??
        photo?.url ??
        photo?.imageUrl ??
        photo?.image_url ??
        photo?.filePath ??
        photo?.file_path ??
        photo?.path ??
        photo?.photo ??
        null;

  if (!value) return null;

  const stringValue = String(value).trim();

  if (
    stringValue.startsWith("http://") ||
    stringValue.startsWith("https://") ||
    stringValue.startsWith("data:")
  ) {
    return stringValue;
  }

  return `${API_BASE_URL}/${stringValue.replace(
    /^\/+/,
    ""
  )}`;
}

function extractRoomIdFromPhoto(photo) {
  if (!photo) return null;

  const directRoomId =
    photo?.roomId ??
    photo?.room_id ??
    photo?.roomID ??
    photo?.hostelRoomId ??
    photo?.hostel_room_id ??
    photo?.room?.id ??
    photo?.room?.roomId ??
    photo?.room?.room_id ??
    null;

  if (
    directRoomId !== null &&
    directRoomId !== undefined &&
    directRoomId !== ""
  ) {
    return String(directRoomId);
  }

  const rawValue =
    typeof photo === "string"
      ? photo
      : photo?.fileUrl ??
        photo?.file_url ??
        photo?.photoUrl ??
        photo?.photo_url ??
        photo?.url ??
        photo?.imageUrl ??
        photo?.image_url ??
        photo?.filePath ??
        photo?.file_path ??
        photo?.path ??
        photo?.photo ??
        "";

  if (!rawValue) return null;

  const path = String(rawValue);

  let match = path.match(
    /uploads\/rooms\/\d+\/(\d+)(?:\/|$)/i
  );

  if (match) {
    return String(match[1]);
  }

  match = path.match(
    /rooms\/\d+\/(\d+)(?:\/|$)/i
  );

  if (match) {
    return String(match[1]);
  }

  return null;
}

function getRoomPhotos(room, photos) {
  if (!room) return [];

  const roomId = getRoomId(room);

  console.log(
    "Finding photos for room:",
    {
      roomId,
      roomType: getRoomType(room),
      coolingType: getCoolingType(room),
      embeddedPhotos: room?.photos,
    }
  );

  if (
    Array.isArray(room?.photos) &&
    room.photos.length > 0
  ) {
    const embeddedPhotos = room.photos
      .map(extractPhotoUrl)
      .filter(Boolean);

    if (embeddedPhotos.length > 0) {
      console.log(
        "Using embedded room photos:",
        {
          roomId,
          coolingType: getCoolingType(room),
          photos: embeddedPhotos,
        }
      );

      return embeddedPhotos;
    }
  }

  if (
    Array.isArray(room?.photoUrls) &&
    room.photoUrls.length > 0
  ) {
    const embeddedPhotoUrls = room.photoUrls
      .map(extractPhotoUrl)
      .filter(Boolean);

    if (embeddedPhotoUrls.length > 0) {
      console.log(
        "Using embedded room photoUrls:",
        {
          roomId,
          coolingType: getCoolingType(room),
          photos: embeddedPhotoUrls,
        }
      );

      return embeddedPhotoUrls;
    }
  }

  if (
    !roomId ||
    !Array.isArray(photos) ||
    photos.length === 0
  ) {
    console.log(
      "No room photo list available:",
      {
        roomId,
        photoCount: Array.isArray(photos)
          ? photos.length
          : 0,
      }
    );

    return [];
  }

  const matchedPhotos = photos
    .filter((photo) => {
      const photoRoomId =
        extractRoomIdFromPhoto(photo);

      const matched =
        photoRoomId !== null &&
        String(photoRoomId) === String(roomId);

      if (matched) {
        console.log(
          "Matched room photo:",
          {
            roomId,
            photoRoomId,
            photo,
          }
        );
      }

      return matched;
    })
    .map(extractPhotoUrl)
    .filter(Boolean);

  console.log(
    "Photos found for room:",
    roomId,
    matchedPhotos
  );

  return matchedPhotos;
}

// ============================================================
// ROOM PHOTO REVIEW HELPERS
// ============================================================

function getPhotoVerificationStatus(photo) {
  return String(
    photo?.verificationStatus ??
      photo?.verification_status ??
      photo?.status ??
      ""
  ).toUpperCase();
}

function getPhotoRejectionReason(photo) {
  return (
    photo?.rejectionReason ??
    photo?.rejection_reason ??
    photo?.reason ??
    ""
  );
}

function getRejectedRoomPhotos(room) {
  if (!room) return [];

  const photos = Array.isArray(room?.photos)
    ? room.photos
    : [];

  return photos.filter(
    (photo) =>
      getPhotoVerificationStatus(photo) ===
      "REJECTED"
  );
}

// ============================================================
// FORMAT HELPERS
// ============================================================

function formatCurrency(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return `₹${number.toLocaleString("en-IN")}`;
}

function formatRoomType(value) {
  if (!value) return "Room";

  return String(value)
    .replace(/\_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

// ============================================================
// STATUS
// ============================================================

function getStatusLabel(status) {
  const normalized = String(
    status || ""
  ).toUpperCase();

  const labels = {
    AVAILABLE: "Available",
    "PARTIALLY OCCUPIED": "Partially Occupied",
    FULL: "Full",
    MAINTENANCE: "Maintenance",
    UNDER_MAINTENANCE: "Under Maintenance",
    VACANT: "Vacant",
  };

  return (
    labels[normalized] ||
    normalized
      .replace(/\_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      )
  );
}

function StatusBadge({ status }) {
  const normalized = String(
    status || ""
  ).toUpperCase();

  let className =
    "bg-slate-100 text-slate-600 border-slate-200";

  if (
    normalized === "AVAILABLE" ||
    normalized === "VACANT"
  ) {
    className =
      "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (
    normalized.includes("PARTIAL") ||
    normalized.includes("VACANC")
  ) {
    className =
      "bg-amber-50 text-amber-700 border-amber-200";
  } else if (normalized === "FULL") {
    className =
      "bg-red-50 text-red-700 border-red-200";
  } else if (
    normalized.includes("MAINTENANCE")
  ) {
    className =
      "bg-slate-100 text-slate-600 border-slate-200";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {getStatusLabel(normalized)}
    </span>
  );
}

// ============================================================
// ROOM IMAGE
// ============================================================

function RoomImage({ src, alt }) {
  const [failed, setFailed] =
    useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <BedDouble
            size={38}
            strokeWidth={1.5}
          />

          <span className="text-xs">
            No room photo
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover transition duration-300"
      onError={() => {
        console.error(
          "Room image failed to load:",
          src
        );

        setFailed(true);
      }}
    />
  );
}

// ============================================================
// METRIC
// ============================================================

function Metric({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        {icon}
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-2xl font-semibold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

function Rooms() {
  const navigate = useNavigate();

  const { hostelId: urlHostelId } =
    useParams();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [hostelData, setHostelData] =
    useState(null);

  const [roomsData, setRoomsData] =
    useState([]);

  const [roomPhotos, setRoomPhotos] =
    useState([]);

  const [loadingHostel, setLoadingHostel] =
    useState(true);

  const [loadingRooms, setLoadingRooms] =
    useState(true);

  const [loadingPhotos, setLoadingPhotos] =
    useState(false);

  const [dashboardData, setDashboardData] =
    useState(null);

  const [refreshTrigger, setRefreshTrigger] =
    useState(0);

  const [profileMenuOpen, setProfileMenuOpen] =
    useState(false);

  const [editingRoom, setEditingRoom] =
    useState(null);

  const [reuploadingPhotoId, setReuploadingPhotoId] =
    useState(null);

  // ==========================================================
  // EDIT ROOM
  // ==========================================================

  const handleEditRoom = (room) => {
    console.log(
      "========== EDIT ROOM =========="
    );

    console.log(
      "Selected room:",
      room
    );

    console.log(
      "Source rooms:",
      room?.sourceRooms
    );

    console.log(
      "================================"
    );

    const sourceRoom =
      room?.sourceRooms?.[0];

    if (!sourceRoom) {
      console.error(
        "No source room found for editing:",
        room
      );

      return;
    }

    setEditingRoom({
      ...sourceRoom,

      roomType:
        sourceRoom.roomType ??
        room.roomType,

      // =====================================================
      // NEW: PRESERVE AC / NON-AC
      // =====================================================

      coolingType:
        getCoolingType(sourceRoom) ??
        getCoolingType(room),

      roomTypeLabel:
        room.displayType,

      numberOfRooms:
        getNumberOfRooms(
          sourceRoom
        ) ??
        room.totalRooms ??
        0,

      bedsPerRoom:
        getBedsPerRoom(
          sourceRoom
        ) ??
        room.bedsPerRoom ??
        0,

      rentPerBed:
        getRent(sourceRoom) ??
        room.rent ??
        0,

      occupiedBeds:
        getOccupied(sourceRoom) ??
        room.occupiedBeds ??
        0,

      occupiedRooms:
        getOccupiedRooms(
          sourceRoom
        ) ??
        room.occupiedRooms ??
        0,

      photos:
        Array.isArray(
          sourceRoom.photos
        )
          ? sourceRoom.photos
          : [],
    });
  };

  // ==========================================================
  // SAVE EDITED ROOM
  // ==========================================================

  const handleSaveEditedRoom =
    async (updatedRoom) => {
      console.log(
        "========== ROOM UPDATE =========="
      );

      console.log(updatedRoom);

      console.log(
        "================================="
      );

      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          throw new Error(
            "No authentication token found."
          );
        }

        if (
          !updatedRoom ||
          !updatedRoom.roomId
        ) {
          throw new Error(
            "Room ID is missing."
          );
        }

        const formDataRequest =
          new FormData();

        const roomRequest = {
          roomType:
            updatedRoom.roomType,

          // =================================================
          // NEW: SAVE AC / NON-AC
          // =================================================

          coolingType:
            getCoolingType(updatedRoom),

          numberOfRooms:
            Number(
              updatedRoom.numberOfRooms
            ),

          bedsPerRoom:
            Number(
              updatedRoom.bedsPerRoom
            ),

          rentPerBed:
            Number(
              updatedRoom.rentPerBed
            ),

          occupiedRooms:
            Number(
              updatedRoom.occupiedRooms
            ),

          occupiedBeds:
            Number(
              updatedRoom.occupiedBeds
            ),

          deletedPhotoIds:
            Array.isArray(
              updatedRoom.deletedPhotoIds
            )
              ? updatedRoom.deletedPhotoIds
              : [],
        };

        console.log(
          "Room request JSON:",
          roomRequest
        );

        formDataRequest.append(
          "room",
          new Blob(
            [
              JSON.stringify(
                roomRequest
              ),
            ],
            {
              type: "application/json",
            }
          )
        );

        const newPhotos =
          Array.isArray(
            updatedRoom.newPhotos
          )
            ? updatedRoom.newPhotos
            : [];

        newPhotos.forEach(
          (file) => {
            if (file instanceof File) {
              formDataRequest.append(
                "photos",
                file
              );
            }
          }
        );

        console.log(
          "New photos:",
          newPhotos
        );

        console.log(
          "Deleted photo IDs:",
          roomRequest.deletedPhotoIds
        );

        const response =
          await fetch(
            `${API_BASE_URL}/api/owner/hostels/rooms/${updatedRoom.roomId}`,
            {
              method: "PUT",

              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },

              body: formDataRequest,
            }
          );

        console.log(
          "Room update API status:",
          response.status
        );

        if (!response.ok) {
          let errorMessage =
            `Failed to update room (${response.status})`;

          try {
            const errorData =
              await response.json();

            console.error(
              "Room update API error:",
              errorData
            );

            errorMessage =
              errorData?.message ||
              errorData?.error ||
              errorMessage;
          } catch {
            try {
              const errorText =
                await response.text();

              if (errorText) {
                console.error(
                  "Room update API error:",
                  errorText
                );

                errorMessage =
                  errorText;
              }
            } catch {
              // Keep default error message
            }
          }

          throw new Error(
            errorMessage
          );
        }

        const updatedResponse =
          await response.json();

        console.log(
          "========== ROOM UPDATE SUCCESS =========="
        );

        console.log(
          "Updated room response:",
          updatedResponse
        );

        console.log(
          "=========================================="
        );

        setEditingRoom(null);

        setRefreshTrigger(
          (prev) => prev + 1
        );
      } catch (error) {
        console.error(
          "Failed to update room:",
          error
        );

        throw error;
      }
    };

  // ==========================================================
  // RE-UPLOAD REJECTED ROOM PHOTO
  // ==========================================================

  const handleReuploadRejectedRoomPhoto =
    async (roomSummary, rejectedPhoto, file) => {
      if (!roomSummary || !rejectedPhoto || !file) {
        return;
      }

      const photoId =
        rejectedPhoto?.id ??
        rejectedPhoto?.photoId ??
        rejectedPhoto?.photo_id ??
        null;

      if (!photoId) {
        window.alert(
          "Unable to re-upload this room image because the photo ID is missing."
        );
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        window.alert(
          "Your login session has expired. Please log in again."
        );
        return;
      }

      if (!file.type?.toLowerCase().startsWith("image/")) {
        window.alert(
          "Please select a JPG, PNG or WEBP image."
        );
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        window.alert(
          "Room images must be 10 MB or smaller."
        );
        return;
      }

      const sourceRooms =
        Array.isArray(roomSummary?.sourceRooms) &&
        roomSummary.sourceRooms.length > 0
          ? roomSummary.sourceRooms
          : roomSummary
            ? [roomSummary]
            : [];

      const rejectedRoomId =
        rejectedPhoto?.roomId ??
        rejectedPhoto?.room_id ??
        rejectedPhoto?.room?.id ??
        rejectedPhoto?.room?.roomId ??
        null;

      const sourceRoom =
        sourceRooms.find((source) => {
          const sourceId = getRoomId(source);

          return (
            rejectedRoomId != null &&
            sourceId != null &&
            String(sourceId) === String(rejectedRoomId)
          );
        }) || sourceRooms[0];

      const roomId = getRoomId(sourceRoom);

      if (!roomId) {
        window.alert(
          "Unable to determine the room ID for this image."
        );
        return;
      }

      try {
        setReuploadingPhotoId(String(photoId));

        const formDataRequest =
          new FormData();

        const roomRequest = {
          roomType:
            sourceRoom?.roomType ??
            roomSummary?.roomType,

          // =================================================
          // NEW: PRESERVE AC / NON-AC DURING RE-UPLOAD
          // =================================================

          coolingType:
            getCoolingType(sourceRoom) ??
            getCoolingType(roomSummary),

          numberOfRooms: Number(
            getNumberOfRooms(sourceRoom) ??
              roomSummary?.totalRooms ??
              0
          ),

          bedsPerRoom: Number(
            getBedsPerRoom(sourceRoom) ??
              roomSummary?.bedsPerRoom ??
              0
          ),

          rentPerBed: Number(
            getRent(sourceRoom) ??
              roomSummary?.rent ??
              0
          ),

          occupiedRooms: Number(
            getOccupiedRooms(sourceRoom) ??
              roomSummary?.occupiedRooms ??
              0
          ),

          occupiedBeds: Number(
            getOccupied(sourceRoom) ??
              roomSummary?.occupiedBeds ??
              0
          ),

          deletedPhotoIds: [
            Number(photoId),
          ],
        };

        formDataRequest.append(
          "room",
          new Blob(
            [
              JSON.stringify(
                roomRequest
              ),
            ],
            {
              type: "application/json",
            }
          )
        );

        formDataRequest.append(
          "photos",
          file
        );

        console.log(
          "========== ROOM PHOTO RE-UPLOAD =========="
        );

        console.log(
          "Room ID:",
          roomId
        );

        console.log(
          "Room Type:",
          roomRequest.roomType
        );

        console.log(
          "Cooling Type:",
          roomRequest.coolingType
        );

        console.log(
          "Rejected Photo ID:",
          photoId
        );

        console.log(
          "Replacement File:",
          file.name
        );

        console.log(
          "=========================================="
        );

        const response =
          await fetch(
            `${API_BASE_URL}/api/owner/hostels/rooms/${roomId}`,
            {
              method: "PUT",

              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },

              body: formDataRequest,
            }
          );

        if (!response.ok) {
          let message =
            `Failed to re-upload room image (${response.status})`;

          try {
            const errorData =
              await response.json();

            message =
              errorData?.message ||
              errorData?.error ||
              message;
          } catch {
            try {
              const errorText =
                await response.text();

              if (errorText) {
                message =
                  errorText;
              }
            } catch {
              // Keep default message.
            }
          }

          throw new Error(
            message
          );
        }

        const updatedResponse =
          await response.json();

        console.log(
          "Room image re-upload success:",
          updatedResponse
        );

        window.alert(
          "Room image replaced successfully. The new image has been automatically approved and is now visible on the public hostel listing."
        );

        setEditingRoom(
          (previous) => {
            if (!previous) {
              return previous;
            }

            const updatedPhotos =
              Array.isArray(
                updatedResponse?.photos
              )
                ? updatedResponse.photos
                : Array.isArray(
                    previous.photos
                  )
                ? previous.photos.filter(
                    (photo) => {
                      const currentId =
                        photo?.id ??
                        photo?.photoId ??
                        photo?.photo_id ??
                        null;

                      return (
                        String(
                          currentId ?? ""
                        ) !==
                        String(
                          photoId
                        )
                      );
                    }
                  )
                : [];

            return {
              ...previous,
              photos:
                updatedPhotos,
            };
          }
        );

        setRefreshTrigger(
          (prev) => prev + 1
        );
      } catch (error) {
        console.error(
          "Failed to re-upload rejected room image:",
          error
        );

        window.alert(
          error?.message ||
            "Failed to re-upload the rejected room image."
        );
      } finally {
        setReuploadingPhotoId(null);
      }
    };

  const profileMenuRef =
    useRef(null);

  useEffect(() => {
    const handleClickOutside =
      (event) => {
        if (
          profileMenuRef.current &&
          !profileMenuRef.current.contains(
            event.target
          )
        ) {
          setProfileMenuOpen(
            false
          );
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

  // ==========================================================
  // HOSTEL ID
  // ==========================================================

  const validUrlHostelId =
    urlHostelId &&
    urlHostelId !== "${hostelId}" &&
    /^\d+$/.test(
      String(urlHostelId)
    )
      ? String(urlHostelId)
      : null;

  const hostelId =
    validUrlHostelId ||
    (hostelData?.hostelId != null
      ? String(
          hostelData.hostelId
        )
      : hostelData?.id != null
      ? String(hostelData.id)
      : localStorage.getItem(
          "hostelId"
        ));

  // ==========================================================
  // LOAD HOSTEL / DASHBOARD DATA
  // ==========================================================

  const loadHostelData =
    async () => {
      try {
        setLoadingHostel(true);

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          throw new Error(
            "No authentication token found."
          );
        }

        const response =
          await fetch(
            `${API_BASE_URL}/api/owner/dashboard`,
            {
              method: "GET",

              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
          );

        if (!response.ok) {
          throw new Error(
            `Failed to load hostel data (${response.status})`
          );
        }

        const data =
          await response.json();

        console.log(
          "Owner dashboard response:",
          data
        );

        setDashboardData(data);

        const hostel =
          data?.data?.hostel ||
          data?.hostel ||
          data?.data ||
          data;

        setHostelData(
          hostel || null
        );

        return {
          raw: data,
          hostel,
        };
      } catch (error) {
        console.error(
          "Failed to load hostel data:",
          error
        );

        setDashboardData(null);
        setHostelData(null);

        return {
          raw: null,
          hostel: null,
        };
      } finally {
        setLoadingHostel(false);
      }
    };

  const owner =
    dashboardData?.data?.owner ||
    dashboardData?.owner ||
    dashboardData?.data?.user ||
    dashboardData?.user ||
    {};

  const ownerName =
    owner?.name ||
    owner?.fullName ||
    owner?.ownerName ||
    owner?.username ||
    "Owner";

  // ==========================================================
  // LOAD ROOMS
  // ==========================================================

  const loadRooms =
    async (id) => {
      try {
        setLoadingRooms(true);

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          throw new Error(
            "No authentication token found."
          );
        }

        if (!id) {
          console.warn(
            "Cannot load rooms: hostelId is missing"
          );

          setRoomsData([]);

          return [];
        }

        const cleanHostelId =
          String(id).trim();

        const response =
          await fetch(
            `${API_BASE_URL}/api/owner/hostels/${cleanHostelId}/rooms`,
            {
              method: "GET",

              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
          );

        console.log(
          "Rooms API status:",
          response.status
        );

        if (!response.ok) {
          const errorText =
            await response.text();

          console.error(
            "Rooms API error:",
            errorText
          );

          throw new Error(
            `Failed to load rooms (${response.status})`
          );
        }

        const data =
          await response.json();

        console.log(
          "========== ROOMS API RESPONSE =========="
        );

        console.log(
          JSON.stringify(
            data,
            null,
            2
          )
        );

        console.log(
          "========================================"
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

        const extractedRoomPhotos =
          [];

        normalizedRooms.forEach(
          (room) => {
            const roomId =
              getRoomId(room);

            const photos =
              Array.isArray(
                room?.photos
              )
                ? room.photos
                : [];

            photos.forEach(
              (photo) => {
                if (!photo) return;

                extractedRoomPhotos.push(
                  {
                    ...photo,

                    roomId:
                      photo?.roomId ??
                      photo?.room_id ??
                      roomId ??
                      null,

                    roomType:
                      room?.roomType ??
                      room?.type ??
                      room?.name ??
                      null,

                    // =================================================
                    // NEW: KEEP COOLING TYPE WITH PHOTO
                    // =================================================

                    coolingType:
                      photo?.coolingType ??
                      photo?.cooling_type ??
                      getCoolingType(room),

                    photoCategory:
                      "ROOM",
                  }
                );
              }
            );
          }
        );

        console.log(
          "========== EXTRACTED ROOM PHOTOS =========="
        );

        console.log(
          extractedRoomPhotos
        );

        console.log(
          "============================================"
        );

        setRoomsData(
          normalizedRooms
        );

        setRoomPhotos(
          extractedRoomPhotos
        );

        return normalizedRooms;
      } catch (error) {
        console.error(
          "Failed to load rooms:",
          error
        );

        setRoomsData([]);
        setRoomPhotos([]);

        return [];
      } finally {
        setLoadingRooms(false);
      }
    };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadAllData =
      async () => {
        const dashboardResult =
          await loadHostelData();

        if (!mounted) return;

        const dashboardHostel =
          dashboardResult?.hostel;

        const resolvedId =
          validUrlHostelId ||
          (dashboardHostel?.hostelId != null
            ? String(
                dashboardHostel.hostelId
              )
            : dashboardHostel?.id != null
            ? String(
                dashboardHostel.id
              )
            : localStorage.getItem(
                "hostelId"
              ));

        if (resolvedId) {
          localStorage.setItem(
            "hostelId",
            String(resolvedId)
          );

          if (!validUrlHostelId) {
            navigate(
              `/owner/hostel/rooms/${resolvedId}`,
              {
                replace: true,
              }
            );
          }

          await loadRooms(
            resolvedId
          );
        } else {
          setRoomsData([]);
          setRoomPhotos([]);
        }
      };

    loadAllData();

    return () => {
      mounted = false;
    };
  }, [refreshTrigger]);

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const handleNavigation =
    (path) => {
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

    localStorage.removeItem(
      "hostelId"
    );

    navigate("/");
  };

  // ==========================================================
  // CLEAN ROOMS
  // ==========================================================

  const rooms = useMemo(() => {
    if (!Array.isArray(roomsData)) {
      return [];
    }

    return roomsData.filter(
      Boolean
    );
  }, [roomsData]);

  // ==========================================================
  // ROOM TYPE SUMMARIES
  // ==========================================================

  const roomTypeSummaries =
    useMemo(() => {
      const grouped = {};

      rooms.forEach((room) => {
        const rawType =
          getRoomType(room);

        const type =
          formatRoomType(
            rawType
          );

        // =====================================================
        // NEW:
        // GROUP BY ROOM TYPE + COOLING TYPE
        //
        // 1 Sharing + AC
        // 1 Sharing + Non-AC
        // are now two separate configurations.
        // =====================================================

        const coolingType =
          getCoolingType(room);

        const coolingLabel =
          formatCoolingType(
            coolingType
          );

        const configurationKey =
          getRoomConfigurationKey(
            room
          );

        if (
          !grouped[
            configurationKey
          ]
        ) {
          grouped[
            configurationKey
          ] = {
            roomType: rawType,

            displayType: type,

            coolingType,

            coolingLabel,

            totalRooms: 0,

            bedsPerRoom: 0,

            totalBeds: 0,

            occupiedBeds: 0,

            availableBeds: 0,

            occupiedRooms: 0,

            availableRooms: 0,

            rent: null,

            photos: [],

            rejectedPhotos: [],

            status: "AVAILABLE",

            sourceRooms: [],
          };
        }

        const summary =
          grouped[
            configurationKey
          ];

        const totalRooms =
          getNumberOfRooms(
            room
          );

        const bedsPerRoom =
          getBedsPerRoom(
            room
          );

        const occupied =
          getOccupied(room);

        const occupiedRooms =
          getOccupiedRooms(
            room
          );

        const availableRooms =
          getAvailableRooms(
            room
          );

        if (
          totalRooms !== null &&
          !Number.isNaN(
            Number(totalRooms)
          )
        ) {
          summary.totalRooms +=
            Number(totalRooms);
        }

        if (
          bedsPerRoom !== null &&
          !Number.isNaN(
            Number(
              bedsPerRoom
            )
          )
        ) {
          summary.bedsPerRoom =
            Number(
              bedsPerRoom
            );
        }

        if (
          totalRooms !== null &&
          bedsPerRoom !== null &&
          !Number.isNaN(
            Number(totalRooms)
          ) &&
          !Number.isNaN(
            Number(
              bedsPerRoom
            )
          )
        ) {
          summary.totalBeds +=
            Number(totalRooms) *
            Number(bedsPerRoom);
        }

        if (
          occupied !== null &&
          !Number.isNaN(
            Number(occupied)
          )
        ) {
          summary.occupiedBeds +=
            Number(occupied);
        }

        if (
          occupiedRooms !== null &&
          !Number.isNaN(
            Number(
              occupiedRooms
            )
          )
        ) {
          summary.occupiedRooms +=
            Number(
              occupiedRooms
            );
        }

        if (
          availableRooms !== null &&
          !Number.isNaN(
            Number(
              availableRooms
            )
          )
        ) {
          summary.availableRooms +=
            Number(
              availableRooms
            );
        }

        if (summary.rent === null) {
          summary.rent =
            getRent(room);
        }

        // ------------------------------------------------------
        // ROOM PHOTOS
        // ------------------------------------------------------

        const photos =
          getRoomPhotos(
            room,
            roomPhotos
          );

        if (photos.length > 0) {
          summary.photos = [
            ...new Set([
              ...summary.photos,
              ...photos,
            ]),
          ];
        }

        summary.sourceRooms.push(
          room
        );

        const rejectedRoomPhotos =
          getRejectedRoomPhotos(room);

        if (
          rejectedRoomPhotos.length >
          0
        ) {
          summary.rejectedPhotos = [
            ...summary.rejectedPhotos,
            ...rejectedRoomPhotos,
          ];
        }
      });

      return Object.values(
        grouped
      ).map((summary) => {
        const occupancy =
          summary.totalBeds > 0
            ? Math.round(
                (summary.occupiedBeds /
                  summary.totalBeds) *
                  100
              )
            : 0;

        const availableBeds =
          summary.totalBeds > 0
            ? Math.max(
                summary.totalBeds -
                  summary.occupiedBeds,
                0
              )
            : summary.availableBeds;

        const totalRooms =
          summary.totalRooms;

        const availableRooms =
          totalRooms > 0 &&
          summary.occupiedRooms > 0
            ? Math.max(
                totalRooms -
                  summary.occupiedRooms,
                0
              )
            : summary.availableRooms;

        return {
          ...summary,

          primaryRoomId:
            getRoomId(
              summary.sourceRooms[0]
            ),

          occupancy,

          calculatedAvailableBeds:
            availableBeds,

          calculatedAvailableRooms:
            availableRooms,

          primaryPhoto:
            summary.photos[0] ||
            null,

          rejectedPhotos: Array.from(
            new Map(
              (
                summary.rejectedPhotos ||
                []
              )
                .filter(Boolean)
                .map(
                  (
                    photo,
                    photoIndex
                  ) => [
                    String(
                      photo?.id ??
                        photo?.photoId ??
                        `rejected-${photoIndex}`
                    ),
                    photo,
                  ]
                )
            ).values()
          ),
        };
      });
    }, [
      rooms,
      roomPhotos,
    ]);

  // ==========================================================
  // OVERALL SUMMARY
  // ==========================================================

  const analytics =
    useMemo(() => {
      let totalRooms = 0;

      let totalBeds = 0;

      let occupiedBeds = 0;

      let availableBeds = 0;

      roomTypeSummaries.forEach(
        (summary) => {
          totalRooms +=
            Number(
              summary.totalRooms || 0
            );

          totalBeds +=
            Number(
              summary.totalBeds || 0
            );

          occupiedBeds +=
            Number(
              summary.occupiedBeds || 0
            );

          availableBeds +=
            Number(
              summary.calculatedAvailableBeds ||
                0
            );
        }
      );

      const occupancy =
        totalBeds > 0
          ? Math.round(
              (occupiedBeds /
                totalBeds) *
                100
            )
          : null;

      return {
        roomTypes:
          roomTypeSummaries.length,

        totalRooms,

        totalBeds,

        occupiedBeds,

        availableBeds,

        occupancy,
      };
    }, [
      roomTypeSummaries,
    ]);

  // ==========================================================
  // ROOM CARD DATA
  // ==========================================================

  const displayRooms =
    roomTypeSummaries;

  if (editingRoom) {
    const editingRejectedPhotos =
      getRejectedRoomPhotos(editingRoom);

    return (
      <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-800">
        {editingRejectedPhotos.length > 0 && (
          <div className="mx-auto max-w-[1600px] px-4 pt-4 lg:px-8 lg:pt-8">
            <div className="rounded-2xl border-2 border-red-300 bg-red-50/70 p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-red-700">
                    Rejected Room Images
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    These images were rejected by admin. Review the rejection reason and
                    replace each image with a corrected version.
                  </p>
                </div>

                <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  {editingRejectedPhotos.length} rejected
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {editingRejectedPhotos.map(
                  (
                    rejectedPhoto,
                    rejectedIndex
                  ) => {
                    const rejectedPhotoId =
                      rejectedPhoto?.id ??
                      rejectedPhoto?.photoId ??
                      rejectedPhoto?.photo_id ??
                      `editing-rejected-${rejectedIndex}`;

                    const rejectedPhotoUrl =
                      extractPhotoUrl(
                        rejectedPhoto
                      );

                    const rejectionReason =
                      getPhotoRejectionReason(
                        rejectedPhoto
                      );

                    const isReuploading =
                      String(
                        reuploadingPhotoId ??
                          ""
                      ) ===
                      String(
                        rejectedPhotoId
                      );

                    const inputId =
                      `room-reupload-${rejectedPhotoId}`;

                    return (
                      <div
                        key={String(
                          rejectedPhotoId
                        )}
                        className="rounded-xl border border-red-200 bg-white p-3 shadow-sm"
                      >
                        <div className="h-44 w-full overflow-hidden rounded-lg border border-red-100 bg-slate-100">
                          {rejectedPhotoUrl ? (
                            <img
                              src={
                                rejectedPhotoUrl
                              }
                              alt="Rejected room image"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                              No image available
                            </div>
                          )}
                        </div>

                        <div className="mt-3">
                          <p className="text-sm font-semibold text-red-700">
                            Image rejected by admin
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-600">
                            {rejectionReason ||
                              "No rejection reason was provided."}
                          </p>

                          <div className="mt-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                            Replacement required
                          </div>

                          <div className="mt-3">
                            <input
                              id={
                                inputId
                              }
                              type="file"
                              className="hidden"
                              accept="image/jpeg,image/png,image/webp"
                              disabled={
                                isReuploading
                              }
                              onChange={(
                                event
                              ) => {
                                const file =
                                  event
                                    .target
                                    .files?.[0] ||
                                  null;

                                event.target.value =
                                  "";

                                if (file) {
                                  handleReuploadRejectedRoomPhoto(
                                    editingRoom,
                                    rejectedPhoto,
                                    file
                                  );
                                }
                              }}
                            />

                            <button
                              type="button"
                              disabled={
                                isReuploading
                              }
                              onClick={() => {
                                document
                                  .getElementById(
                                    inputId
                                  )
                                  ?.click();
                              }}
                              className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                                isReuploading
                                  ? "cursor-not-allowed bg-slate-200 text-slate-500"
                                  : "bg-indigo-600 text-white hover:bg-indigo-700"
                              }`}
                            >
                              <Upload className="h-4 w-4" />

                              {isReuploading
                                ? "Uploading..."
                                : "Re-upload image"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}

        <EditRoom
          room={editingRoom}
          onCancel={() =>
            setEditingRoom(null)
          }
          onSave={
            handleSaveEditedRoom
          }
        />
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-800">
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
          fixed left-0 top-0 z-50 h-screen w-[235px] bg-white border-r border-slate-200
          transition-transform duration-300 lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Logo */}

        <div className="h-[76px] px-5 border-b border-slate-100 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2
                size={21}
                className="text-white"
              />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                FindMyHostel
              </h1>

              <p className="text-[9px] font-semibold tracking-widest text-slate-500">
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
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}

        <div className="h-[calc(100vh-76px)] overflow-y-auto px-3 py-4">
          <SidebarLabel label="MAIN" />

          <SidebarItem
            icon={
              <Building2 size={17} />
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
            active
            onClick={() => {
              if (
                hostelId &&
                hostelId !==
                  "null" &&
                hostelId !==
                  "undefined"
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
            icon={
              <Utensils size={18} />
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
              <MessageSquare
                size={17}
              />
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
              <HelpCircle size={17} />
            }
            label="Support"
            onClick={() =>
              handleNavigation(
                "/owner/support"
              )
            }
          />

          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() =>
                handleNavigation(
                  "/hostel"
                )
              }
              className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              <ExternalLink
                size={15}
              />

              View Public Listing
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}

      <main className="lg:ml-[235px] h-screen flex flex-col overflow-hidden">
        {/* HEADER */}

        <header className="h-[76px] flex-shrink-0 bg-white border-b border-slate-200 px-5 lg:px-7 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                setSidebarOpen(true)
              }
              className="lg:hidden p-2"
            >
              <Menu size={21} />
            </button>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Rooms
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                Manage your hostel's room
                types, pricing and
                availability
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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

              {dashboardData
                ?.notifications
                ?.unread > 0 && (
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
                  "/hostel"
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
              ref={profileMenuRef}
            >
              <button
                type="button"
                onClick={() =>
                  setProfileMenuOpen(
                    (prev) => !prev
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
                      Hostel Owner
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
          <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
            {/* HEADER BUTTON */}

            <div className="flex justify-end mb-6">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-4 w-4" />

                Add Room Type
              </button>
            </div>

            {/* LOADING */}

            {(loadingHostel ||
              loadingRooms) && (
              <div className="mb-6 flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500 shadow-sm">
                <Loader2
                  size={18}
                  className="animate-spin text-indigo-600"
                />

                Loading room
                information...
              </div>
            )}

            {/* TOP METRIC CARDS */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <LayoutGrid className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Room Types
                  </p>

                  <p className="text-2xl font-bold text-slate-900 mt-0.5">
                    {analytics.roomTypes}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <BedDouble className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Total Rooms
                  </p>

                  <p className="text-2xl font-bold text-slate-900 mt-0.5">
                    {analytics.totalRooms ||
                      "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Users className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Total Beds
                  </p>

                  <p className="text-2xl font-bold text-slate-900 mt-0.5">
                    {analytics.totalBeds ||
                      "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Available Beds
                  </p>

                  <p className="text-2xl font-bold text-slate-900 mt-0.5">
                    {analytics.totalBeds >
                    0
                      ? analytics.availableBeds
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* ROOM TYPES */}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Room Types
                </h3>

                {loadingPhotos && (
                  <span className="text-[11px] text-slate-400">
                    Loading photos...
                  </span>
                )}
              </div>

              {displayRooms.length ===
                0 &&
              !loadingRooms ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <BedDouble
                      size={28}
                    />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    No room types found
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Room information
                    will appear here
                    once rooms are
                    added to the
                    hostel.
                  </p>
                </div>
              ) : (
                displayRooms.map(
                  (
                    room,
                    index
                  ) => (
                    <div
                      key={`${room.primaryRoomId ?? room.displayType}-${room.coolingType}-${index}`}
                      className={`flex flex-col lg:flex-row items-stretch lg:items-center gap-6 rounded-2xl border p-4 shadow-sm transition-colors ${
                        Array.isArray(room.rejectedPhotos) &&
                        room.rejectedPhotos.length > 0
                          ? "border-2 border-red-300 bg-red-50/30 shadow-red-100 hover:border-red-400"
                          : "border-slate-200/80 bg-white hover:border-slate-300"
                      }`}
                    >
                      {/* Preview Image */}

                      <div className="h-40 w-full lg:w-56 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        <RoomImage
                          src={
                            room.primaryPhoto
                          }
                          alt={`${room.displayType} ${room.coolingLabel}`}
                        />
                      </div>

                      {/* Room Details & Metrics */}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="text-lg font-bold text-slate-900">
                              {
                                room.displayType
                              }
                            </h4>

                            {/* =================================================
                                NEW: AC / NON-AC BADGE
                                ================================================= */}

                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                                room.coolingType ===
                                "AC"
                                  ? "border-blue-200 bg-blue-50 text-blue-700"
                                  : "border-slate-200 bg-slate-50 text-slate-600"
                              }`}
                            >
                              {room.coolingLabel}
                            </span>

                            <StatusBadge
                              status={
                                room.status ||
                                "AVAILABLE"
                              }
                            />
                          </div>
                        </div>

                        <p className="text-sm font-semibold text-indigo-600 mb-4">
                          {formatCurrency(
                            room.rent
                          )}

                          <span className="text-xs font-normal text-slate-500">
                            {" "}
                            / bed
                          </span>
                        </p>

                        {/* Sub-metrics */}

                        <div className="grid grid-cols-4 gap-4 max-w-sm">
                          <div>
                            <span className="block text-base font-bold text-slate-900">
                              {room.totalRooms ||
                                "—"}
                            </span>

                            <span className="text-xs text-slate-500">
                              Rooms
                            </span>
                          </div>

                          <div>
                            <span className="block text-base font-bold text-slate-900">
                              {room.totalBeds ||
                                "—"}
                            </span>

                            <span className="text-xs text-slate-500">
                              Beds
                            </span>
                          </div>

                          <div>
                            <span className="block text-base font-bold text-slate-900">
                              {room.occupiedBeds ||
                                "—"}
                            </span>

                            <span className="text-xs text-slate-500">
                              Occupied
                            </span>
                          </div>

                          <div>
                            <span className="block text-base font-bold text-slate-900">
                              {room.calculatedAvailableBeds ??
                                "—"}
                            </span>

                            <span className="text-xs text-slate-500">
                              Available
                            </span>
                          </div>
                        </div>

                        {/* REJECTED ROOM PHOTOS */}

                        {Array.isArray(
                          room.rejectedPhotos
                        ) &&
                          room.rejectedPhotos
                            .length > 0 && (
                            <div className="mt-5 border-t border-red-200 pt-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                                    Action Required: Rejected Room Images
                                  </p>

                                  <p className="mt-1 text-xs text-red-700">
                                    {
                                      room
                                        .rejectedPhotos
                                        .length
                                    }{" "}
                                    image
                                    {room.rejectedPhotos.length >
                                    1
                                      ? "s"
                                      : ""}{" "}
                                    rejected by admin.
                                    Open Edit to view the rejection reason and re-upload.
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEditRoom(
                                      room
                                    )
                                  }
                                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                                >
                                  <Pencil className="h-3.5 w-3.5" />

                                  Edit & Re-upload
                                </button>
                              </div>
                            </div>
                          )}
                      </div>

                      {/* Occupancy and Actions */}

                      <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 w-full lg:w-64 gap-4 shrink-0">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleEditRoom(
                                room
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />

                            Edit
                          </button>

                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-slate-500 font-medium">
                              Occupancy
                            </span>

                            <span className="font-bold text-indigo-600">
                              {
                                room.occupancy
                              }
                              %
                            </span>
                          </div>

                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-indigo-600"
                              style={{
                                width: `${Math.min(
                                  room.occupancy,
                                  100
                                )}%`,
                              }}
                            />
                          </div>

                          <p className="mt-2 text-[11px] text-slate-400">
                            Photos:{" "}
                            <span className="text-emerald-600 font-medium">
                              {room.photos
                                ?.length ||
                                0}{" "}
                              loaded
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )
              )}
            </div>

            {/* OVERALL OCCUPANCY CARD */}

            <div className="mt-6 flex flex-col md:flex-row items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6 shadow-sm">
              <div className="w-full md:w-auto mb-4 md:mb-0">
                <span className="text-[11px] font-bold tracking-wider text-indigo-600 uppercase">
                  Overall Occupancy
                </span>

                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-indigo-600">
                    {analytics.occupancy !==
                    null
                      ? `${analytics.occupancy}%`
                      : "—"}
                  </span>

                  <span className="text-sm font-semibold text-slate-800">
                    {analytics.totalBeds >
                    0
                      ? `${analytics.occupiedBeds} / ${analytics.totalBeds} occupied`
                      : "No bed data"}
                  </span>
                </div>
              </div>

              <div className="flex-1 max-w-lg mx-0 md:mx-8 w-full">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-indigo-100/70">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{
                      width:
                        analytics.occupancy !==
                        null
                          ? `${Math.min(
                              analytics.occupancy,
                              100
                            )}%`
                          : "0%",
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  {analytics.totalBeds >
                  0
                    ? `${analytics.availableBeds} beds currently available`
                    : "Availability data not available"}
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100/60 text-indigo-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================================
// BELL ICON
// ============================================================

function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export default Rooms;