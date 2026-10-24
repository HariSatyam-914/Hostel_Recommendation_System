package com.example.backend.repository;

import com.example.backend.entity.IssueResponse;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueResponseRepository
        extends JpaRepository<IssueResponse, Long> {


    /*
     * =========================================================
     * ISSUE TIMELINE
     *
     * Returns responses in chronological order.
     * =========================================================
     */

    List<IssueResponse>
    findByIssueIdOrderByCreatedAtAsc(
            Long issueId
    );


    /*
     * =========================================================
     * RESPONSES BY USER
     * =========================================================
     */

    List<IssueResponse>
    findByUserIdOrderByCreatedAtDesc(
            Long userId
    );
}