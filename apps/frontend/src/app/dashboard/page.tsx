import { Suspense } from 'react';
import { DashboardPageContent } from '@/components/dashboard/DashboardPageContent';
import { Loader2 } from 'lucide-react';

// Prevent static generation for this page since it uses useSearchParams
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="card-glass rounded-2xl px-6 py-5 flex items-center gap-3 border border-white/10">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading your dashboard workspace...</span>
        </div>
      </div>
    }>
      <DashboardPageContent />
    </Suspense>
  );
}
