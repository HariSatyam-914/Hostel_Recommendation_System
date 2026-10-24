package com.example.backend.repository;

import com.example.backend.entity.Issue;
import com.example.backend.entity.IssueStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueRepository
        extends JpaRepository<Issue, Long> {


    /*
     * =========================================================
     * USER
     *
     * Get issues submitted by a particular user
     * for a particular hostel.
     * =========================================================
     */

    List<Issue>
    findByUserIdAndHostelHostelIdOrderByCreatedAtDesc(
            Long userId,
            Long hostelId
    );


    /*
     * =========================================================
     * OWNER
     *
     * Get every issue belonging to hostels owned
     * by a particular owner.
     * =========================================================
     */

    List<Issue>
    findByHostelOwnerIdOrderByCreatedAtDesc(
            Long ownerId
    );


    /*
     * =========================================================
     * ADMIN
     *
     * Get all issues.
     * =========================================================
     */

    List<Issue>
    findAllByOrderByCreatedAtDesc();


    /*
     * =========================================================
     * FILTER BY STATUS
     * =========================================================
     */

    List<Issue>
    findByStatusOrderByCreatedAtDesc(
            IssueStatus status
    );


    /*
     * =========================================================
     * OWNER + STATUS
     *
     * Useful for owner dashboard counts/filters.
     * =========================================================
     */

    List<Issue>
    findByHostelOwnerIdAndStatusOrderByCreatedAtDesc(
            Long ownerId,
            IssueStatus status
    );


    /*
     * =========================================================
     * HOSTEL
     * =========================================================
     */

    List<Issue>
    findByHostelHostelIdOrderByCreatedAtDesc(
            Long hostelId
    );
}