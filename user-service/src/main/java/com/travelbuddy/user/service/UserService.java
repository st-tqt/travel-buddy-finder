package com.travelbuddy.user.service;

import com.travelbuddy.user.dto.UserDTO;

import java.util.UUID;

public interface UserService {
    UserDTO findById(UUID id);
}
