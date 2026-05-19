package com.travelbuddy.review.service;

import com.travelbuddy.review.dto.CreateReviewRequest;
import com.travelbuddy.review.dto.ReviewDTO;
import com.travelbuddy.review.dto.UserReviewsResponse;
import com.travelbuddy.review.model.Review;
import com.travelbuddy.review.repository.ReviewRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public ReviewDTO createReview(UUID reviewerId, CreateReviewRequest request) {
        if (reviewerId.equals(request.getTargetUserId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot review yourself");
        }

        if (reviewRepository.existsByReviewerIdAndTripIdAndTargetUserId(
                reviewerId, request.getTripId(), request.getTargetUserId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Review already exists for this trip and target user");
        }

        // Sanitize comment: trim + strip HTML tags (ngăn XSS nếu frontend render trực tiếp)
        String sanitizedComment = sanitizeComment(request.getComment());

        Review review = Review.builder()
                .tripId(request.getTripId())
                .reviewerId(reviewerId)
                .targetUserId(request.getTargetUserId())
                .rating(request.getRating())
                .comment(sanitizedComment)
                .build();

        Review saved = reviewRepository.save(review);
        return ReviewDTO.fromEntity(saved);
    }

    public UserReviewsResponse getReviewsForUser(UUID targetUserId) {
        List<ReviewDTO> reviews = reviewRepository.findByTargetUserIdOrderByCreatedAtDesc(targetUserId)
                .stream()
                .map(ReviewDTO::fromEntity)
                .collect(Collectors.toList());

        // Tính average tại DB – hiệu quả hơn với nhiều reviews
        Double avg = reviewRepository.findAverageRatingByTargetUserId(targetUserId);
        double averageRating = (avg != null) ? Math.round(avg * 10.0) / 10.0 : 0.0;

        return UserReviewsResponse.builder()
                .data(reviews)
                .total(reviews.size())
                .averageRating(averageRating)
                .build();
    }

    // ── helpers ───────────────────────────────────────────────

    /** Loại bỏ HTML tags khỏi comment để tránh XSS */
    private String sanitizeComment(String comment) {
        if (comment == null) return null;
        // Strip bất kỳ HTML tag nào
        return comment.trim().replaceAll("<[^>]*>", "");
    }
}
