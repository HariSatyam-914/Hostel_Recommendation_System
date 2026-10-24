package com.example.backend.dto;

import com.example.backend.entity.IssuePriority;
import com.example.backend.entity.IssueStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueResponseDto {

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
     * ID of the user who created the issue.
     */
    private Long userId;

    /**
     * Name of the user who reported the issue.
     */
    private String userName;

    /**
     * Email of the user who reported the issue.
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
     * Full issue description.
     */
    private String description;

    /**
     * Issue priority.
     */
    private IssuePriority priority;

    /**
     * Current issue status.
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
     * Latest response message, when applicable.
     *
     * This is useful for list pages where we want to show
     * the most recent response without loading the complete
     * issue conversation.
     */
    private String message;

    /**
     * Type of the latest responder.
     *
     * Examples:
     * USER
     * OWNER
     * ADMIN
     */
    private String responderType;
}