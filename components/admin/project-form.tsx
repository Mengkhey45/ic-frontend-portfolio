'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [draggingField, setDraggingField] = useState<string | null>(null);

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
      category: typeof project?.category === 'object' ? (project?.category as any)._id : (project?.category || ''),
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
  }, []);

  const handleFileSelect = (files: FileList | null, fileType: string) => {
    if (files?.[0]) {
      setSelectedFiles(prev => ({
        ...prev,
        [fileType]: files[0],
      }));
      toast.success(`${files[0].name} selected`);
    }
  };

  const removeFile = (fileType: string) => {
    setSelectedFiles(prev => ({
      ...prev,
      [fileType]: null,
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
      formData.append('category', data.category);
      formData.append('label', data.label);
      formData.append('isHidden', String(data.isHidden));
      
      data.links.forEach((link: string) => {
        if (link) formData.append('links', link);
      });

      Object.entries(selectedFiles).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      if (isEditing) {
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
      className="space-y-6"
    >
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
                <Label htmlFor="category">Category *</Label>
                <Select 
                  defaultValue={typeof project?.category === 'object' ? (project?.category as any)._id : (project?.category || '')}
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
                { id: 'video', label: 'Video' },
                { id: 'pdf', label: 'PDF' }
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
                      multiple={type.id === 'images'}
                    />
                    
                    <AnimatePresence mode="wait">
                      {selectedFiles[type.id] ? (
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
                          <p className="text-sm font-medium text-foreground truncate max-w-full px-4">
                            {selectedFiles[type.id]!.name}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(type.id);
                            }}
                            className="mt-4 flex items-center text-xs text-destructive hover:text-destructive/80 font-medium"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Remove file
                          </button>
                        </motion.div>
                      ) : (
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
                      )}
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
