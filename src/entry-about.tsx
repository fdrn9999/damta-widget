import React from "react";
import ReactDOM from "react-dom/client";
import { About } from "./windows/About";
import "./styles/cigarette.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <About />
  </React.StrictMode>
);
