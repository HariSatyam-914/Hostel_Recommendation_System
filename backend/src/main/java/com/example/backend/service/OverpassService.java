package com.example.backend.service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.backend.dto.NearestTransitResponse;
import com.example.backend.dto.TransitPlace;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class OverpassService {

    // ==========================================================
    // OVERPASS SERVERS
    // ==========================================================

    private static final String PRIMARY_OVERPASS_URL =
            "https://overpass-api.de/api/interpreter";

    private static final String SECONDARY_OVERPASS_URL =
            "https://overpass.private.coffee/api/interpreter";

    private static final String TERTIARY_OVERPASS_URL =
            "https://overpass.kumi.systems/api/interpreter";


    // ==========================================================
    // SEARCH RADIUS
    // ==========================================================

    /*
     * One compact request is made for Metro + Bus + Railway.
     * 7 km is enough for normal nearby-transit discovery while
     * keeping the Overpass query relatively small.
     */
    private static final int SEARCH_RADIUS_METERS = 7000;


    // ==========================================================
    // FALLBACK SEARCH RADIUS
    // ==========================================================

    /*
     * Used only when a particular transport type was not found
     * in the initial request.
     */
    private static final int FALLBACK_RADIUS_METERS = 12000;


    // ==========================================================
    // HTTP TIMEOUT
    // ==========================================================

    /*
     * Keep the request responsive.
     *
     * We do not retry the same server repeatedly.
     * If one server fails, the next server is attempted.
     */
    private static final int HTTP_TIMEOUT_SECONDS = 8;


    // ==========================================================
    // HYDERABAD AIRPORT
    // ==========================================================

    private static final String HYDERABAD_AIRPORT_NAME =
            "Rajiv Gandhi International Airport";

    private static final double HYDERABAD_AIRPORT_LAT =
            17.240263;

    private static final double HYDERABAD_AIRPORT_LNG =
            78.429385;


    // ==========================================================
    // HTTP CLIENT
    // ==========================================================

    private final HttpClient httpClient;

    private final ObjectMapper objectMapper;


    public OverpassService() {

        this.httpClient =
                HttpClient.newBuilder()
                        .connectTimeout(
                                Duration.ofSeconds(
                                        HTTP_TIMEOUT_SECONDS
                                )
                        )
                        .build();

        this.objectMapper =
                new ObjectMapper();
    }


    // ==========================================================
    // MAIN METHOD
    // ==========================================================

    public NearestTransitResponse findNearestTransit(
            double hostelLat,
            double hostelLng) {

        validateCoordinates(
                hostelLat,
                hostelLng
        );


        System.out.println(
                "========================================"
        );

        System.out.println(
                "NEAREST TRANSIT REQUEST"
        );

        System.out.println(
                "Latitude  : " + hostelLat
        );

        System.out.println(
                "Longitude : " + hostelLng
        );

        System.out.println(
                "Search Radius : "
                        + SEARCH_RADIUS_METERS
                        + " meters"
        );

        System.out.println(
                "========================================"
        );


        // ======================================================
        // FETCH ALL TRANSIT TYPES IN ONE REQUEST
        // ======================================================

        List<TransitPlace> places =
                fetchNearbyTransit(
                        hostelLat,
                        hostelLng,
                        SEARCH_RADIUS_METERS
                );


        // ======================================================
        // FIND NEAREST METRO
        // ======================================================

        TransitPlace nearestMetro =
                findNearestByType(
                        places,
                        "METRO"
                );


        // ======================================================
        // FIND NEAREST BUS
        // ======================================================

        TransitPlace nearestBusStop =
                findNearestByType(
                        places,
                        "BUS"
                );


        // ======================================================
        // FIND NEAREST RAILWAY
        // ======================================================

        TransitPlace nearestRailway =
                findNearestByType(
                        places,
                        "RAILWAY"
                );


        // ======================================================
        // FALLBACK ONLY FOR MISSING TYPES
        // ======================================================

        if (nearestMetro == null) {

            nearestMetro =
                    fetchNearestSingleType(
                            hostelLat,
                            hostelLng,
                            "METRO",
                            FALLBACK_RADIUS_METERS
                    );
        }


        if (nearestBusStop == null) {

            nearestBusStop =
                    fetchNearestSingleType(
                            hostelLat,
                            hostelLng,
                            "BUS",
                            FALLBACK_RADIUS_METERS
                    );
        }


        if (nearestRailway == null) {

            nearestRailway =
                    fetchNearestSingleType(
                            hostelLat,
                            hostelLng,
                            "RAILWAY",
                            FALLBACK_RADIUS_METERS
                    );
        }


        // ======================================================
        // AIRPORT
        // ======================================================

        TransitPlace nearestAirport =
                calculateHyderabadAirportDistance(
                        hostelLat,
                        hostelLng
                );


        // ======================================================
        // DEBUG OUTPUT
        // ======================================================

        System.out.println(
                "========================================"
        );

        System.out.println(
                "NEAREST TRANSIT RESULT"
        );

        System.out.println(
                "Metro   : "
                        + formatTransitResult(
                                nearestMetro
                        )
        );

        System.out.println(
                "Bus     : "
                        + formatTransitResult(
                                nearestBusStop
                        )
        );

        System.out.println(
                "Railway : "
                        + formatTransitResult(
                                nearestRailway
                        )
        );

        System.out.println(
                "Airport : "
                        + nearestAirport.getName()
                        + " - "
                        + nearestAirport.getDistanceKm()
                        + " km"
        );

        System.out.println(
                "========================================"
        );


        return NearestTransitResponse.builder()

                .nearestMetro(
                        nearestMetro
                )

                .nearestBusStop(
                        nearestBusStop
                )

                .nearestRailwayStation(
                        nearestRailway
                )

                .nearestAirport(
                        nearestAirport
                )

                .build();
    }


    // ==========================================================
    // FORMAT RESULT
    // ==========================================================

    private String formatTransitResult(
            TransitPlace place) {

        if (place == null) {

            return "NOT FOUND";
        }

        return place.getName()
                + " - "
                + place.getDistanceKm()
                + " km";
    }


    // ==========================================================
    // FETCH ALL TRANSIT
    // ==========================================================

    private List<TransitPlace> fetchNearbyTransit(
            double hostelLat,
            double hostelLng,
            int radius) {

        String query =
                buildCombinedTransitQuery(
                        hostelLat,
                        hostelLng,
                        radius
                );


        return executeOverpassQuery(
                query,
                hostelLat,
                hostelLng,
                "ALL"
        );
    }


    // ==========================================================
    // FETCH SINGLE TYPE FALLBACK
    // ==========================================================

    private TransitPlace fetchNearestSingleType(
            double hostelLat,
            double hostelLng,
            String requestedType,
            int radius) {

        System.out.println(
                "Fallback search for "
                        + requestedType
                        + " within "
                        + radius
                        + " meters"
        );


        String query =
                buildSingleTypeQuery(
                        hostelLat,
                        hostelLng,
                        radius,
                        requestedType
                );


        List<TransitPlace> results =
                executeOverpassQuery(
                        query,
                        hostelLat,
                        hostelLng,
                        requestedType
                );


        return findNearestByType(
                results,
                requestedType
        );
    }


    // ==========================================================
    // EXECUTE OVERPASS QUERY
    // ==========================================================

    private List<TransitPlace> executeOverpassQuery(
            String query,
            double hostelLat,
            double hostelLng,
            String requestedType) {

        String[] servers = {

                PRIMARY_OVERPASS_URL,

                SECONDARY_OVERPASS_URL,

                TERTIARY_OVERPASS_URL
        };


        // ======================================================
        // TRY EACH SERVER ONLY ONCE
        // ======================================================

        for (String server : servers) {

            System.out.println(
                    "Trying Overpass server: "
                            + server
            );


            List<TransitPlace> result =
                    executeAgainstServer(
                            server,
                            query,
                            hostelLat,
                            hostelLng,
                            requestedType
                    );


            /*
             * Important:
             *
             * For the combined query, a successful HTTP response
             * can contain zero matching objects.
             *
             * We continue to another server only if no useful
             * transit objects were parsed.
             */
            if (!result.isEmpty()) {

                return result;
            }
        }


        System.out.println(
                "All Overpass servers failed for "
                        + requestedType
        );


        return new ArrayList<>();
    }


    // ==========================================================
    // EXECUTE AGAINST ONE SERVER
    // ==========================================================

    private List<TransitPlace> executeAgainstServer(
            String server,
            String query,
            double hostelLat,
            double hostelLng,
            String requestedType) {

        try {

            HttpRequest request =
                    HttpRequest.newBuilder()

                            .uri(
                                    URI.create(
                                            server
                                    )
                            )

                            .timeout(
                                    Duration.ofSeconds(
                                            HTTP_TIMEOUT_SECONDS
                                    )
                            )

                            .header(
                                    "Content-Type",
                                    "application/x-www-form-urlencoded; charset=UTF-8"
                            )

                            .header(
                                    "User-Agent",
                                    "HostelRecommendationSystem/1.0"
                            )

                            .POST(
                                    HttpRequest.BodyPublishers.ofString(
                                            "data="
                                                    + urlEncode(
                                                            query
                                                    )
                                    )
                            )

                            .build();


            System.out.println(
                    "Overpass "
                            + requestedType
                            + " request started..."
            );


            long startTime =
                    System.currentTimeMillis();


            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );


            long elapsed =
                    System.currentTimeMillis()
                            - startTime;


            System.out.println(
                    "Overpass server: "
                            + server
                            + " | type: "
                            + requestedType
                            + " | status: "
                            + response.statusCode()
                            + " | time: "
                            + elapsed
                            + " ms"
            );


            // ==================================================
            // SUCCESS
            // ==================================================

            if (response.statusCode() == 200) {

                return parseResponse(
                        response.body(),
                        hostelLat,
                        hostelLng,
                        requestedType
                );
            }


            // ==================================================
            // SERVER ERROR
            // ==================================================

            System.out.println(
                    "Overpass returned HTTP "
                            + response.statusCode()
                            + " for "
                            + requestedType
            );


            return new ArrayList<>();

        } catch (Exception e) {

            System.out.println(
                    "Overpass server failed: "
                            + server
                            + " | type: "
                            + requestedType
                            + " | error: "
                            + e.getMessage()
            );


            return new ArrayList<>();
        }
    }


    // ==========================================================
    // COMBINED TRANSIT QUERY
    // ==========================================================

    private String buildCombinedTransitQuery(
            double lat,
            double lng,
            int radius) {

        return """
                [out:json][timeout:8];

                (
                    /*
                     * RAILWAY / METRO STATIONS
                     */
                    node["railway"="station"]
                        (around:%d,%f,%f);

                    /*
                     * RAILWAY HALTS
                     */
                    node["railway"="halt"]
                        (around:%d,%f,%f);

                    /*
                     * METRO ENTRANCES
                     */
                    node["railway"="subway_entrance"]
                        (around:%d,%f,%f);

                    /*
                     * BUS STOPS
                     */
                    node["highway"="bus_stop"]
                        (around:%d,%f,%f);

                    /*
                     * PUBLIC TRANSPORT PLATFORMS
                     */
                    node["public_transport"="platform"]
                        (around:%d,%f,%f);

                    /*
                     * PUBLIC TRANSPORT STOP POSITIONS
                     */
                    node["public_transport"="stop_position"]
                        (around:%d,%f,%f);

                    /*
                     * PUBLIC TRANSPORT STATIONS
                     */
                    node["public_transport"="station"]
                        (around:%d,%f,%f);
                );

                out tags;
                """
                .formatted(

                        radius,
                        lat,
                        lng,

                        radius,
                        lat,
                        lng,

                        radius,
                        lat,
                        lng,

                        radius,
                        lat,
                        lng,

                        radius,
                        lat,
                        lng,

                        radius,
                        lat,
                        lng,

                        radius,
                        lat,
                        lng
                );
    }


    // ==========================================================
    // SINGLE TYPE QUERY
    // ==========================================================

    private String buildSingleTypeQuery(
            double lat,
            double lng,
            int radius,
            String requestedType) {


        if ("METRO".equals(
                requestedType
        )) {

            return """
                    [out:json][timeout:8];

                    (
                        node["railway"="station"]
                            (around:%d,%f,%f);

                        node["railway"="subway_entrance"]
                            (around:%d,%f,%f);

                        node["public_transport"="station"]
                            (around:%d,%f,%f);
                    );

                    out tags;
                    """
                    .formatted(

                            radius,
                            lat,
                            lng,

                            radius,
                            lat,
                            lng,

                            radius,
                            lat,
                            lng
                    );
        }


        if ("BUS".equals(
                requestedType
        )) {

            return """
                    [out:json][timeout:8];

                    (
                        node["highway"="bus_stop"]
                            (around:%d,%f,%f);

                        node["public_transport"="platform"]
                            (around:%d,%f,%f);

                        node["public_transport"="stop_position"]
                            (around:%d,%f,%f);
                    );

                    out tags;
                    """
                    .formatted(

                            radius,
                            lat,
                            lng,

                            radius,
                            lat,
                            lng,

                            radius,
                            lat,
                            lng
                    );
        }


        if ("RAILWAY".equals(
                requestedType
        )) {

            return """
                    [out:json][timeout:8];

                    (
                        node["railway"="station"]
                            (around:%d,%f,%f);

                        node["railway"="halt"]
                            (around:%d,%f,%f);
                    );

                    out tags;
                    """
                    .formatted(

                            radius,
                            lat,
                            lng,

                            radius,
                            lat,
                            lng
                    );
        }


        return """
                [out:json][timeout:8];
                node(around:%d,%f,%f);
                out tags;
                """
                .formatted(
                        radius,
                        lat,
                        lng
                );
    }


    // ==========================================================
    // PARSE RESPONSE
    // ==========================================================

    private List<TransitPlace> parseResponse(
            String json,
            double hostelLat,
            double hostelLng,
            String requestedType)
            throws Exception {

        JsonNode root =
                objectMapper.readTree(
                        json
                );


        JsonNode elements =
                root.path(
                        "elements"
                );


        System.out.println(
                "Overpass "
                        + requestedType
                        + " elements received: "
                        + elements.size()
        );


        List<TransitPlace> places =
                new ArrayList<>();


        for (JsonNode element : elements) {

            JsonNode tags =
                    element.path(
                            "tags"
                    );


            double lat =
                    getLatitude(
                            element
                    );


            double lng =
                    getLongitude(
                            element
                    );


            if (Double.isNaN(lat)
                    || Double.isNaN(lng)) {

                continue;
            }


            String name =
                    tags.path(
                            "name"
                    )
                            .asText("")
                            .trim();


            String type;


            /*
             * For a combined query determine the actual type
             * using all available OSM tags.
             */
            if ("ALL".equals(
                    requestedType
            )) {

                type =
                        determineType(
                                tags,
                                "ALL"
                        );

            } else {

                type =
                        determineType(
                                tags,
                                requestedType
                        );
            }


            if (type == null) {

                continue;
            }


            if (!"ALL".equals(
                    requestedType
            )
                    && !requestedType.equals(
                            type
                    )) {

                continue;
            }


            // ==================================================
            // FALLBACK NAME
            // ==================================================

            if (name.isEmpty()) {

                if ("BUS".equals(
                        type
                )) {

                    name =
                            "Nearby Bus Stop";

                } else if ("METRO".equals(
                        type
                )) {

                    name =
                            "Nearby Metro Station";

                } else if ("RAILWAY".equals(
                        type
                )) {

                    name =
                            "Nearby Railway Station";
                }
            }


            double distanceKm =
                    calculateDistanceKm(
                            hostelLat,
                            hostelLng,
                            lat,
                            lng
                    );


            TransitPlace place =
                    TransitPlace.builder()

                            .name(
                                    name
                            )

                            .type(
                                    type
                            )

                            .latitude(
                                    lat
                            )

                            .longitude(
                                    lng
                            )

                            .distanceKm(
                                    round(
                                            distanceKm
                                    )
                            )

                            .build();


            places.add(
                    place
            );
        }


        System.out.println(
                requestedType
                        + " valid places: "
                        + places.size()
        );


        return places;
    }


    // ==========================================================
    // FIND NEAREST
    // ==========================================================

    private TransitPlace findNearestByType(
            List<TransitPlace> places,
            String type) {

        TransitPlace nearest =
                null;


        for (TransitPlace place : places) {

            if (!type.equals(
                    place.getType()
            )) {

                continue;
            }


            if (nearest == null
                    || place.getDistanceKm()
                    < nearest.getDistanceKm()) {

                nearest =
                        place;
            }
        }


        return nearest;
    }


    // ==========================================================
    // DETERMINE TYPE
    // ==========================================================

    private String determineType(
            JsonNode tags,
            String requestedType) {

        String highway =
                tags.path(
                        "highway"
                )
                        .asText("")
                        .toLowerCase();


        String railway =
                tags.path(
                        "railway"
                )
                        .asText("")
                        .toLowerCase();


        String station =
                tags.path(
                        "station"
                )
                        .asText("")
                        .toLowerCase();


        String subway =
                tags.path(
                        "subway"
                )
                        .asText("")
                        .toLowerCase();


        String metro =
                tags.path(
                        "metro"
                )
                        .asText("")
                        .toLowerCase();


        String publicTransport =
                tags.path(
                        "public_transport"
                )
                        .asText("")
                        .toLowerCase();


        String network =
                tags.path(
                        "network"
                )
                        .asText("")
                        .toLowerCase();


        String operator =
                tags.path(
                        "operator"
                )
                        .asText("")
                        .toLowerCase();


        String bus =
                tags.path(
                        "bus"
                )
                        .asText("")
                        .toLowerCase();


        String train =
                tags.path(
                        "train"
                )
                        .asText("")
                        .toLowerCase();


        String name =
                tags.path(
                        "name"
                )
                        .asText("")
                        .toLowerCase();


        // ======================================================
        // HYDERABAD METRO DETECTION
        // ======================================================

        boolean hyderabadMetro =
                network.contains(
                        "hyderabad metro"
                )
                        || network.contains(
                                "hmr"
                        )
                        || network.contains(
                                "hyderabad metro rail"
                        )
                        || operator.contains(
                                "hyderabad metro"
                        )
                        || operator.contains(
                                "hmrl"
                        )
                        || operator.contains(
                                "hyderabad metro rail"
                        )
                        || name.contains(
                                "metro"
                        );


        // ======================================================
        // METRO
        // ======================================================

        if ("METRO".equals(
                requestedType
        )
                || "ALL".equals(
                        requestedType
                )) {

            if ("subway".equals(
                    railway
            )
                    || "subway_entrance".equals(
                            railway
                    )
                    || "subway".equals(
                            station
                    )
                    || "yes".equals(
                            subway
                    )
                    || "yes".equals(
                            metro
                    )) {

                return "METRO";
            }


            if ("station".equals(
                    railway
            )
                    && hyderabadMetro) {

                return "METRO";
            }


            if ("station".equals(
                    publicTransport
            )
                    && hyderabadMetro) {

                return "METRO";
            }


            /*
             * Some metro records may have network/operator
             * information without railway=station.
             */
            if (hyderabadMetro) {

                return "METRO";
            }


            if ("METRO".equals(
                    requestedType
            )) {

                return null;
            }
        }


        // ======================================================
        // BUS
        // ======================================================

        if ("BUS".equals(
                requestedType
        )
                || "ALL".equals(
                        requestedType
                )) {

            if ("bus_stop".equals(
                    highway
            )) {

                return "BUS";
            }


            if ("platform".equals(
                    publicTransport
            )
                    || "stop_position".equals(
                            publicTransport
                    )) {

                /*
                 * If explicitly train-only and not bus,
                 * do not classify it as a bus stop.
                 */
                if ("yes".equals(
                        train
                )
                        && !"yes".equals(
                                bus
                        )) {

                    if ("BUS".equals(
                            requestedType
                    )) {

                        return null;
                    }

                } else {

                    return "BUS";
                }
            }


            if ("BUS".equals(
                    requestedType
            )) {

                return null;
            }
        }


        // ======================================================
        // RAILWAY
        // ======================================================

        if ("RAILWAY".equals(
                requestedType
        )
                || "ALL".equals(
                        requestedType
                )) {

            if ("station".equals(
                    railway
            )
                    || "halt".equals(
                            railway
                    )
                    || "stop".equals(
                            railway
                    )) {

                /*
                 * Do not classify metro stations as
                 * conventional railway stations.
                 */
                if (!hyderabadMetro
                        && !"subway".equals(
                                station
                        )
                        && !"yes".equals(
                                subway
                        )
                        && !"yes".equals(
                                metro
                        )) {

                    return "RAILWAY";
                }
            }


            if ("station".equals(
                    publicTransport
            )
                    && "yes".equals(
                            train
                    )) {

                return "RAILWAY";
            }


            if ("RAILWAY".equals(
                    requestedType
            )) {

                return null;
            }
        }


        return null;
    }


    // ==========================================================
    // AIRPORT
    // ==========================================================

    private TransitPlace calculateHyderabadAirportDistance(
            double hostelLat,
            double hostelLng) {

        double distanceKm =
                calculateDistanceKm(
                        hostelLat,
                        hostelLng,
                        HYDERABAD_AIRPORT_LAT,
                        HYDERABAD_AIRPORT_LNG
                );


        return TransitPlace.builder()

                .name(
                        HYDERABAD_AIRPORT_NAME
                )

                .type(
                        "AIRPORT"
                )

                .latitude(
                        HYDERABAD_AIRPORT_LAT
                )

                .longitude(
                        HYDERABAD_AIRPORT_LNG
                )

                .distanceKm(
                        round(
                                distanceKm
                        )
                )

                .build();
    }


    // ==========================================================
    // GET LATITUDE
    // ==========================================================

    private double getLatitude(
            JsonNode element) {

        if (element.has(
                "lat"
        )) {

            return element
                    .path(
                            "lat"
                    )
                    .asDouble();
        }


        JsonNode center =
                element.path(
                        "center"
                );


        if (center.has(
                "lat"
        )) {

            return center
                    .path(
                            "lat"
                    )
                    .asDouble();
        }


        return Double.NaN;
    }


    // ==========================================================
    // GET LONGITUDE
    // ==========================================================

    private double getLongitude(
            JsonNode element) {

        if (element.has(
                "lon"
        )) {

            return element
                    .path(
                            "lon"
                    )
                    .asDouble();
        }


        JsonNode center =
                element.path(
                        "center"
                );


        if (center.has(
                "lon"
        )) {

            return center
                    .path(
                            "lon"
                    )
                    .asDouble();
        }


        return Double.NaN;
    }


    // ==========================================================
    // HAVERSINE DISTANCE
    // ==========================================================

    private double calculateDistanceKm(
            double lat1,
            double lon1,
            double lat2,
            double lon2) {

        final double EARTH_RADIUS_KM =
                6371.0;


        double dLat =
                Math.toRadians(
                        lat2 - lat1
                );


        double dLon =
                Math.toRadians(
                        lon2 - lon1
                );


        double a =
                Math.sin(
                        dLat / 2
                )
                        * Math.sin(
                                dLat / 2
                        )
                        +
                        Math.cos(
                                Math.toRadians(
                                        lat1
                                )
                        )
                                *
                        Math.cos(
                                Math.toRadians(
                                        lat2
                                )
                        )
                                *
                        Math.sin(
                                dLon / 2
                        )
                                *
                        Math.sin(
                                dLon / 2
                        );


        double c =
                2
                        * Math.atan2(
                                Math.sqrt(
                                        a
                                ),
                                Math.sqrt(
                                        1 - a
                                )
                        );


        return EARTH_RADIUS_KM * c;
    }


    // ==========================================================
    // ROUND
    // ==========================================================

    private double round(
            double value) {

        return Math.round(
                value * 100.0
        ) / 100.0;
    }


    // ==========================================================
    // VALIDATE COORDINATES
    // ==========================================================

    private void validateCoordinates(
            double lat,
            double lng) {

        if (Double.isNaN(lat)
                || Double.isInfinite(lat)
                || lat < -90
                || lat > 90) {

            throw new IllegalArgumentException(
                    "Invalid latitude: "
                            + lat
            );
        }


        if (Double.isNaN(lng)
                || Double.isInfinite(lng)
                || lng < -180
                || lng > 180) {

            throw new IllegalArgumentException(
                    "Invalid longitude: "
                            + lng
            );
        }
    }


    // ==========================================================
    // URL ENCODE
    // ==========================================================

    private String urlEncode(
            String value) {

        return URLEncoder.encode(
                value,
                StandardCharsets.UTF_8
        );
    }
}