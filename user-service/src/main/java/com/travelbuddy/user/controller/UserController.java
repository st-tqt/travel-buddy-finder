package com.travelbuddy.user.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    // TODO TV1: inject UserService

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable String id) {
        // TODO TV1: kiểm tra JWT qua JwtFilter (Spring Security)
        // rồi gọi userService.findById(id)
        return ResponseEntity.ok(null);
    }
}
