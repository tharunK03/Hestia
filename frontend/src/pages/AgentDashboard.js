import React from 'react';
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/AgentDashboard.css"; // Add this CSS file to style the dashboard

const AgentDashboard = () => {
  const [properties, setProperties] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "agent") {
      alert("Unauthorized access! Redirecting to login.");
      navigate("/"); // Redirect non-agents to login
    } else {
      fetchPendingProperties();
    }
  }, [navigate]);

  // Fetch pending properties for agent verification
  const fetchPendingProperties = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/agent/pending-properties", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProperties(response.data);
    } catch (error) {
      console.error("Error fetching properties:", error);
      alert("Failed to fetch properties. Try again.");
    }
  };

  // Approve the property and list it for buyers
  const approveProperty = async (propertyId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8080/api/agent/verify/${propertyId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("✅ Property approved and listed for buyers!");
      fetchPendingProperties(); // Refresh list after approval
    } catch (error) {
      console.error("Error approving property:", error);
      alert("❌ Approval failed. Please check backend logs.");
    }
  };

  // Reject the property
  const rejectProperty = async (propertyId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:8080/api/agent/reject/${propertyId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("❌ Property rejected!");
      fetchPendingProperties(); // Refresh list
    } catch (error) {
      console.error("Error rejecting property:", error);
      alert("❌ Rejection failed. Try again.");
    }
  };

  return (
    <div className="agent-dashboard">
      <h1>Agent Dashboard - Property Approvals</h1>
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
                <td>{property.location?.address || 'Not Provided'}</td>
                <td>${property.price}</td>
                <td>
                  <button onClick={() => approveProperty(property._id)} className="approve-btn">Approve</button>
                  <button onClick={() => rejectProperty(property._id)} className="reject-btn">Reject</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No properties to approve.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AgentDashboard;