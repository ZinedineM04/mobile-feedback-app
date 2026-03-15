"use client";

import { useState, useEffect, useMemo } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { Apple, Trash2, Search, FilterX, Loader2, Image as ImageIcon, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
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

  // Modal State
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);

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
    
    // Custom styled toast confirmation
    toast("Delete Feedback", {
      description: "Are you sure you want to delete this record? This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            const res = await fetch(`/api/feedback/${id}`, {
              method: "DELETE",
            });
            
            if (res.ok) {
              setFeedbacks(prev => prev.filter(f => f.id !== id));
              toast.success("Feedback deleted successfully");
            } else {
              throw new Error("Failed");
            }
          } catch (error) {
            toast.error("Could not delete feedback");
          }
        }
      },
      cancel: {
        label: "Cancel",
        onClick: () => {}
      }
    });
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
      <div className="max-w-6xl mx-auto space-y-8">
        
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
            onClick={() => window.location.href="/"}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] text-white text-[15px] font-medium transition-colors border border-white/5"
          >
            Exit Admin
          </Link>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row gap-4 bg-[#1C1C1E]/40 backdrop-blur-xl border border-white/5 rounded-[24px] p-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Search by PIN (e.g. 0001)" 
              value={searchPin}
              onChange={(e) => setSearchPin(e.target.value)}
              className="pl-11 h-12 bg-white/5 border-white/10 rounded-xl focus-visible:ring-1 focus-visible:ring-[#007AFF] text-[15px]" 
            />
          </div>
          <div className="flex-1 w-full sm:w-[250px]">
             <Select value={filterCategory} onValueChange={(val) => setFilterCategory(val || "All")}>
                <SelectTrigger className="w-full h-12 bg-white/5 border-white/10 rounded-xl focus:ring-1 focus:ring-[#007AFF] text-[15px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-[#2C2C2E] border-white/10 text-white rounded-xl shadow-2xl">
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
              className="h-12 px-5 flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors border border-white/5"
            >
              <FilterX className="h-4 w-4" />
              <span className="text-[14px] font-medium hidden sm:inline">Clear</span>
            </button>
          )}
        </div>

        {/* Compact List / Table Content Section */}
        <div className="bg-[#1C1C1E]/60 backdrop-blur-2xl border border-white/10 rounded-[24px] overflow-hidden shadow-2xl">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
               <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="text-center py-20 text-zinc-500">
              <p className="text-[15px]">No feedback matches your filters.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-white/5 border-b border-white/5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider hidden md:grid items-center">
                <div className="col-span-1">PIN</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-5">Notes</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {/* Data Rows */}
              <div className="divide-y divide-white/[0.03]">
                {filteredFeedbacks.map((item) => {
                  const CategoryColor = (cat: string) => {
                    switch (cat) {
                      case 'Bug': return 'bg-red-500/10 text-red-500 border-red-500/20';
                      case 'Feature Request': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
                      case 'UI/UX Suggestion': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
                      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
                    }
                  };

                  return (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedFeedback(item)}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 px-5 py-3 min-h-[48px] items-center hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      {/* PIN Badge */}
                      <div className="col-span-1 flex items-center">
                        <span className="text-[12px] font-mono text-zinc-300 bg-black/40 border border-white/5 px-1.5 py-0.5 rounded-[6px]">
                          {item.pin}
                        </span>
                      </div>

                      {/* Category Pill */}
                      <div className="col-span-2 flex items-center mt-2 md:mt-0">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${CategoryColor(item.category)} whitespace-nowrap`}>
                          {item.category}
                        </span>
                      </div>

                      {/* Notes Snippet */}
                      <div className="col-span-5 flex items-center mt-2 md:mt-0">
                        {item.text ? (
                          <p className="text-[14px] text-zinc-300 truncate w-full">
                            {item.text}
                          </p>
                        ) : (
                          <span className="text-[13px] text-zinc-600 italic">No notes</span>
                        )}
                      </div>

                      {/* Date */}
                      <div className="col-span-2 flex items-center mt-2 md:mt-0">
                        <span className="text-[12px] text-zinc-500 whitespace-nowrap">
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-end gap-1 mt-3 md:mt-0" onClick={(e) => e.stopPropagation()}>
                        {item.imageUrl && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFeedback(item);
                            }}
                            className="p-1.5 rounded-[8px] bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/5"
                            title="View Feedback Details"
                          >
                            <ImageIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1.5 rounded-[8px] bg-white/5 hover:bg-red-500/20 text-zinc-500 hover:text-red-500 transition-colors border border-transparent hover:border-red-500/10"
                          title="Delete Feedback"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Framer Motion Full-Screen Details Modal */}
        <AnimatePresence>
          {selectedFeedback && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-2xl"
              onClick={() => setSelectedFeedback(null)}
            >
              <div className="absolute top-6 right-6 z-50">
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                className="relative max-w-4xl w-full max-h-[85vh] flex flex-col md:flex-row bg-[#1C1C1E] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Image Section (if exists) */}
                {selectedFeedback.imageUrl && (
                  <div className="w-full md:w-3/5 bg-black border-b md:border-b-0 md:border-r border-white/10 flex items-center justify-center relative overflow-hidden min-h-[300px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={selectedFeedback.imageUrl} 
                      alt="Full screen feedback screenshot" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                
                {/* Details Section */}
                <div className={`p-8 w-full ${selectedFeedback.imageUrl ? 'md:w-2/5' : ''} flex flex-col h-full overflow-y-auto`}>
                  
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[13px] font-medium text-[#007AFF] bg-[#007AFF]/10 px-3 py-1.5 rounded-full inline-block">
                      {selectedFeedback.category}
                    </span>
                    <span className="text-[13px] font-mono text-zinc-400 bg-black border border-white/5 px-2.5 py-1 rounded-md">
                      PIN: {selectedFeedback.pin}
                    </span>
                  </div>
                  
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Notes</h3>
                  <div className="flex-grow">
                    {selectedFeedback.text ? (
                      <p className="text-[16px] text-zinc-200 leading-relaxed whitespace-pre-wrap">
                        {selectedFeedback.text}
                      </p>
                    ) : (
                      <p className="text-[16px] text-zinc-600 italic">No notes provided.</p>
                    )}
                  </div>
                  
                  <div className="pt-6 mt-6 border-t border-white/5">
                    <p className="text-[13px] text-zinc-500">
                      Submitted on {format(new Date(selectedFeedback.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}
