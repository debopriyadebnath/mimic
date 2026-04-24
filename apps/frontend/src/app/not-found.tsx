import Link from 'next/link';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(239,68,68,0.12),transparent_42%)] pointer-events-none" />
      <Card className="card-glass w-full max-w-xl border border-white/10 z-10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full border border-yellow-400/30 bg-yellow-500/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-yellow-400" />
          </div>
          <CardTitle className="text-2xl md:text-3xl">Page Not Found</CardTitle>
          <CardDescription>
            The page you are trying to open does not exist or may have been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="outline" className="border-white/20 bg-background/30 hover:bg-background/50">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back Home
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Open Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
