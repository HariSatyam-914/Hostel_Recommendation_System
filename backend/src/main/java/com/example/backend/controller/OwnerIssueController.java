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
@RequestMapping("/api/owner/issues")
@RequiredArgsConstructor
public class OwnerIssueController {

    private final IssueService issueService;

    /**
     * =========================================================
     * GET OWNER ISSUES
     * =========================================================
     *
     * GET /api/owner/issues
     */
    @GetMapping
    public ResponseEntity<List<IssueResponseDto>> getOwnerIssues(
            Authentication authentication) {

        List<IssueResponseDto> issues =
                issueService.getOwnerIssues(
                        authentication
                );

        return ResponseEntity.ok(issues);
    }

    /**
     * =========================================================
     * GET OWNER ISSUE DETAILS
     * =========================================================
     *
     * GET /api/owner/issues/{issueId}
     */
    @GetMapping("/{issueId}")
    public ResponseEntity<IssueDetailResponse> getOwnerIssueDetails(
            @PathVariable Long issueId,
            Authentication authentication) {

        IssueDetailResponse response =
                issueService.getOwnerIssueDetails(
                        issueId,
                        authentication
                );

        return ResponseEntity.ok(response);
    }

    /**
     * =========================================================
     * OWNER REPLY
     * =========================================================
     *
     * POST /api/owner/issues/{issueId}/reply
     */
    @PostMapping("/{issueId}/reply")
    public ResponseEntity<IssueResponseDto> ownerReply(
            @PathVariable Long issueId,
            @Valid @RequestBody IssueReplyRequest request,
            Authentication authentication) {

        IssueResponseDto response =
                issueService.ownerReply(
                        issueId,
                        request,
                        authentication
                );

        return ResponseEntity.ok(response);
    }

    /**
     * =========================================================
     * OWNER UPDATE STATUS
     * =========================================================
     *
     * PUT /api/owner/issues/{issueId}/status
     */
    @PutMapping("/{issueId}/status")
    public ResponseEntity<IssueResponseDto> ownerUpdateStatus(
            @PathVariable Long issueId,
            @Valid @RequestBody IssueStatusUpdateRequest request,
            Authentication authentication) {

        IssueResponseDto response =
                issueService.ownerUpdateStatus(
                        issueId,
                        request,
                        authentication
                );

        return ResponseEntity.ok(response);
    }
}