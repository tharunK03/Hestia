import { useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { FaLock, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        email,
        password,
      });

      const { token, role } = res.data;
      if (token && role) {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        console.log("✅ Token saved:", token);

        if (role === "admin") navigate("/admin-dashboard");
        else if (role === "agent") navigate("/agent-dashboard");
        else navigate("/dashboard");
      } else {
        setError("Login failed: Token missing");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Invalid email or password.");
    }
  };

  return (
    <AuthContainer>
      <Overlay />
      <Content>
        <Logo>H</Logo>
        <Title>Welcome to Hestia</Title>
        <Form onSubmit={handleLogin}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <InputWrapper>
            <FaEnvelope className="icon" />
            <Input type="email" placeholder="Email..." required onChange={(e) => setEmail(e.target.value)} />
          </InputWrapper>
          <InputWrapper>
            <FaLock className="icon" />
            <Input type="password" placeholder="Password..." required onChange={(e) => setPassword(e.target.value)} />
          </InputWrapper>
          <Button type="submit">Get Started</Button>
        </Form>
        <SwitchText>
          Don't have an account?
          <SwitchButton onClick={() => navigate("/signup")}>Sign Up</SwitchButton>
        </SwitchText>
      </Content>
    </AuthContainer>
  );
};

export default Login;

// Styled Components (same as you had)
const AuthContainer = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background: url("/images/loginpage.png") no-repeat center center/cover;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
`;

const Content = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.15);
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  backdrop-filter: blur(10px);
  width: 350px;
`;

const Logo = styled.div`
  font-size: 40px;
  font-weight: bold;
  color: white;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  color: white;
  margin-bottom: 15px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 12px;
  border-radius: 5px;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: white;
  font-size: 16px;
  padding-left: 10px;
  &::placeholder {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const Button = styled.button`
  background: #ff5722;
  color: white;
  font-size: 18px;
  padding: 12px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  transition: 0.3s ease;
  &:hover {
    background: #e64a19;
  }
`;

const SwitchText = styled.p`
  margin-top: 10px;
  color: white;
`;

const SwitchButton = styled.span`
  color: #ff5722;
  font-weight: bold;
  cursor: pointer;
  margin-left: 5px;
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 14px;
  margin-bottom: 10px;
`;