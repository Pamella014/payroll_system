// Login.js
import React, { useState } from 'react';
import axios from 'axios'
import { useNavigate,Link } from 'react-router-dom';

const Login = ({ setLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    axios.post('http://localhost:5000/login', {
      email,
      password,
    }, {
      withCredentials: true,  // Include credentials (cookies)
    })
    .then(response => {
      const data = response.data;
      setLoggedIn(true);
      navigate('/'); // Redirect to employee form after successful login
    })
    .catch(error => {
      console.error(error.response.data);
      alert('Login failed');
    });
  };

    return (
        <div>
        
         <div className="register_header">
           <h1>Login</h1>
         </div>
         <form>
         <div className="input-container">
             <label>Email:</label>
           <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
           </div>
           <div className="input-container">
             <label>Password:</label>
             <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
           </div>
         </form>
           <div className='add-button'>
             <button onClick={handleLogin}>Login</button>
           </div>
           <p>Don't have an account? <Link to="/register">Register</Link></p>

    
         </div>
      
      );
};

export default Login;
