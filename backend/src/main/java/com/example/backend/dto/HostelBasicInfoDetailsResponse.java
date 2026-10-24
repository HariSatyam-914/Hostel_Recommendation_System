package com.example.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostelBasicInfoDetailsResponse {

    private Long hostelId;

    private String hostelName;

    private String hostelType;

    private String ownerName;

    private String phoneNumber;

    private String description;
}