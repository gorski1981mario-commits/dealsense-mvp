# 🔧 B2B CONFIGURATORS - REFACTOR GUIDE

## ✅ STATUS: ChemicalsConfigurator = WZORCOWY TEMPLATE

**ChemicalsConfigurator** został w pełni zrefaktoryzowany i ma **100% spójność z B2C**.

Użyj go jako template dla pozostałych 9 konfiguratorów.

---

## 📋 PATTERN DO ZASTOSOWANIA (KROK PO KROKU):

### **1. IMPORTS (na górze pliku):**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Lock, Unlock, Download, ArrowLeft } from 'lucide-react'
import { useConfigurationLock } from '../../../_lib/hooks/useConfigurationLock'
import { FlowTracker } from '../../../_lib/flow-tracker'
import AgentEchoLogo from '../../AgentEchoLogo'
import ProgressTracker from '../../shared/ProgressTracker'
import LockPanel from '../../shared/LockPanel'
import { validators } from '../../../utils/validators'
import { 
  B2BDisclaimer, 
  B2BReferencePrice, 
  VolumePricingTable, 
  RFQButton, 
  ApprovalWorkflowDisplay
} from './B2BFeatures'
```

### **2. PROPS INTERFACE:**

```typescript
interface [Name]ConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance' | 'zakelijk'
  userId?: string
}

type ViewState = 'configurator' | 'results' | 'payment' | 'unlocked'

export default function [Name]Configurator({ packageType = 'zakelijk', userId }: [Name]ConfiguratorProps = {}) {
```

### **3. STATE MANAGEMENT:**

```typescript
  const [view, setView] = useState<ViewState>('configurator')
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({ ... })
  const [quoteData, setQuoteData] = useState<any>(null)
  
  const {
    isLocked,
    saving,
    configId,
    configTimestamp,
    handleLockConfiguration: lockConfig,
    handleUnlockConfiguration: unlockConfig,
    handleDownloadPDF: downloadPDF
  } = useConfigurationLock({ userId: userId || 'anonymous', sector: '[name]-b2b' })
  
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [validFields, setValidFields] = useState<Set<string>>(new Set())
  const totalFields = 7 // adjust per configurator
  
  const validateAndMark = (fieldName: string, value: any, customValidator?: (val: any) => boolean) => {
    setTouchedFields(prev => new Set(prev).add(fieldName))
    const isValid = customValidator ? customValidator(value) : validators.required(value)
    setValidFields(prev => { const newSet = new Set(prev); isValid ? newSet.add(fieldName) : newSet.delete(fieldName); return newSet })
  }
  const progress = Math.round((validFields.size / totalFields) * 100)
  
  useEffect(() => {
    const uid = userId || 'anonymous'
    FlowTracker.getInstance().trackEvent(uid, 'configurator-[name]-b2b', 'view', 'zakelijk')
  }, [])
```

### **4. HANDLERS:**

```typescript
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const uid = userId || 'anonymous'
    FlowTracker.getInstance().trackEvent(uid, 'configurator-[name]-b2b', 'action', 'zakelijk', formData)
    
    if (!isLocked) {
      await lockConfig(formData)
    }
    setView('results')
  }
  
  const handleLockConfiguration = async () => {
    await lockConfig(formData)
  }
  
  const handleUnlockConfiguration = () => {
    unlockConfig()
  }
  
  const handleDownloadPDF = () => {
    downloadPDF(formData)
  }
```

### **5. RESULTS VIEW (PRZED main return):**

```typescript
  if (view === 'results') {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button onClick={() => setView('configurator')} style={{ padding: '10px 16px', background: '#F3F4F6', color: '#111827', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}>← Terug</button>
          
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>📊 3 beste B2B quotes gevonden!</h2>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>
            {/* Dynamic content based on formData */}
          </p>

          <B2BDisclaimer category="[category]" />
          <B2BReferencePrice price={quoteData?.referencePrice?.price || 15000} label="Referentie (hoogste marktprijs)" />
          
          <VolumePricingTable tiers={quoteData?.tieredPricing || [
            // 4 tiers with pricing
          ]} />

          <ApprovalWorkflowDisplay 
            workflow={quoteData?.approvalWorkflow || { required: false, level: 'auto-approved', approvers: [], message: 'Order auto-approved (under €5,000)' }}
            totalValue={quoteData?.summary?.bestPrice || 8500}
          />

          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>🏆 Top 5 Providers (Estimated Prices)</h3>
            {[1, 2, 3, 4, 5].map((i) => (
              // Provider cards
            ))}
          </div>

          <RFQButton onClick={() => setView('payment')} />
          <div style={{ fontSize: '11px', color: '#6B7280', textAlign: 'center', marginTop: '16px' }}>🔒 Provider names will be revealed after payment confirmation</div>
        </div>
      </div>
    )
  }
