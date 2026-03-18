/**
 * Custom Hook - Configuration Lock
 * 
 * Gedeelde logica voor alle configurators (9 bestanden)
 * Elimineert ~800 regels gedupliceerde code
 */

import { useState } from 'react'
import { generateConfigurationPDF } from '../../components/ConfigurationPDFGenerator'

interface UseConfigurationLockProps {
  userId: string
  sector: string
}

interface ConfigurationData {
  configId: string
  timestamp: string
}

export function useConfigurationLock({ userId, sector }: UseConfigurationLockProps) {
  const [isLocked, setIsLocked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [configId, setConfigId] = useState('')
  const [configTimestamp, setConfigTimestamp] = useState('')

  /**
   * Lock configuration - save to backend
   */
  const handleLockConfiguration = async (parameters: any): Promise<boolean> => {
    try {
      setSaving(true)
      
      // Generate unique Configuration ID
      const timestamp = Date.now()
      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase()
      const sectorPrefix = sector.substring(0, 3).toUpperCase()
      const generatedConfigId = `${sectorPrefix}-${new Date().getFullYear()}-${randomSuffix}-${timestamp.toString().slice(-6)}`
      
      const configData = {
        configId: generatedConfigId,
        userId: userId || 'anonymous',
        sector,
        parameters,
        timestamp: new Date().toISOString()
      }

      const response = await fetch('/api/configurations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      })

      const result = await response.json()
      
      if (result.success) {
        setConfigId(generatedConfigId)
        setConfigTimestamp(configData.timestamp)
        setIsLocked(true)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error saving configuration:', error)
      return false
    } finally {
      setSaving(false)
    }
  }

  /**
   * Unlock configuration - allow editing
   */
  const handleUnlockConfiguration = () => {
    setIsLocked(false)
  }

  /**
   * Download PDF - generate configuration PDF
   */
  const handleDownloadPDF = (parameters: any) => {
    if (!configId || !configTimestamp) {
      console.error('No configuration to download')
      return
    }

    generateConfigurationPDF({
      configId,
      userId: userId || 'anonymous',
      sector,
      parameters,
      timestamp: configTimestamp
    })
  }

  return {
    isLocked,
    saving,
    configId,
    configTimestamp,
    handleLockConfiguration,
    handleUnlockConfiguration,
    handleDownloadPDF
  }
}
