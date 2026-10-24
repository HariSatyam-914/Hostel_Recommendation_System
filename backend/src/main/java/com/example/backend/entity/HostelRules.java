package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "hostel_rules",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_hostel_rules_hostel",
            columnNames = "hostel_id"
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostelRules {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "hostel_id",
        nullable = false,
        unique = true
    )
    private HostelBasicInfo hostel;

    @Column(name = "no_smoking", nullable = false)
    private boolean noSmoking;

    @Column(name = "no_alcohol", nullable = false)
    private boolean noAlcohol;

    @Column(name = "no_pets", nullable = false)
    private boolean noPets;

    @Column(name = "visitors_allowed", nullable = false)
    private boolean visitorsAllowed;

    @Column(name = "curfew_enabled", nullable = false)
    private boolean curfewEnabled;

    @Column(name = "additional_rules", length = 750)
    private String additionalRules;
}