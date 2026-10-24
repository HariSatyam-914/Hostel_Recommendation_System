package com.example.backend.controller;

import com.example.backend.dto.HostelRoomRequest;
import com.example.backend.dto.HostelRoomResponse;
import com.example.backend.dto.HostelRoomUpdateRequest;
import com.example.backend.dto.RoomPhotoResponse;
import com.example.backend.entity.HostelRoom;
import com.example.backend.entity.RoomPhoto;
import com.example.backend.service.HostelRoomService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/owner/hostels")
public class HostelRoomController {

    private final HostelRoomService hostelRoomService;


    public HostelRoomController(
            HostelRoomService hostelRoomService) {

        this.hostelRoomService = hostelRoomService;
    }


    // =====================================================
    // CREATE ROOM
    // =====================================================

    @PostMapping(
            value = "/{hostelId}/rooms",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<HostelRoomResponse> saveRoom(

            @PathVariable Long hostelId,

            @RequestPart("room")
            @Valid HostelRoomRequest request,

            @RequestPart("photos")
            List<MultipartFile> photos) {

        HostelRoom room =
                hostelRoomService.saveRoom(
                        hostelId,
                        request,
                        photos
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toResponse(room));
    }


    // =====================================================
    // GET ALL ROOMS
    // =====================================================

    @GetMapping("/{hostelId}/rooms")
    public ResponseEntity<List<HostelRoomResponse>> getRooms(
            @PathVariable Long hostelId) {

        List<HostelRoom> rooms =
                hostelRoomService.getRoomsByHostel(hostelId);

        List<HostelRoomResponse> response =
                rooms.stream()
                        .map(this::toResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }


    // =====================================================
    // UPDATE ROOM
    // =====================================================

    @PutMapping(
            value = "/rooms/{roomId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<HostelRoomResponse> updateRoom(

            @PathVariable Long roomId,

            @RequestPart("room")
            @Valid HostelRoomUpdateRequest request,

            @RequestPart(
                    value = "photos",
                    required = false
            )
            List<MultipartFile> photos) {

        HostelRoom room =
                hostelRoomService.updateRoom(
                        roomId,
                        request,
                        photos
                );

        return ResponseEntity.ok(
                toResponse(room)
        );
    }


    // =====================================================
    // ENTITY -> DTO
    // =====================================================

    private HostelRoomResponse toResponse(
            HostelRoom room) {

        List<RoomPhotoResponse> photos =
                room.getPhotos() == null
                        ? Collections.emptyList()
                        : room.getPhotos()
                                .stream()
                                .map(this::toPhotoResponse)
                                .collect(Collectors.toList());

        return HostelRoomResponse.builder()
                .id(room.getId())

                .roomType(
                        room.getRoomType() != null
                                ? room.getRoomType().name()
                                : null
                )

                // =================================================
                // AC / NON-AC
                // =================================================

                .coolingType(
                        room.getCoolingType() != null
                                ? room.getCoolingType().name()
                                : null
                )

                .rentPerBed(room.getRentPerBed())

                .numberOfRooms(
                        room.getNumberOfRooms()
                )

                .bedsPerRoom(
                        room.getBedsPerRoom()
                )

                .totalBeds(
                        room.getTotalBeds()
                )

                .occupiedRooms(
                        room.getOccupiedRooms()
                )

                .occupiedBeds(
                        room.getOccupiedBeds()
                )

                .photos(photos)

                .build();
    }


    // =====================================================
    // ROOM PHOTO -> DTO
    // =====================================================

    private RoomPhotoResponse toPhotoResponse(
            RoomPhoto photo) {

        return RoomPhotoResponse.builder()
                .id(photo.getId())

                .roomId(
                        photo.getRoom() != null
                                ? photo.getRoom().getId()
                                : null
                )

                .fileName(photo.getFileName())

                .originalFileName(
                        photo.getOriginalFileName()
                )

                .fileUrl(photo.getPhotoUrl())

                .filePath(photo.getFilePath())

                .displayOrder(photo.getDisplayOrder())

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