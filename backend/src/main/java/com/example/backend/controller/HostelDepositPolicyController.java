package com.example.backend.controller;

import com.example.backend.dto.HostelDepositPolicyRequest;
import com.example.backend.dto.HostelDepositPolicyResponse;
import com.example.backend.service.HostelDepositPolicyService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/owner/hostels")
@RequiredArgsConstructor
public class HostelDepositPolicyController {

    private final HostelDepositPolicyService depositPolicyService;

    @PostMapping("/{hostelId}/deposit-policy")
public ResponseEntity<HostelDepositPolicyResponse> saveDepositPolicy(
        @PathVariable Long hostelId,
        @RequestBody HostelDepositPolicyRequest request) {

    HostelDepositPolicyResponse response =
            depositPolicyService.saveDepositPolicy(
                    hostelId,
                    request
            );

    return ResponseEntity.ok(response);
}

    @PutMapping("/{hostelId}/deposit-policy")
public ResponseEntity<HostelDepositPolicyResponse> updateDepositPolicy(
        @PathVariable Long hostelId,
        @RequestBody HostelDepositPolicyRequest request) {

    HostelDepositPolicyResponse response =
            depositPolicyService.updateDepositPolicy(hostelId, request);

    return ResponseEntity.ok(response);
}

// =====================================================
// GET DEPOSIT POLICY
// GET /api/owner/hostels/{hostelId}/deposit-policy
// =====================================================

@GetMapping("/{hostelId}/deposit-policy")
public ResponseEntity<HostelDepositPolicyResponse> getDepositPolicy(
        @PathVariable Long hostelId) {

    HostelDepositPolicyResponse response =
            depositPolicyService.getDepositPolicy(hostelId);

    return ResponseEntity.ok(response);
}


}