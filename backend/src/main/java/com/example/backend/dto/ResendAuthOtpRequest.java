package com.example.backend.dto;

public class ResendAuthOtpRequest {

    private String email;

    private String purpose;

    public ResendAuthOtpRequest() {
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }
}