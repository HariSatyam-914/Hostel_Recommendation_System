package com.example.backend.service;

import com.example.backend.dto.OwnerHostelStatusResponse;

public interface HostelApprovalService {
    
    void submitForApproval(Long hostelId);
    void submitReview(Long hostelId);
    OwnerHostelStatusResponse getOwnerHostelStatus(String email);
}