package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicHostelDetailsResponse {

    private Long hostelId;

    private BasicInfo basicInfo;

    private OwnerInfo owner;

    private LocationInfo location;

    private List<HostelPhotoInfo> photos;

    private List<AmenityInfo> amenities;

    private List<RoomInfo> roomsPricing;

    private RulesInfo rules;

    private DepositInfo deposit;


    // =========================================================
    // BASIC INFORMATION
    // =========================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BasicInfo {

        private String hostelName;

        private String hostelType;

        private String ownerName;

        private String phoneNumber;

        private String description;
    }


    // =========================================================
    // OWNER
    // =========================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OwnerInfo {

        private String name;

        private boolean verified;

        private String phoneNumber;
        
        private String email;
        
    }


    // =========================================================
    // LOCATION
    // =========================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
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
    // HOSTEL PHOTO
    // =========================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HostelPhotoInfo {

        private Long id;

        private String photoType;

        private String fileName;

        private String fileUrl;

        private Integer displayOrder;
    }


    // =========================================================
    // AMENITY
    // =========================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AmenityInfo {

        private Long id;

        private String amenityCode;

        private String amenityName;

        private boolean photoRequired;

        private AmenityPhotoInfo photo;
    }


    // =========================================================
    // AMENITY PHOTO
    // =========================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AmenityPhotoInfo {

        private Long id;

        private String fileName;

        private String fileType;

        private Long fileSize;

        private String photoUrl;
    }


    // =========================================================
    // ROOM
    // =========================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomInfo {

        private Long id;

        private String roomType;

        private BigDecimal rentPerBed;

        private Integer numberOfRooms;

        private Integer bedsPerRoom;

        private Integer totalBeds;

        private Integer occupiedRooms;

        private Integer occupiedBeds;

        private List<RoomPhotoInfo> photos;
    }


    // =========================================================
    // ROOM PHOTO
    // =========================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomPhotoInfo {

        private Long id;

        private Long roomId;

        private String fileName;

        private String originalFileName;

        private String fileUrl;

        private Integer displayOrder;
    }


    // =========================================================
    // RULES
    // =========================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
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
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepositInfo {

        private Long id;

        private String refundPolicy;
    }
}