package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    @Qualifier("gmailMailSender")
//     @Qualifier("mailpitMailSender")
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Override
    public void sendOtp(String to, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(senderEmail);
        message.setTo(to);
        message.setSubject("FindMyHostel - Password Reset OTP");

        message.setText(
                "Hello,\n\n" +
                "You requested to reset your password.\n\n" +
                "Your OTP is: " + otp + "\n\n" +
                "This OTP is valid for 5 minutes.\n\n" +
                "If you didn't request this, please ignore this email.\n\n" +
                "Regards,\n" +
                "FindMyHostel Team"
        );

        mailSender.send(message);
    }

    @Override
    public void sendOwnerVerificationOtp(String to, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(senderEmail);
        message.setTo(to);
        message.setSubject("FindMyHostel - Owner Email Verification OTP");

        message.setText(
                "Hello,\n\n" +
                "Your hostel owner account requires email verification.\n\n" +
                "Your verification OTP is: " + otp + "\n\n" +
                "This OTP is valid for 5 minutes.\n\n" +
                "Please do not share this OTP with anyone.\n\n" +
                "If you did not request this verification, please contact " +
                "the FindMyHostel support team.\n\n" +
                "Regards,\n" +
                "FindMyHostel Team"
        );

        mailSender.send(message);
    }

    @Override
    public void sendEmail(String to, String subject, String body) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(senderEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);
    }

    // =========================================================
    // HTML EMAIL
    // =========================================================
    //
    // This method is used when the email body contains HTML
    // tags such as:
    //
    // <html>
    // <body>
    // <p>
    // <b>
    // <ol>
    // <li>
    // <br>
    //
    // MimeMessageHelper tells the mail client that the body
    // should be interpreted as HTML instead of plain text.
    //
    // =========================================================

    @Override
    public void sendHtmlEmail(
            String to,
            String subject,
            String htmlBody) {

        try {

            MimeMessage message =
                    mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(
                            message,
                            false,
                            "UTF-8"
                    );

            helper.setFrom(senderEmail);

            helper.setTo(to);

            helper.setSubject(subject);

            // TRUE = body is HTML
            helper.setText(
                    htmlBody,
                    true
            );

            mailSender.send(message);

        } catch (MessagingException e) {

            throw new RuntimeException(
                    "Failed to send HTML email",
                    e
            );
        }
    }


    @Override
public void sendRegistrationOtp(String to, String otp) {

    SimpleMailMessage message = new SimpleMailMessage();

    message.setFrom(senderEmail);
    message.setTo(to);
    message.setSubject("FindMyHostel - Verify Your Email");

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

@Override
public void sendLoginOtp(String to, String otp) {

    SimpleMailMessage message = new SimpleMailMessage();

    message.setFrom(senderEmail);
    message.setTo(to);
    message.setSubject("FindMyHostel - Login OTP");

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