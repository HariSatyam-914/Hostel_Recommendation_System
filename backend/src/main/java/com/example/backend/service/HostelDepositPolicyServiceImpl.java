package com.example.backend.service;

import com.example.backend.dto.HostelDepositPolicyRequest;
import com.example.backend.dto.HostelDepositPolicyResponse;
import com.example.backend.entity.HostelBasicInfo;
import com.example.backend.entity.HostelDepositPolicy;
import com.example.backend.repository.HostelDepositPolicyRepository;
import com.example.backend.repository.HostelRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HostelDepositPolicyServiceImpl
        implements HostelDepositPolicyService {

    private final HostelDepositPolicyRepository depositPolicyRepository;
    private final HostelRepository hostelRepository;

    @Override
    public HostelDepositPolicyResponse saveDepositPolicy(
            Long hostelId,
            HostelDepositPolicyRequest request) {

        System.out.println("========== SAVE DEPOSIT POLICY ==========");
        System.out.println("Hostel ID: " + hostelId);

        // =====================================================
        // 1. VALIDATE HOSTEL
        // =====================================================

        HostelBasicInfo hostel = hostelRepository.findById(hostelId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Hostel not found with ID: " + hostelId
                        )
                );

        // =====================================================
        // 2. VALIDATE REQUEST
        // =====================================================

        if (request == null) {
            throw new RuntimeException(
                    "Deposit policy request cannot be null."
            );
        }

        String policy = request.getRefundPolicy();

        if (policy == null || policy.trim().isEmpty()) {

            throw new RuntimeException(
                    "Refund policy is required."
            );
        }

        // =====================================================
        // 3. NORMALIZE POLICY
        // =====================================================

        policy = policy.trim().toUpperCase();

        System.out.println(
                "Refund Policy: " + policy
        );

        // =====================================================
        // 4. VALIDATE ALLOWED VALUES
        // =====================================================

        if (!policy.equals("FLEXIBLE")
                && !policy.equals("MODERATE")
                && !policy.equals("STRICT")) {

            throw new RuntimeException(
                    "Invalid refund policy. " +
                    "Allowed values are FLEXIBLE, MODERATE, STRICT."
            );
        }

        // =====================================================
        // 5. CHECK EXISTING POLICY
        // =====================================================

        HostelDepositPolicy depositPolicy =
                depositPolicyRepository
                        .findByHostel_HostelId(hostelId)
                        .orElse(null);

        // =====================================================
        // 6. CREATE OR UPDATE
        // =====================================================

        String message;

        if (depositPolicy == null) {

            // -------------------------------------------------
            // FIRST TIME → CREATE
            // -------------------------------------------------

            System.out.println(
                    "No existing deposit policy found."
            );

            System.out.println(
                    "Creating new deposit policy."
            );

            depositPolicy =
                    HostelDepositPolicy.builder()
                            .hostel(hostel)
                            .refundPolicy(policy)
                            .build();

            message =
                    "Deposit policy saved successfully.";

        } else {

            // -------------------------------------------------
            // EXISTING RECORD → UPDATE
            // -------------------------------------------------

            System.out.println(
                    "Existing deposit policy found."
            );

            System.out.println(
                    "Updating existing deposit policy."
            );

            System.out.println(
                    "Old Policy: "
                    + depositPolicy.getRefundPolicy()
            );

            depositPolicy.setRefundPolicy(policy);

            message =
                    "Deposit policy updated successfully.";
        }

        // =====================================================
        // 7. SAVE
        // =====================================================

        HostelDepositPolicy saved =
                depositPolicyRepository.save(depositPolicy);

        System.out.println(
                "Deposit Policy ID: "
                + saved.getId()
        );

        System.out.println(
                "Saved Policy: "
                + saved.getRefundPolicy()
        );

        System.out.println(
                "========================================="
        );

        // =====================================================
        // 8. RETURN RESPONSE
        // =====================================================

        return HostelDepositPolicyResponse.builder()
                .id(saved.getId())
                .hostelId(hostelId)
                .refundPolicy(saved.getRefundPolicy())
                .message(message)
                .build();
    }


    // =========================================================
    // UPDATE DEPOSIT POLICY
    // =========================================================

    @Override
    public HostelDepositPolicyResponse updateDepositPolicy(
            Long hostelId,
            HostelDepositPolicyRequest request) {

        System.out.println("========== UPDATE DEPOSIT POLICY ==========");
        System.out.println("Hostel ID: " + hostelId);

        // =====================================================
        // 1. FIND EXISTING POLICY
        // =====================================================

        HostelDepositPolicy depositPolicy =
                depositPolicyRepository
                        .findByHostel_HostelId(hostelId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Deposit policy not found for hostel ID: "
                                                + hostelId
                                )
                        );

        // =====================================================
        // 2. VALIDATE REQUEST
        // =====================================================

        if (request == null) {
            throw new RuntimeException(
                    "Deposit policy request cannot be null."
            );
        }

        String policy = request.getRefundPolicy();

        if (policy == null || policy.trim().isEmpty()) {

            throw new RuntimeException(
                    "Refund policy is required."
            );
        }

        // =====================================================
        // 3. NORMALIZE POLICY
        // =====================================================

        policy = policy.trim().toUpperCase();

        // =====================================================
        // 4. VALIDATE POLICY
        // =====================================================

        if (!policy.equals("FLEXIBLE")
                && !policy.equals("MODERATE")
                && !policy.equals("STRICT")) {

            throw new RuntimeException(
                    "Invalid refund policy. " +
                    "Allowed values are FLEXIBLE, MODERATE, STRICT."
            );
        }

        // =====================================================
        // 5. UPDATE
        // =====================================================

        System.out.println(
                "Old Policy: "
                        + depositPolicy.getRefundPolicy()
        );

        System.out.println(
                "New Policy: "
                        + policy
        );

        depositPolicy.setRefundPolicy(policy);

        // =====================================================
        // 6. SAVE
        // =====================================================

        HostelDepositPolicy updated =
                depositPolicyRepository.save(depositPolicy);

        System.out.println(
                "Updated Deposit Policy ID: "
                        + updated.getId()
        );

        System.out.println(
                "==========================================="
        );

        // =====================================================
        // 7. RESPONSE
        // =====================================================

        return HostelDepositPolicyResponse.builder()
                .id(updated.getId())
                .hostelId(hostelId)
                .refundPolicy(updated.getRefundPolicy())
                .message(
                        "Deposit policy updated successfully."
                )
                .build();
    }

    // =========================================================
// GET DEPOSIT POLICY
// =========================================================

@Override
public HostelDepositPolicyResponse getDepositPolicy(
        Long hostelId) {

    System.out.println(
            "========== GET DEPOSIT POLICY =========="
    );

    System.out.println(
            "Hostel ID: " + hostelId
    );

    HostelDepositPolicy depositPolicy =
            depositPolicyRepository
                    .findByHostel_HostelId(hostelId)
                    .orElse(null);

    if (depositPolicy == null) {

        System.out.println(
                "No deposit policy found for hostel."
        );

        return null;
    }

    System.out.println(
            "Deposit Policy ID: "
                    + depositPolicy.getId()
    );

    System.out.println(
            "Refund Policy: "
                    + depositPolicy.getRefundPolicy()
    );

    System.out.println(
            "========================================"
    );

    return HostelDepositPolicyResponse.builder()
            .id(depositPolicy.getId())
            .hostelId(hostelId)
            .refundPolicy(depositPolicy.getRefundPolicy())
            .message("Deposit policy loaded successfully.")
            .build();
}


}