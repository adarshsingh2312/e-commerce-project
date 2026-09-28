package com.emart.ecommerce.config;

import com.emart.ecommerce.model.AuthProvider;
import com.emart.ecommerce.model.User;
import com.emart.ecommerce.repository.UserRepository;
import com.emart.ecommerce.service.CartService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    @Lazy
    private CartService cartService;

    @Autowired
    private JwtProvider jwtProvider;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        Boolean emailVerified = oAuth2User.getAttribute("email_verified");

        if (email == null || (emailVerified != null && !emailVerified)) {
            getRedirectStrategy().sendRedirect(request, response,
                    frontendUrl + "/login?error=" + URLEncoder.encode("Email not verified by Google", StandardCharsets.UTF_8));
            return;
        }

        User user = userRepository.findByEmail(email);

        if (user == null) {
            String firstName = oAuth2User.getAttribute("given_name");
            String lastName = oAuth2User.getAttribute("family_name");

            if (firstName == null) {
                String fullName = oAuth2User.getAttribute("name");
                if (fullName != null && fullName.contains(" ")) {
                    String[] parts = fullName.split(" ", 2);
                    firstName = parts[0];
                    lastName = parts[1];
                } else {
                    firstName = fullName != null ? fullName : "User";
                    lastName = "";
                }
            }

            user = new User();
            user.setEmail(email);
            user.setFirstName(firstName != null ? firstName : "User");
            user.setLastName(lastName != null ? lastName : "");
            user.setRole("CUSTOMER");
            user.setProvider(AuthProvider.GOOGLE);

            User savedUser = userRepository.save(user);
            cartService.createCart(savedUser);
            user = savedUser;
        }

        String role = user.getRole() != null ? user.getRole().toUpperCase() : "CUSTOMER";
        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + role)
        );

        Authentication jwtAuth = new UsernamePasswordAuthenticationToken(user.getEmail(), null, authorities);
        String token = jwtProvider.generateToken(jwtAuth);

        String targetUrl = frontendUrl + "/oauth-callback?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
