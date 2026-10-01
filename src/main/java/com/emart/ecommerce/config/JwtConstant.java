package com.emart.ecommerce.config;

import org.springframework.beans.factory.annotation.Value;

public class JwtConstant {
    @Value("${jwt.secret}")
    private String jwtSecret;
    public static final String JWT_HEADER = "Authorization";
}
