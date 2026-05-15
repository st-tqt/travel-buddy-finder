package com.travelbuddy.user.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JwtFilter – chạy mỗi request, verify JWT và gắn vào SecurityContext.
 *
 * Cách dùng với TV2 & TV3 (Node.js):
 *   Authorization: Bearer <token>
 *   const decoded = jwt.verify(token, process.env.JWT_SECRET)
 *   decoded.userId  ← UUID string
 *   decoded.email   ← email string
 */
@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);
    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = extractToken(request);

        if (StringUtils.hasText(token)) {
            try {
                Claims claims = jwtUtil.parseToken(token);
                String userId = claims.get("userId", String.class);
                String email  = claims.get("email",  String.class);

                // Gắn vào SecurityContext
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                userId,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_USER"))
                        );
                SecurityContextHolder.getContext().setAuthentication(auth);

                // Set attribute để controller lấy nếu cần
                request.setAttribute("userId", userId);
                request.setAttribute("email",  email);

            } catch (JwtException e) {
                log.warn("JWT không hợp lệ: {}", e.getMessage());
                // Không set auth → Spring Security sẽ trả 401 nếu endpoint cần auth
            }
        }

        filterChain.doFilter(request, response);
    }

    /** Trích xuất Bearer token từ Authorization header */
    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
