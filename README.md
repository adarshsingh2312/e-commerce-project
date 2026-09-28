# eMART — Premium Fashion E-Commerce Platform
Website Link-: https://emartcom.vercel.app

eMART is a full-stack, production-grade e-commerce web application designed with a modern, high-contrast, clean sans-serif aesthetic inspired by industry leaders like Myntra and Amazon.

It is built using a decoupled architecture, pairing a responsive, state-managed React frontend with a secure Spring Boot (Java) REST API backend.

---

## 🚀 Key Features

### 🛒 Customer Experience
* **Dual Authentication System (JWT & Google OAuth2)**: Supports both traditional email/password credentials and one-click "Continue with Google" OAuth2 single sign-on (SSO), backed by custom JWT token issuance, automated profile generation, initial cart setup, and unified session management.
* **Dynamic Catalog & Smart Filtering**: Client-side categorization, case-insensitive gender filtering (Men/Women/Accessories), and catalog sorting synced dynamically.
* **Size-Specific Inventory Management**: Interactive size and quantity selectors that validate real-time stock levels prior to checkout.
* **Real-time Shopping Bag**: State-managed shopping cart context with real-time price summation, Indian numbering currency formatting (₹), and quantity thresholds.
* **Profile & Checkout Address Book**: Save multiple delivery addresses in the user profile, delete unwanted locations, and choose from saved addresses during checkout.
* **Flexible Payments Integration**: Seamless integration with the Razorpay payment gateway for cards/UPI, alongside robust Cash on Delivery (COD) processing.
* **Secure Order Cancellation**: Allows users to cancel their orders directly from the Order Details page with real-time stock restoration, available until the order is delivered.
* **Social Interactions**: Star ratings and feedback logs, enabling registered users to write reviews directly on product sheets.
* **Support & Engagement**: A Contact Us form for customer queries and a newsletter subscription field.

### 🛡️ Administrative Portal
* **Role-Based Access Control**: Route guards (PrivateRoute and AdminRoute) that secure private customer transactions and isolate administrative tools.
* **Inventory Workspace**: CRUD dashboard for adding new arrivals, adjusting description details, color sets, stock counts, and deleting discontinued models.
* **Order Fulfillment Operations**: Complete registry of all system invoices allowing admins to confirm, ship, cancel, or delete orders.
* **Payments & Revenue Dashboard**: Premium, Materio-inspired analytics workspace displaying gross revenue, average order values, and success rates, visualized using responsive Recharts graphs.

---

## 🛠️ Technology Stack

### **Frontend**
* **Framework**: React (Vite)
* **Authentication Flow**: Google OAuth2 Redirect & Callback Handler, JWT Storage in Context
* **Styling**: Tailwind CSS v4 (Vanilla CSS variables)
* **Charts**: Recharts
* **Icons**: Lucide React
* **Routing**: React Router v6
* **Client Communication**: Axios (with custom request/response JWT interceptors)
* **Alert Notifications**: React Hot Toast

### **Backend**
* **Framework**: Spring Boot (Java 17+)
* **Security & Auth**: Spring Security 6, OAuth2 Client (`spring-boot-starter-oauth2-client`), Google Identity, JJWT (HMAC SHA)
* **SDK Integration**: Razorpay Java SDK
* **Database Access**: Spring Data JPA (Hibernate)
* **Database**: MySQL / H2
* **Build Tool**: Maven
