// Helper functions for crawler search API

/**
 * Wait for crawler job to complete
 * Polls job status until done or timeout
 */
export async function waitForCrawlerResults(jobId: string, timeout: number = 30000): Promise<any> {
  const startTime = Date.now()
  const pollInterval = 1000 // Check every 1s

  while (Date.now() - startTime < timeout) {
    try {
      // IMPORTANT: In production, check job status from crawler
      /* 
      const crawler = await import('@/server/crawler/index.js')
      const stats = await crawler.default.getStats()
      
      // Check if job is completed
      const job = await crawler.default.queue.getJob(jobId)
      
      if (job && await job.isCompleted()) {
        return await job.returnvalue
      }
      
      if (job && await job.isFailed()) {
        throw new Error('Crawler job failed')
      }
      */

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval))
    } catch (error) {
      console.error('[Wait Crawler Error]', error)
      throw error
    }
  }

  throw new Error('Crawler timeout - results not ready within 30s')
}

/**
 * Get scan count from storage
 */
export async function getScanCountFromDB(userId: string): Promise<number> {
  // IMPORTANT: In production, query Supabase
  /* 
  const { data, error } = await supabase
    .from('user_scans')
    .select('count')
    .eq('user_id', userId)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    throw error
  }
  
  return data?.count || 0
  */

  // MOCK: Return 0 for now (will be tracked client-side)
  return 0
}

/**
 * Increment scan count in storage
 */
export async function incrementScanCountInDB(userId: string): Promise<void> {
  // IMPORTANT: In production, increment in Supabase
  /* 
  const currentCount = await getScanCountFromDB(userId)
  
  await supabase
    .from('user_scans')
    .upsert({
      user_id: userId,
      count: currentCount + 1,
      last_scan_at: new Date().toISOString()
    })
  */

  // MOCK: No-op for now
}

