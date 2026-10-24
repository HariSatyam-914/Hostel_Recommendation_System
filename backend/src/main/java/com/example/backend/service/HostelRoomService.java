package com.example.backend.service;

import com.example.backend.dto.HostelRoomRequest;
import com.example.backend.dto.HostelRoomUpdateRequest;
import com.example.backend.entity.HostelRoom;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface HostelRoomService {

    HostelRoom saveRoom(
            Long hostelId,
            HostelRoomRequest request,
            List<MultipartFile> photos
    );

    List<HostelRoom> getRoomsByHostel(
            Long hostelId
    );

    HostelRoom getRoomById(
            Long roomId
    );

    HostelRoom updateRoom(
            Long roomId,
            HostelRoomUpdateRequest request,
            List<MultipartFile> photos
    );

    HostelRoom markMaintenance(
            Long roomId
    );

    void deleteRoom(
            Long roomId
    );
}