package com.example.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Builder
public class AdminHostelDetailResponse {

    private Long hostelId;

    private String approvalStatus;

    private LocalDateTime submittedAt;

    private BasicInfo basicInfo;

    private OwnerInfo owner;

    private LocationInfo location;

    private List<HostelPhotoResponse> photos;

    private List<AmenityInfo> amenities;

    private List<RoomInfo> roomsPricing;

    private RulesInfo rules;

    private DepositInfo deposit;


    // =========================================================
    // BASIC INFO
    // =========================================================

    @Data
    @Builder
    public static class BasicInfo {

        private String hostelName;
        private String hostelType;
        private String ownerName;
        private String phoneNumber;
        private String email;
        private String description;
    }


    // =========================================================
    // OWNER
    // =========================================================

    @Data
@Builder
public static class OwnerInfo {

    private String name;
    private String email;

    private String emailVerificationStatus;
}


    // =========================================================
    // LOCATION
    // =========================================================

    @Data
    @Builder
    public static class LocationInfo {

        private String address;
        private String landmark;
        private String city;
        private String area;
        private String state;
        private String pincode;
        private Double latitude;
        private Double longitude;
    }


    // =========================================================
    // AMENITY
    // =========================================================

    @Data
    @Builder
    public static class AmenityInfo {

        private Long id;

        private String amenityCode;

        private String amenityName;

        private boolean photoRequired;

        /*
         * Photos uploaded by owner for this amenity
         */
        private List<AmenityPhotoInfo> photos;
    }


    // =========================================================
    // AMENITY PHOTO
    // =========================================================

    @Data
    @Builder
    public static class AmenityPhotoInfo {

        private Long id;

        private String fileName;

        private String fileType;

        private Long fileSize;

        private String photoUrl;

        private String verificationStatus;

        private String rejectionReason;

        private LocalDateTime uploadedAt;

        private LocalDateTime reviewedAt;

        private Long reviewedBy;
    }


    // =========================================================
    // ROOM & PRICING
    // =========================================================

    @Data
    @Builder
    public static class RoomInfo {

        private Long id;

        private String roomType;

        private BigDecimal rentPerBed;

        /*
         * Photos uploaded by owner for this room
         */
        private List<RoomPhotoInfo> photos;
    }


    // =========================================================
    // ROOM PHOTO
    // =========================================================

    @Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public static class RoomPhotoInfo {

    private Long id;

    private Long roomId;

    private String fileName;

    private String fileType;

    private Long fileSize;

    private String photoUrl;

    private String verificationStatus;

    private String rejectionReason;

    private LocalDateTime uploadedAt;

    private LocalDateTime reviewedAt;

    private Long reviewedBy;

    private Integer displayOrder;
}


    // =========================================================
    // RULES
    // =========================================================

    @Data
    @Builder
    public static class RulesInfo {

        private boolean noSmoking;

        private boolean noAlcohol;

        private boolean noPets;

        private boolean visitorsAllowed;

        private boolean curfewEnabled;

        private String additionalRules;
    }

    // =========================================================
// DEPOSIT
// =========================================================

@Data
@Builder
public static class DepositInfo {

    private Long id;

    private String refundPolicy;
}



}