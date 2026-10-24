package com.example.backend.controller;

import com.example.backend.dto.HostelLocationRequest;
import com.example.backend.dto.HostelLocationResponse;
import com.example.backend.service.HostelLocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/owner/hostels")
@RequiredArgsConstructor
public class HostelLocationController {

    private final HostelLocationService hostelLocationService;

    // =====================================================
    // SAVE / UPDATE HOSTEL LOCATION
    // =====================================================

    @PutMapping("/{hostelId}/location")
    public ResponseEntity<HostelLocationResponse> saveLocation(
            @PathVariable Long hostelId,
            @RequestBody HostelLocationRequest request) {

        HostelLocationResponse response =
                hostelLocationService.saveLocation(
                        hostelId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }

    // =====================================================
    // GET HOSTEL LOCATION
    // =====================================================

    @GetMapping("/{hostelId}/location")
    public ResponseEntity<HostelLocationResponse> getLocation(
            @PathVariable Long hostelId) {

        HostelLocationResponse response =
                hostelLocationService.getLocation(
                        hostelId
                );

        return ResponseEntity.ok(response);
    }
}