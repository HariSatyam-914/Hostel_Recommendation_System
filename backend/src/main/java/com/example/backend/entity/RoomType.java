package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum RoomType {

    SINGLE,
    DOUBLE,
    TRIPLE,
    QUAD,
    FIVE;

    @JsonCreator
    public static RoomType fromString(String value) {

        if (value == null) {
            return null;
        }

        for (RoomType type : RoomType.values()) {
            if (type.name().equalsIgnoreCase(value.trim())) {
                return type;
            }
        }

        throw new IllegalArgumentException(
            "Invalid room type: " + value
        );
    }
}