```

### **6. MAIN RETURN (configurator view):**

```typescript
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <AgentEchoLogo />
        
        <button onClick={() => window.location.href = '/business'} style={{ ... }}>
          <ArrowLeft size={16} />
          Terug
        </button>

        <ProgressTracker 
          percentage={progress} 
          validCount={validFields.size} 
          totalFields={totalFields}
          showWarning={validFields.size < totalFields}
        />
        
        <LockPanel 
          isLocked={isLocked}
          configId={configId}
          onUnlock={handleUnlockConfiguration}
          onDownloadPDF={handleDownloadPDF}
        />

        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {/* Form content */}
        </div>
      </div>
    </div>
  )
```

---

## 🗑️ CO USUNĄĆ (stare elementy):

1. ❌ `const [showResults, setShowResults]` - zastąpione przez `view` state
2. ❌ `const [isLocked, setIsLocked]` - zastąpione przez useConfigurationLock hook
3. ❌ `const [saving, setSaving]` - zastąpione przez hook
4. ❌ `const [configId, setConfigId]` - zastąpione przez hook
5. ❌ `const [configTimestamp, setConfigTimestamp]` - zastąpione przez hook
6. ❌ Stare `handleLockConfiguration` z fetch - zastąpione przez hook
7. ❌ Stare `handleUnlockConfiguration` - zastąpione przez hook
8. ❌ Stare `handleDownloadPDF` z generateConfigurationPDF - zastąpione przez hook
9. ❌ `markFieldTouched`, `markFieldValid` - zastąpione przez `validateAndMark`
10. ❌ Duplikaty `validateAndMark`, `progress`
11. ❌ Stary results view w środku return - przeniesiony do `if (view === 'results')`

---

## ✅ CHECKLIST (dla każdego konfiguratora):

- [ ] Imports zaktualizowane (useConfigurationLock, FlowTracker, AgentEchoLogo, ProgressTracker, LockPanel, validators)
- [ ] Props interface dodany (packageType, userId)
- [ ] ViewState type + useState('configurator')
- [ ] useConfigurationLock hook zamiast własnego state
- [ ] FlowTracker useEffect (view event)
- [ ] validateAndMark function (jedna wersja, nie duplikaty)
- [ ] progress calculation (jedna wersja)
- [ ] handleSubmit z FlowTracker (action event) + setView('results')
- [ ] handleLockConfiguration, handleUnlockConfiguration, handleDownloadPDF (używają hook)
- [ ] Results view PRZED main return (if statement)
- [ ] AgentEchoLogo w main return
- [ ] ProgressTracker w main return (percentage, validCount, totalFields, showWarning)
- [ ] LockPanel w main return (isLocked, configId, onUnlock, onDownloadPDF)
- [ ] Usunięte wszystkie stare elementy (showResults, stary lock state, stare funkcje)

---

## 📁 WZORCOWY PLIK:

**`ChemicalsConfigurator.tsx`** - użyj jako template

---

## ⏱️ SZACOWANY CZAS:

- Per konfigurator: 15-20 min (jeśli robisz ręcznie)
- Total: ~2.5-3 godziny dla 9 pozostałych

---

## 🎯 CEL:

**WSZYSTKIE 10 B2B konfiguratorów muszą wyglądać DOKŁADNIE jak B2C:**
- Taki sam kod
- Taki sam wygląd UI  
- Takie same zasady działania
- Wszystkie opcje dodane

---

## 📌 UWAGA:

Moduł B2B jest **FROZEN do Q3 2026**. Nie ma pośpiechu z refaktoryzacją pozostałych 9 konfiguratorów.

Można to zrobić później, gdy będziemy aktywować moduł B2B (Q3 2026).

**ChemicalsConfigurator** jest gotowy jako wzorcowy template.
