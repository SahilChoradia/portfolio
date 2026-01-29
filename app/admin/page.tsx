'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaYoutube, FaInstagram, FaTrash, FaLock, FaCheck, FaPlay, FaEnvelope } from 'react-icons/fa'
import Link from 'next/link'
import MediaCard from '@/components/MediaCard'

const STORAGE_KEYS = {
  YOUTUBE: 'portfolio_youtube_links',
  INSTAGRAM: 'portfolio_instagram_links',
  AUTH: 'portfolio_admin_authenticated'
}

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

// YouTube URL sanitization
function sanitizeYouTubeUrl(url: string): string | null {
  try {
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`
      }
    }
    
    return null
  } catch {
    return null
  }
}

// Instagram URL sanitization
function sanitizeInstagramUrl(url: string): string | null {
  try {
    // Handle Instagram Reel URLs
    const patterns = [
      /instagram\.com\/reel\/([a-zA-Z0-9_-]+)/,
      /instagram\.com\/p\/([a-zA-Z0-9_-]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return `https://www.instagram.com/reel/${match[1]}/embed`
      }
    }
    
    return null
  } catch {
    return null
  }
}

// Extract reel ID from embed URL
function extractReelId(embedUrl: string): string | null {
  try {
    const match = embedUrl.match(/instagram\.com\/reel\/([a-zA-Z0-9_-]+)/)
    if (match && match[1]) {
      return match[1]
    }
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
    if (embedUrl.includes('/reel/')) {
      return `https://www.instagram.com/reel/${reelId}/`
    }
    return `https://www.instagram.com/p/${reelId}/`
  }
  return embedUrl
}

// Get thumbnail URL
function getThumbnailUrl(reelId: string | null): string | null {
  if (!reelId) return null
  return `https://www.instagram.com/p/${reelId}/media/?size=l`
}

// Extract video ID from embed URL
function extractVideoId(embedUrl: string): string | null {
  try {
    const match = embedUrl.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/)
    if (match && match[1]) {
      return match[1]
    }
    return null
  } catch {
    return null
  }
}

