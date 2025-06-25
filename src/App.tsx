import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Survey from './pages/Survey';
import Loading from './pages/Loading';
import Results from './pages/Results';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </Router>
  );
}

export default App;