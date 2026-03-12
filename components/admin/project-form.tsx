'use client';

import { useState, useEffect, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, Plus, FileIcon, X } from 'lucide-react';
import { Project, Category } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface ProjectFormProps {
  project?: Project;
  isEditing?: boolean;
}

export default function ProjectForm({ project, isEditing = false }: ProjectFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File[]>>({});
    // Track existing media files for edit mode
    const [existingMedia, setExistingMedia] = useState<Record<string, Array<{ url: string, title: string, type: string }>>>({});
  const [draggingField, setDraggingField] = useState<string | null>(null);

  // Remove a specific file from a fileType
  const removeSingleFile = (fileType: string, index: number) => {
    setSelectedFiles(prev => {
      const files = prev[fileType] || [];
      const newFiles = files.filter((_, i) => i !== index);
      return {
        ...prev,
        [fileType]: newFiles,
      };
    });
  };

  const fileInputRefs = {
    thumbnail: useRef<HTMLInputElement>(null),
    images: useRef<HTMLInputElement>(null),
    video: useRef<HTMLInputElement>(null),
    pdf: useRef<HTMLInputElement>(null),
  };

  const { control, register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      title: project?.title || '',
      description: project?.description || '',
      category: typeof project?.category === 'object' && project?.category ? (project?.category as any)._id : (project?.category || ''),
      label: project?.label || '',
      isHidden: project?.isHidden || false,
      links: project?.links || [],
    },
  });

  const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({
    control,
    name: 'links',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get<{ categories: Category[] }>('categories');
        setCategories(response.data.categories || []);
      } catch (err: any) {
        console.error('Failed to fetch categories:', err);
        toast.error('Failed to load categories');
      }
    };

    fetchCategories();

    // Populate existing media for edit mode
    if (isEditing && project?.media) {
      const mediaMap: Record<string, Array<{ url: string, title: string, type: string }>> = {
        thumbnail: [],
        images: [],
        video: [],
        pdf: [],
      };
      project.media.forEach((item: any) => {
        if (item.type === 'image') mediaMap.images.push(item);
        else if (item.type === 'video') mediaMap.video.push(item);
        else if (item.type === 'pdf') mediaMap.pdf.push(item);
      });
      if (project.thumbnail) mediaMap.thumbnail.push({ url: project.thumbnail, title: 'Thumbnail', type: 'thumbnail' });
      setExistingMedia(mediaMap);
    }
  }, [isEditing, project]);

  const handleFileSelect = (files: FileList | null, fileType: string) => {
    if (files && files.length > 0) {
      (async () => {
        let newFiles: File[] = [];
        if (fileType === 'images' || fileType === 'thumbnail') {
          // Compress images
          for (const file of Array.from(files)) {
            if (file.type.startsWith('image/')) {
              const compressed = await imageCompression(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
              });
              newFiles.push(compressed);
            } else {
              newFiles.push(file);
            }
          }
        } else {
          newFiles = Array.from(files);
        }
        setSelectedFiles(prev => {
          const existing = prev[fileType] || [];
          // Filter out duplicates by name (optional, can be improved)
          const filtered = newFiles.filter(f => !existing.some(e => e.name === f.name && e.size === f.size));
          const merged = [...existing, ...filtered];
          return {
            ...prev,
            [fileType]: merged,
          };
        });
        toast.success(`${newFiles.length} file(s) added`);
      })();
    }
  };

  const removeFile = (fileType: string) => {
    setSelectedFiles(prev => ({
      ...prev,
      [fileType]: [],
    }));
  };

  const onDragOver = (e: React.DragEvent, field: string) => {
    e.preventDefault();
    setDraggingField(field);
  };

  const onDragLeave = () => {
    setDraggingField(null);
  };

  const onDrop = (e: React.DragEvent, field: string) => {
    e.preventDefault();
    setDraggingField(null);
    handleFileSelect(e.dataTransfer.files, field);
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      if (data.category) formData.append('category', data.category);
      formData.append('label', data.label);
      formData.append('isHidden', String(data.isHidden));

      data.links.forEach((link: string) => {
        if (link) formData.append('links', link);
      });

      Object.entries(selectedFiles).forEach(([key, file]) => {
        if (file && file.length > 0) {
          file.forEach((f) => formData.append(key, f));
        }
      });

      // Send updated existingMedia for edit mode
      if (isEditing) {
        formData.append('existingMedia', JSON.stringify([
          ...existingMedia.thumbnail,
          ...existingMedia.images,
          ...existingMedia.video,
          ...existingMedia.pdf,
        ]));
        await apiClient.put(`projects/${project?._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Project updated successfully');
      } else {
        await apiClient.post('projects', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Project created successfully');
      }

      // Invalidate projects cache so new/updated project appears immediately
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      router.push('/admin/projects');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
      toast.error('Failed to save project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 relative"
    >
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="flex flex-col items-center gap-2 bg-background/90 rounded-xl p-8 shadow-lg">
            <svg
              className="animate-spin h-8 w-8"
              style={{ color: 'var(--theme-primary-color, #6366f1)' }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-lg font-semibold" style={{ color: 'var(--theme-primary-color, #6366f1)' }}>Uploading...</span>
          </div>
        </div>
      )}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {isEditing ? 'Edit Project' : 'Add New Project'}
        </h1>
        <p className="text-muted-foreground">
          {isEditing ? 'Update your project details' : 'Create a new project for your portfolio'}
        </p>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Project title, description, and category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                placeholder="E.g., E-Commerce Website"
                {...register('title', { required: 'Title is required' })}
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your project, what you did, and the results..."
                rows={5}
                {...register('description', { required: 'Description is required' })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  defaultValue={typeof project?.category === 'object' && project?.category ? (project?.category as any)._id : (project?.category || '')}
                  onValueChange={(value) => setValue('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id || ''}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="label">Private Label (for your notes)</Label>
                <Input
                  id="label"
                  placeholder="E.g., High priority client, Rush project"
                  {...register('label')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Files */}
        <Card>
          <CardHeader>
            <CardTitle>Media Files</CardTitle>
            <CardDescription>Upload thumbnail, images, video, PDF, or links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'thumbnail', label: 'Thumbnail (Single)' },
                { id: 'images', label: 'Images (Multiple)' },
                { id: 'video', label: 'Videos (Multiple)' },
                { id: 'pdf', label: 'PDFs (Multiple)' }
              ].map((type) => (
                <div key={type.id} className="space-y-2">
                  <Label>{type.label}</Label>
                  <div
                    onDragOver={(e) => onDragOver(e, type.id)}
                    onDragLeave={onDragLeave}
                    onDrop={(e) => onDrop(e, type.id)}
                    onClick={() => (fileInputRefs as any)[type.id].current?.click()}
                    className={`relative mt-2 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 group
                      ${draggingField === type.id 
                        ? 'border-primary bg-primary/5 scale-[1.02]' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                  >
                    <input
                      type="file"
                      ref={(fileInputRefs as any)[type.id]}
                      onChange={(e) => handleFileSelect(e.target.files, type.id)}
                      className="hidden"
                      accept={
                        type.id === 'video' ? 'video/*' :
                        type.id === 'pdf' ? 'application/pdf' :
                        'image/*'
                      }
                      multiple={type.id !== 'thumbnail'}
                    />
                    <AnimatePresence mode="wait">
                      {/* Show existing media files for edit mode */}
                      {existingMedia[type.id] && existingMedia[type.id].length > 0 ? (
                        <motion.div
                          key="existing"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex flex-col items-center"
                        >
                          <div className="p-3 rounded-full bg-primary/10 text-primary mb-3">
                            <FileIcon className="w-8 h-8" />
                          </div>
                          <ul className="text-sm font-medium text-foreground truncate max-w-full px-4">
                            {existingMedia[type.id].map((file, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="underline">
                                  {file.title || file.url.split('/').pop()}
                                </a>
                                <button
                                  type="button"
                                  className="ml-2 text-xs text-destructive hover:text-destructive/80"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setExistingMedia(prev => {
                                      const arr = prev[type.id] || [];
                                      return {
                                        ...prev,
                                        [type.id]: arr.filter((_, i) => i !== idx),
                                      };
                                    });
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      ) : null}
                      {/* Show newly selected files */}
                      {selectedFiles[type.id] && selectedFiles[type.id].length > 0 ? (
                        <motion.div
                          key="selected"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex flex-col items-center"
                        >
                          <div className="p-3 rounded-full bg-primary/10 text-primary mb-3">
                            <FileIcon className="w-8 h-8" />
                          </div>
                          <ul className="text-sm font-medium text-foreground truncate max-w-full px-4">
                            {selectedFiles[type.id].map((file, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                {file.name}
                                <button
                                  type="button"
                                  className="ml-2 text-xs text-destructive hover:text-destructive/80"
                                  onClick={e => {
                                    e.stopPropagation();
                                    removeSingleFile(type.id, idx);
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </li>
                            ))}
                          </ul>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              removeFile(type.id);
                            }}
                            className="mt-4 flex items-center text-xs text-destructive hover:text-destructive/80 font-medium"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Remove all files
                          </button>
                        </motion.div>
                      ) : null}
                      {/* Show empty state if no files */}
                      {(!selectedFiles[type.id] || selectedFiles[type.id].length === 0) && (!existingMedia[type.id] || existingMedia[type.id].length === 0) ? (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center"
                        >
                          <div className="p-3 rounded-full bg-muted text-muted-foreground mb-3 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                            <Upload className="w-8 h-8" />
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            Click or drag to upload {type.id}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {type.id === 'images' ? 'SVG, PNG, JPG (up to 10 files)' : 
                             type.id === 'video' ? 'MP4, WebM (up to 100MB)' :
                             type.id === 'pdf' ? 'PDF Documents' : 'SVG, PNG, JPG'}
                          </p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>

            {/* Links */}
            <div className="space-y-4 pt-4 border-t border-border">
              <Label className="text-lg">Project Links</Label>
              <div className="space-y-3">
                {linkFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      placeholder="https://example.com"
                      {...register(`links.${index}` as const)}
                      className="bg-muted/50"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLink(index)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendLink('')}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="px-8 bg-primary hover:bg-primary/90"
          >
            {isLoading ? 'Saving...' : isEditing ? 'Update Project' : 'Create Project'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
