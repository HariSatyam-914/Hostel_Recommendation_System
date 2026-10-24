package com.example.backend.dto;

import lombok.Data;

import java.util.Map;

@Data
public class OverpassElement {

    private double lat;
    private double lon;

    private Map<String,String> tags;
}