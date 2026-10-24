package com.example.backend.dto;

public class RegisterRequest {
    private String name;
    private String email;
    private String phoneNo;
    private String password;
    private String confirmPassword;
    private boolean hostelOwner;

    public RegisterRequest() {
    }

    public RegisterRequest(String name, String email, String phoneNo,
                        String password, String confirmPassword,
                        boolean hostelOwner) {
        this.name = name;
        this.email = email;
        this.phoneNo = phoneNo;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.hostelOwner = hostelOwner;
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

    public String getPhoneNo() {
        return phoneNo;
    }

    public void setPhoneNo(String phoneNo) {
        this.phoneNo = phoneNo;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

    public boolean isHostelOwner() {
        return hostelOwner;
    }

    public void setHostelOwner(boolean hostelOwner) {
        this.hostelOwner = hostelOwner;
    }
}