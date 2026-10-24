package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "hostel_amenities",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_hostel_amenity",
            columnNames = {"hostel_id", "amenity_code"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostelAmenity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "hostel_id",
        nullable = false
    )
    private HostelBasicInfo hostel;

    @Column(
        name = "amenity_code",
        nullable = false,
        length = 100
    )
    private String amenityCode;

    @Column(
        name = "amenity_name",
        nullable = false,
        length = 150
    )
    private String amenityName;

    @Column(
        name = "photo_required",
        nullable = false
    )
    private boolean photoRequired;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Enumerated(EnumType.STRING)
    @Column(
        name = "approval_status",
        length = 30
    )
    private AmenityApprovalStatus approvalStatus;

}