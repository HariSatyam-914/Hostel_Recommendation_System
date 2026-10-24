package com.example.backend.controller;

import com.example.backend.entity.AuditLog;
import com.example.backend.service.AuditLogService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    /*
     * =========================================================
     * GET ALL / FILTERED AUDIT LOGS
     *
     * GET
     * /api/admin/audit-logs
     *
     * Optional query parameters are supported so the endpoint
     * can also be used independently of the current frontend.
     * =========================================================
     */

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAuditLogs(
            @RequestParam(
                    required = false,
                    defaultValue = ""
            )
            String search,

            @RequestParam(
                    required = false,
                    defaultValue = ""
            )
            String dateFilter,

            @RequestParam(
                    required = false,
                    defaultValue = ""
            )
            String userFilter,

            @RequestParam(
                    required = false,
                    defaultValue = ""
            )
            String actionFilter,

            @RequestParam(
                    required = false,
                    defaultValue = ""
            )
            String moduleFilter,

            @RequestParam(
                    required = false,
                    defaultValue = ""
            )
            String statusFilter
    ) {

        List<AuditLog> logs =
                auditLogService.getFilteredLogs(
                        search,
                        dateFilter,
                        userFilter,
                        actionFilter,
                        moduleFilter,
                        statusFilter
                );

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "success",
                true
        );

        /*
         * Keep all three aliases because the existing
         * frontend already supports multiple response
         * shapes.
         */

        response.put(
                "logs",
                logs
        );

        response.put(
                "auditLogs",
                logs
        );

        response.put(
                "data",
                logs
        );

        response.put(
                "totalCount",
                logs.size()
        );

        return ResponseEntity.ok(
                response
        );
    }

    /*
     * =========================================================
     * STATISTICS
     *
     * GET
     * /api/admin/audit-logs/stats
     * =========================================================
     */

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>>
    getAuditStatistics() {

        Map<String, Object> statistics =
                auditLogService.getStatistics();

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "success",
                true
        );

        /*
         * Nested format.
         */

        response.put(
                "data",
                statistics
        );

        /*
         * Root-level format.
         *
         * Your current AuditLogs.jsx can consume
         * either format.
         */

        response.putAll(
                statistics
        );

        return ResponseEntity.ok(
                response
        );
    }

    /*
     * =========================================================
     * EXPORT
     *
     * POST
     * /api/admin/audit-logs/export
     *
     * Body:
     *
     * {
     *   "search": "...",
     *   "dateFilter": "Today",
     *   "userFilter": "Administrators",
     *   "actionFilter": "...",
     *   "moduleFilter": "...",
     *   "statusFilter": "Success"
     * }
     *
     * =========================================================
     */

    @PostMapping(
            value = "/export",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = "text/csv"
    )
    public ResponseEntity<byte[]> exportAuditLogs(
            @RequestBody(
                    required = false
            )
            Map<String, Object> request
    ) {

        if (request == null) {

            request =
                    new HashMap<>();
        }

        String search =
                getString(
                        request,
                        "search"
                );

        String dateFilter =
                getString(
                        request,
                        "dateFilter"
                );

        String userFilter =
                getString(
                        request,
                        "userFilter"
                );

        String actionFilter =
                getString(
                        request,
                        "actionFilter"
                );

        String moduleFilter =
                getString(
                        request,
                        "moduleFilter"
                );

        String statusFilter =
                getString(
                        request,
                        "statusFilter"
                );

        byte[] csv =
                auditLogService.exportLogs(
                        search,
                        dateFilter,
                        userFilter,
                        actionFilter,
                        moduleFilter,
                        statusFilter
                );

        HttpHeaders headers =
                new HttpHeaders();

        headers.setContentType(
                MediaType.parseMediaType(
                        "text/csv; charset=UTF-8"
                )
        );

        headers.setContentDisposition(
                ContentDisposition
                        .attachment()
                        .filename(
                                "audit-logs.csv"
                        )
                        .build()
        );

        headers.setContentLength(
                csv.length
        );

        return ResponseEntity
                .ok()
                .headers(headers)
                .body(csv);
    }

    /*
     * =========================================================
     * REQUEST VALUE HELPER
     * =========================================================
     */

    private String getString(
            Map<String, Object> request,
            String key
    ) {

        Object value =
                request.get(key);

        if (value == null) {

            return "";
        }

        return String.valueOf(value)
                .trim();
    }
}