// Register.js
import React, { useState } from 'react';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();


  const handleRegister = () => {
    axios.post('http://localhost:5000/register', {
      username,
      email,
      password,
    })
    .then(response => {
      const data = response.data;
      console.log(data);
      alert(data.message);
      navigate('/login');
    })
    .catch(error => {
      console.error(error);
      alert('Registration failed');
    });
  };

  return (
    <div>
    {/* <div className="sidebar">
       <ul>
         <li className="active">Add Employee</li>
         <li>
           <a href="/employees">View Employees</a>
         </li>
       </ul>
     </div> */}
     <div className="register_header">
       <h1>Register</h1>
     </div>
     <div className="content">
       <div className="input-container">
         <label>Company Name:</label>
         <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
       </div>
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
       
       <div className='add-button'>
         <button onClick={handleRegister}>Register</button>
       </div>

     </div>
    </div>
  
  );
};

export default Register;
