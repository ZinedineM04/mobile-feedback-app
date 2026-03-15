"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, ClipboardPaste, Send, Loader2, Apple } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const router = useRouter();
  
  // State for flow
  const [step, setStep] = useState<"pin" | "form">("pin");
  
  // State for form
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Focus ref for PIN input
  const pinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "pin") {
      pinInputRef.current?.focus();
    }
  }, [step]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(false);

    if (pin === "9971") {
      router.push("/admin");
      return;
    }

    const validPins = Array.from({ length: 15 }, (_, i) => i.toString().padStart(4, "0"));
    
    if (validPins.includes(pin)) {
      setStep("form");
    } else {
      setPinError(true);
      // Small vibration if supported (Chrome on Android, Safari doesn't support generic JS vibration usually but good practice)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    let foundImage = false;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const pasteFile = items[i].getAsFile();
        if (pasteFile) {
          setFile(pasteFile);
          setPreview(URL.createObjectURL(pasteFile));
          foundImage = true;
          toast.success("Image pasted from clipboard");
          break;
        }
      }
    }
  };

  const clearImage = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file && !text.trim()) {
      toast.error("Please add a note or screenshot");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("pin", pin);
    if (text) formData.append("text", text);
    if (file) formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      toast.success("Feedback sent successfully", {
        position: "top-center"
      });
      setText("");
      clearImage();
      // Route back to PIN for security, or keep them here.
      // Apple-like behavior might be returning to a success state or gate. 
      // We will keep them here for quick multiple entries as requested natively, 
      // but you can clear it if needed.
    } catch (error: any) {
      toast.error(error.message || "An error occurred", {
        position: "top-center"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main 
      className="min-h-screen bg-[#000000] text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden"
      style={{
        // System UI font stack that perfectly replicates iOS
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}
    >
      <div className="w-full max-w-sm relative">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: PIN GATEKEEPER */}
          {step === "pin" && (
            <motion.div
              key="pin-step"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // Apple-style spring/ease
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 bg-zinc-900 rounded-[22px] flex items-center justify-center shadow-inner border border-zinc-800">
                  <Apple className="text-zinc-100 w-8 h-8" />
                </div>
                <h1 className="text-[28px] font-semibold tracking-tight text-white leading-tight">
                  WorkoutAI
                </h1>
                <p className="text-[15px] text-zinc-400">
                  Enter your access code
                </p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-6">
                <motion.div
                  animate={pinError ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className="space-y-2 relative"
                >
                  <Input
                    ref={pinInputRef}
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      if (pinError) setPinError(false);
                    }}
                    className={`text-center text-3xl tracking-[0.5em] h-16 rounded-2xl bg-[#1C1C1E]/60 border shadow-sm backdrop-blur-xl focus-visible:ring-1 focus-visible:ring-offset-0 transition-all font-mono
                      ${pinError 
                        ? 'border-red-500/50 focus-visible:ring-red-500 text-red-500' 
                        : 'border-white/10 focus-visible:ring-[#007AFF] focus-visible:border-[#007AFF]'
                      }`}
                  />
                  <AnimatePresence>
                    {pinError && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-red-500 text-xs text-center absolute -bottom-6 w-full font-medium"
                      >
                        Incorrect code
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <Button 
                  type="submit" 
                  disabled={pin.length !== 4}
                  className="w-full h-14 rounded-2xl bg-[#007AFF] hover:bg-[#007AFF]/90 text-white font-semibold text-[17px] shadow-sm transition-all disabled:opacity-50 disabled:bg-[#1C1C1E] disabled:text-zinc-500"
                >
                  Continue
                </Button>
              </form>
            </motion.div>
          )}

          {/* STEP 2: FEEDBACK FORM */}
          {step === "form" && (
            <motion.div
              key="form-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6 w-full"
              onPaste={handlePaste}
            >
              <div className="flex items-center justify-between mb-2">
                <button 
                  onClick={() => {
                    setStep("pin");
                    setPin("");
                  }}
                  className="flex items-center text-[#007AFF] text-[17px]"
                >
                  <svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                    <path d="M11.6602 1.84961L10.0293 0.208984L0.263672 9.97461L10.0293 19.7402L11.6602 18.0996L3.52539 9.97461L11.6602 1.84961Z" fill="currentColor"/>
                  </svg>
                  <span>Back</span>
                </button>
                <div className="text-[17px] font-semibold">Feedback</div>
                <div className="w-[50px]"></div> {/* Spacer for centering */}
              </div>

              <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                {/* Advanced Apple-style glass card */}
                <div className="bg-[#1C1C1E]/80 backdrop-blur-2xl border border-white/10 rounded-[28px] p-5 shadow-2xl relative overflow-hidden">
                  
                  {/* Subtle top glare/highlight */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  <div className="space-y-5">
                    
                    {/* Upload / Image Section */}
                    <div>
                      {!preview ? (
                        <div className="grid gap-3">
                          <Button
                            type="button"
                            variant="secondary"
                            className="h-16 flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/15 text-white border-0 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="h-5 w-5 opacity-70" />
                            <span className="text-[16px] font-medium">Upload Screenshot</span>
                          </Button>
                          <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm mt-1">
                            <ClipboardPaste className="h-4 w-4" />
                            <span>Or paste from clipboard</span>
                          </div>
                        </div>
                      ) : (
                        <div className="relative rounded-[20px] overflow-hidden border border-white/10 bg-black/50 group shadow-inner">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={preview} alt="Upload Preview" className="w-full object-contain max-h-[300px]" />
                          <button
                            type="button"
                            onClick={clearImage}
                            className="absolute top-3 right-3 bg-zinc-800/80 backdrop-blur-md w-8 h-8 flex items-center justify-center rounded-full text-white hover:bg-zinc-700 transition-colors"
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 1.20857L10.7914 0L6 4.79143L1.20857 0L0 1.20857L4.79143 6L0 10.7914L1.20857 12L6 7.20857L10.7914 12L12 10.7914L7.20857 6L12 1.20857Z" fill="currentColor"/>
                            </svg>
                          </button>
                        </div>
                      )}
                      
                      {/* FIX: Removed capture attribute, standard file picking for Photo Library access */}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                    </div>

                    <div className="h-px w-full bg-white/10" />

                    {/* Text Section */}
                    <div>
                      <textarea
                        id="text"
                        placeholder="What's going on?"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full min-h-[120px] rounded-2xl bg-transparent border-0 text-[17px] focus:outline-none resize-none text-zinc-100 placeholder:text-zinc-500 p-0"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting || (!file && !text.trim())}
                  className="w-full h-[52px] rounded-2xl bg-[#007AFF] hover:bg-[#007AFF]/90 text-white font-semibold text-[17px] shadow-sm transition-all disabled:opacity-50 disabled:bg-[#1C1C1E] disabled:text-zinc-500"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-5 w-5" />
                  )}
                  {isSubmitting ? "Sending..." : "Send Feedback"}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
