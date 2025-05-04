import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/FinalApproval.css"; // Import your styles for Final Approval page

const FinalApproval = () => {
  const [properties, setProperties] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role !== "admin") {
      alert("Unauthorized access! Redirecting to login.");
      navigate("/"); // Redirect non-admins to login
    } else {
      fetchFinalApprovalProperties();
    }
  }, [navigate]);

  // Fetch properties awaiting final admin approval
  const fetchFinalApprovalProperties = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/admin/final-review", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProperties(response.data);
    } catch (error) {
      console.error("Error fetching properties for final approval:", error);
      alert("Failed to fetch properties. Try again.");
    }
  };

  // Approve the property and move to "Listed"
  const approveProperty = async (propertyId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8080/api/admin/final-approve/${propertyId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("✅ Property approved and listed for buyers!");
      fetchFinalApprovalProperties(); // Refresh list
    } catch (error) {
      console.error("Error approving property:", error);
      alert("❌ Approval failed. Please check backend logs.");
    }
  };

  return (
    <div className="final-approval-container">
      <h1>Final Property Approval</h1>
      <table className="property-table">
        <thead>
          <tr>
            <th>Property ID</th>
            <th>Title</th>
            <th>Location</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {properties.length > 0 ? (
            properties.map((property) => (
              <tr key={property._id}>
                <td>{property._id}</td>
                <td>{property.title}</td>
                <td>{property.location?.address || "Not Provided"}</td>
                <td>${property.price}</td>
                <td>
                  <button onClick={() => approveProperty(property._id)} className="approve-btn">Approve</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No properties awaiting final approval.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FinalApproval;