'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { FaYoutube, FaInstagram } from 'react-icons/fa'

interface MediaCardProps {
  title?: string
  thumbnail: string
  url: string
  platform: 'YouTube' | 'Instagram'
  aspectRatio?: 'video' | 'reel'
}

export default function MediaCard({
  title,
  thumbnail,
  url,
  platform,
  aspectRatio = 'video'
}: MediaCardProps) {
  const [imageError, setImageError] = useState(false)
  const isReel = aspectRatio === 'reel'
  const isYouTube = platform === 'YouTube'
  const isInstagram = platform === 'Instagram'

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="group block cursor-pointer"
    >
      <div className={`card overflow-hidden relative ${
        isReel ? 'aspect-[9/16]' : 'aspect-video'
      } bg-gradient-to-br from-surface to-surface/80 border border-white/10 rounded-2xl shadow-lg hover:shadow-2xl hover:border-primary/50 transition-all duration-300`}>
        {/* Thumbnail Image or Placeholder */}
        <div className="relative w-full h-full">
          {!imageError ? (
            <img
              src={thumbnail}
              alt={title || `${platform} content`}
              loading="lazy"
              className="w-full h-full object-cover rounded-xl"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${
              isYouTube 
                ? 'from-red-500/20 to-red-600/20' 
                : 'from-pink-500/20 to-purple-500/20'
            } flex items-center justify-center rounded-xl`}>
              {isYouTube ? (
                <FaYoutube className="text-6xl text-red-500/50" />
              ) : (
                <FaInstagram className="text-6xl text-pink-500/50" />
              )}
            </div>
          )}

          {/* Play Icon Overlay - Purely Visual */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/60 rounded-full p-4">
              <span className="text-white text-3xl">▶</span>
            </div>
          </div>
        </div>

        {/* Gradient Overlay Bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none rounded-2xl" />

        {/* Platform Badge Top Left */}
        <div className={`absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full pointer-events-none ${
          isYouTube ? 'border border-red-500/30' : 'border border-pink-500/30'
        }`}>
          {isYouTube ? (
            <>
              <FaYoutube className="text-red-500 text-sm" />
              <span className="text-white text-xs font-medium">YouTube</span>
            </>
          ) : (
            <>
              <FaInstagram className="text-pink-500 text-sm" />
              <span className="text-white text-xs font-medium">Instagram</span>
            </>
          )}
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className={`absolute inset-0 rounded-2xl blur-xl ${
            isYouTube ? 'bg-red-500/20' : 'bg-pink-500/20'
          }`} />
        </div>
      </div>

      {/* Title Below Thumbnail */}
      {title && (
        <div className="mt-4">
          <h3 className="text-textPrimary font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>
      )}
    </motion.a>
  )
}

