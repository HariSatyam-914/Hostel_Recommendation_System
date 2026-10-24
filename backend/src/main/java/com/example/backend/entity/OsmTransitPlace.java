package com.example.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "osm_transit_places")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OsmTransitPlace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // ==========================================================
    // OPENSTREETMAP IDENTIFICATION
    // ==========================================================

    @Column(name = "osm_id", nullable = false)
    private Long osmId;

    @Column(name = "osm_type", nullable = false)
    private String osmType;


    // ==========================================================
    // BASIC INFORMATION
    // ==========================================================

    @Column(name = "name")
    private String name;


    // ==========================================================
    // TRANSIT INFORMATION
    // ==========================================================

    @Column(name = "transit_type", nullable = false)
    private String transitType;

    @Column(name = "transit_subtype")
    private String transitSubtype;

    @Column(name = "network")
    private String network;

    @Column(name = "operator_name")
    private String operatorName;


    // ==========================================================
    // GEOGRAPHICAL INFORMATION
    // ==========================================================

    @Column(name = "country_code")
    private String countryCode;

    @Column(name = "region_name")
    private String regionName;

    @Column(name = "city_name")
    private String cityName;

    @Column(name = "latitude", nullable = false)
    private Double latitude;

    @Column(name = "longitude", nullable = false)
    private Double longitude;


    // ==========================================================
    // PRIORITY / STATUS
    // ==========================================================

    @Column(name = "priority", nullable = false)
    private Integer priority = 100;

    @Column(name = "is_active", nullable = false)
    private Boolean active = true;


    // ==========================================================
    // SOURCE INFORMATION
    // ==========================================================

    @Column(name = "source", nullable = false)
    private String source = "OPENSTREETMAP";

    @Column(name = "source_updated_at")
    private LocalDateTime sourceUpdatedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}