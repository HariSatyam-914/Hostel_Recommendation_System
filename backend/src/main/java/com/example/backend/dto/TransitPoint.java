package com.example.backend.dto;

public class TransitPoint {
    private String name;
    private Double distanceKm;

    public TransitPoint() {}
    public TransitPoint(String name, Double distanceKm) {
        this.name = name;
        this.distanceKm = distanceKm;
    }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
}