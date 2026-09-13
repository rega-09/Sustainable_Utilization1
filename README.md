# EcoGrid - Sustainable Utilization Dashboard

EcoGrid is a modern, real-time energy monitoring dashboard for Solar and Wind power plants. It features stunning glassmorphism UI elements, live data integrations, and advanced Artificial Intelligence (AI) predictive engines powered by XGBoost.

## 🌟 Key Features

### 1. General Architecture
- **Stunning UI/UX:** Built with React, featuring sleek glassmorphism, dynamic animations, and responsive grids.
- **Microservices Architecture:** A React frontend decoupled from a robust Python ML API Backend Server.

### 2. ☀️ Solar Power Plant Monitoring
- **Live Generation Data:** View current power output, plant health, and environmental data.
- **Customizable Capacity:** Manually override and set the total plant capacity (default: 800kW).
- **Maintenance Tracking:** Date picker integration to log the last manual cleaning date for the solar panels.
- **AI Cleaning Predictor (`dash.pkl`):** An XGBoost Classifier that takes live solar telemetry and the last cleaning date as input to predict whether the solar panels require immediate cleaning to maintain optimal efficiency.

### 3. 🌬️ Wind Power Plant Monitoring
- **Real-Time Aerodynamic Telemetry:** Integrates live environmental data via a weather API (temperature, pressure, air density, wind speed, wind direction).
- **Turbine Mechanical & Electrical Health:** Live rendering of rotor speed, generator speed, blade pitch angle, alternator voltage, gearbox oil temperature, generator temperature, and vibration levels.
- **Customizable Capacity & Fault Simulator:** Adjust plant capacity (default: 600kW) and manually trigger alternator/mechanical faults using telemetry sliders for testing.
- **Dynamic Energy Dispatch Flow:** Visual representation of wind farm node availability and power routing.
- **AI Fault Prediction Engine (`wind_dash.pkl`):** A high-accuracy XGBoost ML Model that evaluates live telemetry to classify the system into three states:
  - `Class 0`: Normal Operation
  - `Class 1`: Alternator / Electrical Voltage Fault
  - `Class 2`: Critical Mechanical Overheating / High Vibration Fault

## 🚀 Tech Stack

- **Frontend:** React, Vite, Recharts, Vanilla CSS
- **Backend (ML Inference):** Python 3, HTTP.server / Flask, Pandas
- **Machine Learning:** XGBoost (Classification)

## 🛠️ How to Run the Project Locally

To run the EcoGrid dashboard, you need to start both the React frontend and the Python backend server.

### 1. Start the React Frontend
Open a terminal in the root directory of the project and run:
```bash
npm install
npm run dev
```
The dashboard will be available at `http://localhost:5173`.

### 2. Start the Python AI Backend Server
In a separate terminal, navigate to the root directory and start the inference server to enable the ML Prediction engines:
```bash
python3 api_server.py
```
The server will start on port `5001` and handle incoming ML prediction requests from the dashboard.

---
*Built for a sustainable and optimized energy future.*
