// import { useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "../styles/SellerForm.css";

// const locationsList = [
//   "Velachery",
//   "Adyar",
//   "Mylapore",
//   "T Nagar",
//   "Thiruvanmiyur",
//   "Medavakkam",
//   "Chrompet",
//   "Vadapalani",
//   "Sholinganallur",
//   "Guduvancheri",
//   "Tambaram",
//   "Perungalathur",
// ];

// const SellerForm = () => {
//   const [formData, setFormData] = useState({
//     title: "",
//     location: "",
//     propertyType: "Individual House",
//     areaSize: "",
//     price: "",
//   });
//   const [images, setImages] = useState([]);
//   const [documents, setDocuments] = useState([]);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [isDragging, setIsDragging] = useState(false);
//   const [suggestions, setSuggestions] = useState([]);
//   const navigate = useNavigate();

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     if (name === "location") {
//       const filteredLocations = locationsList.filter((location) =>
//         location.toLowerCase().includes(value.toLowerCase())
//       );
//       setSuggestions(filteredLocations);
//     }
//   };

//   const handleLocationSelect = (location) => {
//     setFormData((prev) => ({
//       ...prev,
//       location: location,
//     }));
//     setSuggestions([]); // Clear suggestions after selecting a location
//   };

//   const handleFileChange = (e, setFiles) => {
//     const files = Array.from(e.target.files);
//     if (files.length > 0) {
//       setFiles(files);
//     }
//   };

//   const handleDragOver = useCallback((e) => {
//     e.preventDefault();
//     setIsDragging(true);
//   }, []);

//   const handleDragLeave = useCallback((e) => {
//     e.preventDefault();
//     setIsDragging(false);
//   }, []);

//   const handleDrop = useCallback((e, setFiles) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const files = Array.from(e.dataTransfer.files);
//     if (files.length > 0) {
//       setFiles(files);
//     }
//   }, []);

//   const removeFile = (index, files, setFiles) => {
//     const newFiles = [...files];
//     newFiles.splice(index, 1);
//     setFiles(newFiles);
//   };

//   const verifyToken = async (token) => {
//     try {
//       await axios.get("http://localhost:8080/api/auth/verify", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       return true;
//     } catch (error) {
//       console.error("Token verification failed:", error);
//       return false;
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const { title, location, areaSize, price } = formData;
//     if (!title || !location || !areaSize || !price || images.length === 0 || documents.length === 0) {
//       setError("All fields, including images and documents, are required.");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     const token = localStorage.getItem("token");
//     if (!token) {
//       setError("Please log in to submit a property.");
//       setLoading(false);
//       navigate("/login");
//       return;
//     }

//     const isTokenValid = await verifyToken(token);
//     if (!isTokenValid) {
//       localStorage.removeItem("token");
//       setError("Session expired. Please log in again.");
//       setLoading(false);
//       navigate("/login");
//       return;
//     }

//     const submissionData = new FormData();
//     Object.entries(formData).forEach(([key, value]) => {
//       submissionData.append(key, value);
//     });
//     images.forEach((image) => submissionData.append("images", image));
//     documents.forEach((doc) => submissionData.append("documents", doc));

//     try {
//       const response = await axios.post("http://localhost:8080/api/properties", submissionData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       console.log("Property submitted successfully:", response.data);

//       try {
//         const anomalyResponse = await axios.post(
//           "http://localhost:8080/api/properties/validateProperty",
//           {
//             ...formData,
//             price: parseFloat(formData.price),
//             areaSize: parseFloat(formData.areaSize),
//           },
//           {
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         if (anomalyResponse.data.isAnomaly) {
//           alert(`⚠️ Warning: ${anomalyResponse.data.message}`);
//         } else {
//           alert("✅ Property submitted successfully! It's now under admin review.");
//         }
//       } catch (mlError) {
//         console.error("ML validation error:", mlError);
//         alert("Property submitted! Note: Could not complete price validation.");
//       }

//       navigate("/dashboard");
//     } catch (error) {
//       console.error("Submission error:", error);
//       if (error.response) {
//         switch (error.response.status) {
//           case 401:
//             setError("Session expired. Please log in again.");
//             localStorage.removeItem("token");
//             navigate("/login");
//             break;
//           case 400:
//             setError(error.response.data.message || "Invalid input data");
//             break;
//           case 413:
//             setError("File size too large. Please reduce file sizes.");
//             break;
//           default:
//             setError("Server error. Please try again later.");
//         }
//       } else if (error.request) {
//         setError("Network error. Please check your connection.");
//       } else {
//         setError("An unexpected error occurred.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="form-container">
//       <h2>Submit Property Details</h2>
//       {error && <div className="error-message">{error}</div>}

//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label>Title</label>
//           <input
//             type="text"
//             name="title"
//             value={formData.title}
//             onChange={handleInputChange}
//             placeholder="Property title"
//             required
//           />
//         </div>

//         <div className="form-group">
//           <label>Location</label>
//           <input
//             type="text"
//             name="location"
//             value={formData.location}
//             onChange={handleInputChange}
//             placeholder="Property location"
//             required
//           />
//           {suggestions.length > 0 && (
//             <div className="suggestions-container">
//               {suggestions.map((suggestion, index) => (
//                 <div
//                   key={index}
//                   className="suggestion-item"
//                   onClick={() => handleLocationSelect(suggestion)}
//                 >
//                   {suggestion}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         <div className="form-group">
//           <label>Property Type</label>
//           <select
//             name="propertyType"
//             value={formData.propertyType}
//             onChange={handleInputChange}
//             required
//           >
//             <option value="Individual House">Individual House</option>
//             <option value="Flat">Flat</option>
//             <option value="Plot">Plot</option>
//           </select>
//         </div>

//         <div className="form-group">
//           <label>Area Size (sq. ft.)</label>
//           <input
//             type="number"
//             name="areaSize"
//             value={formData.areaSize}
//             onChange={handleInputChange}
//             placeholder="Area in square feet"
//             min="1"
//             required
//           />
//         </div>

//         <div className="form-group">
//           <label>Price (INR)</label>
//           <input
//             type="number"
//             name="price"
//             value={formData.price}
//             onChange={handleInputChange}
//             placeholder="Price in INR"
//             min="1"
//             required
//           />
//         </div>

//         {/* Enhanced Image Upload */}
//         <div className="form-group">
//           <label>Property Images (Max 5MB each)</label>
//           <div
//             className={`drag-drop-container ${isDragging ? "dragover" : ""}`}
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={(e) => handleDrop(e, setImages)}
//           >
//             <div className="upload-icon">📷</div>
//             <p>Drag & drop property images here</p>
//             <span>
//               or <span className="browse-link" onClick={() => document.getElementById("imageInput").click()}>browse files</span>
//             </span>
//             <input
//               id="imageInput"
//               type="file"
//               accept="image/*"
//               multiple
//               onChange={(e) => handleFileChange(e, setImages)}
//               style={{ display: "none" }}
//             />
//           </div>
//           {images.length > 0 && (
//             <div className="uploaded-files">
//               <p>Selected Images:</p>
//               <ul>
//                 {images.map((file, index) => (
//                   <li key={index}>
//                     {file.name}
//                     <button
//                       type="button"
//                       className="remove-btn"
//                       onClick={() => removeFile(index, images, setImages)}
//                     >
//                       ×
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//           <small>Maximum 5 images allowed (JPEG, PNG)</small>
//         </div>

//         {/* Enhanced Document Upload */}
//         <div className="form-group">
//           <label>Property Documents (PDF/DOCX)</label>
//           <div
//             className={`drag-drop-container ${isDragging ? "dragover" : ""}`}
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={(e) => handleDrop(e, setDocuments)}
//           >
//             <div className="upload-icon">📄</div>
//             <p>Drag & drop documents here</p>
//             <span>
//               or <span className="browse-link" onClick={() => document.getElementById("docInput").click()}>browse files</span>
//             </span>
//             <input
//               id="docInput"
//               type="file"
//               accept=".pdf,.doc,.docx"
//               multiple
//               onChange={(e) => handleFileChange(e, setDocuments)}
//               style={{ display: "none" }}
//             />
//           </div>
//           {documents.length > 0 && (
//             <div className="uploaded-files">
//               <p>Selected Documents:</p>
//               <ul>
//                 {documents.map((file, index) => (
//                   <li key={index}>
//                     {file.name}
//                     <button
//                       type="button"
//                       className="remove-btn"
//                       onClick={() => removeFile(index, documents, setDocuments)}
//                     >
//                       ×
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//           <small>Maximum 5 documents allowed (PDF, DOC, DOCX)</small>
//         </div>

//         <button type="submit" className="submit-btn" disabled={loading}>
//           {loading ? (
//             <>
//               <span className="spinner"></span> Submitting...
//             </>
//           ) : (
//             "Submit Property"
//           )}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default SellerForm;

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styled, { keyframes } from "styled-components";

const SellerForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    propertyType: "Individual House",
    areaSize: "",
    price: ""
  });
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeUpload, setActiveUpload] = useState(null); // 'images' or 'documents'
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, setter) => {
    if (e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      // Check if any of the files exceed the 5MB size limit
      if (files.some(file => file.size > 5 * 1024 * 1024)) {
        setError("Some files exceed the 5MB limit");
        return;
      }

      // Allow up to 10 images
      if (files.length + images.length > 10) {
        setError("You can upload a maximum of 10 images.");
        return;
      }

      setter(prev => [...prev, ...files]);
      setError("");
    }
  };

  const handleDragOver = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setActiveUpload(type);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setActiveUpload(null);
  }, []);

  const handleDrop = useCallback((e, setter) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setActiveUpload(null);

    if (e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);

      // Check if any of the files exceed the 5MB size limit
      if (files.some(file => file.size > 5 * 1024 * 1024)) {
        setError("Some files exceed the 5MB limit");
        return;
      }

      // Check if the number of files exceeds 10
      if (files.length + images.length > 10) {
        setError("You can upload a maximum of 10 images.");
        return;
      }

      setter(prev => [...prev, ...files]);
      setError("");
    }
  }, [images]);

  const removeFile = (index, setter) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const verifyToken = async (token) => {
    try {
      await axios.get("http://localhost:8080/api/auth/verify", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } catch (error) {
      console.error("Token verification failed:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate all fields
    const { title, location, areaSize, price } = formData;
    if (!title || !location || !areaSize || !price || images.length === 0 || documents.length === 0) {
      setError("All fields, including images and documents, are required.");
      return;
    }

    setLoading(true);

    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to submit a property.");
      setLoading(false);
      navigate("/login");
      return;
    }

    // Verify token is still valid
    const isTokenValid = await verifyToken(token);
    if (!isTokenValid) {
      localStorage.removeItem("token");
      setError("Session expired. Please log in again.");
      setLoading(false);
      navigate("/login");
      return;
    }

    // Prepare form data
    const submissionData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submissionData.append(key, value);
    });
    images.forEach(image => submissionData.append("images", image));
    documents.forEach(doc => submissionData.append("documents", doc));

    try {
      // Submit property
      await axios.post(
        "http://localhost:8080/api/properties",
        submissionData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Validate with ML model
      try {
        const anomalyResponse = await axios.post(
          "http://localhost:8080/api/properties/validateProperty",
          {
            ...formData,
            price: parseFloat(formData.price),
            areaSize: parseFloat(formData.areaSize)
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (anomalyResponse.data.isAnomaly) {
          setSuccess(`⚠️ Warning: ${anomalyResponse.data.message}`);
        } else {
          setSuccess("✅ Property submitted successfully! It's now under admin review.");
          setTimeout(() => navigate("/dashboard"), 3000); // Redirect to dashboard after 3 seconds
        }
      } catch (mlError) {
        console.error("ML validation error:", mlError);
        setSuccess("Property submitted! Note: Could not complete price validation.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      if (error.response) {
        switch (error.response.status) {
          case 401:
            setError("Session expired. Please log in again.");
            localStorage.removeItem("token");
            navigate("/login");
            break;
          case 400:
            setError(error.response.data.message || "Invalid input data");
            break;
          case 413:
            setError("File size too large. Please reduce file sizes.");
            break;
          default:
            setError("Server error. Please try again later.");
        }
      } else if (error.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <FormCard>
        <FormHeader>
          <h2>Submit Property Details</h2>
          <p>Fill in the details of your property to list it on Hestia</p>
        </FormHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <Form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup>
              <Label>Title</Label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Beautiful 3BHK Apartment"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Location</Label>
              <Input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="123 Main St, City"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Property Type</Label>
              <Select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleInputChange}
                required
              >
                <option value="Individual House">Individual House</option>
                <option value="Flat">Flat</option>
                <option value="Plot">Plot</option>
                <option value="Villa">Villa</option>
                <option value="Commercial">Commercial</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Area Size (sq. ft.)</Label>
              <Input
                type="number"
                name="areaSize"
                value={formData.areaSize}
                onChange={handleInputChange}
                placeholder="1500"
                min="1"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Price (₹)</Label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="5000000"
                min="1"
                required
              />
            </FormGroup>
          </FormGrid>

          <UploadSection>
            <UploadContainer
              onDragOver={(e) => handleDragOver(e, 'images')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, setImages)}
              $isDragging={isDragging && activeUpload === 'images'}
            >
              <UploadIcon>📷</UploadIcon>
              <UploadTitle>Property Images</UploadTitle>
              <UploadDescription>
                Drag & drop images here or click to browse (max 5MB each, max 10 images)
              </UploadDescription>
              <HiddenInput
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileChange(e, setImages)}
              />
              {images.length > 0 && (
                <FilePreviewContainer>
                  {images.map((file, index) => (
                    <FilePreview key={index}>
                      <FilePreviewName>
                        {file.name.length > 15 
                          ? `${file.name.substring(0, 15)}...` 
                          : file.name}
                      </FilePreviewName>
                      <FilePreviewSize>
                        {(file.size / 1024 / 1024).toFixed(2)}MB
                      </FilePreviewSize>
                      <RemoveFileButton onClick={() => removeFile(index, setImages)}>
                        ×
                      </RemoveFileButton>
                    </FilePreview>
                  ))}
                </FilePreviewContainer>
              )}
            </UploadContainer>

            <UploadContainer
              onDragOver={(e) => handleDragOver(e, 'documents')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, setDocuments)}
              $isDragging={isDragging && activeUpload === 'documents'}
            >
              <UploadIcon>📄</UploadIcon>
              <UploadTitle>Property Documents</UploadTitle>
              <UploadDescription>
                Drag & drop documents here or click to browse (PDF/DOCX)
              </UploadDescription>
              <HiddenInput
                type="file"
                accept=".pdf,.docx"
                multiple
                onChange={(e) => handleFileChange(e, setDocuments)}
              />
              {documents.length > 0 && (
                <FilePreviewContainer>
                  {documents.map((file, index) => (
                    <FilePreview key={index}>
                      <FilePreviewName>
                        {file.name.length > 15 
                          ? `${file.name.substring(0, 15)}...` 
                          : file.name}
                      </FilePreviewName>
                      <FilePreviewSize>
                        {(file.size / 1024 / 1024).toFixed(2)}MB
                      </FilePreviewSize>
                      <RemoveFileButton onClick={() => removeFile(index, setDocuments)}>
                        ×
                      </RemoveFileButton>
                    </FilePreview>
                  ))}
                </FilePreviewContainer>
              )}
            </UploadContainer>
          </UploadSection>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner />
                Submitting...
              </>
            ) : (
              "Submit Property"
            )}
          </SubmitButton>
        </Form>
      </FormCard>
    </FormContainer>
  );
};

