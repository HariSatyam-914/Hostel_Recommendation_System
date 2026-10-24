package com.example.backend.service;

import com.example.backend.dto.HostelRoomRequest;
import com.example.backend.dto.HostelRoomUpdateRequest;
import com.example.backend.entity.HostelBasicInfo;
import com.example.backend.entity.HostelRoom;
import com.example.backend.entity.RoomCoolingType;
import com.example.backend.entity.RoomPhoto;
import com.example.backend.entity.VerificationStatus;
import com.example.backend.repository.HostelRepository;
import com.example.backend.repository.HostelRoomRepository;
import com.example.backend.repository.RoomPhotoRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import java.math.BigDecimal;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HostelRoomServiceImpl
        implements HostelRoomService {

    private final HostelRoomRepository hostelRoomRepository;

    private final RoomPhotoRepository roomPhotoRepository;

    private final HostelRepository hostelRepository;

    private final FileStorageService fileStorageService;


    // =========================================================
    // CREATE ROOM
    // =========================================================

    @Override
    @Transactional
    public HostelRoom saveRoom(
            Long hostelId,
            HostelRoomRequest request,
            List<MultipartFile> photos) {

        // -----------------------------------------------------
        // FIND HOSTEL
        // -----------------------------------------------------

        HostelBasicInfo hostel =
                hostelRepository.findById(hostelId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Hostel not found with ID: "
                                                + hostelId
                                )
                        );


        // -----------------------------------------------------
        // VALIDATE PHOTOS
        // -----------------------------------------------------

        if (photos == null || photos.isEmpty()) {

            throw new RuntimeException(
                    "At least one room photo is required."
            );
        }

        if (photos.size() > 3) {

            throw new RuntimeException(
                    "A maximum of 3 room photos are allowed."
            );
        }


        // -----------------------------------------------------
        // VALIDATE ROOM INFORMATION
        // -----------------------------------------------------

        if (request == null) {

            throw new RuntimeException(
                    "Room information is required."
            );
        }


        if (request.getRoomType() == null) {

            throw new RuntimeException(
                    "Room type is required."
            );
        }


        // =====================================================
        // VALIDATE AC / NON-AC
        // =====================================================

        if (request.getCoolingType() == null) {

            throw new RuntimeException(
                    "Cooling type is required."
            );
        }


        if (request.getRentPerBed() == null ||
                request.getRentPerBed()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Rent per bed must be greater than zero."
            );
        }


        // -----------------------------------------------------
        // FIND EXISTING ROOM
        // -----------------------------------------------------
        //
        // IMPORTANT:
        //
        // Room is now identified using:
        //
        // hostel + room type + cooling type
        //
        // Therefore:
        //
        // DOUBLE + AC
        //
        // and
        //
        // DOUBLE + NON_AC
        //
        // are two separate room records.
        // -----------------------------------------------------

        HostelRoom room =
                hostelRoomRepository
                        .findByHostel_HostelIdAndRoomTypeAndCoolingType(
                                hostelId,
                                request.getRoomType(),
                                request.getCoolingType()
                        )
                        .orElse(null);


        // =====================================================
        // EXISTING ROOM
        // =====================================================

        if (room != null) {

            room.setRentPerBed(
                    request.getRentPerBed()
            );


            // -------------------------------------------------
            // HostelRoomRequest does not contain:
            //
            // numberOfRooms
            // bedsPerRoom
            // occupiedRooms
            // occupiedBeds
            //
            // Therefore those fields are intentionally not
            // updated here.
            // -------------------------------------------------


            // -------------------------------------------------
            // DELETE OLD ROOM PHOTOS
            // -------------------------------------------------

            List<RoomPhoto> oldPhotos =
                    roomPhotoRepository.findByRoom(
                            room
                    );

            if (!oldPhotos.isEmpty()) {

                for (RoomPhoto oldPhoto :
                        oldPhotos) {

                    deletePhysicalRoomPhoto(
                            oldPhoto.getPhotoUrl()
                    );
                }

                roomPhotoRepository.deleteAll(
                        oldPhotos
                );

                roomPhotoRepository.flush();
            }


            if (room.getPhotos() != null) {

                room.getPhotos().clear();
            }
        }


        // =====================================================
        // NEW ROOM
        // =====================================================

        else {

            room =
                    HostelRoom.builder()
                            .hostel(hostel)

                            .roomType(
                                    request.getRoomType()
                            )

                            // =================================================
                            // AC / NON-AC
                            // =================================================

                            .coolingType(
                                    request.getCoolingType()
                            )

                            .rentPerBed(
                                    request.getRentPerBed()
                            )

                            .build();


            room =
                    hostelRoomRepository.save(
                            room
                    );
        }


        // =====================================================
        // SAVE ROOM PHOTOS
        // =====================================================

        int displayOrder = 1;


        for (MultipartFile file : photos) {

            validateRoomPhoto(file);


            String storedFilePath =
                    fileStorageService.storeRoomPhoto(
                            file,
                            hostelId,
                            room.getId()
                    );


            String fileName =
                    extractFileName(
                            storedFilePath
                    );


            RoomPhoto roomPhoto =
                    RoomPhoto.builder()

                            .room(room)

                            .originalFileName(
                                    file.getOriginalFilename()
                            )

                            .fileName(fileName)

                            .filePath(storedFilePath)

                            .fileSize(
                                    file.getSize()
                            )

                            .fileType(
                                    file.getContentType()
                            )

                            .photoUrl(
                                    storedFilePath
                            )

                            .displayOrder(
                                    displayOrder++
                            )

                            // =================================================
                            // OWNER UPLOADED ROOM PHOTO
                            // =================================================

                            .verificationStatus(
                                    VerificationStatus.APPROVED
                            )

                            .rejectionReason(null)

                            .reviewedAt(null)

                            .reviewedBy(null)

                            .build();


            roomPhotoRepository.save(
                    roomPhoto
            );


            if (room.getPhotos() != null) {

                room.getPhotos().add(
                        roomPhoto
                );
            }
        }


        // =====================================================
        // SAVE ROOM
        // =====================================================

        return hostelRoomRepository.save(
                room
        );
    }


    // =========================================================
    // GET ROOMS BY HOSTEL
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<HostelRoom> getRoomsByHostel(
            Long hostelId) {

        return hostelRoomRepository
                .findByHostel_HostelId(
                        hostelId
                );
    }


    // =========================================================
    // GET ROOM BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public HostelRoom getRoomById(
            Long roomId) {

        return hostelRoomRepository
                .findById(roomId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Room not found with ID: "
                                        + roomId
                        )
                );
    }


    // =========================================================
    // UPDATE ROOM
    // =========================================================

    @Override
    @Transactional
    public HostelRoom updateRoom(
            Long roomId,
            HostelRoomUpdateRequest request,
            List<MultipartFile> photos) {


        // -----------------------------------------------------
        // FIND ROOM
        // -----------------------------------------------------

        HostelRoom room =
                hostelRoomRepository
                        .findById(roomId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Room not found with ID: "
                                                + roomId
                                )
                        );


        // -----------------------------------------------------
        // VALIDATE REQUEST
        // -----------------------------------------------------

        if (request == null) {

            throw new RuntimeException(
                    "Room information is required."
            );
        }


        // =====================================================
        // VALIDATE COOLING TYPE
        // =====================================================

        if (request.getCoolingType() == null) {

            throw new RuntimeException(
                    "Cooling type is required."
            );
        }


        // =====================================================
        // PREVENT DUPLICATE AC / NON-AC ROOM
        // =====================================================
        //
        // Example:
        //
        // Existing:
        // DOUBLE + AC
        // DOUBLE + NON_AC
        //
        // Owner edits another room and tries to change it
        // to an already existing configuration.
        //
        // We must not merge the two records.
        // =====================================================

        if (request.getRoomType() != null &&
                request.getCoolingType() != null) {

            boolean configurationChanged =
                    room.getRoomType() !=
                            request.getRoomType()
                    ||
                    room.getCoolingType() !=
                            request.getCoolingType();


            if (configurationChanged) {

                boolean alreadyExists =
                        hostelRoomRepository
                                .existsByHostel_HostelIdAndRoomTypeAndCoolingType(
                                        room.getHostel()
                                                .getHostelId(),
                                        request.getRoomType(),
                                        request.getCoolingType()
                                );


                if (alreadyExists) {

                    throw new RuntimeException(
                            "A room with the same room type and "
                                    + "cooling type already exists."
                    );
                }
            }
        }


        // =====================================================
        // UPDATE ROOM INFORMATION
        // =====================================================

        if (request.getRoomType() != null) {

            room.setRoomType(
                    request.getRoomType()
            );
        }


        // =====================================================
        // UPDATE AC / NON-AC
        // =====================================================

        if (request.getCoolingType() != null) {

            room.setCoolingType(
                    request.getCoolingType()
            );
        }


        if (request.getNumberOfRooms() != null) {

            room.setNumberOfRooms(
                    request.getNumberOfRooms()
            );
        }


        if (request.getBedsPerRoom() != null) {

            room.setBedsPerRoom(
                    request.getBedsPerRoom()
            );
        }


        if (request.getRentPerBed() != null) {

            if (request.getRentPerBed()
                    .compareTo(BigDecimal.ZERO) <= 0) {

                throw new RuntimeException(
                        "Rent per bed must be greater than zero."
                );
            }


            room.setRentPerBed(
                    request.getRentPerBed()
            );
        }


        if (request.getOccupiedRooms() != null) {

            room.setOccupiedRooms(
                    request.getOccupiedRooms()
            );
        }


        if (request.getOccupiedBeds() != null) {

            room.setOccupiedBeds(
                    request.getOccupiedBeds()
            );
        }


        // =====================================================
        // DELETE SELECTED PHOTOS
        // =====================================================

        List<Long> deletedPhotoIds =
                request.getDeletedPhotoIds();


        if (deletedPhotoIds != null &&
                !deletedPhotoIds.isEmpty()) {

            for (Long photoId :
                    deletedPhotoIds) {

                if (photoId == null) {
                    continue;
                }


                RoomPhoto photo =
                        roomPhotoRepository
                                .findById(photoId)
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Room photo not found with ID: "
                                                        + photoId
                                        )
                                );


                // -------------------------------------------------
                // Make sure photo belongs to this room
                // -------------------------------------------------

                if (photo.getRoom() == null ||
                        photo.getRoom().getId() == null ||
                        !photo.getRoom()
                                .getId()
                                .equals(roomId)) {

                    throw new RuntimeException(
                            "Room photo does not belong to this room."
                    );
                }


                // -------------------------------------------------
                // Delete physical photo
                // -------------------------------------------------

                deletePhysicalRoomPhoto(
                        photo.getPhotoUrl()
                );


                // -------------------------------------------------
                // Delete database record
                // -------------------------------------------------

                roomPhotoRepository.delete(
                        photo
                );


                // -------------------------------------------------
                // Remove from managed collection
                // -------------------------------------------------

                if (room.getPhotos() != null) {

                    room.getPhotos().remove(
                            photo
                    );
                }
            }


            roomPhotoRepository.flush();
        }


        // =====================================================
        // COUNT CURRENT PHOTOS
        // =====================================================

        List<RoomPhoto> currentPhotos =
                roomPhotoRepository
                        .findByRoom_IdOrderByDisplayOrderAsc(
                                roomId
                        );


        int currentPhotoCount =
                currentPhotos.size();


        int newPhotoCount =
                photos == null
                        ? 0
                        : (int) photos.stream()
                                .filter(
                                        file ->
                                                file != null &&
                                                        !file.isEmpty()
                                )
                                .count();


        // -----------------------------------------------------
        // MAXIMUM 3 PHOTOS
        // -----------------------------------------------------

        if (currentPhotoCount +
                newPhotoCount > 3) {

            throw new RuntimeException(
                    "A maximum of 3 room photos are allowed."
            );
        }


        // =====================================================
        // SAVE NEW ROOM PHOTOS
        // =====================================================

        if (photos != null &&
                !photos.isEmpty()) {

            int displayOrder =
                    currentPhotoCount + 1;


            for (MultipartFile file :
                    photos) {

                if (file == null ||
                        file.isEmpty()) {

                    continue;
                }


                validateRoomPhoto(file);


                String storedFilePath =
                        fileStorageService.storeRoomPhoto(
                                file,
                                room.getHostel()
                                        .getHostelId(),
                                room.getId()
                        );


                String fileName =
                        extractFileName(
                                storedFilePath
                        );


                RoomPhoto roomPhoto =
                        RoomPhoto.builder()

                                .room(room)

                                .originalFileName(
                                        file.getOriginalFilename()
                                )

                                .fileName(
                                        fileName
                                )

                                .filePath(
                                        storedFilePath
                                )

                                .fileSize(
                                        file.getSize()
                                )

                                .fileType(
                                        file.getContentType()
                                )

                                .photoUrl(
                                        storedFilePath
                                )

                                .displayOrder(
                                        displayOrder++
                                )

                                // =================================================
                                // OWNER REPLACEMENT / UPDATE
                                // =================================================

                                .verificationStatus(
                                        VerificationStatus.APPROVED
                                )

                                .rejectionReason(null)

                                .reviewedAt(null)

                                .reviewedBy(null)

                                .build();


                roomPhotoRepository.save(
                        roomPhoto
                );


                if (room.getPhotos() != null) {

                    room.getPhotos().add(
                            roomPhoto
                    );
                }
            }
        }


        // =====================================================
        // SAVE UPDATED ROOM
        // =====================================================

        return hostelRoomRepository.save(
                room
        );
    }


    // =========================================================
    // MARK ROOM AS MAINTENANCE
    // =========================================================

    @Override
    @Transactional
    public HostelRoom markMaintenance(
            Long roomId) {

        /*
         * HostelRoom currently does not contain a room-status
         * field.
         *
         * Therefore maintenance status cannot be stored here.
         */

        throw new UnsupportedOperationException(
                "Room maintenance status is not supported "
                        + "by the current HostelRoom entity."
        );
    }


    // =========================================================
    // DELETE ROOM
    // =========================================================

    @Override
    @Transactional
    public void deleteRoom(
            Long roomId) {

        HostelRoom room =
                hostelRoomRepository
                        .findById(roomId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Room not found with ID: "
                                                + roomId
                                )
                        );


        // -----------------------------------------------------
        // DELETE ROOM PHOTOS
        // -----------------------------------------------------

        List<RoomPhoto> photos =
                roomPhotoRepository.findByRoom(
                        room
                );


        if (!photos.isEmpty()) {

            for (RoomPhoto photo :
                    photos) {

                deletePhysicalRoomPhoto(
                        photo.getPhotoUrl()
                );
            }


            roomPhotoRepository.deleteAll(
                    photos
            );
        }


        // -----------------------------------------------------
        // DELETE ROOM
        // -----------------------------------------------------

        hostelRoomRepository.delete(
                room
        );
    }


    // =========================================================
    // VALIDATE ROOM PHOTO
    // =========================================================

    private void validateRoomPhoto(
            MultipartFile file) {

        if (file == null ||
                file.isEmpty()) {

            throw new RuntimeException(
                    "Room photo cannot be empty."
            );
        }


        if (file.getSize() >
                10 * 1024 * 1024) {

            throw new RuntimeException(
                    "Room photo cannot exceed 10 MB."
            );
        }


        String contentType =
                file.getContentType();


        if (contentType == null) {

            throw new RuntimeException(
                    "Room photo type could not be determined."
            );
        }


        String normalizedType =
                contentType
                        .trim()
                        .toLowerCase();


        if (!normalizedType.equals(
                "image/jpeg"
        ) &&
                !normalizedType.equals(
                        "image/png"
                ) &&
                !normalizedType.equals(
                        "image/webp"
                )) {

            throw new RuntimeException(
                    "Only JPG, PNG and WEBP images are allowed."
            );
        }
    }


    // =========================================================
    // EXTRACT FILE NAME
    // =========================================================

    private String extractFileName(
            String filePath) {

        if (filePath == null ||
                filePath.isBlank()) {

            return UUID.randomUUID()
                    .toString();
        }


        String normalizedPath =
                filePath
                        .replace("\\", "/");


        int lastSlash =
                normalizedPath.lastIndexOf("/");


        if (lastSlash >= 0 &&
                lastSlash <
                        normalizedPath.length() - 1) {

            return normalizedPath.substring(
                    lastSlash + 1
            );
        }


        return normalizedPath;
    }


    // =========================================================
    // DELETE PHYSICAL ROOM PHOTO
    // =========================================================

    private void deletePhysicalRoomPhoto(
            String photoPath) {

        if (photoPath == null ||
                photoPath.isBlank()) {

            return;
        }


        try {

            String normalizedPath =
                    photoPath
                            .trim()
                            .replace("\\", "/");


            /*
             * -------------------------------------------------
             * Room photos are normally stored using the
             * FileStorageService path.
             *
             * If the returned value is a URL such as
             * /uploads/hostels/2/rooms/5/file.jpg,
             * convert it back to the physical upload path.
             * -------------------------------------------------
             */

            String relativePath =
                    normalizedPath;


            if (relativePath.startsWith(
                    "/uploads/"
            )) {

                relativePath =
                        relativePath.substring(
                                "/uploads/"
                                        .length()
                        );

            } else if (relativePath.startsWith(
                    "uploads/"
            )) {

                relativePath =
                        relativePath.substring(
                                "uploads/"
                                        .length()
                        );
            }


            Path uploadBaseDirectory =
                    Paths.get(
                            "uploads"
                    )
                            .toAbsolutePath()
                            .normalize();


            Path filePath =
                    uploadBaseDirectory
                            .resolve(
                                    relativePath
                            )
                            .normalize();


            // -------------------------------------------------
            // Prevent deleting files outside uploads
            // -------------------------------------------------

            if (!filePath.startsWith(
                    uploadBaseDirectory
            )) {

                System.err.println(
                        "Refusing to delete room photo "
                                + "outside upload directory: "
                                + filePath
                );

                return;
            }


            Files.deleteIfExists(
                    filePath
            );


        } catch (IOException e) {

            System.err.println(
                    "Could not delete old room photo: "
                            + e.getMessage()
            );
        }
    }
}