package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "hostel_deposit_policy",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "hostel_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostelDepositPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "hostel_id",
        nullable = false,
        unique = true
    )
    private HostelBasicInfo hostel;

    @Column(name = "refund_policy", nullable = false, length = 20)
    private String refundPolicy;
}