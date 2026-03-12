'use client';

import { Project } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Download, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [showFullImage, setShowFullImage] = useState(false);

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
          className="bg-card shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate mr-2">{project.title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 sm:h-10 sm:w-10">
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>

          <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
            {/* Main Image Gallery */}
            {imageMedia.length > 0 && (
              <div className="space-y-4">
                <div className="relative aspect-video bg-muted overflow-hidden shadow-inner cursor-pointer" onClick={() => setShowFullImage(true)}>
                  <Image
                    src={imageMedia[activeMediaIndex].url}
                    alt={project.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1">Click to view full</span>
                </div>
                                {/* Full Image Modal */}
                                <AnimatePresence>
                                  {showFullImage && (
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
                                      onClick={() => setShowFullImage(false)}
                                    >
                                      <motion.div
                                        initial={{ scale: 0.95, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.95, opacity: 0 }}
                                        onClick={e => e.stopPropagation()}
                                        className="relative max-w-5xl w-full h-full flex items-center justify-center"
                                      >
                                        <Image
                                          src={imageMedia[activeMediaIndex].url}
                                          alt={project.title}
                                          fill
                                          className="object-contain"
                                          priority
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => setShowFullImage(false)} className="absolute top-4 right-4 z-10 bg-black/60 text-white">
                                          <X className="w-6 h-6" />
                                        </Button>
                                        {/* Navigation */}
                                        {activeMediaIndex > 0 && (
                                          <Button variant="ghost" size="icon" onClick={() => setActiveMediaIndex(activeMediaIndex - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white">
                                            <ChevronLeft className="w-6 h-6" />
                                          </Button>
                                        )}
                                        {imageMedia.length > activeMediaIndex + 1 && (
                                          <Button variant="ghost" size="icon" onClick={() => setActiveMediaIndex(activeMediaIndex + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white">
                                            <ChevronRight className="w-6 h-6" />
                                          </Button>
                                        )}
                                      </motion.div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                {imageMedia.length > 1 && (
                  <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {imageMedia.map((media, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => setActiveMediaIndex(idx)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 overflow-hidden border-2 transition-all ${
                          activeMediaIndex === idx ? 'border-primary shadow-md' : 'border-border opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={media.url}
                          alt={`Thumbnail ${idx}`}
                          width={80}
                          height={80}
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
                <div className="space-y-2">
                  {videoMedia.map((video, idx) => (
                    <a
                      key={idx}
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-muted hover:bg-muted/80 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Play className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">{video.title || `Video ${idx + 1}`}</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </a>
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
                      className="flex items-center justify-between p-3 bg-muted hover:bg-muted/80 transition-colors group"
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
                      className="flex items-center justify-between p-3 bg-primary/5 hover:bg-primary/10 transition-colors group"
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
