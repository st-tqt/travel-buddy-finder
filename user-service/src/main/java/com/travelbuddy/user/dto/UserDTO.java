package com.travelbuddy.user.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class UserDTO {
    private UUID id;
    private String name;
    private String email;
    private String bio;
    private List<String> tags;
    private Instant createdAt;
}
