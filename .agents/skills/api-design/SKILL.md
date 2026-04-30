---
name: api-design
description: Design or review REST API endpoints, DTOs, validation rules, error responses, pagination, filtering, and versioning.
---

# API Design Skill

Use this skill when creating or reviewing backend API design.

## API Design Rules

- Use nouns for resources.
- Use HTTP methods correctly.
- Use consistent route naming.
- Use DTOs for request and response.
- Validate all inputs.
- Use pagination for collections.
- Use filtering and sorting explicitly.
- Use consistent error response shape.
- Avoid returning internal entity structure directly.
- Do not expose sensitive fields.

## Recommended Error Shape

Use a consistent structure similar to:

```json
{
  "timestamp": "2026-04-30T10:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/example",
  "details": [
    {
      "field": "email",
      "message": "must be a valid email"
    }
  ]
}
```

## Review Output

Return:

1. Endpoint assessment
2. DTO assessment
3. Validation gaps
4. Error handling gaps
5. Suggested API contract
