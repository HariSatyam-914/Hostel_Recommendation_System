package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hostel_rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostelRoom {

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "hostel_id", nullable = false)
   private HostelBasicInfo hostel;


   @Enumerated(EnumType.STRING)
   @Column(name = "room_type", nullable = false)
   private RoomType roomType;


   // =====================================================
   // AC / NON-AC
   // =====================================================

   @Enumerated(EnumType.STRING)
   @Column(
       name = "cooling_type",
       nullable = false
   )
   private RoomCoolingType coolingType;


   @Column(name = "rent_per_bed", nullable = false)
   private BigDecimal rentPerBed;

   @JsonManagedReference
   @OneToMany(
       mappedBy = "room",
       cascade = CascadeType.ALL,
       orphanRemoval = true
   )
   private List<RoomPhoto> photos = new ArrayList<>();


   @Column(name = "total_beds", nullable = true)
   private Integer totalBeds;

   public Integer getTotalBeds() {
       return totalBeds;
   }

   public void setTotalBeds(Integer totalBeds) {
       this.totalBeds = totalBeds;
   }


   private Integer numberOfRooms;

   private Integer bedsPerRoom;

   private Integer occupiedRooms;

   private Integer occupiedBeds;
}