// IssueSummaryDto.java
package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueSummaryDto {

    private Integer totalIssues;

    private Integer openIssues;

    private Integer resolvedIssues;

    private Integer rejectedIssues;

    /*
     * 100 = no active issues
     * Lower value = more active issues
     */
    private Double issueHealthScore;
}