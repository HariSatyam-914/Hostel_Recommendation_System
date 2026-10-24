package com.example.backend.controller;

import com.example.backend.dto.OwnerDashboardResponse;
import com.example.backend.service.OwnerDashboardService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/owner")
@RequiredArgsConstructor
public class OwnerDashboardController {

    private final OwnerDashboardService ownerDashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<OwnerDashboardResponse> getDashboard(
            Authentication authentication
    ) {

        String email = authentication.getName();

        OwnerDashboardResponse response =
                ownerDashboardService.getDashboard(email);

        return ResponseEntity.ok(response);
    }
}