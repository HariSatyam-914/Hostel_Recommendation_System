package com.example.backend.dto;

import com.example.backend.entity.Role;

public class AuthResponse {

    private String message;
    private Long userId;
    private String name;
    private String email;
    private Role role;
    private String token;

    private boolean otpRequired;


    public AuthResponse() {
    }


    public AuthResponse(
            String message,
            Long userId,
            String name,
            String email,
            Role role,
            String token) {

        this.message = message;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.token = token;
        this.otpRequired = false;
    }


    public AuthResponse(
            String message,
            Long userId,
            String name,
            String email,
            Role role,
            String token,
            boolean otpRequired) {

        this.message = message;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.token = token;
        this.otpRequired = otpRequired;
    }


    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }


    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }


    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }


    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }


    public boolean isOtpRequired() {
        return otpRequired;
    }

    public void setOtpRequired(boolean otpRequired) {
        this.otpRequired = otpRequired;
    }
}