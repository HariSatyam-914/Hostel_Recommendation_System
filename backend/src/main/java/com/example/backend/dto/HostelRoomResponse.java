package com.example.backend.dto;

import java.math.BigDecimal;
import java.util.List;

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
public class HostelRoomResponse {

   private Long id;

   private String roomType;

   // =====================================================
   // AC / NON-AC
   // =====================================================

   private String coolingType;

   private BigDecimal rentPerBed;

   private Integer numberOfRooms;

   private Integer bedsPerRoom;

   private Integer totalBeds;

   private Integer occupiedRooms;

   private Integer occupiedBeds;

   private List<RoomPhotoResponse> photos;
}