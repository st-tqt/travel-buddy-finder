import React from 'react';
import StarRating from './StarRating';

export default function ReviewItem({ review }) {
  return (
    <div className="p-4 border-b bg-white hover:bg-gray-50 transition">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
          {review.reviewerEmail?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{review.reviewerEmail || 'Người dùng'}</p>
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} readonly={true} />
            <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <p className="text-gray-700 ml-13 mt-2">{review.comment}</p>
    </div>
  );
}
