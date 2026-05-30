import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, FileText, Download } from 'lucide-react';
import clsx from 'clsx';

export default function VerificationResult({ status, fileName, file, onReset }) {
  const isSuccess = status === 'success';
  const [downloadUrl, setDownloadUrl] = useState(null);

  useEffect(() => {
    if (isSuccess && file) {
      const url = URL.createObjectURL(file);
      setDownloadUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [isSuccess, file]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      className="w-full max-w-xl mx-auto p-8 rounded-3xl glassmorphism-light dark:glassmorphism flex flex-col items-center text-center relative overflow-hidden"
    >
      {/* Background glow based on status */}
      <div 
        className={clsx(
          "absolute inset-0 opacity-10 pointer-events-none transition-colors duration-1000",
          isSuccess ? "bg-green-500" : "bg-red-500"
        )}
      />

      <div className="relative z-10 w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
          className="mb-6 relative flex justify-center"
        >
          {isSuccess ? (
            <div className="relative">
              <motion.div 
                className="absolute inset-0 rounded-full border-4 border-green-500"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 1, 0], scale: [0.8, 1.5, 2] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <CheckCircle size={80} className="text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
            </div>
          ) : (
            <motion.div
              animate={{ x: [-10, 10, -10, 10, 0] }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
              <XCircle size={80} className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
            </motion.div>
          )}
        </motion.div>

        <h2 className="text-3xl font-bold mb-2 dark:text-white text-gray-900">
          {isSuccess ? 'Verification Successful' : 'Verification Failed'}
        </h2>
        
        <p className="text-gray-500 dark:text-gray-400 mb-6 flex items-center justify-center gap-2">
          <FileText size={18} />
          {fileName}
        </p>

        {!isSuccess && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm mb-8">
            Warning: This document failed verification. It may have been tampered with or contains invalid signatures.
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          {isSuccess && downloadUrl && (
            <motion.a
              href={downloadUrl}
              download={`Verified_${fileName}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-white bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30 transition-all duration-300 w-full sm:w-auto"
            >
              <Download size={18} />
              Download PDF
            </motion.a>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReset}
            className={clsx(
              "px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg w-full sm:w-auto",
              isSuccess 
                ? "bg-gray-900 hover:bg-gray-800 dark:bg-white/10 dark:hover:bg-white/20" 
                : "bg-red-500 hover:bg-red-600 shadow-red-500/30"
            )}
          >
            Verify Another PDF
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
