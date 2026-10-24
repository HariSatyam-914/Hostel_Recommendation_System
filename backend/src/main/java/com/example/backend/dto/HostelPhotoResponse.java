package com.example.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostelPhotoResponse {

    private Long id;

    private Long hostelId;

    private String photoType;

    private String fileName;

    private String fileUrl;

    private Integer displayOrder;

    private String verificationStatus;

    private String rejectionReason;
}