'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, Plus, Calendar, Link as LinkIcon, Shield, StickyNote, Filter, CheckSquare, Square } from 'lucide-react';
import { ShareLink, Category } from '@/lib/types';
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

export default function SharingPage() {
  const queryClient = useQueryClient();
  const [expirationDays, setExpirationDays] = useState('7');
  const [privateNote, setPrivateNote] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [error, setError] = useState('');

  // Fetch share links
  const { data: shareLinks = [], isLoading: isLinksLoading } = useQuery({
    queryKey: ['share-links'],
    queryFn: async () => {
      const response = await apiClient.get<{ shareLinks: ShareLink[] }>('share-links');
      return response.data.shareLinks || [];
    },
  });

  // Fetch categories
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get<{ categories: Category[] }>('categories');
      return response.data.categories || [];
    },
  });

  // Set default selected categories to "all" once categories are loaded
  useEffect(() => {
    if (categories.length > 0 && selectedCategories.length === 0) {
      setSelectedCategories(categories.map(cat => cat._id!).filter(Boolean));
    }
  }, [categories]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const selectAllCategories = () => {
    setSelectedCategories(categories.map(cat => cat._id!).filter(Boolean));
  };

  const deselectAllCategories = () => {
    setSelectedCategories([]);
  };

  const generateMutation = useMutation({
    mutationFn: (data: { days: string; privateNote: string; allowedCategories: string[] }) => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(data.days));
      return apiClient.post<ShareLink>('share-links', {
        isPortfolioLink: true,
        expiresAt,
        privateNote: data.privateNote,
        allowedCategories: data.allowedCategories
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['share-links'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setPrivateNote('');
      toast.success('Portfolio link generated successfully');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message);
      toast.error('Failed to generate link');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`share-links/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['share-links'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Link deleted successfully');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message);
      toast.error('Failed to delete link');
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard');
  };

  const isExpired = (expiresAt: Date) => new Date(expiresAt) < new Date();

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

  const isFetching = isLinksLoading || isCategoriesLoading;

  return (
    <div className="p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Share Portfolio</h1>
        <p className="text-muted-foreground">
          Generate time-based shareable links to send your portfolio to clients
        </p>
      </motion.div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      {/* Generate New Link */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Generate New Share Link
            </CardTitle>
            <CardDescription>
              Create a time-limited link to specific categories of your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Expiration Duration</Label>
                <Select value={expirationDays} onValueChange={setExpirationDays}>
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
              <div className="md:col-span-2 space-y-2">
                <Label className="text-sm font-medium">Private Note (Optional)</Label>
                <Input 
                  placeholder="e.g. For client John Doe - Interior Design Projects" 
                  value={privateNote}
                  onChange={(e) => setPrivateNote(e.target.value)}
                />
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Select Project Categories to Include
                </Label>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={selectAllCategories}
                    className="text-xs h-8"
                  >
                    <CheckSquare className="w-3.5 h-3.5 mr-1" />
                    Select All
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={deselectAllCategories}
                    className="text-xs h-8"
                  >
                    <Square className="w-3.5 h-3.5 mr-1" />
                    Deselect All
                  </Button>
                </div>
              </div>
              
              {isCategoriesLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Loading categories...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {categories.map((category) => (
                    <div 
                      key={category._id} 
                      className={`flex items-center space-x-2 border rounded-lg p-3 transition-colors cursor-pointer hover:bg-accent/50 ${
                        selectedCategories.includes(category._id!) 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border'
                      }`}
                      onClick={() => toggleCategory(category._id!)}
                    >
                      <Checkbox 
                        id={`cat-${category._id}`} 
                        checked={selectedCategories.includes(category._id!)}
                        onCheckedChange={() => toggleCategory(category._id!)}
                      />
                      <Label 
                        htmlFor={`cat-${category._id}`}
                        className="text-sm font-normal cursor-pointer flex-1 truncate"
                      >
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              {selectedCategories.length === 0 && !isCategoriesLoading && (
                <p className="text-xs text-destructive">Please select at least one category</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => generateMutation.mutate({ 
                  days: expirationDays, 
                  privateNote, 
                  allowedCategories: selectedCategories 
                })}
                disabled={generateMutation.isPending || selectedCategories.length === 0}
                className="bg-primary hover:bg-primary/90 min-w-[150px]"
              >
                {generateMutation.isPending ? 'Generating...' : 'Generate Link'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Share Links List */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
      >
        <Card>
          <CardHeader>
            <CardTitle>Active Share Links</CardTitle>
            <CardDescription>
              {shareLinks.length} {shareLinks.length === 1 ? 'link' : 'links'} created
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isFetching ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : shareLinks.length === 0 ? (
              <div className="text-center py-12">
                <LinkIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">No share links yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {shareLinks.map((link, index) => {
                  const expired = isExpired(link.expiresAt);
                  const expiresIn = Math.ceil(
                    (new Date(link.expiresAt).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );

                  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/portfolio?token=${link.token}`;

                  // Find category names for display
                  const allowedCatNames = link.allowedCategories && link.allowedCategories.length > 0
                    ? categories
                        .filter(cat => link.allowedCategories?.includes(cat._id!))
                        .map(cat => cat.name)
                    : ['All Categories'];

                  return (
                    <motion.div key={link._id} variants={item}>
                      <Card className={`${expired ? 'opacity-50' : ''}`}>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2">
                                  <p className="font-mono text-xs bg-muted px-3 py-2 rounded overflow-hidden text-ellipsis break-all flex-1 border border-border">
                                    {link.token}
                                  </p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(shareUrl)}
                                    className="h-9"
                                  >
                                    <Copy className="w-3.5 h-3.5 mr-2" />
                                    Copy Link
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {link.privateNote && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/50 px-3 py-1.5 rounded-full border border-border">
                                      <StickyNote className="w-3 h-3" />
                                      <span>{link.privateNote}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/20">
                                    <Filter className="w-3 h-3" />
                                    <span>
                                      {allowedCatNames.length > 3 
                                        ? `${allowedCatNames.slice(0, 3).join(', ')} +${allowedCatNames.length - 3} more` 
                                        : allowedCatNames.join(', ')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/5 ml-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogTitle>Delete Share Link</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure? The link will no longer be accessible.
                                  </AlertDialogDescription>
                                  <div className="flex justify-end gap-2">
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteMutation.mutate(link._id!)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      disabled={deleteMutation.isPending}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </div>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>

                            <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
                              <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {expired ? (
                                    <span className="text-destructive font-medium">Expired</span>
                                  ) : (
                                    <span>Expires in <span className="font-medium text-foreground">{expiresIn}</span> days</span>
                                  )}
                                </div>
                                {link.accessCode && (
                                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                    <Shield className="w-3.5 h-3.5" />
                                    <span>Access Code: <span className="font-mono font-bold tracking-wider">{link.accessCode}</span></span>
                                  </div>
                                )}
                              </div>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                                expired
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                              }`}>
                                {expired ? 'Expired' : 'Active'}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Info Box */}
      <Alert className="bg-primary/5 border-primary/20">
        <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
          Share links provide secure, time-limited access to specific categories of your portfolio. An access code is automatically 
          generated for each link for maximum security. Share the link and the access code with your clients.
        </AlertDescription>
      </Alert>
    </div>
  );
}
