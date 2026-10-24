package com.example.backend.service;

import com.example.backend.dto.AmenityPhotoResponse;
import com.example.backend.dto.HostelAmenityRequest;
import com.example.backend.dto.HostelAmenityResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface HostelAmenityService {

    HostelAmenityResponse saveAmenity(
            Long hostelId,
            HostelAmenityRequest request
    );

    List<HostelAmenityResponse> getHostelAmenities(
            Long hostelId
    );

    AmenityPhotoResponse uploadAmenityPhoto(
            Long amenityId,
            MultipartFile file
    );

    // =====================================================
    // RE-UPLOAD REJECTED AMENITY PHOTO
    // =====================================================

    AmenityPhotoResponse reuploadRejectedAmenityPhoto(
            Long amenityId,
            MultipartFile file
    );

    List<AmenityPhotoResponse> getAmenityPhotos(
            Long amenityId
    );

    void deleteAmenityPhoto(
            Long photoId
    );
}