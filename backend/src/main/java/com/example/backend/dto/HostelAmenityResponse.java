package com.example.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostelAmenityResponse {

    private Long amenityId;

    private Long hostelId;

    private String amenityCode;

    private String amenityName;

    private boolean photoRequired;

    private AmenityPhotoResponse photo;
}