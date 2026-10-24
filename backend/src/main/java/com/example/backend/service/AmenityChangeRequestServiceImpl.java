package com.example.backend.service;

import com.example.backend.dto.AmenityChangeRequestResponse;
import com.example.backend.dto.AmenityPhotoResponse;
import com.example.backend.entity.AmenityChangeRequest;
import com.example.backend.entity.AmenityChangeRequestStatus;
import com.example.backend.entity.AmenityChangeRequestType;
import com.example.backend.entity.AmenityPhoto;
import com.example.backend.entity.AmenityApprovalStatus;
import com.example.backend.entity.HostelAmenity;
import com.example.backend.entity.HostelBasicInfo;

import com.example.backend.repository.AmenityChangeRequestRepository;
import com.example.backend.repository.AmenityPhotoRepository;
import com.example.backend.repository.HostelAmenityRepository;
import com.example.backend.repository.HostelRepository;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AmenityChangeRequestServiceImpl
        implements AmenityChangeRequestService {

    private final AmenityChangeRequestRepository
            amenityChangeRequestRepository;

    private final HostelAmenityRepository
            hostelAmenityRepository;

    private final AmenityPhotoRepository
            amenityPhotoRepository;

    /*
     * Used to find the hostel sent by the owner.
     */
    private final HostelRepository hostelRepository;

    /*
     * We use the existing amenity service so that the
     * existing image-storage code is not duplicated.
     */
    private final HostelAmenityService hostelAmenityService;

    /*
     * Used to read the JSON array sent by Amenity.jsx.
     */
    private final ObjectMapper objectMapper;


    // =========================================================
    // GET ALL PENDING REQUESTS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<AmenityChangeRequestResponse>
    getPendingRequests() {

        List<AmenityChangeRequest> requests =
                amenityChangeRequestRepository
                        .findByStatusOrderBySubmittedAtAsc(
                                AmenityChangeRequestStatus.PENDING
                        );

        return requests.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }


    // =========================================================
    // GET REQUESTS FOR PARTICULAR HOSTEL
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<AmenityChangeRequestResponse>
    getRequestsByHostel(
            Long hostelId
    ) {

        if (hostelId == null) {

            throw new RuntimeException(
                    "Hostel ID is required"
            );
        }

        List<AmenityChangeRequest> requests =
                amenityChangeRequestRepository
                        .findByHostelHostelIdOrderBySubmittedAtDesc(
                                hostelId
                        );

        return requests.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }


    // =========================================================
    // OWNER - SUBMIT PENDING AMENITY REQUESTS
    // =========================================================

    @Override
    @Transactional
    public List<AmenityChangeRequestResponse>
    submitOwnerAmenityRequests(
            Long hostelId,
            String requests,
            MultipartHttpServletRequest multipartRequest
    ) {

        if (hostelId == null) {

            throw new RuntimeException(
                    "Hostel ID is required"
            );
        }

        if (requests == null ||
                requests.trim().isEmpty()) {

            throw new RuntimeException(
                    "Amenity requests are required"
            );
        }

        if (multipartRequest == null) {

            throw new RuntimeException(
                    "Multipart request is required"
            );
        }


        // =====================================================
        // FIND HOSTEL
        // =====================================================

        HostelBasicInfo hostel =
                hostelRepository
                        .findById(hostelId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Hostel not found: "
                                                + hostelId
                                )
                        );


        // =====================================================
        // PARSE REQUEST JSON
        // =====================================================

        JsonNode requestArray;

        try {

            requestArray =
                    objectMapper.readTree(
                            requests
                    );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Invalid amenity request JSON",
                    e
            );
        }


        if (requestArray == null ||
                !requestArray.isArray()) {

            throw new RuntimeException(
                    "Amenity requests must be a JSON array"
            );
        }


        List<AmenityChangeRequest> createdRequests =
                new ArrayList<>();


        // =====================================================
        // PROCESS NEW AMENITIES
        // =====================================================

        for (JsonNode node : requestArray) {

            String amenityCode =
                    getText(
                            node,
                            "amenityCode"
                    );

            String amenityName =
                    getText(
                            node,
                            "amenityName"
                    );

            boolean photoRequired =
                    !node.has("photoRequired")
                            || !node
                                    .get("photoRequired")
                                    .isBoolean()
                            || node
                                    .get("photoRequired")
                                    .asBoolean();


            // -------------------------------------------------
            // VALIDATION
            // -------------------------------------------------

            if (amenityCode == null ||
                    amenityCode.trim().isEmpty()) {

                throw new RuntimeException(
                        "Amenity code is required"
                );
            }

            if (amenityName == null ||
                    amenityName.trim().isEmpty()) {

                throw new RuntimeException(
                        "Amenity name is required"
                );
            }

            amenityCode =
                    amenityCode.trim();

            amenityName =
                    amenityName.trim();


            // =================================================
            // FIND EXISTING AMENITY
            // =================================================

            HostelAmenity amenity =
                    hostelAmenityRepository
                            .findByHostelHostelIdAndAmenityCode(
                                    hostelId,
                                    amenityCode
                            )
                            .orElse(null);


            // =================================================
            // CREATE NEW AMENITY
            // =================================================

            if (amenity == null) {

                amenity =
                        HostelAmenity.builder()
                                .hostel(hostel)
                                .amenityCode(
                                        amenityCode
                                )
                                .amenityName(
                                        amenityName
                                )
                                .photoRequired(
                                        photoRequired
                                )
                                .approvalStatus(
                                        AmenityApprovalStatus.PENDING
                                )
                                .build();

            } else {

                /*
                 * Existing amenity is being submitted again.
                 * Keep the existing record but mark the change
                 * as pending for admin review.
                 */

                amenity.setAmenityName(
                        amenityName
                );

                amenity.setPhotoRequired(
                        photoRequired
                );

                amenity.setApprovalStatus(
                        AmenityApprovalStatus.PENDING
                );
            }


            amenity =
                    hostelAmenityRepository.save(
                            amenity
                    );


            // =================================================
            // FIND PHOTO SENT WITH THIS AMENITY
            // =================================================

            MultipartFile photoFile =
                    multipartRequest.getFile(
                            "photo_" + amenityCode
                    );


            /*
             * Some frontend states may use the amenity ID
             * as the photo key. Try that as a fallback.
             */
            if (photoFile == null ||
                    photoFile.isEmpty()) {

                photoFile =
                        multipartRequest.getFile(
                                "photo_" + amenity.getId()
                        );
            }


            // =================================================
            // SAVE PHOTO
            // =================================================

            AmenityPhoto photo = null;

            if (photoFile != null &&
                    !photoFile.isEmpty()) {

                /*
                 * Uses the existing upload implementation.
                 *
                 * That method stores the actual file and creates
                 * AmenityPhoto with PENDING status.
                 */
                hostelAmenityService
                        .uploadAmenityPhoto(
                                amenity.getId(),
                                photoFile
                        );


                /*
                 * Get the photo that was just stored.
                 */
                photo =
                        amenityPhotoRepository
                                .findFirstByAmenityIdOrderByIdDesc(
                                        amenity.getId()
                                )
                                .orElse(null);
            }


            // =================================================
            // CHECK FOR EXISTING PENDING REQUEST
            // =================================================

            AmenityChangeRequest existingRequest =
                    amenityChangeRequestRepository
                            .findFirstByAmenityIdAndRequestTypeAndStatus(
                                    amenity.getId(),
                                    AmenityChangeRequestType.NEW_AMENITY,
                                    AmenityChangeRequestStatus.PENDING
                            )
                            .orElse(null);


            /*
             * Do not create duplicate pending requests when
             * the owner accidentally clicks Submit more than once.
             */
            if (existingRequest != null) {

                /*
                 * If a photo exists and the previous request did
                 * not contain one, attach the photo.
                 */
                if (existingRequest.getPhoto() == null &&
                        photo != null) {

                    existingRequest.setPhoto(
                            photo
                    );

                    amenityChangeRequestRepository.save(
                            existingRequest
                    );
                }

                continue;
            }


            // =================================================
            // CREATE ADMIN REVIEW REQUEST
            // =================================================

            AmenityChangeRequest changeRequest =
                    AmenityChangeRequest.builder()
                            .hostel(hostel)
                            .amenity(amenity)
                            .photo(photo)
                            .requestType(
                                    AmenityChangeRequestType.NEW_AMENITY
                            )
                            .status(
                                    AmenityChangeRequestStatus.PENDING
                            )
                            .submittedAt(
                                    LocalDateTime.now()
                            )
                            .build();


            AmenityChangeRequest savedRequest =
                    amenityChangeRequestRepository.save(
                            changeRequest
                    );

            createdRequests.add(
                    savedRequest
            );
        }


        // =====================================================
        // FIND RE-UPLOADED PHOTOS
        // =====================================================
        /*
         * Re-uploaded rejected photos are already stored as
         * PENDING by the photo-upload endpoint.
         *
         * The frontend currently sends new amenities inside
         * "requests". Re-uploaded photos may not be included
         * there, so we detect them here.
         */

        List<HostelAmenity> hostelAmenities =
                hostelAmenityRepository
                        .findByHostelHostelId(
                                hostelId
                        );


        for (HostelAmenity amenity : hostelAmenities) {

            AmenityPhoto photo =
                    amenityPhotoRepository
                            .findFirstByAmenityIdOrderByIdDesc(
                                    amenity.getId()
                            )
                            .orElse(null);

            if (photo == null) {
                continue;
            }


            /*
             * Only a PENDING photo needs to be sent to admin.
             */
            if (photo.getVerificationStatus() == null ||
                    photo.getVerificationStatus()
                            != com.example.backend.entity.VerificationStatus.PENDING) {

                continue;
            }


            // =================================================
            // CHECK WHETHER THIS PHOTO ALREADY HAS A REQUEST
            // =================================================

            boolean alreadySubmitted =
                    amenityChangeRequestRepository
                            .findByHostelHostelIdOrderBySubmittedAtDesc(
                                    hostelId
                            )
                            .stream()
                            .anyMatch(
                                    request ->

                                            request.getStatus()
                                                    == AmenityChangeRequestStatus.PENDING

                                            && request.getPhoto() != null

                                            && request.getPhoto()
                                                    .getId()
                                                    .equals(
                                                            photo.getId()
                                                    )
                            );


            if (alreadySubmitted) {
                continue;
            }


            // =================================================
            // CHECK WHETHER THIS IS A NEW AMENITY REQUEST
            // =================================================

            boolean alreadyNewAmenityRequest =
                    createdRequests
                            .stream()
                            .anyMatch(
                                    request ->

                                            request.getAmenity() != null

                                            && request.getAmenity()
                                                    .getId()
                                                    .equals(
                                                            amenity.getId()
                                                    )
                            );


            if (alreadyNewAmenityRequest) {
                continue;
            }


            // =================================================
            // CREATE RE-UPLOAD REQUEST
            // =================================================

            AmenityChangeRequest reuploadRequest =
                    AmenityChangeRequest.builder()
                            .hostel(hostel)
                            .amenity(amenity)
                            .photo(photo)
                            .requestType(
                                    AmenityChangeRequestType.REUPLOADED_PHOTO
                            )
                            .status(
                                    AmenityChangeRequestStatus.PENDING
                            )
                            .submittedAt(
                                    LocalDateTime.now()
                            )
                            .build();


            AmenityChangeRequest savedReuploadRequest =
                    amenityChangeRequestRepository.save(
                            reuploadRequest
                    );

            createdRequests.add(
                    savedReuploadRequest
            );
        }


        // =====================================================
        // RETURN CREATED REQUESTS
        // =====================================================

        return createdRequests
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }


    // =========================================================
    // APPROVE REQUEST
    // =========================================================

    @Override
    @Transactional
    public void approveRequest(
            Long requestId,
            Long adminId
    ) {

        if (requestId == null) {

            throw new RuntimeException(
                    "Request ID is required"
            );
        }

        if (adminId == null) {

            throw new RuntimeException(
                    "Admin ID is required"
            );
        }

        AmenityChangeRequest request =
                amenityChangeRequestRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Amenity change request not found: "
                                                + requestId
                                )
                        );


        if (request.getStatus()
                != AmenityChangeRequestStatus.PENDING) {

            throw new RuntimeException(
                    "Only pending requests can be approved"
            );
        }


        AmenityChangeRequestType requestType =
                request.getRequestType();


        // -----------------------------------------------------
        // NEW AMENITY
        // -----------------------------------------------------

        if (requestType
                == AmenityChangeRequestType.NEW_AMENITY) {

            HostelAmenity amenity =
                    request.getAmenity();

            if (amenity == null) {

                throw new RuntimeException(
                        "Amenity is missing for request: "
                                + requestId
                );
            }


            amenity.setApprovalStatus(
                    AmenityApprovalStatus.APPROVED
            );

            hostelAmenityRepository.save(
                    amenity
            );


            AmenityPhoto photo =
                    request.getPhoto();

            if (photo != null) {

                photo.setVerificationStatus(
                        com.example.backend.entity.VerificationStatus.APPROVED
                );

                photo.setRejectionReason(null);

                photo.setReviewedAt(
                        LocalDateTime.now()
                );

                photo.setReviewedBy(
                        adminId
                );

                amenityPhotoRepository.save(
                        photo
                );
            }
        }


        // -----------------------------------------------------
        // RE-UPLOADED PHOTO
        // -----------------------------------------------------

        else if (requestType
                == AmenityChangeRequestType.REUPLOADED_PHOTO) {

            AmenityPhoto photo =
                    request.getPhoto();

            if (photo == null) {

                throw new RuntimeException(
                        "Photo is missing for request: "
                                + requestId
                );
            }


            photo.setVerificationStatus(
                    com.example.backend.entity.VerificationStatus.APPROVED
            );

            photo.setRejectionReason(null);

            photo.setReviewedAt(
                    LocalDateTime.now()
            );

            photo.setReviewedBy(
                    adminId
            );

            amenityPhotoRepository.save(
                    photo
            );


            HostelAmenity amenity =
                    request.getAmenity();

            if (amenity != null
                    && amenity.getApprovalStatus() == null) {

                amenity.setApprovalStatus(
                        AmenityApprovalStatus.APPROVED
                );

                hostelAmenityRepository.save(
                        amenity
                );
            }
        }


        // -----------------------------------------------------
        // UPDATE REQUEST
        // -----------------------------------------------------

        request.setStatus(
                AmenityChangeRequestStatus.APPROVED
        );

        request.setReviewedAt(
                LocalDateTime.now()
        );

        request.setReviewedBy(
                adminId
        );

        request.setRejectionReason(null);

        amenityChangeRequestRepository.save(
                request
        );
    }


    // =========================================================
    // REJECT REQUEST
    // =========================================================

    @Override
    @Transactional
    public void rejectRequest(
            Long requestId,
            Long adminId,
            String rejectionReason
    ) {

        if (requestId == null) {

            throw new RuntimeException(
                    "Request ID is required"
            );
        }

        if (adminId == null) {

            throw new RuntimeException(
                    "Admin ID is required"
            );
        }

        if (rejectionReason == null
                || rejectionReason.trim().isEmpty()) {

            throw new RuntimeException(
                    "Rejection reason is required"
            );
        }


        AmenityChangeRequest request =
                amenityChangeRequestRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Amenity change request not found: "
                                                + requestId
                                )
                        );


        if (request.getStatus()
                != AmenityChangeRequestStatus.PENDING) {

            throw new RuntimeException(
                    "Only pending requests can be rejected"
            );
        }


        AmenityChangeRequestType requestType =
                request.getRequestType();


        // -----------------------------------------------------
        // NEW AMENITY
        // -----------------------------------------------------

        if (requestType
                == AmenityChangeRequestType.NEW_AMENITY) {

            HostelAmenity amenity =
                    request.getAmenity();

            if (amenity != null) {

                amenity.setApprovalStatus(
                        AmenityApprovalStatus.REJECTED
                );

                hostelAmenityRepository.save(
                        amenity
                );
            }


            AmenityPhoto photo =
                    request.getPhoto();

            if (photo != null) {

                photo.setVerificationStatus(
                        com.example.backend.entity.VerificationStatus.REJECTED
                );

                photo.setRejectionReason(
                        rejectionReason.trim()
                );

                photo.setReviewedAt(
                        LocalDateTime.now()
                );

                photo.setReviewedBy(
                        adminId
                );

                amenityPhotoRepository.save(
                        photo
                );
            }
        }


        // -----------------------------------------------------
        // RE-UPLOADED PHOTO
        // -----------------------------------------------------

        else if (requestType
                == AmenityChangeRequestType.REUPLOADED_PHOTO) {

            AmenityPhoto photo =
                    request.getPhoto();

            if (photo != null) {

                photo.setVerificationStatus(
                        com.example.backend.entity.VerificationStatus.REJECTED
                );

                photo.setRejectionReason(
                        rejectionReason.trim()
                );

                photo.setReviewedAt(
                        LocalDateTime.now()
                );

                photo.setReviewedBy(
                        adminId
                );

                amenityPhotoRepository.save(
                        photo
                );
            }
        }


        // -----------------------------------------------------
        // UPDATE REQUEST
        // -----------------------------------------------------

        request.setStatus(
                AmenityChangeRequestStatus.REJECTED
        );

        request.setReviewedAt(
                LocalDateTime.now()
        );

        request.setReviewedBy(
                adminId
        );

        request.setRejectionReason(
                rejectionReason.trim()
        );

        amenityChangeRequestRepository.save(
                request
        );
    }


    // =========================================================
    // ENTITY -> RESPONSE DTO
    // =========================================================

    private AmenityChangeRequestResponse
    toResponse(
            AmenityChangeRequest request
    ) {

        HostelAmenity amenity =
                request.getAmenity();

        AmenityPhoto photo =
                request.getPhoto();


        AmenityChangeRequestResponse response =
                AmenityChangeRequestResponse
                        .builder()
                        .id(
                                request.getId()
                        )
                        .requestType(
                                request.getRequestType()
                        )
                        .status(
                                request.getStatus()
                        )
                        .rejectionReason(
                                request.getRejectionReason()
                        )
                        .submittedAt(
                                request.getSubmittedAt()
                        )
                        .reviewedAt(
                                request.getReviewedAt()
                        )
                        .reviewedBy(
                                request.getReviewedBy()
                        )
                        .build();


        // -----------------------------------------------------
        // AMENITY INFORMATION
        // -----------------------------------------------------

        if (amenity != null) {

            response.setAmenityId(
                    amenity.getId()
            );

            response.setAmenityCode(
                    amenity.getAmenityCode()
            );

            response.setAmenityName(
                    amenity.getAmenityName()
            );

            response.setPhotoRequired(
                    amenity.isPhotoRequired()
            );


            if (amenity.getHostel() != null) {

                response.setHostelId(
                        amenity.getHostel()
                                .getHostelId()
                );
            }
        }


        // ---------------------------------------------------------
// PHOTO INFORMATION
// ---------------------------------------------------------

if (photo != null) {

    response.setPhotoId(
            photo.getId()
    );

    response.setPhotoUrl(
            "/api/owner/hostels/amenities/photos/"
                    + photo.getId()
    );

    response.setPhotoVerificationStatus(
            photo.getVerificationStatus() != null
                    ? photo.getVerificationStatus().name()
                    : null
    );
}


        return response;
    }


    // =========================================================
    // JSON HELPER
    // =========================================================

    private String getText(
            JsonNode node,
            String fieldName
    ) {

        if (node == null ||
                !node.has(fieldName) ||
                node.get(fieldName).isNull()) {

            return null;
        }

        return node.get(fieldName).asText();
    }

    // =========================================================
