package com.travelbuddy.user.controller;

import com.travelbuddy.user.dto.LoginRequest;
import com.travelbuddy.user.dto.RegisterRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    // TODO TV1: inject AuthService

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // TODO TV1: gọi authService.register(request)
        return ResponseEntity.status(201).body(null);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // TODO TV1: gọi authService.login(request) → trả JWT
        return ResponseEntity.ok(null);
    }
}
