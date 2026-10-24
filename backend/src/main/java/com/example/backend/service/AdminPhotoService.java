package com.example.backend.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.example.backend.entity.AmenityPhoto;
import com.example.backend.entity.HostelPhoto;
import com.example.backend.entity.RoomPhoto;
import com.example.backend.entity.VerificationStatus;
import com.example.backend.repository.AmenityPhotoRepository;
import com.example.backend.repository.HostelPhotoRepository;
import com.example.backend.repository.RoomPhotoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminPhotoService {

    private final AmenityPhotoRepository amenityPhotoRepository;
    private final RoomPhotoRepository roomPhotoRepository;
    private final HostelPhotoRepository hostelPhotoRepository;

    // =========================================================
    // UPDATE HOSTEL PHOTO VERIFICATION
    // =========================================================

    public void updateHostelPhotoVerification(
            Long photoId,
            String status,
            String rejectionReason,
            Long reviewedBy) {

        HostelPhoto photo =
                hostelPhotoRepository.findById(photoId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Hostel photo not found with ID: "
                                                + photoId
                                )
                        );

        VerificationStatus verificationStatus =
                parseVerificationStatus(status);

        photo.setVerificationStatus(
                verificationStatus
        );

        if (verificationStatus ==
                VerificationStatus.REJECTED) {

            photo.setRejectionReason(
                    rejectionReason
            );

        } else {

            photo.setRejectionReason(null);
        }

        photo.setReviewedBy(reviewedBy);
        photo.setReviewedAt(LocalDateTime.now());

        hostelPhotoRepository.save(photo);
    }

    // =========================================================
    // UPDATE AMENITY PHOTO VERIFICATION
    // =========================================================

    public void updateAmenityPhotoVerification(
            Long photoId,
            String status,
            String rejectionReason,
            Long reviewedBy) {

        AmenityPhoto photo =
                amenityPhotoRepository.findById(photoId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Amenity photo not found with ID: "
                                                + photoId
                                )
                        );

        VerificationStatus verificationStatus =
                parseVerificationStatus(status);

        photo.setVerificationStatus(
                verificationStatus
        );

        if (verificationStatus ==
                VerificationStatus.REJECTED) {

            photo.setRejectionReason(
                    rejectionReason
            );

        } else {

            photo.setRejectionReason(null);
        }

        photo.setReviewedBy(reviewedBy);
        photo.setReviewedAt(LocalDateTime.now());

        amenityPhotoRepository.save(photo);
    }

    // =========================================================
    // UPDATE ROOM PHOTO VERIFICATION
    // =========================================================

    public void updateRoomPhotoVerification(
            Long photoId,
            String status,
            String rejectionReason,
            Long reviewedBy) {

        RoomPhoto photo =
                roomPhotoRepository.findById(photoId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Room photo not found with ID: "
                                                + photoId
                                )
                        );

        VerificationStatus verificationStatus =
                parseVerificationStatus(status);

        photo.setVerificationStatus(
                verificationStatus
        );

        if (verificationStatus ==
                VerificationStatus.REJECTED) {

            photo.setRejectionReason(
                    rejectionReason
            );

        } else {

            photo.setRejectionReason(null);
        }

        photo.setReviewedBy(reviewedBy);
        photo.setReviewedAt(LocalDateTime.now());

        roomPhotoRepository.save(photo);
    }

    // =========================================================
    // PARSE VERIFICATION STATUS
    // =========================================================

    private VerificationStatus parseVerificationStatus(
            String status) {

        if (status == null || status.isBlank()) {

            throw new IllegalArgumentException(
                    "Verification status is required."
            );
        }

        try {

            return VerificationStatus.valueOf(
                    status.trim().toUpperCase()
            );

        } catch (IllegalArgumentException e) {

            throw new IllegalArgumentException(
                    "Invalid verification status: "
                            + status
            );
        }
    }
}