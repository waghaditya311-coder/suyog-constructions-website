# API Design — Suyog Constructions Website
**Version:** 1.0  
**Base URL:** `/api/v1`  
**Content-Type:** `application/json`

---

## Endpoints Overview

| Method | Endpoint                     | Description                        | Auth Required |
|--------|------------------------------|------------------------------------|---------------|
| POST   | /api/v1/inquiry              | Submit a project inquiry/quotation | No            |
| POST   | /api/v1/contact              | Submit a contact message           | No            |
| GET    | /api/v1/projects             | List all/filtered projects         | No            |
| GET    | /api/v1/projects/:id         | Get a single project               | No            |
| GET    | /api/v1/testimonials         | List active testimonials           | No            |
| POST   | /api/v1/admin/login          | Admin authentication               | No            |
| GET    | /api/v1/admin/inquiries      | List all inquiries (admin)         | Yes           |
| PATCH  | /api/v1/admin/inquiries/:id  | Update inquiry status (admin)      | Yes           |
| GET    | /api/v1/admin/contacts       | List contact messages (admin)      | Yes           |
| POST   | /api/v1/admin/projects       | Add a new project (admin)          | Yes           |
| PATCH  | /api/v1/admin/projects/:id   | Update a project (admin)           | Yes           |
| DELETE | /api/v1/admin/projects/:id   | Delete a project (admin)           | Yes           |

---

## Endpoint Specifications

---

### POST `/api/v1/inquiry`
Submit a new project inquiry / quotation request.

**Request Body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "9876543210",
  "service_type": "residential",
  "budget_range": "25L-50L",
  "project_location": "Pune, Maharashtra",
  "message": "I want to construct a 2BHK bungalow on my 2000 sqft plot."
}
```

**Validation Rules:**
| Field            | Rule                                            |
|------------------|-------------------------------------------------|
| name             | Required, 2–100 chars                           |
| email            | Required, valid email format                    |
| phone            | Required, 10-digit Indian mobile number         |
| service_type     | Required, one of: residential/commercial/renovation/interior/other |
| budget_range     | Optional, one of defined ranges                 |
| project_location | Optional, max 200 chars                         |
| message          | Required, 10–1000 chars                         |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Your inquiry has been submitted successfully. We will contact you within 24 hours.",
  "inquiry_id": 42
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "phone": "Please enter a valid 10-digit mobile number",
    "email": "Please enter a valid email address"
  }
}
```

**Side Effects:**
- Saves to `inquiries` table
- Sends email notification to Suyog Constructions admin

---

### POST `/api/v1/contact`
Submit a general contact/message.

**Request Body:**
```json
{
  "name": "Priya Mehta",
  "email": "priya@example.com",
  "phone": "9123456789",
  "subject": "Query about commercial projects",
  "message": "I wanted to know more about your commercial construction services."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Thank you for reaching out! We will get back to you shortly."
}
```

---

### GET `/api/v1/projects`
Fetch portfolio projects with optional filtering.

**Query Parameters:**
| Param    | Type   | Description                                    |
|----------|--------|------------------------------------------------|
| category | string | Filter: residential, commercial, renovation, interior |
| status   | string | Filter: completed, ongoing                     |
| featured | boolean | Filter featured projects only                 |
| limit    | integer | Max results (default: 20, max: 50)            |
| page     | integer | Pagination (default: 1)                       |

**Example:** `GET /api/v1/projects?category=residential&status=completed&limit=6`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": 1,
        "title": "Shree Villa — Luxury Residence",
        "description": "A 4BHK luxury bungalow...",
        "category": "residential",
        "location": "Kothrud, Pune",
        "status": "completed",
        "area_sqft": 3200,
        "year_completed": 2024,
        "image_urls": ["/images/projects/shree-villa-1.jpg"],
        "featured": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 6,
      "total": 14,
      "total_pages": 3
    }
  }
}
```

---

### GET `/api/v1/projects/:id`
Fetch a single project by ID.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Shree Villa — Luxury Residence",
    "description": "A 4BHK luxury bungalow in Kothrud...",
    "category": "residential",
    "location": "Kothrud, Pune",
    "status": "completed",
    "area_sqft": 3200,
    "year_completed": 2024,
    "client_name": "Mr. Anil Shinde",
    "image_urls": [
      "/images/projects/shree-villa-1.jpg",
      "/images/projects/shree-villa-2.jpg"
    ],
    "featured": true
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Project not found"
}
```

---

### GET `/api/v1/testimonials`
Fetch active client testimonials.

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "client_name": "Mr. Ramesh Patil",
      "project_type": "Residential",
      "rating": 5,
      "review_text": "Excellent work by Suyog Constructions. Very professional team."
    }
  ]
}
```

---

### POST `/api/v1/admin/login`
Admin authentication.

**Request Body:**
```json
{
  "username": "admin",
  "password": "your_password"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Error Codes Reference

| HTTP Code | Meaning                              |
|-----------|--------------------------------------|
| 200       | OK — Successful GET                  |
| 201       | Created — Successful POST            |
| 400       | Bad Request — Validation error       |
| 401       | Unauthorized — Missing/invalid token |
| 404       | Not Found                            |
| 429       | Too Many Requests — Rate limited     |
| 500       | Internal Server Error                |

---

## Rate Limiting

| Endpoint             | Limit               |
|----------------------|---------------------|
| POST /inquiry        | 5 per IP per hour   |
| POST /contact        | 10 per IP per hour  |
| All other endpoints  | 100 per IP per hour |
