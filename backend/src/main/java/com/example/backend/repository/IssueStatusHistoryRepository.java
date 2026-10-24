package com.example.backend.repository;

import com.example.backend.entity.IssueStatusHistory;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueStatusHistoryRepository
        extends JpaRepository<IssueStatusHistory, Long> {


    /*
     * =========================================================
     * ISSUE TIMELINE
     *
     * Returns status changes in chronological order.
     * =========================================================
     */

    List<IssueStatusHistory>
    findByIssueIdOrderByChangedAtAsc(
            Long issueId
    );


    /*
     * =========================================================
     * STATUS CHANGES BY USER
     * =========================================================
     */

    List<IssueStatusHistory>
    findByChangedByIdOrderByChangedAtDesc(
            Long userId
    );
}