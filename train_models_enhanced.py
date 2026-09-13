import pandas as pd
import numpy as np
import json
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, 
    roc_auc_score, confusion_matrix, classification_report
)

csv_path = "/Users/rahulkumar/Desktop/project/solar_panel_data.csv"
df = pd.read_csv(csv_path)

# Feature Engineering
df_feat = df.copy()
df_feat['temp_diff'] = df_feat['panel_temperature'] - df_feat['temperature']
df_feat['sunlight_effective'] = df_feat['sunlight_intensity'] * (1 - df_feat['cloud_cover'] / 100.0)
df_feat['dust_accumulation_index'] = df_feat['days_since_cleaning'] * (1 + df_feat['wind_speed'] / 10.0)
df_feat['efficiency_proxy'] = df_feat['energy_production'] / (df_feat['sunlight_intensity'] + 0.1)

X = df_feat.drop(columns=['cleaning_required'])
y = df_feat['cleaning_required']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print("--- Running Tuned Models with Feature Engineering ---")

# 1. Random Forest (Tuned)
rf_clf = RandomForestClassifier(
    n_estimators=200,
    max_depth=12,
    min_samples_split=5,
    class_weight='balanced',
    random_state=42,
    n_jobs=-1
)
rf_clf.fit(X_train, y_train)

y_pred_rf = rf_clf.predict(X_test)
y_prob_rf = rf_clf.predict_proba(X_test)

rf_metrics = {
    "accuracy": float(accuracy_score(y_test, y_pred_rf)),
    "precision_weighted": float(precision_score(y_test, y_pred_rf, average='weighted')),
    "precision_macro": float(precision_score(y_test, y_pred_rf, average='macro')),
    "recall_weighted": float(recall_score(y_test, y_pred_rf, average='weighted')),
    "recall_macro": float(recall_score(y_test, y_pred_rf, average='macro')),
    "f1_weighted": float(f1_score(y_test, y_pred_rf, average='weighted')),
    "f1_macro": float(f1_score(y_test, y_pred_rf, average='macro')),
    "roc_auc_ovr_weighted": float(roc_auc_score(y_test, y_prob_rf, multi_class='ovr', average='weighted')),
    "confusion_matrix": confusion_matrix(y_test, y_pred_rf).tolist(),
    "classification_report": classification_report(y_test, y_pred_rf, output_dict=True),
    "feature_importances": dict(zip(X.columns, [float(v) for v in rf_clf.feature_importances_]))
}

# 2. XGBoost (Tuned)
# Compute sample weights or scale_pos_weight
class_counts = y_train.value_counts().to_dict()
total_samples = len(y_train)
class_weights = {cls: total_samples / (len(class_counts) * count) for cls, count in class_counts.items()}
sample_weights = y_train.map(class_weights)

xgb_clf = XGBClassifier(
    n_estimators=200,
    max_depth=5,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    eval_metric='mlogloss',
    objective='multi:softprob'
)
xgb_clf.fit(X_train, y_train, sample_weight=sample_weights)

y_pred_xgb = xgb_clf.predict(X_test)
y_prob_xgb = xgb_clf.predict_proba(X_test)

xgb_metrics = {
    "accuracy": float(accuracy_score(y_test, y_pred_xgb)),
    "precision_weighted": float(precision_score(y_test, y_pred_xgb, average='weighted')),
    "precision_macro": float(precision_score(y_test, y_pred_xgb, average='macro')),
    "recall_weighted": float(recall_score(y_test, y_pred_xgb, average='weighted')),
    "recall_macro": float(recall_score(y_test, y_pred_xgb, average='macro')),
    "f1_weighted": float(f1_score(y_test, y_pred_xgb, average='weighted')),
    "f1_macro": float(f1_score(y_test, y_pred_xgb, average='macro')),
    "roc_auc_ovr_weighted": float(roc_auc_score(y_test, y_prob_xgb, multi_class='ovr', average='weighted')),
    "confusion_matrix": confusion_matrix(y_test, y_pred_xgb).tolist(),
    "classification_report": classification_report(y_test, y_pred_xgb, output_dict=True),
    "feature_importances": dict(zip(X.columns, [float(v) for v in xgb_clf.feature_importances_]))
}

results = {
    "RandomForest_Tuned": rf_metrics,
    "XGBoost_Tuned": xgb_metrics
}

print("\n=================== Random Forest (Tuned) ===================")
print(f"Accuracy:           {rf_metrics['accuracy']:.4f} ({rf_metrics['accuracy']*100:.2f}%)")
print(f"Precision (Weighted):{rf_metrics['precision_weighted']:.4f} ({rf_metrics['precision_weighted']*100:.2f}%)")
print(f"Precision (Macro):   {rf_metrics['precision_macro']:.4f} ({rf_metrics['precision_macro']*100:.2f}%)")
print(f"Recall (Weighted):   {rf_metrics['recall_weighted']:.4f}")
print(f"F1 Score (Weighted): {rf_metrics['f1_weighted']:.4f}")
print(f"ROC-AUC (OvR Wtd):   {rf_metrics['roc_auc_ovr_weighted']:.4f}")

print("\n===================== XGBoost (Tuned) =====================")
print(f"Accuracy:           {xgb_metrics['accuracy']:.4f} ({xgb_metrics['accuracy']*100:.2f}%)")
print(f"Precision (Weighted):{xgb_metrics['precision_weighted']:.4f} ({xgb_metrics['precision_weighted']*100:.2f}%)")
print(f"Precision (Macro):   {xgb_metrics['precision_macro']:.4f} ({xgb_metrics['precision_macro']*100:.2f}%)")
print(f"Recall (Weighted):   {xgb_metrics['recall_weighted']:.4f}")
print(f"F1 Score (Weighted): {xgb_metrics['f1_weighted']:.4f}")
print(f"ROC-AUC (OvR Wtd):   {xgb_metrics['roc_auc_ovr_weighted']:.4f}")

# Save JSON
json_path = "/Users/rahulkumar/.gemini/antigravity-ide/brain/88fdd4b5-017b-460d-aeec-53d7bad9290f/scratch/model_results_tuned.json"
with open(json_path, "w") as f:
    json.dump(results, f, indent=2)

print(f"\nSaved tuned comparison results to {json_path}")
