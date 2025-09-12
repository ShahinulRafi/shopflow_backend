# ShopFlow Backend

A robust e-commerce backend API built with Node.js, Express, and Prisma ORM. This backend service provides all the necessary endpoints for managing an e-commerce platform, including user authentication, product management, and order processing.

## Features

- 🔐 **User Authentication**
  - Registration and Login
  - JWT-based authentication
  - Role-based access control (User/Admin)

- 📦 **Product Management**
  - Product listing and details
  - Category-based filtering
  - Stock management
  - Product ratings

- 🛒 **Order Management**
  - Order creation and processing
  - Order status tracking
  - Order history

- 👤 **User Profile**
  - Multiple delivery addresses
  - Profile management
  - Avatar support

## Tech Stack

- **Runtime Environment**: Node.js
- **Framework**: Express.js
- **Database ORM**: Prisma
- **Database**: SQLite (can be easily migrated to PostgreSQL/MySQL)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **API Security**: CORS enabled

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Git

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ShahinulRafi/shopflow_backend.git
   cd shopflow_backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET=your_jwt_secret
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   npm run seed
   ```

## Running the Application

- Development mode:
  ```bash
  npm run dev
  ```
  The server will start on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (Admin only)

## Database Schema

### Core Models:
- **User**: Stores user information and authentication details
- **Product**: Contains product information including price and stock status
- **Order**: Manages order information and status
- **Address**: Stores user delivery addresses
- **OrderItem**: Links products to orders with quantity

## Development

To contribute to the project:

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run seed` - Seed the database with initial data

## License

ISC

## Author

S. M. Shahinul Karim - 21701023 \
Sahib Abbas Bahar Chowdhury - 21701022 \
Misbah Ul Haque Arafat - 21701033
