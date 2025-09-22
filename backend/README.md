# Voting Application Backend

A Node.js backend for the voting application built with Express and MongoDB.

## Features

- User authentication (JWT)
- Role-based access control (User/Admin)
- Event creation and management
- Secure voting system
- Vote tracking and results

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_min_32_chars
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ADMIN_SECRET=your_admin_secret_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/signup`
- **Body:** `{ name, email, password, role? }`
- **Notes:** 
  - Role defaults to 'user'
  - Admin creation requires ADMIN_SECRET in headers

#### Login
- **POST** `/api/auth/login`
- **Body:** `{ email, password }`
- **Returns:** `{ token, user }`

### Public Events

#### List Events
- **GET** `/api/events`
- **Access:** Public
- **Returns:** List of all events with basic details

#### Get Event Details
- **GET** `/api/events/:id`
- **Access:** Public
- **Returns:** Event details with vote counts

#### Vote on Event
- **POST** `/api/events/:id/vote`
- **Access:** Authenticated users
- **Body:** `{ optionId }`
- **Notes:** Users can only vote once per event

### Admin Routes

#### List Events (Admin View)
- **GET** `/api/admin/events`
- **Access:** Admin only
- **Returns:** Detailed event list with creator info

#### Create Event
- **POST** `/api/admin/events`
- **Access:** Admin only
- **Body:** `{ title, description, options: [{ name }], startAt?, endAt? }`

#### Update Event
- **PUT** `/api/admin/events/:id`
- **Access:** Admin only
- **Body:** Event fields to update
- **Notes:** Cannot modify options after voting starts

#### Get Event Results
- **GET** `/api/admin/events/:id/results`
- **Access:** Admin only
- **Returns:** Detailed voting results with voter information

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer your_jwt_token
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Input validation
- CORS protection
- Environment variable configuration
- No credentials in code

## Development

To start the development server with hot reload:

```bash
npm run dev
```

## Production

For production deployment:

1. Set appropriate environment variables
2. Install dependencies: `npm install --production`
3. Start server: `npm start`