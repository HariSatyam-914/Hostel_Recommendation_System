package com.example.backend.dto;

import com.example.backend.entity.RoomCoolingType;
import com.example.backend.entity.RoomType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class HostelRoomRequest {

    @NotNull(message = "Room type is required")
    private RoomType roomType;


    // =====================================================
    // AC / NON-AC
    // =====================================================

    @NotNull(message = "Cooling type is required")
    private RoomCoolingType coolingType;


    @NotNull(message = "Rent per bed is required")
    @DecimalMin(
        value = "0.01",
        message = "Rent per bed must be greater than 0"
    )
    private BigDecimal rentPerBed;


    // @NotNull(message = "Number of beds is required")
    // @Min(value = 1, message = "Number of beds must be at least 1")
    // private Integer totalBeds;


    public HostelRoomRequest() {
    }


    public RoomType getRoomType() {
        return roomType;
    }

    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
    }


    // =====================================================
    // COOLING TYPE
    // =====================================================

    public RoomCoolingType getCoolingType() {
        return coolingType;
    }

    public void setCoolingType(RoomCoolingType coolingType) {
        this.coolingType = coolingType;
    }


    public BigDecimal getRentPerBed() {
        return rentPerBed;
    }

    public void setRentPerBed(BigDecimal rentPerBed) {
        this.rentPerBed = rentPerBed;
    }


    // public Integer getTotalBeds() {
    //     return totalBeds;
    // }

    // public void setTotalBeds(Integer totalBeds) {
    //     this.totalBeds = totalBeds;
    // }
}