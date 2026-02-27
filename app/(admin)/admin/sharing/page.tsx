'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, Trash2, Plus, Calendar, Link as LinkIcon } from 'lucide-react';
import { ShareLink } from '@/lib/types';
import { toast } from 'sonner';
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
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [expirationDays, setExpirationDays] = useState('7');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch share links from backend
    // setShareLinks(fetchedLinks);
  }, []);

  const generatePortfolioLink = async () => {
    setIsLoading(true);
    setError('');

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expirationDays));

      const response = await fetch('/api/share-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          isPortfolioLink: true,
          expiresAt,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate link');

      const data = await response.json();
      setShareLinks([...shareLinks, data]);
      toast.success('Portfolio link generated successfully');
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to generate link');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteShareLink = async (id: string) => {
    try {
      const response = await fetch(`/api/share-links/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete link');

      setShareLinks(shareLinks.filter((link) => link._id !== id));
      toast.success('Link deleted successfully');
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to delete link');
    }
  };

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
              Create a time-limited link to your entire portfolio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Expiration Duration</label>
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
              <div className="flex items-end">
                <Button
                  onClick={generatePortfolioLink}
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isLoading ? 'Generating...' : 'Generate Link'}
                </Button>
              </div>
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
            {shareLinks.length === 0 ? (
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

                  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/portfolio?token=${link.token}`;

                  return (
                    <motion.div key={link._id} variants={item}>
                      <Card className={`${expired ? 'opacity-50' : ''}`}>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-mono text-sm bg-muted px-3 py-2 rounded overflow-hidden text-ellipsis break-all">
                                    {link.token}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(shareUrl)}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
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
                                      onClick={() => deleteShareLink(link._id!)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </div>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                {expired ? (
                                  <span className="text-destructive">Expired</span>
                                ) : (
                                  <span>Expires in {expiresIn} days</span>
                                )}
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
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
      <Alert>
        <AlertDescription>
          Share links provide secure, time-limited access to your portfolio. Once expired, links
          are no longer accessible. Visitors can view all visible projects but cannot access admin
          features.
        </AlertDescription>
      </Alert>
    </div>
  );
}
