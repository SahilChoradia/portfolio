'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function About() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        setProfile(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section id="about" className="py-32 px-6">
        <div className="max-w-container mx-auto">
          <div className="card p-12 animate-pulse">
            <div className="h-8 bg-surface rounded w-1/3 mb-4" />
            <div className="h-4 bg-surface rounded w-full mb-2" />
            <div className="h-4 bg-surface rounded w-5/6" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="about" className="py-32 px-6">
      <div className="max-w-container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="card p-12"
        >
          <div className="mb-8">
            <h2 className="text-5xl font-bold mb-4 text-textPrimary">
              About Me
            </h2>
            <div className="h-1 w-16 bg-primary" />
          </div>

          <div className="space-y-6 mb-10">
            <p className="text-lg text-textMuted leading-relaxed">
              {profile?.bio || 'Creative YouTuber aur Artist jo apne art se duniya ko inspire karti hai! Main videos banati hoon, art create karti hoon, aur apne journey ko share karti hoon.'}
            </p>

            {profile?.personality && (
              <p className="text-base text-textMuted leading-relaxed">
                {profile.personality}
              </p>
            )}
          </div>

          {profile?.skills && profile.skills.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-textPrimary">Skills</h3>
              <div className="flex flex-wrap gap-3">
                {profile.skills.map((skill: string, index: number) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="px-4 py-2 rounded-full text-sm bg-surface border border-border text-textMuted hover:text-textPrimary hover:border-primary/30 transition-colors"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
