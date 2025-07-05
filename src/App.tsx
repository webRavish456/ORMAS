import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { Schedule } from './pages/Schedule';
import { Foods } from './pages/Foods';
import { Feedback } from './pages/Feedback';
import { Administrator } from './pages/Administrator';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Data } from './pages/Data';
import ExhibitionMapPage from './pages/ExhibitionMapPage';
import AllStallsPage from './pages/AllStallsPage';
import { ExhibitionProvider } from "./contexts/ExhibitionContext";


function App() {
  return (
    <ThemeProvider>
      <ExhibitionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/foods" element={<Foods />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/map" element={<ExhibitionMapPage />} />
          <Route path="/stalls" element={<AllStallsPage />} />
          <Route path="/administrator" element={<Administrator />} />
          <Route path="/data" element={<Data />} />
        </Routes>
      </BrowserRouter>
      </ExhibitionProvider>
    </ThemeProvider>
  );
}

export default App;
