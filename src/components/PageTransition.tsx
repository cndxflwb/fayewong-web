import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionState, setTransitionState] = useState<'enter' | 'idle'>('idle');
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPathRef.current) {
      prevPathRef.current = location.pathname;
      setTransitionState('enter');
      setDisplayChildren(children);
      // 让动画在下一帧触发
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitionState('idle');
        });
      });
    } else {
      setDisplayChildren(children);
    }
  }, [children, location.pathname]);

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        transitionState === 'enter'
          ? 'opacity-0 translate-y-3'
          : 'opacity-100 translate-y-0'
      }`}
    >
      {displayChildren}
    </div>
  );
}
