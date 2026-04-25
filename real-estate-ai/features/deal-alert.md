Feature: AI Deal Alerts

Goal:
Detect undervalued properties and show alerts to buyers.

Inputs:
- Property price
- Location
- Size
- Nearby transactions

Logic:
- Compare property price with average area price
- If property is 10% below average -> mark as undervalued

Output:
- Badge: "🔥 Undervalued Deal"
- Short explanation
- Estimated fair price

API:
GET /api/properties/deal-alerts

Response:
```json
{
  "propertyId": "123",
  "status": "undervalued",
  "fairPrice": 520000,
  "message": "This property is 12% below market value"
}
```
