package com.example.backend.repository;

import com.example.backend.entity.HostelDepositPolicy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HostelDepositPolicyRepository
        extends JpaRepository<HostelDepositPolicy, Long> {

    Optional<HostelDepositPolicy> findByHostel_HostelId(Long hostelId);

    boolean existsByHostel_HostelId(Long hostelId);
}