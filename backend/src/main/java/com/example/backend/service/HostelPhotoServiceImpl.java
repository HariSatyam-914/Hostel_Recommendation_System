package com.example.backend.service;

import com.example.backend.dto.HostelPhotoResponse;
import com.example.backend.entity.HostelBasicInfo;
import com.example.backend.entity.HostelPhoto;
import com.example.backend.entity.HostelPhotoType;
import com.example.backend.entity.VerificationStatus;
import com.example.backend.repository.HostelPhotoRepository;
import com.example.backend.repository.HostelRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HostelPhotoServiceImpl
        implements HostelPhotoService {

    private final HostelPhotoRepository hostelPhotoRepository;

    private final HostelRepository hostelRepository;

    // =====================================================
    // CONFIGURATION
    // =====================================================

    @Value("${hostel.upload.directory:uploads/hostels}")
    private String uploadDirectory;

    private static final long MAX_FILE_SIZE =
            10 * 1024 * 1024; // 10 MB

    private static final Set<String> ALLOWED_TYPES =
            Set.of(
                    "image/jpeg",
                    "image/png",
                    "image/webp"
            );

    // =====================================================
    // SAVE PHOTOS
    // =====================================================

    @Override
    @Transactional
    public List<HostelPhotoResponse> savePhotos(
            Long hostelId,
            MultipartFile coverImage,
            List<MultipartFile> additionalPhotos) {

        // =====================================================
        // 1. FIND HOSTEL
        // =====================================================

        HostelBasicInfo hostel =
                hostelRepository.findById(hostelId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Hostel not found with ID: "
                                                + hostelId
                                )
                        );

        // =====================================================
        // 2. COVER IMAGE REQUIRED
        // =====================================================

        if (coverImage == null || coverImage.isEmpty()) {

            throw new RuntimeException(
                    "Main cover image is required."
            );
        }

        validateImage(coverImage);

        // =====================================================
        // 3. SAVE / REPLACE COVER
        // =====================================================

        HostelPhoto coverPhoto =
                hostelPhotoRepository
                        .findByHostel_HostelIdAndPhotoType(
                                hostelId,
                                HostelPhotoType.COVER
                        )
                        .orElse(null);

        String coverFileName =
                generateFileName(coverImage);

        String coverFileUrl =
                saveFile(
                        hostelId,
                        coverImage,
                        coverFileName
                );

        if (coverPhoto == null) {

            coverPhoto =
                    HostelPhoto.builder()
                            .hostel(hostel)
                            .photoType(
                                    HostelPhotoType.COVER
                            )
                            .fileName(coverFileName)
                            .fileUrl(coverFileUrl)
                            .displayOrder(0)

                            // =================================================
                            // OWNER-UPLOADED COVER
                            // =================================================
                            .verificationStatus(
                                    VerificationStatus.APPROVED
                            )
                            .rejectionReason(null)
                            .reviewedAt(null)
                            .reviewedBy(null)

                            .build();

        } else {

            // Delete previous cover file
            deletePhysicalFile(
                    coverPhoto.getFileUrl()
            );

            coverPhoto.setFileName(
                    coverFileName
            );

            coverPhoto.setFileUrl(
                    coverFileUrl
            );

            coverPhoto.setDisplayOrder(0);

            // =================================================
            // OWNER REPLACED A PREVIOUS COVER
            // =================================================
            //
            // If the old cover was REJECTED, do not keep that
            // rejected status/rejection reason on the new image.
            //
            // The newly uploaded cover is automatically approved.
            //
            coverPhoto.setVerificationStatus(
                    VerificationStatus.APPROVED
            );

            coverPhoto.setRejectionReason(null);

            coverPhoto.setReviewedAt(null);

            coverPhoto.setReviewedBy(null);
        }

        hostelPhotoRepository.save(
                coverPhoto
        );

        // =====================================================
        // 4. ADDITIONAL PHOTOS
        // =====================================================

        List<MultipartFile> validPhotos =
                additionalPhotos == null
                        ? new ArrayList<>()
                        : additionalPhotos.stream()
                                .filter(Objects::nonNull)
                                .filter(file -> !file.isEmpty())
                                .toList();

        // -----------------------------------------------------
        // Maximum 4 additional photos
        // -----------------------------------------------------

        if (validPhotos.size() > 4) {

            throw new RuntimeException(
                    "A maximum of 4 additional photos are allowed. "
                            + "You submitted "
                            + validPhotos.size()
                            + " additional photo(s)."
            );
        }

        // -----------------------------------------------------
        // Only replace additional photos when new photos
        // are actually supplied.
        // -----------------------------------------------------

        if (!validPhotos.isEmpty()) {

            // ---------------------------------------------
            // Get existing additional photos
            // ---------------------------------------------

            List<HostelPhoto> existingPhotos =
                    hostelPhotoRepository
                            .findByHostel_HostelIdAndPhotoTypeOrderByDisplayOrderAsc(
                                    hostelId,
                                    HostelPhotoType.ADDITIONAL
                            );

            // ---------------------------------------------
            // Delete existing physical files
            // ---------------------------------------------

            for (HostelPhoto existingPhoto :
                    existingPhotos) {

                deletePhysicalFile(
                        existingPhoto.getFileUrl()
                );
            }

            // ---------------------------------------------
            // Delete existing DB records
            // ---------------------------------------------

            if (!existingPhotos.isEmpty()) {

                hostelPhotoRepository.deleteAll(
                        existingPhotos
                );
            }

            // ---------------------------------------------
            // Save new additional photos
            // ---------------------------------------------

            int order = 1;

            for (MultipartFile photo :
                    validPhotos) {

                validateImage(photo);

                String fileName =
                        generateFileName(photo);

                String fileUrl =
                        saveFile(
                                hostelId,
                                photo,
                                fileName
                        );

                HostelPhoto additionalPhoto =
                        HostelPhoto.builder()
                                .hostel(hostel)
                                .photoType(
                                        HostelPhotoType.ADDITIONAL
                                )
                                .fileName(fileName)
                                .fileUrl(fileUrl)
                                .displayOrder(order++)

                                // =================================================
                                // OWNER-UPLOADED ADDITIONAL PHOTO
                                // =================================================
                                //
                                // New owner-uploaded hostel photos are
                                // automatically approved.
                                //
                                .verificationStatus(
                                        VerificationStatus.APPROVED
                                )
                                .rejectionReason(null)
                                .reviewedAt(null)
                                .reviewedBy(null)

                                .build();

                hostelPhotoRepository.save(
                        additionalPhoto
                );
            }
        }

        // =====================================================
        // 5. RETURN CURRENT PHOTOS
        // =====================================================

        return getPhotos(hostelId);
    }

    // =====================================================
    // GET PHOTOS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<HostelPhotoResponse> getPhotos(
            Long hostelId) {

        if (!hostelRepository.existsById(hostelId)) {

            throw new RuntimeException(
                    "Hostel not found with ID: "
                            + hostelId
            );
        }

        return hostelPhotoRepository
                .findByHostel_HostelIdOrderByPhotoTypeAscDisplayOrderAsc(
                        hostelId
                )
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // =====================================================
    // DELETE PHOTO
    // =====================================================

    @Override
    @Transactional
    public void deletePhoto(
            Long hostelId,
            Long photoId) {

        HostelPhoto photo =
                hostelPhotoRepository
                        .findById(photoId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Photo not found with ID: "
                                                + photoId
                                )
                        );

        // ---------------------------------------------
        // Make sure photo belongs to hostel
        // ---------------------------------------------

        if (!photo.getHostel()
                .getHostelId()
                .equals(hostelId)) {

            throw new RuntimeException(
                    "Photo does not belong to this hostel."
            );
        }

        // ---------------------------------------------
        // COVER CANNOT BE DELETED
        // ---------------------------------------------

        if (photo.getPhotoType()
                == HostelPhotoType.COVER) {

            throw new RuntimeException(
                    "Main cover image cannot be deleted. "
                            + "Upload a new cover image instead."
            );
        }

        // ---------------------------------------------
        // Delete physical file
        // ---------------------------------------------

        deletePhysicalFile(
                photo.getFileUrl()
        );

        // ---------------------------------------------
        // Delete DB record
        // ---------------------------------------------

        hostelPhotoRepository.delete(
                photo
        );

        // ---------------------------------------------
        // Re-order additional photos
        // ---------------------------------------------

        List<HostelPhoto> remaining =
                hostelPhotoRepository
                        .findByHostel_HostelIdAndPhotoTypeOrderByDisplayOrderAsc(
                                hostelId,
                                HostelPhotoType.ADDITIONAL
                        );

        int order = 1;

        for (HostelPhoto remainingPhoto :
                remaining) {

            remainingPhoto.setDisplayOrder(
                    order++
            );
        }

        hostelPhotoRepository.saveAll(
                remaining
        );
    }

    // =====================================================
    // VALIDATE IMAGE
    // =====================================================

    private void validateImage(
            MultipartFile file) {

        if (file == null ||
                file.isEmpty()) {

            throw new RuntimeException(
                    "Image file is empty."
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {

            throw new RuntimeException(
                    "Image size cannot exceed 10 MB."
            );
        }

        String contentType =
                file.getContentType();

        if (contentType == null ||
                !ALLOWED_TYPES.contains(
                        contentType.toLowerCase()
                )) {

            throw new RuntimeException(
                    "Only JPG, PNG and WEBP images are allowed."
            );
        }
    }

    // =====================================================
    // GENERATE UNIQUE FILE NAME
    // =====================================================

    private String generateFileName(
            MultipartFile file) {

        String originalName =
                file.getOriginalFilename();

        String extension = "";

        if (originalName != null &&
                originalName.contains(".")) {

            extension =
                    originalName.substring(
                            originalName.lastIndexOf(".")
                    );
        }

        return UUID.randomUUID()
                + extension.toLowerCase();
    }

    // =====================================================
    // SAVE PHYSICAL FILE
    // =====================================================

    private String saveFile(
            Long hostelId,
            MultipartFile file,
            String fileName) {

        try {

            // -------------------------------------------------
            // Use exactly the same configured directory as
            // FileStorageConfig.
            // -------------------------------------------------

            Path baseDirectory =
                    Paths.get(uploadDirectory)
                            .toAbsolutePath()
                            .normalize();

            Files.createDirectories(
                    baseDirectory
            );

            Path hostelDirectory =
                    baseDirectory
                            .resolve(
                                    String.valueOf(hostelId)
                            )
                            .normalize();

            Files.createDirectories(
                    hostelDirectory
            );

            Path target =
                    hostelDirectory
                            .resolve(fileName)
                            .normalize();

            // -------------------------------------------------
            // Prevent path traversal
            // -------------------------------------------------

            if (!target.startsWith(
                    hostelDirectory)) {

                throw new RuntimeException(
                        "Invalid image file path."
                );
            }

            Files.copy(
                    file.getInputStream(),
                    target,
                    StandardCopyOption.REPLACE_EXISTING
            );

            // -------------------------------------------------
            // Verify physical file
            // -------------------------------------------------

            if (!Files.exists(target)) {

                throw new RuntimeException(
                        "Image was not saved correctly: "
                                + target.toAbsolutePath()
                );
            }

            System.out.println(
                    "================================================"
            );

            System.out.println(
                    "HOSTEL PHOTO SAVED"
            );

            System.out.println(
                    "Physical file: "
                            + target.toAbsolutePath()
            );

            System.out.println(
                    "File exists: "
                            + Files.exists(target)
            );

            System.out.println(
                    "File size: "
                            + Files.size(target)
                            + " bytes"
            );

            System.out.println(
                    "Returned URL: /uploads/hostels/"
                            + hostelId
                            + "/"
                            + fileName
            );

            System.out.println(
                    "================================================"
            );

            return "/uploads/hostels/"
                    + hostelId
                    + "/"
                    + fileName;

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to save image.",
                    e
            );
        }
    }

    // =====================================================
    // DELETE PHYSICAL FILE
    // =====================================================

    private void deletePhysicalFile(
            String fileUrl) {

        if (fileUrl == null ||
                fileUrl.isBlank()) {

            return;
        }

        try {

            // -------------------------------------------------
            // Only process URLs generated by this service.
            // -------------------------------------------------

            String prefix =
                    "/uploads/hostels/";

            if (!fileUrl.startsWith(prefix)) {

                System.err.println(
                        "Skipping unsupported image URL: "
                                + fileUrl
                );

                return;
            }

            String relativePath =
                    fileUrl.substring(
                            prefix.length()
                    );

            // -------------------------------------------------
            // Use the SAME configured directory used by
            // saveFile and FileStorageConfig.
            // -------------------------------------------------

            Path baseDirectory =
                    Paths.get(uploadDirectory)
                            .toAbsolutePath()
                            .normalize();

            Path filePath =
                    baseDirectory
                            .resolve(relativePath)
                            .normalize();

            // -------------------------------------------------
            // Prevent deleting files outside hostel uploads.
            // -------------------------------------------------

            if (!filePath.startsWith(
                    baseDirectory)) {

                System.err.println(
                        "Refusing to delete file outside "
                                + "hostel upload directory: "
                                + filePath
                );

                return;
            }

            boolean existed =
                    Files.exists(filePath);

            Files.deleteIfExists(
                    filePath
            );

            System.out.println(
                    "OLD HOSTEL PHOTO DELETE"
            );

            System.out.println(
                    "Physical file: "
                            + filePath.toAbsolutePath()
            );

            System.out.println(
                    "File existed: "
                            + existed
            );

            System.out.println(
                    "File exists after delete: "
                            + Files.exists(filePath)
            );

        } catch (IOException e) {

            System.err.println(
                    "Could not delete old image: "
                            + e.getMessage()
            );
        }
    }

    // =====================================================
    // ENTITY -> RESPONSE
    // =====================================================

    private HostelPhotoResponse convertToResponse(
            HostelPhoto photo) {

        return HostelPhotoResponse.builder()
                .id(photo.getId())
                .hostelId(
                        photo.getHostel()
                                .getHostelId()
                )
                .photoType(
                        photo.getPhotoType()
                                .name()
                )
                .fileName(
                        photo.getFileName()
                )
                .fileUrl(
                        photo.getFileUrl()
                )
                .displayOrder(
                        photo.getDisplayOrder()
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