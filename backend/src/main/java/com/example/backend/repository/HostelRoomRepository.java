package com.example.backend.repository;

import com.example.backend.entity.HostelRoom;
import com.example.backend.entity.RoomCoolingType;
import com.example.backend.entity.RoomType;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HostelRoomRepository
        extends JpaRepository<HostelRoom, Long> {


    List<HostelRoom> findByHostel_HostelIdOrderByIdAsc(
            Long hostelId
    );


    // =====================================================
    // FIND ROOM BY ROOM TYPE + COOLING TYPE
    // =====================================================

    Optional<HostelRoom>
    findByHostel_HostelIdAndRoomTypeAndCoolingType(
            Long hostelId,
            RoomType roomType,
            RoomCoolingType coolingType
    );


    // =====================================================
    // CHECK ROOM BY ROOM TYPE + COOLING TYPE
    // =====================================================

    boolean
    existsByHostel_HostelIdAndRoomTypeAndCoolingType(
            Long hostelId,
            RoomType roomType,
            RoomCoolingType coolingType
    );


    List<HostelRoom> findByHostel_HostelId(
            Long hostelId
    );
}