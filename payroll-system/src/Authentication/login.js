// Login.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import config from "../config";

const Login = ({ setLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get(
          `${config.apiBaseUrl}/login-status`,
          { withCredentials: true }
        );
        if (response.data.loggedIn) {
          setLoggedIn(true);
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };
    checkLoginStatus();
  }, [setLoggedIn, navigate]);

  const handleLogin = () => {
    axios
      .post(
        `${config.apiBaseUrl}/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true, // Include credentials (cookies)
        }
      )
      .then((response) => {
        const data = response.data;
        setLoggedIn(true);
        navigate("/"); // Redirect to employee form after successful login
      })
      .catch((error) => {
        console.error(error.response.data);
        alert("Login failed");
      });
  };

  return (
    <div class="container-scroller">
      <div class="container-fluid page-body-wrapper full-page-wrapper">
        <div class="row w-100 m-0">
          <div
            class="content-wrapper full-page-wrapper d-flex align-items-center auth login-bg"
            style={{ marginTop: "150px" }}
          >
            <div class="card col-lg-4 mx-auto">
              <div class="card-body px-5 py-5">
                <h3 class="card-title text-left mb-3">Login</h3>
                <form>
                  <div class="form-group">
                    <label>Email:</label>
                    <input
                      type="text"
                      class="form-control p_input"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div class="form-group">
                    <label>Password:</label>
                    <input
                      type="password"
                      class="form-control p_input"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div class="text-center">
                    <button
                      type="button"
                      class="btn btn-primary btn-block enter-btn"
                      onClick={handleLogin}
                    >
                      Login
                    </button>
                  </div>
                  <p class="sign-up text-center">
                    Don't have an account? <a href="/register">Register</a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
