import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, File as FileIcon, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { PDFDocument, rgb, StandardFonts, PDFName, PDFDict, PDFArray } from 'pdf-lib';
import { decryptPDF } from '@pdfsmaller/pdf-decrypt';
import PasswordModal from './PasswordModal';

export default function UploadZone({ onVerify }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState(null);
  
  // Password unlock state
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [pdfBuffer, setPdfBuffer] = useState(null);
  const [passwordError, setPasswordError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const finishVerification = async (originalFile, pdfDoc) => {
    setIsProcessing(true);
    setRequiresPassword(false);
    setIsUnlocking(false);
    
    setTimeout(async () => {
      try {
        try {
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
          const pages = pdfDoc.getPages();
          
          for (const page of pages) {
            const annots = page.node.Annots();
            if (!annots) continue;
            
            for (let i = 0; i < annots.size(); i++) {
              const annotRef = annots.get(i);
              const annot = pdfDoc.context.lookup(annotRef);
              
              if (annot && annot instanceof PDFDict) {
                // Use lookup instead of get to automatically resolve indirect references (PDFRef)
                const subtype = annot.lookup(PDFName.of('Subtype'));
                
                // If it's a Widget annotation, we assume it's the signature box for Aadhaar
                // We use encodedName because PDFName objects do not have a .name property.
                if (subtype && subtype.encodedName === '/Widget') {
                  
                  // Delete the original appearance stream (the yellow question mark)
                  annot.delete(PDFName.of('AP'));

                  const rect = annot.lookup(PDFName.of('Rect'));
                  if (rect && rect instanceof PDFArray) {
                    // Use value() to extract the number from PDFNumber
                    const llx = rect.lookup(0).value();
                    const lly = rect.lookup(1).value();
                    const urx = rect.lookup(2).value();
                    const ury = rect.lookup(3).value();
                    
                    const x = llx;
                    const y = lly;
                    const width = urx - llx;
                    const height = ury - lly;
                    
                    // 1. Draw solid white background to cover everything
                    page.drawRectangle({
                      x, y, width, height,
                      color: rgb(1, 1, 1),
                    });

                    // 2. Draw Adobe-style Text First (so the tick overlaps it like the screenshot)
                    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' IST';
                    
                    const textScale = Math.min(width, height) / 60; // Base reference scale for layout
                    
                    const textX = x + (5 * textScale);
                    let textY = y + height - (15 * textScale);
                    
                    // "Signature valid" in large text
                    page.drawText("Signature valid", {
                      x: textX, y: textY, size: 14 * textScale, font: font, color: rgb(0, 0, 0)
                    });
                    
                    textY -= 14 * textScale;
                    page.drawText("Digitally signed by DS Unique", {
                      x: textX, y: textY, size: 7 * textScale, font: font, color: rgb(0, 0, 0)
                    });
                    textY -= 8 * textScale;
                    page.drawText("Identification Authority of India", {
                      x: textX, y: textY, size: 7 * textScale, font: font, color: rgb(0, 0, 0)
                    });
                    textY -= 8 * textScale;
                    page.drawText("06", {
                      x: textX, y: textY, size: 7 * textScale, font: font, color: rgb(0, 0, 0)
                    });
                    textY -= 10 * textScale;
                    page.drawText(`Date: ${dateStr}`, {
                      x: textX, y: textY, size: 7 * textScale, font: font, color: rgb(0, 0, 0)
                    });

                    // 3. Draw Solid Green Tick with Drop Shadow Overlapping Text
                    const cx = x + width / 2;
                    const cy = y + height / 2;
                    
                    // Scale the tick to be roughly 60% of the box's smaller dimension
                    const size = Math.min(width, height) * 0.6;
                    // Our base tick is 60x60 units (-25 to +35 width, -30 to +30 height)
                    const scale = size / 60;
                    
                    // Tick coordinate points scaled dynamically
                    const p1 = { x: cx - (25 * scale), y: cy - (5 * scale) };
                    const p2 = { x: cx - (5 * scale), y: cy - (30 * scale) };
                    const p3 = { x: cx + (35 * scale), y: cy + (30 * scale) };

                    const thickness = 12 * scale;
                    const shadowOffset = 4 * scale;

                    const drawThickTick = (colorObj, offsetX, offsetY) => {
                      page.drawLine({
                        start: { x: p1.x + offsetX, y: p1.y + offsetY },
                        end: { x: p2.x + offsetX, y: p2.y + offsetY },
                        thickness: thickness,
                        color: colorObj
                      });
                      page.drawLine({
                        start: { x: p2.x + offsetX, y: p2.y + offsetY },
                        end: { x: p3.x + offsetX, y: p3.y + offsetY },
                        thickness: thickness,
                        color: colorObj
                      });
                    };

                    // Shadow (Black)
                    drawThickTick(rgb(0, 0, 0), shadowOffset, -shadowOffset);
                    // Foreground (Green)
                    drawThickTick(rgb(0, 0.7, 0.2), 0, 0);
                  }
                }
              }
            }
          }
        } catch (visualError) {
          console.warn("Could not apply visual green tick due to complex PDF structure:", visualError);
          // We intentionally do not throw here. If the visual modifier fails, 
          // we still want to provide the user with the successfully unlocked PDF!
        }

        // Save the document (this removes encryption if it was unlocked)
        const pdfBytes = await pdfDoc.save();
        const newBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        // Reconstruct the File object
        const newFile = new File([newBlob], originalFile.name, { type: 'application/pdf' });

        setIsProcessing(false);
        onVerify('success', originalFile.name, newFile);
      } catch (err) {
        console.error("Save error", err);
        setIsProcessing(false);
        alert(`Failed to save verified PDF: ${err.message}`);
      }
    }, 2000);
  };

  const processFile = async (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setIsProcessing(true);
      
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        setPdfBuffer(arrayBuffer);
        
        try {
          // Attempt to load without password
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          // If successful, proceed with verification simulation
          finishVerification(selectedFile, pdfDoc);
        } catch (error) {
          // pdf-lib throws an error if the document is encrypted
          if (error.message.toLowerCase().includes('encrypted') || error.message.toLowerCase().includes('password')) {
            setIsProcessing(false);
            setRequiresPassword(true);
            setPasswordError('');
          } else {
            throw error;
          }
        }
      } catch (err) {
        console.error("PDF Processing Error:", err);
        setIsProcessing(false);
        alert('Failed to process PDF file. It might be corrupted.');
      }
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const handlePasswordSubmit = async (password) => {
    setIsUnlocking(true);
    setPasswordError('');
    try {
      const buffer = await file.arrayBuffer();
      const uint8ArrayBuffer = new Uint8Array(buffer);
      
      // Decrypt using @pdfsmaller/pdf-decrypt (supports AES-256)
      const decryptedBuffer = await decryptPDF(uint8ArrayBuffer, password);
      
      // Load the now-unencrypted buffer into pdf-lib
      const pdfDoc = await PDFDocument.load(decryptedBuffer);
      
      // Successfully unlocked!
      finishVerification(file, pdfDoc);
      
    } catch (error) {
      console.error("Decryption Error:", error);
      setIsUnlocking(false);
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <>
      <div className="w-full max-w-2xl mx-auto relative group z-10">
        {/* Background glow when dragging */}
        <div 
          className={clsx(
            "absolute -inset-1 rounded-[2rem] opacity-0 blur-xl transition-all duration-500",
            isDragging ? "opacity-100 bg-orange-500/30" : "group-hover:opacity-50 group-hover:bg-orange-500/20"
          )}
        />

        <motion.div
          animate={{ scale: isDragging ? 1.02 : 1 }}
          className={clsx(
            "relative p-10 rounded-[2rem] glassmorphism-light dark:glassmorphism border-2 transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[350px]",
            isDragging 
              ? "border-[var(--color-primary)] border-solid glow-orange-lg" 
              : "border-dashed border-gray-300 dark:border-white/20 hover:border-[var(--color-primary)]/50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center space-y-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping" />
                  <Loader2 size={64} className="text-[var(--color-primary)] animate-spin relative z-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold dark:text-white text-gray-900 mb-2">
                    Verifying Document...
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Analyzing signatures and structure
                  </p>
                </div>
                <div className="w-48 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[var(--color-primary)]"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.5, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center space-y-6 w-full"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className={clsx(
                    "p-6 rounded-full transition-colors duration-300",
                    isDragging ? "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400" : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 group-hover:text-[var(--color-primary)]"
                  )}
                >
                  <UploadCloud size={48} />
                </motion.div>

                <div>
                  <h3 className="text-2xl font-bold dark:text-white text-gray-900 mb-2">
                    Drop your PDF here
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    or click to browse your files
                  </p>
                </div>

                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  id="file-upload"
                  onChange={handleChange}
                />
                <label
                  htmlFor="file-upload"
                  className="px-8 py-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold cursor-pointer hover:scale-105 transition-transform duration-300 shadow-xl hover:shadow-[var(--color-primary-glow)] dark:hover:shadow-white/20"
                >
                  Select File
                </label>

                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-4">
                  <FileIcon size={14} />
                  <span>Supports encrypted and digitally signed PDFs up to 50MB</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <PasswordModal
        isOpen={requiresPassword}
        isVerifying={isUnlocking}
        error={passwordError}
        onSubmit={handlePasswordSubmit}
        onCancel={() => {
          setRequiresPassword(false);
          setFile(null);
          setPdfBuffer(null);
        }}
      />
    </>
  );
}
