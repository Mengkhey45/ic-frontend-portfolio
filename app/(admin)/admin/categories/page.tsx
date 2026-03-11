'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Category } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  const { data: categories = [], isLoading: isFetching } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get<{ categories: Category[] }>('categories', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      return response.data.categories || [];
    },
  });

  const addMutation = useMutation({
    mutationFn: (category: { name: string; description: string }) =>
      apiClient.post<Category>('categories', category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setNewCategory({ name: '', description: '' });
      toast.success('Category added successfully');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message);
      toast.error('Failed to add category');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, category }: { id: string; category: { name: string; description: string } }) =>
      apiClient.put(`categories/${id}`, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingId(null);
      setEditingCategory({ name: '', description: '' });
      toast.success('Category updated successfully');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message);
      toast.error('Failed to update category');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Category deleted successfully');
    },
    onError: (err: any) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setError(err.response?.data?.message || err.message);
      toast.error('Failed to delete category');
    },
  });

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name) {
      setError('Category name is required');
      return;
    }
    setError('');
    addMutation.mutate(newCategory);
  };

  const handleUpdateCategory = (id: string) => {
    updateMutation.mutate({ id, category: editingCategory });
  };

  const handleDeleteCategory = (id: string) => {
    deleteMutation.mutate(id);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Categories</h1>
        <p className="text-muted-foreground">Create and manage project categories for filtering</p>
      </motion.div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add New Category Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    placeholder="e.g., Website"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    disabled={addMutation.isPending}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Optional description"
                    rows={3}
                    value={newCategory.description}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, description: e.target.value })
                    }
                    disabled={addMutation.isPending}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {addMutation.isPending ? 'Adding...' : 'Add Category'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Categories List */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-2 space-y-4"
        >
          {isFetching ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : categories.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">No categories yet. Add one to get started!</p>
              </CardContent>
            </Card>
          ) : (
            categories.map((category) => (
              <motion.div key={category._id} variants={item}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    {editingId === category._id ? (
                      <div className="space-y-4">
                        <Input
                          value={editingCategory.name}
                          onChange={(e) =>
                            setEditingCategory({ ...editingCategory, name: e.target.value })
                          }
                          placeholder="Category name"
                        />
                        <Textarea
                          value={editingCategory.description}
                          onChange={(e) =>
                            setEditingCategory({ ...editingCategory, description: e.target.value })
                          }
                          placeholder="Description"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateCategory(category._id!)}
                            disabled={updateMutation.isPending}
                            className="bg-primary hover:bg-primary/90"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            disabled={updateMutation.isPending}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {category.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(category._id!);
                              setEditingCategory({
                                name: category.name,
                                description: category.description || '',
                              });
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure? Projects in this category will not be deleted.
                              </AlertDialogDescription>
                              <div className="flex justify-end gap-2">
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCategory(category._id!)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  disabled={deleteMutation.isPending}
                                >
                                  Delete
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
