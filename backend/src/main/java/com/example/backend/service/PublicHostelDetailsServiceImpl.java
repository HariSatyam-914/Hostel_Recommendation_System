package com.example.backend.service;

import com.example.backend.dto.PublicHostelDetailsResponse;
import com.example.backend.entity.AmenityPhoto;
import com.example.backend.entity.EmailVerificationStatus;
import com.example.backend.entity.HostelAmenity;
import com.example.backend.entity.HostelApproval;
import com.example.backend.entity.HostelApprovalStatus;
import com.example.backend.entity.HostelBasicInfo;
import com.example.backend.entity.HostelDepositPolicy;
import com.example.backend.entity.HostelLocation;
import com.example.backend.entity.HostelPhoto;
import com.example.backend.entity.HostelPhotoType;
import com.example.backend.entity.HostelRoom;
import com.example.backend.entity.HostelRules;
import com.example.backend.entity.RoomPhoto;
import com.example.backend.entity.VerificationStatus;

import com.example.backend.repository.AmenityPhotoRepository;
import com.example.backend.repository.HostelAmenityRepository;
import com.example.backend.repository.HostelApprovalRepository;
import com.example.backend.repository.HostelDepositPolicyRepository;
import com.example.backend.repository.HostelLocationRepository;
import com.example.backend.repository.HostelPhotoRepository;
import com.example.backend.repository.HostelRoomRepository;
import com.example.backend.repository.HostelRulesRepository;
import com.example.backend.repository.RoomPhotoRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PublicHostelDetailsServiceImpl
        implements PublicHostelDetailsService {


    private final HostelApprovalRepository hostelApprovalRepository;

    private final HostelLocationRepository hostelLocationRepository;

    private final HostelPhotoRepository hostelPhotoRepository;

    private final HostelAmenityRepository hostelAmenityRepository;

    private final AmenityPhotoRepository amenityPhotoRepository;

    private final HostelRoomRepository hostelRoomRepository;

    private final RoomPhotoRepository roomPhotoRepository;

    private final HostelRulesRepository hostelRulesRepository;

    private final HostelDepositPolicyRepository hostelDepositPolicyRepository;


    // =========================================================
    // GET PUBLIC HOSTEL DETAILS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public PublicHostelDetailsResponse getHostelDetails(
            Long hostelId
    ) {

        if (hostelId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Hostel ID is required"
            );
        }


        // =====================================================
        // 1. FIND APPROVED HOSTEL
        // =====================================================

        HostelApproval approval =
                hostelApprovalRepository
                        .findByHostel_HostelId(hostelId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Hostel not found"
                                )
                        );


        /*
         * IMPORTANT:
         *
         * Only APPROVED hostels can be displayed publicly.
         *
         * This prevents:
         *
         * DRAFT
         * PENDING
         * REJECTED
         * SUSPENDED
         * PENDING_ADMIN_REUPLOAD_REVIEW
         *
         * hostels from appearing on the public View Details page.
         */

        if (approval.getStatus()
                != HostelApprovalStatus.APPROVED) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Hostel not found"
            );
        }


        HostelBasicInfo hostel =
                approval.getHostel();


        // =====================================================
        // 2. BASIC INFORMATION
        // =====================================================

        PublicHostelDetailsResponse.BasicInfo basicInfo =
                PublicHostelDetailsResponse.BasicInfo
                        .builder()

                        .hostelName(
                                hostel.getHostelName()
                        )

                        .hostelType(
                                hostel.getHostelType()
                        )

                        .ownerName(
                                hostel.getOwnerName()
                        )

                        .phoneNumber(
                                hostel.getPhoneNumber()
                        )

                        .description(
                                hostel.getDescription()
                        )

                        .build();


        // =====================================================
        // 3. OWNER
        // =====================================================

        boolean ownerVerified = false;

        if (hostel.getOwner() != null &&
                hostel.getOwner()
                        .getEmailVerificationStatus()
                        != null) {

            ownerVerified =
                    hostel.getOwner()
                            .getEmailVerificationStatus()
                            == EmailVerificationStatus.VERIFIED;
        }
        String ownerName =
        hostel.getOwner() != null
                && hostel.getOwner().getName() != null
                && !hostel.getOwner().getName().isBlank()
                ? hostel.getOwner().getName()
                : hostel.getOwnerName();

        String ownerPhone =
                hostel.getOwner() != null
                        && hostel.getOwner().getPhoneNo() != null
                        && !hostel.getOwner().getPhoneNo().isBlank()
                        ? hostel.getOwner().getPhoneNo()
                        : hostel.getPhoneNumber();

        String ownerEmail =
                hostel.getOwner() != null
                        ? hostel.getOwner().getEmail()
                        : null;

        PublicHostelDetailsResponse.OwnerInfo owner =
                PublicHostelDetailsResponse.OwnerInfo
                        .builder()

                        .name(
                                hostel.getOwner() != null
                                        ? hostel.getOwner().getName()
                                        : hostel.getOwnerName()
                        )

                        .phoneNumber(
                        hostel.getOwner() != null
                                && hostel.getOwner().getPhoneNo() != null
                                ? hostel.getOwner().getPhoneNo()
                                : hostel.getPhoneNumber()
                        )
                        .email(
                                hostel.getOwner() != null
                                        ? hostel.getOwner().getEmail()
                                        : null
                        )

                        .verified(
                                ownerVerified
                        )

                        .build();


        // =====================================================
        // 4. LOCATION
        // =====================================================

        HostelLocation location =
                hostelLocationRepository
                        .findByHostel(hostel)
                        .orElse(null);


        PublicHostelDetailsResponse.LocationInfo locationInfo =
                null;


        if (location != null) {

            locationInfo =
                    PublicHostelDetailsResponse.LocationInfo
                            .builder()

                            .address(
                                    location.getAddress()
                            )

                            .landmark(
                                    location.getLandmark()
                            )

                            .city(
                                    location.getCity()
                            )

                            .area(
                                    location.getArea()
                            )

                            .state(
                                    location.getState()
                            )

                            .pincode(
                                    location.getPincode()
                            )

                            .latitude(
                                    location.getLatitude()
                            )

                            .longitude(
                                    location.getLongitude()
                            )

                            .build();
        }


        // =====================================================
        // 5. APPROVED HOSTEL PHOTOS
        // =====================================================

        List<HostelPhoto> approvedHostelPhotos =
                hostelPhotoRepository
                        .findByHostel_HostelIdAndVerificationStatusOrderByDisplayOrderAsc(
                                hostelId,
                                VerificationStatus.APPROVED
                        );


        /*
         * Explicit sorting:
         *
         * COVER first
         * then ADDITIONAL photos
         *
         * This makes the first image suitable for the hero/gallery.
         */

        approvedHostelPhotos.sort(
                Comparator
                        .comparing(
                                (HostelPhoto photo) ->
                                        photo.getPhotoType()
                                                == HostelPhotoType.COVER
                                                ? 0
                                                : 1
                        )
                        .thenComparing(
                                photo ->
                                        photo.getDisplayOrder() != null
                                                ? photo.getDisplayOrder()
                                                : Integer.MAX_VALUE
                        )
        );


        List<PublicHostelDetailsResponse.HostelPhotoInfo> photos =
                approvedHostelPhotos
                        .stream()
                        .map(this::toHostelPhotoResponse)
                        .toList();


        // =====================================================
        // 6. AMENITIES
        // =====================================================

        List<HostelAmenity> hostelAmenities =
                hostelAmenityRepository
                        .findByHostelHostelId(hostelId);


        List<PublicHostelDetailsResponse.AmenityInfo> amenities =
                new ArrayList<>();


        for (HostelAmenity amenity : hostelAmenities) {

            AmenityPhoto approvedPhoto =
                    amenityPhotoRepository
                            .findFirstByAmenityIdAndVerificationStatusOrderByIdDesc(
                                    amenity.getId(),
                                    VerificationStatus.APPROVED
                            )
                            .orElse(null);


            PublicHostelDetailsResponse.AmenityPhotoInfo photoInfo =
                    null;


            if (approvedPhoto != null) {

                photoInfo =
                        PublicHostelDetailsResponse.AmenityPhotoInfo
                                .builder()

                                .id(
                                        approvedPhoto.getId()
                                )

                                .fileName(
                                        approvedPhoto.getFileName()
                                )

                                .fileType(
                                        approvedPhoto.getFileType()
                                )

                                .fileSize(
                                        approvedPhoto.getFileSize()
                                )

                                .photoUrl(
                                        toPublicUploadUrl(
                                                approvedPhoto.getFilePath()
                                        )
                                )

                                .build();
            }


            amenities.add(
                    PublicHostelDetailsResponse.AmenityInfo
                            .builder()

                            .id(
                                    amenity.getId()
                            )

                            .amenityCode(
                                    amenity.getAmenityCode()
                            )

                            .amenityName(
                                    amenity.getAmenityName()
                            )

                            .photoRequired(
                                    amenity.isPhotoRequired()
                            )

                            .photo(
                                    photoInfo
                            )

                            .build()
            );
        }


        // =====================================================
        // 7. ROOMS
        // =====================================================

        List<HostelRoom> hostelRooms =
                hostelRoomRepository
                        .findByHostel_HostelId(hostelId);


        List<PublicHostelDetailsResponse.RoomInfo> rooms =
                new ArrayList<>();


        for (HostelRoom room : hostelRooms) {

            List<RoomPhoto> approvedRoomPhotos =
                    roomPhotoRepository
                            .findByRoom_IdAndVerificationStatusOrderByDisplayOrderAsc(
                                    room.getId(),
                                    VerificationStatus.APPROVED
                            );


            List<PublicHostelDetailsResponse.RoomPhotoInfo>
                    roomPhotos =
                            approvedRoomPhotos
                                    .stream()
                                    .map(this::toRoomPhotoResponse)
                                    .toList();


            rooms.add(
                    PublicHostelDetailsResponse.RoomInfo
                            .builder()

                            .id(
                                    room.getId()
                            )

                            .roomType(
                                    room.getRoomType() != null
                                            ? room.getRoomType().name()
                                            : null
                            )

                            .rentPerBed(
                                    room.getRentPerBed()
                            )

                            .numberOfRooms(
                                    room.getNumberOfRooms()
                            )

                            .bedsPerRoom(
                                    room.getBedsPerRoom()
                            )

                            .totalBeds(
                                    room.getTotalBeds()
                            )

                            .occupiedRooms(
                                    room.getOccupiedRooms()
                            )

                            .occupiedBeds(
                                    room.getOccupiedBeds()
                            )

                            .photos(
                                    roomPhotos
                            )

                            .build()
            );
        }


        // =====================================================
        // 8. RULES
        // =====================================================

        HostelRules hostelRules =
                hostelRulesRepository
                        .findByHostel_HostelId(hostelId)
                        .orElse(null);


        PublicHostelDetailsResponse.RulesInfo rules =
                null;


        if (hostelRules != null) {

            rules =
                    PublicHostelDetailsResponse.RulesInfo
                            .builder()

                            .noSmoking(
                                    hostelRules.isNoSmoking()
                            )

                            .noAlcohol(
                                    hostelRules.isNoAlcohol()
                            )

                            .noPets(
                                    hostelRules.isNoPets()
                            )

                            .visitorsAllowed(
                                    hostelRules.isVisitorsAllowed()
                            )

                            .curfewEnabled(
                                    hostelRules.isCurfewEnabled()
                            )

                            .additionalRules(
                                    hostelRules.getAdditionalRules()
                            )

                            .build();
        }


        // =====================================================
        // 9. DEPOSIT POLICY
        // =====================================================

        HostelDepositPolicy depositPolicy =
                hostelDepositPolicyRepository
                        .findByHostel_HostelId(hostelId)
                        .orElse(null);


        PublicHostelDetailsResponse.DepositInfo deposit =
                null;


        if (depositPolicy != null) {

            deposit =
                    PublicHostelDetailsResponse.DepositInfo
                            .builder()

                            .id(
                                    depositPolicy.getId()
                            )

                            .refundPolicy(
                                    depositPolicy.getRefundPolicy()
                            )

                            .build();
        }


        // =====================================================
        // 10. FINAL RESPONSE
        // =====================================================

        return PublicHostelDetailsResponse
                .builder()

                .hostelId(
                        hostel.getHostelId()
                )

                .basicInfo(
                        basicInfo
                )

                .owner(
                        owner
                )

                .location(
                        locationInfo
                )

                .photos(
                        photos
                )

                .amenities(
                        amenities
                )

                .roomsPricing(
                        rooms
                )

                .rules(
                        rules
                )

                .deposit(
                        deposit
                )

                .build();
    }


    // =========================================================
    // HOSTEL PHOTO → RESPONSE
    // =========================================================

    private PublicHostelDetailsResponse.HostelPhotoInfo
    toHostelPhotoResponse(
            HostelPhoto photo
    ) {

        return PublicHostelDetailsResponse.HostelPhotoInfo
                .builder()

                .id(
                        photo.getId()
                )

                .photoType(
                        photo.getPhotoType() != null
                                ? photo.getPhotoType().name()
                                : null
                )

                .fileName(
                        photo.getFileName()
                )

                .fileUrl(
                        toPublicUploadUrl(
                                photo.getFileUrl()
                        )
                )

                .displayOrder(
                        photo.getDisplayOrder()
                )

                .build();
    }


    // =========================================================
    // ROOM PHOTO → RESPONSE
    // =========================================================

    private PublicHostelDetailsResponse.RoomPhotoInfo
    toRoomPhotoResponse(
            RoomPhoto photo
    ) {

        return PublicHostelDetailsResponse.RoomPhotoInfo
                .builder()

                .id(
                        photo.getId()
                )

                .roomId(
                        photo.getRoom() != null
                                ? photo.getRoom().getId()
                                : null
                )

                .fileName(
                        photo.getFileName()
                )

                .originalFileName(
                        photo.getOriginalFileName()
                )

                .fileUrl(
                        toPublicUploadUrl(
                                photo.getPhotoUrl()
                        )
                )

                .displayOrder(
                        photo.getDisplayOrder()
                )

                .build();
    }


    // =========================================================
    // FILE PATH → PUBLIC URL
    // =========================================================

    private String toPublicUploadUrl(
            String storedPath
    ) {

        if (storedPath == null ||
                storedPath.isBlank()) {

            return null;
        }


        String path =
                storedPath
                        .trim()
                        .replace("\\", "/");


        /*
         * Already a public URL.
         */

        if (path.startsWith("http://") ||
                path.startsWith("https://")) {

            return path;
        }


        /*
         * Already starts with /uploads.
         */

        if (path.startsWith("/uploads/")) {

            return path;
        }


        if (path.startsWith("uploads/")) {

            return "/" + path;
        }


        /*
         * Amenity photos are stored using a physical file path.
         *
         * The actual public static resource mapping is:
         *
         * /uploads/hostels/**
         *
         * So locate the "uploads/" portion and expose that portion.
         */

        int uploadsIndex =
                path.indexOf("uploads/");


        if (uploadsIndex >= 0) {

            return "/" +
                    path.substring(uploadsIndex);
        }


        /*
         * Last fallback:
         *
         * The database path may contain only the filename.
         *
         * Do not fabricate a different location.
         */

        return path.startsWith("/")
                ? path
                : "/" + path;
    }
}