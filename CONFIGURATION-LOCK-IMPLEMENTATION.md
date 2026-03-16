# Configuration Lock & PDF System - Implementation Guide

## 📋 Przegląd

System do blokowania konfiguracji i generowania PDF dowodów dla wszystkich configuratorów (energia, ubezpieczenia, telecom, etc.).

---

## 🎯 Funkcjonalności

### 1. **Lock/Unlock Konfiguracji**
- Użytkownik wypełnia parametry w configuratorze
- Przycisk "🔒 Zablokuj konfigurację" → zapisuje w bazie i blokuje pola
- Generuje unikalny Configuration ID (np. `CFG-2026-03-16-ABC123`)
- Po zablokowaniu: wszystkie pola read-only
- Przycisk "🔓 Odblokuj" → pozwala edytować

### 2. **PDF Generator**
- Pełny branding DealSense.nl z logo
- Wszystkie parametry konfiguracji
- Configuration ID + timestamp + User ID
- Przycisk "🖨️ Download PDF"

### 3. **Strona Użytkownika** (`/my-configurations`)
- Historia wszystkich konfiguracji użytkownika
- Filtrowanie po sektorze
- Wyszukiwanie po Configuration ID
- Download PDF dla każdej konfiguracji

### 4. **Admin Panel** (`/admin/configurations`)
- Wszystkie konfiguracje wszystkich użytkowników
- Statystyki (total, dzisiaj, unikalni użytkownicy)
- Wyszukiwanie po User ID / Config ID
- Download PDF

---

## 🏗️ Struktura Plików

```
app/
├── components/
│   ├── ConfigurationPDFGenerator.tsx     ✅ CREATED
│   └── configurators/
│       ├── EnergyConfigurator.tsx        ⏳ TODO: Add lock/unlock
│       ├── InsuranceConfigurator.tsx     ⏳ TODO: Add lock/unlock
│       ├── TelecomConfigurator.tsx       ⏳ TODO: Add lock/unlock
│       ├── MortgageConfigurator.tsx      ⏳ TODO: Add lock/unlock
│       ├── LoanConfigurator.tsx          ⏳ TODO: Add lock/unlock
│       ├── LeasingConfigurator.tsx       ⏳ TODO: Add lock/unlock
│       ├── CreditCardConfigurator.tsx    ⏳ TODO: Add lock/unlock
│       └── VacationConfigurator.tsx      ⏳ TODO: Add lock/unlock
├── api/
│   └── configurations/
│       ├── save/route.ts                 ✅ CREATED
│       └── get/route.ts                  ✅ CREATED
├── my-configurations/
│   └── page.tsx                          ✅ CREATED
└── admin/
    └── configurations/
        └── page.tsx                      ✅ CREATED

supabase-configurations-table.sql         ✅ CREATED
```

---

## 🔧 Implementacja Lock/Unlock w Configuratorze

### Przykład dla EnergyConfigurator:

