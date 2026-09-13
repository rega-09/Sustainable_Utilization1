// Simulate AI Predictive Maintenance Engine
// In the future, this file will interface with a real ML API / Python backend

// A pool of realistic simulated anomaly scenarios for the SIH Demo
const anomalyScenarios = [
  {
    source: "☀ SOLAR FARM",
    unit: "PANEL ARRAY 03",
    severity: "WARNING",
    title: "Solar panel cleaning required",
    reason: "Generation is 13.1% below the expected output for the current solar intensity.",
    confidence: 92,
    recommendation: "Schedule solar panel cleaning and inspect for dust/shading.",
    getSensorData: () => [
      { label: "Solar intensity", value: "780 W/m²" },
      { label: "Expected generation", value: "420 kW" },
      { label: "Actual generation", value: "365 kW" },
      { label: "Deviation", value: "13.1%" }
    ]
  },
  {
    source: "☀ SOLAR FARM",
    unit: "STRING 04",
    severity: "CRITICAL",
    title: "Possible string fault detected",
    reason: "Voltage output is significantly below the expected voltage for the current solar intensity.",
    confidence: 96,
    recommendation: "Inspect String 04, connectors and inverter input immediately.",
    getSensorData: () => [
      { label: "Solar intensity", value: "810 W/m²" },
      { label: "Expected voltage", value: "410 V" },
      { label: "Detected voltage", value: "325 V" }
    ]
  },
  {
    source: "🌬 WIND FARM",
    unit: "UNIT 05",
    severity: "CRITICAL",
    title: "Wind turbine unit shutdown detected",
    reason: "Wind speed is sufficient for generation, but Unit 05 output is zero.",
    confidence: 98,
    recommendation: "Inspect turbine controller, generator and protection system.",
    getSensorData: () => [
      { label: "Wind speed", value: "11.8 m/s" },
      { label: "Expected generation", value: "180 kW" },
      { label: "Actual generation", value: "0 kW" }
    ]
  },
  {
    source: "🌬 WIND FARM",
    unit: "UNIT 02",
    severity: "WARNING",
    title: "Abnormal vibration pattern detected",
    reason: "Vibration level on the main shaft is above the normal operating range.",
    confidence: 89,
    recommendation: "Schedule inspection of bearings and rotating components.",
    getSensorData: () => [
      { label: "Current vibration", value: "7.8 mm/s" },
      { label: "Normal range", value: "< 5 mm/s" }
    ]
  },
  {
    source: "💧 HYDRO PLANT",
    unit: "ALTERNATOR 02",
    severity: "WARNING",
    title: "Alternator maintenance required",
    reason: "Temperature and output-current pattern indicates abnormal operating behavior.",
    confidence: 91,
    recommendation: "Inspect alternator cooling system and bearings.",
    getSensorData: () => [
      { label: "Temperature", value: "82°C" },
      { label: "Normal operating range", value: "< 75°C" }
    ]
  },
  {
    source: "💧 HYDRO PLANT",
    unit: "TURBINE 01",
    severity: "INFO",
    title: "Efficiency degradation predicted",
    reason: "Current water flow is normal but power output is lower than the historical expected value.",
    confidence: 87,
    recommendation: "Schedule turbine efficiency inspection during next downtime.",
    getSensorData: () => [
      { label: "Water flow", value: "84%" },
      { label: "Expected output", value: "310 kW" },
      { label: "Actual output", value: "276 kW" }
    ]
  },
  {
    source: "🔋 BATTERY STORAGE",
    unit: "MODULE B-02",
    severity: "WARNING",
    title: "Cell voltage imbalance detected",
    reason: "Voltage delta between cells exceeds 50mV during discharge cycle.",
    confidence: 94,
    recommendation: "Trigger active cell balancing protocol; monitor thermal output.",
    getSensorData: () => [
      { label: "Max cell voltage", value: "4.12 V" },
      { label: "Min cell voltage", value: "4.01 V" },
      { label: "Voltage delta", value: "110 mV" }
    ]
  }
];

class AIPredictionService {
  constructor() {
    this.alertHistory = [];
  }

  // Returns null if no anomaly, or an anomaly object if detected
  simulatePrediction() {
    // 30% chance of generating a new anomaly during each polling cycle for demo purposes
    if (Math.random() > 0.3) {
      return null; 
    }

    // Pick a random scenario
    const scenario = anomalyScenarios[Math.floor(Math.random() * anomalyScenarios.length)];
    
    const newAlert = {
      id: `ai-alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      source: scenario.source,
      unit: scenario.unit,
      severity: scenario.severity,
      title: scenario.title,
      description: scenario.reason, // short description
      sensorData: scenario.getSensorData(),
      confidence: scenario.confidence - Math.floor(Math.random() * 5), // slight randomization
      recommendation: scenario.recommendation,
      timestamp: Date.now(),
      reason: scenario.reason
    };

    return newAlert;
  }
}

export const predictionEngine = new AIPredictionService();
