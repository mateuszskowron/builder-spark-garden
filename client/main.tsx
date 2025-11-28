import { createRoot } from "react-dom/client";
import "./global.css";
import "./i18n";
import Root from "./App";

createRoot(document.getElementById("root")!).render(<Root />);
