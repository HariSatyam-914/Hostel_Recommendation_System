package com.example.backend.service;

import com.example.backend.dto.AmenityChangeRequestResponse;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

public interface AmenityChangeRequestService {

    List<AmenityChangeRequestResponse>
    getPendingRequests();

    List<AmenityChangeRequestResponse>
    getRequestsByHostel(Long hostelId);

    void approveRequest(
            Long requestId,
            Long adminId
    );

    void rejectRequest(
            Long requestId,
            Long adminId,
            String rejectionReason
    );

    List<AmenityChangeRequestResponse> submitOwnerAmenityRequests(
            Long hostelId,
            String requests,
            MultipartHttpServletRequest multipartRequest
    );

    // =====================================================
    // RE-UPLOAD REJECTED AMENITY PHOTO
    // =====================================================

    AmenityChangeRequestResponse
    reuploadRejectedAmenityPhoto(
            Long amenityId,
            MultipartFile file
    );
}