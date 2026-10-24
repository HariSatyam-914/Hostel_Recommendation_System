package com.example.backend.controller;

import com.example.backend.dto.HostelPhotoResponse;
import com.example.backend.service.HostelPhotoService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/owner/hostels")
@RequiredArgsConstructor
public class HostelPhotoController {


    private final HostelPhotoService hostelPhotoService;


    // =====================================================
    // UPLOAD COVER + ADDITIONAL PHOTOS
    // =====================================================

    @PostMapping(
            value = "/{hostelId}/photos",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<List<HostelPhotoResponse>> uploadPhotos(

            @PathVariable Long hostelId,

            @RequestPart(
                    value = "coverImage",
                    required = false
            )
            MultipartFile coverImage,

            @RequestPart(
                    value = "additionalPhotos",
                    required = false
            )
            List<MultipartFile> additionalPhotos

    ) {


        System.out.println(
                "========== HOSTEL PHOTO UPLOAD =========="
        );

        System.out.println(
                "Hostel ID: " + hostelId
        );

        System.out.println(
                "Cover Image: "
                        + (
                        coverImage != null
                                ? coverImage.getOriginalFilename()
                                : "NULL"
                )
        );

        System.out.println(
                "Additional Photos: "
                        + (
                        additionalPhotos != null
                                ? additionalPhotos.size()
                                : 0
                )
        );


        List<HostelPhotoResponse> response =
                hostelPhotoService.savePhotos(
                        hostelId,
                        coverImage,
                        additionalPhotos
                );


        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =====================================================
    // GET HOSTEL PHOTOS
    // =====================================================

    @GetMapping("/{hostelId}/photos")
    public ResponseEntity<List<HostelPhotoResponse>> getPhotos(

            @PathVariable Long hostelId

    ) {


        List<HostelPhotoResponse> response =
                hostelPhotoService.getPhotos(
                        hostelId
                );


        return ResponseEntity.ok(
                response
        );
    }


    // =====================================================
    // DELETE ADDITIONAL PHOTO
    // =====================================================

    @DeleteMapping(
            "/{hostelId}/photos/{photoId}"
    )
    public ResponseEntity<String> deletePhoto(

            @PathVariable Long hostelId,

            @PathVariable Long photoId

    ) {


        hostelPhotoService.deletePhoto(
                hostelId,
                photoId
        );


        return ResponseEntity.ok(
                "Photo deleted successfully."
        );
    }
}