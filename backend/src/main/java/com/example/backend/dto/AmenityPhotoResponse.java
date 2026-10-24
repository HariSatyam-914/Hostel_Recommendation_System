package com.example.backend.dto;

import java.time.LocalDateTime;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AmenityPhotoResponse {

    private Long id;

    private String amenityCode;

    private String fileName;

    private Long fileSize;

    private String fileType;

    private String photoUrl;

    private String rejectionReason;

    private LocalDateTime reviewedAt;

    private Long reviewedBy;

    private LocalDateTime uploadedAt;

    private String verificationStatus;
}