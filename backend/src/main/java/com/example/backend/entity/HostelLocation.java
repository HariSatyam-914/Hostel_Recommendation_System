package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "locations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HostelLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * One location belongs to one hostel.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "hostel_id",
        nullable = false,
        unique = true
    )
    private HostelBasicInfo hostel;

    /*
     * Manually entered address information
     */
    @Column(nullable = false, length = 500)
    private String address;

    @Column(length = 255)
    private String landmark;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 150)
    private String area;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(nullable = false, length = 10)
    private String pincode;

    /*
     * Geographic coordinates.
     *
     * These are NOT used to generate the address.
     * They are used later for calculating distances
     * to nearby transport facilities.
     */
    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;
}