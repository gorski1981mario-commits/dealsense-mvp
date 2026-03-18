/**
 * Universal Flow Tracker
 * 
 * Tracking systeem voor alle flows in de applicatie:
 * - Scanner (producten)
 * - Configurators (9 configurators)
 * - Packages (abonnement)
 * - Referrals (verwijzingen)
 * - Bills Optimizer (rekeningen)
 * - Gold Investment (goud)
 * 
 * Functies:
 * 1. Track view/action/purchase voor elke flow
 * 2. Blokkade van lege views (gebruiker kijkt alleen, koopt niet)
 * 3. Conversie metrics
 */

import { PackageType } from './package-access'

export type FlowType = 
  | 'scanner'
  | 'configurator-insurance'
  | 'configurator-energy'
  | 'configurator-telecom'
  | 'configurator-vacation'
  | 'configurator-leasing'
  | 'configurator-mortgage'
  | 'configurator-loan'
  | 'configurator-creditcard'
  | 'configurator-subscriptions'
  | 'package-purchase'
  | 'referral'
  | 'bills-optimizer'
  | 'gold-investment'

export type FlowStage = 'view' | 'action' | 'purchase'

interface FlowEvent {
  userId: string
  flowType: FlowType
  flowId: string
  stage: FlowStage
  timestamp: string
  data: any
}

interface FlowLimits {
  viewsWithoutPurchase: number
  actionsWithoutPurchase: number
}

// Limieten per pakket (anti-misbruik)
const PACKAGE_LIMITS: Record<PackageType, FlowLimits> = {
  free: {
    viewsWithoutPurchase: 3,      // FREE: 3 views max (paywall)
    actionsWithoutPurchase: 3
  },
  plus: {
    viewsWithoutPurchase: 10,     // PLUS: 10 views zonder aankoop
    actionsWithoutPurchase: 10
  },
  pro: {
    viewsWithoutPurchase: 20,     // PRO: 20 views zonder aankoop
    actionsWithoutPurchase: 20
  },
  finance: {
    viewsWithoutPurchase: 30,     // FINANCE: 30 views zonder aankoop
    actionsWithoutPurchase: 30
  }
}

/**
 * Universal Flow Tracker Class (Singleton)
 */
