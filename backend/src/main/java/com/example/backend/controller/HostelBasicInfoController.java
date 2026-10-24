package com.example.backend.controller;

import com.example.backend.dto.HostelBasicInfoDetailsResponse;
import com.example.backend.dto.HostelBasicInfoRequest;
import com.example.backend.dto.HostelBasicInfoResponse;
import com.example.backend.service.HostelBasicInfoService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/owner/hostels")
@RequiredArgsConstructor
public class HostelBasicInfoController {

    private final HostelBasicInfoService hostelService;

    @PostMapping("/basic-info")
    public ResponseEntity<HostelBasicInfoResponse> saveBasicInfo(
            @RequestBody HostelBasicInfoRequest request,
            Authentication authentication) {

        System.out.println("========== SAVE BASIC INFO CONTROLLER CALLED ==========");
        System.out.println("Authenticated Owner Email: " + authentication.getName());

        HostelBasicInfoResponse response =
                hostelService.saveBasicInfo(request, authentication);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{hostelId}/basic-info")
    public ResponseEntity<HostelBasicInfoResponse> updateBasicInfo(
            @PathVariable Long hostelId,
            @RequestBody HostelBasicInfoRequest request,
            Authentication authentication) {

        System.out.println("========== UPDATE BASIC INFO CONTROLLER CALLED ==========");
        System.out.println("Hostel ID: " + hostelId);
        System.out.println("Authenticated Owner Email: " + authentication.getName());

        HostelBasicInfoResponse response =
                hostelService.updateBasicInfo(
                        hostelId,
                        request,
                        authentication
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{hostelId}/basic-info")
public ResponseEntity<HostelBasicInfoDetailsResponse> getBasicInfo(
        @PathVariable Long hostelId,
        Authentication authentication) {

    HostelBasicInfoDetailsResponse response =
            hostelService.getBasicInfo(
                    hostelId,
                    authentication
            );

    return ResponseEntity.ok(response);
}

}