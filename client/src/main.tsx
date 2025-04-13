import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./assets/styles.css";

// No client-side ping implementation here
// Pinging is now handled on the server-side

createRoot(document.getElementById("root")!).render(
  <App />
);
