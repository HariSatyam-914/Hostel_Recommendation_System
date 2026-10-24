package com.example.backend.entity;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "audit_logs",
        indexes = {
                @Index(
                        name = "idx_audit_logs_created_at",
                        columnList = "created_at"
                ),
                @Index(
                        name = "idx_audit_logs_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_audit_logs_module",
                        columnList = "module"
                ),
                @Index(
                        name = "idx_audit_logs_action",
                        columnList = "action"
                ),
                @Index(
                        name = "idx_audit_logs_user_name",
                        columnList = "user_name"
                ),
                @Index(
                        name = "idx_audit_logs_user_role",
                        columnList = "user_role"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
     * ACTOR
     * =========================================================
     */

    @Column(
            name = "user_name",
            length = 150
    )
    private String userName;

    @Column(
            name = "user_role",
            length = 80
    )
    private String userRole;

    /*
     * =========================================================
     * ACTION
     * =========================================================
     */

    @Column(
            name = "action",
            nullable = false,
            length = 150
    )
    private String action;

    @Column(
            name = "module",
            nullable = false,
            length = 100
    )
    private String module;

    /*
     * =========================================================
     * TARGET
     * =========================================================
     */

    @Column(
            name = "target",
            length = 255
    )
    private String target;

    @Column(
            name = "target_id",
            length = 100
    )
    private String targetId;

    /*
     * =========================================================
     * REQUEST INFORMATION
     * =========================================================
     */

    @Column(
            name = "ip_address",
            length = 100
    )
    private String ipAddress;

    /*
     * =========================================================
     * RESULT
     * =========================================================
     *
     * Expected values:
     *
     * SUCCESS
     * WARNING
     * FAILED
     *
     * =========================================================
     */

    @Column(
            name = "status",
            nullable = false,
            length = 30
    )
    private String status;

    /*
     * =========================================================
     * DESCRIPTION
     * =========================================================
     */

    @Column(
            name = "description",
            columnDefinition = "TEXT"
    )
    private String description;

    /*
     * =========================================================
     * CHANGES
     * =========================================================
     */

    @Column(
            name = "changes",
            columnDefinition = "TEXT"
    )
    private String changes;

    /*
     * =========================================================
     * PRE-PERSIST
     * =========================================================
     */

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (userName == null || userName.isBlank()) {
            userName = "System";
        }

        if (userRole == null || userRole.isBlank()) {
            userRole = "System";
        }

        if (action == null || action.isBlank()) {
            action = "Activity";
        }

        if (module == null || module.isBlank()) {
            module = "System";
        }

        if (status == null || status.isBlank()) {
            status = "SUCCESS";
        } else {
            status = status.toUpperCase();
        }
    }
}