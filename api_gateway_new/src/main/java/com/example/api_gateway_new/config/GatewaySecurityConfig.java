package com.example.api_gateway_new.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebFluxSecurity
public class GatewaySecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(auth -> auth
                        // Cho phép các request OPTIONS của CORS đi qua tự do
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 🔓 Mở khóa các API Public tại Gateway
                        .pathMatchers("/api/user/register", "/api/user/login").permitAll()
                        .pathMatchers("/api/user/**").permitAll()

                        // 🔒 Các API yêu cầu phân quyền theo Role
                        .pathMatchers("/v1/admin/**").hasRole("ADMIN")
                        .pathMatchers("/v1/orders/**").hasAnyRole("USER", "ADMIN")

                        // 🔒 Tất cả các request còn lại phải đăng nhập
                        .anyExchange().authenticated()
                )
//                .oauth2ResourceServer(oauth -> oauth
//                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtConverter()))

                .build();
    }

    @Bean
    public Converter<Jwt, Mono<AbstractAuthenticationToken>> jwtConverter() {
        return jwt -> {
            Collection<GrantedAuthority> authorities = new ArrayList<>();
            try {
                Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
                if (resourceAccess != null && resourceAccess.containsKey("backend")) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> backend = (Map<String, Object>) resourceAccess.get("backend");
                    if (backend != null && backend.containsKey("roles")) {
                        @SuppressWarnings("unchecked")
                        List<String> roles = (List<String>) backend.get("roles");
                        if (roles != null) {
                            roles.forEach(role -> authorities.add(new SimpleGrantedAuthority("ROLE_" + role)));
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Lỗi parse token tại Gateway: " + e.getMessage());
            }
            return Mono.just(new JwtAuthenticationToken(jwt, authorities));
        };
    }

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.addAllowedOriginPattern("*");
        corsConfig.setMaxAge(3600L);
        corsConfig.addAllowedMethod("*");
        corsConfig.addAllowedHeader("*");
        corsConfig.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        return new CorsWebFilter(source);
    }
}
