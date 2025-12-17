import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ExploreBackground from '../components/layout/ExploreBackground.tsx';
import ExploreCompass from '../components/explore/ExploreCompass.tsx';
import CareerGrid from '../components/explore/CareerGrid.tsx';
import CareerDrawer from '../components/explore/CareerDrawer.tsx';
import { useExplore } from '../hooks/useExplore';
import { Compass } from 'lucide-react';

const Explore: React.FC = () => {
  const { 
    step, 
    finishCompass, 
    resetExplore,
    searchQuery, setSearchQuery,
    selectedTag, setSelectedTag,
    categories,
    indexLoading,
    indexError,
    filteredCareers,
    selectedCareerId, setSelectedCareerId
  } = useExplore();

  return (
    <div className="relative w-full min-h-screen pb-20">
      <ExploreBackground />
      
      {/* --- Drawer Container --- */}
      <AnimatePresence>
          {selectedCareerId && (
              <CareerDrawer 
                  careerId={selectedCareerId} 
                  onClose={() => setSelectedCareerId(null)} 
              />
          )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center pt-10">
          
          {/* --- Header --- */}
          <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 mb-2 text-xs font-bold text-amber-600 tracking-[0.2em] uppercase">
                  <Compass className="w-3 h-3" />
                  生涯罗盘
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-black text-[#0A2463]">
                  生涯探索罗盘
              </h1>
          </div>

          {/* --- Main Stage Switcher --- */}
          <AnimatePresence mode="wait">
              {step === 'guide' ? (
                  <motion.div
                      key="compass"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="w-full px-4"
                  >
                      <ExploreCompass onComplete={finishCompass} />
                  </motion.div>
              ) : (
                  <motion.div
                      key="matrix"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full"
                  >
                      <CareerGrid 
                          careers={filteredCareers}
                          searchQuery={searchQuery}
                          setSearchQuery={setSearchQuery}
                          selectedTag={selectedTag}
                          setSelectedTag={setSelectedTag}
                          categories={categories}
                          loading={indexLoading}
                          error={indexError}
                          onSelect={setSelectedCareerId}
                          onReset={resetExplore}
                      />
                  </motion.div>
              )}
          </AnimatePresence>

      </div>
    </div>
  );
};

export default Explore;
