import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import YearPage from './pages/YearPage';
import AlbumPage from './pages/AlbumPage';
import SongPage from './pages/SongPage';
import IndexPage from './pages/IndexPage';
import SearchPage from './pages/SearchPage';
import AboutPage from './pages/AboutPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="year/:year" element={<YearPage />} />
          <Route path="album/:slug" element={<AlbumPage />} />
          <Route path="song/:slug" element={<SongPage />} />
          <Route path="index/:category" element={<IndexPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
