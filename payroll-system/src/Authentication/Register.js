// Register.js
import React, { useState } from 'react';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import config from '../config';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();


  const handleRegister = () => {
    axios.post(`${config.apiBaseUrlProd}/register`, {
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
    <div class="container-scroller">
    <div class="container-fluid page-body-wrapper full-page-wrapper">
        <div class="row w-100 m-0">
            <div class="content-wrapper full-page-wrapper d-flex align-items-center auth login-bg" style={{ marginTop: '150px' }}>
                <div class="card col-lg-4 mx-auto">
                    <div class="card-body px-5 py-5">
                        <h3 class="card-title text-left mb-3">Register</h3>
                        <form autoComplete="off" >
                            <div class="form-group">
                                <label>Company Name</label>
                                <input
                                    type="text"
                                    class="form-control p_input"
                                    placeholder="Company Name"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                />
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    class="form-control p_input"
                                    placeholder="Email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    autoComplete="new-email"
                                />
                            </div>
                            <div class="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    class="form-control p_input"
                                    placeholder="Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                />
                            </div>
                            <div class="text-center">
                                <button type="button" class="btn btn-primary btn-block enter-btn" onClick={handleRegister}>Register</button>
                            </div>
                            <p class="sign-up text-center">Already have an Account?<a href="/login"> Sign In</a></p>
                            <p class="terms">By creating an account you are accepting our<a href="#"> Terms & Conditions</a></p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

  
  );
};

export default Register;
