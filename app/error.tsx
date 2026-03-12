"use client";
import { AlertCircle } from 'lucide-react';

export default function Error({ error }: { error?: Error }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="bg-destructive/10 p-4 w-16 h-16 flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Something went wrong</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        {error?.message || 'An unexpected error occurred. Please try again later or contact support.'}
      </p>
    </div>
  );
}
