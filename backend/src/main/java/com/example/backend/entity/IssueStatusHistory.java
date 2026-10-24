package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "issue_status_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueStatusHistory {

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
     * ISSUE
     * =========================================================
     */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "issue_id",
            nullable = false
    )
    private Issue issue;


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
    private IssueStatus status;


    /*
     * =========================================================
     * USER WHO CHANGED STATUS
     *
     * Can be:
     * - Owner
     * - Admin
     *
     * =========================================================
     */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "changed_by",
            nullable = false
    )
    private User changedBy;


    /*
     * =========================================================
     * CHANGE TIME
     * =========================================================
     */

    @Column(
            name = "changed_at",
            nullable = false
    )
    private LocalDateTime changedAt;


    /*
     * =========================================================
     * PRE-PERSIST
     * =========================================================
     */

    @PrePersist
    protected void onCreate() {

        if (changedAt == null) {
            changedAt =
                    LocalDateTime.now();
        }
    }
}