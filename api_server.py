import http.server
import socketserver
import json
import pickle
import pandas as pd
import numpy as np
import os

PORT = 5001
SOLAR_MODEL_PATH = os.path.join(os.path.dirname(__file__), "dash.pkl")
WIND_MODEL_PATH = os.path.join(os.path.dirname(__file__), "wind_dash.pkl")

# Load Solar Model
print(f"Loading Solar model from {SOLAR_MODEL_PATH}...")
with open(SOLAR_MODEL_PATH, "rb") as f:
    solar_model = pickle.load(f)
print("✅ Solar XGBoost model loaded successfully!")

# Load Wind Model
print(f"Loading Wind model from {WIND_MODEL_PATH}...")
with open(WIND_MODEL_PATH, "rb") as f:
    wind_model = pickle.load(f)
print("✅ Wind XGBoost model loaded successfully!")

class PredictionHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        # 1. SOLAR CLEANING PREDICTION ENDPOINT
        if self.path == "/api/predict_cleaning":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode("utf-8"))
                days_clean_val = float(data.get("days_since_cleaning", data.get("last_clean", 0)))

                features = {
                    "energy_production": float(data.get("energy_production", 0)),
                    "temperature": float(data.get("temperature", 25.0)),
                    "humidity": float(data.get("humidity", 50.0)),
                    "cloud_cover": float(data.get("cloud_cover", 20.0)),
                    "sunlight_intensity": float(data.get("sunlight_intensity", 500.0)),
                    "wind_speed": float(data.get("wind_speed", 5.0)),
                    "rainfall": float(data.get("rainfall", 0.0)),
                    "panel_temperature": float(data.get("panel_temperature", 30.0)),
                    "days_since_cleaning": days_clean_val,
                    "last_clean": days_clean_val
                }
                
                df_input = pd.DataFrame([features])
                prediction_class = int(solar_model.predict(df_input)[0])
                probabilities = solar_model.predict_proba(df_input)[0].tolist()
                confidence = float(np.max(probabilities)) * 100
                
                status_labels = [
                    "Optimal Condition - No Cleaning Required",
                    "Moderate Dust Accumulation - Cleaning Recommended Soon",
                    "Critical Soiling - Immediate Cleaning Required!"
                ]
                
                recommendations = [
                    "Solar panel output is optimal. No action needed.",
                    "Dust accumulation is slightly reducing output. Schedule cleaning within 3-5 days.",
                    "High dust buildup is significantly lowering efficiency. Dispatch cleaning crew immediately!"
                ]
                
                response_payload = {
                    "status": "success",
                    "prediction": prediction_class,
                    "confidence": round(confidence, 1),
                    "status_label": status_labels[prediction_class],
                    "recommendation": recommendations[prediction_class],
                    "probabilities": {
                        "class_0_clean": round(probabilities[0] * 100, 1),
                        "class_1_moderate": round(probabilities[1] * 100, 1),
                        "class_2_critical": round(probabilities[2] * 100, 1)
                    },
                    "features_received": features
                }
                
                self.send_response(200)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(response_payload).encode("utf-8"))
                
            except Exception as e:
                self.send_response(500)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode("utf-8"))

        # 2. WIND TURBINE FAULT PREDICTION ENDPOINT (Complete 13-feature set including rotor_speed)
        elif self.path == "/api/predict_wind_fault":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode("utf-8"))

                features = {
                    "wind_speed": float(data.get("wind_speed", 12.0)),
                    "wind_direction": float(data.get("wind_direction", 180.0)),
                    "temperature": float(data.get("temperature", 25.0)),
                    "pressure": float(data.get("pressure", 1013.0)),
                    "air_density": float(data.get("air_density", 1.225)),
                    "rotor_speed": float(data.get("rotor_speed", 18.0)),
                    "generator_speed": float(data.get("generator_speed", 1100.0)),
                    "blade_pitch_angle": float(data.get("blade_pitch_angle", 2.0)),
                    "power_output": float(data.get("power_output", 450.0)),
                    "gearbox_oil_temp": float(data.get("gearbox_oil_temp", 65.0)),
                    "generator_temp": float(data.get("generator_temp", 70.0)),
                    "vibration_level": float(data.get("vibration_level", 3.5)),
                    "alternator_voltage": float(data.get("alternator_voltage", 415.0))
                }
                
                df_input = pd.DataFrame([features])
                prediction_class = int(wind_model.predict(df_input)[0])
                probabilities = wind_model.predict_proba(df_input)[0].tolist()
                confidence = float(np.max(probabilities)) * 100
                
                status_labels = [
                    "All Wind Turbines Working Properly (Optimal)",
                    "Alternator / Electrical Voltage Fault Detected",
                    "Critical Mechanical Overheating / High Vibration Fault!"
                ]
                
                recommendations = [
                    "All wind turbine units operating normally within safety bounds. No maintenance required.",
                    "Alternator voltage fluctuation detected. Inspect alternator brushes, voltage regulator, and stator coils.",
                    "Critical thermal or vibration threshold exceeded! Dispatch turbine field engineers immediately to prevent unit damage."
                ]
                
                response_payload = {
                    "status": "success",
                    "prediction": prediction_class,
                    "confidence": round(confidence, 1),
                    "status_label": status_labels[prediction_class],
                    "recommendation": recommendations[prediction_class],
                    "probabilities": {
                        "class_0_normal": round(probabilities[0] * 100, 1),
                        "class_1_alternator_fault": round(probabilities[1] * 100, 1),
                        "class_2_critical_fault": round(probabilities[2] * 100, 1)
                    },
                    "features_received": features
                }
                
                self.send_response(200)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(response_payload).encode("utf-8"))
                
            except Exception as e:
                self.send_response(500)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode("utf-8"))

        else:
            self.send_response(404)
            self.end_headers()

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), PredictionHandler) as httpd:
        print(f"🚀 Prediction API Server running on http://localhost:{PORT}")
        httpd.serve_forever()
