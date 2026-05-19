package com.travelbuddy.review.dto;

import com.travelbuddy.review.model.Review;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ReviewDTO {
    private UUID id;
    private UUID tripId;
    private UUID reviewerId;
    private UUID targetUserId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    public static ReviewDTO fromEntity(Review review) {
        return ReviewDTO.builder()
                .id(review.getId())
                .tripId(review.getTripId())
                .reviewerId(review.getReviewerId())
                .targetUserId(review.getTargetUserId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
