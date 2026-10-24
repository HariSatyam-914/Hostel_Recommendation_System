package com.example.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "hostel_approval")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostelApproval {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "hostel_id", nullable = false, unique = true)
    private HostelBasicInfo hostel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HostelApprovalStatus status;

    @Column(columnDefinition = "TEXT")
    private String adminComment;

    private LocalDateTime submittedAt;

    private LocalDateTime reviewedAt;
}