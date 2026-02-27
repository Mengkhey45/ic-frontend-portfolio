'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProjectForm from '@/components/admin/project-form';
import { Project } from '@/lib/types';

export default function EditProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch project by ID
    // setProject(fetchedProject);
    // For now, dummy implementation
    setProject(null);
    setIsLoading(false);
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
      <div className="p-8">
        <p className="text-center text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <ProjectForm project={project} isEditing />
    </div>
  );
}
