package com.example.backend.service;

import com.example.backend.dto.HostelRulesRequest;
import com.example.backend.dto.HostelRulesResponse;

import com.example.backend.entity.HostelBasicInfo;
import com.example.backend.entity.HostelRules;
import com.example.backend.repository.HostelRepository;
import com.example.backend.repository.HostelRulesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class HostelRulesServiceImpl implements HostelRulesService {

    private final HostelRepository hostelRepository;
    private final HostelRulesRepository hostelRulesRepository;

    @Override
    public HostelRulesResponse saveOrUpdateRules(
            Long hostelId,
            HostelRulesRequest request
    ) {

        // 1. Find hostel
        HostelBasicInfo hostel = hostelRepository.findById(hostelId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Hostel not found with ID: " + hostelId
                        )
                );

        // 2. Check whether rules already exist
        HostelRules rules = hostelRulesRepository
        .findByHostel_HostelId(hostelId)
                .orElseGet(() -> {

                    HostelRules newRules = new HostelRules();

                    newRules.setHostel(hostel);

                    return newRules;
                });

        // 3. Update values
        rules.setNoSmoking(
                Boolean.TRUE.equals(request.getNoSmoking())
        );

        rules.setNoAlcohol(
                Boolean.TRUE.equals(request.getNoAlcohol())
        );

        rules.setNoPets(
                Boolean.TRUE.equals(request.getNoPets())
        );

        rules.setVisitorsAllowed(
                Boolean.TRUE.equals(request.getVisitorsAllowed())
        );

        rules.setCurfewEnabled(
                Boolean.TRUE.equals(request.getCurfewEnabled())
        );

        rules.setAdditionalRules(
                request.getAdditionalRules()
        );

        // 4. Save
        HostelRules savedRules =
                hostelRulesRepository.save(rules);

        // 5. Convert to response
        return mapToResponse(savedRules);
    }

    @Override
    @Transactional(readOnly = true)
    public HostelRulesResponse getRules(Long hostelId) {

        HostelRules rules = hostelRulesRepository
        .findByHostel_HostelId(hostelId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Rules not found for hostel ID: "
                                        + hostelId
                        )
                );

        return mapToResponse(rules);
    }

    private HostelRulesResponse mapToResponse(
            HostelRules rules
    ) {

        return HostelRulesResponse.builder()
                .id(rules.getId())
                .hostelId(rules.getHostel().getHostelId())
                .noSmoking(rules.isNoSmoking())
                .noAlcohol(rules.isNoAlcohol())
                .noPets(rules.isNoPets())
                .visitorsAllowed(rules.isVisitorsAllowed())
                .curfewEnabled(rules.isCurfewEnabled())
                .additionalRules(rules.getAdditionalRules())
                .build();
    }
}