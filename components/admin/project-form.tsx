'use client';

import { useState, useEffect } from 'react';
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
import { motion } from 'framer-motion';
import { Upload, Trash2, Plus } from 'lucide-react';
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
        const response = await apiClient.get<{ categories: Category[] }>('/categories');
        setCategories(response.data.categories || []);
      } catch (err: any) {
        console.error('Failed to fetch categories:', err);
        toast.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    if (e.target.files?.[0]) {
      setSelectedFiles({
        ...selectedFiles,
        [fileType]: e.target.files[0],
      });
    }
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
      
      // Handle links as array of strings
      data.links.forEach((link: string) => {
        if (link) formData.append('links', link);
      });

      // Add files if selected
      Object.entries(selectedFiles).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      if (isEditing) {
        await apiClient.put(`/projects/${project?._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Project updated successfully');
      } else {
        await apiClient.post('/projects', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
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

            <div className="grid grid-cols-2 gap-4">
              <div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'thumbnail', label: 'Thumbnail (Single)' },
                { id: 'images', label: 'Images (Multiple)' },
                { id: 'video', label: 'Video' },
                { id: 'pdf', label: 'PDF' }
              ].map((type) => (
                <div key={type.id}>
                  <Label>{type.label}</Label>
                  <div className="mt-2 border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                    <input
                      type="file"
                      onChange={(e) => handleFileSelect(e, type.id)}
                      className="hidden"
                      id={`file-${type.id}`}
                      accept={
                        type.id === 'video' ? 'video/*' :
                        type.id === 'pdf' ? 'application/pdf' :
                        'image/*'
                      }
                      multiple={type.id === 'images'}
                    />
                    <label htmlFor={`file-${type.id}`} className="text-sm text-muted-foreground cursor-pointer">
                      {selectedFiles[type.id] ? selectedFiles[type.id]!.name : `Select ${type.id}`}
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {/* Links */}
            <div className="space-y-2">
              <Label>Project Links</Label>
              {linkFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    placeholder="https://example.com"
                    {...register(`links.${index}` as const)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeLink(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendLink('')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? 'Saving...' : isEditing ? 'Update Project' : 'Create Project'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
