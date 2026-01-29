'use client'

import { FaYoutube, FaInstagram, FaHeart } from 'react-icons/fa'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border py-16 px-6">
      <div className="max-w-container mx-auto">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-textPrimary">
              Peggy
            </h3>
            <p className="text-textMuted leading-relaxed">
              Creative YouTuber aur Artist jo apne art se duniya ko inspire karti hai!
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-textPrimary">Quick Links</h4>
            <ul className="space-y-3 text-textMuted">
              <li>
                <a href="#about" className="hover:text-primary transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-primary transition-colors">
                  Gallery
                </a>
              </li>
              <li>
                <a href="#youtube" className="hover:text-primary transition-colors">
                  YouTube
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-textPrimary">Follow Me</h4>
            <div className="flex gap-4">
              <a
                href="https://www.youtube.com/@justpeggyy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:border-primary hover:bg-surface transition-all group"
                aria-label="YouTube"
              >
                <FaYoutube className="text-xl text-red-500" />
              </a>
              <a
                href="https://www.instagram.com/nidhi_rajakk/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:border-primary hover:bg-surface transition-all group"
                aria-label="Instagram"
              >
                <FaInstagram className="text-xl text-pink-500" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-textMuted">
          <p className="flex items-center justify-center gap-2">
            Made with <FaHeart className="text-primary" /> by Peggy © {currentYear}
          </p>
        </div>
      </div>
    </footer>
  )
}
