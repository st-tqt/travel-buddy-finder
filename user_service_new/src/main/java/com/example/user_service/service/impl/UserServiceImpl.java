package com.example.user_service.service.impl;

import com.example.user_service.dto.request.LoginDTO;
import com.example.user_service.dto.request.UserRegisterReq;
import com.example.user_service.dto.response.TokenRep;
import com.example.user_service.service.UserService;
import com.example.user_service.webclient.webclient_service.WebClientService;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    private final Keycloak keycloak;
    @Value("${keycloak.realm}")
    private String keycloakRealm;
    private final WebClientService webClientService;

    @Override
    public void registerUser(UserRegisterReq userRegisterReq) {
        UserRepresentation userRepresentation = new UserRepresentation();
        userRepresentation.setEmail(userRegisterReq.getEmail());
        userRepresentation.setFirstName(userRegisterReq.getFirstName());
        userRepresentation.setLastName(userRegisterReq.getLastName());
        userRepresentation.setEnabled(true);
        userRepresentation.setUsername(userRegisterReq.getUserName());
        CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
        credentialRepresentation.setType(CredentialRepresentation.PASSWORD);
        credentialRepresentation.setValue(userRegisterReq.getPassword());
        credentialRepresentation.setTemporary(false);
        userRepresentation.setCredentials(Collections.singletonList(credentialRepresentation));
        Response response = keycloak.realm(keycloakRealm).users().create(userRepresentation);
        if (response.getStatus() != 201) {
            String errorMessage = response.readEntity(String.class);
            log.error("Error while creating user {}, error message: {}", userRegisterReq.getUserName(), errorMessage);
            throw new RuntimeException("Error while creating user " + userRegisterReq.getUserName());
        }
        String location = response.getHeaderString("Location");

        String userId = location.substring(location.lastIndexOf("/") + 1);

        log.info("Created Keycloak userId = {}", userId);

    }

    @Override
    public TokenRep login(LoginDTO loginDTO) {

        return webClientService.getToken(loginDTO);
    }
}
