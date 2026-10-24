package com.example.backend.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HostelRulesRequest {

    private Boolean noSmoking;

    private Boolean noAlcohol;

    private Boolean noPets;

    private Boolean visitorsAllowed;

    private Boolean curfewEnabled;

    @Size(max = 750, message = "Additional rules cannot exceed 750 characters")
    private String additionalRules;
}