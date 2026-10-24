package com.example.backend.service;

import com.example.backend.dto.HostelDepositPolicyRequest;
import com.example.backend.dto.HostelDepositPolicyResponse;

public interface HostelDepositPolicyService {

    HostelDepositPolicyResponse saveDepositPolicy(
            Long hostelId,
            HostelDepositPolicyRequest request
    );

    HostelDepositPolicyResponse updateDepositPolicy(
            Long hostelId,
            HostelDepositPolicyRequest request
    );

    HostelDepositPolicyResponse getDepositPolicy(
            Long hostelId
    );
    
}