export default SellerForm;

// Styled Components
const FormContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f5f7fa;
`;

const FormCard = styled.div`
  width: 100%;
  max-width: 900px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 2.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
  }
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h2 {
    color: #29353c;
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: #768a96;
    font-size: 1rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #44576d;
`;

const Input = styled.input`
  padding: 0.8rem 1rem;
  border: 1px solid #dfebf6;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background-color: #f9fbfd;

  &:focus {
    outline: none;
    border-color: #aac7d8;
    box-shadow: 0 0 0 3px rgba(170, 199, 216, 0.2);
  }

  &::placeholder {
    color: #aac7d8;
  }
`;

const Select = styled.select`
  padding: 0.8rem 1rem;
  border: 1px solid #dfebf6;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background-color: #f9fbfd;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;

  &:focus {
    outline: none;
    border-color: #aac7d8;
    box-shadow: 0 0 0 3px rgba(170, 199, 216, 0.2);
  }
`;

const UploadSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
`;

const UploadContainer = styled.div`
  border: 2px dashed ${props => props.$isDragging ? '#aac7d8' : '#dfebf6'};
  border-radius: 12px;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${props => props.$isDragging ? 'rgba(170, 199, 216, 0.05)' : '#f9fbfd'};
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: #aac7d8;
  }
`;

const UploadIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #aac7d8;
`;

const UploadTitle = styled.h3`
  font-size: 1.1rem;
  color: #44576d;
  margin-bottom: 0.5rem;
`;

const UploadDescription = styled.p`
  font-size: 0.85rem;
  color: #768a96;
  margin-bottom: 1rem;
`;

const HiddenInput = styled.input`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
`;

const FilePreviewContainer = styled.div`
  width: 100%;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilePreview = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.8rem;
  background-color: #f0f4f8;
  border-radius: 6px;
  font-size: 0.85rem;
`;

const FilePreviewName = styled.span`
  flex: 1;
  text-align: left;
  color: #44576d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FilePreviewSize = styled.span`
  color: #768a96;
  margin: 0 0.8rem;
`;

const RemoveFileButton = styled.button`
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0 0.2rem;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.2);
  }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: ${spin} 1s ease-in-out infinite;
  margin-right: 0.5rem;
`;

const SubmitButton = styled.button`
  padding: 1rem;
  background-color: #44576d;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;

  &:hover {
    background-color: #29353c;
  }

  &:disabled {
    background-color: #aac7d8;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  padding: 1rem;
  background-color: #e8f5e9;
  color: #2e7d32;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s ease;
`;