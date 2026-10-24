package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HostelLocationResponse {

    private Long hostelId;

    private String address;

    private String landmark;

    private String city;

    private String area;

    private String state;

    private String pincode;

    private Double latitude;

    private Double longitude;

    private String message;
}