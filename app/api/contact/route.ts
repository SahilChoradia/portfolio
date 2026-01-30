import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  contactInfo: z.string().min(3, 'Contact info must be at least 3 characters').max(100, 'Contact info must be less than 100 characters'),
  message: z.string().min(3, 'Message must be at least 3 characters').max(1000, 'Message must be less than 1000 characters'),
})

export async function POST(request: Request) {
  try {
    // Validate DATABASE_URL is set
    if (!process.env.DATABASE_URL && !process.env.MONGODB_URI) {
      console.error('[CONTACT_API_ERROR] DATABASE_URL or MONGODB_URI is not set')
      return NextResponse.json(
        { 
          success: false,
          error: 'Server configuration error',
          message: 'Database connection is not configured'
        },
        { status: 500 }
      )
    }

    // Safely parse request body
    let body: any
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('[CONTACT_API_ERROR] Failed to parse request body:', parseError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request format',
          message: 'Request body must be valid JSON'
        },
        { status: 400 }
      )
    }

    // Log incoming message for debugging
    console.log('[CONTACT_API] Incoming message:', { 
      name: body.name?.substring(0, 20), 
      contactInfo: body.contactInfo?.substring(0, 30),
      messageLength: body.message?.length 
    })
    
    // Validate schema
    let validated: z.infer<typeof contactSchema>
    try {
      validated = contactSchema.parse(body)
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const firstError = validationError.errors[0]
        console.error('[CONTACT_API_ERROR] Validation failed:', firstError?.message)
        return NextResponse.json(
          { 
            success: false,
            error: 'Validation error', 
            message: firstError?.message || 'Invalid form data'
          },
          { status: 400 }
        )
      }
      throw validationError
    }

    // Sanitize input
    const name = validated.name.trim()
    const contactInfo = validated.contactInfo.trim()
    const message = validated.message.trim()

    // Additional validation (schema already validates, but this provides extra safety)
    if (name.length < 2) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation error',
          message: 'Name must be at least 2 characters'
        },
        { status: 400 }
      )
    }

    if (message.length < 3) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation error',
          message: 'Message must be at least 3 characters'
        },
        { status: 400 }
      )
    }

    // Save to database using Prisma - AWAIT and handle errors properly
    let savedMessage
    try {
      savedMessage = await prisma.contactMessage.create({
        data: {
          name,
          contactInfo,
          message,
          status: 'new',
        },
      })
      console.log('[CONTACT_API] Message saved successfully:', {
        id: savedMessage.id,
        name: savedMessage.name,
      })
    } catch (dbError: any) {
      console.error('[CONTACT_API_ERROR] Database save failed:', {
        error: dbError.message,
        stack: dbError.stack,
        name: dbError.name,
        code: dbError.code,
      })
      
      // NEVER return success on failure
      return NextResponse.json(
        { 
          success: false,
          error: 'Database error',
          message: 'Failed to save message. Please try again later.'
        },
        { status: 500 }
      )
    }

    // Optional: Send email notification if SMTP is configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.CONTACT_EMAIL) {
      try {
        const nodemailer = await import('nodemailer')
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })

        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: process.env.CONTACT_EMAIL,
          subject: `Portfolio Contact: ${name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Contact Info:</strong> ${contactInfo}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          `,
          replyTo: process.env.CONTACT_EMAIL,
        })
        console.log('[CONTACT_API] Email notification sent')
      } catch (emailError) {
        // Log email error but don't fail the request
        console.error('[CONTACT_API_ERROR] Email notification failed:', emailError)
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Message sent successfully' 
    })
  } catch (error: any) {
    console.error('[CONTACT_API_ERROR] Unexpected error:', error)
    
    // Ensure we always return JSON
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again later.'
      },
      { status: 500 }
    )
  }
}


