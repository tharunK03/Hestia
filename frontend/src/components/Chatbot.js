
// `;
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styled, { keyframes } from "styled-components";
import { FaRobot,  FaPaperPlane, FaMapMarkerAlt,  FaChartLine, FaShieldAlt, FaSearch, FaCity, FaBuilding, FaDollarSign } from "react-icons/fa";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { 
      text: "Welcome to RealEstate AI! I can help you analyze investment opportunities, identify safe neighborhoods, and find the perfect place to call home. What would you like to know today?", 
      sender: "bot" 
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const GEMINI_API_KEY = "AIzaSyBnZBSnv1LLJ-61Zxj54l9dx0bFDRGC_yQ"; // Replace with your actual API key
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (inputMessage.trim()) {
      const userMessage = { text: inputMessage, sender: "user" };
      setMessages([...messages, userMessage]);
      setInputMessage("");
      setIsTyping(true);

      try {
        const response = await axios.post(
          GEMINI_API_URL,
          {
            contents: [{ 
              parts: [{ 
                text: `As a professional real estate investment advisor, provide detailed analysis about: ${inputMessage}. 
                Consider factors like appreciation potential, safety, amenities, and market trends. 
                Format your response with clear sections and bullet points when appropriate.` 
              }] 
            }],
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const botReply =
          response.data.candidates && response.data.candidates[0]
            ? response.data.candidates[0].content.parts[0].text
            : "I couldn't process your request. Could you please rephrase your question?";

        setTimeout(() => {
          setMessages(prev => [...prev, { text: botReply, sender: "bot" }]);
          setIsTyping(false);
        }, 1000);
      } catch (error) {
        console.error("Error sending message:", error);
        setTimeout(() => {
          setMessages(prev => [...prev, {
            text: error.response
              ? error.response.data.error.message
              : "Our servers are currently busy. Please try again in a few moments.",
            sender: "bot",
          }]);
          setIsTyping(false);
        }, 1000);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const quickQuestions = [
    { 
      text: "Top appreciating neighborhoods", 
      icon: <FaChartLine />,
      category: "investment"
    },
    { 
      text: "Safest communities for families", 
      icon: <FaShieldAlt />,
      category: "safety"
    },
    { 
      text: "Upcoming development areas", 
      icon: <FaMapMarkerAlt />,
      category: "investment"
    },
    { 
      text: "Best rental yield locations", 
      icon: <FaDollarSign />,
      category: "investment"
    },
    { 
      text: "Walkable downtown areas", 
      icon: <FaCity />,
      category: "lifestyle"
    },
    { 
      text: "Luxury condo market trends", 
      icon: <FaBuilding />,
      category: "market"
    }
  ];

  const categories = [
    { name: "all", label: "All Topics" },
    { name: "investment", label: "Investment" },
    { name: "safety", label: "Safety" },
    { name: "market", label: "Market Trends" },
    { name: "lifestyle", label: "Lifestyle" }
  ];

  const [activeCategory, setActiveCategory] = useState("all");

  const filteredQuestions = activeCategory === "all" 
    ? quickQuestions 
    : quickQuestions.filter(q => q.category === activeCategory);

  return (
    <ChatContainer>
      <Header>
        <Logo>
          <FaRobot className="icon" />
          <h1>Manåi</h1>
        </Logo>
        <Tagline>Your intelligent property investment assistant</Tagline>
      </Header>

      <MainContent>
        <Sidebar>
          <SearchBox>
            <input type="text" placeholder="Search property insights..." />
            <FaSearch className="search-icon" />
          </SearchBox>
          
          <CategoryTitle>Quick Analysis Topics</CategoryTitle>
          <CategoryFilters>
            {categories.map(category => (
              <CategoryFilter 
                key={category.name}
                active={activeCategory === category.name}
                onClick={() => setActiveCategory(category.name)}
              >
                {category.label}
              </CategoryFilter>
            ))}
          </CategoryFilters>

          <QuickQuestionsTitle>Common Questions</QuickQuestionsTitle>
          <QuickQuestionsGrid>
            {filteredQuestions.map((question, index) => (
              <QuickQuestion 
                key={index} 
                onClick={() => setInputMessage(question.text)}
              >
                <QuestionIcon>{question.icon}</QuestionIcon>
                <QuestionText>{question.text}</QuestionText>
              </QuickQuestion>
            ))}
          </QuickQuestionsGrid>

          <MarketInsights>
            <h3>Market Pulse</h3>
            <InsightItem>
              <div>🏙️ Downtown Condos</div>
              <TrendUp>+8.2% YoY</TrendUp>
            </InsightItem>
            <InsightItem>
              <div>🏡 Suburban Homes</div>
              <TrendUp>+5.7% YoY</TrendUp>
            </InsightItem>
            <InsightItem>
              <div>🏗️ New Developments</div>
              <TrendDown>-2.1% YoY</TrendDown>
            </InsightItem>
          </MarketInsights>
        </Sidebar>

        <ChatArea>
          <ChatHeader>
            <ChatTitle>Investment Advisor</ChatTitle>
            <StatusIndicator>
              <StatusDot />
              <span>{isTyping ? "Analyzing..." : "Online"}</span>
            </StatusIndicator>
          </ChatHeader>
          
          <MessagesContainer>
            {messages.map((message, index) => (
              <MessageBubble key={index} sender={message.sender}>
                {message.text}
              </MessageBubble>
            ))}
            {isTyping && (
              <TypingIndicator>
                <TypingDot delay="0s" />
                <TypingDot delay="0.2s" />
                <TypingDot delay="0.4s" />
              </TypingIndicator>
            )}
            <div ref={messagesEndRef} />
          </MessagesContainer>
          
          <InputContainer>
            <InputField
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about property values, neighborhood safety, or market trends..."
            />
            <SendButton onClick={sendMessage} disabled={!inputMessage.trim()}>
              <FaPaperPlane />
            </SendButton>
          </InputContainer>
        </ChatArea>

        <ResourcesPanel>
          <ResourcesHeader>Investment Resources</ResourcesHeader>
          <ResourceCard>
            <ResourceIcon>📈</ResourceIcon>
            <ResourceTitle>Market Trends Report</ResourceTitle>
            <ResourceDesc>Latest quarterly analysis</ResourceDesc>
          </ResourceCard>
          <ResourceCard>
            <ResourceIcon>🏆</ResourceIcon>
            <ResourceTitle>Top 10 Neighborhoods</ResourceTitle>
            <ResourceDesc>2024 appreciation leaders</ResourceDesc>
          </ResourceCard>
          <ResourceCard>
            <ResourceIcon>🛡️</ResourceIcon>
            <ResourceTitle>Safety Guide</ResourceTitle>
            <ResourceDesc>Crime stats & ratings</ResourceDesc>
          </ResourceCard>
          <ResourceCard>
            <ResourceIcon>💡</ResourceIcon>
            <ResourceTitle>Investor Toolkit</ResourceTitle>
            <ResourceDesc>ROI calculators</ResourceDesc>
          </ResourceCard>
        </ResourcesPanel>
      </MainContent>
    </ChatContainer>
  );
};

export default Chatbot;

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled Components
const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #2b5876 0%, #4e4376 100%);
  color: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .icon {
    font-size: 2rem;
    color: #4fd1c5;
  }

  h1 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 600;
  }
`;

const Tagline = styled.p`
  margin: 0.5rem 0 0;
  font-size: 1rem;
  opacity: 0.9;
`;

const MainContent = styled.main`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const Sidebar = styled.aside`
  width: 280px;
  background: white;
  padding: 1.5rem;
  border-right: 1px solid #eaeaea;
  overflow-y: auto;
`;

const SearchBox = styled.div`
  position: relative;
  margin-bottom: 1.5rem;

  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.9rem;
    transition: all 0.3s;

    &:focus {
      outline: none;
      border-color: #4fd1c5;
      box-shadow: 0 0 0 3px rgba(79, 209, 197, 0.2);
    }
  }

  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #888;
  }
`;

const CategoryTitle = styled.h3`
  font-size: 0.9rem;
  text-transform: uppercase;
  color: #666;
  margin: 1.5rem 0 0.75rem;
  letter-spacing: 0.5px;
`;

const CategoryFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const CategoryFilter = styled.button`
  padding: 0.5rem 0.75rem;
  background: ${props => props.active ? '#4e4376' : '#f0f2f5'};
  color: ${props => props.active ? 'white' : '#555'};
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#4e4376' : '#e2e6ea'};
  }
`;

const QuickQuestionsTitle = styled(CategoryTitle)`
  margin-top: 2rem;
`;

const QuickQuestionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
`;

const QuickQuestion = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #4fd1c5;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
`;

const QuestionIcon = styled.div`
  font-size: 1rem;
  color: #4e4376;
`;

const QuestionText = styled.span`
  font-size: 0.85rem;
  color: #333;
`;

const MarketInsights = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background: #f8f9ff;
  border-radius: 8px;
  border: 1px solid #e6e8ff;

  h3 {
    font-size: 0.9rem;
    color: #4e4376;
    margin-top: 0;
    margin-bottom: 1rem;
  }
`;

const InsightItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.85rem;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const TrendUp = styled.span`
  color: #10b981;
  font-weight: 500;
`;

const TrendDown = styled.span`
  color: #ef4444;
  font-weight: 500;
`;

const ChatArea = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
`;

const ChatHeader = styled.div`
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  color: #2b5876;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #666;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 1rem 1.25rem;
  border-radius: ${props => 
    props.sender === "user" ? "18px 18px 0 18px" : "18px 18px 18px 0"};
  background: ${props => 
    props.sender === "user" ? "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)" : "white"};
  color: ${props => (props.sender === "user" ? "white" : "#333")};
  align-self: ${props => 
    props.sender === "user" ? "flex-end" : "flex-start"};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  line-height: 1.5;
  animation: ${fadeIn} 0.3s ease-out;
  font-size: 0.95rem;

  a {
    color: ${props => (props.sender === "user" ? "#a5d8ff" : "#2b5876")};
    text-decoration: underline;
  }

  ul, ol {
    padding-left: 1.25rem;
    margin: 0.5rem 0;
  }

  li {
    margin-bottom: 0.25rem;
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
  padding: 1rem 1.25rem;
  background: white;
  border-radius: 18px 18px 18px 0;
  width: fit-content;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TypingDot = styled.div`
  width: 8px;
  height: 8px;
  background-color: #4e4376;
  border-radius: 50%;
  animation: ${pulse} 1.5s infinite ease-in-out;
  animation-delay: ${props => props.delay};
`;

const InputContainer = styled.div`
  padding: 1rem 1.5rem;
  background: white;
  border-top: 1px solid #eaeaea;
  display: flex;
  gap: 0.75rem;
`;

const InputField = styled.input`
  flex: 1;
  padding: 0.85rem 1.25rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #4e4376;
    box-shadow: 0 0 0 3px rgba(78, 67, 118, 0.1);
  }
`;

const SendButton = styled.button`
  padding: 0 1.25rem;
  background: ${props => props.disabled ? '#ddd' : 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)'};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
`;

const ResourcesPanel = styled.aside`
  width: 280px;
  background: white;
  padding: 1.5rem;
  border-left: 1px solid #eaeaea;
  overflow-y: auto;
`;

const ResourcesHeader = styled.h3`
  font-size: 1rem;
  color: #2b5876;
  margin-top: 0;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #eee;
`;

const ResourceCard = styled.div`
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8f9ff;
  border-radius: 8px;
  border: 1px solid #e6e8ff;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }
`;

const ResourceIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`;

const ResourceTitle = styled.h4`
  margin: 0 0 0.25rem;
  font-size: 0.95rem;
  color: #2b5876;
`;

const ResourceDesc = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #666;
`;