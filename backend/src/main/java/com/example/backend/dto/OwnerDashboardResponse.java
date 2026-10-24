package com.example.backend.dto;

import java.math.BigDecimal;
import java.util.List;

import com.example.backend.dto.AdminHostelDetailResponse.DepositInfo;
import com.example.backend.dto.AdminHostelDetailResponse.RulesInfo;

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
public class OwnerDashboardResponse {

    private OwnerInfo owner;

    private HostelInfo hostel;

    private List<RoomInfo> rooms;

    private AnalyticsInfo analytics;

    private List<Object> enquiries;

    private List<Object> reviews;

    private NotificationInfo notifications;

    private String approvalStatus;


    /*
     * =========================================================
     * OWNER INFORMATION
     * =========================================================
     */

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OwnerInfo {

        private Long id;

        private String name;

        private String email;

        private String phoneNo;

        private boolean emailVerified;
    }


    /*
     * =========================================================
     * HOSTEL INFORMATION
     * =========================================================
     */

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HostelInfo {

        private Long hostelId;

        private String name;

        private String hostelType;

        private String description;

        private String ownerName;

        private String phoneNumber;

        private String address;

        private String landmark;

        private String area;

        private String city;

        private String state;

        private String pincode;

        private Double latitude;

        private Double longitude;

        private String coverPhoto;

        private List<String> photos;

        private List<String> amenities;

        private RulesInfo rules;
        
        private DepositInfo deposit;
    }


    /*
     * =========================================================
     * ROOM INFORMATION
     * =========================================================
     */

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RoomInfo {

        private Long id;

        private String roomType;

        private BigDecimal rentPerBed;

        /*
         * These are intentionally nullable.
         *
         * HostelRoom currently does NOT contain:
         * - totalBeds
         * - occupiedBeds
         *
         * Do not use primitive int/long here.
         */

        private Integer totalBeds;

        private Integer occupiedBeds;
    }


    /*
     * =========================================================
     * ANALYTICS INFORMATION
     * =========================================================
     */

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnalyticsInfo {

        private Long profileViews;

        private Double profileViewsDelta;

        private Long searchAppearances;

        private Double searchAppearancesDelta;

        private Long enquiries;

        private Double enquiriesDelta;

        private Double averageRating;

        private Long reviewCount;

        private List<PerformanceInfo> performance;
    }


    /*
     * =========================================================
     * PERFORMANCE INFORMATION
     * =========================================================
     */

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PerformanceInfo {

        private String label;

        private String date;

        private Long views;

        private Long searchAppearances;
    }


    /*
     * =========================================================
     * NOTIFICATIONS
     * =========================================================
     */

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NotificationInfo {

        private Long unread;
    }
}