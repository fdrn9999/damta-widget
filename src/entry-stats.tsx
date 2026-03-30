import React from "react";
import ReactDOM from "react-dom/client";
import { Stats } from "./windows/Stats";
import "./styles/cigarette.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Stats />
  </React.StrictMode>
);
