package com.example.backend.service;

import com.example.backend.dto.PublicHostelDetailsResponse;

public interface PublicHostelDetailsService {

    PublicHostelDetailsResponse getHostelDetails(Long hostelId);
}