import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Menu, X, Info, FileText } from 'lucide-react';
import ThemeToggle from './components/ThemeToggle';
import UploadZone from './components/UploadZone';
import VerificationResult from './components/VerificationResult';
import StatsCards from './components/StatsCards';

function App() {
  const [verificationState, setVerificationState] = useState({
    status: 'idle', // idle, success, error
    fileName: null,
    file: null
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  const handleVerify = (status, fileName, file) => {
    setVerificationState({ status, fileName, file });
  };

  const handleReset = () => {
    setVerificationState({ status: 'idle', fileName: null, file: null });
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      {/* Background Mesh */}
      <div className="bg-mesh">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Interactive Cursor Glow */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        animate={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,106,0,0.08), transparent 40%)`
        }}
      />

      {/* Floating Glass Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="max-w-7xl mx-auto glassmorphism-light dark:glassmorphism rounded-full px-6 py-3 flex items-center justify-between border border-black/5 dark:border-white/10 shadow-lg relative">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-900 dark:text-white relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-orange-500/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></span>
              <div className="relative z-10">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </div>
            </button>
            <div className="p-2 bg-orange-500 rounded-full text-white shadow-lg shadow-orange-500/50 ml-2 relative overflow-hidden group">
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
              <Shield size={20} className="relative z-10" />
            </div>
            <span className="font-bold text-lg tracking-wide text-gray-900 dark:text-white">
              PDF <span className="text-orange-500 relative group cursor-default">
                VERIFY
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>

          {/* Hamburger Dropdown Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-[120%] left-6 w-56 rounded-2xl glassmorphism-light dark:glassmorphism border border-black/5 dark:border-white/10 shadow-xl overflow-hidden flex flex-col py-2"
              >
                <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors relative group">
                  <span className="absolute inset-0 bg-orange-500/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></span>
                  <Info size={18} className="text-orange-500 relative z-10 group-hover:scale-110 transition-transform" />
                  <span className="relative z-10">About Us</span>
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors relative group">
                  <span className="absolute inset-0 bg-orange-500/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></span>
                  <FileText size={18} className="text-orange-500 relative z-10 group-hover:scale-110 transition-transform" />
                  <span className="relative z-10">License</span>
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-32 pb-16 px-4 flex flex-col items-center justify-center min-h-screen relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Bank-grade Verification Engine 2.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
            Verify PDF <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
              Authenticity Instantly
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Protect your business from forged documents. Our futuristic engine analyzes cryptographic signatures and file structures in milliseconds.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {verificationState.status === 'idle' ? (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <UploadZone onVerify={handleVerify} />
              <StatsCards />
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <VerificationResult 
                status={verificationState.status} 
                fileName={verificationState.fileName} 
                file={verificationState.file}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}

export default App;
