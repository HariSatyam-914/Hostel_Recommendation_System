package com.example.backend.service;

import com.example.backend.entity.AuditLog;
import com.example.backend.repository.AuditLogRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;

import java.time.LocalDate;
import java.time.LocalDateTime;

import java.time.format.DateTimeFormatter;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AuditLogServiceImpl
        implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    private static final DateTimeFormatter CSV_DATE_FORMAT =
            DateTimeFormatter.ofPattern(
                    "yyyy-MM-dd HH:mm:ss"
            );

    /*
     * =========================================================
     * GET ALL LOGS
     * =========================================================
     */

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getAllLogs() {

        return auditLogRepository
                .findAllByOrderByCreatedAtDesc();
    }

    /*
     * =========================================================
     * GET FILTERED LOGS
     * =========================================================
     */

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getFilteredLogs(
            String search,
            String dateFilter,
            String userFilter,
            String actionFilter,
            String moduleFilter,
            String statusFilter
    ) {

        List<AuditLog> logs;

        String normalizedSearch =
                normalize(search);

        /*
         * -----------------------------------------------------
         * DATABASE SEARCH
         * -----------------------------------------------------
         */

        if (!normalizedSearch.isBlank()) {

            logs =
                    auditLogRepository
                            .searchLogs(normalizedSearch);

        } else {

            logs =
                    auditLogRepository
                            .findAllByOrderByCreatedAtDesc();
        }

        /*
         * -----------------------------------------------------
         * DATE FILTER
         * -----------------------------------------------------
         */

        LocalDate today =
                LocalDate.now();

        if ("Today".equalsIgnoreCase(
                normalize(dateFilter)
        )) {

            LocalDateTime start =
                    today.atStartOfDay();

            LocalDateTime end =
                    today.plusDays(1)
                            .atStartOfDay();

            logs =
                    logs.stream()
                            .filter(log ->
                                    isWithin(
                                            log,
                                            start,
                                            end
                                    )
                            )
                            .collect(
                                    Collectors.toList()
                            );
        }

        else if ("Yesterday".equalsIgnoreCase(
                normalize(dateFilter)
        )) {

            LocalDateTime start =
                    today.minusDays(1)
                            .atStartOfDay();

            LocalDateTime end =
                    today.atStartOfDay();

            logs =
                    logs.stream()
                            .filter(log ->
                                    isWithin(
                                            log,
                                            start,
                                            end
                                    )
                            )
                            .collect(
                                    Collectors.toList()
                            );
        }

        /*
         * -----------------------------------------------------
         * USER FILTER
         * -----------------------------------------------------
         */

        String normalizedUserFilter =
                normalize(userFilter);

        if (!normalizedUserFilter.isBlank()
                && !isAllFilter(
                        normalizedUserFilter
                )) {

            logs =
                    logs.stream()
                            .filter(log ->
                                    matchesUserFilter(
                                            log,
                                            normalizedUserFilter
                                    )
                            )
                            .collect(
                                    Collectors.toList()
                            );
        }

        /*
         * -----------------------------------------------------
         * ACTION FILTER
         * -----------------------------------------------------
         */

        String normalizedActionFilter =
                normalize(actionFilter);

        if (!normalizedActionFilter.isBlank()
                && !isAllFilter(
                        normalizedActionFilter
                )) {

            logs =
                    logs.stream()
                            .filter(log ->
                                    containsIgnoreCase(
                                            log.getAction(),
                                            normalizedActionFilter
                                    )
                            )
                            .collect(
                                    Collectors.toList()
                            );
        }

        /*
         * -----------------------------------------------------
         * MODULE FILTER
         * -----------------------------------------------------
         */

        String normalizedModuleFilter =
                normalize(moduleFilter);

        if (!normalizedModuleFilter.isBlank()
                && !isAllFilter(
                        normalizedModuleFilter
                )) {

            logs =
                    logs.stream()
                            .filter(log ->
                                    containsIgnoreCase(
                                            log.getModule(),
                                            normalizedModuleFilter
                                    )
                            )
                            .collect(
                                    Collectors.toList()
                            );
        }

        /*
         * -----------------------------------------------------
         * STATUS FILTER
         * -----------------------------------------------------
         */

        String normalizedStatusFilter =
                normalize(statusFilter);

        if (!normalizedStatusFilter.isBlank()
                && !isAllFilter(
                        normalizedStatusFilter
                )) {

            logs =
                    logs.stream()
                            .filter(log ->
                                    normalizedStatusFilter
                                            .equalsIgnoreCase(
                                                    normalize(
                                                            log.getStatus()
                                                    )
                                            )
                            )
                            .collect(
                                    Collectors.toList()
                            );
        }

        return logs;
    }

    /*
     * =========================================================
     * STATISTICS
     * =========================================================
     */

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getStatistics() {

        LocalDate today =
                LocalDate.now();

        /*
         * -----------------------------------------------------
         * TODAY
         * -----------------------------------------------------
         */

        LocalDateTime startOfToday =
                today.atStartOfDay();

        LocalDateTime startOfTomorrow =
                today.plusDays(1)
                        .atStartOfDay();

        /*
         * -----------------------------------------------------
         * YESTERDAY
         * -----------------------------------------------------
         */

        LocalDateTime startOfYesterday =
                today.minusDays(1)
                        .atStartOfDay();

        /*
         * -----------------------------------------------------
         * CURRENT MONTH
         * -----------------------------------------------------
         */

        LocalDateTime startOfMonth =
                today.withDayOfMonth(1)
                        .atStartOfDay();

        /*
         * -----------------------------------------------------
         * PREVIOUS MONTH
         * -----------------------------------------------------
         */

        LocalDate firstDayOfPreviousMonth =
                today.minusMonths(1)
                        .withDayOfMonth(1);

        LocalDateTime startOfPreviousMonth =
                firstDayOfPreviousMonth
                        .atStartOfDay();

        LocalDateTime endOfPreviousMonth =
                today.withDayOfMonth(1)
                        .atStartOfDay();

        /*
         * -----------------------------------------------------
         * TOTAL
         * -----------------------------------------------------
         */

        long totalCount =
                auditLogRepository.count();

        /*
         * -----------------------------------------------------
         * STATUS
         * -----------------------------------------------------
         */

        long successCount =
                auditLogRepository
                        .countByStatusIgnoreCase(
                                "SUCCESS"
                        );

        long warningCount =
                auditLogRepository
                        .countByStatusIgnoreCase(
                                "WARNING"
                        );

        long failedCount =
                auditLogRepository
                        .countByStatusIgnoreCase(
                                "FAILED"
                        );

        /*
         * -----------------------------------------------------
         * TODAY
         * -----------------------------------------------------
         */

        long todayCount =
                auditLogRepository
                        .countByCreatedAtBetween(
                                startOfToday,
                                startOfTomorrow
                        );

        /*
         * -----------------------------------------------------
         * YESTERDAY
         * -----------------------------------------------------
         */

        long yesterdayCount =
                auditLogRepository
                        .countByCreatedAtBetween(
                                startOfYesterday,
                                startOfToday
                        );

        /*
         * -----------------------------------------------------
         * SECURITY
         *
         * Authentication module.
         * -----------------------------------------------------
         */

        long securityCount =
                auditLogRepository
                        .countByModuleIgnoreCase(
                                "Authentication"
                        );

        /*
         * -----------------------------------------------------
         * CURRENT MONTH TOTAL
         * -----------------------------------------------------
         */

        long totalThisMonth =
                auditLogRepository
                        .countByCreatedAtGreaterThanEqual(
                                startOfMonth
                        );

        /*
         * -----------------------------------------------------
         * PREVIOUS MONTH TOTAL
         * -----------------------------------------------------
         */

        long totalPreviousMonth =
                auditLogRepository
                        .countByCreatedAtBetween(
                                startOfPreviousMonth,
                                endOfPreviousMonth
                        );

        /*
         * -----------------------------------------------------
         * CURRENT MONTH SECURITY
         * -----------------------------------------------------
         */

        long securityThisMonth =
                auditLogRepository
                        .countByModuleIgnoreCaseAndCreatedAtGreaterThanEqual(
                                "Authentication",
                                startOfMonth
                        );

        /*
         * -----------------------------------------------------
         * PREVIOUS MONTH SECURITY
         * -----------------------------------------------------
         */

        long securityPreviousMonth =
                auditLogRepository
                        .countByModuleIgnoreCaseAndCreatedAtBetween(
                                "Authentication",
                                startOfPreviousMonth,
                                endOfPreviousMonth
                        );

        /*
         * -----------------------------------------------------
         * CURRENT MONTH FAILED
         * -----------------------------------------------------
         */

        long failedThisMonth =
                auditLogRepository
                        .countByStatusIgnoreCaseAndCreatedAtGreaterThanEqual(
                                "FAILED",
                                startOfMonth
                        );

        /*
         * -----------------------------------------------------
         * PREVIOUS MONTH FAILED
         * -----------------------------------------------------
         */

        long failedPreviousMonth =
                auditLogRepository
                        .countByStatusIgnoreCaseAndCreatedAtBetween(
                                "FAILED",
                                startOfPreviousMonth,
                                endOfPreviousMonth
                        );

        /*
         * -----------------------------------------------------
         * DELTAS
         * -----------------------------------------------------
         */

        double totalDeltaPercent =
                calculatePercentageChange(
                        totalPreviousMonth,
                        totalThisMonth
                );

        double todayDeltaPercent =
                calculatePercentageChange(
                        yesterdayCount,
                        todayCount
                );

        double securityDeltaPercent =
                calculatePercentageChange(
                        securityPreviousMonth,
                        securityThisMonth
                );

        double failedDeltaPercent =
                calculatePercentageChange(
                        failedPreviousMonth,
                        failedThisMonth
                );

        /*
         * -----------------------------------------------------
         * RESPONSE
         * -----------------------------------------------------
         */

        return Map.of(
                "totalCount",
                totalCount,

                "todayCount",
                todayCount,

                "successCount",
                successCount,

                "warningCount",
                warningCount,

                "failedCount",
                failedCount,

                "securityCount",
                securityCount,

                "totalDeltaPercent",
                totalDeltaPercent,

                "todayDeltaPercent",
                todayDeltaPercent,

                "securityDeltaPercent",
                securityDeltaPercent,

                "failedDeltaPercent",
                failedDeltaPercent
        );
    }

    /*
     * =========================================================
     * CSV EXPORT
     * =========================================================
     */

    @Override
    @Transactional(readOnly = true)
    public byte[] exportLogs(
            String search,
            String dateFilter,
            String userFilter,
            String actionFilter,
            String moduleFilter,
            String statusFilter
    ) {

        List<AuditLog> logs =
                getFilteredLogs(
                        search,
                        dateFilter,
                        userFilter,
                        actionFilter,
                        moduleFilter,
                        statusFilter
                );

        StringBuilder csv =
                new StringBuilder();

        /*
         * -----------------------------------------------------
         * UTF-8 BOM
         *
         * Helps Excel correctly identify UTF-8 CSV.
         * -----------------------------------------------------
         */

        csv.append('\uFEFF');

        /*
         * -----------------------------------------------------
         * HEADER
         * -----------------------------------------------------
         */

        csv.append(
                "Date,Time,User,Role,Action,Module,"
                        + "Target,Target ID,IP Address,Status,"
                        + "Description,Changes\n"
        );

        /*
         * -----------------------------------------------------
         * ROWS
         * -----------------------------------------------------
         */

        for (AuditLog log : logs) {

            LocalDateTime createdAt =
                    log.getCreatedAt();

            String date = "";

            String time = "";

            if (createdAt != null) {

                date =
                        createdAt.toLocalDate()
                                .toString();

                time =
                        createdAt.toLocalTime()
                                .format(
                                        DateTimeFormatter.ofPattern(
                                                "HH:mm:ss"
                                        )
                                );
            }

            csv.append(
                    csvValue(date)
            ).append(",");

            csv.append(
                    csvValue(time)
            ).append(",");

            csv.append(
                    csvValue(log.getUserName())
            ).append(",");

            csv.append(
                    csvValue(log.getUserRole())
            ).append(",");

            csv.append(
                    csvValue(log.getAction())
            ).append(",");

            csv.append(
                    csvValue(log.getModule())
            ).append(",");

            csv.append(
                    csvValue(log.getTarget())
            ).append(",");

            csv.append(
                    csvValue(log.getTargetId())
            ).append(",");

            csv.append(
                    csvValue(log.getIpAddress())
            ).append(",");

            csv.append(
                    csvValue(log.getStatus())
            ).append(",");

            csv.append(
                    csvValue(log.getDescription())
            ).append(",");

            csv.append(
                    csvValue(log.getChanges())
            ).append("\n");
        }

        return csv.toString()
                .getBytes(
                        StandardCharsets.UTF_8
                );
    }

    /*
     * =========================================================
     * CREATE LOG
     * =========================================================
     */

    @Override
    public AuditLog createLog(
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
    ) {

        AuditLog log =
                AuditLog.builder()
                        .createdAt(
                                LocalDateTime.now()
                        )
                        .userName(
                                normalizeActorName(
                                        userName
                                )
                        )
                        .userRole(
                                normalizeRole(
                                        userRole
                                )
                        )
                        .action(
                                normalizeValue(
                                        action,
                                        "Activity"
                                )
                        )
                        .module(
                                normalizeValue(
                                        module,
                                        "System"
                                )
                        )
                        .target(
                                normalizeNullable(
                                        target
                                )
                        )
                        .targetId(
                                normalizeNullable(
                                        targetId
                                )
                        )
                        .ipAddress(
                                normalizeNullable(
                                        ipAddress
                                )
                        )
                        .status(
                                normalizeStatus(
                                        status
                                )
                        )
                        .description(
                                normalizeNullable(
                                        description
                                )
                        )
                        .changes(
                                normalizeNullable(
                                        changes
                                )
                        )
                        .build();

        return auditLogRepository.save(log);
    }

    /*
     * =========================================================
     * USER FILTER
     * =========================================================
     */

    private boolean matchesUserFilter(
            AuditLog log,
            String userFilter
    ) {

        String role =
                normalize(
                        log.getUserRole()
                );

        switch (userFilter.toLowerCase()) {

            case "administrators":
            case "administrator":
            case "admin":
                return "administrator".equalsIgnoreCase(
                        role
                );

            case "hostel owners":
            case "hostel owner":
            case "owner":
                return "hostel owner".equalsIgnoreCase(
                        role
                );

            case "end users":
            case "end user":
            case "user":
                return "end user".equalsIgnoreCase(
                        role
                );

            case "system":
                return "system".equalsIgnoreCase(
                        role
                );

            default:
                return containsIgnoreCase(
                        log.getUserName(),
                        userFilter
                );
        }
    }

    /*
     * =========================================================
     * DATE RANGE
     * =========================================================
     */

    private boolean isWithin(
            AuditLog log,
            LocalDateTime start,
            LocalDateTime end
    ) {

        if (log == null
                || log.getCreatedAt() == null) {

            return false;
        }

        return !log.getCreatedAt()
                .isBefore(start)
                &&
                log.getCreatedAt()
                        .isBefore(end);
    }

    /*
     * =========================================================
     * STRING HELPERS
     * =========================================================
     */

    private boolean containsIgnoreCase(
            String value,
            String search
    ) {

        if (value == null
                || search == null) {

            return false;
        }

        return value
                .toLowerCase()
                .contains(
                        search.toLowerCase()
                );
    }

    private String normalize(
            String value
    ) {

        return value == null
                ? ""
                : value.trim();
    }

    private String normalizeNullable(
            String value
    ) {

        if (value == null
                || value.isBlank()) {

            return null;
        }

        return value.trim();
    }

    private String normalizeValue(
            String value,
            String fallback
    ) {

        if (value == null
                || value.isBlank()) {

            return fallback;
        }

        return value.trim();
    }

    private String normalizeStatus(
            String status
    ) {

        if (status == null
                || status.isBlank()) {

            return "SUCCESS";
        }

        String normalized =
                status.trim()
                        .toUpperCase();

        if ("SUCCESS".equals(normalized)
                || "WARNING".equals(normalized)
                || "FAILED".equals(normalized)) {

            return normalized;
        }

        /*
         * Unknown values are retained as uppercase
         * rather than silently changing the caller's
         * audit event.
         */

        return normalized;
    }

    /*
     * =========================================================
     * ROLE NORMALIZATION
     *
     * IMPORTANT:
     *
     * AuditLogs.jsx expects:
     *
     * Administrator
     * Hostel Owner
     * End User
     * System
     *
     * Database/security may provide:
     *
     * ADMIN
     * OWNER
     * USER
     * ROLE_ADMIN
     * ROLE_OWNER
     * ROLE_USER
     * =========================================================
     */

    private String normalizeRole(
            String role
    ) {

        if (role == null
                || role.isBlank()) {

            return "System";
        }

        String normalized =
                role.trim()
                        .toUpperCase();

        switch (normalized) {

            case "ADMIN":
            case "ROLE_ADMIN":
            case "ADMINISTRATOR":
            case "ROLE_ADMINISTRATOR":

                return "Administrator";

            case "OWNER":
            case "ROLE_OWNER":
            case "HOSTEL_OWNER":
            case "ROLE_HOSTEL_OWNER":
            case "HOSTEL OWNER":

                return "Hostel Owner";

            case "USER":
            case "ROLE_USER":
            case "END_USER":
            case "ROLE_END_USER":
            case "END USER":

                return "End User";

            case "SYSTEM":

                return "System";

            default:

                return role.trim();
        }
    }

    private String normalizeActorName(
            String userName
    ) {

        if (userName == null
                || userName.isBlank()) {

            return "System";
        }

        return userName.trim();
    }

    /*
     * =========================================================
     * FILTER HELPERS
     * =========================================================
     */

    private boolean isAllFilter(
            String value
    ) {

        return "all".equalsIgnoreCase(value)
                || "all dates".equalsIgnoreCase(value)
                || "all users".equalsIgnoreCase(value)
                || "all actions".equalsIgnoreCase(value)
                || "all modules".equalsIgnoreCase(value)
                || "all statuses".equalsIgnoreCase(value);
    }

    /*
     * =========================================================
     * PERCENTAGE CHANGE
     * =========================================================
     */

    private double calculatePercentageChange(
            long previous,
            long current
    ) {

        /*
         * No activity in either period.
         */

        if (previous == 0
                && current == 0) {

            return 0.0;
        }

        /*
         * There was no previous activity,
         * but there is activity now.
         *
         * Returning 100 is a stable UI-friendly
         * representation of newly appearing activity.
         */

        if (previous == 0) {

            return 100.0;
        }

        return Math.round(
                (
                        (current - previous)
                                * 10000.0
                ) / previous
        ) / 100.0;
    }

    /*
     * =========================================================
     * CSV ESCAPING
     * =========================================================
     */

    private String csvValue(
            String value
    ) {

        if (value == null) {

            return "\"\"";
        }

        return "\""
                + value
                .replace(
                        "\"",
                        "\"\""
                )
                .replace(
                        "\r",
                        " "
                )
                .replace(
                        "\n",
                        " "
                )
                + "\"";
    }
}