import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const container = document.getElementById("root");

if (container) {
	createRoot(container).render(<App />);
}

// OFFLINE MODE DISABLED — service worker registration commented out
// if ("serviceWorker" in navigator) {
// 	window.addEventListener("load", () => {
// 		navigator.serviceWorker
// 			.register("/sw.js")
// 			.catch((error) => {
// 				console.error("Service worker registration failed:", error);
// 			});
// 	});
// }
