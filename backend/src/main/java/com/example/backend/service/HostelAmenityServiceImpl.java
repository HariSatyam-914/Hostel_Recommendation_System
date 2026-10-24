package com.example.backend.service;

import com.example.backend.dto.AmenityPhotoResponse;
import com.example.backend.dto.HostelAmenityRequest;
import com.example.backend.dto.HostelAmenityResponse;

import com.example.backend.entity.AmenityPhoto;
import com.example.backend.entity.HostelAmenity;
import com.example.backend.entity.HostelBasicInfo;
import com.example.backend.entity.VerificationStatus;

import com.example.backend.repository.AmenityPhotoRepository;
import com.example.backend.repository.HostelAmenityRepository;
import com.example.backend.repository.HostelRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HostelAmenityServiceImpl
        implements HostelAmenityService {

    private final HostelRepository hostelRepository;

    private final HostelAmenityRepository hostelAmenityRepository;

    private final AmenityPhotoRepository amenityPhotoRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDirectory;


    // =====================================================
    // SAVE AMENITY
    // =====================================================

    @Override
    public HostelAmenityResponse saveAmenity(
            Long hostelId,
            HostelAmenityRequest request
    ) {

        System.out.println("Hostel ID: " + hostelId);
        System.out.println(
                "Amenity Code: "
                        + request.getAmenityCode()
        );
        System.out.println(
                "Amenity Name: "
                        + request.getAmenityName()
        );
        System.out.println(
                "Photo Required: "
                        + request.isPhotoRequired()
        );

        if (request.getAmenityCode() == null ||
                request.getAmenityCode().isBlank()) {

            throw new RuntimeException(
                    "Amenity code is required"
            );
        }

        if (request.getAmenityName() == null ||
                request.getAmenityName().isBlank()) {

            throw new RuntimeException(
                    "Amenity name is required"
            );
        }

        HostelBasicInfo hostel =
                hostelRepository.findById(hostelId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Hostel not found: "
                                                + hostelId
                                )
                        );

        HostelAmenity amenity =
                hostelAmenityRepository
                        .findByHostelHostelIdAndAmenityCode(
                                hostelId,
                                request.getAmenityCode()
                        )
                        .orElse(null);

        if (amenity == null) {

            amenity =
                    HostelAmenity.builder()
                            .hostel(hostel)
                            .amenityCode(
                                    request.getAmenityCode()
                            )
                            .amenityName(
                                    request.getAmenityName()
                            )
                            .photoRequired(
                                    request.isPhotoRequired()
                            )
                            .build();

        } else {

            amenity.setAmenityName(
                    request.getAmenityName()
            );

            amenity.setPhotoRequired(
                    request.isPhotoRequired()
            );
        }

        HostelAmenity saved =
                hostelAmenityRepository.save(
                        amenity
                );

        return toResponse(saved);
    }


    // =====================================================
    // GET HOSTEL AMENITIES
    // =====================================================

    @Override
    public List<HostelAmenityResponse>
    getHostelAmenities(
            Long hostelId
    ) {

        List<HostelAmenity> amenities =
                hostelAmenityRepository
                        .findByHostelHostelId(
                                hostelId
                        );

        return amenities.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }


    // =====================================================
    // UPLOAD AMENITY PHOTO
    // =====================================================

    @Override
    public AmenityPhotoResponse uploadAmenityPhoto(
            Long amenityId,
            MultipartFile file
    ) {

        if (file == null || file.isEmpty()) {

            throw new RuntimeException(
                    "Photo file is required"
            );
        }

        HostelAmenity amenity =
                hostelAmenityRepository.findById(
                        amenityId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Amenity not found"
                        )
                );

        /*
         * KEEPING EXISTING BEHAVIOUR.
         *
         * This method is still used by the existing
         * new-amenity submission flow.
         */
        if (amenityPhotoRepository
                .findFirstByAmenityIdOrderByIdDesc(
                        amenityId
                )
                .isPresent()) {

            System.out.println(
                    "Amenity photo already exists. "
                            + "Skipping duplicate upload."
            );

            return toPhotoResponse(
                    amenityPhotoRepository
                            .findFirstByAmenityIdOrderByIdDesc(
                                    amenityId
                            )
                            .get()
            );
        }

        // =====================================================
        // VALIDATE IMAGE
        // =====================================================

        validateImage(file);

        // =====================================================
        // CREATE DIRECTORY
        // =====================================================

        Path hostelDirectory =
                Paths.get(
                        uploadDirectory,
                        "amenities",
                        String.valueOf(
                                amenity.getHostel()
                                        .getHostelId()
                        ),
                        amenity.getAmenityCode()
                );

        try {

            Files.createDirectories(
                    hostelDirectory
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "Unable to create upload directory",
                    e
            );
        }

        // =====================================================
        // FILE NAME
        // =====================================================

        String originalFileName =
                StringUtils.cleanPath(
                        file.getOriginalFilename() == null
                                ? "amenity-image"
                                : file.getOriginalFilename()
                );

        String extension =
                getExtension(
                        originalFileName
                );

        String generatedFileName =
                UUID.randomUUID()
                        + extension;

        Path targetPath =
                hostelDirectory.resolve(
                        generatedFileName
                );

        // =====================================================
        // SAVE FILE
        // =====================================================

        try {

            Files.copy(
                    file.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to store image",
                    e
            );
        }

        // =====================================================
        // SAVE DATABASE RECORD
        // =====================================================

        AmenityPhoto photo =
                AmenityPhoto.builder()
                        .amenity(amenity)
                        .fileName(originalFileName)
                        .fileType(
                                file.getContentType()
                        )
                        .fileSize(file.getSize())
                        .filePath(
                                targetPath.toString()
                        )
                        .verificationStatus(
                                VerificationStatus.PENDING
                        )
                        .build();

        AmenityPhoto savedPhoto =
                amenityPhotoRepository.save(
                        photo
                );

        return toPhotoResponse(
                savedPhoto
        );
    }


    // =====================================================
    // RE-UPLOAD REJECTED AMENITY PHOTO
    // =====================================================

    @Override
    @Transactional
    public AmenityPhotoResponse reuploadRejectedAmenityPhoto(
            Long amenityId,
            MultipartFile file
    ) {

        if (amenityId == null) {

            throw new RuntimeException(
                    "Amenity ID is required"
            );
        }

        validateImage(file);

        HostelAmenity amenity =
                hostelAmenityRepository.findById(
                        amenityId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Amenity not found: "
                                        + amenityId
                        )
                );

        // =====================================================
        // FIND LATEST REJECTED PHOTO
        // =====================================================

        AmenityPhoto rejectedPhoto =
                amenityPhotoRepository
                        .findFirstByAmenityIdAndVerificationStatusOrderByIdDesc(
                                amenityId,
                                VerificationStatus.REJECTED
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No rejected amenity photo found "
                                                + "for amenity: "
                                                + amenityId
                                )
                        );

        // =====================================================
        // CREATE DIRECTORY
        // =====================================================

        Path hostelDirectory =
                Paths.get(
                        uploadDirectory,
                        "amenities",
                        String.valueOf(
                                amenity.getHostel()
                                        .getHostelId()
                        ),
                        amenity.getAmenityCode()
                );

        try {

            Files.createDirectories(
                    hostelDirectory
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "Unable to create upload directory",
                    e
            );
        }

        // =====================================================
        // GENERATE NEW FILE NAME
        // =====================================================

        String originalFileName =
                StringUtils.cleanPath(
                        file.getOriginalFilename() == null
                                ? "amenity-image"
                                : file.getOriginalFilename()
                );

        String extension =
                getExtension(
                        originalFileName
                );

        String generatedFileName =
                UUID.randomUUID()
                        + extension;

        Path targetPath =
                hostelDirectory.resolve(
                        generatedFileName
                );

        // =====================================================
        // SAVE NEW FILE FIRST
        // =====================================================

        try {

            Files.copy(
                    file.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to store re-uploaded amenity image",
                    e
            );
        }

        // =====================================================
        // DELETE OLD PHYSICAL FILE
        // =====================================================

        String oldFilePath =
                rejectedPhoto.getFilePath();

        if (oldFilePath != null &&
                !oldFilePath.isBlank()) {

            try {

                Files.deleteIfExists(
                        Paths.get(oldFilePath)
                );

            } catch (IOException e) {

                System.err.println(
                        "Warning: unable to delete old "
                                + "rejected amenity image: "
                                + e.getMessage()
                );
            }
        }

        // =====================================================
        // UPDATE EXISTING PHOTO RECORD
        // =====================================================

        rejectedPhoto.setFileName(
                originalFileName
        );

        rejectedPhoto.setFileType(
                file.getContentType()
        );

        rejectedPhoto.setFileSize(
                file.getSize()
        );

        rejectedPhoto.setFilePath(
                targetPath.toString()
        );

        rejectedPhoto.setVerificationStatus(
                VerificationStatus.PENDING
        );

        rejectedPhoto.setRejectionReason(
                null
        );

        rejectedPhoto.setReviewedAt(
                null
        );

        rejectedPhoto.setReviewedBy(
                null
        );

        AmenityPhoto savedPhoto =
                amenityPhotoRepository.save(
                        rejectedPhoto
                );

        return toPhotoResponse(
                savedPhoto
        );
    }


    // =====================================================
    // GET AMENITY PHOTOS
    // =====================================================

    @Override
    public List<AmenityPhotoResponse>
    getAmenityPhotos(
            Long amenityId
    ) {

        return amenityPhotoRepository
                .findByAmenityId(amenityId)
                .stream()
                .map(this::toPhotoResponse)
                .collect(Collectors.toList());
    }


    // =====================================================
    // DELETE PHOTO
    // =====================================================

    @Override
    public void deleteAmenityPhoto(
            Long photoId
    ) {

        AmenityPhoto photo =
                amenityPhotoRepository
                        .findById(photoId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Photo not found"
                                )
                        );

        try {

            Files.deleteIfExists(
                    Paths.get(
                            photo.getFilePath()
                    )
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "Unable to delete image",
                    e
            );
        }

        amenityPhotoRepository.delete(photo);
    }


    // =====================================================
    // HELPERS
    // =====================================================

    private void validateImage(
            MultipartFile file
    ) {

        if (file == null || file.isEmpty()) {

            throw new RuntimeException(
                    "Photo file is required"
            );
        }

        String contentType =
                file.getContentType();

        if (contentType == null ||
                !isAllowedImageType(contentType)) {

            throw new RuntimeException(
                    "Only JPG, PNG and WEBP images are allowed"
            );
        }

        long maxSize =
                10 * 1024 * 1024;

        if (file.getSize() > maxSize) {

            throw new RuntimeException(
                    "Image size must be 10 MB or less"
            );
        }
    }


    private boolean isAllowedImageType(
            String contentType
    ) {

        return contentType.equalsIgnoreCase(
                    "image/jpeg"
                )
                || contentType.equalsIgnoreCase(
                    "image/png"
                )
                || contentType.equalsIgnoreCase(
                    "image/webp"
                );
    }


    private String getExtension(
            String fileName
    ) {

        int index =
                fileName.lastIndexOf(".");

        if (index == -1) {

            return ".jpg";
        }

        return fileName.substring(index)
                .toLowerCase();
    }


    private HostelAmenityResponse toResponse(
            HostelAmenity amenity
    ) {

        List<AmenityPhoto> photos =
                amenityPhotoRepository
                        .findByAmenityId(
                                amenity.getId()
                        );

        AmenityPhotoResponse photoResponse =
                photos.isEmpty()
                        ? null
                        : toPhotoResponse(
                                photos.get(
                                        photos.size() - 1
                                )
                        );

        return HostelAmenityResponse.builder()
                .amenityId(
                        amenity.getId()
                )
                .hostelId(
                        amenity.getHostel()
                                .getHostelId()
                )
                .amenityCode(
                        amenity.getAmenityCode()
                )
                .amenityName(
                        amenity.getAmenityName()
                )
                .photoRequired(
                        amenity.isPhotoRequired()
                )
                .photo(
                        photoResponse
                )
                .build();
    }


    private AmenityPhotoResponse toPhotoResponse(
            AmenityPhoto photo
    ) {

        return AmenityPhotoResponse.builder()
                .id(
                        photo.getId()
                )
                .fileName(
                        photo.getFileName()
                )
                .fileType(
                        photo.getFileType()
                )
                .fileSize(
                        photo.getFileSize()
                )
                .photoUrl(
                        "/api/owner/hostels/amenities/photos/"
                                + photo.getId()
                )
                .verificationStatus(
                        photo.getVerificationStatus() != null
                                ? photo.getVerificationStatus().name()
                                : null
                )
                .rejectionReason(
                        photo.getRejectionReason()
                )
                .build();
    }
}