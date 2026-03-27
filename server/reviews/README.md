# AI REVIEWS MODULE

Modularny system analizy opinii produktów.

## Funkcje
- Scraping z 6 źródeł (Bol, Coolblue, MediaMarkt, Tweakers, Reddit, Trustpilot)
- Analiza AI (GPT-4/Claude)
- Cache Redis (90 dni)
- Target: 6s response

## Usage
```javascript
const { getReviewsAnalysis } = require('./reviews');
const result = await getReviewsAnalysis('8806094934850');
```

## API
GET /api/reviews/[ean]
