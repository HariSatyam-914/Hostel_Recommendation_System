package com.example.backend.entity;

//import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String phoneNo;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "email_verification_status", nullable = false)
    private EmailVerificationStatus emailVerificationStatus =
            EmailVerificationStatus.NOT_VERIFIED;

    @Column(name = "account_email_verified", nullable = false, columnDefinition = "boolean default true")
    private boolean accountEmailVerified = true;
    
    //private LocalDateTime createdAt;

    public User(){}

    public User(String name, String email, String phoneNo, String password, Role role) {
        super();
        this.name = name;
        this.email = email;
        this.phoneNo = phoneNo;
        this.password = password;
        this.role = role;
    }

    // Getter and Setter for id
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // Getter and Setter for name
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // Getter and Setter for email
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    // Getter and Setter for phoneNo
    public String getPhoneNo() {
        return phoneNo;
    }

    public void setPhoneNo(String phoneNo) {
        this.phoneNo = phoneNo;
    }

    // Getter and Setter for password
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    // Getter and Setter for role
    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public EmailVerificationStatus getEmailVerificationStatus() {
    return emailVerificationStatus;
}

public void setEmailVerificationStatus(
        EmailVerificationStatus emailVerificationStatus) {

    this.emailVerificationStatus = emailVerificationStatus;
}

public boolean isAccountEmailVerified() {
    return accountEmailVerified;
}

public void setAccountEmailVerified(boolean accountEmailVerified) {
    this.accountEmailVerified = accountEmailVerified;
}


}