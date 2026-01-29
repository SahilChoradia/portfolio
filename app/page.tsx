import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Gallery from '@/components/Gallery'
import YouTubeFeed from '@/components/YouTubeFeed'
import InstagramFeed from '@/components/InstagramFeed'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Gallery />
      <YouTubeFeed />
      <InstagramFeed />
      <Contact />
      <Footer />
    </main>
  )
}

