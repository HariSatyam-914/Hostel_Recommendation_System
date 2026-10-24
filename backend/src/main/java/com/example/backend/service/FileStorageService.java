package com.example.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    String storeRoomPhoto(
        MultipartFile file,
        Long hostelId,
        Long roomId
    );
}