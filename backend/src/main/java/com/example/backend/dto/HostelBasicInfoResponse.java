package com.example.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostelBasicInfoResponse {

    private Long hostelId;

    private String message;

    private String approvalStatus;
}