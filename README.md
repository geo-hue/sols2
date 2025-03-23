# Solace Healthcare App

Welcome to the Solace Healthcare App repository! Solace is a healthcare application designed for the 14.8 million older adults aged 60 and above in Nigeria. The app includes features for managing subscriptions, partnerships, caregivers, and user authentication. Below you'll find detailed documentation for the application's API endpoints organized by categories, along with setup and configuration information.

## Table of Contents

1. [Authentication](#authentication)
2. [Subscriptions](#subscriptions)
3. [Partners](#partners)
4. [Caregivers](#caregivers)
5. [Lace AI](#lace-ai)
6. [Dependencies](#dependencies)
7. [Scripts](#scripts)

## Authentication

The Authentication endpoints manage user access to the Solace platform. Each action triggers an email notification to the user confirming the action.

### 1. Superadmin Signup
**Endpoint**: `/v2/api/auth/super-admin/signup`  
**Method**: `POST`  
**Description**: Create a superadmin account with the highest level of access. Superadmins can manage admins and perform all system-level tasks.  
**Email Notification**: Sent upon successful signup.

### 2. User Signup
**Endpoint**: `/v2/api/auth/user/signup`  
**Method**: `POST`  
**Description**: Create an account for regular users (e.g., clients or caregivers). Users can access personal healthcare data, manage subscriptions, and interact with caregivers.  
**Email Notification**: Sent upon successful signup.

### 3. Superadmin Login
**Endpoint**: `/v2/api/auth/super-admin/login`  
**Method**: `POST`  
**Description**: Allows a superadmin to log in using their email and password.  
**Email Notification**: Sent upon successful login.

### 4. User Login
**Endpoint**: `/v2/api/auth/user/login`  
**Method**: `POST`  
**Description**: Allows regular users to log in using their email and password.  
**Email Notification**: Sent upon successful login.

### 5. Logout
**Endpoint**: `/v2/api/auth/logout`  
**Method**: `POST`  
**Description**: Allows any user (admin, superadmin, or regular user) to log out by invalidating their session token.  
**Email Notification**: Sent upon successful logout.

## Subscriptions

The Subscriptions endpoints manage subscription plans for users, including the Health Elders Club and Farewell Cover. Each subscription action triggers a confirmation email with details about the subscription.

### 1. Health Elders Club Subscription
**Endpoint**: `/v2/api/subscriptions/healthy-elders-club/subscribe`  
**Method**: `POST`  
**Description**: Subscribe a user to the Health Elders Club plan. Users can choose the subscription duration and renewal type.  
**Email Notification**: Sent upon successful subscription, including details such as renewal type and subscription expiry date.

### 2. Farewell Cover Subscription
**Endpoint**: `/v2/api/subscriptions/farewell-cover/subscribe`  
**Method**: `POST`  
**Description**: Subscribe a user to the Farewell Cover plan. Users can select the duration and renewal type.  
**Email Notification**: Sent upon successful subscription, including details such as renewal type and subscription expiry date.

## Partners

The Partners endpoints manage the registration of healthcare service providers including pharmacies, laboratories, hospitals, and clinics. Each registration action triggers an email with a unique referral code.

### 1. Pharmacies Registration
**Endpoint**: `/v2/api/partners/pharmacy/register`  
**Method**: `POST`  
**Description**: Register a pharmacy as a Solace partner.  
**Email Notification**: Sent upon successful registration with a unique referral code.

### 2. Laboratories Registration
**Endpoint**: `/v2/api/partners/laboratory/register`  
**Method**: `POST`  
**Description**: Register a laboratory as a Solace partner.  
**Email Notification**: Sent upon successful registration with a unique referral code.

### 3. Hospitals and Clinics Registration
**Endpoint**: `/v2/api/partners/hospitals-and-clinics/register`  
**Method**: `POST`  
**Description**: Register a hospital or clinic as a Solace partner.  
**Email Notification**: Sent upon successful registration with a unique referral code.

## Caregivers

The Caregivers endpoints manage the registration and certification of caregivers including doctors, nurses, therapists, nutritionists, and undertakers. Each registration action triggers an email notification.

### 1. Certified Professionals Registration (e.g Doctor)
**Endpoint**: `/v2/api/care-givers/doctor/register`  
**Method**: `POST`  
**Description**: Register certified professionals such as doctors, nurses, therapists, nutritionists, and undertakers.  
**Email Notification**: Sent upon successful registration.

## Lace AI

The Lace AI section provides an endpoint for users to join the waitlist for the upcoming AI-driven feature.

### 1. Join Waitlist
**Endpoint**: `/v2/api/lace-ai/waitlist/join`  
**Method**: `POST`  
**Description**: Allows users to join the waitlist for the upcoming Lace AI feature.  
**Email Notification**: Sent upon joining the waitlist.

## Dependencies

The following dependencies are required for the Solace application:

- **axios**: ^1.7.7
- **bcrypt**: ^5.1.1
- **body-parser**: ^1.20.2
- **cloudinary**: ^2.4.0
- **cors**: ^2.8.5
- **dotenv**: ^16.4.5
- **express**: ^4.19.2
- **jsonwebtoken**: ^9.0.2
- **migrate-mongo**: ^11.0.0
- **mongoose**: ^8.4.1
- **multer**: ^1.4.5-lts.1
- **paystack**: ^2.0.1
- **uuid**: ^10.0.0
- **zeptomail**: ^6.0.0

### Dev Dependencies

- **jest**: ^29.7.0
- **mongodb-memory-server**: ^9.3.0
- **nodemon**: ^2.0.22
- **supertest**: ^7.0.0

## Scripts

To manage the application, use the following npm scripts:

- **start**: `set NODE_ENV=production && node api/index.js` - Starts the application in production mode.
- **dev**: `nodemon ./api/index.js` - Starts the application in development mode with auto-reloading.
- **test**: `jest` - Runs tests using Jest.
- **build**: `npm run build` - Builds the application.