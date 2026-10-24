package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "basicinfo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostelBasicInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long hostelId;

    @Column(nullable = false)
    private String hostelName;

    @Column(nullable = false)
    private String hostelType;

    // @Column(nullable = false)
    // private String propertyCategory;

    @Column(nullable = false)
    private String ownerName;

    @Column(nullable = false, unique = true, length = 10)
    private String phoneNumber;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

}