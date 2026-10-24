package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomPhotoResponse {

    private Long id;

    private Long roomId;

    private String fileName;

    private String originalFileName;

    private String fileUrl;

    private String filePath;

    private Integer displayOrder;

    private String verificationStatus;

    private String rejectionReason;
}