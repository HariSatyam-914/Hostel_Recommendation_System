package com.example.backend.service;

import com.example.backend.dto.IssueCreateRequest;
import com.example.backend.dto.IssueDetailResponse;
import com.example.backend.dto.IssueReplyRequest;
import com.example.backend.dto.IssueResponseDto;
import com.example.backend.dto.IssueStatusUpdateRequest;

import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IssueService {

    IssueResponseDto createIssue(
            IssueCreateRequest request,
            MultipartFile file,
            Authentication authentication
    );

    List<IssueResponseDto> getMyIssuesForHostel(
            Long hostelId,
            Authentication authentication
    );

    IssueDetailResponse getIssueDetails(
            Long issueId,
            Authentication authentication
    );

    IssueResponseDto userApproveResolution(
            Long issueId,
            Authentication authentication
    );

    IssueResponseDto userRejectResolution(
            Long issueId,
            Authentication authentication
    );

    List<IssueResponseDto> getOwnerIssues(
            Authentication authentication
    );

    IssueDetailResponse getOwnerIssueDetails(
            Long issueId,
            Authentication authentication
    );

    IssueResponseDto ownerReply(
            Long issueId,
            IssueReplyRequest request,
            Authentication authentication
    );

    IssueResponseDto ownerUpdateStatus(
            Long issueId,
            IssueStatusUpdateRequest request,
            Authentication authentication
    );

    List<IssueResponseDto> getAllAdminIssues();

    IssueDetailResponse getAdminIssueDetails(
            Long issueId
    );

    IssueResponseDto adminReply(
            Long issueId,
            IssueReplyRequest request,
            Authentication authentication
    );

    IssueResponseDto adminUpdateStatus(
            Long issueId,
            IssueStatusUpdateRequest request,
            Authentication authentication
    );
}