import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PropertyForm = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("Individual House");
  const [areaSize, setAreaSize] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e, setter) => {
    setter([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !location || !areaSize || !price || images.length === 0 || documents.length === 0) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("location", location);
    formData.append("propertyType", propertyType);
    formData.append("areaSize", areaSize);
    formData.append("price", price);
    images.forEach((img) => formData.append("images", img));
    documents.forEach((doc) => formData.append("documents", doc));

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Unauthorized: No token found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/properties", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Property submitted for approval!");
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to submit property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Submit Property Details</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />

        <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
          <option value="Individual House">Individual House</option>
          <option value="Flat">Flat</option>
          <option value="Plot">Plot</option>
        </select>

        <input type="text" placeholder="Area Size (sq. ft.)" value={areaSize} onChange={(e) => setAreaSize(e.target.value)} />
        <input type="number" placeholder="Price (INR)" value={price} onChange={(e) => setPrice(e.target.value)} />

        <label>Upload Images (Multiple):</label>
        <input type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e, setImages)} />

        <label>Upload Documents (PDF, DOCX):</label>
        <input type="file" accept=".pdf,.docx" multiple onChange={(e) => handleFileChange(e, setDocuments)} />

        <button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Property"}</button>
      </form>
    </div>
  );
};

export default PropertyForm;
