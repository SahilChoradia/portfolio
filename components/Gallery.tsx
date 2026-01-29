'use client'

import { motion } from 'framer-motion'

const galleryImages = [
  { id: 1, src: '/gallery-1.jpg', alt: 'Artwork 1' },
  { id: 2, src: '/gallery-2.jpg', alt: 'Artwork 2' },
  { id: 3, src: '/gallery-3.jpg', alt: 'Artwork 3' },
  { id: 4, src: '/gallery-4.jpg', alt: 'Artwork 4' },
  { id: 5, src: '/gallery-5.jpg', alt: 'Artwork 5' },
  { id: 6, src: '/gallery-6.jpg', alt: 'Artwork 6' },
]

export default function Gallery() {
  return (
    <section id="gallery" className="py-32 px-6">
      <div className="max-w-container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4 text-textPrimary">
            Gallery
          </h2>
          <p className="text-textMuted text-lg">Mere kuch favorite creations</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="card overflow-hidden card-hover cursor-pointer group"
            >
              <div className="relative aspect-square">
                <div className="w-full h-full bg-surface flex items-center justify-center">
                  <span className="text-textMuted text-sm">Artwork {image.id}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <p className="text-textPrimary text-sm font-medium">{image.alt}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
