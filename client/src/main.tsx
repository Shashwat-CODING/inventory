import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./assets/styles.css";

// Setup server ping every 30 seconds to prevent server from spinning down
const setupServerPing = () => {
  const pingServer = () => {
    fetch('/api/held-bills')
      .then(response => {
        console.log('Server ping successful', response.status);
      })
      .catch(error => {
        console.error('Error pinging server:', error);
      });
  };

  // Initial ping
  pingServer();
  
  // Set up interval (every 30 seconds)
  setInterval(pingServer, 30000);
};

// Start the server ping
setupServerPing();

createRoot(document.getElementById("root")!).render(
  <App />
);
