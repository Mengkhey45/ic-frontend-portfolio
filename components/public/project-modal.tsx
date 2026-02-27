'use client';

import { Project } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Download, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const imageMedia = project.media?.filter((m) => m.type === 'image') || [];
  const videoMedia = project.media?.filter((m) => m.type === 'video') || [];
  const pdfMedia = project.media?.filter((m) => m.type === 'pdf') || [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">{project.title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Main Image Gallery */}
            {imageMedia.length > 0 && (
              <div className="space-y-4">
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={imageMedia[activeMediaIndex].url}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                </div>
                {imageMedia.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {imageMedia.map((media, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => setActiveMediaIndex(idx)}
                        whileHover={{ scale: 1.05 }}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          activeMediaIndex === idx ? 'border-primary' : 'border-border'
                        }`}
                      >
                        <Image
                          src={media.url}
                          alt={`Thumbnail ${idx}`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Description</h3>
              <p className="text-foreground leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>

            {/* Videos */}
            {videoMedia.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Videos</h3>
                <div className="space-y-3">
                  {videoMedia.map((video, idx) => (
                    <div key={idx} className="rounded-lg bg-muted p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Play className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">{video.title || `Video ${idx + 1}`}</span>
                      </div>
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:text-primary/80"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PDF Files */}
            {pdfMedia.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Documents</h3>
                <div className="space-y-2">
                  {pdfMedia.map((pdf, idx) => (
                    <a
                      key={idx}
                      href={pdf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors group"
                    >
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        {pdf.title || `Document ${idx + 1}`}
                      </span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* External Links */}
            {project.links && project.links.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Links</h3>
                <div className="space-y-2">
                  {project.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors group"
                    >
                      <span className="text-sm font-medium text-primary truncate flex-1">{link}</span>
                      <ExternalLink className="w-4 h-4 text-primary flex-shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
