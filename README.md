# Parlay Tracker

A comprehensive web application for tracking and analyzing sports parlay betting performance. Users can log their parlay bets, track wins and losses, and gain insights through detailed analytics and visualizations to refine their betting strategy. This project aims to empower sports bettors with clear, actionable data to make smarter betting decisions and improve long-term outcomes.

---

## Built With

### Frontend
- **Framework**: React (with Vite)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Authentication**: Google OAuth

### Backend
- **Runtime**: Node.js (with Express)
- **Database**: PostgreSQL
- **Authentication**: Google OAuth + JWT

---

## Features

### **Parlay Management**
- **Add Parlays**: Log individual parlay bets with date, amount risked, number of legs, and outcome
- **Edit & Delete**: Modify or remove existing parlay entries
- **Win/Loss Tracking**: Record whether each parlay was successful and payout amounts for wins

### **Analytics Dashboard**
- **Performance Metrics**: Track total amount risked, win rate, total parlays, and net profit/loss
- **Interactive Charts**: Color-coded visualizations for profit/loss trends, leg distributions, and performance tracking
- **Data Visualization**: Interactive charts with drill-downs from monthly to daily metrics and filters to customize your analysis


---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Google OAuth credentials

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/RoeyR1/ParlayTracker.git
   cd ParlayTracker
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**:
   ```bash
   cd ../parlay-app
   npm install
   ```

4. **Environment Configuration**:
    
     Create a .env file in the backend directory and define the following variables (replace placeholders with your credentials):
     ```
     # Database Configuration
     DB_USER=your_postgres_username
     DB_HOST=localhost
     DB_NAME=your_database_name
     DB_PASSWORD=your_postgres_password
     DB_PORT=5432
     
     # Authentication
     JWT_SECRET=your_jwt_secret_key
     GOOGLE_CLIENT_ID=your_google_oauth_client_id
     ```

### Running the Application

1. **Start the Backend Server**:
   ```bash
   cd backend
   npm run server
   ```

2. **Start the Frontend Development Server**:
   ```bash
   cd parlay-app
   npm run dev
   ```

3. **Access the Application**:
   - Navigate to the application URL
   - Sign in with your Google account
   - Start tracking your parlays!

---

## Usage

1. **Adding Parlays**: Click "Add New Parlay" to log a new bet with date, legs, amount, and outcome
2. **Viewing Analytics**: Switch to the Analytics tab to explore performance metrics and trends
3. **Managing Data**: Edit or delete parlays using the action buttons on each entry
4. **Analyzing Charts**: Click on monthly bars to drill down to daily views, apply filters to tailor your insights.

---