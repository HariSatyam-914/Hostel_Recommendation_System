package com.example.backend.service;

import com.example.backend.dto.HostelBasicInfoDetailsResponse;
import com.example.backend.dto.HostelBasicInfoRequest;
import com.example.backend.dto.HostelBasicInfoResponse;
import com.example.backend.entity.HostelApproval;
import com.example.backend.entity.HostelApprovalStatus;
import com.example.backend.entity.HostelBasicInfo;
import com.example.backend.entity.User;
import com.example.backend.repository.HostelApprovalRepository;
import com.example.backend.repository.HostelRepository;
import com.example.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HostelBasicInfoServiceImpl
        implements HostelBasicInfoService {

    private final HostelRepository hostelRepository;
    private final UserRepository userRepository;
    private final HostelApprovalRepository hostelApprovalRepository;

    @Override
    public HostelBasicInfoResponse saveBasicInfo(
            HostelBasicInfoRequest request,
            Authentication authentication) {

        // ==========================================
        // CHECK DUPLICATE PHONE NUMBER
        // ==========================================

        if (hostelRepository.existsByPhoneNumber(
                request.getPhoneNumber())) {

            throw new RuntimeException(
                    "Phone number already exists."
            );
        }

        // ==========================================
        // CHECK AUTHENTICATION
        // ==========================================

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated."
            );
        }

        // ==========================================
        // GET LOGGED-IN USER FROM JWT
        // ==========================================

        String email = authentication.getName();

        System.out.println(
                "Authenticated Owner Email: " + email
        );

        // ==========================================
        // FIND OWNER
        // ==========================================

        User owner = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found."
                        )
                );

        System.out.println(
                "Authenticated Owner Name: "
                        + owner.getName()
        );

        // ==========================================
        // CREATE HOSTEL
        // ==========================================

        HostelBasicInfo hostel =
                HostelBasicInfo.builder()
                        .hostelName(
                                request.getHostelName()
                        )
                        .hostelType(
                                request.getHostelType()
                        )

                        // IMPORTANT:
                        // Owner name comes from the
                        // authenticated user's account.
                        .ownerName(
                                owner.getName()
                        )

                        .phoneNumber(
                                request.getPhoneNumber()
                        )
                        .description(
                                request.getDescription()
                        )
                        .owner(owner)
                        .build();

        // ==========================================
        // SAVE
        // ==========================================

        HostelBasicInfo savedHostel =
                hostelRepository.save(hostel);

        // Create approval record as DRAFT
        HostelApproval approval =
                HostelApproval.builder()
                        .hostel(savedHostel)
                        .status(HostelApprovalStatus.DRAFT)
                        .build();

        hostelApprovalRepository.save(approval);

        // ==========================================
        // RESPONSE
        // ==========================================

        return HostelBasicInfoResponse.builder()
                .hostelId(
                        savedHostel.getHostelId()
                )
                .message(
                        "Basic information saved successfully."
                )
                .build();
    }

    @Override
    public HostelBasicInfoResponse updateBasicInfo(
            Long hostelId,
            HostelBasicInfoRequest request,
            Authentication authentication) {

        // ==========================================
        // CHECK AUTHENTICATION
        // ==========================================

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated."
            );
        }

        // ==========================================
        // GET LOGGED-IN USER
        // ==========================================

        String email = authentication.getName();

        User owner = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found."
                        )
                );

        System.out.println(
                "Authenticated Owner Email: " + email
        );

        System.out.println(
                "Authenticated Owner Name: "
                        + owner.getName()
        );

        // ==========================================
        // FIND HOSTEL
        // ==========================================

        HostelBasicInfo hostel =
                hostelRepository.findById(hostelId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Hostel not found"
                                )
                        );

        // ==========================================
        // FIND APPROVAL
        // ==========================================

        HostelApproval approval =
                hostelApprovalRepository
                        .findByHostel(hostel)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Approval record not found"
                                )
                        );

        // ==========================================
        // UPDATE BASIC INFORMATION
        // ==========================================

        hostel.setHostelName(
                request.getHostelName()
        );

        hostel.setHostelType(
                request.getHostelType()
        );

        // IMPORTANT:
        // Never use request.getOwnerName().
        // Always use the authenticated user's name.
        hostel.setOwnerName(
                owner.getName()
        );

        hostel.setPhoneNumber(
                request.getPhoneNumber()
        );

        hostel.setDescription(
                request.getDescription()
        );

        // ==========================================
        // SAVE
        // ==========================================

        hostelRepository.save(hostel);

        // ==========================================
        // RESPONSE
        // ==========================================

        return HostelBasicInfoResponse.builder()
                .hostelId(
                        hostel.getHostelId()
                )
                .message(
                        "Basic information updated successfully."
                )
                .approvalStatus(
                        approval.getStatus().name()
                )
                .build();
    }

    @Override
public HostelBasicInfoDetailsResponse getBasicInfo(
        Long hostelId,
        Authentication authentication) {

    // ==========================================
    // CHECK AUTHENTICATION
    // ==========================================

    if (authentication == null ||
            !authentication.isAuthenticated()) {

        throw new RuntimeException(
                "User is not authenticated."
        );
    }

    // ==========================================
    // FIND HOSTEL
    // ==========================================

    HostelBasicInfo hostel =
            hostelRepository.findById(hostelId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Hostel not found"
                            )
                    );

    // ==========================================
    // VERIFY OWNER
    // ==========================================

    if (hostel.getOwner() == null ||
            !hostel.getOwner()
                    .getEmail()
                    .equals(authentication.getName())) {

        throw new RuntimeException(
                "You are not authorized to access this hostel"
        );
    }

    // ==========================================
    // RETURN SAVED BASIC INFORMATION
    // ==========================================

    return HostelBasicInfoDetailsResponse.builder()
            .hostelId(hostel.getHostelId())
            .hostelName(hostel.getHostelName())
            .hostelType(hostel.getHostelType())
            .ownerName(hostel.getOwnerName())
            .phoneNumber(hostel.getPhoneNumber())
            .description(hostel.getDescription())
            .build();
}

}