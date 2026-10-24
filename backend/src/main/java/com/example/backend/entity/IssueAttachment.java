package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "issue_attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueAttachment {

    /*
     * =========================================================
     * PRIMARY KEY
     * =========================================================
     */

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    /*
     * =========================================================
     * ISSUE
     * =========================================================
     */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "issue_id",
            nullable = false
    )
    private Issue issue;


    /*
     * =========================================================
     * ORIGINAL FILE INFORMATION
     * =========================================================
     */

    @Column(
            name = "original_file_name"
    )
    private String originalFileName;


    @Column(
            name = "file_name",
            nullable = false
    )
    private String fileName;


    @Column(
            name = "file_path",
            nullable = false
    )
    private String filePath;


    @Column(
            name = "file_type",
            nullable = false
    )
    private String fileType;


    @Column(
            name = "file_size",
            nullable = false
    )
    private Long fileSize;


    /*
     * =========================================================
     * UPLOAD TIME
     * =========================================================
     */

    @Column(
            name = "uploaded_at",
            nullable = false
    )
    private LocalDateTime uploadedAt;


    /*
     * =========================================================
     * PRE-PERSIST
     * =========================================================
     */

    @PrePersist
    protected void onCreate() {

        if (uploadedAt == null) {
            uploadedAt =
                    LocalDateTime.now();
        }
    }
}