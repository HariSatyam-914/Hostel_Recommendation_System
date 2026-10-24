package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueReplyRequest {

    /**
     * Reply/message sent by the current user.
     */
    @NotBlank(message = "Message cannot be empty")
    private String message;
}