package com.example.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostelDepositPolicyResponse {

    private Long id;
    private Long hostelId;
    private String refundPolicy;
    private String message;
}