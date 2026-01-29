'use client'

import { motion } from 'framer-motion'
import { FaYoutube, FaInstagram } from 'react-icons/fa'
import { useEffect, useState, useRef } from 'react'

export default function Hero() {
  const [profile, setProfile] = useState<any>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    // Ensure video plays when component mounts
    const video = videoRef.current
    if (video) {
      // Force reload and play
      video.load()
      
      // Try to play with error handling
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setVideoLoaded(true)
            setVideoError(false)
          })
          .catch((err) => {
            console.error('Video autoplay failed:', err)
            // Try again after a short delay
            setTimeout(() => {
              video.play().catch(() => {
                setVideoError(true)
              })
            }, 500)
          })
      }
    }

    // Cleanup
    return () => {
      if (video) {
        video.pause()
        video.currentTime = 0
      }
    }
  }, [])

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-32">
      <div className="max-w-container mx-auto px-6 w-full">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-bold text-textPrimary leading-tight">
                Peggy
              </h1>
              <div className="h-1 w-24 bg-primary" />
            </div>

            <p className="text-2xl md:text-3xl text-textMuted font-light">
              {profile?.tagline || 'Creating magic, one video at a time ✨'}
            </p>

            <p className="text-lg text-textMuted leading-relaxed max-w-lg">
              YouTuber • Artist • Content Creator
            </p>

            <div className="flex gap-4 flex-wrap">
              <a
                href="https://www.youtube.com/@justpeggyy"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                <FaYoutube />
                <span>YouTube</span>
              </a>

              <a
                href="https://www.instagram.com/nidhi_rajakk/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <FaInstagram />
                <span>Instagram</span>
              </a>
            </div>
          </motion.div>

          {/* Right Column - Profile Video */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl bg-surface border border-border overflow-hidden shadow-2xl relative">
              {!videoLoaded && !videoError && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center z-10">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-textMuted text-sm">Loading video...</p>
                  </div>
                </div>
              )}
              
              {videoError && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center z-10">
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 mx-auto rounded-full bg-surface border-2 border-border flex items-center justify-center">
                      <span className="text-4xl">🎨</span>
                    </div>
                    <p className="text-textMuted text-sm">Video unavailable</p>
                  </div>
                </div>
              )}

              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                onLoadedData={() => setVideoLoaded(true)}
                onError={() => {
                  console.error('Video failed to load')
                  setVideoError(true)
                  setVideoLoaded(false)
                }}
                onCanPlay={() => setVideoLoaded(true)}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  videoLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ display: videoError ? 'none' : 'block' }}
              >
                <source src="/profile-video.mp4" type="video/mp4" />
                <source src="/profile-video.mp4" type="video/mpeg" />
                Your browser does not support the video tag.
              </video>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
