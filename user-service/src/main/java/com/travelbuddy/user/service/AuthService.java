package com.travelbuddy.user.service;

import com.travelbuddy.user.dto.AuthResponse;
import com.travelbuddy.user.dto.LoginRequest;
import com.travelbuddy.user.dto.RegisterRequest;
import com.travelbuddy.user.dto.UserDTO;

public interface AuthService {
    UserDTO register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
