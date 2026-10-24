package com.example.backend.controller;


import com.example.backend.service.LocationService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/location")
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174"
})
public class LocationController {

    private final LocationService locationService;

    @GetMapping("/reverse-geocode")
    public ResponseEntity<Map<String, String>> reverseGeocode(
            @RequestParam double latitude,
            @RequestParam double longitude) {

        Map<String, String> result = locationService.reverseGeocode(latitude, longitude); return ResponseEntity.ok(result);
    }

    
}