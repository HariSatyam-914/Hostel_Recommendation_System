package com.example.backend.dto;

public class VerifyAuthOtpRequest {

    private String email;

    private String otp;

    public VerifyAuthOtpRequest() {
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}