package com.travelbuddy.review.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtUtil(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration:7d}") String expiration) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = parseDuration(expiration);
    }

    public String generateToken(UUID userId, String email) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .claim("userId", userId.toString())
                .claim("email", email)
                .issuedAt(now)
                .expiration(exp)
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private long parseDuration(String duration) {
        if (duration == null || duration.isBlank()) return 7L * 24 * 3600 * 1000;
        String val = duration.trim();
        if (val.endsWith("d"))  return Long.parseLong(val.replace("d", "")) * 24 * 3600 * 1000L;
        if (val.endsWith("h"))  return Long.parseLong(val.replace("h", "")) * 3600 * 1000L;
        if (val.endsWith("s"))  return Long.parseLong(val.replace("s", "")) * 1000L;
        return Long.parseLong(val); 
    }
}