export class FlowTracker {
  private static instance: FlowTracker
  private storageKey = 'dealsense_flow_tracking'

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): FlowTracker {
    if (!FlowTracker.instance) {
      FlowTracker.instance = new FlowTracker()
    }
    return FlowTracker.instance
  }

  /**
   * Track event (unified method)
   */
  trackEvent(
    userId: string,
    flowType: FlowType,
    stage: FlowStage,
    userPackage: PackageType,
    data: any = {}
  ): void {
    const event: FlowEvent = {
      userId,
      flowType,
      flowId: `${flowType}_${Date.now()}`,
      stage,
      timestamp: new Date().toISOString(),
      data: { ...data, package: userPackage }
    }

    const events = this.getFlowEvents(userId)
    events.push(event)
    this.saveFlowEvents(userId, events)

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', `flow_${stage}`, {
        flow_type: flowType,
        package: userPackage
      })
    }
  }

  /**
   * Get all flow events for user
   */
  private getFlowEvents(userId: string): FlowEvent[] {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(`${this.storageKey}_${userId}`)
    return stored ? JSON.parse(stored) : []
  }

  /**
   * Save flow events for user
   */
  private saveFlowEvents(userId: string, events: FlowEvent[]): void {
    if (typeof window === 'undefined') return
    
    localStorage.setItem(`${this.storageKey}_${userId}`, JSON.stringify(events))
  }

  /**
   * Track VIEW - gebruiker heeft resultaten/aanbiedingen bekeken
   */
  async trackView(
    userId: string,
    flowType: FlowType,
    flowId: string,
    data: any = {}
  ): Promise<void> {
    const event: FlowEvent = {
      userId,
      flowType,
      flowId,
      stage: 'view',
      timestamp: new Date().toISOString(),
      data
    }

    const events = this.getFlowEvents(userId)
    events.push(event)
    this.saveFlowEvents(userId, events)

    // TODO: Send to backend analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'flow_view', {
        flow_type: flowType,
        flow_id: flowId
      })
    }
  }

  /**
   * Track ACTION - gebruiker heeft geklikt/ingevuld/verzonden
   */
  async trackAction(
    userId: string,
    flowType: FlowType,
    flowId: string,
    data: any = {}
  ): Promise<void> {
    const event: FlowEvent = {
      userId,
      flowType,
      flowId,
      stage: 'action',
      timestamp: new Date().toISOString(),
      data
    }

    const events = this.getFlowEvents(userId)
    events.push(event)
    this.saveFlowEvents(userId, events)

    // TODO: Send to backend analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'flow_action', {
        flow_type: flowType,
        flow_id: flowId
      })
    }
  }

  /**
   * Track PURCHASE - gebruiker heeft gekocht/bevestigd
   */
  async trackPurchase(
    userId: string,
    flowType: FlowType,
    flowId: string,
    data: any = {}
  ): Promise<void> {
    const event: FlowEvent = {
      userId,
      flowType,
      flowId,
      stage: 'purchase',
      timestamp: new Date().toISOString(),
      data
    }

    const events = this.getFlowEvents(userId)
    events.push(event)
    this.saveFlowEvents(userId, events)

    // Reset teller na aankoop
    this.resetViewsWithoutPurchase(userId, flowType)

    // TODO: Send to backend analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'flow_purchase', {
        flow_type: flowType,
        flow_id: flowId,
        value: data.amount || 0
      })
    }
  }

  /**
   * Check if user can continue (anti-abuse)
   */
  async canContinue(
    userId: string,
    flowType: FlowType,
    userPackage: PackageType
  ): Promise<{ allowed: boolean; reason?: string; viewsLeft?: number }> {
    const limits = PACKAGE_LIMITS[userPackage]
    const viewsWithoutPurchase = this.getViewsWithoutPurchase(userId, flowType)

    if (viewsWithoutPurchase >= limits.viewsWithoutPurchase) {
      return {
        allowed: false,
        reason: `Je hebt ${viewsWithoutPurchase} keer bekeken zonder aankoop. Koop iets om door te gaan.`,
        viewsLeft: 0
      }
    }

    return {
      allowed: true,
      viewsLeft: limits.viewsWithoutPurchase - viewsWithoutPurchase
    }
  }

  /**
   * Get views without purchase for specific flow type
   */
  private getViewsWithoutPurchase(userId: string, flowType: FlowType): number {
    const events = this.getFlowEvents(userId)
    
    // Filter events for this flow type
    const flowEvents = events.filter(e => e.flowType === flowType)
    
    // Get last purchase timestamp
    const lastPurchase = flowEvents
      .filter(e => e.stage === 'purchase')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    
    const lastPurchaseTime = lastPurchase ? new Date(lastPurchase.timestamp).getTime() : 0
    
    // Count views after last purchase
    const viewsAfterPurchase = flowEvents.filter(e => 
      e.stage === 'view' && 
      new Date(e.timestamp).getTime() > lastPurchaseTime
    ).length
    
    return viewsAfterPurchase
  }

  /**
   * Reset views counter after purchase
   */
  private resetViewsWithoutPurchase(userId: string, flowType: FlowType): void {
    // Teller reset automatisch via getViewsWithoutPurchase logica
    // (telt alleen views na laatste aankoop)
  }

  /**
   * Get conversion metrics for user
   */
  async getConversionMetrics(
    userId: string,
    flowType?: FlowType
  ): Promise<{
    views: number
    actions: number
    purchases: number
    viewToActionRate: number
    actionToPurchaseRate: number
    overallConversionRate: number
  }> {
    const events = this.getFlowEvents(userId)
    const filteredEvents = flowType 
      ? events.filter(e => e.flowType === flowType)
      : events

    const views = filteredEvents.filter(e => e.stage === 'view').length
    const actions = filteredEvents.filter(e => e.stage === 'action').length
    const purchases = filteredEvents.filter(e => e.stage === 'purchase').length

    return {
      views,
      actions,
      purchases,
      viewToActionRate: views > 0 ? (actions / views) * 100 : 0,
      actionToPurchaseRate: actions > 0 ? (purchases / actions) * 100 : 0,
      overallConversionRate: views > 0 ? (purchases / views) * 100 : 0
    }
  }

  /**
   * Get warning message when approaching limit
   */
  getWarningMessage(
    viewsLeft: number,
    userPackage: PackageType
  ): string | null {
    if (viewsLeft <= 3 && viewsLeft > 0) {
      return `⚠️ Let op: Je hebt nog ${viewsLeft} gratis bekijken over. Koop iets om je limiet te resetten.`
    }
    return null
  }

  /**
   * Clear all tracking data (for testing)
   */
  clearAllData(userId: string): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(`${this.storageKey}_${userId}`)
  }
}
