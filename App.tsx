import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Intro from './src/pages/Intro.tsx';
import Home from './src/pages/Home.tsx';
import Quiz from './src/pages/Quiz.tsx';
import QuizResult from './src/pages/QuizResult.tsx';
import Admissions from './src/pages/Admissions.tsx';
import Explore from './src/pages/Explore.tsx';
import QA from './src/pages/QA.tsx';
import Profile from './src/pages/Profile.tsx';
import MainLayout from './src/components/layout/MainLayout.tsx';
import { PlanProvider } from './src/context/PlanContext.tsx';
import { UserProvider } from './src/context/UserContext.tsx';

const App: React.FC = () => {
  return (
    <UserProvider>
      <PlanProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Intro />} />
            
            {/* Immersive MBTI Modules (Standalone) */}
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/result" element={<QuizResult />} />
            
            {/* Main App Layout */}
            <Route element={<MainLayout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/admissions" element={<Admissions />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/qa" element={<QA />} />
                <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </PlanProvider>
    </UserProvider>
  );
};

export default App;