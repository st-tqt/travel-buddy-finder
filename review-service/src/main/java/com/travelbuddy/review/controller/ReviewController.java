package com.travelbuddy.review.controller;

import com.travelbuddy.review.dto.CreateReviewRequest;
import com.travelbuddy.review.dto.ReviewDTO;
import com.travelbuddy.review.dto.UserReviewsResponse;
import com.travelbuddy.review.service.ReviewService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewDTO> createReview(@Valid @RequestBody CreateReviewRequest request, HttpServletRequest httpRequest) {
        String userIdStr = (String) httpRequest.getAttribute("userId");
        if (userIdStr == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        UUID reviewerId;
        try {
            reviewerId = UUID.fromString(userIdStr);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        ReviewDTO review = reviewService.createReview(reviewerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<UserReviewsResponse> getReviewsForUser(@PathVariable UUID id) {
        UserReviewsResponse response = reviewService.getReviewsForUser(id);
        return ResponseEntity.ok(response);
    }
}
