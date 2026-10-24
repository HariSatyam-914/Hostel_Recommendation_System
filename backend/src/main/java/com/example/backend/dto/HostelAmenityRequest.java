package com.example.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostelAmenityRequest {

    private String amenityCode;

    private String amenityName;

    private boolean photoRequired;
}