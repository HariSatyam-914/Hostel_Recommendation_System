package com.example.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Owner", description = "Owner APIs")
@RestController
@RequestMapping("/api/owner")
@SecurityRequirement(name = "Bearer Authentication")
public class OwnerController {

    // @Operation(summary = "Owner Dashboard")
    // @GetMapping("/dashboard")
    // public String dashboard() {
    //     return "Owner Dashboard";
    // }
}