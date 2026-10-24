package com.example.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostelBasicInfoRequest {

    private String hostelName;
    private String hostelType;
    private String ownerName;
    private String phoneNumber;
    private String description;
}