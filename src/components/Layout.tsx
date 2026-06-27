import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import ScrollToTopButton from './ScrollToTop';
import PageTransition from './PageTransition';

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg">
      <Navigation />
      <main className="pt-16">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <footer className="border-t border-primary/10 bg-bg-dark py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-text-muted text-sm">
            菲樂集——王菲演唱歌曲編年 · 赤霓編
          </p>
          <p className="text-text-muted/60 text-xs mt-2">
            本站內容來源於同名書籍，僅供學習交流使用
          </p>
        </div>
      </footer>
      <ScrollToTopButton />
    </div>
  );
}
