package com.example.backend.dto;

import com.example.backend.entity.IssuePriority;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueCreateRequest {

    /**
     * Hostel against which the issue is being reported.
     */
    private Long hostelId;

    /**
     * Issue category.
     *
     * Examples:
     * - Incorrect hostel information
     * - Wrong room information
     * - Wrong price / rent
     * - Amenity not available
     * - Photo does not match hostel
     * - Cleanliness / maintenance
     * - Safety concern
     * - Owner-related issue
     * - Location / address issue
     * - Other
     */
    private String category;

    /**
     * Short title of the reported issue.
     */
    private String subject;

    /**
     * Complete description of the problem.
     */
    private String description;

    /**
     * Priority assigned by the user.
     *
     * LOW
     * MEDIUM
     * HIGH
     * CRITICAL
     */
    private IssuePriority priority;
}