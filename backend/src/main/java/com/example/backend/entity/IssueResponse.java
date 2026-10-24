package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "issue_responses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueResponse {

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
     *
     * Which issue this response belongs to.
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
     * RESPONDER
     *
     * Can be:
     * - Owner
     * - Admin
     *
     * The actual User record is stored here.
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
     * RESPONSE MESSAGE
     * =========================================================
     */

    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String message;


    /*
     * =========================================================
     * RESPONDER TYPE
     *
     * OWNER
     * ADMIN
     * =========================================================
     */

    @Column(
            name = "responder_type",
            nullable = false,
            length = 20
    )
    private String responderType;


    /*
     * =========================================================
     * CREATED TIME
     * =========================================================
     */

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;


    /*
     * =========================================================
     * PRE-PERSIST
     * =========================================================
     */

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt =
                    LocalDateTime.now();
        }
    }
}