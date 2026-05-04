# Luxe — Modern E-Commerce Platform

![Logo](frontend/logo.png)

Luxe is a premium, full-stack e-commerce solution designed to provide a seamless shopping experience for users and a robust management system for administrators. Built with a modern tech stack, it emphasizes performance, security, and a sophisticated aesthetic.

---

## 🌟 Purpose

The purpose of **BasantiShop (Luxe)** is to demonstrate a production-ready e-commerce ecosystem. It bridges the gap between a high-end customer storefront and a data-driven administrative backend, showcasing how modern web technologies can handle complex business logic, real-time analytics, and secure transactions.

---

## ✨ Unique Features

-   **Order Lifecycle & Negotiation**: Admins can negotiate final totals with customers, moving orders through statuses from `PENDING` to `DELIVERED`, with automatic stock management.
-   **Profit & Loss Analytics**: Real-time financial tracking that calculates profit based on cost per unit and negotiated sale prices.
-   **Activity Logging**: A dedicated audit trail for administrators, tracking system changes like product CRUD, order updates, and admin logins.
-   **Cloud-Powered Media**: Seamless image management for products using **Cloudinary** integration.
-   **Sophisticated Customer Tools**: Personalized dashboards, order history, and integrated shop/product review systems.
-   **Secure & Scalable**: Implementation of JWT-based auth, Zod validation, rate limiting, and a clean RESTful architecture.

---

## 🛠️ Technical Skills Demonstrated

This project showcases a wide range of professional software engineering skills:

### Frontend Excellence
-   **React 18 & TypeScript**: Building scalable, type-safe UI components.
-   **Vite 5**: Optimized build tooling for a fast development experience.
-   **Tailwind CSS**: Custom, responsive design systems with a focus on modern aesthetics.
-   **React Hook Form & Zod**: Robust form handling and client-side validation.

### Backend Prowess
-   **Node.js & Express 5**: Designing RESTful APIs with advanced middleware patterns.
-   **Prisma ORM & PostgreSQL**: Complex data modeling, migrations, and efficient relationship management.
-   **Security Architecture**: Password hashing (BcryptJS), JWT authentication, Helmet headers, and CORS protection.
-   **Advanced Logic**: Complex order lifecycle management, stock reconciliation, and financial analytics.

---

## 📸 Visual Showcase

### 🎥 Customer Experience Walkthrough
> *A quick look at the storefront, product catalog, and checkout flow.*

![Customer Demo Video](./Screencast%20from%202026-05-04%2018-40-23.webm)

---

### 🎥 Admin Dashboard & Management
> *Deep dive into the administrative tools, analytics, and order management.*

![Admin Demo Video](./Screencast%20from%202026-05-04%2018-48-34.webm)

---

### Customer Storefront
> *A clean and inviting interface designed to convert visitors into customers.*

![Home Page Screenshot](https://via.placeholder.com/800x450?text=Home+Page+Screenshot)
*Home page featuring curated collections and featured products.*

![Product Catalog](https://via.placeholder.com/800x450?text=Shop+Page+Screenshot)
*Advanced filtering and search capabilities.*

### Admin Dashboard
> *The command center for business operations.*

![Admin Analytics](https://via.placeholder.com/800x450?text=Analytics+Dashboard+Screenshot)
*Visualizing sales data and customer engagement.*

![Order Management](https://via.placeholder.com/800x450?text=Order+Management+Screenshot)
*Streamlined workflow for processing and tracking orders.*

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- PostgreSQL
- Cloudinary Account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/BasantiShop.git
   cd BasantiShop
   ```

2. **Setup Backend**
   ```bash
   cd Backend
   npm install
   # Create .env (use .env.example as a template)
   npx prisma migrate dev
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   # Create .env (VITE_API_BASE_URL=http://localhost:8000/api)
   npm run dev
   ```

---

## 📄 License

This project is licensed under the MIT License.

---

*Built with ❤️ by [Your Name/Soumik]*
