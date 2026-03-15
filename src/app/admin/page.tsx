import prisma from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { Apple } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const feedbacks = await prisma.feedback.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

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
            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] text-white text-[15px] font-medium transition-colors border border-white/5"
          >
            Exit Admin
          </Link>
        </div>

        {/* Content Section */}
        {feedbacks.length === 0 ? (
          <div className="text-center p-16 border border-white/5 bg-[#1C1C1E]/30 rounded-[32px] text-zinc-500 backdrop-blur-xl">
            <p className="text-[17px]">No feedback submitted yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {feedbacks.map((item) => (
              <div 
                key={item.id} 
                className="bg-[#1C1C1E]/60 backdrop-blur-2xl border border-white/10 rounded-[28px] overflow-hidden shadow-2xl flex flex-col transition-transform hover:scale-[1.01] duration-300"
              >
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
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#007AFF] bg-[#007AFF]/10 px-2.5 py-1 rounded-full">
                      {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                    </span>
                    <span className="text-[13px] text-zinc-500 font-mono bg-black/50 px-2 py-1 rounded-md border border-white/5">
                      ID: {item.id.slice(-6)}
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
