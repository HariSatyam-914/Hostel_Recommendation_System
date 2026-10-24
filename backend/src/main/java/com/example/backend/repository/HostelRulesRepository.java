package com.example.backend.repository;

import com.example.backend.entity.HostelRules;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HostelRulesRepository
        extends JpaRepository<HostelRules, Long> {

    Optional<HostelRules> findByHostel_HostelId(Long hostelId);
}