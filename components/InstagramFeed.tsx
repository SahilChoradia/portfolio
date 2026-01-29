'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FaInstagram } from 'react-icons/fa'
import MediaCard from './MediaCard'

const STORAGE_KEY = 'portfolio_instagram_links'

interface ReelData {
  embedUrl: string
  reelId: string | null
  originalUrl: string
  thumbnailUrl: string
}

// Extract reel ID from embed URL
function extractReelId(embedUrl: string): string | null {
  try {
    // Format: https://www.instagram.com/reel/REEL_ID/embed
    const match = embedUrl.match(/instagram\.com\/reel\/([a-zA-Z0-9_-]+)/)
    if (match && match[1]) {
      return match[1]
    }
    // Also handle /p/ format
    const pMatch = embedUrl.match(/instagram\.com\/p\/([a-zA-Z0-9_-]+)/)
    if (pMatch && pMatch[1]) {
      return pMatch[1]
    }
    return null
  } catch {
    return null
  }
}

// Get original Instagram URL from embed URL
function getOriginalUrl(embedUrl: string): string {
  const reelId = extractReelId(embedUrl)
  if (reelId) {
    // Try reel first, then fallback to post
    if (embedUrl.includes('/reel/')) {
      return `https://www.instagram.com/reel/${reelId}/`
    }
    return `https://www.instagram.com/p/${reelId}/`
  }
  return embedUrl
}

// Get thumbnail URL
function getThumbnailUrl(reelId: string | null): string {
  if (!reelId) {
    return 'https://via.placeholder.com/1080x1920?text=Instagram+Reel'
  }
  return `https://www.instagram.com/p/${reelId}/media/?size=l`
}

export default function InstagramFeed() {
  const [reels, setReels] = useState<ReelData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load from localStorage
    const loadReels = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        const links = stored ? JSON.parse(stored) : []
        
        const reelData: ReelData[] = links.map((embedUrl: string) => {
          const reelId = extractReelId(embedUrl)
          return {
            embedUrl,
            reelId,
            originalUrl: getOriginalUrl(embedUrl),
            thumbnailUrl: getThumbnailUrl(reelId)
          }
        })
        
        setReels(reelData)
      } catch (error) {
        console.error('Error loading Instagram reels:', error)
        setReels([])
      } finally {
        setLoading(false)
      }
    }

    loadReels()

    // Listen for storage changes (cross-tab updates)
    const handleStorageChange = () => {
      loadReels()
    }

    // Listen for custom events (same-tab updates)
    const handleCustomEvent = () => {
      loadReels()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('instagramLinksUpdated', handleCustomEvent)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('instagramLinksUpdated', handleCustomEvent)
    }
  }, [])

  if (loading) {
    return (
      <section id="instagram" className="py-32 px-6">
        <div className="max-w-container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <FaInstagram className="text-2xl text-pink-500" />
              <h2 className="text-5xl font-bold text-textPrimary">
                Instagram Feed
              </h2>
            </div>
            <p className="text-textMuted text-lg">Latest Instagram posts and reels</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="aspect-[9/16] bg-surface rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="instagram" className="py-32 px-6">
      <div className="max-w-container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaInstagram className="text-2xl text-pink-500" />
            <h2 className="text-5xl font-bold text-textPrimary">
              Instagram Feed
            </h2>
          </div>
          <p className="text-textMuted text-lg">Latest Instagram posts and reels</p>
        </motion.div>

        {reels.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto">
              <div className="card p-8">
                <h3 className="text-2xl font-bold text-textPrimary mb-4">
                  No Instagram Reels Available
                </h3>
                <p className="text-textMuted mb-6 opacity-75 leading-relaxed">
                  Reels added from the admin panel will appear here automatically.
                  Stay tuned for the latest updates and creative content.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reels.map((reel, index) => (
              <MediaCard
                key={index}
                thumbnail={reel.thumbnailUrl}
                url={reel.originalUrl}
                platform="Instagram"
                aspectRatio="reel"
              />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-16 flex gap-4 justify-center flex-wrap"
        >
          <a
            href="https://www.instagram.com/nidhi_rajakk/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2"
          >
            <FaInstagram />
            <span>Follow on Instagram</span>
          </a>
          <a
            href="https://www.instagram.com/nidhi_innovations/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex items-center gap-2"
          >
            <FaInstagram />
            <span>View Art Account</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
