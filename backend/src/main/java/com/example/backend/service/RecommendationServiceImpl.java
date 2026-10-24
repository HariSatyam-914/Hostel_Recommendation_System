package com.example.backend.service;

import com.example.backend.dto.IssueSummaryDto;
import com.example.backend.dto.RecommendationRequest;
import com.example.backend.dto.RecommendationResponse;
import com.example.backend.dto.RecommendedHostel;
import com.example.backend.dto.RoomAvailabilityDto;

import com.example.backend.entity.HostelApprovalStatus;
import com.example.backend.entity.HostelBasicInfo;
import com.example.backend.entity.HostelLocation;
import com.example.backend.entity.HostelPhoto;
import com.example.backend.entity.HostelPhotoType;
import com.example.backend.entity.HostelRoom;
import com.example.backend.entity.Issue;
import com.example.backend.entity.IssueStatus;

import com.example.backend.repository.HostelAmenityRepository;
import com.example.backend.repository.HostelLocationRepository;
import com.example.backend.repository.HostelPhotoRepository;
import com.example.backend.repository.HostelRepository;
import com.example.backend.repository.HostelRoomRepository;
import com.example.backend.repository.IssueRepository;

import com.example.backend.recommendation.engine.RecommendationEngine;
import com.example.backend.recommendation.engine.RecommendationEngine.RecommendationCandidate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RecommendationServiceImpl
        implements RecommendationService {

    private final HostelRepository hostelRepository;

    private final HostelRoomRepository hostelRoomRepository;

    private final HostelAmenityRepository hostelAmenityRepository;

    private final HostelLocationRepository hostelLocationRepository;

    private final HostelPhotoRepository hostelPhotoRepository;

    private final IssueRepository issueRepository;

    private final RecommendationEngine recommendationEngine;

    /**
     * Generate personalized hostel recommendations.
     *
     * The service:
     *
     * 1. Gets APPROVED hostels.
     * 2. Builds recommendation candidates.
     * 3. Sends candidates to RecommendationEngine.
     * 4. Returns ranked results.
     */
    @Override
    public RecommendationResponse getRecommendations(
            RecommendationRequest request) {

        validateRequest(request);

        /*
         * ---------------------------------------------------------
         * STEP 1
         * ---------------------------------------------------------
         *
         * Only APPROVED hostels can be recommended.
         *
         * DRAFT
         * PENDING
         * REJECTED
         * SUSPENDED
         *
         * are automatically excluded.
         */
        List<HostelBasicInfo> approvedHostels =
                hostelRepository.findByApprovalStatus(
                        HostelApprovalStatus.APPROVED
                );

        log.info(
                "Approved hostels found: {}",
                approvedHostels.size()
        );

        if (approvedHostels.isEmpty()) {

            return RecommendationResponse.builder()
                    .totalResults(0)
                    .requestedLimit(
                            getRequestedLimit(request)
                    )
                    .recommendations(
                            Collections.emptyList()
                    )
                    .message(
                            "No approved hostels are currently available."
                    )
                    .build();
        }

        /*
         * ---------------------------------------------------------
         * STEP 2
         * ---------------------------------------------------------
         *
         * Convert database entities into recommendation candidates.
         */
        List<RecommendationCandidate> candidates =
                new ArrayList<>();

        for (HostelBasicInfo hostel : approvedHostels) {

            try {

                /*
                 * IMPORTANT ROOM-FILTER FIX
                 *
                 * Build one recommendation candidate for EVERY room.
                 *
                 * The previous call to buildCandidate() selected only the
                 * cheapest room from the hostel. That meant a hostel could
                 * contain an available DOUBLE room while its cheaper SINGLE
                 * room became the only candidate. A DOUBLE search could then
                 * never match that hostel.
                 *
                 * buildCandidates() keeps each room as its own candidate so
                 * the recommendation engine can apply the selected room type
                 * and availability to the correct room.
                 */
                List<RecommendationCandidate> hostelCandidates =
                        buildCandidates(hostel);

                candidates.addAll(hostelCandidates);

            } catch (Exception exception) {

                /*
                 * One malformed hostel should not break
                 * recommendations for every other hostel.
                 */
                log.error(
                        "Failed to build recommendation candidate " +
                        "for hostel {}",
                        hostel.getHostelId(),
                        exception
                );
            }
        }

        log.info(
                "Recommendation candidates created: {}",
                candidates.size()
        );

        if (candidates.isEmpty()) {

            return RecommendationResponse.builder()
                    .totalResults(0)
                    .requestedLimit(
                            getRequestedLimit(request)
                    )
                    .recommendations(
                            Collections.emptyList()
                    )
                    .message(
                            "No hostels have sufficient information " +
                            "for recommendations."
                    )
                    .build();
        }

        /*
         * ---------------------------------------------------------
         * STEP 3
         * ---------------------------------------------------------
         *
         * Delegate filtering + scoring + ranking to the engine.
         */
        List<RecommendedHostel> recommendations =
                recommendationEngine.recommend(
                        candidates,
                        request
                );

        /*
         * ---------------------------------------------------------
         * STEP 4
         * ---------------------------------------------------------
         */
        String message;

        if (recommendations == null
                || recommendations.isEmpty()) {

            message =
                    "No hostels matched your preferences.";

            recommendations =
                    Collections.emptyList();

        } else {

            message =
                    "Recommendations generated successfully.";
        }

        return RecommendationResponse.builder()
                .totalResults(
                        recommendations.size()
                )
                .requestedLimit(
                        getRequestedLimit(request)
                )
                .recommendations(
                        recommendations
                )
                .message(message)
                .build();
    }

    /**
     * Build one recommendation candidate from database data.
     */
    private RecommendationCandidate buildCandidate(
            HostelBasicInfo hostel) {

        if (hostel == null
                || hostel.getHostelId() == null) {

            return null;
        }

        Long hostelId =
                hostel.getHostelId();

        /*
         * ---------------------------------------------------------
         * LOCATION
         * ---------------------------------------------------------
         */
        HostelLocation location =
                hostelLocationRepository
                        .findByHostel(hostel)
                        .orElse(null);

        /*
         * ---------------------------------------------------------
         * ROOMS
         * ---------------------------------------------------------
         */
        List<HostelRoom> rooms =
                hostelRoomRepository
                        .findByHostel_HostelId(hostelId);

        /*
         * A hostel without rooms cannot be meaningfully
         * recommended because rent is required.
         */
        if (rooms == null
                || rooms.isEmpty()) {

            log.debug(
                    "Skipping hostel {} because it has no rooms.",
                    hostelId
            );

            return null;
        }

        /*
         * ---------------------------------------------------------
         * ROOM AVAILABILITY
         * ---------------------------------------------------------
         *
         * This information is DISPLAY-ONLY.
         *
         * It does NOT participate in the match score.
         */
        RoomAvailabilityDto roomAvailability =
                calculateRoomAvailability(rooms);

        /*
         * ---------------------------------------------------------
         * ISSUE INFORMATION
         * ---------------------------------------------------------
         *
         * Issue information is passed to the recommendation
         * engine so that it can affect ranking.
         *
         * This does NOT modify the existing five-factor
         * score calculations.
         */
        IssueSummaryDto issueSummary =
                calculateIssueSummary(hostelId);

        /*
         * ---------------------------------------------------------
         * AMENITIES
         * ---------------------------------------------------------
         */
        List<String> amenities =
                hostelAmenityRepository
                        .findByHostelHostelId(hostelId)
                        .stream()
                        .map(amenity -> {

                            /*
                             * Prefer amenity code because the
                             * recommendation request uses codes
                             * such as WIFI, AC, PARKING.
                             */
                            if (amenity.getAmenityCode() != null
                                    && !amenity.getAmenityCode()
                                            .isBlank()) {

                                return amenity.getAmenityCode();
                            }

                            return amenity.getAmenityName();
                        })
                        .filter(
                                value ->
                                        value != null
                                                && !value.isBlank()
                        )
                        .toList();

        /*
         * ---------------------------------------------------------
         * COVER PHOTO
         * ---------------------------------------------------------
         */
        String coverPhotoUrl =
                getCoverPhotoUrl(hostelId);

        /*
         * ---------------------------------------------------------
         * CREATE ONE CANDIDATE PER ROOM
         * ---------------------------------------------------------
         *
         * This is important.
         *
         * A hostel can have:
         *
         * SINGLE  -> ₹9000
         * DOUBLE  -> ₹8000
         * TRIPLE  -> ₹7000
         *
         * The user may request DOUBLE.
         *
         * Therefore we should not collapse all rooms into
         * one candidate.
         */
        List<RecommendationCandidate> roomCandidates =
                new ArrayList<>();

        for (HostelRoom room : rooms) {

            if (room == null) {
                continue;
            }

            if (room.getRentPerBed() == null
                    || room.getRentPerBed()
                            .compareTo(BigDecimal.ZERO) <= 0) {

                continue;
            }

            if (room.getRoomType() == null) {
                continue;
            }

            boolean available =
                    calculateAvailability(room);

            RecommendationCandidate candidate =
                    RecommendationCandidate.builder()
                            .hostelId(hostelId)
                            .hostelName(
                                    hostel.getHostelName()
                            )
                            .hostelType(
                                    hostel.getHostelType()
                            )
                            .address(
                                    location != null
                                            ? location.getAddress()
                                            : null
                            )
                            .city(
                                    location != null
                                            ? location.getCity()
                                            : null
                            )
                            .rent(
                                    room.getRentPerBed()
                            )
                            .roomType(
                                    room.getRoomType().name()
                            )
                            .latitude(
                                    location != null
                                            ? location.getLatitude()
                                            : null
                            )
                            .longitude(
                                    location != null
                                            ? location.getLongitude()
                                            : null
                            )
                            .amenities(
                                    amenities
                            )
                            .coverPhotoUrl(
                                    coverPhotoUrl
                            )
                            .approved(true)
                            .available(available)

                            /*
                             * -------------------------------------------------
                             * NEW INFORMATION
                             * -------------------------------------------------
                             *
                             * Room availability is only returned to the
                             * response/UI.
                             */
                            .roomAvailability(
                                    roomAvailability
                            )

                            /*
                             * Issue information is available to the
                             * RecommendationEngine for ranking.
                             */
                            .issueSummary(
                                    issueSummary
                            )

                            .build();

            roomCandidates.add(candidate);
        }

        /*
         * A hostel can contain multiple room candidates.
         *
         * We cannot return all of them from this method because
         * the current method returns one candidate.
         *
         * The implementation below therefore selects the
         * cheapest valid room as the representative candidate.
         *
         * NOTE:
         * For fully correct room-specific recommendations,
         * buildCandidates() below should be used instead.
         */
        if (roomCandidates.isEmpty()) {
            return null;
        }

        return roomCandidates.stream()
                .min(
                        (a, b) ->
                                a.getRent()
                                        .compareTo(
                                                b.getRent()
                                        )
                )
                .orElse(null);
    }

    /**
     * Build all candidates.
     *
     * This is the preferred method because each room can have
     * a different rent and room type.
     */
    private List<RecommendationCandidate> buildCandidates(
            HostelBasicInfo hostel) {

        if (hostel == null
                || hostel.getHostelId() == null) {

            return Collections.emptyList();
        }

        Long hostelId =
                hostel.getHostelId();

        HostelLocation location =
                hostelLocationRepository
                        .findByHostel(hostel)
                        .orElse(null);

        List<HostelRoom> rooms =
                hostelRoomRepository
                        .findByHostel_HostelId(hostelId);

        if (rooms == null
                || rooms.isEmpty()) {

            return Collections.emptyList();
        }

        /*
         * ---------------------------------------------------------
         * ROOM AVAILABILITY
         * ---------------------------------------------------------
         */
        RoomAvailabilityDto roomAvailability =
                calculateRoomAvailability(rooms);

        /*
         * ---------------------------------------------------------
         * ISSUE INFORMATION
         * ---------------------------------------------------------
         */
        IssueSummaryDto issueSummary =
                calculateIssueSummary(hostelId);

        List<String> amenities =
                hostelAmenityRepository
                        .findByHostelHostelId(hostelId)
                        .stream()
                        .map(amenity -> {

                            if (amenity.getAmenityCode() != null
                                    && !amenity.getAmenityCode()
                                            .isBlank()) {

                                return amenity.getAmenityCode();
                            }

                            return amenity.getAmenityName();
                        })
                        .filter(
                                value ->
                                        value != null
                                                && !value.isBlank()
                        )
                        .toList();

        String coverPhotoUrl =
                getCoverPhotoUrl(hostelId);

        List<RecommendationCandidate> candidates =
                new ArrayList<>();

        for (HostelRoom room : rooms) {

            if (room == null
                    || room.getRoomType() == null
                    || room.getRentPerBed() == null
                    || room.getRentPerBed()
                            .compareTo(BigDecimal.ZERO) <= 0) {

                continue;
            }

            candidates.add(
                    RecommendationCandidate.builder()
                            .hostelId(hostelId)
                            .hostelName(
                                    hostel.getHostelName()
                            )
                            .hostelType(
                                    hostel.getHostelType()
                            )
                            .address(
                                    location != null
                                            ? location.getAddress()
                                            : null
                            )
                            .city(
                                    location != null
                                            ? location.getCity()
                                            : null
                            )
                            .rent(
                                    room.getRentPerBed()
                            )
                            .roomType(
                                    room.getRoomType().name()
                            )
                            .latitude(
                                    location != null
                                            ? location.getLatitude()
                                            : null
                            )
                            .longitude(
                                    location != null
                                            ? location.getLongitude()
                                            : null
                            )
                            .amenities(
                                    amenities
                            )
                            .coverPhotoUrl(
                                    coverPhotoUrl
                            )
                            .approved(true)
                            .available(
                                    calculateAvailability(room)
                            )
                            .roomAvailability(
                                    roomAvailability
                            )
                            .issueSummary(
                                    issueSummary
                            )
                            .build()
            );
        }

        return candidates;
    }

    /**
     * Calculate hostel-wide room availability.
     *
     * This is DISPLAY-ONLY.
     *
     * It does NOT affect the recommendation score.
     */
    private RoomAvailabilityDto calculateRoomAvailability(
            List<HostelRoom> rooms) {

        int totalRooms = 0;
        int occupiedRooms = 0;

        int totalBeds = 0;
        int occupiedBeds = 0;

        if (rooms != null) {

            for (HostelRoom room : rooms) {

                if (room == null) {
                    continue;
                }

                if (room.getNumberOfRooms() != null) {

                    totalRooms += Math.max(
                            room.getNumberOfRooms(),
                            0
                    );
                }

                if (room.getOccupiedRooms() != null) {

                    occupiedRooms += Math.max(
                            room.getOccupiedRooms(),
                            0
                    );
                }

                if (room.getTotalBeds() != null) {

                    totalBeds += Math.max(
                            room.getTotalBeds(),
                            0
                    );
                }

                if (room.getOccupiedBeds() != null) {

                    occupiedBeds += Math.max(
                            room.getOccupiedBeds(),
                            0
                    );
                }
            }
        }

        int availableRooms =
                Math.max(
                        totalRooms - occupiedRooms,
                        0
                );

        int availableBeds =
                Math.max(
                        totalBeds - occupiedBeds,
                        0
                );

        return RoomAvailabilityDto.builder()
                .totalRooms(totalRooms)
                .occupiedRooms(occupiedRooms)
                .availableRooms(availableRooms)
                .totalBeds(totalBeds)
                .occupiedBeds(occupiedBeds)
                .availableBeds(availableBeds)
                .build();
    }

    /**
     * Calculate hostel issue information.
     *
     * ACTIVE issues:
     *
     * OPEN
     * OWNER_REVIEW
     * OWNER_RESPONDED
     * ADMIN_REVIEW
     *
     * RESOLVED issues:
     *
     * RESOLVED
     * CLOSED
     *
     * REJECTED issues are counted separately.
     */
    private IssueSummaryDto calculateIssueSummary(
            Long hostelId) {

        List<Issue> issues =
                issueRepository
                        .findByHostelHostelIdOrderByCreatedAtDesc(
                                hostelId
                        );

        if (issues == null) {
            issues = Collections.emptyList();
        }

        int totalIssues =
                issues.size();

        int openIssues = 0;

        int resolvedIssues = 0;

        int rejectedIssues = 0;

        for (Issue issue : issues) {

            if (issue == null
                    || issue.getStatus() == null) {

                continue;
            }

            IssueStatus status =
                    issue.getStatus();

            switch (status) {

                case OPEN:
                case OWNER_REVIEW:
                case OWNER_RESPONDED:
                case ADMIN_REVIEW:

                    openIssues++;
                    break;

                case RESOLVED:
                case CLOSED:

                    resolvedIssues++;
                    break;

                case REJECTED:

                    rejectedIssues++;
                    break;

                default:

                    break;
            }
        }

        /*
         * ---------------------------------------------------------
         * ISSUE HEALTH
         * ---------------------------------------------------------
         *
         * This value is supplied to the recommendation engine.
         *
         * 100 = no active issues.
         *
         * Each active issue reduces the health value by 10.
         *
         * The minimum is capped at 50 so that issue information
         * affects ranking without completely destroying the
         * underlying five-factor recommendation score.
         */
        double issueHealthScore;

        if (openIssues == 0) {

            issueHealthScore =
                    100.0;

        } else {

            issueHealthScore =
                    Math.max(
                            50.0,
                            100.0
                                    - (
                                            openIssues
                                                    * 10.0
                                    )
                    );
        }

        return IssueSummaryDto.builder()
                .totalIssues(totalIssues)
                .openIssues(openIssues)
                .resolvedIssues(resolvedIssues)
                .rejectedIssues(rejectedIssues)
                .issueHealthScore(issueHealthScore)
                .build();
    }

    /**
     * Get hostel cover photo.
     */
    private String getCoverPhotoUrl(
            Long hostelId) {

        try {

            return hostelPhotoRepository
                    .findByHostel_HostelIdAndPhotoType(
                            hostelId,
                            HostelPhotoType.COVER
                    )
                    .map(HostelPhoto::getFileUrl)
                    .orElse(null);

        } catch (Exception exception) {

            log.warn(
                    "Unable to retrieve cover photo for hostel {}",
                    hostelId,
                    exception
            );

            return null;
        }
    }

    /**
     * Determine whether a room is currently available.
     *
     * Current entity contains:
     *
     * numberOfRooms
     * occupiedRooms
     * totalBeds
     * occupiedBeds
     *
     * We use these values when they are available.
     */
    private boolean calculateAvailability(
            HostelRoom room) {

        if (room == null) {
            return false;
        }

        /*
         * If occupied beds and total beds are available,
         * use them as the strongest availability signal.
         */
        if (room.getTotalBeds() != null
                && room.getOccupiedBeds() != null) {

            return room.getOccupiedBeds()
                    < room.getTotalBeds();
        }

        /*
         * Otherwise use room occupancy.
         */
        if (room.getNumberOfRooms() != null
                && room.getOccupiedRooms() != null) {

            return room.getOccupiedRooms()
                    < room.getNumberOfRooms();
        }

        /*
         * No occupancy information exists.
         *
         * We assume the room is available rather than
         * incorrectly filtering it out.
         */
        return true;
    }

    /**
     * Validate recommendation request.
     */
    private void validateRequest(
            RecommendationRequest request) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Recommendation request cannot be null."
            );
        }

        if (request.getMinBudget() != null
                && request.getMaxBudget() != null
                && request.getMinBudget()
                        .compareTo(
                                request.getMaxBudget()
                        ) > 0) {

            throw new IllegalArgumentException(
                    "Minimum budget cannot be greater than maximum budget."
            );
        }

        if (request.getLatitude() != null
                && (request.getLatitude() < -90
                || request.getLatitude() > 90)) {

            throw new IllegalArgumentException(
                    "Latitude must be between -90 and 90."
            );
        }

        if (request.getLongitude() != null
                && (request.getLongitude() < -180
                || request.getLongitude() > 180)) {

            throw new IllegalArgumentException(
                    "Longitude must be between -180 and 180."
            );
        }

        if (request.getMaxDistanceKm() != null
                && request.getMaxDistanceKm() <= 0) {

            throw new IllegalArgumentException(
                    "Maximum distance must be greater than zero."
            );
        }
    }

    /**
     * Return a safe requested limit.
     */
    private int getRequestedLimit(
            RecommendationRequest request) {

        if (request == null
                || request.getLimit() == null) {

            return 10;
        }

        return Math.min(
                Math.max(
                        request.getLimit(),
                        1
                ),
                50
        );
    }
}
