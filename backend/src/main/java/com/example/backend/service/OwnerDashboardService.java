package com.example.backend.service;

import com.example.backend.dto.OwnerDashboardResponse;

public interface OwnerDashboardService {

    OwnerDashboardResponse getDashboard(String email);
}