import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Logs from "./scenes/contacts";
import Messages from "./scenes/messages";
import Messages2 from "./scenes/messages2";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Form2 from "./scenes/form2";
import Form3 from "./scenes/privatemsg";
import Form4 from "./scenes/broadcastmsg";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import {OrgProvider} from "./components/OrgContext";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
       <OrgProvider>
        <CssBaseline />
        <div className="app">
          <Sidebar isSidebar={isSidebar} />
          <main className="content">
            <Topbar setIsSidebar={setIsSidebar} />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/team" element={<Team />} />
              <Route path="/contacts" element={<Logs />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/form" element={<Form />} />
              <Route path="/pie" element={<Pie />} />
              <Route path="/bar" element={<Bar />} />
              <Route path="/update" element={<Form2 />} />
              <Route path="/line" element={<Line />} />
              <Route path="/private" element={<Form3 />} />
              <Route path="/broadcast" element={<Form4 />} />
              <Route path="/messages2" element={<Messages2 />} />
            </Routes>
          </main>
        </div>
       </OrgProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
