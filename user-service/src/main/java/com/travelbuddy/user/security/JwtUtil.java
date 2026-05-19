package com.travelbuddy.user.security;

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

/**
 * JWT Utility – TV1
 *
 * Payload chuẩn toàn nhóm (TV3 leader quy định):
 * {
 *   "userId" : "uuid-của-user",
 *   "email"  : "user@example.com",
 *   "iat"    : 1234567890,
 *   "exp"    : 1235567890
 * }
 *
 * TV2 & TV3 (Node.js) verify:
 *   const decoded = jwt.verify(token, process.env.JWT_SECRET)
 *   // decoded.userId, decoded.email
 */
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

    /** Tạo JWT với payload { userId, email } – HS256 */
    public String generateToken(UUID userId, String email) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .claim("userId", userId.toString())   // QUAN TRỌNG: key "userId" để TV2&TV3 dùng được
                .claim("email", email)
                .issuedAt(now)
                .expiration(exp)
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    /** Parse và validate token. Ném JwtException nếu không hợp lệ. */
    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /** Lấy userId từ token */
    public String getUserIdFromToken(String token) {
        return parseToken(token).get("userId", String.class);
    }

    /** Lấy email từ token */
    public String getEmailFromToken(String token) {
        return parseToken(token).get("email", String.class);
    }

    /** Kiểm tra token còn hợp lệ không */
    public boolean isTokenValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT không hợp lệ: {}", e.getMessage());
            return false;
        }
    }

    /** Parse chuỗi duration như "7d", "24h", "3600s" → milliseconds */
    private long parseDuration(String duration) {
        if (duration == null || duration.isBlank()) return 7L * 24 * 3600 * 1000;
        String val = duration.trim();
        if (val.endsWith("d"))  return Long.parseLong(val.replace("d", "")) * 24 * 3600 * 1000L;
        if (val.endsWith("h"))  return Long.parseLong(val.replace("h", "")) * 3600 * 1000L;
        if (val.endsWith("s"))  return Long.parseLong(val.replace("s", "")) * 1000L;
        return Long.parseLong(val); // assume ms
    }
}
