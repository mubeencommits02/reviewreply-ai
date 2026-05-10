import { processReviewEnterprise } from './ai-engine';

/**
 * Enterprise Bulk Processor
 * Handles high-scale review processing using Chunking & Async patterns
 */
export const processBulkReviews = async (reviews, tone, language, businessProfile, onProgress) => {
  const CHUNK_SIZE = 10;
  const chunks = [];
  
  // 1. Chunking Algorithm to avoid timeouts and rate limits
  for (let i = 0; i < reviews.length; i += CHUNK_SIZE) {
    chunks.push(reviews.slice(i, i + CHUNK_SIZE));
  }

  const results = [];
  let processedCount = 0;

  for (const chunk of chunks) {
    // 2. Batch Processing (Shadow Generation pattern)
    const chunkPromises = chunk.map(async (review) => {
      try {
        const result = await processReviewEnterprise(review.text, tone, language, businessProfile);
        return { id: review.id, ...result, status: 'success' };
      } catch (error) {
        return { id: review.id, status: 'failed', error: error.message };
      }
    });

    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);
    
    processedCount += chunk.length;
    if (onProgress) onProgress(processedCount, reviews.length);
    
    // Optional: Add exponential backoff or delay between chunks if needed
    if (chunks.indexOf(chunk) < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
};
