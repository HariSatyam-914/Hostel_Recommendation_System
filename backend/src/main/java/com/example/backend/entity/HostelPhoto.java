package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "hostel_photos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostelPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // HOSTEL
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "hostel_id",
            nullable = false
    )
    private HostelBasicInfo hostel;

    // =====================================================
    // PHOTO TYPE
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(
            name = "photo_type",
            nullable = false,
            length = 20
    )
    private HostelPhotoType photoType;

    // =====================================================
    // FILE INFORMATION
    // =====================================================

    @Column(
            name = "file_name",
            nullable = false,
            length = 255
    )
    private String fileName;

    @Column(
            name = "file_url",
            nullable = false,
            length = 500
    )
    private String fileUrl;

    // =====================================================
    // DISPLAY ORDER
    // =====================================================

    @Column(
            name = "display_order",
            nullable = false
    )
    private Integer displayOrder = 0;

    // =====================================================
    // VERIFICATION
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(
            name = "verification_status",
            nullable = false
    )
    @Builder.Default
    private VerificationStatus verificationStatus =
            VerificationStatus.PENDING;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    // =====================================================
    // CREATED TIME
    // =====================================================

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    // =====================================================
    // PRE PERSIST
    // =====================================================

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (displayOrder == null) {
            displayOrder = 0;
        }

        if (verificationStatus == null) {
            verificationStatus =
                    VerificationStatus.PENDING;
        }
    }
}