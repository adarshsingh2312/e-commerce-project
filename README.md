# eMART — Premium Fashion E-Commerce Platform

eMART is a full-stack, production-grade e-commerce web application designed with a modern, high-contrast, clean sans-serif aesthetic inspired by industry leaders like Myntra and Amazon.

It is built using a decoupled architecture, pairing a responsive, state-managed React frontend with a secure Spring Boot (Java) REST API backend.

---

## 🚀 Key Features

### 🛒 Customer Experience
* **Secure Authentication (JWT)**: JSON Web Token-based user sessions supporting credentials validation, local token caching, and automatic logouts on session expiration.
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
* **Styling**: Tailwind CSS v4 (Vanilla CSS variables)
* **Charts**: Recharts
* **Icons**: Lucide React
* **Routing**: React Router v6
* **Client Communication**: Axios (with custom request/response JWT interceptors)
* **Alert Notifications**: React Hot Toast

### **Backend**
* **Framework**: Spring Boot (Java 17+)
* **Security**: Spring Security & JWT tokens
* **SDK Integration**: Razorpay Java SDK
* **Database Access**: Spring Data JPA (Hibernate)
* **Database**: MySQL / H2
* **Build Tool**: Maven
