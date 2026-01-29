'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FaYoutube } from 'react-icons/fa'
import MediaCard from './MediaCard'

const STORAGE_KEY = 'portfolio_youtube_links'

interface VideoData {
  embedUrl: string
  videoId: string | null
  watchUrl: string
  thumbnailUrl: string
}

// Extract video ID from embed URL
function extractVideoId(embedUrl: string): string | null {
  try {
    // Format: https://www.youtube.com/embed/VIDEO_ID
    const match = embedUrl.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/)
    if (match && match[1]) {
      return match[1]
    }
    return null
  } catch {
    return null
  }
}

// Get watch URL from embed URL
function getWatchUrl(embedUrl: string): string {
  const videoId = extractVideoId(embedUrl)
  if (videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`
  }
  return embedUrl
}

// Get YouTube thumbnail URL
function getThumbnailUrl(videoId: string | null): string {
  if (!videoId) {
    return 'https://via.placeholder.com/1280x720?text=YouTube+Video'
  }
  // Use maxresdefault for best quality, fallback to hqdefault
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

export default function YouTubeFeed() {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load from localStorage
    const loadVideos = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        const links = stored ? JSON.parse(stored) : []
        
        const videoData: VideoData[] = links.map((embedUrl: string) => {
          const videoId = extractVideoId(embedUrl)
          return {
            embedUrl,
            videoId,
            watchUrl: getWatchUrl(embedUrl),
            thumbnailUrl: getThumbnailUrl(videoId)
          }
        })
        
        setVideos(videoData)
      } catch (error) {
        console.error('Error loading YouTube videos:', error)
        setVideos([])
      } finally {
        setLoading(false)
      }
    }

    loadVideos()

    // Listen for storage changes (cross-tab updates)
    const handleStorageChange = () => {
      loadVideos()
    }

    // Listen for custom events (same-tab updates)
    const handleCustomEvent = () => {
      loadVideos()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('youtubeLinksUpdated', handleCustomEvent)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('youtubeLinksUpdated', handleCustomEvent)
    }
  }, [])

  if (loading) {
    return (
      <section id="youtube" className="py-32 px-6">
        <div className="max-w-container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-0 animate-pulse">
                <div className="aspect-video bg-surface rounded-t-2xl" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-surface rounded w-3/4" />
                  <div className="h-3 bg-surface rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="youtube" className="py-32 px-6">
      <div className="max-w-container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaYoutube className="text-2xl text-red-500" />
            <h2 className="text-5xl font-bold text-textPrimary">
              Latest Videos
            </h2>
          </div>
          <p className="text-textMuted text-lg">Latest YouTube videos and content</p>
        </motion.div>

        {videos.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto">
              <div className="card p-8">
                <h3 className="text-2xl font-bold text-textPrimary mb-4">
                  No YouTube Videos Available
                </h3>
                <p className="text-textMuted mb-8 opacity-75 leading-relaxed">
                  Videos added from the admin panel will be displayed here automatically.
                  Check back soon for new uploads and featured content.
                </p>
                <a
                  href="https://www.youtube.com/@justpeggyy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <FaYoutube />
                  <span>Visit YouTube Channel</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <MediaCard
                key={index}
                thumbnail={video.thumbnailUrl}
                url={video.watchUrl}
                platform="YouTube"
                aspectRatio="video"
              />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <a
            href="https://www.youtube.com/@justpeggyy"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2"
          >
            <FaYoutube />
            <span>View All Videos on YouTube</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
