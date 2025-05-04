// import { useEffect, useState } from "react";
// import axios from "axios";
// import styled from "styled-components";

// const BuyerDashboard = () => {
//   const [properties, setProperties] = useState([]);

//   useEffect(() => {
//     const fetchListedProperties = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await axios.get("http://localhost:8080/api/properties/listed", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         console.log(response.data); // Add console log to check if properties are fetched
//         setProperties(response.data); // Store the listed properties in the state
//       } catch (error) {
//         console.error("Error fetching listed properties:", error);
//       }
//     };

//     fetchListedProperties();
//   }, []);

//   return (
//     <DashboardContainer>
//       <h1>Buyer Dashboard</h1>
//       <PropertyList>
//         {properties.length > 0 ? (
//           properties.map((property) => (
//             <PropertyCard key={property._id}>
//               <PropertyImage src={`http://localhost:8080/${property.images[0]}`} alt={property.title} />
//               <PropertyDetails>
//                 <h3>{property.title}</h3>
//                 <p><strong>Location:</strong> {property.location?.address}</p>
//                 <p><strong>Price:</strong> ${property.price}</p>
//                 <p><strong>Area Size:</strong> {property.areaSize} sq. ft.</p>
//                 <ViewDocumentsButton onClick={() => handleViewDocuments(property)}>View Documents</ViewDocumentsButton>
//               </PropertyDetails>
//             </PropertyCard>
//           ))
//         ) : (
//           <NoPropertiesMessage>No properties available</NoPropertiesMessage>
//         )}
//       </PropertyList>
//     </DashboardContainer>
//   );

//   function handleViewDocuments(property) {
//     alert("Documents: " + property.documents.join("\n"));
//   }
// };

// export default BuyerDashboard;

// // Styled Components for Styling
// const DashboardContainer = styled.div`
//   padding: 30px;
//   background-color: #f9f9f9;
//   min-height: 100vh;
// `;

// const PropertyList = styled.div`
//   display: flex;
//   flex-wrap: wrap;
//   gap: 20px;
// `;

// const PropertyCard = styled.div`
//   background: #fff;
//   border-radius: 10px;
//   box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
//   width: 300px;
//   padding: 20px;
//   display: flex;
//   flex-direction: column;
//   gap: 10px;
// `;

// const PropertyImage = styled.img`
//   width: 100%;
//   height: 180px;
//   object-fit: cover;
//   border-radius: 8px;
// `;

// const PropertyDetails = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 8px;
// `;

// const ViewDocumentsButton = styled.button`
//   padding: 8px 15px;
//   background-color: #ff5722;
//   color: white;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;
//   transition: 0.3s ease;
  
//   &:hover {
//     background-color: #e64a19;
//   }
// `;

// const NoPropertiesMessage = styled.p`
//   font-size: 18px;
//   color: #777;
// `;
import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import { FiFilter,  FiChevronLeft, FiChevronRight, FiMapPin, FiHome,  FiDollarSign } from "react-icons/fi";
import { FaBed, FaRulerCombined } from "react-icons/fa";

const BuyerDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({
    location: "Chennai",
    budget: 100000000,
    propertyType: "Residential Apartment",
    bedrooms: "1 BHK",
  });
  const [showChatbot, setShowChatbot] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentImageIndices, setCurrentImageIndices] = useState({});

  const GEMINI_API_KEY = "AIzaSyCr_Nyd76FJ8yhfOh92cm-7c8QauO_gOjI";
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  // Initialize current image indices when properties load
  useEffect(() => {
    const initialIndices = {};
    properties.forEach(property => {
      initialIndices[property._id] = 0;
    });
    setCurrentImageIndices(initialIndices);
  }, [properties]);

  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndices(prev => {
        const newIndices = {};
        properties.forEach(property => {
          if (property.images?.length > 1) {
            newIndices[property._id] = 
              (prev[property._id] + 1) % property.images.length;
          } else {
            newIndices[property._id] = 0;
          }
        });
        return newIndices;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [properties]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (propertyId, index, e) => {
    e.stopPropagation();
    setCurrentImageIndices(prev => ({
      ...prev,
      [propertyId]: index
    }));
  };

  const formatResponse = (rawText) => {
    let formatted = rawText
      .replace(/\*\*/g, '')
      .replace(/•/g, '\n•')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    const lines = formatted.split('\n');
    const processedLines = lines.map(line => {
      line = line.trim();
      if (line && !line.startsWith('•') && !line.startsWith('-') && 
          !line.match(/^(okay|here|first|second|third)/i)) {
        return `• ${line}`;
      }
      return line;
    });

    return processedLines.join('\n');
  };
  
  const sendMessage = async () => {
    if (inputMessage.trim()) {
      const userMessage = { text: inputMessage, sender: "user" };
      setMessages(prev => [...prev, userMessage]);

      try {
        const response = await axios.post(
          GEMINI_API_URL,
          {
            contents: [{ 
              parts: [{ 
                text: `Provide information about: ${inputMessage}
                Format requirements:
                - Start with a brief introduction
                - Use bullet points (•) 
                - Put each point on a new line
                - Keep each point concise (1 sentence)
                - Do not use bold/formatting`
              }] 
            }],
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const botReply = response.data.candidates?.[0]?.content?.parts[0]?.text || 
          "Sorry, I couldn't process your request. Please try again.";

        setMessages(prev => [
          ...prev,
          { 
            text: formatResponse(botReply), 
            sender: "bot" 
          }
        ]);
        setInputMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages(prev => [
          ...prev,
          {
            text: "Sorry, I'm having trouble responding. Please try again later.",
            sender: "bot",
          }
        ]);
      }
    }
  };

  const applyFilters = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/properties/listed", {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
      });
      setProperties(response.data);
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  useEffect(() => {
    const fetchListedProperties = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8080/api/properties/listed", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProperties(response.data);
      } catch (error) {
        console.error("Error fetching listed properties:", error);
      }
    };
    fetchListedProperties();
  }, []);

  const handleViewDocuments = (property, e) => {
    e.stopPropagation();
    alert("Documents: " + property.documents.join("\n"));
  };

  return (
    <DashboardContainer>
      <ContentWrapper>
        <FilterSection>
          <FilterHeader>
            <FiFilter size={20} />
            <h2>Filters</h2>
          </FilterHeader>
          
          <FilterGroup>
            <FilterLabel>
              <FiMapPin />
              <span>Location</span>
            </FilterLabel>
            <StyledSelect
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
            >
              <option>Chennai</option>
              <option>Bangalore</option>
              <option>Mumbai</option>
              <option>Delhi</option>
            </StyledSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>
              <FiDollarSign />
              <span>Budget Range</span>
              <BudgetValue>₹{filters.budget.toLocaleString()}</BudgetValue>
            </FilterLabel>
            <BudgetSlider>
              <input
                type="range"
                min="0"
                max="100000000"
                value={filters.budget}
                onChange={handleFilterChange}
                name="budget"
              />
              <BudgetRange>
                <span>₹0</span>
                <span>₹100M</span>
              </BudgetRange>
            </BudgetSlider>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>
              <FiHome />
              <span>Type of Property</span>
            </FilterLabel>
            <StyledSelect
              name="propertyType"
              value={filters.propertyType}
              onChange={handleFilterChange}
            >
              <option>Residential Apartment</option>
              <option>Independent House</option>
              <option>Villa</option>
              <option>Plot</option>
            </StyledSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>
              <FaBed />
              <span>Bedrooms</span>
            </FilterLabel>
            <StyledSelect
              name="bedrooms"
              value={filters.bedrooms}
              onChange={handleFilterChange}
            >
              <option>1 BHK</option>
              <option>2 BHK</option>
              <option>3 BHK</option>
              <option>4+ BHK</option>
            </StyledSelect>
          </FilterGroup>

          <ApplyButton onClick={applyFilters}>Apply Filters</ApplyButton>
          <ResetButton onClick={() => setFilters({
            location: "Chennai",
            budget: 100000000,
            propertyType: "Residential Apartment",
            bedrooms: "1 BHK",
          })}>Reset</ResetButton>
        </FilterSection>

        <RightColumn>
          {properties.length > 0 && (
            <ResultsInfo>
              <ResultsCount>{properties.length} Properties Found</ResultsCount>
              <LocationTag>
                <FiMapPin size={14} />
                {filters.location}
              </LocationTag>
            </ResultsInfo>
          )}
          
          <PropertyList>
            {properties.length > 0 ? (
              properties.map((property) => (
                <PropertyCard 
                  key={property._id}
                  onClick={() => setSelectedProperty(property)}
                >
                  <PropertyImageContainer>
                    {property.images?.map((image, index) => (
                      <PropertyImage
                        key={index}
                        src={`http://localhost:8080/${image}`}
                        alt={`${property.title} - Image ${index + 1}`}
                        $active={index === currentImageIndices[property._id]}
                      />
                    ))}
                    {property.images?.length > 1 && (
                      <>
                        <SlideButton 
                          $direction="left" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndices(prev => ({
                              ...prev,
                              [property._id]: (prev[property._id] - 1 + property.images.length) % property.images.length
                            }));
                          }}
                        >
                          <FiChevronLeft size={20} />
                        </SlideButton>
                        <SlideButton 
                          $direction="right" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndices(prev => ({
                              ...prev,
                              [property._id]: (prev[property._id] + 1) % property.images.length
                            }));
                          }}
                        >
                          <FiChevronRight size={20} />
                        </SlideButton>
                        <SlideshowControls>
                          {property.images.map((_, index) => (
                            <SlideshowDot
                              key={index}
                              $active={index === currentImageIndices[property._id]}
                              onClick={(e) => handleImageChange(property._id, index, e)}
                            />
                          ))}
                        </SlideshowControls>
                      </>
                    )}
                    <PropertyBadges>
                      <PropertyBadge $type="type">
                        <FiHome size={12} />
                        {property.propertyType}
                      </PropertyBadge>
                      <PropertyBadge $type="bedrooms">
                        <FaBed size={12} />
                        {property.bedrooms}
                      </PropertyBadge>
                    </PropertyBadges>
                  </PropertyImageContainer>
                  
                  <PropertyDetails>
                    <PropertyTitle>{property.title}</PropertyTitle>
                    <PropertyLocation>
                      <FiMapPin size={14} />
                      {property.location?.address}
                    </PropertyLocation>
                    
                    <PropertySpecs>
                      <SpecItem>
                        <FaRulerCombined size={14} />
                        {property.areaSize} sq.ft.
                      </SpecItem>
                    </PropertySpecs>
                    
                    <PriceTag>
                      <span>₹{property.price.toLocaleString()}</span>
                      <PricePerSqft>
                        ₹{(property.price / property.areaSize).toFixed(0)}/sq.ft
                      </PricePerSqft>
                    </PriceTag>
                    
                    <PropertyActions>
                      <ViewDocumentsButton onClick={(e) => handleViewDocuments(property, e)}>
                        View Documents
                      </ViewDocumentsButton>
                      <FavoriteButton>
                        ♡
                      </FavoriteButton>
                    </PropertyActions>
                  </PropertyDetails>
                </PropertyCard>
              ))
            ) : (
              <NoPropertiesMessage>
                <NoResultsIllustration />
                <h3>No properties match your search</h3>
                <p>Try adjusting your filters or search in a different location</p>
                <ResetButton onClick={() => setFilters({
                  location: "Chennai",
                  budget: 100000000,
                  propertyType: "Residential Apartment",
                  bedrooms: "1 BHK",
                })}>Reset Filters</ResetButton>
              </NoPropertiesMessage>
            )}
          </PropertyList>
        </RightColumn>
      </ContentWrapper>

      {selectedProperty && (
        <ModalOverlay onClick={() => setSelectedProperty(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>{selectedProperty.title}</h3>
              <CloseButton onClick={() => setSelectedProperty(null)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <ModalImageContainer>
                {selectedProperty.images?.map((image, index) => (
                  <ModalImage
                    key={index}
                    src={`http://localhost:8080/${image}`}
                    alt={`${selectedProperty.title} - Image ${index + 1}`}
                  />
                ))}
              </ModalImageContainer>
              <ModalDetails>
                <DetailItem>
                  <strong>Location:</strong> {selectedProperty.location?.address}
                </DetailItem>
                <DetailItem>
                  <strong>Price:</strong> ₹{selectedProperty.price.toLocaleString()}
                </DetailItem>
                <DetailItem>
                  <strong>Area:</strong> {selectedProperty.areaSize} sq.ft.
                </DetailItem>
                <DetailItem>
                  <strong>Type:</strong> {selectedProperty.propertyType}
                </DetailItem>
                <DetailItem>
                  <strong>Bedrooms:</strong> {selectedProperty.bedrooms}
                </DetailItem>
              </ModalDetails>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      <ChatbotLogoButton onClick={() => setShowChatbot(!showChatbot)}>
        <img src="/icons/newchat.png" alt="Chatbot Logo" />
      </ChatbotLogoButton>

      {showChatbot && (
        <ChatbotPopup>
          <ChatbotHeader>
            <h3>HestiaBot</h3>
            <CloseButton onClick={() => setShowChatbot(false)}>×</CloseButton>
          </ChatbotHeader>
          <ChatbotContent>
            <ChatbotMessages>
              {messages.map((message, index) => (
                <MessageBubble key={index} sender={message.sender}>
                  {message.text}
                </MessageBubble>
              ))}
            </ChatbotMessages>
            <ChatbotInput>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>
            </ChatbotInput>
          </ChatbotContent>
        </ChatbotPopup>
      )}
    </DashboardContainer>
  );
};

export default BuyerDashboard;

// Styled Components
const DashboardContainer = styled.div`
  font-family: 'Inter', sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
  padding: 20px;
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: 25px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterSection = styled.div`
  width: 280px;
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 20px;
  height: fit-content;
  border: 1px solid #e9ecef;

  @media (max-width: 768px) {
    width: 100%;
    position: static;
  }
`;

const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 25px;
  
  h2 {
    font-size: 1.3rem;
    margin: 0;
    color: #2b2d42;
    font-weight: 600;
  }
  
  svg {
    color: #4a4e69;
  }
`;

const FilterGroup = styled.div`
  margin-bottom: 20px;
`;

const FilterLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #4a4e69;
  font-size: 0.95rem;
  
  svg {
    color: #6c757d;
  }
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 12px 15px;
  border-radius: 10px;
  border: 1px solid #dee2e6;
  background-color: white;
  font-size: 0.95rem;
  color: #495057;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  
  &:focus {
    border-color: #5e72e4;
    box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.1);
    outline: none;
  }
`;

const BudgetSlider = styled.div`
  margin-top: 15px;

  input[type="range"] {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    background: #e9ecef;
    border-radius: 3px;
    outline: none;
    margin: 10px 0;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #5e72e4;
      cursor: pointer;
      transition: all 0.2s;
    }

    &:hover::-webkit-slider-thumb {
      transform: scale(1.2);
      background: #4a5bd1;
    }
  }
`;

const BudgetValue = styled.span`
  margin-left: auto;
  font-weight: 600;
  color: #2b2d42;
`;

const BudgetRange = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 0.85rem;
  color: #6c757d;
`;

const ApplyButton = styled.button`
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 500;
  font-size: 1rem;
  margin-top: 10px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: linear-gradient(135deg, #4a5bd1, #7049d1);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(94, 114, 228, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ResetButton = styled.button`
  width: 100%;
  padding: 12px;
  background: transparent;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  font-weight: 500;
  font-size: 1rem;
  margin-top: 10px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f8f9fa;
    border-color: #adb5bd;
  }
