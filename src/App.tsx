import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TokenizePage from './pages/TokenizePage';
import MyTokensPage from './pages/MyTokensPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<TokenizePage />} />
            <Route path="/tokenize" element={<TokenizePage />} />
            <Route path="/my-tokens" element={<MyTokensPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;