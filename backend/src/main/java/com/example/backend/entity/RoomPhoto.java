package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "room_photos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // ROOM
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "room_id",
            nullable = false
    )
    private HostelRoom room;

    // =====================================================
    // FILE INFORMATION
    // =====================================================

    @Column(name = "original_file_name")
    private String originalFileName;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "file_type", nullable = false)
    private String fileType;

    @Column(name = "photo_url", nullable = false, length = 500)
    private String photoUrl;

    // =====================================================
    // DISPLAY
    // =====================================================

    @Column(name = "display_order")
    private Integer displayOrder;

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

    @Column(name = "uploaded_at")
    @Builder.Default
    private LocalDateTime uploadedAt =
            LocalDateTime.now();

    @PrePersist
    protected void onCreate() {

        if (verificationStatus == null) {
            verificationStatus =
                    VerificationStatus.PENDING;
        }

        if (uploadedAt == null) {
            uploadedAt =
                    LocalDateTime.now();
        }
    }
}