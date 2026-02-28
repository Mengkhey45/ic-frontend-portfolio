'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Tag, Share2, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [projectsRes, categoriesRes, sharesRes] = await Promise.all([
        apiClient.get<{ projects: any[] }>('projects'),
        apiClient.get<{ categories: any[] }>('categories'),
        apiClient.get<{ shareLinks: any[] }>('share-links'),
      ]);

      return {
        totalProjects: projectsRes.data.projects?.length || 0,
        totalCategories: categoriesRes.data.categories?.length || 0,
        activeShares: sharesRes.data.shareLinks?.length || 0,
      };
    },
  });

  const quickActions = [
    {
      title: 'Add Project',
      description: 'Create a new project in your portfolio',
      href: '/admin/projects/new',
      icon: FolderOpen,
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      title: 'Manage Categories',
      description: 'Add or edit project categories',
      href: '/admin/categories',
      icon: Tag,
      color: 'bg-purple-500/10 text-purple-600',
    },
    {
      title: 'Share Portfolio',
      description: 'Generate shareable links with expiration',
      href: '/admin/sharing',
      icon: Share2,
      color: 'bg-green-500/10 text-green-600',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
        <p className="text-muted-foreground">Manage your portfolio and projects from here</p>
      </motion.div>

      {/* Stats Grid */}
      {!isLoading && stats && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={item}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Projects</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalProjects}</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <FolderOpen className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalCategories}</p>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Tag className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Share Links</p>
                    <p className="text-3xl font-bold mt-2">{stats.activeShares}</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Share2 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.div key={action.href} variants={item}>
                <Link href={action.href}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/50">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Getting Started */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span>Getting Started</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-foreground/90">
              Start by creating categories for your projects, then add your work with descriptions, media files, and links.
              Once ready, generate a shareable portfolio link to send to your clients.
            </p>
            <div className="flex space-x-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/categories">Create Categories</Link>
              </Button>
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                <Link href="/admin/projects">Add Your First Project</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
