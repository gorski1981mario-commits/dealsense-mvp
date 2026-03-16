# Dealsense Pricing Engine

Price comparison engine with advanced filtering rules.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in Render dashboard (see .env.example)

3. Start server:
```bash
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Compare Prices
```
POST /api/compare
{
  "product": "Product Name",
  "basePrice": 100,
  "offers": [
    { "store": "Store A", "price": 95, "rating": 4.5, "reviews": 100 },
    { "store": "Store B", "price": 90, "rating": 4.2, "reviews": 50 }
  ]
}
```

### Batch Test
```
POST /api/test
{
  "testData": [...]
}
```

## Environment Variables

All pricing rules are configured via environment variables in Render dashboard.

See `.env.example` for complete list.
