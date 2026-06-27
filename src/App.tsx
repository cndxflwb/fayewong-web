import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import Layout from './components/Layout';

// 路由懒加载 - 各页面按需加载
const HomePage = lazy(() => import('./pages/HomePage'));
const YearPage = lazy(() => import('./pages/YearPage'));
const AlbumPage = lazy(() => import('./pages/AlbumPage'));
const SongPage = lazy(() => import('./pages/SongPage'));
const IndexPage = lazy(() => import('./pages/IndexPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const MagazinePage = lazy(() => import('./pages/MagazinePage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="year/:year" element={<YearPage />} />
            <Route path="album/:slug" element={<AlbumPage />} />
            <Route path="song/:slug" element={<SongPage />} />
            <Route path="index/:category" element={<IndexPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="magazine" element={<MagazinePage />} />
            <Route path="stats" element={<StatsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
