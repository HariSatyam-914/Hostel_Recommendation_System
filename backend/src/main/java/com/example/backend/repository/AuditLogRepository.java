package com.example.backend.repository;

import com.example.backend.entity.AuditLog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository
        extends JpaRepository<AuditLog, Long> {

    /*
     * =========================================================
     * ALL LOGS
     * =========================================================
     */

    List<AuditLog> findAllByOrderByCreatedAtDesc();

    /*
     * =========================================================
     * STATUS COUNTS
     * =========================================================
     */

    long countByStatusIgnoreCase(
            String status
    );

    long countByStatusIgnoreCaseAndCreatedAtGreaterThanEqual(
            String status,
            LocalDateTime start
    );

    long countByStatusIgnoreCaseAndCreatedAtBetween(
            String status,
            LocalDateTime start,
            LocalDateTime end
    );

    /*
     * =========================================================
     * DATE COUNTS
     * =========================================================
     */

    long countByCreatedAtGreaterThanEqual(
            LocalDateTime start
    );

    long countByCreatedAtBetween(
            LocalDateTime start,
            LocalDateTime end
    );

    /*
     * =========================================================
     * MODULE COUNTS
     * =========================================================
     */

    long countByModuleIgnoreCase(
            String module
    );

    long countByModuleIgnoreCaseAndCreatedAtGreaterThanEqual(
            String module,
            LocalDateTime start
    );

    long countByModuleIgnoreCaseAndCreatedAtBetween(
            String module,
            LocalDateTime start,
            LocalDateTime end
    );

    /*
     * =========================================================
     * SEARCH
     * =========================================================
     */

    @Query("""
            SELECT a
            FROM AuditLog a
            WHERE
                LOWER(COALESCE(a.userName, ''))
                    LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(a.userRole, ''))
                    LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(a.action, ''))
                    LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(a.module, ''))
                    LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(a.target, ''))
                    LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(a.targetId, ''))
                    LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(a.ipAddress, ''))
                    LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(a.status, ''))
                    LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(a.description, ''))
                    LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(a.changes, ''))
                    LIKE LOWER(CONCAT('%', :search, '%'))
            ORDER BY a.createdAt DESC
            """)
    List<AuditLog> searchLogs(
            @Param("search") String search
    );
}