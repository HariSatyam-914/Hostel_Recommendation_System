package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "issues")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Issue {

    /*
     * =========================================================
     * PRIMARY KEY
     * =========================================================
     */

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    /*
     * =========================================================
     * REPORTING USER
     *
     * The user who submitted the issue.
     * =========================================================
     */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;


    /*
     * =========================================================
     * HOSTEL
     *
     * The hostel against which the issue was reported.
     * =========================================================
     */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "hostel_id",
            nullable = false
    )
    private HostelBasicInfo hostel;


    /*
     * =========================================================
     * ISSUE INFORMATION
     * =========================================================
     */

    @Column(
            nullable = false,
            length = 100
    )
    private String category;


    @Column(
            nullable = false,
            length = 255
    )
    private String subject;


    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String description;


    /*
     * =========================================================
     * PRIORITY
     * =========================================================
     */

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    @Builder.Default
    private IssuePriority priority =
            IssuePriority.MEDIUM;


    /*
     * =========================================================
     * STATUS
     * =========================================================
     */

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    @Builder.Default
    private IssueStatus status =
            IssueStatus.OPEN;


    /*
     * =========================================================
     * TIMESTAMPS
     * =========================================================
     */

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;


    @Column(
            name = "updated_at"
    )
    private LocalDateTime updatedAt;


    @Column(
            name = "resolved_at"
    )
    private LocalDateTime resolvedAt;


    /*
     * =========================================================
     * PRE-PERSIST
     * =========================================================
     */

    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }

        if (priority == null) {
            priority =
                    IssuePriority.MEDIUM;
        }

        if (status == null) {
            status =
                    IssueStatus.OPEN;
        }
    }


    /*
     * =========================================================
     * PRE-UPDATE
     * =========================================================
     */

    @PreUpdate
    protected void onUpdate() {

        updatedAt =
                LocalDateTime.now();
    }
}