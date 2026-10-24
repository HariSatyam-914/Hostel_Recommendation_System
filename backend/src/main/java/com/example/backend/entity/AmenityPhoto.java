package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "amenity_photos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AmenityPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "amenity_id",
        nullable = false
    )
    private HostelAmenity amenity;

    @Column(
        name = "file_name",
        nullable = false
    )
    private String fileName;

    @Column(
        name = "file_type",
        nullable = false
    )
    private String fileType;

    @Column(
        name = "file_size",
        nullable = false
    )
    private Long fileSize;

    @Column(
        name = "file_path",
        nullable = false
    )
    private String filePath;

    @Enumerated(EnumType.STRING)
    @Column(
        name = "verification_status",
        nullable = false,
        length = 30
    )
    private VerificationStatus verificationStatus;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();

        if (verificationStatus == null) {
            verificationStatus = VerificationStatus.PENDING;
        }
    }
}