// src/config.js
const config = {
    apiBaseUrl: process.env.REACT_APP_API_URL || 'http://localost:5000',
    apiBaseUrlProd: process.env.REACT_APP_API_URL_PROD || 'https://prbackend.nftconsult.com/api',
    // Add more configurations as needed
    
  };
  
 export default config;