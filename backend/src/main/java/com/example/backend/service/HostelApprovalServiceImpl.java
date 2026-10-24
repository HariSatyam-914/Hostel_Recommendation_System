package com.example.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.OwnerHostelStatusResponse;
import com.example.backend.entity.EmailVerificationStatus;
import com.example.backend.entity.HostelApproval;
import com.example.backend.entity.HostelApprovalStatus;
import com.example.backend.entity.HostelBasicInfo;
import com.example.backend.repository.HostelApprovalRepository;
import com.example.backend.repository.HostelRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HostelApprovalServiceImpl implements HostelApprovalService {

    private final HostelRepository hostelRepository;
    private final HostelApprovalRepository hostelApprovalRepository;

    // =========================================================
    // SUBMIT HOSTEL FOR APPROVAL
    // =========================================================

    @Override
    @Transactional
    public void submitForApproval(Long hostelId) {

        System.out.println("========== SUBMIT HOSTEL FOR APPROVAL ==========");
        System.out.println("Hostel ID: " + hostelId);

        HostelBasicInfo hostel = hostelRepository
                .findById(hostelId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Hostel not found with ID: " + hostelId
                        )
                );

        /*
         * IMPORTANT:
         *
         * A HostelApproval record is created only when the owner
         * actually submits the hostel for admin approval.
         *
         * Therefore:
         *
         * No approval record = DRAFT
         * Approval record with PENDING = submitted
         */

        HostelApproval approval = hostelApprovalRepository
                .findByHostel(hostel)
                .orElseGet(() ->
                        HostelApproval.builder()
                                .hostel(hostel)
                                .status(HostelApprovalStatus.PENDING)
                                .submittedAt(
                                        java.time.LocalDateTime.now()
                                )
                                .build()
                );

        /*
         * Every submission starts/restarts the admin approval
         * process from PENDING.
         */
        approval.setStatus(HostelApprovalStatus.PENDING);

        approval.setSubmittedAt(
                java.time.LocalDateTime.now()
        );

        /*
         * Clear previous admin review information when the owner
         * submits/resubmits the hostel.
         */
        approval.setReviewedAt(null);
        approval.setAdminComment(null);

        hostelApprovalRepository.save(approval);

        System.out.println(
                "Hostel successfully submitted for approval."
        );

        System.out.println(
                "Approval ID: " + approval.getId()
        );

        System.out.println(
                "Status: " + approval.getStatus()
        );

        System.out.println(
                "Submitted At: " + approval.getSubmittedAt()
        );

        System.out.println("===============================================");
    }


    // =========================================================
    // GET OWNER HOSTEL APPROVAL STATUS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public OwnerHostelStatusResponse getOwnerHostelStatus(
            String email) {

        System.out.println(
                "========== OWNER HOSTEL STATUS CHECK =========="
        );

        System.out.println(
                "Searching hostel for email: " + email
        );

        HostelBasicInfo hostel = hostelRepository
                .findByOwnerEmail(email)
                .orElse(null);

        System.out.println(
                "Found hostel: " +
                (hostel != null
                        ? hostel.getHostelId()
                        : "NULL")
        );


        // =====================================================
        // 1. OWNER HAS NO HOSTEL
        // =====================================================

        if (hostel == null) {

            System.out.println(
                    "No hostel found for owner."
            );

            System.out.println(
                    "Returning status: NO_HOSTEL"
            );

            System.out.println(
                    "==============================================="
            );

            return OwnerHostelStatusResponse.builder()
                    .hasHostel(false)
                    .status(null)
                    .hostelId(null)
                    .emailVerificationStatus(
                            "NOT_VERIFIED"
                    )
                    .build();
        }


        // =====================================================
        // GET OWNER EMAIL VERIFICATION STATUS
        // =====================================================

        String emailVerificationStatus = "NOT_VERIFIED";

        if (hostel.getOwner() != null &&
                hostel.getOwner().getEmailVerificationStatus() != null) {

            emailVerificationStatus =
                    hostel.getOwner()
                            .getEmailVerificationStatus()
                            .name();
        }

        System.out.println(
                "Owner email verification status: "
                        + emailVerificationStatus
        );


        // =====================================================
        // 2. CHECK APPROVAL RECORD
        // =====================================================

        HostelApproval approval = hostelApprovalRepository
                .findByHostel(hostel)
                .orElse(null);


        // =====================================================
        // 3. HOSTEL EXISTS BUT WAS NEVER SUBMITTED
        // =====================================================

        /*
         * No HostelApproval record means the owner was interrupted
         * while filling Add Hostel Details.
         *
         * Examples:
         *
         * - Internet failure
         * - Power shutdown
         * - Browser closed
         * - Application interrupted
         * - Owner left before final submission
         *
         * Therefore this is DRAFT.
         *
         * IMPORTANT:
         * Email verification MUST NOT override this.
         */

        if (approval == null) {

            System.out.println(
                    "Hostel exists but has NOT been submitted."
            );

            System.out.println(
                    "Returning status: DRAFT"
            );

            System.out.println(
                    "==============================================="
            );

            return OwnerHostelStatusResponse.builder()
                    .hasHostel(true)
                    .status(
                            HostelApprovalStatus.DRAFT.name()
                    )
                    .hostelId(hostel.getHostelId())
                    .emailVerificationStatus(
                            emailVerificationStatus
                    )
                    .build();
        }


        // =====================================================
        // 4. APPROVAL RECORD EXISTS
        // =====================================================

        HostelApprovalStatus approvalStatus =
                approval.getStatus();

        /*
         * If the database somehow contains a null status,
         * safely treat it as DRAFT rather than allowing an
         * invalid routing decision.
         */
        if (approvalStatus == null) {

            System.out.println(
                    "WARNING: Approval status is NULL."
            );

            System.out.println(
                    "Returning status: DRAFT"
            );

            System.out.println(
                    "==============================================="
            );

            return OwnerHostelStatusResponse.builder()
                    .hasHostel(true)
                    .status(
                            HostelApprovalStatus.DRAFT.name()
                    )
                    .hostelId(hostel.getHostelId())
                    .emailVerificationStatus(
                            emailVerificationStatus
                    )
                    .build();
        }


        // =====================================================
        // 5. DRAFT
        // =====================================================

        /*
         * DRAFT always goes back to Add Hostel Details.
         *
         * Email verification does NOT matter here.
         */

        if (approvalStatus == HostelApprovalStatus.DRAFT) {

            System.out.println(
                    "Hostel status is DRAFT."
            );

            System.out.println(
                    "Returning status: DRAFT"
            );

            System.out.println(
                    "==============================================="
            );

            return OwnerHostelStatusResponse.builder()
                    .hasHostel(true)
                    .status(
                            HostelApprovalStatus.DRAFT.name()
                    )
                    .hostelId(hostel.getHostelId())
                    .emailVerificationStatus(
                            emailVerificationStatus
                    )
                    .build();
        }


        // =====================================================
        // 6. PENDING
        // =====================================================

        /*
         * IMPORTANT:
         *
         * PENDING always means:
         *
         * Owner submitted the hostel.
         * Admin approval is still in progress.
         *
         * Even if the owner email is already verified,
         * the owner MUST remain on Approval Pending.
         *
         * Email verification MUST NOT override PENDING.
         */

        if (approvalStatus == HostelApprovalStatus.PENDING) {

            System.out.println(
                    "Hostel status is PENDING."
            );

            System.out.println(
                    "Admin approval is still in progress."
            );

            System.out.println(
                    "Returning status: PENDING"
            );

            System.out.println(
                    "==============================================="
            );

            return OwnerHostelStatusResponse.builder()
                    .hasHostel(true)
                    .status(
                            HostelApprovalStatus.PENDING.name()
                    )
                    .hostelId(hostel.getHostelId())
                    .emailVerificationStatus(
                            emailVerificationStatus
                    )
                    .build();
        }


        // =====================================================
        // 7. OWNER VERIFICATION PENDING
        // =====================================================

        /*
         * This state is set ONLY after the admin has completed
         * the required approval process and has initiated owner
         * email verification.
         *
         * Therefore this is the ONLY hostel state that should
         * send the owner to the OTP verification page.
         */

        if (approvalStatus ==
                HostelApprovalStatus.OWNER_VERIFICATION_PENDING) {

            System.out.println(
                    "Hostel status is OWNER_VERIFICATION_PENDING."
            );

            System.out.println(
                    "Owner must verify email using OTP."
            );

            System.out.println(
                    "Returning status: OWNER_VERIFICATION_PENDING"
            );

            System.out.println(
                    "==============================================="
            );

            return OwnerHostelStatusResponse.builder()
                    .hasHostel(true)
                    .status(
                            HostelApprovalStatus
                                    .OWNER_VERIFICATION_PENDING
                                    .name()
                    )
                    .hostelId(hostel.getHostelId())
                    .emailVerificationStatus(
                            emailVerificationStatus
                    )
                    .build();
        }


        // =====================================================
        // 8. APPROVED
        // =====================================================

        /*
         * APPROVED is the final state.
         *
         * Normally this should only happen after the owner has
         * successfully verified the OTP.
         *
         * Therefore:
         *
         * APPROVED + VERIFIED
         *       -> Dashboard
         *
         * APPROVED + NOT VERIFIED
         *       -> Owner Verification
         *
         * The second case is a safety fallback in case existing
         * database data is inconsistent.
         */

        if (approvalStatus == HostelApprovalStatus.APPROVED) {

            System.out.println(
                    "Hostel status is APPROVED."
            );

            if (hostel.getOwner() != null) {

                EmailVerificationStatus emailStatus =
                        hostel.getOwner()
                                .getEmailVerificationStatus();

                if (emailStatus ==
                        EmailVerificationStatus.VERIFIED) {

                    System.out.println(
                            "Owner email is VERIFIED."
                    );

                    System.out.println(
                            "Returning status: APPROVED"
                    );

                    System.out.println(
                            "Owner can access dashboard."
                    );

                    System.out.println(
                            "==============================================="
                    );

                    return OwnerHostelStatusResponse.builder()
                            .hasHostel(true)
                            .status(
                                    HostelApprovalStatus
                                            .APPROVED
                                            .name()
                            )
                            .hostelId(hostel.getHostelId())
                            .emailVerificationStatus(
                                    EmailVerificationStatus
                                            .VERIFIED
                                            .name()
                            )
                            .build();
                }
            }

            /*
             * Safety fallback:
             *
             * Database says APPROVED but owner email is not
             * verified.
             *
             * Do NOT allow dashboard access.
             */

            System.out.println(
                    "WARNING: Hostel is APPROVED but owner email "
                            + "is NOT VERIFIED."
            );

            System.out.println(
                    "Returning status: OWNER_VERIFICATION_PENDING"
            );

            System.out.println(
                    "==============================================="
            );

            return OwnerHostelStatusResponse.builder()
                    .hasHostel(true)
                    .status(
                            HostelApprovalStatus
                                    .OWNER_VERIFICATION_PENDING
                                    .name()
                    )
                    .hostelId(hostel.getHostelId())
                    .emailVerificationStatus(
                            emailVerificationStatus
                    )
                    .build();
        }


        // =====================================================
        // 9. REJECTED
        // =====================================================

        if (approvalStatus == HostelApprovalStatus.REJECTED) {

            System.out.println(
                    "Hostel status is REJECTED."
            );

            System.out.println(
                    "Returning status: REJECTED"
            );

            System.out.println(
                    "==============================================="
            );

            return OwnerHostelStatusResponse.builder()
                    .hasHostel(true)
                    .status(
                            HostelApprovalStatus.REJECTED.name()
                    )
                    .hostelId(hostel.getHostelId())
                    .emailVerificationStatus(
                            emailVerificationStatus
                    )
                    .build();
        }


        // =====================================================
        // 10. SUSPENDED
        // =====================================================

        if (approvalStatus == HostelApprovalStatus.SUSPENDED) {

            System.out.println(
                    "Hostel status is SUSPENDED."
            );

            System.out.println(
                    "Returning status: SUSPENDED"
            );

            System.out.println(
                    "==============================================="
            );

            return OwnerHostelStatusResponse.builder()
                    .hasHostel(true)
                    .status(
                            HostelApprovalStatus.SUSPENDED.name()
                    )
                    .hostelId(hostel.getHostelId())
                    .emailVerificationStatus(
                            emailVerificationStatus
                    )
                    .build();
        }


        // =====================================================
        // 11. PENDING ADMIN REUPLOAD REVIEW
        // =====================================================

        /*
         * The owner has updated/re-uploaded the rejected
         * information and clicked "Submit Review".
         *
         * This status means the updated information is now
         * waiting for Admin review.
         *
         * The owner must NOT be sent to the dashboard,
         * OTP verification, or Add Hostel Details page.
         */

        if (approvalStatus ==
                HostelApprovalStatus.PENDING_ADMIN_REUPLOAD_REVIEW) {

            System.out.println(
                    "Hostel status is PENDING_ADMIN_REUPLOAD_REVIEW."
            );

            System.out.println(
                    "Updated hostel information is waiting "
                            + "for Admin review."
            );

            System.out.println(
                    "Returning status: PENDING_ADMIN_REUPLOAD_REVIEW"
            );

            System.out.println(
                    "==============================================="
            );

            return OwnerHostelStatusResponse.builder()
                    .hasHostel(true)
                    .status(
                            HostelApprovalStatus
                                    .PENDING_ADMIN_REUPLOAD_REVIEW
                                    .name()
                    )
                    .hostelId(hostel.getHostelId())
                    .emailVerificationStatus(
                            emailVerificationStatus
                    )
                    .build();
        }


        // =====================================================
        // 12. SAFETY FALLBACK
        // =====================================================

        System.out.println(
                "WARNING: Unknown hostel approval status: "
                        + approvalStatus
        );

        System.out.println(
                "Returning status: DRAFT"
        );

        System.out.println(
                "==============================================="
        );

        return OwnerHostelStatusResponse.builder()
                .hasHostel(true)
                .status(
                        HostelApprovalStatus.DRAFT.name()
                )
                .hostelId(hostel.getHostelId())
                .emailVerificationStatus(
                        emailVerificationStatus
                )
                .build();
    }


    // =========================================================
    // SUBMIT UPDATED INFORMATION FOR ADMIN REUPLOAD REVIEW
    // =========================================================

    @Override
    @Transactional
    public void submitReview(Long hostelId) {

        System.out.println(
                "========== SUBMIT UPDATED REVIEW =========="
        );

        System.out.println(
                "Hostel ID: " + hostelId
        );

        HostelBasicInfo hostel = hostelRepository
                .findById(hostelId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Hostel not found with ID: " + hostelId
                        )
                );

        HostelApproval approval =
                hostelApprovalRepository
                        .findByHostel(hostel)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Hostel approval record not found"
                                )
                        );

        /*
         * Owner has completed the rejected-item updates and
         * clicked "Submit Review".
         *
         * Move the hostel into the dedicated Admin reupload
         * review queue.
         */
        approval.setStatus(
                HostelApprovalStatus.PENDING_ADMIN_REUPLOAD_REVIEW
        );

        approval.setSubmittedAt(
                java.time.LocalDateTime.now()
        );

        /*
         * This is a new review cycle, therefore the previous
         * admin review information must be cleared.
         */
        approval.setReviewedAt(null);
        approval.setAdminComment(null);

        hostelApprovalRepository.save(approval);

        System.out.println(
                "Hostel successfully submitted for "
                        + "Admin reupload review."
        );

        System.out.println(
                "Approval ID: " + approval.getId()
        );

        System.out.println(
                "Status: " + approval.getStatus()
        );

        System.out.println(
                "Submitted At: " + approval.getSubmittedAt()
        );

        System.out.println(
                "==========================================="
        );
    }
}