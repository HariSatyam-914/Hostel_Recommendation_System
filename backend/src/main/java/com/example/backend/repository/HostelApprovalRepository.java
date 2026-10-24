package com.example.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.HostelApproval;
import com.example.backend.entity.HostelApprovalStatus;
import com.example.backend.entity.HostelBasicInfo;

public interface HostelApprovalRepository
        extends JpaRepository<HostelApproval, Long> {

    Optional<HostelApproval> findByHostel(
            HostelBasicInfo hostel
    );

    List<HostelApproval> findByStatus(
            HostelApprovalStatus status
    );

    Optional<HostelApproval> findByHostel_HostelId(Long hostelId);
}