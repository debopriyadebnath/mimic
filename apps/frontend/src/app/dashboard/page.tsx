import { Suspense } from 'react';
import { DashboardPageContent } from '@/components/dashboard/DashboardPageContent';

// Prevent static generation for this page since it uses useSearchParams
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
      <DashboardPageContent />
    </Suspense>
  );
}
