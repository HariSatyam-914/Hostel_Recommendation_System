package com.example.backend.dto;

import com.example.backend.entity.IssueStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueStatusUpdateRequest {

    /**
     * New status of the issue.
     */
    @NotNull(message = "Status is required")
    private IssueStatus status;
}