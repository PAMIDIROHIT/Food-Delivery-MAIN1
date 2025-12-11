<p align="center">
  <img src="https://img.shields.io/badge/TOMATO-Food%20Delivery-FF6347?style=for-the-badge&logo=foodpanda&logoColor=white" alt="TOMATO"/>
</p>

<h1 align="center">🍅 TOMATO - Full-Stack Food Delivery Platform</h1>

<p align="center">
  <strong>A production-ready food delivery application built with the MERN stack, featuring real-time order tracking, AI-powered recommendations, and secure payment processing.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js" alt="Node.js"/>
  <img src="https://img.shields.io/badge/MongoDB-6.0-47A248?style=flat-square&logo=mongodb" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express" alt="Express"/>
  <img src="https://img.shields.io/badge/Socket.io-4.6-010101?style=flat-square&logo=socket.io" alt="Socket.io"/>
  <img src="https://img.shields.io/badge/Stripe-Payment-008CDD?style=flat-square&logo=stripe" alt="Stripe"/>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-api-documentation">API Docs</a>
</p>

---

## 🎯 Project Overview

**TOMATO** is a comprehensive food delivery platform that demonstrates expertise in full-stack development, real-time systems, payment integration, and AI implementation. The application provides three distinct interfaces:

| Interface | Description | Port |
|-----------|-------------|------|
| 🛒 **Customer App** | Browse menu, order food, track deliveries | 5173 |
| 👨‍💼 **Admin Dashboard** | Manage orders, menu items, and view analytics | 5175 |
| ⚙️ **Backend API** | RESTful API with WebSocket support | 4000 |

---

## ✨ Features

### 🔐 Authentication & Security
- **JWT-based Authentication** - Secure token-based auth with role management
- **Google OAuth 2.0** - One-click social login integration
- **Password Hashing** - BCrypt with configurable salt rounds
- **Protected Routes** - Middleware-based route protection

### 🛒 E-Commerce Features
- **Dynamic Menu** - Category-based food browsing with filters
- **Shopping Cart** - Persistent cart with real-time updates
- **Multiple Payment Options**:
  - 💳 Stripe Payment Gateway (Cards)
  - 💵 Cash on Delivery (COD)
- **Order Management** - Complete order lifecycle handling

### 📍 Real-Time Delivery Tracking
- **Live GPS Tracking** - Google Maps integration with driver location
- **WebSocket Updates** - Real-time status via Socket.io
- **Delivery Partner Assignment** - Automated partner matching
- **Status Timeline** - Visual order progress tracking

### 🤖 AI-Powered Features
- **AI Chatbot** - Gemini AI-powered food assistant
  - Menu recommendations
  - Order history queries
  - Natural language understanding
- **Smart Recommendations**:
  - 🔥 Trending items
  - ⏰ Time-based suggestions (Breakfast/Lunch/Dinner)
  - 🎯 Personalized picks based on order history

### 📧 Notifications
- **Email Notifications** (Nodemailer + Gmail)
  - Order confirmation
  - Status updates
  - Delivery notifications
- **In-App Notifications** - Real-time notification bell

