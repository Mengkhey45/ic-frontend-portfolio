'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Eye, EyeOff, Edit, Trash2, Copy, Calendar, Shield, Link as LinkIcon } from 'lucide-react';
import { SmartSearch } from '@/components/admin/smart-search';
import { Project, Category, ShareLink } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [shareExpDays, setShareExpDays] = useState('7');
  const [shareNote, setShareNote] = useState('');

  // Fetch share links for projects
  const { data: shareLinks = [] } = useQuery({
    queryKey: ['share-links'],
    queryFn: async () => {
      const response = await apiClient.get<{ shareLinks: ShareLink[] }>('share-links');
      return response.data.shareLinks || [];
    },
  });

  // Get the share link for a specific project
  const getProjectShareLink = (projectId: string) => {
    return shareLinks.find(
      (link) => link.projectId === projectId && !link.isPortfolioLink
    );
  };

  const generateProjectLinkMutation = useMutation({
    mutationFn: async ({ projectId, days, privateNote }: { projectId: string; days: string; privateNote: string }) => {
      // Delete existing project share link first
      const existing = getProjectShareLink(projectId);
      if (existing?._id) {
        await apiClient.delete(`share-links/${existing._id}`);
      }
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(days));
      return apiClient.post<ShareLink>('share-links', {
        isPortfolioLink: false,
        projectId,
        expiresAt,
        privateNote,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['share-links'] });
      setShareNote('');
      toast.success('Project share link generated');
    },
    onError: () => {
      toast.error('Failed to generate link');
    },
  });

  const { data: projects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await apiClient.get<{ projects: Project[] }>('projects');
      return response.data.projects || [];
    },
  });

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get<{ categories: Category[] }>('categories');
      return response.data.categories || [];
    },
  });

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        !searchTerm ||
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const projectCategoryId = typeof project.category === 'object' && project.category
        ? (project.category as any)._id 
        : project.category;
        
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(projectCategoryId);
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategories, projects]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Project deleted successfully');
    },
    onError: (error: any) => {
      console.error('Failed to delete project:', error);
      toast.error(error.response?.data?.message || 'Failed to delete project');
    },
  });

  const visibilityMutation = useMutation({
    mutationFn: ({ id, isHidden }: { id: string; isHidden: boolean }) =>
      apiClient.patch(`projects/${id}/visibility`, { isHidden: !isHidden }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(`Project is now ${!variables.isHidden ? 'hidden' : 'visible'}`);
    },
    onError: (error: any) => {
      console.error('Failed to toggle visibility:', error);
      toast.error('Failed to update visibility');
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const toggleVisibility = (id: string, isHidden: boolean) => {
    visibilityMutation.mutate({ id, isHidden });
  };

  const isLoading = isProjectsLoading || isCategoriesLoading;

  return (
    <div className="p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">Manage and organize your portfolio projects</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/admin/projects/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Link>
        </Button>
      </motion.div>

      {/* Smart Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SmartSearch
          categories={categories}
          searchTerm={searchTerm}
          selectedCategories={selectedCategories}
          onSearchChange={setSearchTerm}
          onCategoriesChange={setSelectedCategories}
        />
      </motion.div>

      {/* Category Filter Bar */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategories.length === 0 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategories([])}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat._id}
            variant={selectedCategories.includes(cat._id!) ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedCategories(
                selectedCategories.includes(cat._id!)
                  ? selectedCategories.filter((id) => id !== cat._id!)
                  : [cat._id!]
              );
            }}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Projects Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>All Projects</CardTitle>
            <CardDescription>Total: {filteredProjects.length} projects</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategories.length > 0 
                    ? 'No projects match your search or filter' 
                    : 'No projects yet'}
                </p>
                {!searchTerm && selectedCategories.length === 0 && (
                  <Button asChild variant="outline">
                    <Link href="/admin/projects/new">Create your first project</Link>
                  </Button>
                )}
                {(searchTerm || selectedCategories.length > 0) && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategories([]);
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead>Title</TableHead>
                      <TableHead className="hidden md:table-cell">Category</TableHead>
                      <TableHead className="hidden sm:table-cell">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project, index) => (
                      <motion.tr
                        key={project._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setPreviewProject(project)}
                      >
                        <TableCell className="font-medium max-w-xs">
                          <div className="truncate">
                            {project.title}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {typeof project.category === 'object' && project.category ? (project.category as any).name : (project.category || 'Uncategorized')}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              project.isHidden
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                            }`}
                          >
                            {project.isHidden ? 'Hidden' : 'Visible'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleVisibility(project._id!, project.isHidden)}
                              title={project.isHidden ? 'Show' : 'Hide'}
                              disabled={visibilityMutation.isPending}
                            >
                              {project.isHidden ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/admin/projects/${project._id}/edit`}>
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogTitle>Delete Project</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this project? This action cannot be undone.
                                </AlertDialogDescription>
                                <div className="flex justify-end space-x-2">
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(project._id!)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    disabled={deleteMutation.isPending}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Project Preview Dialog */}
      <Dialog open={!!previewProject} onOpenChange={(open) => !open && setPreviewProject(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {previewProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{previewProject.title}</DialogTitle>
                <div className="flex items-center gap-2 pt-1">
                  <Badge variant="secondary">
                    {typeof previewProject.category === 'object' && previewProject.category
                      ? (previewProject.category as any).name
                      : (previewProject.category || 'Uncategorized')}
                  </Badge>
                  <Badge variant={previewProject.isHidden ? 'outline' : 'default'}>
                    {previewProject.isHidden ? 'Hidden' : 'Visible'}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6 pt-2">
                {/* Thumbnail */}
                {previewProject.thumbnail && (
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={previewProject.thumbnail}
                      alt={previewProject.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Description */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Description</h4>
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {previewProject.description}
                  </p>
                </div>

                {/* Label */}
                {previewProject.label && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Private Note</h4>
                    <p className="text-sm text-muted-foreground italic">{previewProject.label}</p>
                  </div>
                )}

                {/* Image Gallery */}
                {previewProject.media?.filter((m) => m.type === 'image').length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Images</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {previewProject.media
                        .filter((m) => m.type === 'image')
                        .map((media, idx) => (
                          <div key={idx} className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                            <Image
                              src={media.url}
                              alt={media.title || `Image ${idx + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Videos */}
                {previewProject.media?.filter((m) => m.type === 'video').length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Videos</h4>
                    <div className="space-y-2">
                      {previewProject.media
                        .filter((m) => m.type === 'video')
                        .map((video, idx) => (
                          <a
                            key={idx}
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                          >
                            <Eye className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">{video.title || `Video ${idx + 1}`}</span>
                          </a>
                        ))}
                    </div>
                  </div>
                )}

                {/* PDFs */}
                {previewProject.media?.filter((m) => m.type === 'pdf').length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Documents</h4>
                    <div className="space-y-2">
                      {previewProject.media
                        .filter((m) => m.type === 'pdf')
                        .map((pdf, idx) => (
                          <a
                            key={idx}
                            href={pdf.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                          >
                            <Eye className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">{pdf.title || `Document ${idx + 1}`}</span>
                          </a>
                        ))}
                    </div>
                  </div>
                )}

                {/* Links */}
                {previewProject.links && previewProject.links.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Links</h4>
                    <div className="space-y-2">
                      {previewProject.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors text-sm text-primary truncate"
                        >
                          <Eye className="w-4 h-4 flex-shrink-0" />
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Share Link Generator */}
                <div className="border-t border-border pt-6">
                  <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Generate Share Link
                  </h4>

                  {/* Existing share link */}
                  {(() => {
                    const existingLink = getProjectShareLink(previewProject._id!);
                    if (existingLink) {
                      const expired = new Date(existingLink.expiresAt) < new Date();
                      const expiresIn = Math.ceil(
                        (new Date(existingLink.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      );
                      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/portfolio?token=${existingLink.token}`;
                      return (
                        <div className={`mb-4 p-4 rounded-lg border ${expired ? 'border-destructive/30 bg-destructive/5' : 'border-primary/30 bg-primary/5'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-mono text-xs bg-muted px-3 py-2 rounded flex-1 overflow-hidden text-ellipsis break-all border border-border">
                              {existingLink.token}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(shareUrl);
                                toast.success('Link copied');
                              }}
                            >
                              <Copy className="w-3.5 h-3.5 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {expired ? (
                                <span className="text-destructive font-medium">Expired</span>
                              ) : (
                                <span>Expires in <span className="font-medium text-foreground">{expiresIn}</span> days</span>
                              )}
                            </span>
                            {existingLink.accessCode && (
                              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                <Shield className="w-3 h-3" />
                                Code: <span className="font-mono font-bold">{existingLink.accessCode}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Expiration</Label>
                      <Select value={shareExpDays} onValueChange={setShareExpDays}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 day</SelectItem>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="14">14 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Private Note (Optional)</Label>
                      <Input
                        placeholder="e.g. For client review"
                        value={shareNote}
                        onChange={(e) => setShareNote(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button
                      onClick={() =>
                        generateProjectLinkMutation.mutate({
                          projectId: previewProject._id!,
                          days: shareExpDays,
                          privateNote: shareNote,
                        })
                      }
                      disabled={generateProjectLinkMutation.isPending}
                      className="min-w-[150px]"
                    >
                      {generateProjectLinkMutation.isPending ? 'Generating...' : 
                        getProjectShareLink(previewProject._id!) ? 'Replace Link' : 'Generate Link'}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
