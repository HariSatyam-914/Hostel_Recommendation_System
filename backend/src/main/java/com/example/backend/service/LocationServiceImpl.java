
package com.example.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LocationServiceImpl implements LocationService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /*
     * OpenStreetMap Nominatim reverse-geocoding API.
     *
     * latitude  -> {lat}
     * longitude -> {lon}
     */
    private static final String NOMINATIM_URL =
            "https://nominatim.openstreetmap.org/reverse"
                    + "?format=jsonv2"
                    + "&addressdetails=1"
                    + "&zoom=18"
                    + "&lat={lat}"
                    + "&lon={lon}";

    /**
     * Reverse geocode latitude and longitude.
     *
     * IMPORTANT:
     * The frontend currently uses only the "address" value.
     *
     * We still return city/area/state/pincode because they may
     * be useful later, but AddHostelDetails.jsx should only
     * automatically populate the address field.
     */
    @Override
    public Map<String, String> reverseGeocode(double lat, double lon) {

        Map<String, String> result = new HashMap<>();

        try {

            System.out.println("======================================");
            System.out.println("       REVERSE GEOCODING REQUEST      ");
            System.out.println("======================================");
            System.out.println("Latitude  : " + lat);
            System.out.println("Longitude : " + lon);

            /*
             * Validate coordinates before calling Nominatim.
             */
            if (lat < -90 || lat > 90) {
                System.err.println("Invalid latitude: " + lat);
                return result;
            }

            if (lon < -180 || lon > 180) {
                System.err.println("Invalid longitude: " + lon);
                return result;
            }

            /*
             * Nominatim requires a User-Agent.
             */
            HttpHeaders headers = new HttpHeaders();

            headers.set(
                    HttpHeaders.USER_AGENT,
                    "HostelRecommendationSystem/1.0"
            );

            headers.set(
                    HttpHeaders.ACCEPT,
                    MediaType.APPLICATION_JSON_VALUE
            );

            HttpEntity<Void> request =
                    new HttpEntity<>(headers);

            /*
             * IMPORTANT:
             *
             * Receive Nominatim's response as String first.
             *
             * Previously we were doing:
             *
             * ResponseEntity<JsonNode>
             *
             * That caused:
             *
             * Type definition error:
             * [simple type, class JsonNode]
             *
             * So we now manually parse the JSON using ObjectMapper.
             */
            ResponseEntity<String> response =
                    restTemplate.exchange(
                            NOMINATIM_URL,
                            HttpMethod.GET,
                            request,
                            String.class,
                            lat,
                            lon
                    );

            System.out.println(
                    "Nominatim HTTP Status: "
                            + response.getStatusCode()
            );

            String responseBody = response.getBody();

            if (responseBody == null || responseBody.isBlank()) {

                System.err.println(
                        "Nominatim returned an empty response."
                );

                return result;
            }

            System.out.println(
                    "Nominatim response received successfully."
            );

            /*
             * Convert JSON String -> JsonNode.
             */
            JsonNode body =
                    objectMapper.readTree(responseBody);

            /*
             * Extract the address object.
             */
            JsonNode addressNode =
                    body.path("address");

            /*
             * Nominatim's display_name contains the complete
             * human-readable address.
             *
             * Example:
             *
             * "Madhapur, Hyderabad, Telangana, India"
             */
            String fullAddress =
                    body.path("display_name")
                            .asText("");

            /*
             * Only put the address if Nominatim actually
             * returned one.
             */
            result.put(
                    "address",
                    fullAddress
            );

            /*
             * These are returned for possible future use.
             *
             * The React page should NOT automatically populate
             * these fields according to your current requirement.
             */
            result.put(
                    "area",
                    firstNonBlank(
                            addressNode,
                            "suburb",
                            "neighbourhood",
                            "city_district",
                            "quarter"
                    )
            );

            result.put(
                    "city",
                    firstNonBlank(
                            addressNode,
                            "city",
                            "town",
                            "village"
                    )
            );

            result.put(
                    "state",
                    firstNonBlank(
                            addressNode,
                            "state"
                    )
            );

            result.put(
                    "pincode",
                    firstNonBlank(
                            addressNode,
                            "postcode"
                    )
            );

            System.out.println(
                    "Generated Address: "
                            + fullAddress
            );

            System.out.println(
                    "======================================"
            );

            return result;

        } catch (Exception e) {

            System.err.println(
                    "======================================"
            );

            System.err.println(
                    "REVERSE GEOCODING FAILED"
            );

            System.err.println(
                    "Latitude  : " + lat
            );

            System.err.println(
                    "Longitude : " + lon
            );

            System.err.println(
                    "Error     : " + e.getMessage()
            );

            System.err.println(
                    "======================================"
            );

            e.printStackTrace();

            return result;
        }
    }

    /**
     * Returns the first non-empty value from the supplied
     * JSON fields.
     */
    private String firstNonBlank(
            JsonNode node,
            String... keys) {

        if (node == null || node.isMissingNode()) {
            return "";
        }

        for (String key : keys) {

            String value =
                    node.path(key).asText("");

            if (value != null &&
                    !value.trim().isEmpty()) {

                return value;
            }
        }

        return "";
    }
}
