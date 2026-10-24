package com.example.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransitResponse {

    private List<TransitPlace> metro;
    private List<TransitPlace> bus;
    private List<TransitPlace> railway;
    private List<TransitPlace> airport;
}