# Peggy Portfolio Platform

AI-powered portfolio website for YouTuber and Artist Peggy. Automatically pulls social media content, generates AI-based bio content, and renders a live updating portfolio.

## 🚀 Features

- **Social Media Integration**
  - YouTube API integration for latest videos
  - Instagram iframe embeds (no API required)
  - Automatic content sync every 6 hours

- **AI Profile Engine**
  - OpenAI-powered Hinglish bio generation
  - Auto-regenerates when content updates
  - Customizable skills and personality

- **Modern UI/UX**
  - Neo-creative dark theme
  - Neon pink + cyan gradients
  - Glassmorphism effects
  - Smooth animations with Framer Motion
  - Mobile-first responsive design

- **Admin Panel**
  - Protected login system
  - Manual content sync
  - Profile editing
  - Sync logs viewer

- **SEO Optimized**
  - Meta tags
  - OpenGraph support
  - Sitemap
  - Robots.txt

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB database
- OpenAI API key
- YouTube API key
- Email SMTP credentials (for contact form)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
npm run setup
```
Or manually create `.env.local` and copy from `.env.example`

4. Fill in your environment variables in `.env.local`:
```env
MONGODB_URI=your-mongodb-connection-string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
YOUTUBE_API_KEY=your-youtube-key
YOUTUBE_CHANNEL_ID=your-channel-id-or-handle
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CONTACT_EMAIL=your-contact-email@gmail.com
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password
CRON_SECRET=your-cron-secret
```

5. Seed the database (optional):
```bash
node scripts/seed.js
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## 🚢 Deployment on Vercel

1. Push your code to GitHub

2. Import project in Vercel

3. Add all environment variables in Vercel dashboard

4. Deploy!

The cron jobs will automatically run:
- YouTube sync: Every 6 hours
- Profile regeneration: Every 12 hours

## 📁 Project Structure

```
├── app/
│   ├── admin/          # Admin panel pages
│   ├── api/            # API routes
│   │   ├── auth/       # NextAuth routes
│   │   ├── cron/       # Cron job endpoints
│   │   └── sync/       # Manual sync endpoints
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
├── lib/               # Utilities and helpers
│   ├── mongodb.ts     # MongoDB connection
│   ├── models.ts      # Database models
│   ├── youtube.ts     # YouTube API
│   ├── instagram.ts   # Instagram integration
│   ├── ai-profile.ts  # OpenAI integration
│   └── auth.ts        # NextAuth config
└── scripts/           # Utility scripts
```

## 🔐 Admin Access

- URL: `/admin/login`
- Default credentials (set in `.env.local`):
  - Email: `ADMIN_EMAIL`
  - Password: `ADMIN_PASSWORD`

## 🎨 Customization

### Social Links
Update in components:
- `components/Hero.tsx` - YouTube and Instagram links
- `components/Footer.tsx` - Social media links

### Styling
- Tailwind config: `tailwind.config.js`
- Global styles: `app/globals.css`
- Color scheme: Neon pink (#ff006e) and cyan (#00f5ff)

### Content Language
All UI content is in Hinglish (Hindi + English mix). Update text in:
- Components in `components/` directory
- API responses in `lib/ai-profile.ts`

## 📝 API Endpoints

### Public
- `GET /api/profile` - Get profile data
- `GET /api/youtube` - Get YouTube videos
- `GET /api/instagram` - Get Instagram posts
- `POST /api/contact` - Send contact form

### Protected (Admin)
- `POST /api/sync/youtube` - Sync YouTube videos
- `POST /api/sync/profile` - Regenerate profile
- `GET /api/sync/logs` - Get sync logs
- `PUT /api/profile` - Update profile

### Cron (Vercel)
- `GET /api/cron/youtube` - Auto YouTube sync
- `GET /api/cron/profile` - Auto profile generation

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Verify `MONGODB_URI` is correct
- Check network access to MongoDB

### YouTube API Errors
- Verify `YOUTUBE_API_KEY` and `YOUTUBE_CHANNEL_ID`
- `YOUTUBE_CHANNEL_ID` supports both channel IDs (e.g., `UCxxxxx`) and handles (e.g., `@justpeggyy`)
- If using a handle, the app will automatically resolve it to a channel ID and cache it in MongoDB
- Check API quota limits

### OpenAI Errors
- Verify `OPENAI_API_KEY` is valid
- Check API billing status

### Instagram Posts Not Showing
- Add Instagram post URLs in `lib/instagram-config.ts`
- Format: `https://www.instagram.com/p/{POST_ID}/`
- Posts are rendered using iframe embeds (no API required)
- If embeds fail, check that post URLs are public and valid
- Use the admin sync endpoint to update posts from config

### Email Not Sending
- Verify SMTP credentials
- For Gmail, use App Password (not regular password)
- Check firewall/network restrictions

## 📄 License

MIT License

## 👤 Author

Peggy - YouTuber & Artist

---

Made with ❤️ using Next.js, MongoDB, and OpenAI

