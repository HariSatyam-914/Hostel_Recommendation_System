package com.example.backend.service;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.AdminHostelDetailResponse.DepositInfo;
import com.example.backend.dto.AdminHostelDetailResponse.RulesInfo;
import com.example.backend.dto.OwnerDashboardResponse;
import com.example.backend.dto.OwnerDashboardResponse.AnalyticsInfo;
import com.example.backend.dto.OwnerDashboardResponse.HostelInfo;
import com.example.backend.dto.OwnerDashboardResponse.NotificationInfo;
import com.example.backend.dto.OwnerDashboardResponse.OwnerInfo;
import com.example.backend.dto.OwnerDashboardResponse.RoomInfo;
import com.example.backend.entity.HostelApproval;
import com.example.backend.entity.HostelAmenity;
import com.example.backend.entity.HostelBasicInfo;
import com.example.backend.entity.HostelDepositPolicy;
import com.example.backend.entity.HostelLocation;
import com.example.backend.entity.HostelRoom;
import com.example.backend.entity.HostelRules;
import com.example.backend.entity.User;
import com.example.backend.repository.HostelApprovalRepository;
import com.example.backend.repository.HostelAmenityRepository;
import com.example.backend.repository.HostelRepository;
import com.example.backend.repository.HostelRoomRepository;
import com.example.backend.repository.HostelLocationRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.HostelRulesRepository;
import com.example.backend.repository.HostelDepositPolicyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OwnerDashboardServiceImpl implements OwnerDashboardService {

    private final UserRepository userRepository;

    private final HostelRepository hostelRepository;

    private final HostelApprovalRepository hostelApprovalRepository;

    private final HostelLocationRepository hostelLocationRepository;

    private final HostelRoomRepository hostelRoomRepository;

    private final HostelAmenityRepository hostelAmenityRepository;

    private final HostelRulesRepository hostelRulesRepository;

    private final HostelDepositPolicyRepository hostelDepositPolicyRepository;


    @Override
    public OwnerDashboardResponse getDashboard(String email) {

        /*
         * =====================================================
         * 1. FIND LOGGED-IN OWNER
         * =====================================================
         */

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in owner not found"
                        )
                );


        /*
         * =====================================================
         * 2. MAKE SURE THIS USER IS AN OWNER
         * =====================================================
         */

        if (owner.getRole() == null ||
                !"OWNER".equals(owner.getRole().name())) {

            throw new RuntimeException(
                    "Authenticated user is not a hostel owner"
            );
        }


        /*
         * =====================================================
         * 3. FIND OWNER'S HOSTEL DYNAMICALLY
         * =====================================================
         */

        HostelBasicInfo hostel =
                hostelRepository.findByOwnerEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No hostel found for this owner"
                                )
                        );


        /*
         * =====================================================
         * 4. FETCH APPROVAL STATUS
         * =====================================================
         */

        HostelApproval approval =
                hostelApprovalRepository
                        .findByHostel(hostel)
                        .orElse(null);


        String approvalStatus = null;

        if (approval != null &&
                approval.getStatus() != null) {

            approvalStatus =
                    approval.getStatus().name();
        }


        /*
         * =====================================================
         * 5. FETCH LOCATION
         * =====================================================
         */

        HostelLocation location =
                hostelLocationRepository
                        .findByHostel(hostel)
                        .orElse(null);


        /*
         * =====================================================
         * 6. FETCH ROOMS
         * =====================================================
         */

        List<HostelRoom> hostelRooms =
                hostelRoomRepository.findByHostel_HostelId(
                        hostel.getHostelId()
                );


        List<RoomInfo> rooms =
                hostelRooms.stream()
                        .map(this::convertRoom)
                        .toList();


        /*
         * =====================================================
         * 7. FETCH AMENITIES
         * =====================================================
         */

        List<HostelAmenity> hostelAmenities =
                hostelAmenityRepository
                        .findByHostelHostelId(
                                hostel.getHostelId()
                        );
        
                        /*
 * =====================================================
 * 8. FETCH RULES
 * =====================================================
 */

HostelRules hostelRules =
        hostelRulesRepository
                .findByHostel_HostelId(hostel.getHostelId())
                .orElse(null);


        /*
 * =====================================================
 * 9. FETCH DEPOSIT POLICY
 * =====================================================
 */