`;

const RightColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ResultsInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  border: 1px solid #e9ecef;
`;

const ResultsCount = styled.div`
  font-weight: 600;
  color: #2b2d42;
`;

const LocationTag = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  background: #f8f9fa;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #495057;
  
  svg {
    color: #5e72e4;
  }
`;

const PropertyList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
`;

const PropertyCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  height: 260px;
  cursor: pointer;
  position: relative;
  border: 1px solid #e9ecef;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    border-color: #dbe4ff;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }
`;

const PropertyImageContainer = styled.div`
  width: 45%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #f1f3f5;

  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
  }
`;

const PropertyImage = styled.img`
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.5s ease;
  opacity: ${props => props.$active ? 1 : 0};
`;

const SlideButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: all 0.2s;
  left: ${props => props.$direction === 'left' ? '15px' : 'auto'};
  right: ${props => props.$direction === 'right' ? '15px' : 'auto'};
  
  &:hover {
    background: rgba(0, 0, 0, 0.5);
    transform: translateY(-50%) scale(1.1);
  }

  @media (max-width: 480px) {
    width: 30px;
    height: 30px;
  }
`;

const SlideshowControls = styled.div`
  position: absolute;
  bottom: 15px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 2;
`;

const SlideshowDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.5)'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: white;
    transform: scale(1.2);
  }
