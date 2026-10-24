package com.example.backend.dto;

import com.example.backend.entity.IssuePriority;
import com.example.backend.entity.IssueStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueDetailResponse {

    /**
     * Issue ID.
     */
    private Long id;

    /**
     * Hostel ID.
     */
    private Long hostelId;

    /**
     * Hostel name.
     */
    private String hostelName;

    /**
     * User who reported the issue.
     */
    private Long userId;

    /**
     * Name of the reporting user.
     */
    private String userName;

    /**
     * Email of the reporting user.
     */
    private String userEmail;

    /**
     * Issue category.
     */
    private String category;

    /**
     * Issue subject/title.
     */
    private String subject;

    /**
     * Complete issue description.
     */
    private String description;

    /**
     * Issue priority.
     */
    private IssuePriority priority;

    /**
     * Current status.
     */
    private IssueStatus status;

    /**
     * Issue creation time.
     */
    private LocalDateTime createdAt;

    /**
     * Last update time.
     */
    private LocalDateTime updatedAt;

    /**
     * Resolution time.
     */
    private LocalDateTime resolvedAt;

    /**
     * Complete conversation between user, owner and admin.
     */
    private List<IssueResponseDto> responses;

    /**
     * Complete status history.
     */
    private List<IssueStatusHistoryDto> statusHistory;

    /**
     * Uploaded issue attachments.
     */
    private List<IssueAttachmentDto> attachments;

    /**
     * DTO representing a status-history entry.
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class IssueStatusHistoryDto {

        private Long id;

        private IssueStatus status;

        private Long changedByUserId;

        private String changedByUserName;

        private String changedByUserEmail;

        private LocalDateTime changedAt;
    }

    /**
     * DTO representing an issue attachment.
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class IssueAttachmentDto {

        private Long id;

        private String originalFileName;

        private String fileName;

        private String filePath;

        private String fileType;

        private Long fileSize;

        private LocalDateTime uploadedAt;
    }
}