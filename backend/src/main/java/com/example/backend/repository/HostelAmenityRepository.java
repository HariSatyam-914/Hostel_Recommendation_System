package com.example.backend.repository;

import com.example.backend.entity.HostelAmenity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HostelAmenityRepository
        extends JpaRepository<HostelAmenity, Long> {

    List<HostelAmenity> findByHostelHostelId(Long hostelId);

    Optional<HostelAmenity>
    findByHostelHostelIdAndAmenityCode(
            Long hostelId,
            String amenityCode
    );
}