HostelDepositPolicy depositPolicy =
        hostelDepositPolicyRepository
                .findByHostel_HostelId(hostel.getHostelId())
                .orElse(null);
        /*
         * DEBUG
         * =====================================================
         */

        System.out.println(
                "========== OWNER DASHBOARD AMENITIES =========="
        );

        System.out.println(
                "Hostel ID: " +
                hostel.getHostelId()
        );

        System.out.println(
                "Amenities found: " +
                hostelAmenities.size()
        );

        hostelAmenities.forEach(
                amenity ->
                        System.out.println(
                                "Amenity: id=" +
                                amenity.getId() +
                                ", code=" +
                                amenity.getAmenityCode() +
                                ", name=" +
                                amenity.getAmenityName() +
                                ", photoRequired=" +
                                amenity.isPhotoRequired()
                        )
        );

        System.out.println(
                "==============================================="
        );


        /*
         * =====================================================
         * 8. OWNER INFORMATION
         * =====================================================
         */

        OwnerInfo ownerInfo =
                OwnerInfo.builder()
                        .id(owner.getId())
                        .name(owner.getName())
                        .email(owner.getEmail())
                        .phoneNo(owner.getPhoneNo())
                        .emailVerified(
                                owner.getEmailVerificationStatus() != null &&
                                "VERIFIED".equals(
                                        owner.getEmailVerificationStatus().name()
                                )
                        )
                        .build();


        /*
         * =====================================================
         * 9. HOSTEL INFORMATION
         * =====================================================
         */

        HostelInfo hostelInfo =
                HostelInfo.builder()
                        .hostelId(hostel.getHostelId())
                        .name(hostel.getHostelName())
                        .hostelType(hostel.getHostelType())
                        .description(hostel.getDescription())
                        .ownerName(hostel.getOwnerName())
                        .phoneNumber(hostel.getPhoneNumber())

                        .address(
                                location != null
                                        ? location.getAddress()
                                        : null
                        )

                        .landmark(
                                location != null
                                        ? location.getLandmark()
                                        : null
                        )

                        .area(
                                location != null
                                        ? location.getArea()
                                        : null
                        )

                        .city(
                                location != null
                                        ? location.getCity()
                                        : null
                        )

                        .state(
                                location != null
                                        ? location.getState()
                                        : null
                        )

                        .pincode(
                                location != null
                                        ? location.getPincode()
                                        : null
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

                        /*
                         * These remain null until your HostelPhoto
                         * entity/repository is connected.
                         */
                        .coverPhoto(null)
                        .photos(Collections.emptyList())

                        /*
                         * Load amenities from hostel_amenities.
                         */
                        .amenities(
                                hostelAmenities.stream()
                                        .map(amenity -> amenity.getAmenityName())
                                        .filter(
                                                name ->
                                                        name != null &&
                                                        !name.isBlank()
                                        )
                                        .toList()
                        )

                        .rules(
        hostelRules != null
                ? RulesInfo.builder()
                        .noSmoking(hostelRules.isNoSmoking())
                        .noAlcohol(hostelRules.isNoAlcohol())
                        .noPets(hostelRules.isNoPets())
                        .visitorsAllowed(hostelRules.isVisitorsAllowed())
                        .curfewEnabled(hostelRules.isCurfewEnabled())
                        .additionalRules(hostelRules.getAdditionalRules())
                        .build()
                : null
)

.deposit(
        depositPolicy != null
                ? DepositInfo.builder()
                        .refundPolicy(depositPolicy.getRefundPolicy())
                        .build()
                : null
)

                        .build();


        /*
         * =====================================================
         * 10. ANALYTICS
         * =====================================================
         */

        AnalyticsInfo analytics =
                AnalyticsInfo.builder()
                        .profileViews(null)
                        .profileViewsDelta(null)
                        .searchAppearances(null)
                        .searchAppearancesDelta(null)
                        .enquiries(null)
                        .enquiriesDelta(null)
                        .averageRating(null)
                        .reviewCount(null)
                        .performance(Collections.emptyList())
                        .build();


        /*
         * =====================================================
         * 11. FINAL RESPONSE
         * =====================================================
         */

        return OwnerDashboardResponse.builder()

                .owner(ownerInfo)

                .hostel(hostelInfo)

                .rooms(rooms)

                .analytics(analytics)

                .enquiries(Collections.emptyList())

                .reviews(Collections.emptyList())

                .notifications(
                        NotificationInfo.builder()
                                .unread(0L)
                                .build()
                )

                .approvalStatus(approvalStatus)

                .build();
    }


    /*
     * =========================================================
     * ROOM CONVERSION
     * =========================================================
     */

    private RoomInfo convertRoom(HostelRoom room) {

        return RoomInfo.builder()
                .id(room.getId())
                .roomType(
                        room.getRoomType() != null
                                ? room.getRoomType().name()
                                : null
                )
                .rentPerBed(room.getRentPerBed())

                /*
                 * Your current HostelRoom entity does not contain
                 * these values, so leave them null rather than
                 * showing fake occupancy.
                 */
                .totalBeds(null)
                .occupiedBeds(null)

                .build();
    }
}