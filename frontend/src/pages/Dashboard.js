import React from 'react';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("BUY");
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Update your state and functions
  const [underlineProps, setUnderlineProps] = useState({
    width: '60px',
    left: '0',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    isHovering: false
  });

  // Modified handler functions
  const updateSearchStyle = (category, color) => {
    setActiveCategory(category);
    const button = document.querySelector(`button[data-category="${category}"]`);
    if (button) {
      const { width, left } = button.getBoundingClientRect();
      const container = button.parentElement;
      const containerLeft = container.getBoundingClientRect().left;
      
      setUnderlineProps(prev => ({
        ...prev,
        width: `${width}px`,
        left: `${left - containerLeft}px`,
        backgroundColor: color,
        isHovering: false
      }));
    }
  };

  const handleMouseEnter = (e, color) => {
    const { width, left } = e.currentTarget.getBoundingClientRect();
    const container = e.currentTarget.parentElement;
    const containerLeft = container.getBoundingClientRect().left;
    
    setUnderlineProps(prev => ({
      ...prev,
      width: `${width}px`,
      left: `${left - containerLeft}px`,
      backgroundColor: color,
      isHovering: true
    }));
  };

  const handleMouseLeave = () => {
    const activeButton = document.querySelector(`button[data-category="${activeCategory}"]`);
    if (activeButton) {
      const { width, left } = activeButton.getBoundingClientRect();
      const container = activeButton.parentElement;
      const containerLeft = container.getBoundingClientRect().left;
      
      setUnderlineProps(prev => ({
        ...prev,
        width: `${width}px`,
        left: `${left - containerLeft}px`,
        isHovering: false
      }));
    }
  };

  // Add this useEffect for handling resize
  useEffect(() => {
    const handleResize = () => {
      const activeButton = document.querySelector(`button[data-category="${activeCategory}"]`);
      if (activeButton && !underlineProps.isHovering) {
        const { width, left } = activeButton.getBoundingClientRect();
        const container = activeButton.parentElement;
        const containerLeft = container.getBoundingClientRect().left;
        
        setUnderlineProps(prev => ({
          ...prev,
          width: `${width}px`,
          left: `${left - containerLeft}px`
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeCategory, underlineProps.isHovering]);

  // Add this new useEffect for initial positioning
  useEffect(() => {
    // Set initial position for the active category (BUY)
    const activeButton = document.querySelector(`button[data-category="${activeCategory}"]`);
    if (activeButton) {
      const { width, left } = activeButton.getBoundingClientRect();
      const container = activeButton.parentElement;
      const containerLeft = container.getBoundingClientRect().left;
      
      setUnderlineProps(prev => ({
        ...prev,
        width: `${width}px`,
        left: `${left - containerLeft}px`,
        backgroundColor: 'rgba(255, 255, 255, 0.15)' // Default color for BUY
      }));
    }
  }, [activeCategory]); // Empty dependency array means this runs once on mount


  return (
    <Container>

      <LogoContainer>
        <img 
          src="/icons/logo.png" 
          alt="Hestia Logo" 
          style={{ 
            width: '100px', 
            height: '100px',
            marginBottom: '5px' 
          }}
        />
      </LogoContainer>

      <ContentWrapper>
      <VideoContainer autoPlay muted loop id="dashboardVideo">
      <source src="/videos/dashboardbg.mp4" type="video/mp4" />
      </VideoContainer>

      <OverlayContainer />
      <video autoPlay muted loop id="dashboardVideo" style={{ 
        position: 'absolute', 
        width: '100%', 
        height: '100%', 
        top: '0', 
        left: '0', 
        objectFit: 'cover', 
        zIndex: '-1'
      }}>

      </video>
      <Overlay />

      <HeaderContainer>
        <MainHeading>
          <HestiaLogo className="fas fa-house-lock" />
          WELCOME TO HESTIA
          <SubHeading>Where Trust Meets Real Estate</SubHeading>
        </MainHeading>

        <SearchContainer id="searchContainer">
          <CategoryButtons>
            <CategoryButton 
              data-category="BUY" // Add this line
              className={activeCategory === "BUY" ? "active" : ""} 
              onClick={() => updateSearchStyle("BUY", "rgba(255, 255, 255, 0.15)")}
              onMouseEnter={(e) => handleMouseEnter(e, "rgba(255, 255, 255, 0.15)")}
              onMouseLeave={handleMouseLeave}
            >
              BUY
            </CategoryButton>
            <CategoryButton 
              data-category="RENT"
              className={activeCategory === "RENT" ? "active" : ""} 
              onClick={() => updateSearchStyle("RENT", "rgba(255, 182, 193, 0.3)")}
              onMouseEnter={(e) => handleMouseEnter(e, "rgba(255, 182, 193, 0.3)")}
              onMouseLeave={handleMouseLeave}
            >
              RENT
            </CategoryButton>
            <CategoryButton 
              data-category="PG/CO-LIVING"
              className={activeCategory === "PG/CO-LIVING" ? "active" : ""} 
              onClick={() => updateSearchStyle("PG/CO-LIVING", "rgba(173, 216, 230, 0.3)")}
              onMouseEnter={(e) => handleMouseEnter(e, "rgba(173, 216, 230, 0.3)")}
              onMouseLeave={handleMouseLeave}
            >
              PG/CO-LIVING
            </CategoryButton>
            <CategoryButton 
              data-category="PLOTS"
              className={activeCategory === "PLOTS" ? "active" : ""} 
              onClick={() => updateSearchStyle("PLOTS", "rgba(216, 191, 216, 0.3)")}
              onMouseEnter={(e) => handleMouseEnter(e, "rgba(216, 191, 216, 0.3)")}
              onMouseLeave={handleMouseLeave}
            >
              PLOTS
            </CategoryButton>
            <UnderlineTracker 
              style={{
                width: underlineProps.width,
                left: underlineProps.left,
                backgroundColor: underlineProps.backgroundColor
              }}
            />
          </CategoryButtons>

          <SearchBar>
            <SearchInput 
              type="text" 
              placeholder="Search for locality, landmark, project, or builder" 
            />
            <SearchButton onClick={() => navigate('/buyer')}>
              Search
            </SearchButton>
          </SearchBar>
        </SearchContainer>
      </HeaderContainer>

      
      <MenuButton onClick={toggleMenu}>
        <MenuButtonDiv className={isOpen ? 'open' : ''} />
        <MenuButtonDiv className={isOpen ? 'open' : ''} />
        <MenuButtonDiv className={isOpen ? 'open' : ''} />
      </MenuButton>

      <SlidingTab className={isOpen ? "open" : ""}>
        <p>Some content inside the sliding tab</p>
      </SlidingTab>

      <ButtonContainer>
  <Button onClick={() => navigate("/insights")}>INSIGHTS</Button>
  <Button onClick={() => { localStorage.removeItem("token"); navigate("/"); }}>
    LOG OUT
  </Button>
  <PostPropertyButton onClick={() => navigate("/seller-form")}>
    (+) POST PROPERTY
  </PostPropertyButton>

  {/* New Chatbot Button with Image Logo */}
  <ChatbotLogoButton onClick={() => navigate("/chatbot")}>
    <img 
      src="/icons/newchat.png"  // Correct image path from the public folder
      alt="Chatbot Logo" 
      style={{ width: '100px', height: '100px', cursor: 'pointer' }} 
    />
  </ChatbotLogoButton>
</ButtonContainer>

      
    <WhyHestiaSection>
      <DividerLine>
        <Circle />
        <WhyTitle>Why Choose HESTIA</WhyTitle>
        <Circle />
      </DividerLine>

      <WhyGrid>
        <WhyCard>
          <img src="/icons/Fraud.png" alt="Fraudster-Free Real Estate" />
          <h3>Fraudster-Free Real Estate</h3>
          <p>Ensures only verified property listings through document authentication and agent verification.</p>
        </WhyCard>

        <WhyCard>
          <img src="/icons/Brokerage.png" alt="No Middlemen, Low Brokerage" />
          <h3>No Middlemen, Low Brokerage</h3>
          <p>Eliminates unnecessary brokers, reducing costs and ensuring direct deals between buyers and sellers.</p>
        </WhyCard>

        <WhyCard>
          <img src="/icons/Secure.png" alt="Secure & Transparent Transactions" />
          <h3>Secure & Transparent Transactions</h3>
          <p>Uses advanced security measures to prevent scams and provide a safe buying/selling experience.</p>
        </WhyCard>

        <WhyCard>
          <img src="/icons/Friendly.png" alt="User-Friendly & Efficient Platform" />
          <h3>User-Friendly & Efficient Platform</h3>
          <p>Provides a seamless interface for buyers, sellers, and agents to connect and complete transactions easily.</p>
        </WhyCard>
      </WhyGrid>
    </WhyHestiaSection>

        {/* New Advice & Tools Section */}
        <AdviceToolsSection>
      <SectionTitle>Advice & Tools</SectionTitle>
      <SectionSubtitle>Expert tools for your real estate journey</SectionSubtitle>
      
      <ToolsGrid>
        <ToolCard onClick={() => navigate('/rates-trends')}>
          <h3>Rates & Trends</h3>
          <p>Know all about Property Rates & Trends in your city</p>
          <ViewLink>View now</ViewLink>
        </ToolCard>

        <ToolCard onClick={() => navigate('/emi-calculator')}>
          <h3>EMI Calculator</h3>
          <p>Know how much you'll have to pay every month on your loan</p>
          <ViewLink>View now</ViewLink>
        </ToolCard>

        <ToolCard onClick={() => navigate('/investment-hotspots')}>
          <h3>Investment Hotspot</h3>
          <p>Discover the top localities in your city for investment</p>
          <ViewLink>View now</ViewLink>
        </ToolCard>

        <ToolCard onClick={() => navigate('/research-insights')}>
          <h3>Research Insights</h3>
          <p>Get experts insights and research reports on real estate</p>
          <ViewLink>View now</ViewLink>
        </ToolCard>
      </ToolsGrid>
    </AdviceToolsSection>
    </ContentWrapper>
    </Container>
  );
};
export default Dashboard;

// Styled Components
const Container = styled.div`
  height: 100vh;
  width: 100vw;
  position: relative;
  overflow-y: auto; // Enable vertical scrolling
  font-family: 'Cinzel', serif;
`;

const VideoContainer = styled.video`
  position: fixed; // Changed from absolute
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  object-fit: cover;
  z-index: -1;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  min-height: 100vh;
  padding: 20px 0;
`;

const LogoContainer = styled.div`
  position: absolute;
  top: 200px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  text-align: center;
`;


const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.62);
  z-index: 0;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("/videos/Temple by the Sea Composition.mp4") no-repeat center center/cover;
  z-index: -1;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgb(230, 227, 250);
  font-size: 5em;
  font-weight: 750;
  letter-spacing: 2px;
  text-transform: uppercase;
  position: absolute;
  top: 18%; // Increased from 20% to push content down
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  width: 100%;
  margin-top: 20px; // Added space for logo
`;

// Adjust MainHeading margins
const MainHeading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 40px;
  position: relative;
`;

const HestiaLogo = styled.i`
  font-size: 4rem;
  color: rgb(230, 227, 250);
  margin-bottom: 15px;
`;

const SubHeading = styled.h2`
  font-size: 0.3em;
  font-weight: 400;
  font-family: 'Gill Sans MT', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 5px;
  text-transform: none;
  letter-spacing: 1px;
`;
const SearchContainer = styled.div`
  width: 60%;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 10px;
  backdrop-filter: blur(10px);
  transition: background 0.5s ease;
  position: relative; // Add this
`;

const UnderlineTracker = styled.div`
  position: absolute;
  bottom: 0;
  height: 3px;
  background-color: white;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-radius: 5px;
  will-change: transform, width;
  transform: translateX(${props => props.left});
  width: ${props => props.width};
  background-color: ${props => props.color};
`;



const CategoryButtons = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 5px;
  position: relative;
  margin-bottom: 10px; // Add space between buttons and search
`;


const CategoryButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  padding: 5px 8px;
  position: relative;
  z-index: 1;
  
  /* Remove all blue effects */
  &:hover, &:focus, &:active {
    color: white;
    background: transparent;
    outline: none;
    -webkit-tap-highlight-color: transparent;
  }

  &.active {
    color: #FFD700;
    font-weight: 800;
  }
`;
const SearchBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgb(230, 227, 250);
  padding: 6px 10px;
  border-radius: 50px;
  height: 36px;
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  flex-grow: 1;
  font-size: 14px;
  padding: 4px;
  background: rgb(230, 227, 250);
  color: black;
`;

const SearchButton = styled.button`
  background: #4c507f;
  color: white;
  border: none;
  padding: 10px 10px;         /* Minimal padding */
  border-radius: 50px;       /* Subtle rounded edges */
  font-size: 12px;          /* Small text */
  cursor: pointer;
  font-weight: bold;
  width: auto;              /* Let content dictate width */
  min-width: 80px;          /* Fixed small width (adjust as needed) */
  margin-left: 8px;         /* Space from input field */
  white-space: nowrap;      /* Prevent text wrapping */

  &:hover {
    background: #3a3e64;    /* Darker shade on hover */
  }
`;

const MenuButton = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  width: 40px;
  height: 35px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  z-index: 100;
`;

const MenuButtonDiv = styled.div`
  width: 100%;
  height: 5px;
  background-color: white;
  border-radius: 3px;
  transition: 0.3s ease;

  &.open:nth-child(1) {
    transform: rotate(45deg) translateY(8px);
  }
  &.open:nth-child(2) {
    opacity: 0;
  }
  &.open:nth-child(3) {
    transform: rotate(-45deg) translateY(-8px);
  }
`;

const SlidingTab = styled.div`
  position: absolute;
  top: 0;
  left: -250px;
  width: 250px;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 99;
  transition: transform 0.3s ease;

  &.open {
    transform: translateX(250px);
  }
`;

const ButtonContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 15px;
`;

const Button = styled.button`
  font-size: 16px;
  font-weight: bold;
  padding: 10px 20px;
  background: transparent;
  color: white;
  cursor: pointer;
  transition: 0.3s ease;
  border: none;
  
  /* Remove all default browser styling */
  &:hover, &:focus, &:active {
    color: white;
    background: transparent;
    outline: none;
    text-decoration: underline;
    -webkit-tap-highlight-color: transparent;
  }
`;

const PostPropertyButton = styled(Button)`
  border: 2px solid #FFD700;
  color: #FFD700;
  border-radius: 5px;

  &:hover {
    background: #FFD700;
    color: black;
  }
`;
const ChatbotLogoButton = styled.button`
  background: transparent;
  border: none;
  padding: 10px;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1); /* Slightly enlarge on hover */
  }
`;

const WhyHestiaSection = styled.section`
  text-align: center;
  padding: 30px 10%; 
  background: transparent;
  position: relative;
  z-index: 2;
  margin-top: 60vh; 
`;

const DividerLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
  position: relative;

  &::before,
  &::after {
    content: "";
    height: 2px;
    background: #ddd;
    flex-grow: 1;
    margin: 0 15px;
  }
`;

const Circle = styled.div`
  width: 12px;
  height: 12px;
  background: transparent;
  border: 2px solid #ff6666;
  border-radius: 50%;
`;

const WhyTitle = styled.h2`
  font-size: 2em;
  font-weight: 700;
  color: #fff;
  margin: 0 10px;
`;

const WhyGrid = styled.div`
  display: flex;
  justify-content: space-around;
  gap: 30px;
  flex-wrap: wrap;
`;

const WhyCard = styled.div`
  text-align: center;
  width: 220px;
  color: #fff;

  img {
    width: 100px;
    height: 100px;
    margin-bottom: 10px;
  }

  h3 {
    font-size: 1.2em;
    font-weight: 600;
    margin-bottom: 5px;
  }

  p {
    font-size: 0.9em;
    color: rgba(255, 255, 255, 0.8);
  }
`;

//copied from magic bricks
const AdviceToolsSection = styled.section`
  padding: 60px 10%;
  background: rgba(255, 255, 255, 0);
  color: #333;
  text-align: center;
  position: relative;
  z-index: 3;
  margin-top: -50px; // Adjust overlap if needed
`;

const SectionTitle = styled.h1`
  font-size: 2.2em;
  margin-bottom: 10px;
  color: white;  // Explicit white color
`;

const SectionSubtitle = styled.h2`
  font-size: 1.5em;
  font-weight: 400;
  margin-bottom: 40px;
  color: rgba(255, 255, 255, 0.9);  // Slightly transparent white
`;

const ToolsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ToolCard = styled.button`
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 25px;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  color: #333; /* Default text color */

  /* Remove all default browser styling */
  -webkit-tap-highlight-color: transparent;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    border-color: #4c507f;
    color: #333 !important; /* Force text color to stay dark */
    background: white !important; /* Force background to stay white */
  }

  /* Remove focus outline */
  &:focus {
    outline: none !important;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05) !important;
  }

  h3 {
    font-size: 1.3em;
    margin-bottom: 15px;
    color: #222;
  }

  p {
    color: #666;
    margin-bottom: 20px;
    line-height: 1.5;
  }
`;

const ViewLink = styled.span`
  color: #4c507f;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;

  &::after {
    content: '→';
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: translateX(3px);
  }
`;
