# CAV Farming Technologies (Cultura Ad Verticem)

CAV (Cultura Ad Verticem — "Cultivation towards the peak") is a state-of-the-art, AI-orchestrated vertical farming platform. It manages the growth, relocation, and harvesting of precision crops across a massive 10,000-module automated facility.

## 🚀 What the Project Does

The platform allows clients (B2B or consumers) to order specific quantities of crops (e.g., kilograms of lettuce or tomatoes) and track their growth in real-time. The system automatically handles the logistics of planting and nurturing the crops.

### Key Features:
1. **Automated Quoting & Ordering**: Customers specify the exact kilograms of crops they need. The system's algorithm instantly calculates how many plant spots are required and provides an estimated harvest date based on current facility capacity.
2. **Live Facility Map**: A visual, interactive dashboard where users can see the status of all 10,000 modules in the facility. Users can zoom into specific modules to see the exact row and spot where their plants are growing, along with a countdown to harvest.
3. **AI Smart Relocation**: The system simulates robotic arms that relocate plants overnight to the highest-yield modules to optimize lighting and nutrients, accelerating growth.
4. **Order Tracking Timeline**: Clients have full visibility into their order timeline: Ordered → Confirmed → Growing (with a live progress bar) → Harvested → Delivered.

---

## 🛠️ Technology Stack & Architecture

The project is built using a modern, scalable microservices architecture split between a web frontend and an algorithmic processing backend.

### 1. Web Application (Frontend & API)
The user-facing application where clients log in, place orders, and view the facility map.
* **Framework**: [Next.js](https://nextjs.org/) (React) using the App Router.
* **Styling**: Tailwind CSS combined with custom Vanilla CSS for premium visual aesthetics (glassmorphism, animated background orbs, bento-grid layouts).
* **State Management**: React Query (`@tanstack/react-query`) for real-time data fetching and polling.
* **Authentication**: NextAuth.js for secure user login and session management.
* **Deployment**: Hosted on **Vercel** (`https://web-sandy-alpha-61.vercel.app`).

### 2. Database & ORM
The central source of truth for users, orders, 10,000+ plant spots, and robot jobs.
* **Database**: **PostgreSQL** hosted on [Neon.tech](https://neon.tech/) for serverless scalability.
* **ORM**: **Prisma** (`schema.prisma`) is used to cleanly map database tables to TypeScript objects and handle migrations.
* **Caching/Queuing**: **Redis** hosted on [Upstash](https://upstash.com/) for handling rapid state changes and queueing robotic jobs.

### 3. Algorithm Service (Backend)
A dedicated microservice that handles the heavy mathematical lifting, keeping the web server fast.
* **Framework**: **Python FastAPI** (Asynchronous API).
* **Database Driver**: `asyncpg` for high-performance direct database connections.
* **Responsibilities**: 
  * Calculating growth estimates and quoting harvest dates based on current facility load.
  * Optimizing plant placement across the 10,000 modules.
  * Simulating and managing automated "Robot Jobs" (Planting, Relocating, Harvesting).
* **Deployment**: Hosted on **Render** (`https://cav-tu3f.onrender.com`).

---

## 🗄️ Core Database Schema

The system relies on a highly structured relational database:
* **Users**: Stores client credentials and roles (Buyer/Admin).
* **Orders**: Tracks the requested crop type, quantity in kg, status, and timeline dates.
* **Spots**: Represents the physical facility. Contains 10,000+ entries tracking `module_number`, `row_number`, and `spot_number`, along with environmental growth multipliers.
* **Plants**: Links a physical plant to an Order and a physical Spot, tracking its exact planted date and expected harvest date.
* **RobotJobs**: A queue system for automated machinery, tracking tasks to move a plant from one `Spot` to another.

## 🔗 External Integrations
The architecture is designed to allow external hardware (like IoT sensors or actual robotic arms) or analytics dashboards (like PowerBI) to connect directly to the Neon PostgreSQL database via restricted Read-Only roles to monitor the facility in real time.
