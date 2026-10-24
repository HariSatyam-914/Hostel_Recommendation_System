package com.example.backend.repository;

import com.example.backend.entity.AmenityPhoto;
import com.example.backend.entity.VerificationStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AmenityPhotoRepository
        extends JpaRepository<AmenityPhoto, Long> {

    // =====================================================
    // ALL PHOTOS FOR AMENITY
    // =====================================================

    List<AmenityPhoto> findByAmenityId(
            Long amenityId
    );


    // =====================================================
    // LATEST PHOTO FOR AMENITY
    // =====================================================

    Optional<AmenityPhoto>
    findFirstByAmenityIdOrderByIdDesc(
            Long amenityId
    );


    // =====================================================
    // LATEST REJECTED PHOTO FOR AMENITY
    // =====================================================

    Optional<AmenityPhoto>
    findFirstByAmenityIdAndVerificationStatusOrderByIdDesc(
            Long amenityId,
            VerificationStatus verificationStatus
    );


    // =====================================================
    // APPROVED PHOTOS
    // =====================================================

    List<AmenityPhoto>
    findByAmenityIdAndVerificationStatusOrderByIdDesc(
            Long amenityId,
            VerificationStatus verificationStatus
    );


    // =====================================================
    // LATEST APPROVED PHOTO
    // =====================================================

//     Optional<AmenityPhoto>
//     findFirstByAmenityIdAndVerificationStatusOrderByIdDesc(
//             Long amenityId,
//             VerificationStatus verificationStatus
//     );
}