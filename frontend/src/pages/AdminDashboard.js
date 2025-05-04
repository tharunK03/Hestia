// import { useState, useEffect } from "react";
// import axios from "axios";
// import "../styles/AdminDashboard.css";

// const AdminDashboard = () => {
//   const [properties, setProperties] = useState([]);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProperties = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const res = await axios.get("http://localhost:8080/api/properties/pending", {
//           headers: { Authorization: `Bearer ${token}` }
//         });

//         if (res.data.length === 0) {
//           setError("No pending properties found.");
//         } else {
//           setProperties(res.data);
//         }
//       } catch (err) {
//         setError("Failed to load properties.");
//         console.error("❌ Error fetching properties:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProperties();
//   }, []);

//   const approveProperty = async (id) => {
//     try {
//       const token = localStorage.getItem("token");
//       await axios.put(`http://localhost:8080/api/properties/approve/${id}`, {}, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       alert("✅ Property approved and moved to agent verification.");
//       setProperties(properties.filter((property) => property._id !== id));
//     } catch (err) {
//       alert("❌ Approval failed.");
//       console.error("Approval error:", err);
//     }
//   };

//   const rejectProperty = async (id) => {
//     try {
//       const token = localStorage.getItem("token");
//       // Send a DELETE request to reject the property
//       await axios.delete(`http://localhost:8080/api/properties/reject/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
  
//       // Update the properties state to reflect the rejection
//       setProperties(properties.filter((property) => property._id !== id));
  
//       alert("🚫 Property rejected.");
//     } catch (err) {
//       alert("❌ Rejection failed.");
//       console.error("Rejection error:", err);
//     }
//   };

//   return (
//     <div className="admin-dashboard">
//       <h2>Admin Dashboard - Pending Properties</h2>

//       {loading && <p className="loading">Loading properties...</p>}
//       {error && <p className="error">{error}</p>}

//       {properties.length === 0 && !loading ? (
//         <div className="no-properties">
//           <h3>No properties available for approval.</h3>
//           <p>All properties have been reviewed.</p>
//         </div>
//       ) : (
//         <div className="property-list">
//           {properties.map((property) => (
//             <div key={property._id} className="property-card">
//               <h3>{property.title}</h3>
//               <p><strong>Price:</strong> ₹{property.price}</p>
//               <p><strong>Location:</strong> {property.location?.address}</p>
//               <p><strong>Type:</strong> {property.propertyType}</p>
//               <p><strong>Size:</strong> {property.areaSize} sqft</p>

//               <div className="property-images">
//                 {property.images && property.images.length > 0 ? (
//                   property.images.map((img, index) => (
//                     <img
//                       key={index}
//                       src={`http://localhost:8080/${img}`}
//                       alt="Property"
//                       className="property-image"
//                     />
//                   ))
//                 ) : (
//                   <p>No images available</p>
//                 )}
//               </div>

//               <div className={`anomaly-indicator ${property.isAnomaly ? 'anomaly' : 'normal'}`}>
//                 {property.isAnomaly ? (
//                   <>
//                     <p>⚠️ <strong>Anomaly Detected</strong></p>
//                     <p><strong>Reason:</strong> {property.anomalyMessage || "Unspecified anomaly"}</p>
//                   </>
//                 ) : (
//                   <p>✅ <strong>No Anomaly</strong> - Price looks valid</p>
//                 )}
//               </div>

//               <div className="property-actions">
//                 <button className="approve-btn" onClick={() => approveProperty(property._id)}>Approve</button>
//                 <button className="reject-btn" onClick={() => rejectProperty(property._id)}>Reject</button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminDashboard;
import { useState, useEffect } from "react";
import axios from "axios";
import { FiCheck, FiX, FiAlertTriangle, FiHome, FiDollarSign, FiMapPin, FiLayers } from "react-icons/fi";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:8080/api/properties/${activeTab}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.length === 0) {
          setError(`No ${activeTab} properties found.`);
        } else {
          setProperties(res.data);
        }
      } catch (err) {
        setError("Failed to load properties.");
        console.error("❌ Error fetching properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [activeTab]);

  const approveProperty = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:8080/api/properties/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProperties(properties.filter((property) => property._id !== id));
    } catch (err) {
      console.error("Approval error:", err);
    }
  };

  const rejectProperty = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/properties/reject/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setProperties(properties.filter((property) => property._id !== id));
    } catch (err) {
      console.error("Rejection error:", err);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Welcome Admin</h1>
        <nav className="admin-tabs">
          <button 
            className={activeTab === "pending" ? "active" : ""}
            onClick={() => setActiveTab("pending")}
          >
            Pending Review
          </button>
          <button 
            className={activeTab === "approved" ? "active" : ""}
            onClick={() => setActiveTab("approved")}
          >
            Approved
          </button>
          <button 
            className={activeTab === "rejected" ? "active" : ""}
            onClick={() => setActiveTab("rejected")}
          >
            Rejected
          </button>
        </nav>
      </header>

      <main className="property-feed">
        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading properties...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <FiAlertTriangle className="error-icon" />
            <p>{error}</p>
          </div>
        )}

        {properties.length === 0 && !loading && (
          <div className="empty-state">
            <FiHome className="empty-icon" />
            <h3>No properties found</h3>
            <p>All caught up! There are no {activeTab} properties to display.</p>
          </div>
        )}

        {properties.map((property) => (
          <article key={property._id} className="property-post">
            <div className="post-header">
              <div className="post-meta">
                <h3>{property.title}</h3>
                <div className="meta-info">
                  <span><FiDollarSign /> ₹{property.price.toLocaleString()}</span>
                  <span><FiMapPin /> {property.location?.address}</span>
                  <span><FiLayers /> {property.areaSize} sqft</span>
                </div>
              </div>
              <div className={`status-badge ${property.isAnomaly ? 'anomaly' : 'normal'}`}>
                {property.isAnomaly ? '⚠️ Anomaly' : '✅ Verified'}
              </div>
            </div>

            <div className="post-images">
              {property.images && property.images.length > 0 ? (
                <div className="image-carousel">
                  {property.images.map((img, index) => (
                    <img
                      key={index}
                      src={`http://localhost:8080/${img}`}
                      alt={`Property ${index + 1}`}
                      className="post-image"
                    />
                  ))}
                </div>
              ) : (
                <div className="no-image-placeholder">
                  <FiHome className="placeholder-icon" />
                  <p>No images available</p>
                </div>
              )}
            </div>

            {property.isAnomaly && (
              <div className="anomaly-notice">
                <FiAlertTriangle className="anomaly-icon" />
                <p>{property.anomalyMessage || "Price anomaly detected"}</p>
              </div>
            )}

            <div className="post-details">
              <p className="property-description">
                {property.description || "No description provided."}
              </p>
              <div className="property-stats">
                <span>Type: {property.propertyType}</span>
                <span>Bedrooms: {property.bedrooms || 'N/A'}</span>
                <span>Bathrooms: {property.bathrooms || 'N/A'}</span>
              </div>
            </div>

            {activeTab === "pending" && (
              <div className="post-actions">
                <button 
                  className="action-button approve"
                  onClick={() => approveProperty(property._id)}
                >
                  <FiCheck /> Approve
                </button>
                <button 
                  className="action-button reject"
                  onClick={() => rejectProperty(property._id)}
                >
                  <FiX /> Reject
                </button>
              </div>
            )}
          </article>
        ))}
      </main>
    </div>
  );
};

export default AdminDashboard;