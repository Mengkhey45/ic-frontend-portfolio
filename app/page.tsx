'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Zap, Share2 } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Zap,
      title: 'Easy Project Management',
      description: 'Add, edit, and manage your portfolio projects with rich media support',
    },
    {
      icon: Share2,
      title: 'Secure Sharing',
      description: 'Generate time-limited share links to showcase your work to clients',
    },
    {
      icon: Shield,
      title: 'Protected Access',
      description: 'Admin-only access with email authentication keeps your data secure',
    },
  ];

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
    <main className="min-h-screen bg-gradient-to-b from-background via-card/30 to-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="font-bold text-primary">IC</span>
            </div>
            <span className="font-bold text-foreground">Portfolio</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost">
              <Link href="/admin/login">Admin Login</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center"
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight"
        >
          Showcase Your Work
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Professional Portfolio
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
        >
          A modern portfolio management system that lets you organize, manage, and share your projects with clients
          using secure, time-limited links.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link href="/admin/login">
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/portfolio">View Demo Portfolio</Link>
          </Button>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <motion.h2
          variants={item}
          className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12"
        >
          Powerful Features
        </motion.h2>

        <motion.div
          variants={container}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={item}>
                <div className="p-8 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors hover:shadow-lg">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center"
      >
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to showcase your portfolio?</h2>
          <p className="text-muted-foreground mb-8">Start managing your projects and share them with your clients today.</p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link href="/admin/login">
              Access Admin Dashboard
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Portfolio Management. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
