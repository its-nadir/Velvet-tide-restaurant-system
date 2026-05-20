# Velvet Tide Restaurant - Full Stack Web Application

## Table of Contents
1. [Project Title](#1-project-title)
2. [Proposed Tools](#2-proposed-tools)
3. [Application](#3-application)
   - 3.1 [User Description of the Application](#31-user-description-of-the-application)
   - 3.2 [Features](#32-features)
   - 3.3 [System Architecture](#33-system-architecture)
4. [Installation & Setup](#4-installation--setup)
5. [Project Structure](#5-project-structure)
6. [API Documentation](#6-api-documentation)
7. [Technologies Used](#7-technologies-used)
8. [Future Enhancements](#8-future-enhancements)

---

## 1. Project Title

**Velvet Tide Restaurant Management System**

A comprehensive full-stack web application designed for Velvet Tide Restaurant, providing an elegant online presence with customer-facing features and a robust admin panel for restaurant management. The application offers seamless reservation booking, menu browsing, customer reviews, and administrative controls for managing reservations, and content.

---

## 2. Proposed Tools

### Frontend Technologies
- **React.js** - Modern JavaScript library for building interactive user interfaces
- **React Router** - Client-side routing for single-page application navigation
- **CSS3** - Custom styling with responsive design principles
- **Font Awesome** - Icon library for social media and UI elements
- **Google Fonts** - Typography (Playfair Display, Lato, Montserrat, Helvetica)

### Backend Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework for building RESTful APIs
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - ODM (Object Data Modeling) library for MongoDB

### Development Tools
- **npm** - Package manager for dependency management
- **Git** - Version control system
- **VS Code** - Integrated development environment
- **Postman** - API testing and documentation

### Additional Libraries & Services
- **bcrypt.js** - Password hashing for secure authentication
- **JSON Web Tokens (JWT)** - Secure user authentication and authorization
- **Nodemailer** - Email service for reservation confirmations
- **Google Maps API** - Location integration and map display
- **Cors** - Cross-Origin Resource Sharing middleware

---

## 3. Application

### 3.1 User Description of the Application

**Velvet Tide Restaurant** is a modern, full-featured web application designed to enhance the dining experience for customers while providing powerful management tools for restaurant administrators.

#### Customer-Facing Features:

**Homepage**
- Elegant hero section with restaurant branding and call-to-action buttons
- Easy navigation through menu, reservations, about us, and contact sections
- Responsive layout ensuring optimal viewing on various screen sizes
- Clear calls-to-action guiding users towards making bookings or ordering
- Accessibility features adhering to WCAG standards
- Customer testimonials carousel with reviews from Trip Advisor, Google, Yelp, and Facebook
- Restaurant location with embedded Google Maps
- Comprehensive footer with contact information, opening hours, and social media links
- Fully responsive design optimized for desktop, tablet, and mobile devices

**Menu Page**
- Complete menu catalog organized by categories (Appetizers, Main Courses, Desserts, Beverages)
- Detailed dish descriptions with prices and dietary information
- High-quality food photography


**Reservations Page**
- Interactive booking form with date/time selection
- Real-time table availability checking
- Party size selection and special requests
- Email confirmation system
- Reservation management (view, modify, cancel)

**About Us Page**
- Restaurant history and story
- Chef profiles and culinary philosophy
- Gallery of restaurant ambiance and events

**Contact Page**
- Contact form for inquiries
- Direct contact information (phone, email, address)
- Social media integration

#### Admin Panel Features:

**Dashboard**
- Real-time statistics (daily reservations, orders, revenue)
- Recent activity feed
- Quick access to key management functions
- Analytics and reporting charts

**Reservation Management**
- View all reservations (upcoming, past, cancelled)
- Approve/reject reservation requests
- Modify reservation details
- Send confirmation/reminder emails
- Table assignment and management

**Menu Management**
- Add, edit, delete menu items
- Upload and manage food images
- Update prices and descriptions
- Manage categories and special offers
- Mark items as available/unavailable


**Content Management**
- Update homepage content and images
- Manage testimonials and reviews
- Edit about us and contact information
- Social media links management

**Settings**
- Restaurant information (name, address, hours)
- Email notification settings
- Payment gateway configuration
- System preferences

---

### 3.2 Features

#### Core Functionality
✅ **Responsive Design** - Seamless experience across all devices (desktop, tablet, mobile)
✅ **User Authentication** - Secure login/registration with JWT tokens

✅ **Real-Time Updates** - Dynamic content updates without page refresh
✅ **Email Notifications** - Automated emails for reservations and orders
✅ **Image Upload** - Secure file handling for menu items and gallery
✅ **Form Validation** - Client and server-side validation for data integrity
✅ **Error Handling** - Comprehensive error messages and user feedback
✅ **SEO Optimization** - Meta tags and semantic HTML for search engines

#### User Experience
- Smooth animations and transitions
- Intuitive navigation with hamburger menu on mobile
- Back-to-top button for easy navigation
- Loading states and progress indicators
- Toast notifications for user actions
- Accessible design following WCAG guidelines

#### Security Features
- Password encryption with bcrypt
- JWT-based authentication
- Protected API routes
- Input sanitization to prevent XSS attacks
- CORS configuration for secure cross-origin requests
- Rate limiting to prevent abuse

---






### Step 6: Access the Application

- **Customer Interface**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API Endpoints**: http://localhost:5000/api

**Default Admin Credentials** (after seeding):
- Email: admin@velvettide.com
- Password: admin123

---

## 5. Project Structure

```
velvet-tide-restaurant/
│
├── client/                          # Frontend React Application
│   ├── public/
│   │   ├── Photos/                  # Static images
│   │   │   ├── logo.svg
│   │   │   ├── hero-bg.jpg
│   │   │   └── ...
│   │   ├── footer.svg
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── MenuCard.jsx
│   │   │   └── ...
│   │   │
│   │   ├── pages/                   # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Menu.jsx
│   │   │   ├── Reservations.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Contact.jsx
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── ManageReservations.jsx
│   │   │       ├── ManageMenu.jsx
│   │   │       └── ...
│   │   │
│   │   ├── context/                 # React Context API
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   │
│   │   ├── utils/                   # Utility functions
│   │   │   ├── api.js
│   │   │   ├── validation.js
│   │   │   └── helpers.js
│   │   │
│   │   ├── App.js                   # Main App component
│   │   ├── index.js                 # Entry point
│   │   └── App.css                  # Global styles
│   │
│   ├── package.json
│   └── .env
│
├── server/                          # Backend Node.js/Express Application
│   ├── config/
│   │   ├── db.js                    # Database connection
│   │   └── config.js                # App configuration
│   │
│   ├── models/                      # Mongoose models
│   │   ├── User.js
│   │   ├── Menu.js
│   │   ├── Reservation.js
│   │   ├── Order.js
│   │   ├── Review.js
│   │   └── Settings.js
│   │
│   ├── routes/                      # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── menu.js
│   │   ├── reservations.js
│   │   ├── orders.js
│   │   ├── reviews.js
│   │   └── admin.js
│   │
│   ├── controllers/                 # Route controllers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── menuController.js
│   │   ├── reservationController.js
│   │   ├── orderController.js
│   │   └── reviewController.js
│   │
│   ├── middleware/                  # Custom middleware
│   │   ├── auth.js                  # Authentication
│   │   ├── admin.js                 # Authorization
│   │   ├── errorHandler.js
│   │   ├── validation.js
│   │   └── upload.js                # File upload
│   │
│   ├── utils/                       # Utility functions
│   │   ├── sendEmail.js
│   │   ├── generateToken.js
│   │   └── helpers.js
│   │
│   ├── uploads/                     # Uploaded files directory
│   │
│   ├── seeds/                       # Database seed files
│   │   └── seedData.js
│   │
│   ├── server.js                    # Server entry point
│   ├── package.json
│   └── .env
│
├── README.md                        # Project documentation
├── .gitignore
└── package.json                     # Root package.json
```





## 7. Technologies Used

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI library |
| React Router DOM | 6.8.0 | Client-side routing |
| Axios | 1.3.0 | HTTP client |
| Font Awesome | 6.3.0 | Icons |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18.x | Runtime environment |
| Express.js | 4.18.2 | Web framework |
| MongoDB | 6.0 | Database |
| Mongoose | 7.0.0 | ODM |
| bcryptjs | 2.4.3 | Password hashing |
| jsonwebtoken | 9.0.0 | Authentication |
| nodemailer | 6.9.0 | Email service |
| multer | 1.4.5 | File upload |
| cors | 2.8.5 | CORS middleware |
| dotenv | 16.0.3 | Environment variables |
| express-validator | 6.14.3 | Input validation |

---

