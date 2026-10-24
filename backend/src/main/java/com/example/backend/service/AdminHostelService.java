package com.example.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.example.backend.dto.AdminHostelDetailResponse;
import com.example.backend.dto.AdminHostelResponse;
import com.example.backend.dto.HostelPhotoResponse;
import com.example.backend.dto.RoomPhotoResponse;

import com.example.backend.entity.AmenityPhoto;
import com.example.backend.entity.EmailVerificationStatus;
import com.example.backend.entity.HostelAmenity;
import com.example.backend.entity.HostelApproval;
import com.example.backend.entity.HostelApprovalStatus;
import com.example.backend.entity.HostelBasicInfo;
import com.example.backend.entity.HostelDepositPolicy;
import com.example.backend.entity.HostelLocation;
import com.example.backend.entity.HostelPhoto;
import com.example.backend.entity.HostelRoom;
import com.example.backend.entity.HostelRules;
import com.example.backend.entity.RoomPhoto;
import com.example.backend.entity.Review;
import com.example.backend.entity.Issue;
import com.example.backend.entity.IssueAttachment;
import com.example.backend.entity.IssueResponse;
import com.example.backend.entity.IssueStatusHistory;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;

import com.example.backend.repository.AmenityPhotoRepository;
import com.example.backend.repository.HostelAmenityRepository;
import com.example.backend.repository.HostelApprovalRepository;
import com.example.backend.repository.HostelLocationRepository;
import com.example.backend.repository.HostelPhotoRepository;
import com.example.backend.repository.HostelRoomRepository;
import com.example.backend.repository.HostelRulesRepository;
import com.example.backend.repository.RoomPhotoRepository;
import com.example.backend.repository.HostelDepositPolicyRepository;
import com.example.backend.repository.HostelRepository;
import com.example.backend.repository.ReviewRepository;
import com.example.backend.repository.IssueRepository;
import com.example.backend.repository.IssueAttachmentRepository;
import com.example.backend.repository.IssueResponseRepository;
import com.example.backend.repository.IssueStatusHistoryRepository;
import com.example.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminHostelService {

    private final HostelApprovalRepository hostelApprovalRepository;

    private final HostelLocationRepository hostelLocationRepository;

    private final HostelPhotoRepository hostelPhotoRepository;

    private final HostelAmenityRepository hostelAmenityRepository;

    private final AmenityPhotoRepository amenityPhotoRepository;

    private final HostelRoomRepository hostelRoomRepository;

    private final HostelRulesRepository hostelRulesRepository;

    private final HostelDepositPolicyRepository hostelDepositPolicyRepository;

    private final RoomPhotoRepository roomPhotoRepository;

    private final OwnerEmailVerificationService ownerEmailVerificationService;

    private final EmailService emailService;

    // =========================================================
    // PHASE 2 - ADDITIONAL REPOSITORIES
    // =========================================================

    private final HostelRepository hostelRepository;

    private final ReviewRepository reviewRepository;

    private final IssueRepository issueRepository;

    private final IssueAttachmentRepository issueAttachmentRepository;

    private final IssueResponseRepository issueResponseRepository;

    private final IssueStatusHistoryRepository issueStatusHistoryRepository;

    private final UserRepository userRepository;

    // =========================================================
    // TRANSACTION MANAGER
    // =========================================================
    //
    // Used only for OWNER account deletion AFTER the hostel
    // deletion transaction has successfully committed.
    //
    // =========================================================

    private final PlatformTransactionManager transactionManager;


    // =========================================================
    // GET ALL HOSTELS
    // =========================================================

    public List<AdminHostelResponse> getAllHostels() {

        return hostelApprovalRepository.findAll()

                .stream()

                .filter(approval ->
                        approval.getStatus() != null
                )

                .map(this::convertToResponse)

                .toList();
    }


    // =========================================================
    // SEND OWNER EMAIL OTP
    // =========================================================

    public void sendOwnerEmailOtp(Long hostelId) {

        ownerEmailVerificationService.sendOtp(hostelId);
    }


    // =========================================================
    // CONVERT ENTITY → ADMIN RESPONSE
    // =========================================================

    private AdminHostelResponse convertToResponse(
            HostelApproval approval) {

        HostelBasicInfo hostel = approval.getHostel();

        HostelLocation location =
                hostelLocationRepository
                        .findByHostel(hostel)
                        .orElse(null);

        return AdminHostelResponse.builder()

                .hostelId(
                        hostel.getHostelId()
                )

                .hostelName(
                        hostel.getHostelName()
                )

                .hostelType(
                        hostel.getHostelType()
                )

                .ownerName(
                        hostel.getOwnerName()
                )

                .ownerEmail(
                        hostel.getOwner() != null
                                ? hostel.getOwner().getEmail()
                                : null
                )

                .ownerPhone(
                        hostel.getOwner() != null
                                ? hostel.getOwner().getPhoneNo()
                                : null
                )

                .city(
                        location != null
                                ? location.getCity()
                                : null
                )

                .locality(
                        location != null
                                ? location.getArea()
                                : null
                )

                .approvalStatus(
                        approval.getStatus() != null
                                ? approval.getStatus().name()
                                : null
                )

                .submittedAt(
                        approval.getSubmittedAt()
                )

                .build();
    }


    // =========================================================
    // GET HOSTEL PHOTOS
    // =========================================================

    public List<HostelPhotoResponse> getHostelPhotos(
            Long hostelId) {

        return hostelPhotoRepository
                .findByHostel_HostelIdOrderByDisplayOrderAsc(hostelId)

                .stream()

                .map(photo ->
                        HostelPhotoResponse.builder()

                                .id(
                                        photo.getId()
                                )

                                .hostelId(
                                        hostelId
                                )

                                .photoType(
                                        photo.getPhotoType().name()
                                )

                                .fileName(
                                        photo.getFileName()
                                )

                                .fileUrl(
                                        photo.getFileUrl()
                                )

                                .displayOrder(
                                        photo.getDisplayOrder()
                                )

                                .verificationStatus(
                                        photo.getVerificationStatus() != null
                                                ? photo.getVerificationStatus().name()
                                                : null
                                )

                                .rejectionReason(
                                        photo.getRejectionReason()
                                )

                                .build()
                )

                .toList();
    }


    // =========================================================
    // GET COMPLETE HOSTEL DETAILS
    // =========================================================

    public AdminHostelDetailResponse getHostelDetails(
            Long hostelId) {

        // -----------------------------------------------------
        // FIND APPROVAL
        // -----------------------------------------------------

        HostelApproval approval =
                hostelApprovalRepository
                        .findByHostel_HostelId(hostelId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Hostel approval not found for hostel ID: "
                                                + hostelId
                                )
                        );


        HostelBasicInfo hostel =
                approval.getHostel();


        // -----------------------------------------------------
        // LOCATION
        // -----------------------------------------------------

        HostelLocation location =
                hostelLocationRepository
                        .findByHostel(hostel)
                        .orElse(null);


        // =====================================================
        // BASIC INFO
        // =====================================================

        AdminHostelDetailResponse.BasicInfo basicInfo =
                AdminHostelDetailResponse.BasicInfo.builder()

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
                                hostel.getOwner() != null
                                        ? hostel.getOwner().getPhoneNo()
                                        : null
                        )

                        .email(
                                hostel.getOwner() != null
                                        ? hostel.getOwner().getEmail()
                                        : null
                        )

                        .description(
                                hostel.getDescription()
                        )

                        .build();


        // =====================================================
        // OWNER
        // =====================================================

        AdminHostelDetailResponse.OwnerInfo owner =
                AdminHostelDetailResponse.OwnerInfo.builder()

                        .name(
                                hostel.getOwner() != null
                                        ? hostel.getOwner().getName()
                                        : hostel.getOwnerName()
                        )

                        .emailVerificationStatus(
                                hostel.getOwner() != null
                                        && hostel.getOwner()
                                                .getEmailVerificationStatus() != null
                                        ? hostel.getOwner()
                                                .getEmailVerificationStatus()
                                                .name()
                                        : "NOT_VERIFIED"
                        )

                        .email(
                                hostel.getOwner() != null
                                        ? hostel.getOwner().getEmail()
                                        : null
                        )

                        .build();


        // =====================================================
        // LOCATION INFO
        // =====================================================

        AdminHostelDetailResponse.LocationInfo locationInfo =
                null;

        if (location != null) {

            locationInfo =
                    AdminHostelDetailResponse.LocationInfo.builder()

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
        // AMENITIES
        // =====================================================

        List<HostelAmenity> hostelAmenities =
                hostelAmenityRepository
                        .findByHostelHostelId(hostelId);

        List<AdminHostelDetailResponse.AmenityInfo> amenities =
                hostelAmenities

                        .stream()

                        .map(amenity -> {

                            List<AmenityPhoto> amenityPhotos =
                                    amenityPhotoRepository
                                            .findByAmenityId(
                                                    amenity.getId()
                                            );

                            List<AdminHostelDetailResponse.AmenityPhotoInfo> photos =
                                    amenityPhotos

                                            .stream()

                                            .map(photo ->
                                                    AdminHostelDetailResponse.AmenityPhotoInfo
                                                            .builder()

                                                            .id(
                                                                    photo.getId()
                                                            )

                                                            .fileName(
                                                                    photo.getFileName()
                                                            )

                                                            .fileType(
                                                                    photo.getFileType()
                                                            )

                                                            .fileSize(
                                                                    photo.getFileSize()
                                                            )

                                                            .photoUrl(
                                                                    "/api/owner/hostels/amenities/photos/"
                                                                            + photo.getId()
                                                            )

                                                            .verificationStatus(
                                                                    photo.getVerificationStatus() != null
                                                                            ? photo.getVerificationStatus().name()
                                                                            : null
                                                            )

                                                            .rejectionReason(
                                                                    photo.getRejectionReason()
                                                            )

                                                            .uploadedAt(
                                                                    photo.getUploadedAt()
                                                            )

                                                            .reviewedAt(
                                                                    photo.getReviewedAt()
                                                            )

                                                            .reviewedBy(
                                                                    photo.getReviewedBy()
                                                            )

                                                            .build()
                                            )

                                            .toList();


                            return AdminHostelDetailResponse.AmenityInfo
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

                                    .photos(
                                            photos
                                    )

                                    .build();

                        })

                        .toList();


        // =====================================================
        // ROOMS & PRICING
        // =====================================================

        List<HostelRoom> hostelRooms =
                hostelRoomRepository.findByHostel_HostelId(
                        hostelId
                );

        List<AdminHostelDetailResponse.RoomInfo> roomsPricing =
                hostelRooms

                        .stream()

                        .map(room -> {

                            List<RoomPhoto> roomPhotos =
                                    roomPhotoRepository
                                            .findByRoom_IdOrderByDisplayOrderAsc(
                                                    room.getId()
                                            );

                            List<AdminHostelDetailResponse.RoomPhotoInfo> photos =
                                    roomPhotos

                                            .stream()

                                            .map(photo ->
                                                    AdminHostelDetailResponse.RoomPhotoInfo
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

                                                            .fileType(
                                                                    photo.getFileType()
                                                            )

                                                            .fileSize(
                                                                    photo.getFileSize()
                                                            )

                                                            .photoUrl(
                                                                    photo.getPhotoUrl()
                                                            )

                                                            .verificationStatus(
                                                                    photo.getVerificationStatus() != null
                                                                            ? photo.getVerificationStatus().name()
                                                                            : null
                                                            )

                                                            .rejectionReason(
                                                                    photo.getRejectionReason()
                                                            )

                                                            .uploadedAt(
                                                                    photo.getUploadedAt()
                                                            )

                                                            .reviewedAt(
                                                                    photo.getReviewedAt()
                                                            )

                                                            .reviewedBy(
                                                                    photo.getReviewedBy()
                                                            )

                                                            .displayOrder(
                                                                    photo.getDisplayOrder()
                                                            )

                                                            .build()
                                            )

                                            .toList();


                            return AdminHostelDetailResponse.RoomInfo
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

                                    .photos(
                                            photos
                                    )

                                    .build();

                        })

                        .toList();


        // =====================================================
        // RULES
        // =====================================================

        HostelRules hostelRules =
                hostelRulesRepository
                        .findByHostel_HostelId(hostelId)
                        .orElse(null);

        AdminHostelDetailResponse.RulesInfo rules =
                null;

        if (hostelRules != null) {

            rules =
                    AdminHostelDetailResponse.RulesInfo.builder()

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
        // DEPOSIT
        // =====================================================

        HostelDepositPolicy depositPolicy =
                hostelDepositPolicyRepository
                        .findByHostel_HostelId(hostelId)
                        .orElse(null);

        AdminHostelDetailResponse.DepositInfo deposit =
                null;

        if (depositPolicy != null) {

            deposit =
                    AdminHostelDetailResponse.DepositInfo
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
        // HOSTEL PHOTOS
        // =====================================================

        List<HostelPhotoResponse> hostelPhotos =
                hostelPhotoRepository
                        .findByHostel_HostelIdOrderByDisplayOrderAsc(
                                hostelId
                        )

                        .stream()

                        .map(photo ->
                                HostelPhotoResponse.builder()

                                        .id(
                                                photo.getId()
                                        )

                                        .hostelId(
                                                hostelId
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
                                                photo.getFileUrl()
                                        )

                                        .displayOrder(
                                                photo.getDisplayOrder()
                                        )

                                        .verificationStatus(
                                                photo.getVerificationStatus() != null
                                                        ? photo.getVerificationStatus().name()
                                                        : null
                                        )

                                        .rejectionReason(
                                                photo.getRejectionReason()
                                        )

                                        .build()
                        )

                        .toList();


        // =====================================================
        // FINAL RESPONSE
        // =====================================================

        return AdminHostelDetailResponse.builder()

                .hostelId(
                        hostel.getHostelId()
                )

                .approvalStatus(
                        approval.getStatus() != null
                                ? approval.getStatus().name()
                                : null
                )

                .submittedAt(
                        approval.getSubmittedAt()
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
                        hostelPhotos
                )

                .amenities(
                        amenities
                )

                .roomsPricing(
                        roomsPricing
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
    // GET AMENITY PHOTOS
    // =========================================================

    public List<AdminHostelDetailResponse.AmenityPhotoInfo> getAmenityPhotos(
            Long hostelId) {

        List<HostelAmenity> hostelAmenities =
                hostelAmenityRepository.findByHostelHostelId(
                        hostelId
                );

        return hostelAmenities

                .stream()

                .flatMap(amenity ->
                        amenityPhotoRepository
                                .findByAmenityId(
                                        amenity.getId()
                                )
                                .stream()
                )

                .map(photo ->
                        AdminHostelDetailResponse.AmenityPhotoInfo
                                .builder()

                                .id(
                                        photo.getId()
                                )

                                .fileName(
                                        photo.getFileName()
                                )

                                .fileType(
                                        photo.getFileType()
                                )

                                .fileSize(
                                        photo.getFileSize()
                                )

                                .photoUrl(
                                        "/api/owner/hostels/amenities/photos/"
                                                + photo.getId()
                                )

                                .verificationStatus(
                                        photo.getVerificationStatus() != null
                                                ? photo.getVerificationStatus().name()
                                                : null
                                )

                                .rejectionReason(
                                        photo.getRejectionReason()
                                )

                                .uploadedAt(
                                        photo.getUploadedAt()
                                )

                                .reviewedAt(
                                        photo.getReviewedAt()
                                )

                                .reviewedBy(
                                        photo.getReviewedBy()
                                )

                                .build()
                )

                .toList();
    }


    // =========================================================
    // GET ROOM PHOTOS
    // =========================================================

    @Transactional(readOnly = true)
    public List<RoomPhotoResponse> getRoomPhotos(
            Long hostelId) {

        List<RoomPhoto> photos =
                roomPhotoRepository
                        .findByRoom_Hostel_HostelIdOrderByDisplayOrderAsc(
                                hostelId
                        );

        return photos

                .stream()

                .map(photo ->
                        RoomPhotoResponse.builder()

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
                                        photo.getPhotoUrl()
                                )

                                .filePath(
                                        photo.getFilePath()
                                )

                                .displayOrder(
                                        photo.getDisplayOrder()
                                )

                                .verificationStatus(
                                        photo.getVerificationStatus() != null
                                                ? photo.getVerificationStatus().name()
                                                : null
                                )

                                .build()
                )

                .toList();
    }


    // =========================================================
// APPROVE HOSTEL
// =========================================================

@Transactional
public void approveHostel(Long hostelId) {

    System.out.println(
            "========== APPROVE HOSTEL =========="
    );

    System.out.println(
            "Hostel ID: " + hostelId
    );


    // ---------------------------------------------------------
    // FIND APPROVAL
    // ---------------------------------------------------------

    HostelApproval approval =
            hostelApprovalRepository
                    .findByHostel_HostelId(hostelId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Hostel approval not found for hostel ID: "
                                            + hostelId
                            )
                    );


    // ---------------------------------------------------------
    // APPROVAL MUST BE PENDING
    // ---------------------------------------------------------

    if (approval.getStatus() != HostelApprovalStatus.PENDING) {

        throw new RuntimeException(
                "Hostel cannot be approved in current status: "
                        + approval.getStatus()
        );
    }


    // ---------------------------------------------------------
    // GET HOSTEL
    // ---------------------------------------------------------

    HostelBasicInfo hostel =
            approval.getHostel();

    if (hostel == null) {

        throw new RuntimeException(
                "Hostel approval is not linked to a hostel."
        );
    }


    // ---------------------------------------------------------
    // OWNER MUST EXIST
    // ---------------------------------------------------------

    if (hostel.getOwner() == null) {

        throw new RuntimeException(
                "Hostel cannot be approved because the owner is not linked."
        );
    }


    // ---------------------------------------------------------
    // OWNER EMAIL MUST BE VERIFIED
    // ---------------------------------------------------------

    if (hostel.getOwner().getEmailVerificationStatus() == null ||

        hostel.getOwner().getEmailVerificationStatus()
                != EmailVerificationStatus.VERIFIED) {

        throw new RuntimeException(
                "Hostel cannot be approved until the owner successfully verifies the email OTP."
        );
    }


    // ---------------------------------------------------------
    // GET OWNER EMAIL
    // ---------------------------------------------------------

    String ownerEmail =
            hostel.getOwner().getEmail();

    if (ownerEmail == null ||
            ownerEmail.isBlank()) {

        throw new RuntimeException(
                "Hostel cannot be approved because the owner's email is missing."
        );
    }


    // ---------------------------------------------------------
    // GET OWNER NAME
    // ---------------------------------------------------------

    String ownerName =
            hostel.getOwner().getName();

    if (ownerName == null ||
            ownerName.isBlank()) {

        ownerName =
                hostel.getOwnerName();
    }

    if (ownerName == null ||
            ownerName.isBlank()) {

        ownerName = "Hostel Owner";
    }


    // ---------------------------------------------------------
    // GET HOSTEL NAME
    // ---------------------------------------------------------

    String hostelName =
            hostel.getHostelName();

    if (hostelName == null ||
            hostelName.isBlank()) {

        hostelName = "Your Hostel";
    }


    // ---------------------------------------------------------
    // ADMIN EXPLICITLY APPROVES HOSTEL
    // ---------------------------------------------------------

    approval.setStatus(
            HostelApprovalStatus.APPROVED
    );

    approval.setReviewedAt(
            java.time.LocalDateTime.now()
    );

    hostelApprovalRepository.save(
            approval
    );


    System.out.println(
            "Hostel status changed to APPROVED."
    );


    // =========================================================
    // APPROVAL EMAIL
    // =========================================================

    String emailBody =
            "<html>"
            + "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>"

            + "<p>Hello <b>" + ownerName + "</b>,</p>"

            + "<p>"
            + "Congratulations! We are pleased to inform you that your "
            + "hostel registration request has been "
            + "<b style='color: #16a34a;'>APPROVED</b> by the "
            + "FindMyHostel administration."
            + "</p>"

            + "<p>"
            + "<b>Owner Name:</b> " + ownerName + "<br>"
            + "<b>Hostel Name:</b> " + hostelName + "<br>"
            + "<b>Hostel ID:</b> " + hostelId + "<br>"
            + "<b>Status:</b> "
            + "<span style='color: #16a34a; font-weight: bold;'>APPROVED</span>"
            + "</p>"

            + "<p>"
            + "Your hostel registration has successfully completed the "
            + "administration's approval process."
            + "</p>"

            + "<p>"
            + "<b>Your hostel is now approved on FindMyHostel.</b> "
            + "You can log in using your registered email and password "
            + "credentials and access your owner dashboard."
            + "</p>"

            + "<p>"
            + "Please make sure that the information associated with your "
            + "hostel remains accurate and up to date."
            + "</p>"

            + "<p>"
            + "Thank you for choosing <b>FindMyHostel</b>."
            + "</p>"

            + "<p>"
            + "Regards,<br>"
            + "<b>FindMyHostel Administration</b>"
            + "</p>"

            + "</body>"
            + "</html>";


    // ---------------------------------------------------------
    // SEND APPROVAL EMAIL
    // ---------------------------------------------------------
    //
    // Email failure must NOT roll back the successful approval.
    //
    // ---------------------------------------------------------

    try {

        emailService.sendHtmlEmail(
                ownerEmail,
                "FindMyHostel - Hostel Registration Approved",
                emailBody
        );

        System.out.println(
                "Approval email sent successfully to: "
                        + ownerEmail
        );

    } catch (Exception emailException) {

        System.err.println(
                "WARNING: Hostel was approved, but the "
                        + "approval email could not be sent."
        );

        System.err.println(
                "Owner email: "
                        + ownerEmail
        );

        System.err.println(
                "Email error: "
                        + emailException.getMessage()
        );
    }


    // ---------------------------------------------------------
    // COMPLETE
    // ---------------------------------------------------------

    System.out.println(
            "Hostel approved successfully."
    );

    System.out.println(
            "Owner: " + ownerName
    );

    System.out.println(
            "Owner email: " + ownerEmail
    );

    System.out.println(
            "========== APPROVE HOSTEL COMPLETED =========="
    );
}


    // =========================================================
    // REJECT HOSTEL
    //
    // COMPLETE FLOW:
    //
    // 1. Set REJECTED
    // 2. Send rejection email
    // 3. Delete all hostel-related DB records
    // 4. Commit hostel deletion transaction
    // 5. Delete linked OWNER account in a new transaction
    // 6. Keep normal USER accounts
    // 7. Keep audit logs
    // 8. Delete physical files after DB commit
    // =========================================================

    @Transactional
    public void rejectHostel(Long hostelId) {

        System.out.println(
                "========== REJECT HOSTEL - COMPLETE PROCESS =========="
        );

        System.out.println(
                "Hostel ID: " + hostelId
        );


        // ---------------------------------------------------------
        // FIND APPROVAL
        // ---------------------------------------------------------

        HostelApproval approval =
                hostelApprovalRepository
                        .findByHostel_HostelId(hostelId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Hostel approval not found for hostel ID: "
                                                + hostelId
                                )
                        );


        // ---------------------------------------------------------
        // HOSTEL MUST BE IN A REVIEWABLE STATE
        // ---------------------------------------------------------

        if (approval.getStatus() != HostelApprovalStatus.PENDING &&

            approval.getStatus() !=
                    HostelApprovalStatus.PENDING_ADMIN_REUPLOAD_REVIEW) {

            throw new RuntimeException(
                    "Hostel cannot be rejected in current status: "
                            + approval.getStatus()
            );
        }


        // ---------------------------------------------------------
        // GET HOSTEL
        // ---------------------------------------------------------

        HostelBasicInfo hostel =
                approval.getHostel();

        if (hostel == null) {

            throw new RuntimeException(
                    "Hostel approval is not linked to a hostel."
            );
        }


        // ---------------------------------------------------------
        // OWNER MUST EXIST
        // ---------------------------------------------------------

        if (hostel.getOwner() == null) {

            throw new RuntimeException(
                    "Hostel cannot be rejected because the owner is not linked."
            );
        }


        // ---------------------------------------------------------
        // OWNER MUST BE AN OWNER ACCOUNT
        // ---------------------------------------------------------

        if (hostel.getOwner().getRole() != Role.OWNER) {

            throw new RuntimeException(
                    "Hostel cannot be rejected because the linked account "
                            + "is not an OWNER account."
            );
        }


        // ---------------------------------------------------------
        // OWNER EMAIL MUST EXIST
        // ---------------------------------------------------------

        String ownerEmail =
                hostel.getOwner().getEmail();

        if (ownerEmail == null ||
                ownerEmail.isBlank()) {

            throw new RuntimeException(
                    "Hostel cannot be rejected because the owner's email is missing."
            );
        }


        // ---------------------------------------------------------
        // MARK HOSTEL AS REJECTED
        // ---------------------------------------------------------

        approval.setStatus(
                HostelApprovalStatus.REJECTED
        );

        approval.setReviewedAt(
                java.time.LocalDateTime.now()
        );

        hostelApprovalRepository.save(approval);


        System.out.println(
                "Hostel status changed to REJECTED."
        );


        // ---------------------------------------------------------
        // OWNER NAME
        // ---------------------------------------------------------

        String ownerName =
                hostel.getOwner().getName();

        if (ownerName == null ||
                ownerName.isBlank()) {

            ownerName =
                    hostel.getOwnerName();
        }

        if (ownerName == null ||
                ownerName.isBlank()) {

            ownerName = "Hostel Owner";
        }


        // ---------------------------------------------------------
        // HOSTEL NAME
        // ---------------------------------------------------------

        String hostelName =
                hostel.getHostelName();

        if (hostelName == null ||
                hostelName.isBlank()) {

            hostelName = "your hostel";
        }


        // ---------------------------------------------------------
        // REJECTION EMAIL
        // ---------------------------------------------------------

        String emailBody =

        "<html>"

        + "<body style='font-family: Arial, sans-serif; line-height: 1.6;'>"

        + "<p>Hello <b>" + ownerName + "</b>,</p>"

        + "<p>"
        + "We regret to inform you that the hostel registration "
        + "submitted under your name has been "
        + "<b>REJECTED</b> by the FindMyHostel administration."
        + "</p>"

        + "<p>"
        + "<b>Owner Name:</b> " + ownerName + "<br>"
        + "<b>Hostel Name:</b> " + hostelName + "<br>"
        + "<b>Hostel ID:</b> " + hostelId + "<br>"
        + "<b>Status: REJECTED</b>"
        + "</p>"

        + "<p><b>These are the three main reasons your hostel "
        + "registration may be rejected:</b></p>"

        + "<ol>"

        + "<li>"
        + "<b>Invalid photos</b><br>"
        + "The uploaded hostel, room, amenity, or other photos "
        + "may be invalid, unclear, inappropriate, or not related "
        + "to the registered hostel."
        + "</li>"

        + "<br>"

        + "<li>"
        + "<b>Invalid information about location, name, or phone number</b><br>"
        + "The submitted hostel name, location, address, phone "
        + "number, or other registration information may be "
        + "incorrect, incomplete, or inconsistent."
        + "</li>"

        + "<br>"

        + "<li>"
        + "<b>Duplicate images and other fake information</b><br>"
        + "Duplicate images, misleading information, or other "
        + "fake or inaccurate details may have been detected in "
        + "the submitted registration."
        + "</li>"

        + "</ol>"

        + "<p>"
        + "<b>Based upon the above reasons, your hostel registration "
        + "has been rejected by the FindMyHostel administration.</b>"
        + "</p>"

        + "<p>"
        + "<b>Please register your hostel again</b> and provide the "
        + "<b>original, accurate, and complete information.</b> "
        + "Upload valid photos that genuinely belong to your hostel "
        + "and make sure that the location, hostel name, phone number, "
        + "and all other information are correct."
        + "</p>"

        + "<p>"
        + "<b>Please do not upload duplicate images or provide false "
        + "or misleading information.</b> Providing accurate and "
        + "original information will help the administration "
        + "review your hostel successfully."
        + "</p>"

        + "<p>"
        + "<b>Your rejected hostel registration and all hostel-related "
        + "information submitted for this registration will be permanently "
        + "removed from the system.</b>"
        + "</p>"

        // =========================================================
        // NEW IMPORTANT MESSAGE
        // =========================================================

        + "<p style='color: blue;'>"
        + "<b>"
        + "All the data related to your rejected hostel has been removed "
        + "from the system. You can use the same email and password "
        + "credentials to log in again. After logging in, you can enter "
        + "new data or accurate information for your hostel and submit "
        + "a new hostel request to the FindMyHostel administration."
        + "</b>"
        + "</p>"

        + "<p>"
        + "Your owner account remains active, and your existing login "
        + "credentials can be used for the new hostel registration."
        + "</p>"

        + "<p>"
        + "Thank you for using the <b>FindMyHostel</b> application."
        + "</p>"

        + "<p>"
        + "Regards,<br>"
        + "<b>FindMyHostel Administration</b>"
        + "</p>"

        + "</body>"

        + "</html>";


        // ---------------------------------------------------------
        // SEND REJECTION EMAIL
        // ---------------------------------------------------------

        try {

            emailService.sendHtmlEmail(
                    ownerEmail,
                    "FindMyHostel - Hostel Registration Rejected",
                    emailBody
            );

            System.out.println(
                    "Rejection email sent successfully to: "
                            + ownerEmail
            );

        } catch (Exception emailException) {

            System.err.println(
                    "WARNING: Hostel was rejected, but rejection "
                            + "email could not be sent."
            );

            System.err.println(
                    "Owner email: "
                            + ownerEmail
            );

            System.err.println(
                    "Email error: "
                            + emailException.getMessage()
            );
        }


        // =========================================================
        // DELETE ALL HOSTEL DATA
        // =========================================================

        deleteRejectedHostelData(
                hostelId,
                hostel,
                approval
        );


        System.out.println(
                "Rejection email step completed."
        );

        System.out.println(
                "Hostel database records deleted."
        );

        System.out.println(
                "OWNER account deletion scheduled after DB commit."
        );

        System.out.println(
                "Normal USER accounts were preserved."
        );

        System.out.println(
                "Audit logs were preserved."
        );

        System.out.println(
                "Physical hostel files will be deleted after DB commit."
        );

        System.out.println(
                "========== REJECT HOSTEL PROCESS COMPLETED =========="
        );
    }


    // =========================================================
    // PHASE 2 - PERMANENTLY DELETE REJECTED HOSTEL
    // =========================================================
    //
    // This endpoint is still kept so an already-REJECTED hostel
    // can also be permanently deleted directly.
    //
    // The actual deletion logic is shared with rejectHostel().
    //
    // Owner/User account handling:
    //
    // - Linked OWNER account is deleted after successful DB commit.
    // - Normal USER accounts are never deleted.
    // - Audit logs are never deleted.
    //
    // =========================================================

    @Transactional
    public void permanentlyDeleteRejectedHostel(
            Long hostelId) {

        System.out.println(
                "================================================="
        );

        System.out.println(
                "PHASE 2 - PERMANENT HOSTEL DELETION"
        );

        System.out.println(
                "Hostel ID: " + hostelId
        );

        System.out.println(
                "================================================="
        );


        // ---------------------------------------------------------
        // VALIDATE HOSTEL ID
        // ---------------------------------------------------------

        if (hostelId == null) {

            throw new RuntimeException(
                    "Hostel ID is required."
            );
        }


        // ---------------------------------------------------------
        // FIND HOSTEL
        // ---------------------------------------------------------

        HostelBasicInfo hostel =
                hostelRepository
                        .findById(hostelId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Hostel not found for hostel ID: "
                                                + hostelId
                                )
                        );


        // ---------------------------------------------------------
        // FIND APPROVAL
        // ---------------------------------------------------------

        HostelApproval approval =
                hostelApprovalRepository
                        .findByHostel_HostelId(hostelId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Hostel approval not found for hostel ID: "
                                                + hostelId
                                )
                        );


        // ---------------------------------------------------------
        // ONLY REJECTED HOSTELS CAN BE DELETED
        // ---------------------------------------------------------

        if (approval.getStatus() !=
                HostelApprovalStatus.REJECTED) {

            throw new RuntimeException(
                    "Hostel cannot be permanently deleted because "
                            + "its current status is: "
                            + approval.getStatus()
            );
        }


        // ---------------------------------------------------------
        // LINKED ACCOUNT MUST BE OWNER
        // ---------------------------------------------------------

        if (hostel.getOwner() != null &&
                hostel.getOwner().getRole() != Role.OWNER) {

            throw new RuntimeException(
                    "Hostel cannot be permanently deleted because "
                            + "the linked account is not an OWNER account."
            );
        }


        deleteRejectedHostelData(
                hostelId,
                hostel,
                approval
        );


        System.out.println(
                "================================================="
        );

        System.out.println(
                "PHASE 2 DATABASE DELETION COMPLETED"
        );

        System.out.println(
                "================================================="
        );
    }


    // =========================================================
    // SHARED REJECTED HOSTEL DELETION
    // =========================================================

    private void deleteRejectedHostelData(
            Long hostelId,
            HostelBasicInfo hostel,
            HostelApproval approval) {

        // ---------------------------------------------------------
        // CAPTURE OWNER BEFORE HOSTEL DELETION
        // ---------------------------------------------------------

        User owner =
                hostel.getOwner();

        if (owner != null &&
                owner.getRole() != Role.OWNER) {

            throw new RuntimeException(
                    "Refusing to delete the linked account because "
                            + "it is not an OWNER account."
            );
        }


        // =========================================================
        // COLLECT PHYSICAL FILE PATHS
        // =========================================================

        List<String> physicalFiles =
                new ArrayList<>();


        // =========================================================
        // 1. HOSTEL PHOTOS
        // =========================================================

        List<HostelPhoto> hostelPhotos =
                hostelPhotoRepository
                        .findByHostel_HostelIdOrderByDisplayOrderAsc(
                                hostelId
                        );

        for (HostelPhoto photo :
                hostelPhotos) {

            if (photo.getFileUrl() != null &&
                    !photo.getFileUrl().isBlank()) {

                physicalFiles.add(
                        photo.getFileUrl()
                );
            }
        }


        // =========================================================
        // 2. AMENITIES + AMENITY PHOTOS
        // =========================================================

        List<HostelAmenity> amenities =
                hostelAmenityRepository
                        .findByHostelHostelId(hostelId);

        for (HostelAmenity amenity :
                amenities) {

            List<AmenityPhoto> amenityPhotos =
                    amenityPhotoRepository
                            .findByAmenityId(
                                    amenity.getId()
                            );

            for (AmenityPhoto photo :
                    amenityPhotos) {

                if (photo.getFilePath() != null &&
                        !photo.getFilePath().isBlank()) {

                    physicalFiles.add(
                            photo.getFilePath()
                    );
                }
            }
        }


        // =========================================================
        // 3. ROOMS + ROOM PHOTOS
        // =========================================================

        List<HostelRoom> rooms =
                hostelRoomRepository
                        .findByHostel_HostelId(
                                hostelId
                        );

        for (HostelRoom room :
                rooms) {

            List<RoomPhoto> roomPhotos =
                    roomPhotoRepository
                            .findByRoom_IdOrderByDisplayOrderAsc(
                                    room.getId()
                            );

            for (RoomPhoto photo :
                    roomPhotos) {

                if (photo.getFilePath() != null &&
                        !photo.getFilePath().isBlank()) {

                    physicalFiles.add(
                            photo.getFilePath()
                    );
                }
            }
        }


        // =========================================================
        // 4. ISSUES
        // =========================================================

        List<Issue> issues =
                issueRepository
                        .findByHostelHostelIdOrderByCreatedAtDesc(
                                hostelId
                        );


        // =========================================================
        // ISSUE ATTACHMENTS
        // =========================================================

        List<IssueAttachment> issueAttachments =
                new ArrayList<>();

        for (Issue issue :
                issues) {

            List<IssueAttachment> attachments =
                    issueAttachmentRepository
                            .findByIssueIdOrderByUploadedAtAsc(
                                    issue.getId()
                            );

            issueAttachments.addAll(
                    attachments
            );

            for (IssueAttachment attachment :
                    attachments) {

                if (attachment.getFilePath() != null &&
                        !attachment.getFilePath().isBlank()) {

                    physicalFiles.add(
                            attachment.getFilePath()
                    );
                }
            }
        }


        // =========================================================
        // 5. LOAD ISSUE CHILD DATA ONCE
        // =========================================================

        Set<Long> issueIds =
                new HashSet<>();

        for (Issue issue :
                issues) {

            if (issue.getId() != null) {

                issueIds.add(
                        issue.getId()
                );
            }
        }


        List<IssueResponse> issueResponses =
                new ArrayList<>();

        if (!issueIds.isEmpty()) {

            issueResponses =
                    issueResponseRepository
                            .findAll()
                            .stream()
                            .filter(response ->
                                    response.getIssue() != null
                                            && response.getIssue().getId() != null
                                            && issueIds.contains(
                                                    response.getIssue().getId()
                                            )
                            )
                            .toList();
        }


        List<IssueStatusHistory> issueStatusHistories =
                new ArrayList<>();

        if (!issueIds.isEmpty()) {

            issueStatusHistories =
                    issueStatusHistoryRepository
                            .findAll()
                            .stream()
                            .filter(history ->
                                    history.getIssue() != null
                                            && history.getIssue().getId() != null
                                            && issueIds.contains(
                                                    history.getIssue().getId()
                                            )
                            )
                            .toList();
        }


        // =========================================================
        // 6. REVIEWS
        // =========================================================

        List<Review> reviews =
                reviewRepository
                        .findByHostelHostelIdOrderByCreatedAtDesc(
                                hostelId
                        );


        // =========================================================
        // 7. DELETE ISSUE ATTACHMENTS FROM DATABASE
        // =========================================================

        if (!issueAttachments.isEmpty()) {

            issueAttachmentRepository.deleteAll(
                    issueAttachments
            );
        }


        // =========================================================
        // 8. DELETE ISSUE RESPONSES
        // =========================================================

        if (!issueResponses.isEmpty()) {

            issueResponseRepository.deleteAll(
                    issueResponses
            );
        }


        // =========================================================
        // 9. DELETE ISSUE STATUS HISTORY
        // =========================================================

        if (!issueStatusHistories.isEmpty()) {

            issueStatusHistoryRepository.deleteAll(
                    issueStatusHistories
            );
        }


        // =========================================================
        // 10. DELETE ISSUES
        // =========================================================

        if (!issues.isEmpty()) {

            issueRepository.deleteAll(
                    issues
            );
        }


        // =========================================================
        // 11. DELETE REVIEWS
        // =========================================================

        if (!reviews.isEmpty()) {

            reviewRepository.deleteAll(
                    reviews
            );
        }


        // =========================================================
        // 12. DELETE AMENITY PHOTOS
        // =========================================================

        for (HostelAmenity amenity :
                amenities) {

            List<AmenityPhoto> amenityPhotos =
                    amenityPhotoRepository
                            .findByAmenityId(
                                    amenity.getId()
                            );

            if (!amenityPhotos.isEmpty()) {

                amenityPhotoRepository.deleteAll(
                        amenityPhotos
                );
            }
        }


        // =========================================================
        // 13. DELETE AMENITIES
        // =========================================================

        if (!amenities.isEmpty()) {

            hostelAmenityRepository.deleteAll(
                    amenities
            );
        }


        // =========================================================
        // 14. DELETE ROOM PHOTOS
        // =========================================================

        for (HostelRoom room :
                rooms) {

            List<RoomPhoto> roomPhotos =
                    roomPhotoRepository
                            .findByRoom_IdOrderByDisplayOrderAsc(
                                    room.getId()
                            );

            if (!roomPhotos.isEmpty()) {

                roomPhotoRepository.deleteAll(
                        roomPhotos
                );
            }
        }


        // =========================================================
        // 15. DELETE ROOMS
        // =========================================================

        if (!rooms.isEmpty()) {

            hostelRoomRepository.deleteAll(
                    rooms
            );
        }


        // =========================================================
        // 16. DELETE HOSTEL PHOTOS
        // =========================================================

        if (!hostelPhotos.isEmpty()) {

            hostelPhotoRepository.deleteAll(
                    hostelPhotos
            );
        }


        // =========================================================
        // 17. DELETE LOCATION
        // =========================================================

        HostelLocation location =
                hostelLocationRepository
                        .findByHostel(hostel)
                        .orElse(null);

        if (location != null) {

            hostelLocationRepository.delete(
                    location
            );
        }


        // =========================================================
        // 18. DELETE RULES
        // =========================================================

        HostelRules rules =
                hostelRulesRepository
                        .findByHostel_HostelId(hostelId)
                        .orElse(null);

        if (rules != null) {

            hostelRulesRepository.delete(
                    rules
            );
        }


        // =========================================================
        // 19. DELETE DEPOSIT POLICY
        // =========================================================

        HostelDepositPolicy depositPolicy =
                hostelDepositPolicyRepository
                        .findByHostel_HostelId(
                                hostelId
                        )
                        .orElse(null);

        if (depositPolicy != null) {

            hostelDepositPolicyRepository.delete(
                    depositPolicy
            );
        }


        // =========================================================
        // 20. DELETE HOSTEL APPROVAL
        // =========================================================

        hostelApprovalRepository.delete(
                approval
        );


        // =========================================================
        // 21. DELETE HOSTEL BASIC INFO
        // =========================================================

        hostelRepository.delete(
                hostel
        );


        // =========================================================
        // FLUSH HOSTEL DATABASE DELETE OPERATIONS
        // =========================================================

        hostelRepository.flush();


        // =========================================================
        // CAPTURE OWNER INFORMATION
        // =========================================================
        //
        // IMPORTANT:
        //
        // The OWNER is intentionally NOT deleted here.
        //
        // The hostel transaction must first commit successfully.
        //
        // This prevents a foreign-key problem involving the USER
        // table from rolling back the hostel rejection.
        //
        // =========================================================

        final Long ownerId =
                owner != null
                        ? owner.getId()
                        : null;

        final String ownerEmail =
                owner != null
                        ? owner.getEmail()
                        : null;


        if (ownerId != null) {

            System.out.println(
                    "OWNER account deletion scheduled for after commit."
            );

            System.out.println(
                    "OWNER ID: " + ownerId
            );

            System.out.println(
                    "OWNER email: " + ownerEmail
            );
        }


        // =========================================================
        // 22. COLLECT UNIQUE PHYSICAL FILE PATHS
        // =========================================================

        List<String> uniquePhysicalFiles =
                physicalFiles
                        .stream()
                        .filter(path ->
                                path != null &&
                                !path.isBlank()
                        )
                        .distinct()
                        .toList();


        // =========================================================
        // 23. AFTER-COMMIT CLEANUP
        // =========================================================
        //
        // Two operations are performed after the main transaction
        // successfully commits:
        //
        // 1. Delete the linked OWNER account in a REQUIRES_NEW
        //    transaction.
        //
        // 2. Delete physical hostel files.
        //
        // The OWNER deletion is intentionally isolated from the
        // hostel deletion transaction so a USER foreign-key issue
        // cannot roll back the rejection.
        //
        // =========================================================

        if (ownerId != null ||
                !uniquePhysicalFiles.isEmpty()) {

            if (!TransactionSynchronizationManager
                    .isSynchronizationActive()) {

                throw new IllegalStateException(
                        "Transaction synchronization is not active."
                );
            }


            TransactionSynchronizationManager
                    .registerSynchronization(
                            new TransactionSynchronization() {

                                @Override
                                public void afterCommit() {

                                    // =================================================
                                    // A. DELETE OWNER ACCOUNT
                                    // =================================================

                                    if (ownerId != null) {

                                        try {

                                            TransactionTemplate transactionTemplate =
                                                    new TransactionTemplate(
                                                            transactionManager
                                                    );

                                            transactionTemplate
                                                    .setPropagationBehavior(
                                                            TransactionDefinition
                                                                    .PROPAGATION_REQUIRES_NEW
                                                    );

                                            transactionTemplate.executeWithoutResult(
                                                    status -> {

                                                        User ownerAccount =
                                                                userRepository
                                                                        .findById(
                                                                                ownerId
                                                                        )
                                                                        .orElse(null);

                                                        if (ownerAccount == null) {

                                                            System.out.println(
                                                                    "OWNER account was already deleted. OWNER ID: "
                                                                            + ownerId
                                                            );

                                                            return;
                                                        }


                                                        if (ownerAccount.getRole()
                                                                != Role.OWNER) {

                                                            System.err.println(
                                                                    "WARNING: Account with ID "
                                                                            + ownerId
                                                                            + " is no longer an OWNER. "
                                                                            + "Account deletion skipped."
                                                            );

                                                            return;
                                                        }


                                                        userRepository.delete(
                                                                ownerAccount
                                                        );

                                                        userRepository.flush();


                                                        System.out.println(
                                                                "OWNER account deleted successfully "
                                                                        + "after hostel transaction commit."
                                                        );

                                                        System.out.println(
                                                                "Deleted OWNER ID: "
                                                                        + ownerId
                                                        );

                                                        System.out.println(
                                                                "Deleted OWNER email: "
                                                                        + ownerEmail
                                                        );
                                                    }
                                            );

                                        } catch (Exception ownerDeleteException) {

                                            /*
                                             * IMPORTANT:
                                             *
                                             * The hostel rejection has already
                                             * committed successfully.
                                             *
                                             * Therefore an OWNER deletion
                                             * failure must NOT change the
                                             * rejection result.
                                             */

                                            System.err.println(
                                                    "WARNING: Hostel rejection and "
                                                            + "hostel-data deletion succeeded, "
                                                            + "but OWNER account deletion failed."
                                            );

                                            System.err.println(
                                                    "OWNER ID: "
                                                            + ownerId
                                            );

                                            System.err.println(
                                                    "OWNER email: "
                                                            + ownerEmail
                                            );

                                            System.err.println(
                                                    "OWNER deletion error: "
                                                            + ownerDeleteException
                                                                    .getMessage()
                                            );
                                        }
                                    }


                                    // =================================================
                                    // B. DELETE PHYSICAL FILES
                                    // =================================================

                                    if (!uniquePhysicalFiles.isEmpty()) {

                                        System.out.println(
                                                "Database transaction committed successfully."
                                        );

                                        System.out.println(
                                                "Starting physical file cleanup..."
                                        );


                                        for (String physicalFile :
                                                uniquePhysicalFiles) {

                                            try {

                                                deleteStoredFile(
                                                        physicalFile
                                                );

                                            } catch (Exception fileException) {

                                                /*
                                                 * Database deletion has already
                                                 * committed at this point.
                                                 *
                                                 * Therefore we must not throw an
                                                 * exception that could make the
                                                 * caller think the database
                                                 * deletion was rolled back.
                                                 */

                                                System.err.println(
                                                        "WARNING: Database record was deleted, "
                                                                + "but physical file could not be deleted."
                                                );

                                                System.err.println(
                                                        "File: "
                                                                + physicalFile
                                                );

                                                System.err.println(
                                                        "Error: "
                                                                + fileException.getMessage()
                                                );
                                            }
                                        }


                                        System.out.println(
                                                "Physical file cleanup completed."
                                        );
                                    }
                                }
                            }
                    );
        }


        // =========================================================
        // IMPORTANT RECORDS PRESERVED
        // =========================================================

        System.out.println(
                "Normal USER accounts were NOT deleted."
        );

        System.out.println(
                "Audit logs were NOT deleted."
        );


        // =========================================================
        // COMPLETE
        // =========================================================

        System.out.println(
                "Hostel-related database deletion completed."
        );

        System.out.println(
                "OWNER account deletion was scheduled after successful DB commit."
        );

        System.out.println(
                "Physical files will be deleted after successful DB commit."
        );

        System.out.println(
                "================================================="
        );
    }


    // =========================================================
    // DELETE STORED FILE SAFELY
    // =========================================================
    //
    // Supports:
    //
    // /uploads/hostels/...
    // uploads/hostels/...
    // /uploads/rooms/...
    // uploads/rooms/...
    // /uploads/issues/...
    // uploads/issues/...
    //
    // Also supports absolute paths when they are located inside
    // the application's uploads directory.
    //
    // =========================================================

    private void deleteStoredFile(
            String storedPath) {

        if (storedPath == null ||
                storedPath.isBlank()) {

            return;
        }


        try {

            String normalized =
                    storedPath
                            .trim()
                            .replace('\\', '/');


            Path projectRoot =
                    Paths.get(
                            System.getProperty("user.dir")
                    )
                    .toAbsolutePath()
                    .normalize();


            Path uploadsRoot =
                    projectRoot
                            .resolve("uploads")
                            .toAbsolutePath()
                            .normalize();


            Path candidate;


            // -------------------------------------------------
            // CASE 1:
            //
            // /uploads/hostels/file.jpeg
            // -------------------------------------------------

            if (normalized.startsWith(
                    "/uploads/")) {

                normalized =
                        normalized.substring(
                                "/uploads/".length()
                        );


                candidate =
                        uploadsRoot
                                .resolve(normalized)
                                .normalize();
            }


            // -------------------------------------------------
            // CASE 2:
            //
            // uploads/hostels/file.jpeg
            // -------------------------------------------------

            else if (normalized.startsWith(
                    "uploads/")) {

                normalized =
                        normalized.substring(
                                "uploads/".length()
                        );


                candidate =
                        uploadsRoot
                                .resolve(normalized)
                                .normalize();
            }


            // -------------------------------------------------
            // CASE 3:
            //
            // Absolute filesystem path
            // -------------------------------------------------

            else {

                Path suppliedPath =
                        Paths.get(normalized);


                if (suppliedPath.isAbsolute()) {

                    candidate =
                            suppliedPath
                                    .toAbsolutePath()
                                    .normalize();

                } else {

                    candidate =
                            projectRoot
                                    .resolve(normalized)
                                    .toAbsolutePath()
                                    .normalize();
                }
            }


            // -------------------------------------------------
            // SECURITY CHECK
            // -------------------------------------------------
            //
            // Never allow a database value to delete a file
            // outside the application's uploads directory.
            //
            // -------------------------------------------------

            if (!candidate.startsWith(
                    uploadsRoot)) {

                throw new RuntimeException(
                        "Unsafe stored file path rejected: "
                                + storedPath
                );
            }


            // -------------------------------------------------
            // DELETE FILE
            // -------------------------------------------------

            if (Files.exists(candidate)) {

                Files.delete(candidate);

                System.out.println(
                        "Deleted physical file: "
                                + candidate
                );

            } else {

                System.out.println(
                        "Physical file already missing: "
                                + candidate
                );
            }

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to delete physical file: "
                            + storedPath,
                    e
            );
        }
    }
}