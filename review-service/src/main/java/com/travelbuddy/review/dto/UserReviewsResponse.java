package com.travelbuddy.review.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class UserReviewsResponse {
    private List<ReviewDTO> data;
    private int total;
    private double averageRating;
}
