package com.travelbuddy.review.repository;

import com.travelbuddy.review.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByTargetUserIdOrderByCreatedAtDesc(UUID targetUserId);
    boolean existsByReviewerIdAndTripIdAndTargetUserId(UUID reviewerId, UUID tripId, UUID targetUserId);

    /** Tính averageRating tại DB – hiệu quả hơn load toàn bộ data về Java */
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.targetUserId = :userId")
    Double findAverageRatingByTargetUserId(@Param("userId") UUID userId);
}
