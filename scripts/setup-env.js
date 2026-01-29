// Helper script to create .env.local from template
const fs = require('fs')
const path = require('path')

const envTemplate = `# MongoDB
MONGODB_URI=mongodb://localhost:27017/peggy-portfolio

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production

# OpenAI
OPENAI_API_KEY=your-openai-api-key-here

# Google Gemini API (for Reel Intelligence)
GEMINI_API_KEY=your-gemini-api-key-here

# YouTube API
YOUTUBE_API_KEY=your-youtube-api-key-here
YOUTUBE_CHANNEL_ID=@justpeggyy

# Email (for contact form)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here
CONTACT_EMAIL=your-contact-email@gmail.com

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-password

# Cron Secret (for Vercel cron jobs)
CRON_SECRET=your-random-secret-here
`

const envPath = path.join(process.cwd(), '.env.local')
const envExamplePath = path.join(process.cwd(), '.env.example')

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envTemplate)
  console.log('✅ Created .env.local file')
  console.log('⚠️  Please update the values in .env.local with your actual credentials')
} else {
  console.log('ℹ️  .env.local already exists')
}

if (!fs.existsSync(envExamplePath)) {
  fs.writeFileSync(envExamplePath, envTemplate)
  console.log('✅ Created .env.example file')
}



