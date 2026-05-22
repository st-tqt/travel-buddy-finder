import React from 'react';
import ReviewItem from './ReviewItem';

export default function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">Chưa có đánh giá</div>;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {reviews.map(review => (
        <ReviewItem key={review.id} review={review} />
      ))}
    </div>
  );
}
