package com.example.backend.config;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class FileStorageConfig implements WebMvcConfigurer {

    @Value("${hostel.upload.directory:uploads/hostels}")
    private String hostelUploadDirectory;

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry) {

        // =====================================================
        // HOSTEL IMAGES
        // =====================================================

        Path hostelUploadPath =
                Paths.get(hostelUploadDirectory)
                        .toAbsolutePath()
                        .normalize();

        String hostelUploadLocation =
                hostelUploadPath.toUri().toString();

        if (!hostelUploadLocation.endsWith("/")) {
            hostelUploadLocation += "/";
        }

        System.out.println(
                "================================================"
        );
        System.out.println(
                "HOSTEL IMAGE RESOURCE DIRECTORY: "
                        + hostelUploadPath
        );
        System.out.println(
                "HOSTEL IMAGE DIRECTORY EXISTS: "
                        + Files.exists(hostelUploadPath)
        );
        System.out.println(
                "================================================"
        );

        registry
                .addResourceHandler("/uploads/hostels/**")
                .addResourceLocations(hostelUploadLocation);


        // =====================================================
        // ROOM IMAGES
        // =====================================================

        Path roomUploadPath =
                Paths.get(
                        System.getProperty("user.dir"),
                        "uploads",
                        "rooms"
                )
                        .toAbsolutePath()
                        .normalize();

        try {
            Files.createDirectories(roomUploadPath);
        } catch (Exception e) {
            throw new RuntimeException(
                    "Unable to create room upload directory: "
                            + roomUploadPath,
                    e
            );
        }

        String roomUploadLocation =
                roomUploadPath.toUri().toString();

        if (!roomUploadLocation.endsWith("/")) {
            roomUploadLocation += "/";
        }

        System.out.println(
                "================================================"
        );
        System.out.println(
                "ROOM IMAGE RESOURCE DIRECTORY: "
                        + roomUploadPath
        );
        System.out.println(
                "ROOM IMAGE RESOURCE LOCATION: "
                        + roomUploadLocation
        );
        System.out.println(
                "ROOM IMAGE DIRECTORY EXISTS: "
                        + Files.exists(roomUploadPath)
        );
        System.out.println(
                "================================================"
        );

        registry
                .addResourceHandler("/uploads/rooms/**")
                .addResourceLocations(roomUploadLocation);


        // =====================================================
        // ISSUE ATTACHMENT IMAGES
        // =====================================================

        /*
         * IssueServiceImpl stores the original issue image in:
         *
         * uploads/
         *   issues/
         *     <uuid>.<extension>
         *
         * The API returns the browser URL:
         *
         * /uploads/issues/<uuid>.<extension>
         *
         * Therefore this resource handler is required so that
         * the browser can actually read the stored image.
         */

        Path issueUploadPath =
                Paths.get(
                        System.getProperty("user.dir"),
                        "uploads",
                        "issues"
                )
                        .toAbsolutePath()
                        .normalize();

        try {
            Files.createDirectories(issueUploadPath);
        } catch (Exception e) {
            throw new RuntimeException(
                    "Unable to create issue upload directory: "
                            + issueUploadPath,
                    e
            );
        }

        String issueUploadLocation =
                issueUploadPath.toUri().toString();

        if (!issueUploadLocation.endsWith("/")) {
            issueUploadLocation += "/";
        }

        System.out.println(
                "================================================"
        );
        System.out.println(
                "ISSUE IMAGE RESOURCE DIRECTORY: "
                        + issueUploadPath
        );
        System.out.println(
                "ISSUE IMAGE RESOURCE LOCATION: "
                        + issueUploadLocation
        );
        System.out.println(
                "ISSUE IMAGE DIRECTORY EXISTS: "
                        + Files.exists(issueUploadPath)
        );
        System.out.println(
                "================================================"
        );

        registry
                .addResourceHandler("/uploads/issues/**")
                .addResourceLocations(issueUploadLocation);
    }
}
