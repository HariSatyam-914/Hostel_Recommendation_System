package com.example.backend.repository;

import com.example.backend.entity.HostelApprovalStatus;
import com.example.backend.entity.HostelBasicInfo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HostelRepository
        extends JpaRepository<HostelBasicInfo, Long> {

    boolean existsByPhoneNumber(String phoneNumber);

    /**
     * Find hostel belonging to an owner using owner's email.
     *
     * HostelBasicInfo -> owner -> email
     */
    @Query("""
        SELECT h
        FROM HostelBasicInfo h
        JOIN h.owner o
        WHERE LOWER(o.email) = LOWER(:email)
    """)
    Optional<HostelBasicInfo> findByOwnerEmail(
            @Param("email") String email
    );

    /**
     * Return hostels based on their approval status.
     */
    @Query("""
        SELECT DISTINCT h
        FROM HostelBasicInfo h
        JOIN HostelApproval a
            ON a.hostel = h
        WHERE a.status = :status
    """)
    List<HostelBasicInfo> findByApprovalStatus(
            @Param("status") HostelApprovalStatus status
    );

    /**
     * Return one hostel only when it is approved.
     */
    @Query("""
        SELECT h
        FROM HostelBasicInfo h
        JOIN HostelApproval a
            ON a.hostel = h
        WHERE h.hostelId = :hostelId
          AND a.status = :status
    """)
    Optional<HostelBasicInfo> findByHostelIdAndApprovalStatus(
            @Param("hostelId") Long hostelId,
            @Param("status") HostelApprovalStatus status
    );
}