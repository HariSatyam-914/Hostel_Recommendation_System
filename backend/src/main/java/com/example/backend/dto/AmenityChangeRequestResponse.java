package com.example.backend.dto;

import com.example.backend.entity.AmenityChangeRequestStatus;
import com.example.backend.entity.AmenityChangeRequestType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AmenityChangeRequestResponse {

    private Long id;

    private Long hostelId;

    private String hostelName;

    private Long amenityId;

    private String amenityCode;

    private String amenityName;

    private boolean photoRequired;

    private Long photoId;

    private String photoUrl;

    private String photoVerificationStatus;

    private AmenityChangeRequestType requestType;

    private AmenityChangeRequestStatus status;

    private String rejectionReason;

    private LocalDateTime submittedAt;

    private LocalDateTime reviewedAt;

    private Long reviewedBy;
}