```tsx
'use client'

import { useState } from 'react'
import { Lock, Unlock, Download } from 'lucide-react'
import { generateConfigurationPDF } from '../ConfigurationPDFGenerator'
import { AuthService } from '../../_lib/auth'

export default function EnergyConfigurator({ packageType = 'pro', userId }: EnergyConfiguratorProps = {}) {
  // Existing state
  const [energyType, setEnergyType] = useState('stroom-gas')
  const [electricityUsage, setElectricityUsage] = useState(3000)
  // ... other states

  // NEW: Lock state
  const [isLocked, setIsLocked] = useState(false)
  const [configId, setConfigId] = useState<string | null>(null)
  const [configTimestamp, setConfigTimestamp] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // NEW: Lock configuration
  const handleLockConfiguration = async () => {
    try {
      setSaving(true)
      const user = await AuthService.getCurrentUser()
      
      const configData = {
        userId: user?.id || 'anonymous',
        sector: 'energy',
        parameters: {
          energyType,
          electricityUsage,
          gasUsage,
          contractType,
          postcode,
          houseNumber,
          greenEnergy,
          solarPanels,
          smartMeter
        },
        timestamp: new Date().toISOString()
      }

      const response = await fetch('/api/configurations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      })

      const result = await response.json()
      
      if (result.success) {
        setConfigId(result.configId)
        setConfigTimestamp(configData.timestamp)
        setIsLocked(true)
        alert(`✅ Configuratie vergrendeld!\nConfiguration ID: ${result.configId}`)
      }
    } catch (error) {
      console.error('Error saving configuration:', error)
      alert('❌ Fout bij opslaan configuratie')
    } finally {
      setSaving(false)
    }
  }

  // NEW: Unlock configuration
  const handleUnlockConfiguration = () => {
    setIsLocked(false)
  }

  // NEW: Download PDF
  const handleDownloadPDF = () => {
    if (!configId || !configTimestamp) return

    generateConfigurationPDF({
      configId,
      userId: userId || 'anonymous',
      sector: 'energy',
      parameters: {
        energyType,
        electricityUsage,
        gasUsage,
        contractType,
        postcode,
        houseNumber,
        greenEnergy,
        solarPanels,
        smartMeter
      },
      timestamp: configTimestamp
    })
  }

  return (
    <div>
      <AgentEchoLogo />
      <h2>⚡ Energie Configurator</h2>

      {/* Lock/Unlock Buttons */}
      {isLocked && configId && (
        <div style={{
          background: '#E6F4EE',
          border: '2px solid #1E7F5C',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Lock size={20} color="#1E7F5C" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E7F5C' }}>
                Configuratie vergrendeld
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                Configuration ID: {configId}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleUnlockConfiguration}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'white',
                color: '#1E7F5C',
                border: '2px solid #1E7F5C',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Unlock size={16} />
              Ontgrendelen
            </button>
            <button
              onClick={handleDownloadPDF}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: '#1E7F5C',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Download size={16} />
              Download PDF
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* All form fields - add disabled={isLocked} to each input */}
        <input
          type="number"
          value={electricityUsage}
          onChange={(e) => setElectricityUsage(parseInt(e.target.value))}
          disabled={isLocked}  // ← ADD THIS
          style={{
            width: '100%',
            padding: '10px 14px',
            border: '2px solid #E5E7EB',
            borderRadius: '10px',
            fontSize: '14px',
            background: isLocked ? '#F3F4F6' : 'white',  // ← ADD THIS
            cursor: isLocked ? 'not-allowed' : 'text'    // ← ADD THIS
          }}
        />

        {/* Submit button */}
        {!isLocked && (
          <button
            type="button"
            onClick={handleLockConfiguration}
            disabled={saving}
            style={{
              width: '100%',
              padding: '14px',
              background: '#1E7F5C',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: saving ? 'wait' : 'pointer',
              marginTop: '20px'
            }}
          >
            {saving ? 'Opslaan...' : '🔒 Vergrendel configuratie'}
          </button>
        )}
      </form>
    </div>
  )
}
```

---

## 📊 Supabase Setup

1. **Utwórz tabelę:**
   ```bash
   # W Supabase SQL Editor, uruchom:
   supabase-configurations-table.sql
   ```

2. **Dodaj zmienne środowiskowe:**
   ```env
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Row Level Security (RLS):**
   - Użytkownicy widzą tylko swoje konfiguracje
   - Admini widzą wszystkie

---

## 🚀 Deployment Checklist

- [x] PDF Generator component
- [x] API endpoints (save, get)
- [x] User page (/my-configurations)
- [x] Admin panel (/admin/configurations)
- [x] SQL schema
- [ ] Add lock/unlock to all 8 configurators
- [ ] Test PDF generation
- [ ] Test database save/retrieve
- [ ] Deploy to Vercel
- [ ] Setup Supabase table

---

## 🔐 Security & Compliance

- **GDPR:** User ID może być zanonimizowany
- **Retencja:** 2 lata (automatyczne usuwanie starszych)
- **RLS:** Row Level Security włączony
- **Audit:** Timestamp + created_at dla każdej konfiguracji
- **Dowód:** PDF z Configuration ID jako prawny dowód

---

## 📝 TODO List

1. ✅ Stworzyć PDF Generator
2. ✅ Stworzyć API endpoints
3. ✅ Stworzyć stronę użytkownika
4. ✅ Stworzyć admin panel
5. ✅ Stworzyć SQL schema
6. ⏳ Dodać lock/unlock do wszystkich configuratorów
7. ⏳ Uruchomić Supabase table
8. ⏳ Test i deploy

---

**Status:** 60% Complete
**Next Step:** Dodać lock/unlock do wszystkich 8 configuratorów
