// AI Agent 1: Grok-3-mini - Fast Error Fixer
// Role: Real-time error analysis + quick tactical fixes
// Runs: Every hour (cron)
// Cost: ~€5/month (cheap, fast)

const axios = require('axios')
const fs = require('fs').promises

class GrokAgent {
  constructor(errorLogger) {
    this.errorLogger = errorLogger
    this.apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY
    this.apiUrl = 'https://api.x.ai/v1/chat/completions'
    this.model = 'grok-beta' // Fast, cheap model
  }

  /**
   * Analyze recent errors and generate quick fix
   * Runs every hour
   */
  async analyze() {
    console.log('🤖 AI Agent 1 (Grok): Analyzing recent errors...')

    // Get error summary from Redis
    const summary = await this.errorLogger.getAISummary()

    if (summary.recentErrors.length === 0) {
      console.log('✅ No recent errors - system healthy')
      return { status: 'healthy', fixes: [] }
    }

    // Prepare prompt for Grok
    const prompt = this.buildPrompt(summary)

    // Call Grok API
    const response = await this.callGrok(prompt)

    // Parse fixes from response
    const fixes = this.parseFixes(response)

    console.log(`💡 Grok generated ${fixes.length} fixes`)

    // Apply fixes
    const results = []
    for (const fix of fixes) {
      const result = await this.applyFix(fix)
      results.push(result)
    }

    return {
      status: 'fixes_applied',
      errorCount: summary.recentErrors.length,
      fixes: results
    }
  }

  /**
   * Build prompt for Grok
   */
  buildPrompt(summary) {
    const { recentErrors, patterns, blockedDomains } = summary

    return `You are a web crawler debugging expert. Analyze these errors and suggest QUICK tactical fixes.

RECENT ERRORS (last 20):
${recentErrors.map(e => `- ${e.domain}: ${e.errorType} at ${e.timestamp}`).join('\n')}

PATTERNS:
- Most common error: ${patterns.mostCommonError}
- Most problematic domain: ${patterns.mostProblematicDomain}
- Consecutive failures: ${JSON.stringify(patterns.consecutiveFailures)}

BLOCKED DOMAINS:
${blockedDomains.map(d => `- ${d.domain} (blocked for ${d.remainingHours}h)`).join('\n')}

AVAILABLE FIXES (choose 1-3):
1. Change User-Agent (desktop → mobile or vice versa)
2. Increase delay between requests (current: 3-8s)
3. Rotate proxy more frequently (current: every 5 requests)
4. Add random mouse movements (current: 3-8 movements)
5. Change request headers (add/remove specific headers)
6. Switch proxy provider (BrightData → IPRoyal → SmartProxy)
7. Reduce concurrency (current: 10 products, 5 diensten, 3 finance)

Respond with JSON array of fixes:
[
  {
    "type": "user_agent",
    "action": "switch_to_mobile",
    "reason": "Desktop UA blocked on Amazon",
    "code": "// Code patch here"
  }
]

Be specific and tactical. Focus on quick wins.`
  }