// Get YouTube watch URL from embed URL
function getYouTubeWatchUrl(embedUrl: string): string {
  const videoId = extractVideoId(embedUrl)
  if (videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`
  }
  return embedUrl
}

// Get YouTube thumbnail URL
function getYouTubeThumbnailUrl(videoId: string | null): string {
  if (!videoId) {
    return 'https://via.placeholder.com/1280x720?text=YouTube+Video'
  }
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>([])
  const [instagramLinks, setInstagramLinks] = useState<string[]>([])
  const [youtubeInput, setYoutubeInput] = useState('')
  const [instagramInput, setInstagramInput] = useState('')
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    // Check if already authenticated
    const authStatus = localStorage.getItem(STORAGE_KEYS.AUTH)
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
    loadLinks()
  }, [])

  const loadLinks = () => {
    const youtube = JSON.parse(localStorage.getItem(STORAGE_KEYS.YOUTUBE) || '[]')
    const instagram = JSON.parse(localStorage.getItem(STORAGE_KEYS.INSTAGRAM) || '[]')
    setYoutubeLinks(youtube)
    setInstagramLinks(instagram)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASS || ''
    
    if (!adminPass) {
      // If no password is set, allow access
      setIsAuthenticated(true)
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true')
      setPasswordError('')
      return
    }
    
    if (password === adminPass) {
      setIsAuthenticated(true)
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true')
      setPasswordError('')
      setPassword('')
    } else {
      setPasswordError('Incorrect password')
    }
  }

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  const addYouTubeLink = () => {
    if (!youtubeInput.trim()) {
      showToast('Please enter a YouTube URL', 'error')
      return
    }

    const sanitized = sanitizeYouTubeUrl(youtubeInput.trim())
    if (!sanitized) {
      showToast('Invalid YouTube URL format', 'error')
      return
    }

    const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.YOUTUBE) || '[]')
    if (current.includes(sanitized)) {
      showToast('This video is already added', 'error')
      return
    }

    const updated = [...current, sanitized]
    localStorage.setItem(STORAGE_KEYS.YOUTUBE, JSON.stringify(updated))
    setYoutubeLinks(updated)
    setYoutubeInput('')
    showToast('YouTube video added successfully')
    // Dispatch custom event for other tabs/components
    window.dispatchEvent(new CustomEvent('youtubeLinksUpdated'))
  }

  const addInstagramLink = () => {
    if (!instagramInput.trim()) {
      showToast('Please enter an Instagram URL', 'error')
      return
    }

    const sanitized = sanitizeInstagramUrl(instagramInput.trim())
    if (!sanitized) {
      showToast('Invalid Instagram Reel URL format', 'error')
      return
    }

    const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.INSTAGRAM) || '[]')
    if (current.includes(sanitized)) {
      showToast('This reel is already added', 'error')
      return
    }

    const updated = [...current, sanitized]
    localStorage.setItem(STORAGE_KEYS.INSTAGRAM, JSON.stringify(updated))
    setInstagramLinks(updated)
    setInstagramInput('')
    showToast('Instagram reel added successfully')
    // Dispatch custom event for other tabs/components
    window.dispatchEvent(new CustomEvent('instagramLinksUpdated'))
  }

  const deleteYouTubeLink = (link: string) => {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.YOUTUBE) || '[]')
    const updated = current.filter((l: string) => l !== link)
    localStorage.setItem(STORAGE_KEYS.YOUTUBE, JSON.stringify(updated))
    setYoutubeLinks(updated)
    showToast('YouTube video removed')
    // Dispatch custom event for other tabs/components
    window.dispatchEvent(new CustomEvent('youtubeLinksUpdated'))
  }

  const deleteInstagramLink = (link: string) => {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.INSTAGRAM) || '[]')
    const updated = current.filter((l: string) => l !== link)
    localStorage.setItem(STORAGE_KEYS.INSTAGRAM, JSON.stringify(updated))
    setInstagramLinks(updated)
    showToast('Instagram reel removed')
    // Dispatch custom event for other tabs/components
    window.dispatchEvent(new CustomEvent('instagramLinksUpdated'))
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 max-w-md w-full"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <FaLock className="text-2xl text-primary" />
            <h1 className="text-3xl font-bold text-textPrimary">Admin Access</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-textMuted text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setPasswordError('')
                }}
                className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-textPrimary focus:outline-none focus:border-primary transition-colors"
                placeholder="Enter admin password"
                autoFocus
              />
              {passwordError && (
                <p className="text-red-400 text-sm mt-2">{passwordError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full btn-primary"
            >
              Login
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-6 bg-background">
      <div className="max-w-container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-start"
        >
          <div>
            <h1 className="text-4xl font-bold text-textPrimary mb-2">Content Manager</h1>
            <p className="text-textMuted">Manage YouTube videos and Instagram reels</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/reel-analyzer"
              className="btn-secondary flex items-center gap-2"
            >
              <FaInstagram />
              Reel Analyzer
            </Link>
            <Link
              href="/admin/messages"
              className="btn-secondary flex items-center gap-2"
            >
              <FaEnvelope />
              View Messages
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem(STORAGE_KEYS.AUTH)
                setIsAuthenticated(false)
              }}
              className="btn-secondary flex items-center gap-2"
            >
              <FaLock />
              Logout
            </button>
          </div>
        </motion.div>

        {/* Toast Notifications */}
        <div className="fixed top-20 right-6 z-50 space-y-2">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className={`p-4 rounded-xl shadow-lg ${
                  toast.type === 'success'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  {toast.type === 'success' && <FaCheck />}
                  <span>{toast.message}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Add YouTube Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <FaYoutube className="text-2xl text-red-500" />
              <h2 className="text-2xl font-semibold text-textPrimary">Add YouTube Video</h2>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={youtubeInput}
                onChange={(e) => setYoutubeInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addYouTubeLink()}
                className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-textPrimary focus:outline-none focus:border-primary transition-colors"
                placeholder="Paste YouTube video or shorts URL"
              />
              <button
                onClick={addYouTubeLink}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <FaYoutube />
                Add YouTube
              </button>
            </div>
          </motion.div>

          {/* Add Instagram Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <FaInstagram className="text-2xl text-pink-500" />
              <h2 className="text-2xl font-semibold text-textPrimary">Add Instagram Reel</h2>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={instagramInput}
                onChange={(e) => setInstagramInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addInstagramLink()}
                className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-textPrimary focus:outline-none focus:border-primary transition-colors"
                placeholder="Paste Instagram Reel URL"
              />
              <button
                onClick={addInstagramLink}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <FaInstagram />
                Add Instagram
              </button>
            </div>
          </motion.div>
        </div>

        {/* Saved Content Lists */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* YouTube Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <h2 className="text-2xl font-semibold mb-6 text-textPrimary flex items-center gap-2">
              <FaYoutube className="text-red-500" />
              YouTube Videos ({youtubeLinks.length})
            </h2>
            {youtubeLinks.length === 0 ? (
              <p className="text-textMuted text-center py-8">No videos added yet</p>
            ) : (
              <div className="space-y-4">
                {youtubeLinks.map((link, index) => {
                  const videoId = extractVideoId(link)
                  const watchUrl = getYouTubeWatchUrl(link)
                  const thumbnailUrl = getYouTubeThumbnailUrl(videoId)

                  return (
                    <div key={index} className="card p-4">
                      <MediaCard
                        thumbnail={thumbnailUrl}
                        url={watchUrl}
                        platform="YouTube"
                        aspectRatio="video"
                      />
                      <button
                        onClick={() => deleteYouTubeLink(link)}
                        className="w-full btn-secondary flex items-center justify-center gap-2 text-sm mt-4"
                      >
                        <FaTrash />
                        Delete
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>

          {/* Instagram Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <h2 className="text-2xl font-semibold mb-6 text-textPrimary flex items-center gap-2">
              <FaInstagram className="text-pink-500" />
              Instagram Reels ({instagramLinks.length})
            </h2>
            {instagramLinks.length === 0 ? (
              <p className="text-textMuted text-center py-8">No reels added yet</p>
            ) : (
              <div className="space-y-4">
                {instagramLinks.map((link, index) => {
                  const reelId = extractReelId(link)
                  const thumbnailUrl = getThumbnailUrl(reelId) || 'https://via.placeholder.com/1080x1920?text=Instagram+Reel'
                  const originalUrl = getOriginalUrl(link)

                  return (
                    <div key={index} className="card p-4">
                      <MediaCard
                        thumbnail={thumbnailUrl}
                        url={originalUrl}
                        platform="Instagram"
                        aspectRatio="reel"
                      />
                      <button
                        onClick={() => deleteInstagramLink(link)}
                        className="w-full btn-secondary flex items-center justify-center gap-2 text-sm mt-4"
                      >
                        <FaTrash />
                        Delete
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
