import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, Building2, User, Radar, Bot } from 'lucide-react';

const DockNavigation: React.FC = () => {
  const NAV_ITEMS = [
    { path: '/home', icon: LayoutDashboard, label: '首页' },
    { path: '/admissions', icon: Building2, label: '志愿' },
    { path: '/qa', icon: Bot, label: 'AI顾问' },
    { path: '/quiz', icon: Radar, label: '测评' },
    { path: '/explore', icon: Compass, label: '探索' },
    { path: '/profile', icon: User, label: '我的' },
  ];

  return (
    // Fixed to bottom, 0 distance (bottom-0), centered horizontally
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
      
      {/* 
         Navigation Bar:
         - pointer-events-auto: Re-enable clicks
         - width: Auto (implicitly by flex items), not w-full
         - rounded-t-2xl: Rounded top corners only, since it sits on bottom
         - border-b-0: No border at bottom
         - pb-6: Extra padding for visual balance/safe area
      */}
      <nav 
        className="
          pointer-events-auto
          flex items-center justify-center gap-1 md:gap-2 px-6 py-3 pb-6 md:pb-5
          bg-white/90 backdrop-blur-xl border border-slate-200/80 border-b-0
          rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.05)]
        "
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                relative flex flex-col items-center justify-center
                w-14 md:w-16 h-12 rounded-xl transition-all duration-300
                ${isActive 
                  ? 'text-amber-600 bg-amber-50/50' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}
              `}
            >
              {({ isActive }) => (
                <>
                  {/* Icon */}
                  <Icon 
                    className={`w-6 h-6 mb-0.5 transition-transform duration-300 ${isActive ? 'scale-100' : 'scale-90'}`} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  
                  {/* Label */}
                  <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'font-bold' : ''}`}>
                    {item.label}
                  </span>
                  
                  {/* Active Indicator (Top Dot) */}
                  {isActive && (
                    <span className="absolute -top-1 w-1 h-1 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default DockNavigation;