`;

const PropertyBadges = styled.div`
  position: absolute;
  top: 15px;
  left: 15px;
  display: flex;
  gap: 8px;
  z-index: 2;
`;

const PropertyBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: ${props => props.$type === 'type' ? 'rgba(94, 114, 228, 0.9)' : 'rgba(33, 37, 41, 0.9)'};
  color: white;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  
  svg {
    font-size: 0.7rem;
  }
`;

const PropertyDetails = styled.div`
  width: 55%;
  padding: 20px;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PropertyTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 1.4rem;
  color: #2b2d42;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PropertyLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #6c757d;
  font-size: 0.95rem;
  margin-bottom: 15px;
  
  svg {
    color: #5e72e4;
    flex-shrink: 0;
  }
`;

const PropertySpecs = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
`;

const SpecItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  color: #495057;
  
  svg {
    color: #6c757d;
  }
`;

const PriceTag = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  
  span {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2b2d42;
  }
`;

const PricePerSqft = styled.span`
  font-size: 0.9rem;
  color: #6c757d;
`;

const PropertyActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
`;

const ViewDocumentsButton = styled.button`
  padding: 8px 16px;
  background: #f8f9fa;
  color: #5e72e4;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #5e72e4;
    color: white;
    border-color: #5e72e4;
  }
`;

const FavoriteButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #ff6b6b;
    border-color: #ff6b6b;
  }
`;

const NoPropertiesMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  text-align: center;
  
  h3 {
    font-size: 1.5rem;
    color: #2b2d42;
    margin: 20px 0 10px;
  }
  
  p {
    color: #6c757d;
    margin-bottom: 20px;
  }
`;

const NoResultsIllustration = styled.div`
  width: 150px;
  height: 150px;
  background: #f1f3f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #adb5bd;
`;




// Modal Components (keep these exactly as in your original code)
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 80%;
  max-width: 800px;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;

  h3 {
    margin: 0;
    font-size: 1.5rem;
    color: #2b2d42;
  }
`;

const ModalBody = styled.div`
  display: flex;
  padding: 20px;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ModalImageContainer = styled.div`
  width: 50%;
  height: 300px;
  overflow: hidden;
  border-radius: 8px;
  background: #f1f3f5;

  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
  }
`;

const ModalImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ModalDetails = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  gap: 15px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const DetailItem = styled.div`
  font-size: 1rem;
  color: #2b2d42;

  strong {
    color: #5e72e4;
    margin-right: 10px;
  }
`;

// Chatbot Components (keep these exactly as in your original code)

const slideIn = keyframes`
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const ChatbotLogoButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: none;
  border: none;
  padding: 10px 0;
  width: 60px;
  height: 80px;
  display: flex;
  cursor: pointer;
  z-index: 1000;

  &:hover {
    transform: scale(1.1);
    color: white;
    background: transparent;
    outline: none;
  }

  img {
    width: 125%;
    height: 125%;
    animation: shake 1s infinite, jump 0.6s infinite;
    transform-origin: center bottom;
  }

  @keyframes shake {
    0%, 100% {
      transform: rotate(-3deg);
    }
    50% {
      transform: rotate(3deg);
    }
  }

  @keyframes jump {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }
`;

