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
      category: project?.category || '',
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
    // Fetch categories
    // setCategories(fetchedCategories);
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
      formData.append('isHidden', data.isHidden);
      formData.append('links', JSON.stringify(data.links));

      // Add files if selected
      Object.entries(selectedFiles).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      const url = isEditing
        ? `/api/projects/${project?._id}`
        : '/api/projects';

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to save project');
      }

      router.push('/admin/projects');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
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
                <Select {...register('category', { required: 'Category is required' })}>
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
              {['thumbnail', 'images', 'video', 'pdf'].map((type) => (
                <div key={type}>
                  <Label>{type.charAt(0).toUpperCase() + type.slice(1)}</Label>
                  <div className="mt-2 border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                    <input
                      type="file"
                      onChange={(e) => handleFileSelect(e, type)}
                      className="hidden"
                      id={`file-${type}`}
                      accept={
                        type === 'video' ? 'video/*' :
                        type === 'pdf' ? 'application/pdf' :
                        'image/*'
                      }
                    />
                    <label htmlFor={`file-${type}`} className="text-sm text-muted-foreground cursor-pointer">
                      {selectedFiles[type] ? selectedFiles[type]!.name : `Select ${type}`}
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
