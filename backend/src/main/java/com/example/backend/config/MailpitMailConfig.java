package com.example.backend.config;

import java.util.Properties;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

@Configuration
public class MailpitMailConfig {

    @Value("${app.mailpit.host:localhost}")
    private String host;

    @Value("${app.mailpit.port:1025}")
    private int port;

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String gmailHost;

    @Value("${spring.mail.port:587}")
    private int gmailPort;

    @Value("${spring.mail.username}")
    private String gmailUsername;

    @Value("${spring.mail.password}")
    private String gmailPassword;

    @Bean(name = "mailpitMailSender")
    public JavaMailSender mailpitMailSender() {

        JavaMailSenderImpl mailSender =
                new JavaMailSenderImpl();

        mailSender.setHost(host);
        mailSender.setPort(port);

        Properties properties =
                mailSender.getJavaMailProperties();

        properties.put(
                "mail.smtp.auth",
                "false"
        );

        properties.put(
                "mail.smtp.starttls.enable",
                "false"
        );

        return mailSender;
    }

    @Bean(name = "gmailMailSender")
    public JavaMailSender gmailMailSender() {

        JavaMailSenderImpl mailSender =
                new JavaMailSenderImpl();

        mailSender.setHost(gmailHost);
        mailSender.setPort(gmailPort);
        mailSender.setUsername(gmailUsername);
        mailSender.setPassword(gmailPassword);

        Properties properties =
                mailSender.getJavaMailProperties();

        properties.put(
                "mail.smtp.auth",
                "true"
        );

        properties.put(
                "mail.smtp.starttls.enable",
                "true"
        );

        properties.put(
                "mail.smtp.starttls.required",
                "true"
        );

        properties.put(
                "mail.smtp.connectiontimeout",
                "10000"
        );

        properties.put(
                "mail.smtp.timeout",
                "10000"
        );

        properties.put(
                "mail.smtp.writetimeout",
                "10000"
        );

        return mailSender;
    }
}

