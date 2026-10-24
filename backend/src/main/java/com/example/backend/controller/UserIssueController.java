package com.example.backend.controller;

import com.example.backend.dto.IssueCreateRequest;
import com.example.backend.dto.IssueDetailResponse;
import com.example.backend.dto.IssueReplyRequest;
import com.example.backend.dto.IssueResponseDto;
import com.example.backend.service.IssueService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class UserIssueController {

    private final IssueService issueService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<IssueResponseDto> createIssue(
            @Valid @RequestPart("request") IssueCreateRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Authentication authentication) {

        IssueResponseDto response =
                issueService.createIssue(request, file, authentication);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/hostel/{hostelId}/mine")
    public ResponseEntity<List<IssueResponseDto>> getMyIssuesForHostel(
            @PathVariable Long hostelId,
            Authentication authentication) {

        List<IssueResponseDto> issues =
                issueService.getMyIssuesForHostel(hostelId, authentication);

        return ResponseEntity.ok(issues);
    }

    @GetMapping("/{issueId}")
    public ResponseEntity<IssueDetailResponse> getIssueDetails(
            @PathVariable Long issueId,
            Authentication authentication) {

        IssueDetailResponse response =
                issueService.getIssueDetails(issueId, authentication);

        return ResponseEntity.ok(response);
    }

    /*
     * USER ACCEPTS OWNER'S RESOLUTION
     */
    @PostMapping("/{issueId}/approve-resolution")
    public ResponseEntity<IssueResponseDto> approveResolution(
            @PathVariable Long issueId,
            Authentication authentication) {

        IssueResponseDto response =
                issueService.userApproveResolution(
                        issueId,
                        authentication
                );

        return ResponseEntity.ok(response);
    }

    /*
     * USER REJECTS OWNER'S RESOLUTION
     */
    @PostMapping("/{issueId}/reject-resolution")
    public ResponseEntity<IssueResponseDto> rejectResolution(
            @PathVariable Long issueId,
            Authentication authentication) {

        IssueResponseDto response =
                issueService.userRejectResolution(
                        issueId,
                        authentication
                );

        return ResponseEntity.ok(response);
    }
}