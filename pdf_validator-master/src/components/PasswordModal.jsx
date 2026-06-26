import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';

export default function PasswordModal({ isOpen, onSubmit, onCancel, isVerifying, error }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Reset password when opened
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setShowPassword(false);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password) {
      onSubmit(password);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md p-8 rounded-3xl glassmorphism-light dark:glassmorphism shadow-2xl border border-white/20 dark:border-white/10"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6 shadow-[0_0_20px_rgba(255,106,0,0.3)]">
                <Lock size={32} />
              </div>
              
              <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-2">
                Protected Document
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
                This PDF is encrypted. Enter the password to unlock and verify it. The password will be automatically removed from the verified copy.
              </p>

              <form onSubmit={handleSubmit} className="w-full">
                <div className="relative mb-6">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    disabled={isVerifying}
                    autoFocus
                    className={clsx(
                      "w-full px-5 py-4 pr-12 rounded-xl bg-gray-50 dark:bg-white/5 border text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300",
                      error ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-white/10"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-[28px] -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-6 left-0 flex items-center gap-1 text-xs text-red-500 font-medium"
                    >
                      <AlertCircle size={12} />
                      {error}
                    </motion.div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={isVerifying}
                    className="flex-1 px-4 py-3 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!password || isVerifying}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-[0_0_15px_rgba(255,106,0,0.4)] hover:shadow-[0_0_25px_rgba(255,106,0,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Unlock size={18} />
                        Unlock
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
