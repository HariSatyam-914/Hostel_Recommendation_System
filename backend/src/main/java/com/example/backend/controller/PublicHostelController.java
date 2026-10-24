package com.example.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.PublicHostelDetailsResponse;
import com.example.backend.service.PublicHostelDetailsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/hostels")
@RequiredArgsConstructor
public class PublicHostelController {

    private final PublicHostelDetailsService publicHostelDetailsService;


    // =========================================================
    // GET PUBLIC HOSTEL DETAILS
    //
    // GET /api/hostels/{hostelId}/details
    //
    // Only APPROVED hostels are returned. The service layer
    // enforces the approval check and throws 404 for anything
    // that is not publicly visible (DRAFT, PENDING, REJECTED,
    // SUSPENDED, PENDING_ADMIN_REUPLOAD_REVIEW).
    // =========================================================

    @GetMapping("/{hostelId}/details")
    public ResponseEntity<PublicHostelDetailsResponse> getPublicHostelDetails(
            @PathVariable Long hostelId) {

        PublicHostelDetailsResponse response =
                publicHostelDetailsService.getHostelDetails(hostelId);

        return ResponseEntity.ok(response);
    }
}