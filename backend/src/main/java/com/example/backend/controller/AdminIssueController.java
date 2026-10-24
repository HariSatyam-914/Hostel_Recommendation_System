package com.example.backend.controller;

import com.example.backend.dto.IssueDetailResponse;
import com.example.backend.dto.IssueReplyRequest;
import com.example.backend.dto.IssueResponseDto;
import com.example.backend.dto.IssueStatusUpdateRequest;
import com.example.backend.service.IssueService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/issues")
@RequiredArgsConstructor
public class AdminIssueController {

    private final IssueService issueService;

    /**
     * =========================================================
     * GET ALL ADMIN ISSUES
     * =========================================================
     *
     * GET /api/admin/issues
     */
    @GetMapping
    public ResponseEntity<List<IssueResponseDto>> getAllAdminIssues() {

        List<IssueResponseDto> issues =
                issueService.getAllAdminIssues();

        return ResponseEntity.ok(issues);
    }

    /**
     * =========================================================
     * GET ADMIN ISSUE DETAILS
     * =========================================================
     *
     * GET /api/admin/issues/{issueId}
     */
    @GetMapping("/{issueId}")
    public ResponseEntity<IssueDetailResponse> getAdminIssueDetails(
            @PathVariable Long issueId) {

        IssueDetailResponse response =
                issueService.getAdminIssueDetails(
                        issueId
                );

        return ResponseEntity.ok(response);
    }

    /**
     * =========================================================
     * ADMIN REPLY
     * =========================================================
     *
     * POST /api/admin/issues/{issueId}/reply
     */
    @PostMapping("/{issueId}/reply")
    public ResponseEntity<IssueResponseDto> adminReply(
            @PathVariable Long issueId,
            @Valid @RequestBody IssueReplyRequest request,
            Authentication authentication) {

        IssueResponseDto response =
                issueService.adminReply(
                        issueId,
                        request,
                        authentication
                );

        return ResponseEntity.ok(response);
    }

    /**
     * =========================================================
     * ADMIN UPDATE STATUS
     * =========================================================
     *
     * PUT /api/admin/issues/{issueId}/status
     */
    @PutMapping("/{issueId}/status")
    public ResponseEntity<IssueResponseDto> adminUpdateStatus(
            @PathVariable Long issueId,
            @Valid @RequestBody IssueStatusUpdateRequest request,
            Authentication authentication) {

        IssueResponseDto response =
                issueService.adminUpdateStatus(
                        issueId,
                        request,
                        authentication
                );

        return ResponseEntity.ok(response);
    }
}