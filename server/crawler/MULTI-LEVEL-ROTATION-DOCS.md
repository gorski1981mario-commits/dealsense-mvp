# MULTI-LEVEL ROTATION - MAKSYMALNE UTRUDNIENIE PATTERN LEARNING

## 🎯 CEL: User NIE MOŻE się nauczyć patternu!

---

## 📊 STRATEGIA - 3 POZIOMY ROTACJI:

### **LEVEL 1: 24H CYCLE (Powtarzalny pattern)**
```
Pattern wraca po 24 godzinach
User A, Day 1, 10:00 → Pattern X
User A, Day 2, 10:00 → Pattern Y (inny!)
User A, Day 3, 10:00 → Pattern Z (inny!)
User A, Day 4, 10:00 → Pattern X (wraca!)
```

### **LEVEL 2: GRADUAL ROTATION (100% → 50% → 25% → 100%)**
```
Day 1: 100% rotation (full shuffle)
Day 2: 50% rotation (half shuffle)
Day 3: 25% rotation (quarter shuffle)
Day 4: 100% rotation (full shuffle - wraca!)
```

### **LEVEL 3: HOUR VARIATION (Lekka zmiana co godzinę)**
```
Day 1, 10:00: Beslist, Alternate, Bol
Day 1, 11:00: Beslist, Bol, Alternate (lekka zmiana!)
Day 1, 12:00: Alternate, Beslist, Bol (lekka zmiana!)
```

---

## 🔄 **PRZYKŁAD - 4-DNIOWY CYKL:**

### **User A skanuje iPhone 15 Pro codziennie o 10:00:**

```
┌─────────────────────────────────────────────────────────┐
│ DAY 1 (Monday) 10:00 - INTENSITY 100%                  │
├─────────────────────────────────────────────────────────┤
│ Oferty < €1.299:                                        │
│ Beslist €999, Alternate €1.049, Azerty €1.099,         │
│ Bol €1.189, Coolblue €1.189, Gaming-shop €1.119        │
│                                                         │
│ FULL SHUFFLE (50% szansy):                             │
│ 1. Azerty.nl €1.099 ← Position 3 → 1                   │
│ 2. Beslist.nl €999 ← Position 1 → 2                    │
│ 3. Alternate.nl €1.049 ← Position 2 → 3                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ DAY 2 (Tuesday) 10:00 - INTENSITY 50%                  │
├─────────────────────────────────────────────────────────┤
│ Te same oferty (z cache)                                │
│                                                         │
│ HALF SHUFFLE (tylko 1↔2):                              │
│ 1. Alternate.nl €1.049 ← Swap 1↔2                      │
│ 2. Beslist.nl €999                                      │
│ 3. Azerty.nl €1.099 ← Bez zmian                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ DAY 3 (Wednesday) 10:00 - INTENSITY 25%                │
├─────────────────────────────────────────────────────────┤
│ Te same oferty (z cache)                                │
│                                                         │
│ QUARTER SHUFFLE (tylko 2↔3):                           │
│ 1. Beslist.nl €999 ← Bez zmian                         │
│ 2. Azerty.nl €1.099 ← Swap 2↔3                         │
│ 3. Alternate.nl €1.049                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ DAY 4 (Thursday) 10:00 - INTENSITY 100%                │
├─────────────────────────────────────────────────────────┤
│ Te same oferty (z cache)                                │
│                                                         │
│ FULL SHUFFLE (wraca pattern z Day 1!):                 │
│ 1. Azerty.nl €1.099                                     │
│ 2. Beslist.nl €999                                      │
│ 3. Alternate.nl €1.049                                  │
└─────────────────────────────────────────────────────────┘
```

---

## ⏰ **HOUR VARIATION - Ten sam dzień, różne godziny:**

```
┌─────────────────────────────────────────────────────────┐
│ DAY 1 (Monday) - RÓŻNE GODZINY                         │
├─────────────────────────────────────────────────────────┤
│ 10:00: Azerty €1.099, Beslist €999, Alternate €1.049   │
│ 11:00: Beslist €999, Azerty €1.099, Alternate €1.049   │
│ 12:00: Alternate €1.049, Beslist €999, Azerty €1.099   │
│ 13:00: Azerty €1.099, Alternate €1.049, Beslist €999   │
│ 14:00: Beslist €999, Alternate €1.049, Azerty €1.099   │
│                                                         │
│ EFEKT: Każda godzina = lekka zmiana kolejności!        │
└─────────────────────────────────────────────────────────┘
```

---

## 👥 **RÓŻNI USERZY - Ta sama godzina:**

```
┌─────────────────────────────────────────────────────────┐
│ DAY 1, 10:00 - RÓŻNI USERZY                            │
├─────────────────────────────────────────────────────────┤
│ User A: Azerty €1.099, Beslist €999, Alternate €1.049  │
│ User B: Beslist €999, Alternate €1.049, Azerty €1.099  │
│ User C: Alternate €1.049, Azerty €1.099, Beslist €999  │
│                                                         │
│ EFEKT: Każdy user widzi INNĄ kolejność!                │
└─────────────────────────────────────────────────────────┘
```

