package com.example.backend.repository;

import com.example.backend.entity.HostelPhoto;
import com.example.backend.entity.HostelPhotoType;
import com.example.backend.entity.VerificationStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HostelPhotoRepository
        extends JpaRepository<HostelPhoto, Long> {

    // =====================================================
    // FIND COVER IMAGE
    // =====================================================

    Optional<HostelPhoto>
    findFirstByHostel_HostelIdAndPhotoTypeAndVerificationStatusOrderByIdDesc(
            Long hostelId,
            HostelPhotoType photoType,
            VerificationStatus verificationStatus
    );


    // =====================================================
    // FIND ADDITIONAL APPROVED PHOTOS
    // =====================================================

    List<HostelPhoto>
    findByHostel_HostelIdAndPhotoTypeAndVerificationStatusOrderByDisplayOrderAsc(
            Long hostelId,
            HostelPhotoType photoType,
            VerificationStatus verificationStatus
    );


    // =====================================================
    // FIND ALL APPROVED PHOTOS
    // =====================================================

    List<HostelPhoto>
    findByHostel_HostelIdAndVerificationStatusOrderByDisplayOrderAsc(
            Long hostelId,
            VerificationStatus verificationStatus
    );


    // =====================================================
    // EXISTING METHODS
    // =====================================================

    Optional<HostelPhoto> findByHostel_HostelIdAndPhotoType(
            Long hostelId,
            HostelPhotoType photoType
    );

    List<HostelPhoto>
    findByHostel_HostelIdAndPhotoTypeOrderByDisplayOrderAsc(
            Long hostelId,
            HostelPhotoType photoType
    );

    long countByHostel_HostelIdAndPhotoType(
            Long hostelId,
            HostelPhotoType photoType
    );

    List<HostelPhoto>
    findByHostel_HostelIdOrderByPhotoTypeAscDisplayOrderAsc(
            Long hostelId
    );

    void deleteByIdAndHostel_HostelId(
            Long photoId,
            Long hostelId
    );

    List<HostelPhoto>
    findByHostel_HostelIdOrderByDisplayOrderAsc(
            Long hostelId
    );
}