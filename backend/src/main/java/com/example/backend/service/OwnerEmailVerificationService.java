package com.example.backend.service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.OwnerEmailVerificationStatusResponse;
import com.example.backend.entity.EmailVerificationOtp;
import com.example.backend.entity.EmailVerificationStatus;
import com.example.backend.entity.HostelApproval;
import com.example.backend.entity.HostelApprovalStatus;
import com.example.backend.entity.HostelBasicInfo;
import com.example.backend.entity.User;
import com.example.backend.repository.EmailVerificationOtpRepository;
import com.example.backend.repository.HostelApprovalRepository;
import com.example.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OwnerEmailVerificationService {

    private final HostelApprovalRepository hostelApprovalRepository;

    private final EmailVerificationOtpRepository emailVerificationOtpRepository;

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final EmailService emailService;

    private final MailpitEmailService mailpitEmailService;

    private final SecureRandom secureRandom = new SecureRandom();

    private static final int OTP_EXPIRY_MINUTES = 5;

    private static final int RESEND_COOLDOWN_SECONDS = 60;

    private static final String OTP_PURPOSE =
            "OWNER_EMAIL_VERIFICATION";


@Value("${app.owner-verification-email.provider:gmail}")
private String ownerVerificationEmailProvider;

    // =========================================================
    // ADMIN - SEND OTP
    // =========================================================

    @Transactional
    public void sendOtp(Long hostelId) {

        User owner = getOwnerFromHostel(hostelId);

        String email = owner.getEmail();

        if (email == null || email.isBlank()) {

            throw new RuntimeException(
                    "Owner registered email is not available."
            );
        }

        HostelApproval approval =
                hostelApprovalRepository
                        .findByHostel_HostelId(hostelId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Hostel approval not found for hostel ID: "
                                                + hostelId
                                )
                        );

        /*
         * =====================================================
         * IMPORTANT
         * =====================================================
         *
         * Sending the OTP does NOT change the hostel approval
         * status.
         *
         * The hostel remains:
         *
         *      PENDING
         *
         * Only the OWNER EMAIL verification status changes to:
         *
         *      OTP_SENT
         *
         * The final hostel approval must always be performed
         * explicitly by ADMIN.
         */

        if (approval.getStatus() != HostelApprovalStatus.PENDING) {

            throw new RuntimeException(
                    "Owner email verification can only be requested "
                            + "while the hostel is pending admin approval. "
                            + "Current status: "
                            + approval.getStatus()
            );
        }

        /*
         * Generate and send OTP.
         *
         * This updates only the owner's email verification status.
         */
        generateAndSendOtp(
                owner,
                email
        );

        /*
         * DO NOT DO THIS:
         *
         * approval.setStatus(
         *     HostelApprovalStatus.OWNER_VERIFICATION_PENDING
         * );
         *
         * DO NOT change HostelApproval here.
         */

        System.out.println(
                "================================================="
        );

        System.out.println(
                "OWNER EMAIL OTP SENT"
        );

        System.out.println(
                "Hostel ID: " + hostelId
        );

        System.out.println(
                "Hostel approval status remains: "
                        + approval.getStatus()
        );

        System.out.println(
                "Owner email verification status: "
                        + owner.getEmailVerificationStatus()
        );

        System.out.println(
                "================================================="
        );
    }


    // =========================================================
    // GET OWNER FROM HOSTEL
    // =========================================================

    private User getOwnerFromHostel(Long hostelId) {

        HostelBasicInfo hostel =
                hostelApprovalRepository
                        .findByHostel_HostelId(hostelId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Hostel approval not found for hostel ID: "
                                                + hostelId
                                )
                        )
                        .getHostel();

        if (hostel.getOwner() == null) {

            throw new RuntimeException(
                    "Owner is not associated with this hostel."
            );
        }

        return hostel.getOwner();
    }


    // =========================================================
    // GENERATE + SAVE + SEND OTP
    // =========================================================

    private void generateAndSendOtp(
            User owner,
            String email) {

        LocalDateTime now =
                LocalDateTime.now();


        // -----------------------------------------------------
        // Get latest OTP
        // -----------------------------------------------------

        EmailVerificationOtp latestOtp =
                emailVerificationOtpRepository
                        .findTopByOwnerIdAndPurposeOrderByCreatedAtDesc(
                                owner.getId(),
                                OTP_PURPOSE
                        )
                        .orElse(null);


        // -----------------------------------------------------
        // Check resend cooldown
        // -----------------------------------------------------

        if (latestOtp != null) {

            LocalDateTime cooldownTime =
                    latestOtp.getCreatedAt()
                            .plusSeconds(
                                    RESEND_COOLDOWN_SECONDS
                            );

            if (now.isBefore(cooldownTime)) {

                long secondsRemaining =
                        Duration
                                .between(
                                        now,
                                        cooldownTime
                                )
                                .getSeconds();

                throw new RuntimeException(
                        "Please wait "
                                + secondsRemaining
                                + " seconds before requesting another OTP."
                );
            }
        }


        // -----------------------------------------------------
        // Invalidate previous OTP
        // -----------------------------------------------------

        if (latestOtp != null) {

            latestOtp.setUsed(true);

            latestOtp.setExpiresAt(now);

            emailVerificationOtpRepository.save(
                    latestOtp
            );
        }


        // -----------------------------------------------------
        // Generate 6-digit OTP
        // -----------------------------------------------------

        String otp =
                String.format(
                        "%06d",
                        secureRandom.nextInt(1_000_000)
                );


        // -----------------------------------------------------
        // Hash OTP
        // -----------------------------------------------------

        String otpHash =
                passwordEncoder.encode(otp);


        // -----------------------------------------------------
        // Create OTP
        // -----------------------------------------------------

        EmailVerificationOtp verificationOtp =
                EmailVerificationOtp.builder()

                        .owner(owner)

                        .otpHash(otpHash)

                        .purpose(
                                OTP_PURPOSE
                        )

                        .createdAt(
                                now
                        )

                        .expiresAt(
                                now.plusMinutes(
                                        OTP_EXPIRY_MINUTES
                                )
                        )

                        .used(false)

                        .build();


        emailVerificationOtpRepository.save(
                verificationOtp
        );


        // -----------------------------------------------------
        // Send OTP email
        // -----------------------------------------------------

        if ("mailpit".equalsIgnoreCase(
        ownerVerificationEmailProvider)) {

                mailpitEmailService.sendOwnerVerificationOtp(
                        email,
                        otp
                );

                } else {

                emailService.sendOwnerVerificationOtp(
                        email,
                        otp
                );
        }


        // -----------------------------------------------------
        // Update ONLY owner verification status
        // -----------------------------------------------------

        owner.setEmailVerificationStatus(
                EmailVerificationStatus.OTP_SENT
        );

        userRepository.save(owner);
    }


    // =========================================================
    // OWNER - VERIFY OTP
    // =========================================================

    @Transactional
    public boolean verifyOtp(
            Long hostelId,
            String enteredOtp) {

        User owner =
                getOwnerFromHostel(hostelId);


        // -----------------------------------------------------
        // OTP must have been requested by ADMIN
        // -----------------------------------------------------

        if (owner.getEmailVerificationStatus()
                != EmailVerificationStatus.OTP_SENT) {

            throw new RuntimeException(
                    "Email verification has not been requested by admin. "
                            + "Please wait for admin to request verification."
            );
        }


        // -----------------------------------------------------
        // VALIDATE OTP FORMAT
        // -----------------------------------------------------

        if (enteredOtp == null ||
                !enteredOtp.matches("\\d{6}")) {

            return false;
        }


        // -----------------------------------------------------
        // GET LATEST UNUSED OTP
        // -----------------------------------------------------

        EmailVerificationOtp verificationOtp =
                emailVerificationOtpRepository
                        .findTopByOwnerIdAndPurposeAndUsedFalseOrderByCreatedAtDesc(
                                owner.getId(),
                                OTP_PURPOSE
                        )
                        .orElse(null);

        if (verificationOtp == null) {

            return false;
        }


        LocalDateTime now =
                LocalDateTime.now();


        // -----------------------------------------------------
        // CHECK OTP EXPIRY
        // -----------------------------------------------------

        if (verificationOtp.getExpiresAt() == null ||
                now.isAfter(
                        verificationOtp.getExpiresAt()
                )) {

            return false;
        }


        // -----------------------------------------------------
        // COMPARE OTP
        // -----------------------------------------------------

        boolean matches =
                passwordEncoder.matches(
                        enteredOtp,
                        verificationOtp.getOtpHash()
                );

        if (!matches) {

            return false;
        }


        // =====================================================
        // OTP IS VALID
        // =====================================================


        // -----------------------------------------------------
        // MARK OTP AS USED
        // -----------------------------------------------------

        verificationOtp.setUsed(true);

        verificationOtp.setExpiresAt(now);

        emailVerificationOtpRepository.save(
                verificationOtp
        );


        // -----------------------------------------------------
        // MARK ONLY OWNER EMAIL AS VERIFIED
        // -----------------------------------------------------

        owner.setEmailVerificationStatus(
                EmailVerificationStatus.VERIFIED
        );

        userRepository.save(owner);


        // =====================================================
        // VERY IMPORTANT
        // =====================================================
        //
        // DO NOT LOAD HostelApproval here.
        //
        // DO NOT call:
        //
        // approval.setStatus(APPROVED)
        //
        // DO NOT call:
        //
        // approval.setStatus(PENDING)
        //
        // DO NOT modify submittedAt.
        //
        // DO NOT modify reviewedAt.
        //
        // OTP verification belongs ONLY to the owner contact
        // verification step.
        //
        // The admin controls the hostel approval status.
        // =====================================================

        System.out.println(
                "================================================="
        );

        System.out.println(
                "OWNER EMAIL VERIFIED SUCCESSFULLY"
        );

        System.out.println(
                "Hostel ID: " + hostelId
        );

        System.out.println(
                "Owner email verification status: VERIFIED"
        );

        System.out.println(
                "Hostel approval status was NOT changed."
        );

        System.out.println(
                "Admin must still review and approve the hostel."
        );

        System.out.println(
                "================================================="
        );

        return true;
    }


    // =========================================================
    // RESEND OTP
    // =========================================================

    @Transactional
    public void resendOtp(Long hostelId) {

        User owner =
                getOwnerFromHostel(hostelId);

        String email =
                owner.getEmail();

        if (email == null || email.isBlank()) {

            throw new RuntimeException(
                    "Owner registered email is not available."
            );
        }


        HostelApproval approval =
                hostelApprovalRepository
                        .findByHostel_HostelId(hostelId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Hostel approval not found for hostel ID: "
                                                + hostelId
                                )
                        );


        /*
         * The hostel remains PENDING throughout owner verification.
         *
         * Therefore resend is allowed while approval status is
         * PENDING, but only if OTP verification has already been
         * initiated.
         */

        if (approval.getStatus() != HostelApprovalStatus.PENDING) {

            throw new RuntimeException(
                    "Owner email verification cannot be resent because "
                            + "the hostel is no longer pending admin approval. "
                            + "Current status: "
                            + approval.getStatus()
            );
        }


        if (owner.getEmailVerificationStatus()
                != EmailVerificationStatus.OTP_SENT) {

            throw new RuntimeException(
                    "Owner email verification has not been initiated by admin."
            );
        }


        generateAndSendOtp(
                owner,
                email
        );
    }


    // =========================================================
    // GET VERIFICATION STATUS
    // =========================================================

    @Transactional(readOnly = true)
    public OwnerEmailVerificationStatusResponse
    getVerificationStatusResponse(Long hostelId) {

        User owner =
                getOwnerFromHostel(hostelId);


        // -----------------------------------------------------
        // Already verified
        // -----------------------------------------------------

        if (owner.getEmailVerificationStatus()
                == EmailVerificationStatus.VERIFIED) {

            return OwnerEmailVerificationStatusResponse.builder()
                    .success(true)
                    .email(owner.getEmail())
                    .emailVerificationStatus("VERIFIED")
                    .remainingSeconds(0L)
                    .build();
        }


        // -----------------------------------------------------
        // OTP has NOT been requested by ADMIN
        // -----------------------------------------------------

        if (owner.getEmailVerificationStatus()
                != EmailVerificationStatus.OTP_SENT) {

            return OwnerEmailVerificationStatusResponse.builder()
                    .success(true)
                    .email(owner.getEmail())
                    .emailVerificationStatus("NOT_REQUESTED")
                    .remainingSeconds(0L)
                    .build();
        }


        // -----------------------------------------------------
        // OTP SENT
        // -----------------------------------------------------

        Long remainingSeconds = 0L;

        EmailVerificationOtp latestOtp =
                emailVerificationOtpRepository
                        .findTopByOwnerIdAndPurposeAndUsedFalseOrderByCreatedAtDesc(
                                owner.getId(),
                                OTP_PURPOSE
                        )
                        .orElse(null);


        if (latestOtp != null &&
                latestOtp.getExpiresAt() != null) {

            long seconds =
                    Duration.between(
                            LocalDateTime.now(),
                            latestOtp.getExpiresAt()
                    ).getSeconds();

            if (seconds > 0) {

                remainingSeconds = seconds;
            }
        }


        return OwnerEmailVerificationStatusResponse.builder()
                .success(true)
                .email(owner.getEmail())
                .emailVerificationStatus(
                        EmailVerificationStatus.OTP_SENT.name()
                )
                .remainingSeconds(remainingSeconds)
                .build();
    }


    // =========================================================
    // CHECK WHETHER OTP WAS REQUESTED
    // =========================================================

    @Transactional(readOnly = true)
    public boolean isOtpRequestedForHostel(
            Long hostelId) {

        User owner =
                getOwnerFromHostel(hostelId);

        return owner.getEmailVerificationStatus()
                == EmailVerificationStatus.OTP_SENT;
    }


}