---

## 🧠 **DLACZEGO TO DZIAŁA?**

### **1. POWTARZALNY PATTERN (24h cycle)**
```
✅ User A, Day 1, 10:00 = Pattern X
✅ User A, Day 5, 10:00 = Pattern X (wraca!)
✅ User A, Day 9, 10:00 = Pattern X (wraca!)

KORZYŚĆ: System jest deterministyczny (łatwy debug)
KORZYŚĆ: User widzi "stabilność" (nie czysty chaos)
```

### **2. GRADUAL ROTATION (100% → 50% → 25%)**
```
Day 1: DUŻA zmiana (100% shuffle)
Day 2: ŚREDNIA zmiana (50% shuffle)
Day 3: MAŁA zmiana (25% shuffle)
Day 4: DUŻA zmiana (100% shuffle - wraca!)

KORZYŚĆ: User NIE widzi patternu!
KORZYŚĆ: Nie jest to czysty random (zawsze dobre ceny na topie)
```

### **3. HOUR VARIATION**
```
10:00: Pattern A
11:00: Pattern B (lekka zmiana)
12:00: Pattern C (lekka zmiana)

KORZYŚĆ: User nie może "zaplanować" skanu na konkretną godzinę
KORZYŚĆ: Każda godzina = inna kolejność
```

---

## 📈 **PATTERN LEARNING PREVENTION:**

### **SCENARIUSZ: User próbuje się nauczyć**

```
User A myśli:
"OK, zobaczmy czy Beslist.nl jest zawsze najtańszy..."

Day 1, 10:00: #1 = Azerty €1.099 ❌ (nie Beslist!)
Day 2, 10:00: #1 = Alternate €1.049 ❌ (nie Beslist!)
Day 3, 10:00: #1 = Beslist €999 ✅ (OK, może to pattern?)
Day 4, 10:00: #1 = Azerty €1.099 ❌ (nie, jednak nie!)

User A myśli:
"Hmm, może Azerty jest zawsze najtańszy w poniedziałki?"

Monday 10:00: #1 = Azerty €1.099 ✅
Monday 11:00: #1 = Beslist €999 ❌ (inna godzina!)
Next Monday 10:00: #1 = Azerty €1.099 ✅ (OK, może to pattern?)
Next Monday 10:00 (4 weeks later): #1 = Alternate €1.049 ❌

User A myśli:
"WTF, nie mogę się nauczyć tego patternu! 😤"
"Lepiej skanować za każdym razem na DealSense!"

✅ SUKCES - User nie może się nauczyć!
```

---

## 🔧 **PARAMETRY DO TUNINGU:**

### **1. ROTATION CYCLE (obecnie: 4 dni)**
```javascript
// Opcje:
rotationCycle = daySlot % 3  // 3-day cycle
rotationCycle = daySlot % 4  // 4-day cycle (current)
rotationCycle = daySlot % 7  // 7-day cycle (weekly)
```

### **2. INTENSITY LEVELS (obecnie: 100% → 50% → 25%)**
```javascript
// Opcje:
case 0: return 1.0   // 100%
case 1: return 0.75  // 75% (więcej rotacji)
case 2: return 0.5   // 50%
case 3: return 0.25  // 25%

// Lub bardziej agresywne:
case 0: return 1.0   // 100%
case 1: return 0.8   // 80%
case 2: return 0.6   // 60%
case 3: return 0.4   // 40%
```

### **3. SHUFFLE PROBABILITIES (obecnie: 50% / 30%)**
```javascript
// INTENSITY 100%:
if (random < 0.5) // 50% szansy na full shuffle
else if (random < 0.8) // 30% szansy na swap 1↔2

// Opcje - bardziej agresywne:
if (random < 0.7) // 70% szansy na full shuffle
else if (random < 0.9) // 20% szansy na swap 1↔2
```

---

## ✅ **PODSUMOWANIE:**

| Feature | Status | Efekt |
|---------|--------|-------|
| **24h cycle** | ✅ | Pattern wraca po 24h (deterministyczny) |
| **Gradual rotation** | ✅ | 100% → 50% → 25% → 100% (4-day cycle) |
| **Hour variation** | ✅ | Każda godzina = lekka zmiana |
| **User variation** | ✅ | Każdy user = inna kolejność |
| **Anti-pattern** | ✅ | Omija sklepy z ostatnich 15 skanów |
| **Different shops** | ✅ | Każdy scan = RÓŻNE sklepy (nie te same 3) |
| **Price filter** | ✅ | Tylko oferty < basePrice |
| **Sort by price** | ✅ | Najtańszy → najdroższy |

**WYNIK: User NIE MOŻE się nauczyć patternu! 🏆**
