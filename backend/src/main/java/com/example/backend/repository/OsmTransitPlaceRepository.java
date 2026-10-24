package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.OsmTransitPlace;

public interface OsmTransitPlaceRepository
        extends JpaRepository<OsmTransitPlace, Long> {

    @Query(value = """
        SELECT *
        FROM osm_transit_places
        WHERE is_active = true
          AND transit_type = :type
          AND ST_Distance_Sphere(
                location,
                ST_SRID(
                    POINT(:longitude, :latitude),
                    4326
                )
              ) <= :radiusMeters
        ORDER BY
            ST_Distance_Sphere(
                location,
                ST_SRID(
                    POINT(:longitude, :latitude),
                    4326
                )
            )
        LIMIT 1
        """,
        nativeQuery = true)
    OsmTransitPlace findNearest(
            @Param("type") String type,
            @Param("latitude") double latitude,
            @Param("longitude") double longitude,
            @Param("radiusMeters") double radiusMeters
    );
}