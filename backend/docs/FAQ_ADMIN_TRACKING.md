# FAQ Admin Tracking System

## Overview

The FAQ system now includes **full admin user tracking** for all create, update, and delete operations. Every change to FAQs is associated with the admin user who made that change, providing a complete audit trail.

## Database Schema Changes

### New Columns in `faqs` Table

| Column       | Type     | Description                                |
| ------------ | -------- | ------------------------------------------ |
| `created_by` | INT (FK) | User ID of admin who created the FAQ       |
| `updated_by` | INT (FK) | User ID of admin who last modified the FAQ |

Both columns are foreign keys referencing `users(id)` and are nullable to support legacy data.

### Relationships

```
users (1) ----< (N) faqs [created_by]
users (1) ----< (N) faqs [updated_by]
```

## API Changes

### Authentication Required

All FAQ management endpoints now require **both**:

1. **API Key** (`x-api-key` header) - for basic authentication
2. **JWT Token** (`Authorization: Bearer <token>` header) - to identify the admin user

### Endpoint Updates

#### 1. Create FAQ

```http
POST /admin/faqs
Headers:
  - x-api-key: <your-api-key>
  - Authorization: Bearer <jwt-token>

Body:
{
  "question": "How do I reset my password?",
  "answer": "Go to settings...",
  "category": "Account",
  "order_index": 1
}
```

**What happens:**

- Admin user ID is extracted from JWT token
- FAQ is created with `created_by` = admin user ID
- `updated_by` is also set to admin user ID initially

#### 2. Update FAQ

```http
PUT /admin/faqs/{faq_id}
Headers:
  - x-api-key: <your-api-key>
  - Authorization: Bearer <jwt-token>

Body:
{
  "question": "Updated question",
  "answer": "Updated answer"
}
```

**What happens:**

- Admin user ID is extracted from JWT token
- FAQ is updated with `updated_by` = admin user ID
- `updated_at` timestamp is automatically updated

#### 3. Delete FAQ (Soft Delete)

```http
DELETE /admin/faqs/{faq_id}
Headers:
  - x-api-key: <your-api-key>
  - Authorization: Bearer <jwt-token>
```

**What happens:**

- Admin user ID is extracted from JWT token
- FAQ `is_active` flag is set to 0
- `updated_by` = admin user ID (tracks who deleted it)
- `updated_at` timestamp is updated

### Response Format

When retrieving FAQs, the response now includes admin information:

```json
{
  "id": 1,
  "question": "How do I reset my password?",
  "answer": "Go to settings...",
  "category": "Account",
  "order_index": 1,
  "created_at": "2026-01-14T10:30:00Z",
  "updated_at": "2026-01-14T15:45:00Z",
  "created_by": 5,
  "created_by_name": "Admin User",
  "created_by_email": "admin@example.com",
  "updated_by": 7,
  "updated_by_name": "Another Admin",
  "updated_by_email": "admin2@example.com"
}
```

## Migration

### Running the Migration

To add the new columns to an existing FAQ table:

```powershell
# From backend directory
cd backend
python scripts/migrate_faq_admin_tracking.py
```

The migration script will:

- ✅ Add `created_by` column with FK constraint
- ✅ Add `updated_by` column with FK constraint
- ✅ Handle existing FAQs (columns will be NULL for legacy data)
- ✅ Skip if columns already exist

### Legacy Data

For FAQs created before this migration:

- `created_by` and `updated_by` will be `NULL`
- These FAQs still function normally
- When updated by an admin, `updated_by` will be set

## Implementation Details

### Database Layer (`backend/database/faq.py`)

```python
# Creating FAQ with admin tracking
def add_faq(question, answer, category=None, order_index=0, created_by=None):
    # created_by is the admin user ID
    cursor.execute("""
        INSERT INTO faqs (question, answer, category, order_index,
                         is_active, created_by, updated_by)
        VALUES (?, ?, ?, ?, 1, ?, ?)
    """, (question, answer, category, order_index, created_by, created_by))

# Updating FAQ with admin tracking
def update_faq(faq_id, question=None, answer=None, updated_by=None):
    # updated_by is the admin user ID making the change
    updates.append("updated_by = ?")
    params.append(updated_by)
    # ... rest of update logic

# Deleting FAQ with admin tracking
def delete_faq(faq_id, deleted_by=None):
    # deleted_by is stored in updated_by for audit trail
    cursor.execute(
        "UPDATE faqs SET is_active = 0, updated_at = GETDATE(), updated_by = ? WHERE id = ?",
        (deleted_by, faq_id)
    )
```

