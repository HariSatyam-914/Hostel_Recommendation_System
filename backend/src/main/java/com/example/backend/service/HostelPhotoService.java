package com.example.backend.service;

import com.example.backend.dto.HostelPhotoResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface HostelPhotoService {


    // =====================================================
    // SAVE / UPDATE COVER + ADDITIONAL PHOTOS
    // =====================================================

    List<HostelPhotoResponse> savePhotos(
            Long hostelId,
            MultipartFile coverImage,
            List<MultipartFile> additionalPhotos
    );


    // =====================================================
    // GET HOSTEL PHOTOS
    // =====================================================

    List<HostelPhotoResponse> getPhotos(
            Long hostelId
    );


    // =====================================================
    // DELETE ADDITIONAL PHOTO
    // =====================================================

    void deletePhoto(
            Long hostelId,
            Long photoId
    );
}