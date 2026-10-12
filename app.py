from flask import Flask, render_template, request, jsonify
import os
import traceback
import pandas as pd
import joblib

app = Flask(__name__)

# -------------------------------------------------------------------
# MODEL CONFIGURATION
# -------------------------------------------------------------------
MODEL_DIR = "model"  # directory where .pkl files are stored

MODEL_REGISTRY = {
    "Clinical_multilabel_model": {
        "file": "clinical_multilabel_model.pkl",
        "info_file": "clinical_model_info.pkl",
        "type": "multilabel",
        "features": ['age', 'bp', 'sg', 'al', 'su', 'rbc', 'pc', 'pcc', 'ba', 'bgr', 'bu', 'sc', 'sod', 'pot', 'hemo', 'pcv', 'wc', 'rc', 'htn', 'dm', 'cad', 'appet', 'pe', 'ane'],
        "categorical": ['rbc', 'pc', 'pcc', 'ba', 'htn', 'dm', 'cad', 'appet', 'pe', 'ane']
    },
    "Hypertension": {
        "file": "hypertension.pkl",
        "type": "binary",
        "features": ['bp', 'age', 'sc', 'bu', 'sod', 'pot', 'pe', 'cad', 'dm', 'hemo'],
        "categorical": ['bp', 'pe', 'cad', 'dm']
    },
    "Anemia": {
        "file": "anemia.pkl",
        "type": "binary",
        "features": ['hemo', 'pcv', 'rc', 'sc', 'bu', 'htn', 'dm', 'label_CKD'],
        "categorical": ['htn', 'dm']
    },
    "Coronary Artery Disease (CAD)": {
        "file": "cad.pkl",
        "type": "binary",
        "features": ['age', 'bp', 'dm', 'htn', 'bgr', 'sc', 'bu', 'hemo', 'ane', 'sod', 'pot', 'pe', 'wc', 'appet'],
        "categorical": ['bp', 'dm', 'htn', 'ane', 'pe', 'appet']
    },
    "Diabetes Mellitus": {
        "file": "diabetes_mellitus_model.pkl",
        "type": "binary",
        "features": ['bgr', 'su', 'sc', 'bu', 'hemo', 'htn', 'age', 'al', 'sg'],
        "categorical": ['su', 'htn', 'al']
    },
    "CKD": {
        "file": "ckd.pkl",
        "type": "binary",
        "features": ['sc', 'bu', 'hemo', 'sg', 'al', 'htn', 'dm', 'pcv', 'rc', 'pe'],
        "categorical": ['htn', 'dm', 'pe', 'al']
    },
    "Urinary Tract Infection": {
        "file": "uti.pkl",
        "type": "binary",
        "features": ['pc', 'pcc', 'ba', 'wc', 'rbc', 'su', 'dm', 'hemo', 'age', 'pe'],
        "categorical": ['pc', 'pcc', 'ba', 'rbc', 'su', 'dm', 'pe']
    },
    "Proteinuria": {
        "file": "proteinuria.pkl",
        "type": "binary",
        "features": ['sg', 'al', 'rbc', 'pc', 'pcc', 'ba'],
        "categorical": ['al', 'rbc', 'pc', 'pcc', 'ba']
    },
    "Hyperglycemia": {
        "file": "hyperglycemia.pkl",
        "type": "binary",
        "features": ['bgr', 'su', 'dm', 'hemo', 'pcv', 'age', 'htn', 'bp', 'sc', 'bu'],
        "categorical": ['su', 'dm', 'htn', 'bp']
    },
    "Electrolyte Imbalance": {
        "file": "electrolyte_imbalance.pkl",
        "type": "binary",
        "features": ['sod', 'pot', 'sc', 'bu', 'bgr', 'age', 'htn', 'dm'],
        "categorical": ['htn', 'dm']
    },
    "Kidney Failure": {
        "file": "kidney_failure.pkl",
        "type": "binary",
        "features": ['sc', 'bu', 'sg', 'hemo', 'pcv', 'sod', 'pot'],
        "categorical": []
    },
    "Diabetic Nephropathy": {
        "file": "diabetic_nephropathy.pkl",
        "type": "binary",
        "features": ['bgr', 'dm', 'sc', 'bu', 'sg', 'al', 'hemo', 'pcv', 'rc', 'htn', 'sod', 'pot', 'pe', 'ane'],
        "categorical": ['dm', 'htn', 'pe', 'ane']
    }
}

loaded_models = {}

