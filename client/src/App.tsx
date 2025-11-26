import "./App.css";
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';

// import axios from "axios";

import "primereact/resources/themes/lara-light-cyan/theme.css";
import NavbarComponent from "./components/Navigation/Navbar";
import PDFTool from "./containers/PDFTool";
import SourceControlContextProvider from "./store/SourceControlContext";
import SideBarComp from "./components/Navigation/Sidebar";
import Servers from "./containers/Servers";
import SelectedServer from "./components/SelectedServer";
import AppContextProvider from "./store/AppContext";
import Entities from "./components/Entities";
import { PrimeReactProvider } from "primereact/api";

function App() {
    const value = {
        appendTo: 'self'
    };

  return (
    <PrimeReactProvider value={value}>
        <AppContextProvider>
            <div className="h-dvh flex flex-col bg-gray-50 overflow-auto">
                <BrowserRouter>
                    <NavbarComponent />
                    <div className="overflow-hidden flex h-full">
                        <SourceControlContextProvider>
                                <SideBarComp />
                                <div className="flex flex-col overflow-auto grow px-0 md:px-md lg:px-xl items-center">
                                    <div className="p-4 grow w-full">
                                        <Routes>
                                            <Route path='/Home' element={<Servers />} />
                                            <Route path='/Servers/:displayName' element={<SelectedServer />} />
                                            <Route path='/Servers/:displayName/Entities' element={<Entities />} />
                                            <Route path='/PDF' element={<PDFTool />} />
                                            {/* Catch-all route for 404 */}
                                        </Routes>
                                    </div>
                                </div>
                        </SourceControlContextProvider>
                    </div>
                </BrowserRouter>
            </div>
        </AppContextProvider>
    </PrimeReactProvider>
  );
}

export default App;
