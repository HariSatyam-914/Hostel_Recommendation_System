package com.example.backend.service;

import java.util.Map;



public interface LocationService {

    Map<String, String> reverseGeocode(double lat, double lon);

}