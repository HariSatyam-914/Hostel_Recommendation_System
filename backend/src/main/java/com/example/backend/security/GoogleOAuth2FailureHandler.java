package com.example.backend.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class GoogleOAuth2FailureHandler
        extends SimpleUrlAuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException, ServletException {

        System.out.println("========================================");
        System.out.println("GOOGLE OAUTH2 LOGIN FAILED");
        System.out.println("Exception Type: " + exception.getClass().getName());
        System.out.println("Exception Message: " + exception.getMessage());
        System.out.println("========================================");

        String message = "Google login failed";

        if (exception instanceof OAuth2AuthenticationException oauthException) {

            String errorCode =
                    oauthException.getError().getErrorCode();

            if ("authorization_request_not_found"
                    .equals(errorCode)) {

                /*
                 * This normally means the OAuth callback was already
                 * processed once and the browser/provider sent the
                 * callback again.
                 *
                 * Do not show the raw Spring Security error page.
                 */
                message =
                        "Google login request was already processed. "
                        + "Please continue from the FindMyHostel page.";
            }
        }

        String redirectUrl =
                "http://localhost:5174/login?oauth2Error="
                        + URLEncoder.encode(
                                message,
                                StandardCharsets.UTF_8
                        );

        response.sendRedirect(redirectUrl);
    }
}