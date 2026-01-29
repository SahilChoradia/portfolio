'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { FaWhatsapp, FaEnvelope, FaPaperPlane, FaInstagram } from 'react-icons/fa'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    contactInfo: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent double submission
    if (status === 'loading') return
    
    setStatus('loading')
    setStatusMessage('')

    try {
      console.log('[CONTACT_FORM] Sending message:', { 
        name: formData.name.substring(0, 20),
        contactInfo: formData.contactInfo.substring(0, 30),
        messageLength: formData.message.length 
      })

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      // Handle non-JSON responses gracefully
      let data: any
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json()
          console.log('[CONTACT_FORM] API response:', data)
        } catch (jsonError) {
          console.error('[CONTACT_FORM_ERROR] Failed to parse JSON response:', jsonError)
          setStatus('error')
          setStatusMessage('Server returned invalid response. Please try again.')
          return
        }
      } else {
        // Non-JSON response (shouldn't happen, but handle gracefully)
        const text = await response.text()
        console.error('[CONTACT_FORM_ERROR] Non-JSON response:', text.substring(0, 200))
        setStatus('error')
        setStatusMessage('Server error. Please try again later.')
        return
      }

      if (response.ok && data.success) {
        setStatus('success')
        setStatusMessage('Message sent successfully! I will get back to you soon.')
        setFormData({ name: '', contactInfo: '', message: '' })
        
        // Reset status after 5 seconds
        setTimeout(() => {
          setStatus('idle')
          setStatusMessage('')
        }, 5000)
      } else {
        // Handle error response
        setStatus('error')
        const errorMessage = data.message || data.error || 'Something went wrong. Please try again.'
        setStatusMessage(errorMessage)
        console.error('[CONTACT_FORM_ERROR] API returned error:', data)
      }
    } catch (error: any) {
      console.error('[CONTACT_FORM_ERROR] Network or fetch error:', error)
      setStatus('error')
      
      // Provide more specific error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setStatusMessage('Network error. Please check your internet connection and try again.')
      } else if (error.message) {
        setStatusMessage(`Error: ${error.message}`)
      } else {
        setStatusMessage('Network error. Please check your connection and try again.')
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <section id="contact" className="py-32 px-6">
      <div className="max-w-container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4 text-textPrimary">
            Get In Touch
          </h2>
          <p className="text-textMuted text-lg">Mujhe message karo, main reply karungi!</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card p-8"
          >
            <h3 className="text-2xl font-semibold mb-8 text-textPrimary">Contact Options</h3>
            
            <div className="space-y-4">
              <a
                href="https://wa.me/your-whatsapp-number"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-surface/50 transition-all group"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaWhatsapp className="text-xl text-white" />
                </div>
                <div>
                  <p className="font-semibold text-textPrimary">WhatsApp</p>
                  <p className="text-sm text-textMuted">Direct message karo</p>
                </div>
              </a>

              <a
                href="https://www.instagram.com/nidhi_rajakk?igsh=bGE1ZXNxajY4aXI3"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-surface/50 transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaInstagram className="text-xl text-white" />
                </div>
                <div>
                  <p className="font-semibold text-textPrimary">Instagram</p>
                  <p className="text-sm text-textMuted">@nidhi_rajakk</p>
                </div>
              </a>

              <a
                href="mailto:justpeggy@gmail.com"
                className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-surface/50 transition-all group"
              >
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <FaEnvelope className="text-xl text-background" />
                </div>
                <div>
                  <p className="font-semibold text-textPrimary">Email</p>
                  <p className="text-sm text-textMuted">justpeggy@gmail.com</p>
                </div>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card p-8"
          >
            <h3 className="text-2xl font-semibold mb-8 text-textPrimary">Send Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-textPrimary placeholder-textMuted focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="contactInfo"
                  placeholder="Mobile Number or Instagram ID"
                  value={formData.contactInfo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-textPrimary placeholder-textMuted focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-textPrimary placeholder-textMuted focus:border-primary focus:outline-none transition-colors resize-none"
                />
              </div>

              {statusMessage && (
                <div
                  className={`p-4 rounded-xl ${
                    status === 'success'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}
                >
                  {statusMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
              >
                {status === 'loading' ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
