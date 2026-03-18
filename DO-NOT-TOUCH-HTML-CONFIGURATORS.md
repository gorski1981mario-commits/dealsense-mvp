# ⚠️ DO NOT TOUCH - OLD HTML CONFIGURATORS

## IMPORTANT: These files are DEPRECATED and should NOT be modified or deployed!

All configurators are now in **TSX format** located in:
```
app/components/configurators/
```

## Active TSX Configurators (PRODUCTION):
1. ✅ `app/components/configurators/EnergyConfigurator.tsx`
2. ✅ `app/components/configurators/TelecomConfigurator.tsx`
3. ✅ `app/components/configurators/InsuranceConfigurator.tsx`
4. ✅ `app/components/configurators/VacationConfigurator.tsx`
5. ✅ `app/components/configurators/LeasingConfigurator.tsx`
6. ✅ `app/components/configurators/MortgageConfigurator.tsx`
7. ✅ `app/components/configurators/LoanConfigurator.tsx`
8. ✅ `app/components/configurators/CreditCardConfigurator.tsx`
9. ✅ `app/components/configurators/SubscriptionsConfigurator.tsx`

## Old HTML Files (DO NOT USE):
These files in the root directory are **old test versions** and are ignored by Vercel:
- `*-configurator-FINAL.html`
- `*-configurator-full.html`
- `*-configurator-preview.html`
- `vakantie-*.html`
- `vacation-*.html`
- etc.

**These files are listed in `.vercelignore` and will NOT be deployed.**

## Rules:
1. ❌ DO NOT modify HTML configurators in root
2. ❌ DO NOT deploy HTML configurators
3. ✅ ONLY use TSX configurators in `app/components/configurators/`
4. ✅ All changes should be made to TSX files only

## Why?
- TSX = React components with TypeScript
- HTML = old static files for testing only
- Vercel deploys from `app/` folder (Next.js)
- HTML files are ignored by Vercel deployment
