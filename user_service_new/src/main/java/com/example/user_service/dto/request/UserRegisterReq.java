package com.example.user_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRegisterReq {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String userName;
}
