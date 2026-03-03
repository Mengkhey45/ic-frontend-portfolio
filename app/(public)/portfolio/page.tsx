'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Project, Category } from '@/lib/types';
import ProjectCard from '@/components/public/project-card';
import ProjectModal from '@/components/public/project-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Lock, ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

function PortfolioContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCodeRequired, setIsCodeRequired] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchPortfolio = async (code?: string) => {
    if (!token) {
      setError('Invalid access link');
      setIsLoading(false);
      return;
    }

    try {
      setIsVerifying(true);
      const url = code 
        ? `portfolio?token=${token}&accessCode=${code}` 
        : `portfolio?token=${token}`;
      
      const response = await apiClient.get<{ projects: Project[], categories: Category[] }>(url);
      setProjects(response.data.projects || []);
      setCategories(response.data.categories || []);
      setIsCodeRequired(false);
      setError(null);
    } catch (err: any) {
      // 403 Forbidden is now used for the access code prompt
      if (err.response?.status === 403 && err.response?.data?.codeRequired) {
        setIsCodeRequired(true);
        if (code) {
          setError('Incorrect access code');
        }
      } else if (err.response?.status === 404) {
        setError('Link expired or invalid');
        console.error('Portfolio link error:', err.response?.data?.message);
      } else {
        setError('Failed to load portfolio');
        console.error('Portfolio load error:', err);
      }
    } finally {
      setIsLoading(false);
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [token]);

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode) return;
    fetchPortfolio(accessCode);
  };

  const filteredProjects =
    selectedCategory === 'all'
      ? projects
      : projects.filter((p) => {
          const categoryId = typeof p.category === 'object' ? (p.category as any)._id : p.category;
          return categoryId === selectedCategory;
        });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (isCodeRequired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-card border border-border rounded-xl p-8 shadow-lg text-center">
            <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Protected Portfolio</h1>
            <p className="text-muted-foreground mb-8">This link requires an access code to view the contents.</p>
            
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Enter access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="pr-12 py-6 text-center text-lg tracking-widest"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-sm text-destructive font-medium">{error}</p>
              )}
              <Button 
                type="submit" 
                className="w-full py-6 text-lg" 
                disabled={isVerifying || !accessCode}
              >
                {isVerifying ? 'Verifying...' : (
                  <span className="flex items-center gap-2">
                    Access Portfolio <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error && !isCodeRequired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-destructive/10 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Oops!</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild variant="outline">
            <a href="/">Go Home</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card/50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-foreground mb-2">Portfolio</h1>
            <p className="text-muted-foreground">Explore projects and work samples</p>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-2 justify-center"
            >
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('all')}
                className={selectedCategory === 'all' ? 'bg-primary hover:bg-primary/90' : ''}
              >
                All Projects
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat._id}
                  variant={selectedCategory === cat._id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat._id || '')}
                  className={selectedCategory === cat._id ? 'bg-primary hover:bg-primary/90' : ''}
                >
                  {cat.name}
                </Button>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground text-lg">No projects in this category yet</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProjectCard
                  project={project}
                  onClick={() => setSelectedProject(project)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <PortfolioContent />
    </Suspense>
  );
}
