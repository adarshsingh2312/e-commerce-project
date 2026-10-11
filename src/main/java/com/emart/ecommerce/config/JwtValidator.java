package com.emart.ecommerce.config;

import com.emart.ecommerce.model.User;
import com.emart.ecommerce.repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtValidator extends OncePerRequestFilter {

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String jwt = request.getHeader(JwtConstant.JWT_HEADER);
        if (jwt != null) {
            try {
                Claims claims = jwtProvider.getClaimsFromToken(jwt);
                String email = String.valueOf(claims.get("email"));
                String authorities = String.valueOf(claims.get("authorities"));
                List<GrantedAuthority> auths = new ArrayList<>(AuthorityUtils.commaSeparatedStringToAuthorityList(authorities));

                User user = userRepository.findByEmail(email);
                if (user != null && user.getRole() != null) {
                    String role = user.getRole().trim().toUpperCase();
                    if (role.startsWith("ROLE_")) {
                        role = role.substring(5);
                    }
                    String roleAuth = "ROLE_" + role;
                    if (auths.stream().noneMatch(a -> a.getAuthority().equalsIgnoreCase(roleAuth))) {
                        auths.add(new SimpleGrantedAuthority(roleAuth));
                    }
                }

                Authentication authentication = new UsernamePasswordAuthenticationToken(email, null, auths);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (Exception e) {
                throw new BadCredentialsException("Invalid token... from JWT Validator");
            }
        }
        filterChain.doFilter(request, response);
    }
}
