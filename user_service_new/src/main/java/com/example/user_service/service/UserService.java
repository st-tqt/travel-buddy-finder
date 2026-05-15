package com.example.user_service.service;

import com.example.user_service.dto.request.LoginDTO;
import com.example.user_service.dto.request.UserRegisterReq;
import com.example.user_service.dto.response.TokenRep;
import org.springframework.stereotype.Component;

@Component
public interface UserService {
    void registerUser(UserRegisterReq userRegisterReq);
    TokenRep login(LoginDTO loginDTO);
}
