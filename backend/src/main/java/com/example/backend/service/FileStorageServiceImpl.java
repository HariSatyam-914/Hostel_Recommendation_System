package com.example.backend.service;

// import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final Path uploadDirectory =
            Paths.get(
                    System.getProperty("user.dir"),
                    "uploads",
                    "rooms"
            );

    @Override
    public String storeRoomPhoto(
            MultipartFile file,
            Long hostelId,
            Long roomId) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Empty photo file");
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !contentType.startsWith("image/")) {

            throw new RuntimeException(
                    "Only image files are allowed"
            );
        }

        try {

            Path hostelDirectory =
                    uploadDirectory
                            .resolve(String.valueOf(hostelId))
                            .resolve(String.valueOf(roomId));

            Files.createDirectories(hostelDirectory);

            String originalName =
                    file.getOriginalFilename();

            String extension = "";

            if (originalName != null &&
                    originalName.contains(".")) {

                extension =
                        originalName.substring(
                                originalName.lastIndexOf(".")
                        );
            }

            String fileName =
                    UUID.randomUUID() + extension;

            Path filePath =
                    hostelDirectory.resolve(fileName);

            Files.copy(
                    file.getInputStream(),
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            System.out.println(
                    "ROOM PHOTO PHYSICAL FILE: "
                            + filePath.toAbsolutePath()
            );

            System.out.println(
                    "ROOM PHOTO EXISTS: "
                            + Files.exists(filePath)
            );

            return "/uploads/rooms/"
                    + hostelId
                    + "/"
                    + roomId
                    + "/"
                    + fileName;

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to store room photo",
                    e
            );
        }
    }

}