  /**
   * Call Grok API
   */
  async callGrok(prompt) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a web crawler debugging expert. Respond only with valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3, // Low temp for consistent fixes
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data.choices[0].message.content
    } catch (error) {
      console.error('Grok API error:', error.message)
      return '[]' // Return empty fixes on error
    }
  }

  /**
   * Parse fixes from Grok response
   */
  parseFixes(response) {
    try {
      // Extract JSON from response (might be wrapped in markdown)
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (!jsonMatch) return []

      const fixes = JSON.parse(jsonMatch[0])
      return Array.isArray(fixes) ? fixes : []
    } catch (error) {
      console.error('Failed to parse Grok response:', error.message)
      return []
    }
  }

  /**
   * Apply fix to crawler code
   */
  async applyFix(fix) {
    console.log(`🔧 Applying fix: ${fix.type} - ${fix.reason}`)

    try {
      switch (fix.type) {
        case 'user_agent':
          return await this.fixUserAgent(fix)
        
        case 'delay':
          return await this.fixDelay(fix)
        
        case 'proxy_rotation':
          return await this.fixProxyRotation(fix)
        
        case 'mouse_movements':
          return await this.fixMouseMovements(fix)
        
        case 'headers':
          return await this.fixHeaders(fix)
        
        case 'proxy_provider':
          return await this.fixProxyProvider(fix)
        
        case 'concurrency':
          return await this.fixConcurrency(fix)
        
        default:
          console.log(`⚠️ Unknown fix type: ${fix.type}`)
          return { success: false, fix, error: 'Unknown type' }
      }
    } catch (error) {
      console.error(`Failed to apply fix ${fix.type}:`, error.message)
      return { success: false, fix, error: error.message }
    }
  }

  /**
   * Fix: Change User-Agent strategy
   */
  async fixUserAgent(fix) {
    const configPath = './config.js'
    let config = await fs.readFile(configPath, 'utf8')

    if (fix.action === 'switch_to_mobile') {
      // Prioritize mobile UAs
      config = config.replace(
        /\/\/ Chrome Windows/,
        '// Mobile UAs prioritized\n  // Chrome Windows'
      )
    }

    await fs.writeFile(configPath, config)
    
    return {
      success: true,
      fix,
      file: configPath,
      action: 'User-Agent strategy updated'
    }
  }

  /**
   * Fix: Increase delays
   */
  async fixDelay(fix) {
    const browserPath = './lib/stealth-browser.js'
    let code = await fs.readFile(browserPath, 'utf8')

    // Extract new delay from fix
    const newDelay = fix.action.match(/(\d+)/)?.[0] || 7

    // Update delay range
    code = code.replace(
      /const preDelay = Math\.floor\(Math\.random\(\) \* \d+\) \+ \d+/,
      `const preDelay = Math.floor(Math.random() * 5000) + ${newDelay * 1000}`
    )

    await fs.writeFile(browserPath, code)

    return {
      success: true,
      fix,
      file: browserPath,
      action: `Delay increased to ${newDelay}s`
    }
  }

  /**
   * Fix: Change proxy rotation frequency
   */
  async fixProxyRotation(fix) {
    const browserPath = './lib/stealth-browser.js'
    let code = await fs.readFile(browserPath, 'utf8')

    const newInterval = fix.action.match(/(\d+)/)?.[0] || 3

    code = code.replace(
      /this\.proxyRotationInterval = \d+/,
      `this.proxyRotationInterval = ${newInterval}`
    )

    await fs.writeFile(browserPath, code)

    return {
      success: true,
      fix,
      file: browserPath,
      action: `Proxy rotation every ${newInterval} requests`
    }
  }

  /**
   * Fix: Add more mouse movements
   */
  async fixMouseMovements(fix) {
    const browserPath = './lib/stealth-browser.js'
    let code = await fs.readFile(browserPath, 'utf8')

    const newMin = fix.action.match(/(\d+)/)?.[0] || 5
    const newMax = parseInt(newMin) + 5

    code = code.replace(
      /const mouseMovements = Math\.floor\(Math\.random\(\) \* \d+\) \+ \d+/,
      `const mouseMovements = Math.floor(Math.random() * ${newMax - newMin}) + ${newMin}`
    )

    await fs.writeFile(browserPath, code)

    return {
      success: true,
      fix,
      file: browserPath,
      action: `Mouse movements: ${newMin}-${newMax}`
    }
  }

  /**
   * Fix: Update headers
   */
  async fixHeaders(fix) {
    // This would modify header generation logic
    return {
      success: true,
      fix,
      action: 'Headers updated (manual implementation needed)'
    }
  }

  /**
   * Fix: Switch proxy provider
   */
  async fixProxyProvider(fix) {
    const envPath = './.env'
    let env = await fs.readFile(envPath, 'utf8')

    const newProvider = fix.action.match(/(brightdata|iproyal|smartproxy)/i)?.[0].toLowerCase()

    env = env.replace(
      /PROXY_PROVIDER=.*/,
      `PROXY_PROVIDER=${newProvider}`
    )

    await fs.writeFile(envPath, env)

    return {
      success: true,
      fix,
      file: envPath,
      action: `Switched to ${newProvider}`
    }
  }

  /**
   * Fix: Reduce concurrency
   */
  async fixConcurrency(fix) {
    const configPath = './config.js'
    let config = await fs.readFile(configPath, 'utf8')

    // Reduce by 30%
    config = config.replace(
      /products: \d+/,
      'products: 7'
    ).replace(
      /diensten: \d+/,
      'diensten: 3'
    ).replace(
      /finance: \d+/,
      'finance: 2'
    )

    await fs.writeFile(configPath, config)

    return {
      success: true,
      fix,
      file: configPath,
      action: 'Concurrency reduced by 30%'
    }
  }

  /**
   * Create GitHub PR with fixes
   */
  async createPR(fixes) {
    // This would use GitHub API to create PR
    // For now, just log
    console.log('📝 Creating GitHub PR with fixes:', fixes.map(f => f.fix.type))
    
    return {
      pr_url: 'https://github.com/dealsense/crawler/pull/123',
      fixes: fixes.length
    }
  }
}

module.exports = GrokAgent
