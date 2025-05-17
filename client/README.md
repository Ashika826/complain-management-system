# Complaint Management System

A simple and elegant complaint management system built with React, Node.js, and file-based data storage. This application allows customers to submit and track complaints, while administrators can respond to and manage these complaints.

## Features

### Customer Features
- User registration and authentication
- Submit new complaints
- View and track existing complaints
- View admin responses to complaints

### Admin Features
- Secure admin login
- Dashboard with complaint statistics
- List and filter complaints
- Respond to customer complaints
- Update complaint status

## Project Structure

The project is divided into two main parts:

1. **Backend (Node.js/Express)**
   - RESTful API endpoints
   - JWT authentication
   - File-based data storage
   - MVC architecture

2. **Frontend (React)**
   - Responsive UI with Tailwind CSS
   - Context API for state management
   - Protected routes
   - Form validation

## Installation

### Prerequisites
- Node.js (v14 or later)
- npm or yarn

### Setup

1. Clone the repository
```
git clone https://github.com/yourusername/complaint-management-system.git
cd complaint-management-system
```

2. Install server dependencies
```
cd server
npm install
```

3. Install client dependencies
```
cd ../client
npm install
```

## Running the Application

### Development Mode

1. Start the server
```
cd server
npm run dev
```

2. Start the client (in a separate terminal)
```
cd client
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

### Production Mode

1. Build the client
```
cd client
npm run build
```

2. Start the server
```
cd ../server
npm start
```

## Creating an Admin User

To create an admin user, use curl or any API client to send a POST request:

```bash
curl -X POST http://localhost:5050/api/auth/admin/create \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "adminpassword",
    "name": "Admin User",
    "email": "admin@example.com",
    "adminSecret": "admin_setup_secret"
  }'
```

You can change the `adminSecret` value in the server code or set it as an environment variable.

## Usage

### Customer
1. Register a new account
2. Log in with your credentials
3. Submit a new complaint
4. View responses from admins

### Administrator
1. Log in using admin credentials
2. View all complaints in the dashboard
3. Filter and search for specific complaints
4. Respond to complaints and update their status

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new customer
- `POST /api/auth/login` - Login (customer or admin)
- `POST /api/auth/admin/create` - Create an admin user (special endpoint)
- `GET /api/auth/profile` - Get user profile

### Complaints
- `POST /api/complaints` - Create a new complaint
- `GET /api/complaints` - Get all complaints (admins) or user complaints (customers)
- `GET /api/complaints/:id` - Get a specific complaint
- `POST /api/complaints/:id/respond` - Respond to a complaint (admin only)
- `PATCH /api/complaints/:id/status` - Update complaint status (admin only)

## License

This project is licensed under the MIT License.

---

Built with ❤️ for simple and effective complaint management.