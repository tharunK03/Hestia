import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components"; // ✅ Ensure correct import

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await axios.post("http://localhost:8080/api/auth/register", {
        name, email, password, role
      });
      alert("Registration Successful! Please login.");
      navigate("/");
    } catch (error) {
      alert("Error Registering User");
    }
  };

  return (
    <AuthContainer>
      <SignupBox>
        <h2>Signup</h2>
        <Input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        
        <Select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </Select>

        <Button onClick={handleSignup}>Signup</Button>
        <p>Already have an account? <a href="/">Login</a></p>
      </SignupBox>
    </AuthContainer>
  );
};

export default Signup;

// Styled Components
const AuthContainer = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url("/images/city-bg.png") no-repeat center center/cover;
  background-size: cover;
`;

const SignupBox = styled.div`
  background: rgba(43, 6, 48, 0.29);
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  backdrop-filter: blur(10px);
  width: 350px;
  color: white;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  background: rgba(93, 80, 80, 0.14);
  color: white;
  outline: none;
  &::placeholder {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  background: rgba(93, 80, 80, 0.14);
  color: white;
  outline: none;
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