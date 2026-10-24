package com.example.backend.repository;

import com.example.backend.entity.HostelBasicInfo;
import com.example.backend.entity.HostelLocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HostelLocationRepository
        extends JpaRepository<HostelLocation, Long> {

    Optional<HostelLocation> findByHostel(HostelBasicInfo hostel);

    boolean existsByHostel(HostelBasicInfo hostel);
}
