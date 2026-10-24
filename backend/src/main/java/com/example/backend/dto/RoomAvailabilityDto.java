// RoomAvailabilityDto.java
package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomAvailabilityDto {

    private Integer totalRooms;

    private Integer occupiedRooms;

    private Integer availableRooms;

    private Integer totalBeds;

    private Integer occupiedBeds;

    private Integer availableBeds;
}