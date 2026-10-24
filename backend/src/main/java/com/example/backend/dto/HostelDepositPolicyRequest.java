package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostelDepositPolicyRequest {

    @NotBlank(message = "Refund policy is required")
    private String refundPolicy;
}