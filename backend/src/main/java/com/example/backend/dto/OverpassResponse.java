package com.example.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class OverpassResponse {

    private List<OverpassElement> elements;
}