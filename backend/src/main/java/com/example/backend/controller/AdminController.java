package com.example.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Admin", description = "Admin APIs")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Operation(summary = "Admin Dashboard")
    @GetMapping("/dashboard")
    public String dashboard() {
        return "Admin Dashboard";
    }
}