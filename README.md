# Dairy Management System (minimal)

Simple Node.js + Express app demonstrating three roles: admin, delivery partner, and customer.

How to run (Windows PowerShell):

1. Install dependencies

   npm install

2. Start server

   npm start

3. Open browser: http://localhost:3000

API endpoints:
- POST /api/admin/partner { name, phone } -> add partner
- POST /api/admin/delivery { date (YYYY-MM-DD), address, liters, partnerId?, customerId? }
- GET /api/partner/:id/deliveries -> partner's deliveries for today
- GET /api/customer/:id/plan -> customer's plan for today
- POST /api/customer/:id/extra { extraLiters }

Notes:
- This is a minimal prototype using file-based persistence in `data.json`.
- For production, switch to a real database and add authentication.
