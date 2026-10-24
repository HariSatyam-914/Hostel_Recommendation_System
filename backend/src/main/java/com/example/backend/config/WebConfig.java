package com.example.backend.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;


@Configuration
public class WebConfig{

    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        Path uploadDirectory = Paths.get(
                "uploads",
                "hostels"
        )
                .toAbsolutePath()
                .normalize();

        String uploadLocation =
                uploadDirectory.toUri().toString();

        if (!uploadLocation.endsWith("/")) {
            uploadLocation = uploadLocation + "/";
        }

        registry.addResourceHandler(
                "/uploads/hostels/**"
        )
                .addResourceLocations(
                        uploadLocation
                );
    }
}