# -------------------------------------------------------------------
# MODEL LOADING
# -------------------------------------------------------------------
def load_all_models():
    """Load all models into memory on startup."""
    for name, meta in MODEL_REGISTRY.items():
        try:
            path = os.path.join(MODEL_DIR, meta["file"])
            model = joblib.load(path)

            info = None
            if meta["type"] == "multilabel" and meta.get("info_file"):
                info_path = os.path.join(MODEL_DIR, meta["info_file"])
                info = joblib.load(info_path)

            loaded_models[name] = {
                "model": model,
                "info": info,
                "type": meta["type"],
                "features": meta["features"],
                "categorical": meta["categorical"]
            }
            print(f"✅ Loaded {name}")
        except Exception as e:
            print(f"❌ Failed to load {name}: {e}")

# -------------------------------------------------------------------
# PREDICTION FUNCTIONS
# -------------------------------------------------------------------
def predict_multilabel(patient: dict, meta: dict):
    """Run the Clinical_multilabel_model."""
    model = meta["model"]
    info = meta["info"]
    features = info["features"]
    cat_cols = info["categorical_columns"]
    labels = info["labels"]

    X_new = pd.DataFrame([patient])
    X_new = X_new[features]
    for col in cat_cols:
        X_new[col] = X_new[col].astype("category")

    preds = model.predict(X_new)
    probs = model.predict_proba(X_new)

    results = []
    for i, label in enumerate(labels):
        prob = probs[i][0][1]
        status = "Positive" if preds[0][i] == 1 else "Negative"
        results.append({
            "disease": label,
            "status": status,
            "probability": round(float(prob), 4)
        })
    return results


def predict_binary(model_name: str, patient: dict):
    """Run a single binary classifier."""
    meta = loaded_models[model_name]
    model = meta["model"]
    features = meta["features"]
    cat_features = meta["categorical"]

    X_new = pd.DataFrame([patient])
    X_new = X_new[features]

    for col in cat_features:
        if col in X_new.columns:
            X_new[col] = X_new[col].astype("category")

    prob = model.predict_proba(X_new)[:, 1][0]
    pred = model.predict(X_new)[0]

    return {
        "disease": model_name,
        "status": "Positive" if pred == 1 else "Negative",
        "probability": round(float(prob), 4)
    }


def run_prediction(model_name: str, patient: dict):
    """Execute only the selected model."""
    meta = loaded_models[model_name]

    if meta["type"] == "multilabel":
        return predict_multilabel(patient, meta)
    else:
        return [predict_binary(model_name, patient)]

# -------------------------------------------------------------------
# ROUTES
# -------------------------------------------------------------------
@app.route("/")
def index():
    """Serve the main page."""
    return render_template("index.html")


@app.route("/api/model-info/<model_name>")
def get_model_info(model_name):
    """Return features and metadata for a specific model."""
    if model_name not in MODEL_REGISTRY:
        return jsonify({"error": "Model not found"}), 404

    meta = MODEL_REGISTRY[model_name]
    return jsonify({
        "name": model_name,
        "type": meta["type"],
        "features": meta["features"],
        "categorical": meta["categorical"]
    })


@app.route("/predict", methods=["POST"])
def predict():
    """Receive form data and model name, run prediction, return results."""
    try:
        data = request.get_json() or {}
        model_name = data.get("model_name")
        form_data = data.get("form_data", {})

        if not model_name:
            return jsonify({"success": False, "error": "No model specified"}), 400

        if model_name not in loaded_models:
            return jsonify({"success": False, "error": f"Model '{model_name}' not loaded"}), 400

        # Convert input values to appropriate types
        patient = {}
        for key, val in form_data.items():
            if val == "" or val is None:
                continue

            # Handle categorical values (keep as string)
            meta = MODEL_REGISTRY[model_name]
            if key in meta["categorical"]:
                patient[key] = str(val)
            else:
                # Try numeric conversion
                try:
                    if '.' in str(val):
                        patient[key] = float(val)
                    else:
                        patient[key] = int(val)
                except ValueError:
                    patient[key] = str(val)

        # Run prediction for selected model only
        results = run_prediction(model_name, patient)

        return jsonify({
            "success": True,
            "model_name": model_name,
            "results": results
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


# -------------------------------------------------------------------
# MAIN
# -------------------------------------------------------------------
if __name__ == "__main__":
    load_all_models()
    app.run(debug=True, host="0.0.0.0", port=5000)