const ChatbotPopup = styled.div`
  position: fixed;
  bottom: 100px;
  right: 40px;
  width: 450px;
  height: 700px;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-radius: 18px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1001;
  animation: ${slideIn} 0.3s ease-out forwards;
  transform-origin: bottom right;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const ChatbotHeader = styled.div`
  background: linear-gradient(135deg, #4c507f, #5e63b6);
  color: white;
  padding: 18px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 22px;
  cursor: pointer;
  padding: 5px 10px 8px;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
`;

const ChatbotContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  background: #f9f9f9;
`;

const ChatbotMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: linear-gradient(to bottom,rgb(255, 255, 255), #f0f2f5);
  margin-bottom: 80px;
  scroll-behavior: smooth;

  /* Keep existing scrollbar styles */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background:rgb(231, 231, 231);
  }
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
`;

const MessageBubble = styled.div`
  background-color: ${(props) =>
    props.sender === "user" ? "linear-gradient(135deg, #4c507f, #5e63b6)" : "#ffffff"};
  color: ${(props) => (props.sender === "user" ? "black" : " #4c507f")};
  padding: 12px 16px;
  margin: 4px 0;
  border-radius: ${(props) =>
    props.sender === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px"};
  max-width: 82%;
  align-self: ${(props) =>
    props.sender === "user" ? "flex-end" : "flex-start"};
  word-wrap: break-word;
  font-size: 15px;
  line-height: 1.4;
  box-shadow: ${(props) =>
    props.sender === "user"
      ? "0 2px 5px rgba(76, 80, 127, 0.3)"
      : "0 2px 5px rgba(0, 0, 0, 0.05)"};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${(props) =>
      props.sender === "user"
        ? "0 4px 8px rgba(76, 80, 127, 0.4)"
        : "0 4px 8px rgba(0, 0, 0, 0.1)"};
  }
`;

const ChatbotInput = styled.div`
  display: flex;
  gap: 10px;
  padding: 14px 18px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  align-items: center;
  flex-shrink: 0; /* Prevents shrinking */
  position: sticky;
  bottom: 0;
  z-index: 2;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);

  input {
    flex: 1;
    padding: 14px 18px;
    border: 1px solid #ddd;
    border-radius: 25px;
    outline: none;
    font-size: 15px;
    min-width: 300px; /* Larger width */
    height: 25 px; /* Taller input */
  }

  button {
    background-color: #4c507f;
    color: white;
    border: none;
    padding: 0 12px; /* Reduced padding */
    border-radius: 25px;
    cursor: pointer;
    font-size: 14px;
    height: 35px; /* Match input height */
    width: 80px; /* Fixed smaller width */
    flex-shrink: 0;
    margin-left: -5px;

    &:hover {
      background-color: #3a3e64;
    }
  }
`;