// OWNER - RE-UPLOAD REJECTED AMENITY PHOTO
// =========================================================

@Override
@Transactional
public AmenityChangeRequestResponse
reuploadRejectedAmenityPhoto(
        Long amenityId,
        MultipartFile file
) {

    if (amenityId == null) {

        throw new RuntimeException(
                "Amenity ID is required"
        );
    }

    if (file == null || file.isEmpty()) {

        throw new RuntimeException(
                "Re-uploaded photo is required"
        );
    }

    // =====================================================
    // FIND AMENITY
    // =====================================================

    HostelAmenity amenity =
            hostelAmenityRepository
                    .findById(amenityId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Amenity not found: "
                                            + amenityId
                            )
                    );

    HostelBasicInfo hostel =
            amenity.getHostel();

    if (hostel == null) {

        throw new RuntimeException(
                "Hostel not found for amenity: "
                        + amenityId
        );
    }

    // =====================================================
    // FIND EXISTING REJECTED PHOTO
    // =====================================================

    AmenityPhoto rejectedPhoto =
            amenityPhotoRepository
                    .findFirstByAmenityIdAndVerificationStatusOrderByIdDesc(
                            amenityId,
                            com.example.backend.entity.VerificationStatus.REJECTED
                    )
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "No rejected amenity photo found "
                                            + "for amenity: "
                                            + amenityId
                            )
                    );

    /*
     * IMPORTANT:
     * Preserve the previous rejection reason BEFORE the
     * photo service clears it.
     */
    String previousRejectionReason =
            rejectedPhoto.getRejectionReason();

    // =====================================================
    // REPLACE REJECTED PHOTO
    // =====================================================

    AmenityPhotoResponse photoResponse =
            hostelAmenityService
                    .reuploadRejectedAmenityPhoto(
                            amenityId,
                            file
                    );

    if (photoResponse == null ||
            photoResponse.getId() == null) {

        throw new RuntimeException(
                "Failed to re-upload amenity photo"
        );
    }

    AmenityPhoto updatedPhoto =
            amenityPhotoRepository
                    .findById(
                            photoResponse.getId()
                    )
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Re-uploaded amenity photo "
                                            + "could not be found"
                            )
                    );

    // =====================================================
    // CHECK FOR EXISTING PENDING REUPLOAD REQUEST
    // =====================================================

    AmenityChangeRequest existingRequest =
            amenityChangeRequestRepository
                    .findFirstByAmenityIdAndRequestTypeAndStatus(
                            amenityId,
                            AmenityChangeRequestType.REUPLOADED_PHOTO,
                            AmenityChangeRequestStatus.PENDING
                    )
                    .orElse(null);

    if (existingRequest != null) {

        /*
         * The photo was successfully replaced. Do not create
         * another duplicate pending request.
         */
        existingRequest.setPhoto(
                updatedPhoto
        );

        amenityChangeRequestRepository.save(
                existingRequest
        );

        return toResponse(
                existingRequest
        );
    }

    // =====================================================
    // CREATE RE-UPLOAD REVIEW REQUEST
    // =====================================================

    AmenityChangeRequest reuploadRequest =
            AmenityChangeRequest.builder()
                    .hostel(hostel)
                    .amenity(amenity)
                    .photo(updatedPhoto)
                    .requestType(
                            AmenityChangeRequestType.REUPLOADED_PHOTO
                    )
                    .status(
                            AmenityChangeRequestStatus.PENDING
                    )
                    .submittedAt(
                            LocalDateTime.now()
                    )
                    /*
                     * Preserve the reason that caused the
                     * original image to be rejected.
                     */
                    .rejectionReason(
                            previousRejectionReason
                    )
                    .build();

    AmenityChangeRequest savedRequest =
            amenityChangeRequestRepository.save(
                    reuploadRequest
            );

    return toResponse(
            savedRequest
    );
}

}