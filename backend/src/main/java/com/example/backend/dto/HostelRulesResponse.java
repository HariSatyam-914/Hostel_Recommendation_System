package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostelRulesResponse {

    private Long id;

    private Long hostelId;

    private boolean noSmoking;

    private boolean noAlcohol;

    private boolean noPets;

    private boolean visitorsAllowed;

    private boolean curfewEnabled;

    private String additionalRules;
}