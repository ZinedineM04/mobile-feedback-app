"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Camera, ClipboardPaste, Send, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Admin Redirect Check
    if (pin === "9971") {
      router.push("/admin");
    }
  }, [pin, router]);

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
          toast.success("Image pasted from clipboard!");
          break;
        }
      }
    }
    if (!foundImage && items.length > 0) {
       // Allow text pasting naturally if not an image
    }
  };

  const clearImage = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pin) {
      toast.error("PIN is required");
      return;
    }

    if (!file && !text.trim()) {
      toast.error("Please provide a screenshot or text feedback");
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

      toast.success("Feedback submitted successfully.");
      setText("");
      clearImage();
      // Keep PIN so they don't have to re-enter for quick multiple feedbacks
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-6 flex flex-col items-center justify-center font-sans tracking-tight">
      <div className="w-full max-w-md space-y-6" onPaste={handlePaste}>
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl text-emerald-400">
            Feedback
          </h1>
          <p className="text-zinc-400 text-sm">
            Share bug reports or feedback instantly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-zinc-800 bg-zinc-950/50 backdrop-blur shadow-2xl">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pin" className="text-zinc-300 font-medium">Access PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  placeholder="• • • •"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="text-center text-2xl tracking-[0.5em] h-14 bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500/50 transition-all font-mono"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-zinc-300 font-medium">Screenshot (Optional)</Label>
                
                {!preview ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2 border-zinc-800 bg-zinc-900 hover:bg-zinc-800/80 hover:text-emerald-400 text-zinc-400 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-6 w-6" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Camera/Lib</span>
                    </Button>
                    <div className="relative h-24 flex flex-col items-center justify-center gap-2 border border-zinc-800 border-dashed rounded-md bg-zinc-900/50 text-zinc-500">
                       <ClipboardPaste className="h-6 w-6" />
                       <span className="text-xs font-semibold uppercase tracking-wider text-center px-1">Paste Here</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-black group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Preview" className="w-full object-contain max-h-64" />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 bg-black/70 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-white hover:bg-red-500/80 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="text" className="text-zinc-300 font-medium">Additional Notes</Label>
                <textarea
                  id="text"
                  placeholder="Describe the issue..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full min-h-[100px] p-3 rounded-md bg-zinc-900 border border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-y text-zinc-100 placeholder:text-zinc-600"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Send className="mr-2 h-5 w-5" />
                )}
                {isSubmitting ? "Sending..." : "Submit Feedback"}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </main>
  );
}
