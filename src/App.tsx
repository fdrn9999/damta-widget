import { MainWidget } from "./windows/MainWidget";
import { Settings } from "./windows/Settings";
import { Stats } from "./windows/Stats";
import { About } from "./windows/About";

function App() {
  const params = new URLSearchParams(window.location.search);
  const windowType = params.get("window");

  switch (windowType) {
    case "settings":
      return <Settings />;
    case "stats":
      return <Stats />;
    case "about":
      return <About />;
    default:
      return <MainWidget />;
  }
}

export default App;
