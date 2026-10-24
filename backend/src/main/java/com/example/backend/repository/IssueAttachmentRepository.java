package com.example.backend.repository;

import com.example.backend.entity.IssueAttachment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueAttachmentRepository
        extends JpaRepository<IssueAttachment, Long> {


    /*
     * =========================================================
     * ALL ATTACHMENTS OF AN ISSUE
     * =========================================================
     */

    List<IssueAttachment>
    findByIssueIdOrderByUploadedAtAsc(
            Long issueId
    );


    /*
     * =========================================================
     * DELETE / LOOKUP SUPPORT
     * =========================================================
     */

    List<IssueAttachment>
    findByIssueId(
            Long issueId
    );
}