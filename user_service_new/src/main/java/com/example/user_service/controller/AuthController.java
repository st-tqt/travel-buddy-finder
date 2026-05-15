package com.example.user_service.controller;

import com.example.user_service.dto.request.LoginDTO;
import com.example.user_service.dto.request.UserRegisterReq;
import com.example.user_service.dto.response.BaseResponse;
import com.example.user_service.dto.response.TokenRep;
import com.example.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody UserRegisterReq userRegisterReq) {
        userService.registerUser(userRegisterReq);
        return ResponseEntity.ok("success");
    }

    @PostMapping("/login")
    public ResponseEntity<BaseResponse<TokenRep>> login(@RequestBody LoginDTO loginDTO) {
        return ResponseEntity.ok(new BaseResponse<>(userService.login(loginDTO), "success"));
    }
}
