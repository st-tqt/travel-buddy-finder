package com.example.user_service.webclient.webclient_service;

import com.example.user_service.dto.request.LoginDTO;
import com.example.user_service.dto.response.TokenRep;

public interface WebClientService {
    TokenRep getToken(LoginDTO loginDTO);
}
