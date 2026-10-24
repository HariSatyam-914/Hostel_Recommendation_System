package com.example.backend.dto;

public class NearbyTransitResponse {
    private TransitPoint nearestMetro;
    private TransitPoint nearestBusStop;
    private TransitPoint nearestRailwayStation;
    private TransitPoint nearestAirport;
    // getters + setters for all four
    public TransitPoint getNearestMetro() { return nearestMetro; }
    public void setNearestMetro(TransitPoint t) { this.nearestMetro = t; }
    public TransitPoint getNearestBusStop() { return nearestBusStop; }
    public void setNearestBusStop(TransitPoint t) { this.nearestBusStop = t; }
    public TransitPoint getNearestRailwayStation() { return nearestRailwayStation; }
    public void setNearestRailwayStation(TransitPoint t) { this.nearestRailwayStation = t; }
    public TransitPoint getNearestAirport() { return nearestAirport; }
    public void setNearestAirport(TransitPoint t) { this.nearestAirport = t; }
}