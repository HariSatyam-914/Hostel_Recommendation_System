package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "amenity_change_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AmenityChangeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "hostel_id",
        nullable = false
    )
    private HostelBasicInfo hostel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "amenity_id",
        nullable = false
    )
    private HostelAmenity amenity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "photo_id"
    )
    private AmenityPhoto photo;

    @Enumerated(EnumType.STRING)
    @Column(
        name = "request_type",
        nullable = false,
        length = 30
    )
    private AmenityChangeRequestType requestType;

    @Enumerated(EnumType.STRING)
    @Column(
        name = "status",
        nullable = false,
        length = 30
    )
    private AmenityChangeRequestStatus status;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @PrePersist
    protected void onCreate() {

        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }

        if (status == null) {
            status =
                    AmenityChangeRequestStatus.PENDING;
        }
    }
}