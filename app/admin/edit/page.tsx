'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function EditProfile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [profile, setProfile] = useState({
    bio: '',
    tagline: '',
    skills: [] as string[],
    personality: '',
  })
  const [newSkill, setNewSkill] = useState('')

  useEffect(() => {
    // Check authentication by trying to fetch a protected resource
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/sync/logs')
        if (res.ok) {
          setAuthenticated(true)
          fetchProfile()
        } else {
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [router])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      const data = await res.json()
      if (data) {
        setProfile({
          bio: data.bio || '',
          tagline: data.tagline || '',
          skills: data.skills || [],
          personality: data.personality || '',
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      const data = await res.json()
      if (res.ok) {
        setMessage('Profile updated successfully')
      } else {
        setMessage(`Error: ${data.message}`)
      }
    } catch (error) {
      setMessage('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()],
      })
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skill),
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-textMuted">Loading...</div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className="min-h-screen py-12 px-6 bg-background">
      <div className="max-w-container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          <h1 className="text-4xl font-bold mb-8 text-textPrimary">
            Edit Profile
          </h1>

          {message && (
            <div
              className={`p-4 rounded-xl mb-6 ${
                message.includes('Error') || message.includes('Failed')
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-green-500/10 text-green-400 border border-green-500/20'
              }`}
            >
              {message}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-textPrimary">Tagline</label>
              <input
                type="text"
                value={profile.tagline}
                onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-textPrimary placeholder-textMuted focus:border-primary focus:outline-none transition-colors"
                placeholder="Your tagline"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-textPrimary">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-textPrimary placeholder-textMuted focus:border-primary focus:outline-none transition-colors resize-none"
                placeholder="Your bio"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-textPrimary">Personality</label>
              <textarea
                value={profile.personality}
                onChange={(e) => setProfile({ ...profile, personality: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-textPrimary placeholder-textMuted focus:border-primary focus:outline-none transition-colors resize-none"
                placeholder="Personality description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-textPrimary">Skills</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  className="flex-1 px-4 py-2 rounded-xl bg-surface border border-border text-textPrimary placeholder-textMuted focus:border-primary focus:outline-none transition-colors"
                  placeholder="Add a skill"
                />
                <button
                  onClick={addSkill}
                  className="btn-secondary"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-full flex items-center gap-2 bg-surface border border-border text-textMuted"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
