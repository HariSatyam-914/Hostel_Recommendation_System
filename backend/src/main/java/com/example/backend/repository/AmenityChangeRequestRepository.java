package com.example.backend.repository;

import com.example.backend.entity.AmenityChangeRequest;
import com.example.backend.entity.AmenityChangeRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AmenityChangeRequestRepository
        extends JpaRepository<AmenityChangeRequest, Long> {

    List<AmenityChangeRequest>
    findByStatusOrderBySubmittedAtAsc(
            AmenityChangeRequestStatus status
    );

    List<AmenityChangeRequest>
    findByHostelHostelIdOrderBySubmittedAtDesc(
            Long hostelId
    );

    Optional<AmenityChangeRequest>
    findFirstByAmenityIdAndRequestTypeAndStatus(
            Long amenityId,
            com.example.backend.entity.AmenityChangeRequestType requestType,
            AmenityChangeRequestStatus status
    );
}