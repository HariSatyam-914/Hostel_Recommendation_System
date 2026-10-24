package com.example.backend.dto;

import com.example.backend.entity.RoomCoolingType;
import com.example.backend.entity.RoomType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public class HostelRoomUpdateRequest {

    @NotNull(message = "Room type is required")
    private RoomType roomType;


    // =====================================================
    // AC / NON-AC
    // =====================================================

    @NotNull(message = "Cooling type is required")
    private RoomCoolingType coolingType;


    @NotNull(message = "Number of rooms is required")
    @Min(
            value = 1,
            message = "Number of rooms must be at least 1"
    )
    private Integer numberOfRooms;


    @NotNull(message = "Beds per room is required")
    @Min(
            value = 1,
            message = "Beds per room must be at least 1"
    )
    private Integer bedsPerRoom;


    @NotNull(message = "Rent per bed is required")
    @DecimalMin(
            value = "0.01",
            message = "Rent per bed must be greater than 0"
    )
    private BigDecimal rentPerBed;


    @NotNull(message = "Occupied rooms is required")
    @Min(
            value = 0,
            message = "Occupied rooms cannot be negative"
    )
    private Integer occupiedRooms;


    @NotNull(message = "Occupied beds is required")
    @Min(
            value = 0,
            message = "Occupied beds cannot be negative"
    )
    private Integer occupiedBeds;


    private List<Long> deletedPhotoIds;


    public HostelRoomUpdateRequest() {
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


    public Integer getNumberOfRooms() {
        return numberOfRooms;
    }

    public void setNumberOfRooms(Integer numberOfRooms) {
        this.numberOfRooms = numberOfRooms;
    }


    public Integer getBedsPerRoom() {
        return bedsPerRoom;
    }

    public void setBedsPerRoom(Integer bedsPerRoom) {
        this.bedsPerRoom = bedsPerRoom;
    }


    public BigDecimal getRentPerBed() {
        return rentPerBed;
    }

    public void setRentPerBed(BigDecimal rentPerBed) {
        this.rentPerBed = rentPerBed;
    }


    public Integer getOccupiedRooms() {
        return occupiedRooms;
    }

    public void setOccupiedRooms(Integer occupiedRooms) {
        this.occupiedRooms = occupiedRooms;
    }


    public Integer getOccupiedBeds() {
        return occupiedBeds;
    }

    public void setOccupiedBeds(Integer occupiedBeds) {
        this.occupiedBeds = occupiedBeds;
    }


    public List<Long> getDeletedPhotoIds() {
        return deletedPhotoIds;
    }

    public void setDeletedPhotoIds(List<Long> deletedPhotoIds) {
        this.deletedPhotoIds = deletedPhotoIds;
    }
}