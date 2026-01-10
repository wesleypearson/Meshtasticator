import MapCanvas from "./components/MapCanvas";
import OverlayUI from "./components/OverlayUI";
import { useSimulator } from "./hooks/useSimulator";
import "./index.css";

function App() {
    useSimulator(); // Connect to Python Bridge
	return (
		<div style={{ width: "100vw", height: "100vh", position: "relative" }}>
			<MapCanvas />
			<OverlayUI />
		</div>
	);
}

export default App;
