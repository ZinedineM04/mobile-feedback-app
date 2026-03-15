"use client";

import { useState, useEffect, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { Apple, Trash2, Search, FilterX, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function AdminDashboard() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering state
  const [searchPin, setSearchPin] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/feedback");
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.feedbacks || []);
      }
    } catch (error) {
      toast.error("Failed to load feedbacks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setFeedbacks(prev => prev.filter(f => f.id !== id));
        toast.success("Feedback deleted");
      } else {
        throw new Error("Failed");
      }
    } catch (error) {
      toast.error("Could not delete feedback");
    }
  };

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((item) => {
      const matchPin = searchPin === "" || item.pin.includes(searchPin);
      const matchCategory = filterCategory === "All" || item.category === filterCategory;
      return matchPin && matchCategory;
    });
  }, [feedbacks, searchPin, filterCategory]);

  return (
    <main 
      className="min-h-screen bg-[#000000] text-zinc-100 p-4 sm:p-6 lg:p-10"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-zinc-900 rounded-[10px] flex items-center justify-center shadow-inner border border-zinc-800">
                  <Apple className="text-zinc-100 w-4 h-4" />
                </div>
                <h2 className="text-[15px] font-semibold text-zinc-400 uppercase tracking-wider">
                  WorkoutAI
                </h2>
             </div>
            <h1 className="text-[34px] font-bold tracking-tight text-white leading-tight">
              Feedback Logs
            </h1>
          </div>
          
          <Link 
            href="/"
            onClick={() => {
              // Using window.location to force full reload and clear any state when exiting admin
              window.location.href="/";
            }}
            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] text-white text-[15px] font-medium transition-colors border border-white/5"
          >
            Exit Admin
          </Link>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row gap-4 bg-[#1C1C1E]/40 backdrop-blur-xl border border-white/5 rounded-[24px] p-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Search by PIN (e.g. 0001)" 
              value={searchPin}
              onChange={(e) => setSearchPin(e.target.value)}
              className="pl-9 h-12 bg-white/5 border-white/10 rounded-xl focus-visible:ring-1 focus-visible:ring-[#007AFF] text-[15px]" 
            />
          </div>
          <div className="flex-1 w-full sm:w-[200px]">
             <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full h-12 bg-white/5 border-white/10 rounded-xl focus:ring-1 focus:ring-[#007AFF] text-[15px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1E] border-white/10 text-white rounded-xl shadow-xl">
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Bug">Bug Report</SelectItem>
                  <SelectItem value="Feature Request">Feature Request</SelectItem>
                  <SelectItem value="UI/UX Suggestion">UI/UX Suggestion</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
          </div>
          {(searchPin || filterCategory !== "All") && (
            <button
              onClick={() => {
                setSearchPin("");
                setFilterCategory("All");
              }}
              className="h-12 px-4 flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors border border-white/5"
            >
              <FilterX className="h-4 w-4" />
              <span className="text-[14px] font-medium hidden sm:inline">Clear</span>
            </button>
          )}
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
             <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="text-center p-16 border border-white/5 bg-[#1C1C1E]/30 rounded-[32px] text-zinc-500 backdrop-blur-xl">
            <p className="text-[17px]">No feedback matches your filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredFeedbacks.map((item) => (
              <div 
                key={item.id} 
                className="bg-[#1C1C1E]/60 backdrop-blur-2xl border border-white/10 rounded-[28px] overflow-hidden shadow-2xl flex flex-col transition-transform hover:scale-[1.01] duration-300 relative group"
              >
                {/* Delete Button Header overlay */}
                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="w-8 h-8 rounded-full bg-red-500/80 hover:bg-red-500 backdrop-blur-md flex flex-col items-center justify-center text-white shadow-lg transition-transform hover:scale-105"
                    title="Delete Feedback"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {item.imageUrl && (
                  <div className="relative w-full aspect-[4/3] bg-[#0A0A0A] border-b border-white/10 flex items-center justify-center p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt="User screenshot"
                      className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                    />
                  </div>
                )}
                
                <div className="p-6 flex-grow flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-[#007AFF] bg-[#007AFF]/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {item.category}
                      </span>
                      <span className="text-[13px] text-zinc-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <span className="text-[13px] text-zinc-400 font-mono bg-black/50 px-2.5 py-1 rounded-md border border-white/5">
                      PIN: {item.pin}
                    </span>
                  </div>
                  
                  <div className="h-px w-full bg-white/5 my-1" />
                  
                  {item.text ? (
                    <p className="text-[16px] text-zinc-200 leading-relaxed font-regular whitespace-pre-wrap">
                      {item.text}
                    </p>
                  ) : (
                    <p className="text-[16px] text-zinc-600 italic">No notes attached.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
