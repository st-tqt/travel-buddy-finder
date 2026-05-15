package com.example.user_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TokenRep {
    String access_token;
    String expires_in;
    String refresh_expires_in;
    String refresh_token;
    String token_type;
    String session_state;
}
