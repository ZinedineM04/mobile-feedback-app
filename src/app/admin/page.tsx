import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const feedbacks = await prisma.feedback.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-emerald-400 tracking-tight">
            Feedback Dashboard
          </h1>
          <p className="text-zinc-400">
            Review user-submitted bug reports and feature requests.
          </p>
        </div>

        {feedbacks.length === 0 ? (
          <div className="text-center p-12 border border-zinc-800 border-dashed rounded-lg text-zinc-500">
            No feedback submitted yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {feedbacks.map((item) => (
              <Card key={item.id} className="bg-zinc-950/50 border-zinc-800 overflow-hidden text-zinc-100 flex flex-col">
                {item.imageUrl && (
                  <div className="relative w-full aspect-video bg-black border-b border-zinc-800 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt="User screenshot"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-emerald-400">
                    {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow pb-6">
                  {item.text ? (
                    <p className="text-sm text-zinc-300 break-words whitespace-pre-wrap">
                      {item.text}
                    </p>
                  ) : (
                    <p className="text-sm text-zinc-600 italic">No text provided</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
