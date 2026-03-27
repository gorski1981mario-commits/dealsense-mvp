/**
 * CROWDSOURCING SYSTEM
 * "Wrzuć recenzję, dostaniesz 1€ kredytu"
 * 
 * WIZJA: DealSense Truth Database - budowana przez użytkowników
 */

const { cacheSet, cacheGet } = require('./cache');

/**
 * Submit user review - get 1€ credit
 */
async function submitUserReview(userId, reviewData) {
  const { 
    identifier,    // EAN, product name, service name
    category,      // electronics, home, health, etc.
    rating,        // 1-5
    text,          // Review text (min 50 chars)
    pros,          // Array of pros
    cons,          // Array of cons
    verified       // Verified purchase? (optional)
  } = reviewData;
  
  // Validation
  if (!text || text.length < 50) {
    throw new Error('Review text must be at least 50 characters');
  }
  
  if (!rating || rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  // Check if user already reviewed this item
  const existingKey = `user_review:${userId}:${identifier}`;
  const existing = await cacheGet(existingKey);
  
  if (existing) {
    throw new Error('You already reviewed this item');
  }
  
  // Save review
  const review = {
    userId,
    identifier,
    category,
    rating,
    text,
    pros: pros || [],
    cons: cons || [],
    verified: verified || false,
    source: 'dealsense_user',
    date: new Date().toISOString(),
    upvotes: 0,
    downvotes: 0,
    helpful_count: 0
  };
  
  // Store in database (Redis for now, later PostgreSQL)
  const reviewKey = `review:${category}:${identifier}:${userId}`;
  await cacheSet(reviewKey, review, 365 * 24 * 60 * 60); // 1 year
  
  // Mark user as reviewed
  await cacheSet(existingKey, true, 365 * 24 * 60 * 60);
  
  // Add to user's reviews list
  const userReviewsKey = `user_reviews:${userId}`;
  const userReviews = await cacheGet(userReviewsKey) || [];
  userReviews.push(reviewKey);
  await cacheSet(userReviewsKey, userReviews, 365 * 24 * 60 * 60);
  
  // Give 1€ credit
  await giveCredit(userId, 1.00, 'review_submitted', identifier);
  
  console.log(`[Crowdsourcing] User ${userId} submitted review for ${identifier} - 1€ credit awarded`);
  
  return {
    success: true,
    credit_awarded: 1.00,
    review_id: reviewKey,
    message: 'Bedankt! Je hebt €1 krediet ontvangen.'
  };
}

/**
 * Give credit to user
 */
async function giveCredit(userId, amount, reason, reference = null) {
  const creditKey = `user_credit:${userId}`;
  const currentCredit = await cacheGet(creditKey) || 0;
  const newCredit = currentCredit + amount;
  
  await cacheSet(creditKey, newCredit, 365 * 24 * 60 * 60);
  
  // Log transaction
  const transactionKey = `credit_transaction:${userId}:${Date.now()}`;
  await cacheSet(transactionKey, {
    userId,
    amount,
    reason,
    reference,
    date: new Date().toISOString(),
    balance_after: newCredit
  }, 365 * 24 * 60 * 60);
  
  return newCredit;
}

/**
 * Get user credit balance
 */
async function getUserCredit(userId) {
  const creditKey = `user_credit:${userId}`;
  return await cacheGet(creditKey) || 0;
}

/**
 * Get user reviews
 */
async function getUserReviews(userId) {
  const userReviewsKey = `user_reviews:${userId}`;
  const reviewKeys = await cacheGet(userReviewsKey) || [];
  
  const reviews = [];
  for (const key of reviewKeys) {
    const review = await cacheGet(key);
    if (review) {
      reviews.push(review);
    }
  }
  
  return reviews;
}

/**
 * Vote on review (helpful/not helpful)
 */
async function voteOnReview(reviewKey, userId, helpful = true) {
  const review = await cacheGet(reviewKey);
  if (!review) {
    throw new Error('Review not found');
  }
  
  // Check if user already voted
  const voteKey = `review_vote:${reviewKey}:${userId}`;
  const existingVote = await cacheGet(voteKey);
  
  if (existingVote) {
    throw new Error('You already voted on this review');
  }
  
  // Update vote counts
  if (helpful) {
    review.helpful_count = (review.helpful_count || 0) + 1;
    review.upvotes = (review.upvotes || 0) + 1;
  } else {
    review.downvotes = (review.downvotes || 0) + 1;
  }
  
  // Save updated review
  await cacheSet(reviewKey, review, 365 * 24 * 60 * 60);
  
  // Mark user as voted
  await cacheSet(voteKey, helpful, 365 * 24 * 60 * 60);
  
  return {
    success: true,
    helpful_count: review.helpful_count,
    upvotes: review.upvotes,
    downvotes: review.downvotes
  };
}

/**
 * Get all user-submitted reviews for item
 */
async function getUserSubmittedReviews(identifier, category) {
  // This would query database in production
  // For now, we'll return empty array (to be implemented with PostgreSQL)
  return [];
}

module.exports = {
  submitUserReview,
  giveCredit,
  getUserCredit,
  getUserReviews,
  voteOnReview,
  getUserSubmittedReviews
};
