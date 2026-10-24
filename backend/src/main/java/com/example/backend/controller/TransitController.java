package com.example.backend.controller;

import com.example.backend.dto.NearestTransitResponse;
import com.example.backend.service.TransitService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transit")
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174"
})
public class TransitController {

    private final TransitService transitService;

    // =====================================================
    // GET NEAREST PUBLIC TRANSPORT
    // =====================================================

    @GetMapping("/nearby")
    public ResponseEntity<NearestTransitResponse> getNearbyTransit(
            @RequestParam double lat,
            @RequestParam double lng
    ) {

        NearestTransitResponse response =
                transitService.getNearbyTransit(
                        lat,
                        lng
                );

        return ResponseEntity.ok(response);
    }
}