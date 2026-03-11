'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Eye, EyeOff, Edit, Trash2, Link2, Copy, Check, Loader2 } from 'lucide-react';
import { SmartSearch } from '@/components/admin/smart-search';
import { Project, Category } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import Image from 'next/image';

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [checkedProjects, setCheckedProjects] = useState<Set<string>>(new Set());
  const [linkExpiry, setLinkExpiry] = useState('7');
  const [linkNote, setLinkNote] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<{ url: string; accessCode: string } | null>(null);
  const [copied, setCopied] = useState(false);

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

  const toggleCheck = (id: string) => {
    setCheckedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setGeneratedLink(null);
  };

  const allFilteredChecked = filteredProjects.length > 0 && filteredProjects.every((p) => checkedProjects.has(p._id!));

  const toggleAll = () => {
    setCheckedProjects((prev) => {
      const next = new Set(prev);
      if (allFilteredChecked) {
        filteredProjects.forEach((p) => next.delete(p._id!));
      } else {
        filteredProjects.forEach((p) => next.add(p._id!));
      }
      return next;
    });
    setGeneratedLink(null);
  };

  const handleGenerateLink = async () => {
    if (checkedProjects.size === 0) {
      toast.error('Select at least one project');
      return;
    }
    setIsGenerating(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(linkExpiry));
      const res = await apiClient.post<any>('share-links/', {
        isPortfolioLink: false,
        projectIds: Array.from(checkedProjects),
        expiresAt: expiresAt.toISOString(),
        privateNote: linkNote,
      });
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
      setGeneratedLink({
        url: `${baseUrl}/portfolio?token=${res.data.token}`,
        accessCode: res.data.accessCode,
      });
      toast.success('Share link generated!');
      queryClient.invalidateQueries({ queryKey: ['share-links'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    } catch {
      toast.error('Failed to generate link');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

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
      <div>
        <SmartSearch
          categories={categories}
          searchTerm={searchTerm}
          selectedCategories={selectedCategories}
          onSearchChange={setSearchTerm}
          onCategoriesChange={setSelectedCategories}
        />
      </div>

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
      <div>
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
                      <TableHead className="w-12">
                        <Checkbox
                          checked={allFilteredChecked}
                          onCheckedChange={toggleAll}
                          className="size-5 border-2 border-muted-foreground/50 data-[state=checked]:border-primary"
                        />
                      </TableHead>
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
                        transition={{ delay: Math.min(index * 0.03, 0.3) }}
                        className="hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setPreviewProject(project)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={checkedProjects.has(project._id!)}
                            onCheckedChange={() => toggleCheck(project._id!)}
                            className="size-5 border-2 border-muted-foreground/50 data-[state=checked]:border-primary"
                          />
                        </TableCell>
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
      </div>

      {/* Link Generator Panel */}
      {checkedProjects.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary" />
                Generate Share Link
              </CardTitle>
              <CardDescription>
                {checkedProjects.size} project{checkedProjects.size > 1 ? 's' : ''} selected
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {Array.from(checkedProjects).map((id) => {
                  const p = projects.find((proj) => proj._id === id);
                  return p ? (
                    <Badge key={id} variant="secondary" className="gap-1">
                      {p.title}
                      <button onClick={() => toggleCheck(id)} className="ml-1 hover:text-destructive">×</button>
                    </Badge>
                  ) : null;
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiration</Label>
                  <select
                    value={linkExpiry}
                    onChange={(e) => setLinkExpiry(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="1">1 day</option>
                    <option value="3">3 days</option>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Private Note</Label>
                  <Input
                    value={linkNote}
                    onChange={(e) => setLinkNote(e.target.value)}
                    placeholder="E.g., For client review"
                  />
                </div>
              </div>

              <Button onClick={handleGenerateLink} disabled={isGenerating} className="w-full sm:w-auto">
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                ) : (
                  <><Link2 className="w-4 h-4 mr-2" />Generate Link</>
                )}
              </Button>

              {generatedLink && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-muted rounded-lg space-y-3"
                >
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Share URL</Label>
                    <div className="flex gap-2">
                      <Input value={generatedLink.url} readOnly className="text-sm" />
                      <Button size="icon" variant="outline" onClick={() => copyToClipboard(generatedLink.url)}>
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Access Code</Label>
                    <div className="flex gap-2">
                      <Input value={generatedLink.accessCode} readOnly className="text-sm font-mono" />
                      <Button size="icon" variant="outline" onClick={() => copyToClipboard(generatedLink.accessCode)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

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
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
