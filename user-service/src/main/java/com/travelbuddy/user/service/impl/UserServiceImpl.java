package com.travelbuddy.user.service.impl;

import com.travelbuddy.user.dto.UserDTO;
import com.travelbuddy.user.exception.UserNotFoundException;
import com.travelbuddy.user.model.User;
import com.travelbuddy.user.repository.UserRepository;
import com.travelbuddy.user.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDTO findById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(
                        "Không tìm thấy user với id " + id));

        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .bio(user.getBio())
                .tags(user.getTags())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
