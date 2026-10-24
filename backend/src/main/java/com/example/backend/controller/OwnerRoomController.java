package com.example.backend.controller;

import com.example.backend.dto.HostelRoomUpdateRequest;
import com.example.backend.entity.HostelRoom;
import com.example.backend.service.HostelRoomService;

import jakarta.validation.Valid;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/owner/rooms")
public class OwnerRoomController {

    private final HostelRoomService hostelRoomService;

    public OwnerRoomController(HostelRoomService hostelRoomService) {
        this.hostelRoomService = hostelRoomService;
    }

    // =====================================================
    // GET ROOM BY ID
    // GET /api/owner/rooms/{roomId}
    // =====================================================

    @GetMapping("/{roomId}")
    public ResponseEntity<HostelRoom> getRoom(
            @PathVariable Long roomId) {

        return ResponseEntity.ok(
                hostelRoomService.getRoomById(roomId)
        );
    }

    // =====================================================
    // UPDATE ROOM
    // PUT /api/owner/rooms/{roomId}
    // =====================================================

    @PutMapping(
            value = "/{roomId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<HostelRoom> updateRoom(
            @PathVariable Long roomId,

            @RequestPart("room")
            @Valid HostelRoomUpdateRequest request,

            @RequestPart(
                    value = "photos",
                    required = false
            )
            List<MultipartFile> photos) {

        HostelRoom updatedRoom =
                hostelRoomService.updateRoom(
                        roomId,
                        request,
                        photos
                );

        return ResponseEntity.ok(updatedRoom);
    }

    // =====================================================
    // MARK MAINTENANCE
    // PUT /api/owner/rooms/{roomId}/maintenance
    // =====================================================

    @PutMapping("/{roomId}/maintenance")
    public ResponseEntity<HostelRoom> markMaintenance(
            @PathVariable Long roomId) {

        HostelRoom room =
                hostelRoomService.markMaintenance(roomId);

        return ResponseEntity.ok(room);
    }

    // =====================================================
    // DELETE ROOM
    // DELETE /api/owner/rooms/{roomId}
    // =====================================================

    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteRoom(
            @PathVariable Long roomId) {

        hostelRoomService.deleteRoom(roomId);

        return ResponseEntity.noContent().build();
    }
}