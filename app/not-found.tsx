import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="bg-destructive/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Oops! Invalid Link</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">The link you clicked is invalid or does not exist. Please check the URL or contact the portfolio owner for a valid link.</p>
    </div>
  );
}
