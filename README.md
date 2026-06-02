# 🥟 Radhe Momos - Full Stack Restaurant Platform

**Live Application:** 

This is a custom, real-time food ordering platform built from the ground up for a local restaurant. It replaces third-party apps like Swiggy by allowing the restaurant to take orders and update customers directly.

## 🚀 Key Features
* **Real-Time Order Tracking:** Customers watch their order status update instantly (Pending -> Cooking -> Delivered) without refreshing the page, powered by WebSockets.
* **Smart Auto-Fill:** Integrated the browser's Geolocation API to instantly translate user GPS coordinates into a physical street address at checkout.
* **Secure Admin Dashboard:** A protected management portal where the restaurant owner can track active orders, update statuses, and clear completed tickets.

## 🛠️ The Tech Stack
* **Frontend:** React.js, Tailwind CSS, Vite
* **Backend:** Node.js, Express.js *(Backend code located in a separate repository)*
* **Database:** MongoDB (with Mongoose schemas)
* **Real-Time Infrastructure:** Socket.io
* **Hosting:** Vercel (Frontend) & Render (Backend)
