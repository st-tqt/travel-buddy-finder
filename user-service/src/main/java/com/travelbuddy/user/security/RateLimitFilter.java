package com.travelbuddy.user.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate limiter đơn giản dùng ConcurrentHashMap – không cần thư viện ngoài.
 * - POST /auth/login    : 5 lần / phút / IP
 * - POST /auth/register : 3 lần / phút / IP
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int  LOGIN_MAX    = 100;
    private static final int  REGISTER_MAX = 50;
    private static final long WINDOW_MS    = 60_000L; // 1 phút

    private record Bucket(AtomicInteger count, long windowStart) {}

    private final ConcurrentHashMap<String, Bucket> loginBuckets    = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Bucket> registerBuckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String method = request.getMethod();
        String path   = request.getRequestURI();

        if ("POST".equals(method) && "/auth/login".equals(path)) {
            if (!allow(getClientIp(request), loginBuckets, LOGIN_MAX)) {
                writeTooMany(response);
                return;
            }
        } else if ("POST".equals(method) && "/auth/register".equals(path)) {
            if (!allow(getClientIp(request), registerBuckets, REGISTER_MAX)) {
                writeTooMany(response);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    // ── helpers ───────────────────────────────────────────────

    private boolean allow(String ip,
                          ConcurrentHashMap<String, Bucket> buckets,
                          int maxRequests) {
        long now = Instant.now().toEpochMilli();
        Bucket bucket = buckets.compute(ip, (k, b) -> {
            if (b == null || now - b.windowStart() >= WINDOW_MS) {
                return new Bucket(new AtomicInteger(1), now);
            }
            b.count().incrementAndGet();
            return b;
        });
        return bucket.count().get() <= maxRequests;
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void writeTooMany(HttpServletResponse response) throws IOException {
        response.setStatus(429);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"error\":\"Too many attempts, please try again later.\"}");
    }
}
