package com.travelbuddy.review.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateReviewRequest {
    @NotNull(message = "Trip ID is required")
    private UUID tripId;

    @NotNull(message = "Target User ID is required")
    private UUID targetUserId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    @NotBlank(message = "Comment is required")
    @Size(max = 500, message = "Comment must not exceed 500 characters")
    private String comment;
}
