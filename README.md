# EcoPilot: Enterprise ESG Management Platform

EcoPilot is a production-quality Enterprise ESG (Environmental, Social, and Governance) Management Platform designed to monitor corporate sustainability performance.

---

## 🚀 Tech Stack

### Frontend
*   **React 19 & TypeScript**
*   **Vite** (Build Tool)
*   **Tailwind CSS** (Utility Styling)
*   **React Router v6** (Client Routing)
*   **Axios** (API Client)
*   **React Hook Form & Zod** (State Validation)
*   **Lucide React** (Modern SVG Icons)
*   **Recharts** (Visual Analytics)
*   **Framer Motion** (Visual Transitions & Micro-animations)

### Backend
*   **FastAPI** (High Performance Async API)
*   **SQLAlchemy 2.0** (ORM)
*   **Alembic** (Database Migrations)
*   **Pydantic v2** (Data Validation)
*   **PyJWT** (JWT Authentication)
*   **Bcrypt** (Password Hashing)
*   **PostgreSQL** (Relational Database)

---

## 📁 Repository Structure

### Backend
```
backend/
├── alembic/                 # Alembic migration scripts
├── app/
│   ├── api/                 # Endpoint routers (v1 auth, users, health)
│   ├── config/              # Pydantic Settings settings.py
│   ├── constants/           # Global application constants
│   ├── core/                # Logging setup
│   ├── database/            # SQLAlchemy session configurations
│   ├── dependencies/        # Auth & role checking middleware injection
│   ├── exceptions/          # Custom exceptions & global exception handlers
│   ├── models/              # SQLAlchemy Database Models (Placeholders)
│   ├── repositories/        # Repository pattern interfaces
│   ├── schemas/             # Pydantic validation schemas
│   ├── security/            # BCrypt hashing & JWT utilities
│   ├── services/            # Service coordination layer
│   ├── utils/               # Common helper utilities
│   ├── tests/               # Test suites (pytest)
│   └── __init__.py
├── requirements.txt         # Python dependencies
└── alembic.ini              # Alembic config
```

### Frontend
```
frontend/
├── src/
│   ├── assets/              # Static media assets
│   ├── components/          # Reusable UI controls (Buttons, inputs, modals, stats)
│   ├── constants/           # Shared client constants
│   ├── context/             # Theme context, Auth session provider
│   ├── hooks/               # Custom React hooks
│   ├── layouts/             # Sidebar, Navbar, Footer, Page Layouts
│   ├── pages/               # Dashboard, Environmental, Social, Governance pages
│   ├── routes/              # Client side routing paths
│   ├── services/            # Axios API instances
│   ├── store/               # State store (Zustand/Redux placeholders)
│   ├── styles/              # Global custom style tokens
│   ├── types/               # TypeScript interfaces
│   └── utils/               # Date/String utilities
├── tailwind.config.js       # Design tokens & color system
├── postcss.config.js
└── package.json             # NPM package dependencies
```

---

## 🛠️ Getting Started

### Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Set up a virtual environment:
    ```bash
    python3 -m venv .venv
    source .venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run database migrations (after setting up a local PostgreSQL database URL in `.env`):
    ```bash
    alembic upgrade head
    ```
5.  Start the development server:
    ```bash
    uvicorn app.main:app --reload --port 8000
    ```

### Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

---

## 🔒 Demo Authentication
To access the platform, sign in with the following preset credentials:
*   **Email:** `analyst@ecopilot.com`
*   **Password:** `password123`

Deepak Bosudi
