'use client'

import { useState, useEffect } from 'react'
import { Lock, Unlock, Download } from 'lucide-react'
import AgentEchoLogo from '../AgentEchoLogo'
import { generateConfigurationPDF } from '../ConfigurationPDFGenerator'
import ProgressTracker from '../shared/ProgressTracker'
import LockPanel from '../shared/LockPanel'
import FilterOptions, { FilterType } from '../shared/FilterOptions'
import { validators } from '../../utils/validators'

interface LoanConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance'
  userId?: string
}

export default function LoanConfigurator({ packageType = 'pro', userId }: LoanConfiguratorProps = {}) {
  const [filterType, setFilterType] = useState<FilterType | ''>('')
  const [amount, setAmount] = useState<number | ''>('')
  const [duration, setDuration] = useState<number | ''>('')
  const [purpose, setPurpose] = useState('')
  const [income, setIncome] = useState<number | ''>('')
  const [employmentType, setEmploymentType] = useState('')
  const [bkr, setBkr] = useState(false)
  const [coApplicant, setCoApplicant] = useState(false)
  const [homeOwner, setHomeOwner] = useState(false)
  const [searching, setSearching] = useState(false)
  
  const [isLocked, setIsLocked] = useState(false)
  const [configId, setConfigId] = useState<string | null>(null)
  const [configTimestamp, setConfigTimestamp] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeField, setActiveField] = useState<string | null>(null)
  
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [validFields, setValidFields] = useState<Set<string>>(new Set())
  const totalFields = 4 // amount, duration, purpose, income
  const validateAndMark = (f: string, v: any, customValidator?: (v: any) => boolean) => { setTouchedFields(p => new Set(p).add(f)); const ok = customValidator ? customValidator(v) : validators.required(v); setValidFields(p => { const n = new Set(p); ok ? n.add(f) : n.delete(f); return n }) }
  const progress = Math.round((validFields.size / totalFields) * 100)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    if (!isLocked) {
      await handleLockConfiguration()
    }
    setTimeout(() => setSearching(false), 3000)
  }

  const handleLockConfiguration = async () => {
    try {
      setSaving(true)
      const configData = { userId: userId || 'anonymous', sector: 'loan', parameters: { amount, duration, purpose, income, employmentType, bkr, coApplicant, homeOwner }, timestamp: new Date().toISOString() }
      const response = await fetch('/api/configurations/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(configData) })
      const result = await response.json()
      if (result.success) { setConfigId(result.configId); setConfigTimestamp(configData.timestamp); setIsLocked(true) }
    } catch (error) { console.error('Error:', error) } finally { setSaving(false) }
  }

  const handleUnlockConfiguration = () => { setIsLocked(false) }

  const handleDownloadPDF = () => {
    if (!configId || !configTimestamp) return
    generateConfigurationPDF({ configId, userId: userId || 'anonymous', sector: 'loan', parameters: { amount, duration, purpose, income, employmentType, bkr, coApplicant, homeOwner }, timestamp: configTimestamp })
  }

  return (
    <div>
      <AgentEchoLogo />
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px', marginTop: '20px' }}>💰 Lening Configurator</h2>

      <ProgressTracker percentage={progress} validCount={validFields.size} totalFields={totalFields} showWarning={validFields.size < totalFields} />
      <LockPanel isLocked={isLocked} configId={configId} onUnlock={handleUnlockConfiguration} onDownloadPDF={handleDownloadPDF} />

      {false && isLocked && configId && (
        <div style={{ background: '#E6F4EE', border: '1px solid #1E7F5C', borderRadius: '8px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Lock size={16} color="#1E7F5C" /><div><div style={{ fontSize: '13px', fontWeight: 600, color: '#1E7F5C' }}>Configuratie opgeslagen</div><div style={{ fontSize: '11px', color: '#6B7280' }}>ID: {configId}</div></div></div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={handleUnlockConfiguration} title="Ontgrendelen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: 'white', border: '2px solid #1E7F5C', borderRadius: '8px', cursor: 'pointer' }}>👆</button>
            <button type="button" onClick={handleDownloadPDF} title="Download PDF" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#1E7F5C', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><Download size={18} color="white" /></button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        {/* 1. LENING DETAILS */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>1. Lening details</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Bedrag (€)</label>
            <input type="number" min="1000" max="75000" step="500" value={amount} onChange={(e) => setAmount(parseInt(e.target.value))} disabled={isLocked} placeholder="10000" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : 'white', cursor: isLocked ? 'not-allowed' : 'text' }} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Looptijd (maanden)</label>
            <input type="number" min="12" max="120" step="12" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} disabled={isLocked} placeholder="60" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : 'white', cursor: isLocked ? 'not-allowed' : 'text' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Doel van de lening</label>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)} disabled={isLocked} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : 'white', cursor: isLocked ? 'not-allowed' : 'pointer' }}>
              <option value="verbouwing">🏗️ Verbouwing/renovatie</option>
              <option value="auto">🚗 Auto aankoop</option>
              <option value="studie">🎓 Studie/opleiding</option>
              <option value="schuld">💳 Schulden samenvoegen</option>
              <option value="bruiloft">💍 Bruiloft</option>
              <option value="vakantie">✈️ Vakantie</option>
              <option value="vrij">🎯 Vrij te besteden</option>
            </select>
          </div>
        </div>

        {/* 2. PERSOONLIJKE SITUATIE */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>2. Persoonlijke situatie</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Bruto jaarinkomen (€)</label>
            <input type="number" min="15000" max="150000" step="5000" value={income} onChange={(e) => setIncome(parseInt(e.target.value))} placeholder="40000" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Type dienstverband</label>
            <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }}>
              <option value="vast">💼 Vast contract</option>
              <option value="tijdelijk">📄 Tijdelijk contract</option>
              <option value="zzp">👨‍💻 ZZP/Zelfstandige</option>
              <option value="pensioen">👴 Pensioen/AOW</option>
              <option value="uitkering">💵 Uitkering</option>
            </select>
          </div>
        </div>

        {/* 3. EXTRA INFORMATIE */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>3. Extra informatie</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[{value: bkr, setter: setBkr, label: '⚠️ BKR registratie', desc: 'Ik heb een BKR-registratie'}, {value: coApplicant, setter: setCoApplicant, label: '👥 Mede-aanvrager', desc: 'Ik vraag samen met partner aan'}, {value: homeOwner, setter: setHomeOwner, label: '🏠 Eigen woning', desc: 'Ik ben eigenaar van een woning'}].map((item, i) => (
              <div key={i} onClick={() => item.setter(!item.value)} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', background: item.value ? '#E6F4EE' : 'white', borderColor: item.value ? '#1E7F5C' : '#E5E7EB' }}>
                <input type="checkbox" checked={item.value} onChange={() => item.setter(!item.value)} style={{ width: '16px', height: '16px', cursor: 'pointer', marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {(!amount || !duration || !purpose || !income) && (
          <div style={{ padding: '12px', background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: '#92400e' }}>💡 <strong>Tip:</strong> Vul bedrag, looptijd, doel en inkomen in voor nauwkeurige aanbiedingen!</div>
          </div>
        )}

        <button type="submit" disabled={isLocked} style={{ width: '100%', padding: '14px', background: isLocked ? '#9ca3af' : 'linear-gradient(135deg, #1E7F5C 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: isLocked ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>
          {isLocked ? 'Configuratie vergrendeld' : 'Vergelijk leningen →'}
        </button>
        {isLocked && <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '12px', color: '#6B7280' }}>👆 Klik op het vinger-icoon hierboven om te wijzigen</div>}
      </form>

      {searching && (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px', padding: '24px', textAlign: 'center', marginTop: '20px' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #15803d', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#166534', fontSize: '15px' }}>Echo zoekt de beste leningen voor je...</p>
        </div>
      )}
      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
