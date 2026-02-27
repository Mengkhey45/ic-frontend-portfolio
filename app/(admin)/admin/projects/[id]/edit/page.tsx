'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProjectForm from '@/components/admin/project-form';
import { Project } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export default function EditProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await apiClient.get<{ projects: Project[] }>('projects');
        // Filter the specific project from the list (or add a single get endpoint if backend supports it)
        const foundProject = response.data.projects.find(p => p._id === projectId);
        if (foundProject) {
          setProject(foundProject);
        }
      } catch (err) {
        console.error('Failed to fetch project:', err);
        toast.error('Failed to load project details');
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground mb-4">Project not found</p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <ProjectForm project={project} isEditing />
    </div>
  );
}