### 🎨 UI/UX Features
- **Dark/Light Mode** - Theme toggle with persistence
- **Responsive Design** - Mobile-first approach
- **Modern Animations** - Smooth transitions and micro-interactions

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| ![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=black) | UI Library |
| ![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | Build Tool |
| ![React Router](https://img.shields.io/badge/-React_Router-CA4245?style=flat-square&logo=react-router&logoColor=white) | Navigation |
| ![Axios](https://img.shields.io/badge/-Axios-5A29E4?style=flat-square&logo=axios&logoColor=white) | HTTP Client |
| ![Socket.io](https://img.shields.io/badge/-Socket.io-010101?style=flat-square&logo=socket.io&logoColor=white) | Real-time Updates |
| ![Google Maps](https://img.shields.io/badge/-Google_Maps-4285F4?style=flat-square&logo=google-maps&logoColor=white) | Map Integration |

### Backend
| Technology | Purpose |
|------------|---------|
| ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white) | Runtime Environment |
| ![Express](https://img.shields.io/badge/-Express-000000?style=flat-square&logo=express&logoColor=white) | Web Framework |
| ![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white) | Database |
| ![Mongoose](https://img.shields.io/badge/-Mongoose-880000?style=flat-square&logoColor=white) | ODM |
| ![JWT](https://img.shields.io/badge/-JWT-000000?style=flat-square&logo=json-web-tokens&logoColor=white) | Authentication |
| ![Passport](https://img.shields.io/badge/-Passport-34E27A?style=flat-square&logo=passport&logoColor=white) | OAuth Strategy |

### Integrations
| Service | Purpose |
|---------|---------|
| ![Stripe](https://img.shields.io/badge/-Stripe-008CDD?style=flat-square&logo=stripe&logoColor=white) | Payment Processing |
| ![Gemini](https://img.shields.io/badge/-Gemini_AI-4285F4?style=flat-square&logo=google&logoColor=white) | AI Chatbot |
| ![Gmail](https://img.shields.io/badge/-Gmail_SMTP-EA4335?style=flat-square&logo=gmail&logoColor=white) | Email Notifications |
| ![Google OAuth](https://img.shields.io/badge/-Google_OAuth-4285F4?style=flat-square&logo=google&logoColor=white) | Social Login |

---

## 🏗️ Architecture

### System Architecture

```mermaid
flowchart TB
    subgraph Client["🖥️ Client Layer"]
        CU[Customer App<br/>React + Vite]
        AD[Admin Dashboard<br/>React + Vite]
    end
    
    subgraph Server["⚙️ Server Layer"]
        API[Express REST API<br/>Port 4000]
        WS[Socket.io Server<br/>Real-time Events]
        AI[Gemini AI Service<br/>Chatbot + Recommendations]
    end
    
    subgraph Data["💾 Data Layer"]
        MDB[(MongoDB Atlas<br/>Database)]
        CACHE[In-Memory Cache<br/>Menu & Sessions]
    end
    
    subgraph External["🌐 External Services"]
        STRIPE[Stripe API<br/>Payments]
        GMAIL[Gmail SMTP<br/>Emails]
        GAUTH[Google OAuth<br/>Social Login]
        GMAPS[Google Maps<br/>Tracking]
    end
    
    CU <--> API
    AD <--> API
    CU <-.-> WS
    API <--> MDB
    API <--> CACHE
    API <--> AI
    API <--> STRIPE
    API <--> GMAIL
    API <--> GAUTH
    CU <--> GMAPS
```

### Order Flow

```mermaid
sequenceDiagram
    participant C as 👤 Customer
    participant F as 🖥️ Frontend
    participant B as ⚙️ Backend
    participant S as 💳 Stripe
    participant D as 📦 Database
    participant E as 📧 Email
    participant WS as 🔌 WebSocket
    
    C->>F: Add items to cart
    F->>F: Update local state
    C->>F: Proceed to checkout
    F->>B: POST /api/order/place
    
    alt Stripe Payment
        B->>S: Create checkout session
        S-->>B: Session URL
        B-->>F: Redirect to Stripe
        F->>S: Complete payment
        S->>B: Webhook: Payment success
    else Cash on Delivery
        B->>D: Save order (payment: pending)
    end
    
    B->>D: Save order
    B->>E: Send confirmation email
    B->>WS: Emit order-created event
    WS-->>F: Real-time notification
    F-->>C: Order confirmed! 🎉
```

### Authentication Flow

```mermaid
flowchart LR
    subgraph Login["🔐 Login Options"]
        EMAIL[Email/Password]
        GOOGLE[Google OAuth]
    end
    
    subgraph Auth["Authentication"]
        VALIDATE[Validate Credentials]
        OAUTH[Passport OAuth]
        HASH[BCrypt Compare]
    end
    
    subgraph Token["Token Generation"]
        JWT[Generate JWT]
        SESSION[Create Session]
    end
    
    subgraph Access["Access Control"]
        MIDDLEWARE[Auth Middleware]
        ROLE[Role Check]
        PROTECTED[Protected Routes]
    end
    
    EMAIL --> VALIDATE
    GOOGLE --> OAUTH
    VALIDATE --> HASH
    HASH --> JWT
    OAUTH --> SESSION
    SESSION --> JWT
    JWT --> MIDDLEWARE
    MIDDLEWARE --> ROLE
    ROLE --> PROTECTED
```

---

## 📁 Project Structure

```
Food-Delivery-MAIN1/
├── 📂 frontend/                 # Customer-facing React app
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Chatbot/         # AI-powered chatbot
│   │   │   ├── Maps/            # Google Maps integration
│   │   │   ├── Notifications/   # Notification bell
│   │   │   └── Food/            # Food item cards & carousel
│   │   ├── pages/               # Route pages
│   │   │   ├── Home/            # Landing page
│   │   │   ├── Cart/            # Shopping cart
│   │   │   ├── PlaceOrder/      # Checkout (Stripe/COD)
│   │   │   ├── MyOrders/        # Order history
│   │   │   └── OrderTracking/   # Live GPS tracking
│   │   ├── context/             # React Context (Store, Theme)
│   │   └── hooks/               # Custom hooks
│   └── .env.example             # Environment template
│
├── 📂 admin/                    # Admin dashboard React app
│   ├── src/
│   │   ├── components/          # Admin UI components
│   │   └── pages/
│   │       ├── Orders/          # Order management
│   │       ├── Add/             # Add food items
│   │       └── List/            # Menu management
│   └── .env.example
│
├── 📂 backend/                  # Express.js API server
│   ├── config/
│   │   ├── db.js                # MongoDB connection
│   │   └── passport.js          # OAuth strategies
│   ├── controllers/             # Route handlers
│   │   ├── orderController.js   # Order CRUD + Stripe
│   │   ├── chatbotController.js # AI chatbot logic
│   │   └── deliveryController.js# Delivery tracking
│   ├── models/                  # Mongoose schemas
│   ├── routes/                  # API routes
│   ├── services/
│   │   └── chatbotService.js    # Gemini AI integration
│   ├── websocket/
│   │   └── socket.js            # Socket.io events
│   ├── middleware/
│   │   └── auth.js              # JWT verification
│   └── .env.example             # Environment template
│
└── 📄 README.md                 # You are here!
```

---

## ⚡ Installation

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Stripe account
- Google Cloud Console project (OAuth + Maps)
- Gmail account (for SMTP)
- Gemini AI API key

### 1. Clone the Repository
```bash
git clone https://github.com/PAMIDIROHIT/Food-Delivery-MAIN1.git
cd Food-Delivery-MAIN1
```

### 2. Install Dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install

# Admin
cd ../admin && npm install
```

### 3. Environment Setup

Copy the example files and fill in your credentials:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend  
cp frontend/.env.example frontend/.env
```

**Backend `.env` configuration:**
```env
JWT_SECRET=your_super_secret_jwt_key
SALT=10
MONGO_URL=mongodb+srv://...
STRIPE_SECRET_KEY=sk_test_...
GEMINI_API_KEY=your_gemini_key
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 4. Start the Application

```bash
# Terminal 1: Backend (Port 4000)
cd backend && npm run server

# Terminal 2: Frontend (Port 5173)
cd frontend && npm run dev

# Terminal 3: Admin (Port 5175)
cd admin && npm run dev
```

---

## 📡 API Documentation

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user/register` | Register new user |
| POST | `/api/user/login` | Login with email/password |
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | OAuth callback |

### Order Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/order/place` | Create new order |
| POST | `/api/order/userorders` | Get user's orders |
| POST | `/api/order/status` | Update order status |
| POST | `/api/order/verify` | Verify Stripe payment |

### Food Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/food/list` | Get all food items |
| POST | `/api/food/add` | Add new food item (Admin) |
| POST | `/api/food/remove` | Remove food item (Admin) |

### Delivery Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/delivery/status/:orderId` | Get delivery status |
| POST | `/api/delivery/simulate/:orderId` | Simulate delivery (Demo) |

### AI Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/message` | Send message to AI chatbot |
| GET | `/api/recommendations/trending` | Get trending items |
| GET | `/api/recommendations/personalized` | Get personalized picks |

---

## 🖼️ Screenshots

<details>
<summary>Click to view screenshots</summary>

### Home Page
![Hero Section](https://i.ibb.co/59cwY75/food-hero.png)

### Menu
![Products](https://i.ibb.co/JnNQPyQ/food-products.png)

### Shopping Cart
![Cart](https://i.ibb.co/t2LrQ8p/food-cart.png)

### Authentication
![Login](https://i.ibb.co/s6PgwkZ/food-login.png)

</details>

---

## 🔮 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Multi-restaurant support
- [ ] Loyalty points system
- [ ] Advanced analytics dashboard
- [ ] Push notifications (FCM)
- [ ] Multi-language support

---

## 👤 Author

**PAMIDI ROHIT**

[![GitHub](https://img.shields.io/badge/GitHub-PAMIDIROHIT-181717?style=for-the-badge&logo=github)](https://github.com/PAMIDIROHIT)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/pamidirohit)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>⭐ If you found this project helpful, please give it a star!</strong>
</p>

<p align="center">
  Made with ❤️ and lots of ☕
</p>
