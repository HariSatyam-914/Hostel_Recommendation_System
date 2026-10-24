package com.example.backend.service;

import com.example.backend.dto.HostelRulesRequest;
import com.example.backend.dto.HostelRulesResponse;

public interface HostelRulesService {

    HostelRulesResponse saveOrUpdateRules(
            Long hostelId,
            HostelRulesRequest request
    );

    HostelRulesResponse getRules(Long hostelId);
}