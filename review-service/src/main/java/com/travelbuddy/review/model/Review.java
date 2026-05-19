package com.travelbuddy.review.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "reviews",
    indexes = {
        @Index(name = "idx_review_target_user",   columnList = "targetUserId"),
        @Index(name = "idx_review_reviewer_trip",  columnList = "reviewerId, tripId")
    },
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_reviewer_trip_target",
            columnNames = {"reviewerId", "tripId", "targetUserId"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private UUID tripId;

    @Column(nullable = false)
    private UUID reviewerId;

    @Column(nullable = false)
    private UUID targetUserId;

    @Column(nullable = false)
    private Integer rating;

    @Column(nullable = false, length = 500)
    private String comment;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
