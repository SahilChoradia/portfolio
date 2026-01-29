'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaEnvelope, FaEnvelopeOpen, FaTrash, FaSpinner } from 'react-icons/fa'

interface Message {
  id: string
  name: string
  contactInfo: string
  message: string
  status: 'new' | 'read'
  createdAt: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('/api/admin/messages')
      const data = await response.json()

      if (response.ok) {
        setMessages(data.messages || [])
      } else {
        setError(data.message || 'Failed to load messages')
      }
    } catch (err: any) {
      setError('Network error. Please try again.')
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      setUpdating(id)
      const response = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: 'read' }),
      })

      if (response.ok) {
        setMessages(prev =>
          prev.map(msg => (msg.id === id ? { ...msg, status: 'read' as const } : msg))
        )
      }
    } catch (err) {
      console.error('Error updating message:', err)
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return
    }

    try {
      setUpdating(id)
      const response = await fetch(`/api/admin/messages?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg.id !== id))
      }
    } catch (err) {
      console.error('Error deleting message:', err)
    } finally {
      setUpdating(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const unreadCount = messages.filter(m => m.status === 'new').length

  return (
    <div className="min-h-screen py-12 px-6 bg-background">
      <div className="max-w-container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-textPrimary mb-2">Contact Messages</h1>
              <p className="text-textMuted">
                {messages.length} total message{messages.length !== 1 ? 's' : ''}
                {unreadCount > 0 && (
                  <span className="ml-2 text-primary">
                    • {unreadCount} new
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={fetchMessages}
              disabled={loading}
              className="btn-secondary flex items-center gap-2"
            >
              {loading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                'Refresh'
              )}
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="card p-12 text-center">
            <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
            <p className="text-textMuted">Loading messages...</p>
          </div>
        ) : error ? (
          <div className="card p-8">
            <div className="bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl p-4">
              {error}
            </div>
            <button
              onClick={fetchMessages}
              className="btn-primary mt-4"
            >
              Try Again
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="card p-12 text-center">
            <FaEnvelope className="text-6xl text-textMuted mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-semibold text-textPrimary mb-2">
              No Messages Yet
            </h3>
            <p className="text-textMuted">
              Messages submitted through the contact form will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`card p-6 ${
                  message.status === 'new' ? 'border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-textPrimary">
                        {message.name}
                      </h3>
                      {message.status === 'new' && (
                        <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-primary text-sm">
                      {message.contactInfo}
                    </p>
                    <p className="text-textMuted text-sm mt-1">
                      {formatDate(message.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {message.status === 'new' && (
                      <button
                        onClick={() => handleMarkAsRead(message.id)}
                        disabled={updating === message.id}
                        className="btn-secondary text-sm px-3 py-2 flex items-center gap-2"
                        title="Mark as read"
                      >
                        {updating === message.id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaEnvelopeOpen />
                        )}
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(message.id)}
                      disabled={updating === message.id}
                      className="btn-secondary text-sm px-3 py-2 flex items-center gap-2 text-red-400 hover:text-red-300"
                      title="Delete message"
                    >
                      {updating === message.id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaTrash />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-surface rounded-xl">
                  <p className="text-textPrimary whitespace-pre-wrap leading-relaxed">
                    {message.message}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


