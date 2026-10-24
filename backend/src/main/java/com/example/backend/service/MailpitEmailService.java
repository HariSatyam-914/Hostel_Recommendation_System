package com.example.backend.service;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailpitEmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mailpit.from:no-reply@findmyhostel.local}")
    private String senderEmail;

    public MailpitEmailService(
            @Qualifier("mailpitMailSender")
            JavaMailSender mailSender) {

        this.mailSender = mailSender;
    }

    // =========================================================
    // OWNER EMAIL VERIFICATION OTP
    // =========================================================

    public void sendOwnerVerificationOtp(
            String to,
            String otp) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(senderEmail);

        message.setTo(to);

        message.setSubject(
                "FindMyHostel - Owner Email Verification OTP"
        );

        message.setText(
                "Hello,\n\n" +
                "Your hostel owner account requires email verification.\n\n" +
                "Your verification OTP is: " + otp + "\n\n" +
                "This OTP is valid for 5 minutes.\n\n" +
                "Please do not share this OTP with anyone.\n\n" +
                "If you did not request this verification, please " +
                "contact the FindMyHostel support team.\n\n" +
                "Regards,\n" +
                "FindMyHostel Team"
        );

        mailSender.send(message);
    }

    public void sendRegistrationOtp(
        String to,
        String otp) {

    SimpleMailMessage message =
            new SimpleMailMessage();

    message.setFrom(senderEmail);
    message.setTo(to);

    message.setSubject(
            "FindMyHostel - Verify Your Email"
    );

    message.setText(
            "Hello,\n\n" +
            "Welcome to FindMyHostel.\n\n" +
            "Your account verification OTP is: " + otp + "\n\n" +
            "This OTP is valid for 5 minutes.\n\n" +
            "Please do not share this OTP with anyone.\n\n" +
            "If you did not create this account, please ignore this email.\n\n" +
            "Regards,\n" +
            "FindMyHostel Team"
    );

    mailSender.send(message);
}

public void sendLoginOtp(
        String to,
        String otp) {

    SimpleMailMessage message =
            new SimpleMailMessage();

    message.setFrom(senderEmail);
    message.setTo(to);

    message.setSubject(
            "FindMyHostel - Login OTP"
    );

    message.setText(
            "Hello,\n\n" +
            "A login attempt was made for your FindMyHostel account.\n\n" +
            "Your login OTP is: " + otp + "\n\n" +
            "This OTP is valid for 5 minutes.\n\n" +
            "Please do not share this OTP with anyone.\n\n" +
            "If you did not attempt to login, please secure your account.\n\n" +
            "Regards,\n" +
            "FindMyHostel Team"
    );

    mailSender.send(message);
}


}