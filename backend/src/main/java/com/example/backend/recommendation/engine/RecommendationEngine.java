package com.example.backend.recommendation.engine;

import com.example.backend.dto.IssueSummaryDto;
import com.example.backend.dto.MatchBreakdown;
import com.example.backend.dto.RecommendationRequest;
import com.example.backend.dto.RecommendedHostel;
import com.example.backend.dto.RoomAvailabilityDto;
import com.example.backend.recommendation.scoring.AmenityScoreCalculator;
import com.example.backend.recommendation.scoring.BudgetScoreCalculator;
import com.example.backend.recommendation.scoring.HostelTypeScoreCalculator;
import com.example.backend.recommendation.scoring.LocationScoreCalculator;
import com.example.backend.recommendation.scoring.RoomScoreCalculator;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class RecommendationEngine {

    private final CandidateFilter candidateFilter;

    private final BudgetScoreCalculator budgetScoreCalculator;

    private final LocationScoreCalculator locationScoreCalculator;

    private final RoomScoreCalculator roomScoreCalculator;

    private final AmenityScoreCalculator amenityScoreCalculator;

    private final HostelTypeScoreCalculator hostelTypeScoreCalculator;

    private final ScoreAggregator scoreAggregator;

    /**
     * Main recommendation method.
     *
     * Flow:
     *
     * Candidates
     *      ↓
     * Filter
     *      ↓
     * Calculate individual scores
     *      ↓
     * Aggregate
     *      ↓
     * Apply issue health adjustment
     *      ↓
     * Sort
     *      ↓
     * Top N
     */
    public List<RecommendedHostel> recommend(
            List<RecommendationCandidate> candidates,
            RecommendationRequest request
    ) {

        if (candidates == null
                || candidates.isEmpty()) {

            return Collections.emptyList();
        }

        if (request == null) {
            return Collections.emptyList();
        }

        /*
         * ============================================================
         * STEP 1: Filter
         * ============================================================
         */

        List<RecommendationCandidate> eligibleCandidates =
                candidateFilter.filter(
                        candidates,
                        request
                );

        log.info(
                "Recommendation candidates: {} -> {}",
                candidates.size(),
                eligibleCandidates.size()
        );

        /*
         * ============================================================
         * STEP 1B: HARD PREFERENCE FILTERS
         * ============================================================
         *
         * The existing CandidateFilter remains responsible for its current
         * filtering such as budget/location/approval/availability.
         *
         * Room type, amenities and hostel type are different: when the user
         * explicitly selects them, they are HARD requirements, not merely
         * score preferences.
         *
         * Amenities use ALL/AND semantics.
         *
         * Room type is matched against the actual room represented by the
         * candidate, and only an available room survives when onlyAvailable
         * is true.
         *
         * The existing scoring calculators and score weights are unchanged.
         * They run only on candidates that satisfy these requirements.
         */
        eligibleCandidates =
                eligibleCandidates.stream()
                        .filter(candidate ->
                                matchesHardPreferences(
                                        candidate,
                                        request
                                )
                        )
                        .toList();

        log.info(
                "After hard preference filtering: {} -> {}",
                candidates.size(),
                eligibleCandidates.size()
        );

        if (eligibleCandidates.isEmpty()) {
            return Collections.emptyList();
        }

        /*
         * ============================================================
         * STEP 2: Score
         * ============================================================
         */

        List<RecommendedHostel> recommendations =
                new ArrayList<>();

        for (RecommendationCandidate candidate :
                eligibleCandidates) {

            RecommendedHostel recommendation =
                    scoreCandidate(
                            candidate,
                            request
                    );

            recommendations.add(
                    recommendation
            );
        }

        /*
         * ============================================================
         * STEP 3: Sort highest score first
         * ============================================================
         */

        recommendations.sort(
                Comparator.comparing(
                        RecommendedHostel::getMatchScore,
                        Comparator.nullsLast(
                                Comparator.reverseOrder()
                        )
                )
        );

        /*
         * ============================================================
         * STEP 4: Return top N
         * ============================================================
         */

        int limit =
                request.getLimit() == null
                        ? 10
                        : Math.min(
                                request.getLimit(),
                                50
                        );

        return recommendations
                .stream()
                .limit(limit)
                .toList();
    }

    /**
     * Scores a single hostel.
     */
    private RecommendedHostel scoreCandidate(
            RecommendationCandidate candidate,
            RecommendationRequest request
    ) {

        /*
         * ------------------------------------------------------------
         * BUDGET
         * ------------------------------------------------------------
         */
        double budgetScore =
                budgetScoreCalculator.calculate(
                        candidate.getRent(),
                        request
                );

        /*
         * ------------------------------------------------------------
         * LOCATION
         * ------------------------------------------------------------
         */
        LocationScoreCalculator.LocationResult
                locationResult =
                locationScoreCalculator.calculate(
                        candidate.getLatitude(),
                        candidate.getLongitude(),
                        request
                );

        /*
         * ------------------------------------------------------------
         * ROOM
         * ------------------------------------------------------------
         */
        double roomScore =
                roomScoreCalculator.calculate(
                        candidate.getRoomType(),
                        request
                );

        /*
         * ------------------------------------------------------------
         * AMENITIES
         * ------------------------------------------------------------
         */
        double amenityScore =
                amenityScoreCalculator.calculate(
                        candidate.getAmenities(),
                        request
                );

        /*
         * ------------------------------------------------------------
         * HOSTEL TYPE
         * ------------------------------------------------------------
         */
        double hostelTypeScore =
                hostelTypeScoreCalculator.calculate(
                        candidate.getHostelType(),
                        request
                );

        /*
         * ------------------------------------------------------------
         * AGGREGATE
         * ------------------------------------------------------------
         *
         * Existing calculation is NOT changed.
         *
         * Location     = 30%
         * Budget       = 25%
         * Room         = 20%
         * Amenities    = 15%
         * Hostel Type  = 10%
         */
        MatchBreakdown breakdown =
                scoreAggregator.aggregate(
                        budgetScore,
                        locationResult.getScore(),
                        roomScore,
                        amenityScore,
                        hostelTypeScore
                );

        /*
         * ------------------------------------------------------------
         * ISSUE INFORMATION
         * ------------------------------------------------------------
         *
         * Issue information affects ranking.
         *
         * Room availability does NOT affect ranking.
         */
        double existingMatchScore =
                breakdown.getOverallScore();

        double finalMatchScore =
                calculateRankingScore(
                        existingMatchScore,
                        candidate.getIssueSummary()
                );

        /*
         * ------------------------------------------------------------
         * BUILD RESPONSE
         * ------------------------------------------------------------
         */
        return RecommendedHostel.builder()
                .hostelId(
                        candidate.getHostelId()
                )
                .hostelName(
                        candidate.getHostelName()
                )
                .hostelType(
                        candidate.getHostelType()
                )
                .address(
                        candidate.getAddress()
                )
                .city(
                        candidate.getCity()
                )
                .monthlyRent(
                        candidate.getRent()
                )
                .roomType(
                        candidate.getRoomType()
                )
                .distanceKm(
                        locationResult.getDistanceKm()
                )
                .coverPhotoUrl(
                        candidate.getCoverPhotoUrl()
                )
                .amenities(
                        candidate.getAmenities() == null
                                ? Collections.emptyList()
                                : candidate.getAmenities()
                )
                .matchScore(
                        finalMatchScore
                )
                .matchBreakdown(
                        breakdown
                )
                .roomAvailability(
                        candidate.getRoomAvailability()
                )
                .issueSummary(
                        candidate.getIssueSummary()
                )
                .build();
    }

    /**
     * Apply room, availability, hostel-type and amenity selections as
     * hard eligibility requirements.
     */
    private boolean matchesHardPreferences(
            RecommendationCandidate candidate,
            RecommendationRequest request
    ) {

        if (candidate == null || request == null) {
            return false;
        }

        if (!candidate.isApproved()) {
            return false;
        }

        /*
         * The availability flag belongs to the room represented by this
         * candidate, not to another room in the same hostel.
         */
        if (Boolean.TRUE.equals(request.getOnlyAvailable())
                && !candidate.isAvailable()) {
            return false;
        }

        /*
         * ROOM TYPE
         * Empty/null means no room preference was selected.
         */
        String requestedRoomType =
                canonicalize(request.getRoomType());

        if (!requestedRoomType.isEmpty()) {

            String candidateRoomType =
                    canonicalize(candidate.getRoomType());

            if (!requestedRoomType.equals(candidateRoomType)) {
                return false;
            }
        }

        /*
         * HOSTEL TYPE
         * Empty/null means no hostel preference was selected.
         */
        String requestedHostelType =
                canonicalizeHostelType(request.getHostelType());

        if (!requestedHostelType.isEmpty()) {

            String candidateHostelType =
                    canonicalizeHostelType(candidate.getHostelType());

            if (!requestedHostelType.equals(candidateHostelType)) {
                return false;
            }
        }

        /*
         * AMENITIES
         * Every selected amenity is required.
         * Example: Parking + Power Backup + Gym requires all three.
         */
        List<String> requestedAmenities =
                request.getAmenities() == null
                        ? Collections.emptyList()
                        : request.getAmenities();

        if (!requestedAmenities.isEmpty()) {

            List<String> candidateAmenities =
                    candidate.getAmenities() == null
                            ? Collections.emptyList()
                            : candidate.getAmenities();

            List<String> normalizedCandidateAmenities =
                    candidateAmenities.stream()
                            .map(this::canonicalizeAmenity)
                            .filter(value -> !value.isEmpty())
                            .distinct()
                            .toList();

            boolean hasAllRequestedAmenities =
                    requestedAmenities.stream()
                            .map(this::canonicalizeAmenity)
                            .filter(value -> !value.isEmpty())
                            .distinct()
                            .allMatch(
                                    normalizedCandidateAmenities::contains
                            );

            if (!hasAllRequestedAmenities) {
                return false;
            }
        }

        return true;
    }

    /**
     * Normalize enum-like values so BOYS/boYs, CO-LIVING/CO_LIVING and
     * similar representations compare consistently.
     */
    private String canonicalize(String value) {

        if (value == null) {
            return "";
        }

        return value
                .trim()
                .toUpperCase()
                .replace('-', '_')
                .replace(' ', '_');
    }

    /**
 * Normalize hostel-type values before comparing them.
 *
 * The search UI uses:
 *   BOYS
 *   GIRLS
 *   CO_LIVING
 *
 * Database records may contain:
 *   WOMEN
 *   WOMENS
 *   WOMEN'S
 *   WOMEN HOSTEL
 *   WOMEN'S HOSTEL
 *   PG FOR WOMEN
 *   WOMEN PG
 *   GIRLS
 *   GIRLS HOSTEL
 *   GIRLS PG
 *
 * All women/girls-only representations are normalized to GIRLS.
 */
private String canonicalizeHostelType(String value) {

    String normalized = canonicalize(value);

    if (normalized.isEmpty()) {
        return "";
    }

    /*
     * ------------------------------------------------------------
     * CO-LIVING
     * ------------------------------------------------------------
     *
     * Check this first because a value such as:
     *
     * "CO-LIVING"
     * "CO LIVING HOSTEL"
     *
     * should remain CO_LIVING rather than being interpreted
     * from some other text.
     */
    if (normalized.equals("CO_LIVING")
            || normalized.equals("COLIVING")
            || normalized.equals("CO_LIVE")
            || normalized.equals("CO_LIVING_HOSTEL")
            || normalized.contains("CO_LIVING")) {

        return "CO_LIVING";
    }

    /*
     * ------------------------------------------------------------
     * GIRLS / WOMEN
     * ------------------------------------------------------------
     *
     * Support both exact values and descriptive database values.
     *
     * Examples:
     *
     * WOMEN
     * WOMENS
     * WOMEN_S
     * WOMEN_ONLY
     * WOMEN_HOSTEL
     * WOMEN_S_HOSTEL
     * PG_FOR_WOMEN
     * WOMEN_PG
     * GIRLS
     * GIRL
     * GIRLS_HOSTEL
     * GIRLS_PG
     * FEMALE
     * FEMALES
     * FEMALE_HOSTEL
     * LADIES
     * LADIES_ONLY
     */
    if (normalized.equals("GIRL")
            || normalized.equals("GIRLS")
            || normalized.equals("WOMAN")
            || normalized.equals("WOMEN")
            || normalized.equals("WOMEN_S")
            || normalized.equals("WOMENS")
            || normalized.equals("WOMEN_ONLY")
            || normalized.equals("WOMEN_S_ONLY")
            || normalized.equals("WOMEN_HOSTEL")
            || normalized.equals("WOMEN_S_HOSTEL")
            || normalized.equals("PG_FOR_WOMEN")
            || normalized.equals("WOMEN_PG")
            || normalized.equals("WOMENS_PG")
            || normalized.equals("GIRLS_HOSTEL")
            || normalized.equals("GIRLS_PG")
            || normalized.equals("FEMALE")
            || normalized.equals("FEMALES")
            || normalized.equals("FEMALE_HOSTEL")
            || normalized.equals("LADIES")
            || normalized.equals("LADIES_ONLY")
            || normalized.contains("WOMEN")
            || normalized.contains("WOMEN_S")
            || normalized.contains("GIRL")
            || normalized.contains("FEMALE")
            || normalized.contains("LADIES")) {

        return "GIRLS";
    }

    /*
     * ------------------------------------------------------------
     * BOYS / MEN
     * ------------------------------------------------------------
     */
    if (normalized.equals("BOY")
            || normalized.equals("BOYS")
            || normalized.equals("MALE")
            || normalized.equals("MALES")
            || normalized.equals("BOYS_HOSTEL")
            || normalized.equals("BOYS_PG")
            || normalized.equals("MALE_HOSTEL")
            || normalized.equals("PG_FOR_BOYS")
            || normalized.equals("MEN")
            || normalized.equals("MENS")
            || normalized.equals("MEN_S")
            || normalized.equals("MEN_HOSTEL")
            || normalized.equals("MENS_HOSTEL")
            || normalized.equals("PG_FOR_MEN")
            || normalized.equals("MEN_PG")
            || normalized.contains("BOY")
            || normalized.contains("MALE")
            || normalized.contains("MEN")) {

        return "BOYS";
    }

    /*
     * Unknown hostel type.
     *
     * Keep the original normalized value instead of
     * incorrectly assigning it to another category.
     */
    return normalized;
}

    /**
     * Normalize both amenity codes and human-readable amenity names.
     */
    private String canonicalizeAmenity(String value) {

        String normalized =
                canonicalize(value).toLowerCase();

        if (normalized.isEmpty()) {
            return "";
        }

        return switch (normalized) {
            case "wifi", "wi_fi" -> "wifi";
            case "powerbackup", "power_backup" -> "power_backup";
            case "commonarea", "common_area" -> "common_area";
            case "hotwater", "hot_water" -> "hot_water";
            case "house_keeping", "housekeeping" -> "housekeeping";
            default -> normalized;
        };
    }

    /**
     * Apply issue health to the existing recommendation score.
     *
     * The original five-factor score is preserved.
     *
     * Final ranking score:
     *
     * existing score × issue health percentage
     *
     * Example:
     *
     * Existing score = 90
     * Issue health   = 80
     *
     * Final score = 90 × 0.80 = 72
     */
    private double calculateRankingScore(
            double existingMatchScore,
            IssueSummaryDto issueSummary
    ) {

        if (issueSummary == null
                || issueSummary.getIssueHealthScore() == null) {

            return existingMatchScore;
        }

        double issueHealth =
                issueSummary.getIssueHealthScore() / 100.0;

        double finalScore =
                existingMatchScore * issueHealth;

        /*
         * Keep final score within 0 - 100.
         */
        return Math.max(
                0.0,
                Math.min(
                        100.0,
                        finalScore
                )
        );
    }

    /**
     * Internal recommendation model.
     *
     * IMPORTANT:
     *
     * This is NOT a JPA entity.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecommendationCandidate {

        private Long hostelId;

        private String hostelName;

        private String hostelType;

        private String address;

        private String city;

        private BigDecimal rent;

        private String roomType;

        private Double latitude;

        private Double longitude;

        @Builder.Default
        private List<String> amenities =
                new ArrayList<>();

        private String coverPhotoUrl;

        private boolean approved;

        private boolean available;

        /*
         * Hostel-wide room availability.
         *
         * Display only.
         *
         * Does NOT affect recommendation score.
         */
        private RoomAvailabilityDto roomAvailability;

        /*
         * Hostel issue information.
         *
         * Used for:
         *
         * 1. Display
         * 2. Final ranking adjustment
         */
        private IssueSummaryDto issueSummary;
    }
}
