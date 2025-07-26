# Madad FinTech - MSME Lender Assignment Platform

A comprehensive **Node.js Express + React** application for MSME (Micro, Small & Medium Enterprises) lender assignment and credit evaluation system.

## 🏗️ Architecture

This application uses a **Node.js Express + React** architecture with clear separation between backend and frontend:

- **Backend**: Node.js + Express API server (Port 5000)
- **Frontend**: React with Create React App (Port 3000)  
- **Database**: File-based JSON storage with race condition handling
- **UI**: Tailwind CSS + Radix UI components
- **UUID Management**: Automatic UUID generation and validation for data integrity

## ✨ Key Features

### MSME Portal
- **Application Submission**: Complete business and financial information forms
- **Document Upload**: Support for Commercial Registration, Trade License, Bank Statements, Audited Reports
- **Real-time Lender Matching**: Intelligent assignment based on credit score and document completeness
- **Credit Limit Calculation**: Sophisticated algorithm with compound multipliers
- **Reset & Sample Data**: Testing capabilities with pre-filled data

### Lender Portal  
- **Complete CRUD Operations**: Add, edit, delete, and view lenders
- **Comprehensive Criteria Management**: Credit score thresholds, document multipliers, bank statement and audited report multipliers
- **Smart Reset Functionality**: Restore default lenders while preserving user-added lenders
- **UUID-based Identification**: Robust lender identification system

### Backend API
- **RESTful Endpoints**: Standardized {success: true, data: []} response format
- **Dual Storage Options**: MongoDB (production) or JSON files (development)
- **Race Condition Handling**: Safe concurrent access with proper locking
- **Error Handling**: Comprehensive error responses and logging

## 🧮 Credit Calculation Algorithm

The system implements a sophisticated credit limit calculation based on business specifications:

```
Credit Limit = Monthly Transaction × Credit Score Multiplier × Document Multiplier × Bank Statement Multiplier × Audited Report Multiplier
```

### Multiplier System:
- **Credit Score Multipliers**: Based on lender-specific thresholds (High/Medium/Low)
- **Document Multipliers**: Rewards complete documentation (All 4 docs = highest multiplier)
- **Bank Statement Multiplier**: Additional multiplier for bank statement availability
- **Audited Report Multiplier**: Additional multiplier for audited financial reports

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
git clone https://github.com/kalaivania/madad-exercise.git
cd madad-exercise
npm run install-all
```

This will install dependencies for:
- Root project (for development scripts)
- Server (Node.js Express API)
- Client (React application)

### 🗄️ Database Setup (Choose One)

#### Option A: MongoDB Atlas (Recommended for Production)
1. **Set up MongoDB Atlas** (see `server/MONGODB_SETUP.md` for detailed guide)
2. **Configure environment variables** in `server/.env`
3. **Test connection**: `cd server && npm run test:mongo`

#### Option B: Local Development (JSON Files)
- No additional setup required
- Data stored in `server/data/*.json` files

2. **Start development servers:**
```bash
# With MongoDB (default)
npm run dev

# Or with JSON files (legacy)
cd server && npm run dev:json
cd client && npm start
```

This will start:
- Backend server on http://localhost:5000
- Frontend server on http://localhost:3000

### Production Build

\`\`\`bash
npm run build
npm start
\`\`\`

## 📁 Project Structure

madad-exercise/
├── server/                 # Node.js API server
│   ├── routes/            # API routes
│   ├── lib/               # Data storage utilities
│   ├── utils/             # Business logic
│   └── index.js           # Server entry point
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   └── App.js         # Main app component
│   └── public/            # Static assets
└── package.json           # Root package.json

## 🔧 API Endpoints

### Applications
- `GET /api/applications` - Get all applications
- `POST /api/applications` - Create new application
- `PUT /api/applications/:id` - Update application
- `POST /api/applications/calculate-assignment` - Calculate lender assignments

### Lenders
- `GET /api/lenders` - Get all lenders
- `POST /api/lenders` - Create new lender
- `PUT /api/lenders/:id` - Update lender
- `DELETE /api/lenders/:id` - Delete lender
- `POST /api/lenders/reset` - Reset to default lenders

## 🛠️ Development

### Available Scripts

- `npm run install-all` - Install all dependencies
- `npm run dev` - Start both servers in development
- `npm run server` - Start only backend server
- `npm run client` - Start only frontend server
- `npm run build` - Build for production
- `npm start` - Start production server
