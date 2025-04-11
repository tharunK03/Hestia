from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# ✅ Load ML models and scaler
rf_model = joblib.load('/Users/Hestia 2/RealEstate/untitled folder/random_forest_model.pkl')
iso_forest = joblib.load('/Users/Hestia 2/RealEstate/untitled folder/isolation_forest_model.pkl')
scaler = joblib.load('/Users/Hestia 2/RealEstate/untitled folder/scaler.pkl')

# ✅ Manual encoding for location and property type
location_encoding = {
    "Velachery": 0,
    "Adyar": 1,
    "Mylapore": 2,
    "T Nagar": 3,
    "Thiruvanmiyur": 4,
    "Medavakkam": 5,
    "Chrompet": 6,
    "Vadapalani": 7,
    "Sholinganallur": 8,
    "Guduvancheri": 9,
    "Tambaram": 10,
    "Perungalathur": 11
}

property_type_encoding = {
    "Individual House": 0,
    "Flat": 1,
    "Plot": 2
}

@app.route('/validateProperty', methods=['POST'])
def validate_property():
    try:
        data = request.get_json()
        print("📥 Received property data:", data)

        # Extract fields from request
        location = data.get("location")
        property_type = data.get("propertyType")
        area_size = data.get("areaSize")
        price = data.get("price")

        if not location or not property_type or area_size is None or price is None:
            return jsonify({"error": "Missing fields in request"}), 400

        if location not in location_encoding or property_type not in property_type_encoding:
            return jsonify({"error": "Invalid location or propertyType"}), 400

        try:
            area_size = float(area_size)
            price = float(price)
        except ValueError:
            return jsonify({"error": "areaSize and price must be numbers"}), 400

        # Encode categorical variables
        encoded_location = location_encoding[location]
        encoded_property_type = property_type_encoding[property_type]

        # Generate synthetic min-max price range
        price_min = price * 0.8
        price_max = price * 1.2

        # Prepare feature vector
        features = np.array([[encoded_location, area_size, encoded_property_type, price_min, price_max]])
        scaled_features = scaler.transform(features)

        # ✅ Random Forest Prediction
        rf_pred = rf_model.predict(scaled_features)
        if rf_pred[0] == 1:
            return jsonify({
                "isAnomaly": True,
                "message": "⚠️ Anomaly detected by Random Forest model."
            })

        # ✅ Isolation Forest Prediction
        iso_pred = iso_forest.predict(scaled_features)
        if iso_pred[0] == -1:
            return jsonify({
                "isAnomaly": True,
                "message": "⚠️ Anomaly detected by Isolation Forest model."
            })

        return jsonify({
            "isAnomaly": False,
            "message": "✅ Property price is valid."
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        print("❌ Error in /validateProperty:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)