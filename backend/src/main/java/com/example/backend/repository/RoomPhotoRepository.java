package com.example.backend.repository;

import com.example.backend.entity.HostelRoom;
import com.example.backend.entity.RoomPhoto;
import com.example.backend.entity.VerificationStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomPhotoRepository
        extends JpaRepository<RoomPhoto, Long> {

    // =====================================================
    // ALL PHOTOS FOR A ROOM
    // =====================================================

    List<RoomPhoto>
    findByRoom_IdOrderByDisplayOrderAsc(
            Long roomId
    );


    // =====================================================
    // APPROVED PHOTOS FOR A ROOM
    // =====================================================

    List<RoomPhoto>
    findByRoom_IdAndVerificationStatusOrderByDisplayOrderAsc(
            Long roomId,
            VerificationStatus verificationStatus
    );


    // =====================================================
    // ALL PHOTOS FOR HOSTEL
    // =====================================================

    List<RoomPhoto>
    findByRoom_Hostel_HostelIdOrderByDisplayOrderAsc(
            Long hostelId
    );


    // =====================================================
    // APPROVED PHOTOS FOR HOSTEL
    // =====================================================

    List<RoomPhoto>
    findByRoom_Hostel_HostelIdAndVerificationStatusOrderByDisplayOrderAsc(
            Long hostelId,
            VerificationStatus verificationStatus
    );


    // =====================================================
    // EXISTING METHODS
    // =====================================================

    List<RoomPhoto> findByRoom(
            HostelRoom room
    );

    List<RoomPhoto> findByRoomId(
            Long roomId
    );
}