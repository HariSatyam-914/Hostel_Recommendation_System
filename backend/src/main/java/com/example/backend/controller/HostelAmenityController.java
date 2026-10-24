package com.example.backend.controller;

import com.example.backend.dto.AmenityChangeRequestResponse;
import com.example.backend.dto.AmenityPhotoResponse;
import com.example.backend.dto.HostelAmenityRequest;
import com.example.backend.dto.HostelAmenityResponse;
import com.example.backend.entity.AmenityPhoto;
import com.example.backend.repository.AmenityPhotoRepository;
import com.example.backend.service.AmenityChangeRequestService;
import com.example.backend.service.HostelAmenityService;

import lombok.RequiredArgsConstructor;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/owner/hostels")
@RequiredArgsConstructor
public class HostelAmenityController {

    private final HostelAmenityService hostelAmenityService;

    private final AmenityPhotoRepository amenityPhotoRepository;

    /*
     * NEW:
     * Handles owner submission of pending amenity changes
     * to the admin review section.
     */
    private final AmenityChangeRequestService amenityChangeRequestService;


    // =====================================================
    // SAVE AMENITY
    // =====================================================

    @PostMapping("/{hostelId}/amenities")
    public ResponseEntity<HostelAmenityResponse>
    saveAmenity(
            @PathVariable Long hostelId,
            @RequestBody HostelAmenityRequest request
    ) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        hostelAmenityService.saveAmenity(
                                hostelId,
                                request
                        )
                );
    }


    // =====================================================
    // GET HOSTEL AMENITIES
    // =====================================================

    @GetMapping("/{hostelId}/amenities")
    public ResponseEntity<List<HostelAmenityResponse>>
    getHostelAmenities(
            @PathVariable Long hostelId
    ) {

        return ResponseEntity.ok(
                hostelAmenityService
                        .getHostelAmenities(hostelId)
        );
    }


    // =====================================================
    // UPLOAD AMENITY PHOTO
    // =====================================================

    @PostMapping(
            value = "/amenities/{amenityId}/photo",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<AmenityPhotoResponse>
    uploadAmenityPhoto(
            @PathVariable Long amenityId,
            @RequestParam("file") MultipartFile file
    ) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        hostelAmenityService
                                .uploadAmenityPhoto(
                                        amenityId,
                                        file
                                )
                );
    }


    // =====================================================
// RE-UPLOAD REJECTED AMENITY PHOTO
// =====================================================

@PostMapping(
        value = "/amenities/{amenityId}/photo/reupload",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
)
public ResponseEntity<AmenityChangeRequestResponse>
reuploadRejectedAmenityPhoto(
        @PathVariable Long amenityId,
        @RequestParam("file") MultipartFile file
) {

    AmenityChangeRequestResponse response =
            amenityChangeRequestService
                    .reuploadRejectedAmenityPhoto(
                            amenityId,
                            file
                    );

    return ResponseEntity.ok(
            response
    );
}


    // =====================================================
    // GET AMENITY PHOTOS
    // =====================================================

    @GetMapping(
            "/amenities/{amenityId}/photos"
    )
    public ResponseEntity<List<AmenityPhotoResponse>>
    getAmenityPhotos(
            @PathVariable Long amenityId
    ) {

        return ResponseEntity.ok(
                hostelAmenityService
                        .getAmenityPhotos(
                                amenityId
                        )
        );
    }


    // =====================================================
    // SUBMIT PENDING AMENITIES TO ADMIN
    // =====================================================
    /*
     * THIS IS THE ENDPOINT THAT WAS MISSING.
     *
     * Frontend calls:
     *
     * POST
     * /api/owner/hostels/{hostelId}/amenities/request
     *
     * Content-Type:
     * multipart/form-data
     *
     * requests = JSON array
     * photo_xxx = image files
     */

    @PostMapping(
            value = "/{hostelId}/amenities/request",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<List<AmenityChangeRequestResponse>>
    submitPendingAmenities(
            @PathVariable Long hostelId,
            @RequestParam("requests") String requests,
            MultipartHttpServletRequest multipartRequest
    ) {

        List<AmenityChangeRequestResponse> response =
                amenityChangeRequestService
                        .submitOwnerAmenityRequests(
                                hostelId,
                                requests,
                                multipartRequest
                        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =====================================================
    // GET AMENITY PHOTO
    // =====================================================

    @GetMapping("/amenities/photos/{photoId}")
    public ResponseEntity<Resource> getAmenityPhoto(
            @PathVariable Long photoId
    ) {

        AmenityPhoto photo =
                amenityPhotoRepository
                        .findById(photoId)
                        .orElse(null);

        if (photo == null) {
            return ResponseEntity.notFound().build();
        }

        try {

            String filePath = photo.getFilePath();

            if (filePath == null || filePath.trim().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            filePath = filePath.trim();

            /*
             * First try the path exactly as stored in the database.
             */
            Path path = Paths.get(filePath);

            /*
             * If the stored path is relative or starts with '/',
             * resolve it against the backend project directory.
             */
            if (!java.nio.file.Files.exists(path)) {

                String relativePath =
                        filePath.replaceFirst("^[\\\\/]+", "");

                path = Paths.get(
                        System.getProperty("user.dir")
                )
                .resolve(relativePath)
                .normalize();
            }

            /*
             * Make sure the actual file exists.
             */
            if (!java.nio.file.Files.exists(path)
                    || !java.nio.file.Files.isRegularFile(path)) {

                System.err.println(
                        "Amenity photo file not found: "
                                + path.toAbsolutePath()
                );

                return ResponseEntity.notFound().build();
            }

            Resource resource =
                    new UrlResource(
                            path.toUri()
                    );

            if (!resource.exists()
                    || !resource.isReadable()) {

                return ResponseEntity.notFound().build();
            }

            MediaType mediaType;

            try {

                if (photo.getFileType() != null
                        && !photo.getFileType().trim().isEmpty()) {

                    mediaType =
                            MediaType.parseMediaType(
                                    photo.getFileType()
                            );

                } else {

                    mediaType =
                            MediaType.APPLICATION_OCTET_STREAM;
                }

            } catch (Exception ignored) {

                mediaType =
                        MediaType.APPLICATION_OCTET_STREAM;
            }

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(resource);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .build();
        }
    }


    // =====================================================
    // DELETE PHOTO
    // =====================================================

    @DeleteMapping(
            "/amenities/photos/{photoId}"
    )
    public ResponseEntity<Void>
    deleteAmenityPhoto(
            @PathVariable Long photoId
    ) {

        hostelAmenityService
                .deleteAmenityPhoto(photoId);

        return ResponseEntity.noContent()
                .build();
    }
}