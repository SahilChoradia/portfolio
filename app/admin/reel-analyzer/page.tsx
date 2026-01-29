'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaInstagram, 
  FaSearch, 
  FaSpinner, 
  FaCheck, 
  FaExclamationTriangle,
  FaUser,
  FaHashtag,
  FaMusic,
  FaChartLine,
  FaLightbulb,
  FaUsers,
  FaLink,
  FaImage
} from 'react-icons/fa'
import Link from 'next/link'

interface ReelAnalysis {
  _id?: string
  reelUrl: string
  caption: string
  hashtags: string[]
  creatorUsername: string
  thumbnailUrl: string
  audioName?: string
  aiAnalysis: {
    topic: string
    language: string
    tone: string
    keywords: string[]
    audience: string
    viralityScore: number
    improvementIdeas: string[]
    recommendedHashtags: string[]
  }
  competitors: Array<{
    username: string
    reelUrl: string
    reason: string
  }>
  createdAt: string
}

export default function ReelAnalyzerPage() {
  const [reelUrl, setReelUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<ReelAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return (
        (urlObj.hostname === 'instagram.com' || urlObj.hostname === 'www.instagram.com') &&
        (urlObj.pathname.includes('/reel/') || urlObj.pathname.includes('/p/'))
      )
    } catch {
      return false
    }
  }

  const handleAnalyze = async () => {
    if (!reelUrl.trim()) {
      setError('Please enter an Instagram Reel URL')
      return
    }

    if (!validateUrl(reelUrl.trim())) {
      setError('Invalid URL. Must be instagram.com/reel/* or instagram.com/p/*')
      return
    }

    setError(null)
    setLoading(true)
    setIsAnalyzing(true)

    try {
      const response = await fetch('/api/admin/analyze-reel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reelUrl: reelUrl.trim() }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze reel')
      }

      setAnalysis(data.analysis)
      setIsAnalyzing(false)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setIsAnalyzing(false)
    } finally {
      setLoading(false)
    }
  }

  // Debounced analyze function
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  const debouncedAnalyze = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    const timer = setTimeout(() => {
      handleAnalyze()
    }, 500)
    setDebounceTimer(timer)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  const getViralityColor = (score: number): string => {
    if (score >= 8) return 'text-green-400'
    if (score >= 6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getViralityBg = (score: number): string => {
    if (score >= 8) return 'bg-green-500/20 border-green-500/30'
    if (score >= 6) return 'bg-yellow-500/20 border-yellow-500/30'
    return 'bg-red-500/20 border-red-500/30'
  }

  return (
    <div className="min-h-screen py-12 px-6 bg-background">
      <div className="max-w-container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-textPrimary mb-2 flex items-center gap-3">
                <FaInstagram className="text-pink-500" />
                Reel Intelligence
              </h1>
              <p className="text-textMuted">AI-powered Instagram Reel analysis using Gemini</p>
            </div>
            <Link
              href="/admin"
              className="btn-secondary"
            >
              ← Back to Admin
            </Link>
          </div>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <FaSearch className="text-primary text-xl" />
            <h2 className="text-2xl font-semibold text-textPrimary">Analyze Reel</h2>
          </div>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={reelUrl}
                onChange={(e) => {
                  setReelUrl(e.target.value)
                  setError(null)
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    debouncedAnalyze()
                  }
                }}
                className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-textPrimary focus:outline-none focus:border-primary transition-colors"
                placeholder="Paste Instagram Reel URL (e.g., https://www.instagram.com/reel/ABC123/)"
                disabled={loading}
              />
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-center gap-2"
                >
                  <FaExclamationTriangle />
                  <span>{error}</span>
                </motion.div>
              )}
            </div>
            <button
              onClick={debouncedAnalyze}
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  {isAnalyzing ? 'Analyzing...' : 'Loading...'}
                </>
              ) : (
                <>
                  <FaSearch />
                  Analyze Reel
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Section 1: Reel Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <h2 className="text-2xl font-semibold text-textPrimary mb-4 flex items-center gap-2">
                  <FaImage />
                  Reel Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <img
                      src={analysis.thumbnailUrl}
                      alt="Reel thumbnail"
                      className="w-full rounded-xl border border-white/10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1080x1920?text=Instagram+Reel'
                      }}
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-textMuted text-sm mb-1 block">Creator</label>
                      <div className="flex items-center gap-2 text-textPrimary">
                        <FaUser />
                        <span className="font-semibold">@{analysis.creatorUsername}</span>
                      </div>
                    </div>
                    {analysis.audioName && (
                      <div>
                        <label className="text-textMuted text-sm mb-1 block">Audio</label>
                        <div className="flex items-center gap-2 text-textPrimary">
                          <FaMusic />
                          <span>{analysis.audioName}</span>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="text-textMuted text-sm mb-1 block">Caption</label>
                      <p className="text-textPrimary bg-surface p-3 rounded-lg border border-white/10">
                        {analysis.caption || 'No caption available'}
                      </p>
                    </div>
                    {analysis.hashtags.length > 0 && (
                      <div>
                        <label className="text-textMuted text-sm mb-2 block">Hashtags</label>
                        <div className="flex flex-wrap gap-2">
                          {analysis.hashtags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm flex items-center gap-1"
                            >
                              <FaHashtag />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <a
                        href={analysis.reelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary flex items-center gap-2 w-fit"
                      >
                        <FaLink />
                        View Original Reel
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Section 2: AI Insights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card p-6"
              >
                <h2 className="text-2xl font-semibold text-textPrimary mb-4 flex items-center gap-2">
                  <FaLightbulb className="text-yellow-400" />
                  AI Insights
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-textMuted text-sm mb-1 block">Topic</label>
                      <p className="text-textPrimary font-semibold">{analysis.aiAnalysis.topic}</p>
                    </div>
                    <div>
                      <label className="text-textMuted text-sm mb-1 block">Language</label>
                      <p className="text-textPrimary">{analysis.aiAnalysis.language}</p>
                    </div>
                    <div>
                      <label className="text-textMuted text-sm mb-1 block">Tone</label>
                      <p className="text-textPrimary">{analysis.aiAnalysis.tone}</p>
                    </div>
                    <div>
                      <label className="text-textMuted text-sm mb-1 block">Target Audience</label>
                      <p className="text-textPrimary">{analysis.aiAnalysis.audience}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-textMuted text-sm mb-2 block flex items-center gap-2">
                        <FaChartLine />
                        Virality Score
                      </label>
                      <div className={`p-4 rounded-xl border ${getViralityBg(analysis.aiAnalysis.viralityScore)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-3xl font-bold ${getViralityColor(analysis.aiAnalysis.viralityScore)}`}>
                            {analysis.aiAnalysis.viralityScore}/10
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              analysis.aiAnalysis.viralityScore >= 8
                                ? 'bg-green-500'
                                : analysis.aiAnalysis.viralityScore >= 6
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${(analysis.aiAnalysis.viralityScore / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    {analysis.aiAnalysis.keywords.length > 0 && (
                      <div>
                        <label className="text-textMuted text-sm mb-2 block">Keywords</label>
                        <div className="flex flex-wrap gap-2">
                          {analysis.aiAnalysis.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-surface border border-white/10 rounded-full text-sm text-textPrimary"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {analysis.aiAnalysis.recommendedHashtags.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <label className="text-textMuted text-sm mb-2 block">Recommended Hashtags</label>
                    <div className="flex flex-wrap gap-2">
                      {analysis.aiAnalysis.recommendedHashtags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm flex items-center gap-1"
                        >
                          <FaHashtag />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.aiAnalysis.improvementIdeas.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <label className="text-textMuted text-sm mb-2 block flex items-center gap-2">
                      <FaLightbulb />
                      Improvement Ideas
                    </label>
                    <ul className="space-y-2">
                      {analysis.aiAnalysis.improvementIdeas.map((idea, idx) => (
                        <li key={idx} className="text-textPrimary flex items-start gap-2">
                          <FaCheck className="text-green-400 mt-1 flex-shrink-0" />
                          <span>{idea}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>

              {/* Section 3: Competitors */}
              {analysis.competitors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="card p-6"
                >
                  <h2 className="text-2xl font-semibold text-textPrimary mb-4 flex items-center gap-2">
                    <FaUsers className="text-blue-400" />
                    Top Competitors
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysis.competitors.map((competitor, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-surface border border-white/10 rounded-xl"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FaUser className="text-primary" />
                            <span className="font-semibold text-textPrimary">@{competitor.username}</span>
                          </div>
                        </div>
                        <p className="text-textMuted text-sm mb-3">{competitor.reason}</p>
                        {competitor.reelUrl && (
                          <a
                            href={competitor.reelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary text-sm flex items-center gap-1 hover:underline"
                          >
                            <FaLink />
                            View Reel
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

