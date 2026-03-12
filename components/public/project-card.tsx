'use client';

import { Project } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ExternalLink, Play } from 'lucide-react';
import Image from 'next/image';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  priority?: boolean;
}

export default function ProjectCard({ project, onClick, priority = false }: ProjectCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
        {/* Thumbnail */}
        {project.thumbnail && (
          <div className="relative h-48 bg-muted overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                className="bg-white/90 p-3"
              >
                <Play className="w-6 h-6 text-primary fill-primary" />
              </motion.div>
            </div>
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {project.description}
          </p>

          {/* Tags/Links */}
          {project.links && project.links.length > 0 && (
            <div className="mt-4 flex gap-2 flex-wrap">
              {project.links.slice(0, 2).map((link, idx) => (
                <motion.a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  View
                </motion.a>
              ))}
              {project.links.length > 2 && (
                <span className="text-xs text-muted-foreground px-3 py-1">
                  +{project.links.length - 2} more
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
