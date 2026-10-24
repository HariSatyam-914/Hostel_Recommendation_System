package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.OwnerHostelStatusResponse;
import com.example.backend.entity.HostelApproval;
import com.example.backend.entity.HostelApprovalStatus;
import com.example.backend.entity.HostelBasicInfo;
import com.example.backend.entity.HostelPhotoType;
import com.example.backend.repository.HostelAmenityRepository;
import com.example.backend.repository.HostelApprovalRepository;
import com.example.backend.repository.HostelDepositPolicyRepository;
import com.example.backend.repository.HostelLocationRepository;
import com.example.backend.repository.HostelPhotoRepository;
import com.example.backend.repository.HostelRepository;
import com.example.backend.repository.HostelRoomRepository;
import com.example.backend.repository.HostelRulesRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OwnerHostelStatusService {

    private final HostelRepository hostelRepository;

    private final HostelApprovalRepository hostelApprovalRepository;

    private final HostelLocationRepository hostelLocationRepository;

    private final HostelAmenityRepository hostelAmenityRepository;

    private final HostelRoomRepository hostelRoomRepository;

    private final HostelRulesRepository hostelRulesRepository;

    private final HostelDepositPolicyRepository hostelDepositPolicyRepository;

    private final HostelPhotoRepository hostelPhotoRepository;


    @Transactional(readOnly = true)
    public OwnerHostelStatusResponse getStatus(
            Authentication authentication) {

        String ownerEmail = authentication.getName();

        Optional<HostelBasicInfo> hostelOptional =
                hostelRepository.findByOwnerEmail(ownerEmail);

        /*
         * =====================================================
         * FRESH OWNER
         * =====================================================
         *
         * No HostelBasicInfo means the owner has never
         * successfully saved Step 1.
         */
        if (hostelOptional.isEmpty()) {

            return OwnerHostelStatusResponse.builder()
                    .hasHostel(false)
                    .hostelId(null)
                    .status(null)
                    .completedSteps(new ArrayList<>())
                    .lastSavedAt(null)
                    .build();
        }

        HostelBasicInfo hostel =
                hostelOptional.get();

        Long hostelId =
                hostel.getHostelId();


        /*
         * =====================================================
         * FIND APPROVAL STATUS
         * =====================================================
         */

        Optional<HostelApproval> approvalOptional =
                hostelApprovalRepository
                        .findByHostel_HostelId(hostelId);


        String status = null;

        LocalDateTime lastSavedAt = null;

        if (approvalOptional.isPresent()) {

            HostelApproval approval =
                    approvalOptional.get();

            HostelApprovalStatus approvalStatus =
                    approval.getStatus();

            if (approvalStatus != null) {
                status = approvalStatus.name();
            }

            lastSavedAt =
                    approval.getSubmittedAt();
        }


        /*
         * =====================================================
         * DETERMINE SAVED STEPS
         * =====================================================
         */

        List<Integer> completedSteps =
                new ArrayList<>();


        /*
         * STEP 0
         * BASIC INFO
         *
         * If HostelBasicInfo exists, Step 0 was saved.
         */
        completedSteps.add(0);


        /*
         * STEP 1
         * LOCATION
         */
        if (hostelLocationRepository
                .existsByHostel(hostel)) {

            completedSteps.add(1);
        }


        /*
         * STEP 2
         * AMENITIES
         */
        if (!hostelAmenityRepository
                .findByHostelHostelId(hostelId)
                .isEmpty()) {

            completedSteps.add(2);
        }


        /*
         * STEP 3
         * ROOMS
         */
        if (!hostelRoomRepository
                .findByHostel_HostelId(hostelId)
                .isEmpty()) {

            completedSteps.add(3);
        }


        /*
         * STEP 4
         * RULES
         */
        if (hostelRulesRepository
                .findByHostel_HostelId(hostelId)
                .isPresent()) {

            completedSteps.add(4);
        }


        /*
         * STEP 5
         * DEPOSIT POLICY / PRICING
         */
        if (hostelDepositPolicyRepository
                .existsByHostel_HostelId(hostelId)) {

            completedSteps.add(5);
        }


        /*
         * STEP 6
         * PHOTOS
         *
         * Your existing flow requires the cover image.
         * Therefore the photo step is considered saved
         * only when a COVER photo exists.
         */
        if (hostelPhotoRepository
                .findByHostel_HostelIdAndPhotoType(
                        hostelId,
                        HostelPhotoType.COVER
                )
                .isPresent()) {

            completedSteps.add(6);
        }


        /*
         * =====================================================
         * RETURN RESULT
         * =====================================================
         */

        return OwnerHostelStatusResponse.builder()
                .hasHostel(true)
                .hostelId(hostelId)
                .status(status)
                .completedSteps(completedSteps)
                .lastSavedAt(lastSavedAt)
                .build();
    }
}