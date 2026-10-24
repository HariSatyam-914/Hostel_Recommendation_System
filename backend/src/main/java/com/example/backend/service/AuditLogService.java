package com.example.backend.service;

import com.example.backend.entity.AuditLog;

import java.util.List;
import java.util.Map;

public interface AuditLogService {

    /*
     * =========================================================
     * GET ALL LOGS
     * =========================================================
     */

    List<AuditLog> getAllLogs();

    /*
     * =========================================================
     * GET FILTERED LOGS
     *
     * These methods are useful for the Audit Logs frontend.
     * =========================================================
     */

    List<AuditLog> getFilteredLogs(
            String search,
            String dateFilter,
            String userFilter,
            String actionFilter,
            String moduleFilter,
            String statusFilter
    );

    /*
     * =========================================================
     * STATISTICS
     * =========================================================
     */

    Map<String, Object> getStatistics();

    /*
     * =========================================================
     * CSV EXPORT
     * =========================================================
     */

    byte[] exportLogs(
            String search,
            String dateFilter,
            String userFilter,
            String actionFilter,
            String moduleFilter,
            String statusFilter
    );

    /*
     * =========================================================
     * CREATE AUDIT LOG
     *
     * Used internally by backend business services.
     * =========================================================
     */

    AuditLog createLog(
            String userName,
            String userRole,
            String action,
            String module,
            String target,
            String targetId,
            String ipAddress,
            String status,
            String description,
            String changes
    );
}