### Routes Layer (`backend/routes/admin.py`)

```python
from routes.utils import get_user_id_from_token

@router.post("/admin/faqs")
def create_faq(faq: FAQCreate, authorization: str = Header(None)):
    # Extract admin user ID from JWT token
    admin_user_id = get_user_id_from_token(authorization)

    # Pass to database function
    faq_id = add_faq(
        faq.question,
        faq.answer,
        created_by=admin_user_id
    )
```

## Security Considerations

### JWT Token Validation

The `get_user_id_from_token()` function:

- ✅ Validates token signature
- ✅ Checks expiration
- ✅ Verifies user_id claim exists
- ❌ Raises HTTPException(401) if invalid

### Role Verification

While the current implementation extracts user_id from JWT:

- API endpoints are protected by API key
- JWT token must be valid
- **Recommendation:** Add explicit admin role check

```python
def verify_admin_role(user_id):
    # Check if user has admin role in database
    cursor.execute("SELECT role FROM users WHERE id = ?", (user_id,))
    role = cursor.fetchone()[0]
    if role not in ['Admin', 'SuperAdmin']:
        raise HTTPException(403, "Admin role required")
```

## Frontend Integration

### Example: Creating FAQ with Tracking

```javascript
// Frontend code
const createFAQ = async (faqData) => {
  const response = await fetch("/admin/faqs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(faqData),
  });

  return response.json();
};
```

### Displaying Admin Information

```javascript
// Show who created/modified FAQ
const FAQItem = ({ faq }) => (
  <div className="faq-item">
    <h3>{faq.question}</h3>
    <p>{faq.answer}</p>
    <div className="faq-meta">
      <span>Created by: {faq.created_by_name || "System"}</span>
      <span>Last modified by: {faq.updated_by_name || "N/A"}</span>
      <span>Updated: {faq.updated_at}</span>
    </div>
  </div>
);
```

## Benefits

### 1. **Full Audit Trail**

- Know exactly who created each FAQ
- Track who made modifications
- Accountability for deletions

### 2. **Compliance & Governance**

- Meet audit requirements
- Track content changes
- Support regulatory compliance

### 3. **Team Collaboration**

- Multiple admins can manage FAQs
- See who's responsible for each FAQ
- Coordinate content updates

### 4. **Data Integrity**

- Foreign key constraints ensure valid user references
- Soft deletes preserve history
- Timestamps track when changes occurred

## Testing

### Manual Testing

```sql
-- Check FAQ tracking data
SELECT
    f.id,
    f.question,
    f.created_at,
    u1.name as created_by_name,
    f.updated_at,
    u2.name as updated_by_name
FROM faqs f
LEFT JOIN users u1 ON f.created_by = u1.id
LEFT JOIN users u2 ON f.updated_by = u2.id
WHERE f.is_active = 1;
```

### Integration Testing

```python
# Test FAQ creation with admin tracking
def test_create_faq_with_admin_tracking(client, admin_token):
    response = client.post(
        "/admin/faqs",
        json={"question": "Test?", "answer": "Answer"},
        headers={
            "x-api-key": API_KEY,
            "Authorization": f"Bearer {admin_token}"
        }
    )
    assert response.status_code == 200

    # Verify tracking
    faq = get_faq_by_id(response.json()["faq_id"])
    assert faq["created_by"] is not None
    assert faq["created_by_name"] == "Test Admin"
```

## Troubleshooting

### Issue: "Missing or invalid authorization header"

**Cause:** JWT token not provided in request

**Solution:** Include `Authorization: Bearer <token>` header

### Issue: "Invalid token"

**Cause:** Expired or malformed JWT token

**Solution:** Re-authenticate to get fresh token

### Issue: created_by/updated_by is NULL

**Cause:** Legacy FAQ created before migration

**Solution:** Normal behavior - will be populated on next update

## Future Enhancements

### Planned Features

1. **Change History Table**

   - Track every modification
   - Store old values
   - Enable rollback

2. **Admin Role Verification**

   - Explicit role check in endpoints
   - Prevent non-admin modifications

3. **Activity Dashboard**
   - Show recent FAQ changes
   - Admin activity metrics
   - Content audit reports

## Related Documentation

- [Database Schema](../database/README.md)
- [Admin API Documentation](../docs/api/)
- [Authentication Guide](../docs/guides/authentication.md)
- [ERD Diagram](../../diagrams/16_database_erd.puml)
