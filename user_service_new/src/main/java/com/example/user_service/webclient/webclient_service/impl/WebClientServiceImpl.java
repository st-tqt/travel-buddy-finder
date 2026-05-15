package com.example.user_service.webclient.webclient_service.impl;

import com.example.user_service.dto.request.LoginDTO;
import com.example.user_service.dto.response.TokenRep;
import com.example.user_service.webclient.webclient_service.WebClientService;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class WebClientServiceImpl implements WebClientService {
    @Override
    public TokenRep getToken(LoginDTO loginDTO) {
        WebClient webClient = WebClient.create();

        return webClient.post().uri("http://localhost:8080/realms/shop_new/protocol/openid-connect/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData("client_id", "backend")
                        .with("client_secret", "7Z6NxiN9N2D1Nt8O0e17LUloLFbAVqgl").
                        with("grant_type", "password").with("username", loginDTO.getUsername()).
                        with("password", loginDTO.getPassword())).
                retrieve().bodyToMono(TokenRep.class).block();
    }
}
