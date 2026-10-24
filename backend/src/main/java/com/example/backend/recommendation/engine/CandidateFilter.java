
package com.example.backend.recommendation.engine;

import com.example.backend.dto.RecommendationRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
@Slf4j
public class CandidateFilter {

    /**
     * Filters hostels before scoring.
     *
     * This method does NOT calculate recommendation scores.
     */
    public List<RecommendationEngine.RecommendationCandidate> filter(
            List<RecommendationEngine.RecommendationCandidate> candidates,
            RecommendationRequest request
    ) {

        if (candidates == null
                || candidates.isEmpty()) {

            return Collections.emptyList();
        }

        return candidates.stream()

                /*
                 * Remove null records.
                 */
                .filter(Objects::nonNull)

                /*
                 * Only approved hostels.
                 */
                .filter(
                        RecommendationEngine
                                .RecommendationCandidate
                                ::isApproved
                )

                /*
                 * Availability.
                 */
                .filter(
                        candidate ->
                                isAvailable(
                                        candidate,
                                        request
                                )
                )

                /*
                 * Budget sanity filter.
                 */
                .filter(
                        candidate ->
                                isWithinReasonableBudgetRange(
                                        candidate,
                                        request
                                )
                )

                .collect(
                        Collectors.toList()
                );
    }

    private boolean isAvailable(
            RecommendationEngine.RecommendationCandidate candidate,
            RecommendationRequest request
    ) {

        /*
         * If user doesn't care about availability,
         * don't filter by it.
         */
        if (request == null
                || !Boolean.TRUE.equals(
                        request.getOnlyAvailable()
                )) {

            return true;
        }

        return candidate.isAvailable();
    }

    private boolean isWithinReasonableBudgetRange(
            RecommendationEngine.RecommendationCandidate candidate,
            RecommendationRequest request
    ) {

        if (request == null) {
            return true;
        }

        BigDecimal rent =
                candidate.getRent();

        if (rent == null
                || rent.compareTo(BigDecimal.ZERO) <= 0) {

            /*
             * Don't recommend records that don't have
             * valid pricing information.
             */
            return false;
        }

        BigDecimal minBudget =
                request.getMinBudget();

        BigDecimal maxBudget =
                request.getMaxBudget();

        /*
         * Budget is a REAL filter, not a recommendation preference.
         *
         * If the user selects ₹12,000 - ₹15,000, a room priced at
         * ₹10,000 must NOT be returned. Likewise, a room priced above
         * ₹15,000 must NOT be returned.
         *
         * When only one boundary is supplied, only that boundary is
         * enforced.
         */
        if (minBudget != null
                && minBudget.compareTo(BigDecimal.ZERO) > 0
                && rent.compareTo(minBudget) < 0) {

            return false;
        }

        if (maxBudget != null
                && maxBudget.compareTo(BigDecimal.ZERO) > 0
                && rent.compareTo(maxBudget) > 0) {

            return false;
        }

        return true;
    }
}
