package com.travelbuddy.user.service.impl;

import com.travelbuddy.user.dto.AuthResponse;
import com.travelbuddy.user.dto.LoginRequest;
import com.travelbuddy.user.dto.RegisterRequest;
import com.travelbuddy.user.dto.UserDTO;
import com.travelbuddy.user.model.User;
import com.travelbuddy.user.repository.UserRepository;
import com.travelbuddy.user.security.JwtUtil;
import com.travelbuddy.user.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public UserDTO register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new com.travelbuddy.user.exception.EmailAlreadyExistsException(
                    "Email " + request.getEmail() + " đã được sử dụng");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .bio(request.getBio())
                .tags(request.getTags() != null ? request.getTags() : new java.util.ArrayList<>())
                .build();

        User saved = userRepository.save(user);

        return UserDTO.builder()
                .id(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .bio(saved.getBio())
                .tags(saved.getTags())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new com.travelbuddy.user.exception.InvalidCredentialsException(
                        "Email hoặc password không đúng"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new com.travelbuddy.user.exception.InvalidCredentialsException(
                    "Email hoặc password không đúng");
        }

        // Ký JWT: payload { userId, email, iat, exp } – TV2 & TV3 verify được
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .accessToken(token)
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .build())
                .build();
    }
}
