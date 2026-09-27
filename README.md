# ThermoShelter Designer (SIH 2026 - Problem Statement SIH26051)

> **Software-based model development for design of area specific shelter for thermal comfort maintenance**

ThermoShelter Designer is a location-aware, engineering-grade passive shelter thermal simulation & optimization decision-support application built for extreme climates (such as Leh/Ladakh, Thar Desert, and Delhi).

---

## Technical Stack

- **Backend**: Python 3.10+, FastAPI, NumPy, Pydantic, Uvicorn
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, Recharts, Three.js, Lucide Icons
- **Thermal Physics Model**: 24-Hour Lumped-Capacitance Ordinary Differential Equation (ODE) numerical solver

---

## Key Features

1. **Location & Climate Integration (`/backend/climate_data.py`)**:
   - Built-in representative design-day datasets for **Leh (Ladakh - Extreme Cold)**, **Thar Desert (Rajasthan - Extreme Heat)**, and **Delhi (Subtropical)**.
   - Altitude, design outdoor temperature profiles, solar irradiance, and wind speed.
   - Modular, API-ready structure for integrating NASA POWER / Open-Meteo services.

2. **Physically Interpretable Thermal Physics Engine (`/backend/thermal_engine.py`)**:
   - Numerical integration of the 24-hour energy balance equation:
     $$\text{C}_{\text{in}} \frac{dT_{\text{in}}}{dt} = Q_{\text{solar}} + Q_{\text{internal}} - Q_{\text{conduction}} - Q_{\text{infiltration}}$$
   - Evaluates overall envelope heat transfer coefficient ($UA$), thermal flywheel capacity ($C_{\text{in}}$), solar gain through window orientation & shading coefficient (SHGC), occupants internal heat, and infiltration losses.
   - Calculates target thermal comfort ($18^\circ\text{C} - 26^\circ\text{C}$) hours and percentage.

3. **Parametric Search & Prototype Optimizer (`/backend/optimizer.py`)**:
   - Multi-attribute optimization grid search evaluating orientations, insulation thicknesses, window-to-wall ratios (WWR), and thermal mass levels.
   - Scores candidates based on comfort %, total heat loss, dry weight (kg), and material cost (INR).
   - Returns Top 3 candidate designs and generates dynamic trade-off explanations for the recommended shelter.

4. **Baseline vs. Passive Improved Comparison**:
   - Dual simulation pass through the exact same thermal engine comparing standard construction (thin insulation, high WWR, poor orientation) against optimized passive shelter design.

5. **3D Interactive Visualizer**:
   - Real-time Three.js canvas displaying 3D shelter dimensions, roof, window cutouts, cardinal North compass pointer, and dynamic temperature color tinting.

---

## How to Run the Application

### 1. Start the Backend Server (FastAPI)

Open a terminal window and navigate to `/backend`:

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

The API server will run at: `http://localhost:8000` (API Docs available at `http://localhost:8000/docs`).

### 2. Start the Frontend Development Server (React + Vite)

Open a second terminal window and navigate to `/frontend`:

```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## Project Structure

```
thermalshelter/
├── backend/
│   ├── climate_data.py      # Location climate datasets (Leh, Thar, Delhi)
│   ├── thermal_engine.py    # Lumped-capacitance 24h thermal simulation engine
│   ├── optimizer.py         # Parametric grid search optimizer & baseline comparison
│   ├── main.py              # FastAPI endpoints (/api/simulate, /api/optimize, /api/compare)
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx text badge & navigation
│   │   │   ├── LocationCard.tsx climate selector & environmental metadata
│   │   │   ├── ShelterInputsForm.tsx geometry, insulation, WWR, orientation controls
│   │   │   ├── ComfortMetrics.tsx KPI metrics (Comfort hours, heat loss, solar gain)
│   │   │   ├── ThermalGraphs.tsx Recharts 24h temperature & energy balance charts
│   │   │   ├── Shelter3DViewer.tsx Three.js 3D shelter visualizer & compass
│   │   │   ├── BaselineComparison.tsx side-by-side comparative table
│   │   │   ├── OptimizerCard.tsx Top 3 candidates & recommendation rationale
│   │   │   └── EngineeringDisclaimer.tsx decision-support disclaimer banner
│   │   ├── types/
│   │   │   └── shelter.ts TypeScript interfaces
│   │   ├── App.tsx central layout & API state manager
│   │   ├── main.tsx React entry point
│   │   └── index.css Tailwind CSS v4 design system
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## Engineering Disclaimer & Model Limitations

- **Engineering Disclaimer**: Prototype decision-support model. Results are illustrative lumped-capacitance ODE numerical simulations intended for preliminary architectural trade-off analysis and require full CFD/field validation prior to real-world defence deployment.
- **Model Scope**: Uses lumped-capacitance single-zone air balance. Does not replace full multi-zone 3D ANSYS/Fluent CFD calculations.
- **Future Enhancements**: Live NASA POWER API integration, Phase Change Material (PCM) thermal storage, DXF/STEP CAD model export, and multi-objective Pareto front (NSGA-II) search.
