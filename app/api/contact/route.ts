import { NextResponse } from 'next/server'
import { z } from 'zod'
import clientPromise from '@/lib/mongodb'
import { saveContactMessage } from '@/lib/models'

export const dynamic = 'force-dynamic'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  contactInfo: z.string().min(3, 'Contact info must be at least 3 characters').max(100, 'Contact info must be less than 100 characters'),
  message: z.string().min(3, 'Message must be at least 3 characters').max(1000, 'Message must be less than 1000 characters'),
})

export async function POST(request: Request) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`
  
  try {
    // ============================================
    // STEP 1: LOG EXECUTION START
    // ============================================
    console.log(`[CONTACT_API:${requestId}] ========== REQUEST START ==========`)
    console.log(`[CONTACT_API:${requestId}] Timestamp: ${new Date().toISOString()}`)
    console.log(`[CONTACT_API:${requestId}] Environment: ${process.env.NODE_ENV || 'unknown'}`)
    
    // ============================================
    // STEP 2: HARD FAIL ON MISCONFIGURATION
    // ============================================
    console.log(`[CONTACT_API:${requestId}] Checking environment variables...`)
    const hasMongoUri = !!process.env.MONGO_URI
    const hasMongodbUri = !!process.env.MONGODB_URI
    console.log(`[CONTACT_API:${requestId}] MONGO_URI present: ${hasMongoUri}`)
    console.log(`[CONTACT_API:${requestId}] MONGODB_URI present: ${hasMongodbUri}`)
    
    if (!hasMongoUri && !hasMongodbUri) {
      const errorMsg = 'CRITICAL: MONGO_URI (or MONGODB_URI) environment variable is missing'
      console.error(`[CONTACT_API_ERROR:${requestId}] ${errorMsg}`)
      throw new Error(errorMsg)
    }
    
    if (!hasMongoUri && hasMongodbUri) {
      console.warn(`[CONTACT_API:${requestId}] WARNING: Using deprecated MONGODB_URI. Please migrate to MONGO_URI.`)
    }
    
    // ============================================
    // STEP 3: VERIFY MONGODB CLIENT
    // ============================================
    console.log(`[CONTACT_API:${requestId}] Checking MongoDB client...`)
    let client
    try {
      client = await clientPromise
      console.log(`[CONTACT_API:${requestId}] MongoDB client connected: ${!!client}`)
      console.log(`[CONTACT_API:${requestId}] MongoDB client type: ${typeof client}`)
    } catch (clientError: any) {
      const errorMsg = 'CRITICAL: Failed to connect to MongoDB'
      console.error(`[CONTACT_API_ERROR:${requestId}] ${errorMsg}`)
      console.error(`[CONTACT_API_ERROR:${requestId}] Error: ${clientError?.message || 'Unknown'}`)
      console.error(`[CONTACT_API_ERROR:${requestId}] Stack: ${clientError?.stack || 'No stack trace'}`)
      throw new Error(errorMsg)
    }
    
    // ============================================
    // STEP 4: PARSE REQUEST BODY (WITH LOGGING)
    // ============================================
    console.log(`[CONTACT_API:${requestId}] Parsing request body...`)
    let body: any
    try {
      body = await request.json()
      console.log(`[CONTACT_API:${requestId}] Request body parsed successfully`)
      console.log(`[CONTACT_API:${requestId}] Body keys: ${Object.keys(body).join(', ')}`)
    } catch (parseError: any) {
      console.error(`[CONTACT_API_ERROR:${requestId}] Failed to parse request body`)
      console.error(`[CONTACT_API_ERROR:${requestId}] Error message: ${parseError?.message || 'Unknown'}`)
      console.error(`[CONTACT_API_ERROR:${requestId}] Error stack: ${parseError?.stack || 'No stack trace'}`)
      return NextResponse.json(
        { 
          success: false,
          error: 'INVALID_REQUEST',
          errorCode: 'PARSE_ERROR',
          message: 'Request body must be valid JSON'
        },
        { status: 400 }
      )
    }

    // ============================================
    // STEP 5: LOG INCOMING DATA
    // ============================================
    console.log(`[CONTACT_API:${requestId}] Incoming message data:`)
    console.log(`[CONTACT_API:${requestId}] - name: ${body.name?.substring(0, 20) || 'missing'} (length: ${body.name?.length || 0})`)
    console.log(`[CONTACT_API:${requestId}] - contactInfo: ${body.contactInfo?.substring(0, 30) || 'missing'} (length: ${body.contactInfo?.length || 0})`)
    console.log(`[CONTACT_API:${requestId}] - message length: ${body.message?.length || 0}`)
    
    // ============================================
    // STEP 6: VALIDATE SCHEMA (WITH LOGGING)
    // ============================================
    console.log(`[CONTACT_API:${requestId}] Validating schema...`)
    let validated: z.infer<typeof contactSchema>
    try {
      validated = contactSchema.parse(body)
      console.log(`[CONTACT_API:${requestId}] Schema validation passed`)
    } catch (validationError: any) {
      console.error(`[CONTACT_API_ERROR:${requestId}] Schema validation failed`)
      if (validationError instanceof z.ZodError) {
        const firstError = validationError.errors[0]
        console.error(`[CONTACT_API_ERROR:${requestId}] Validation error details:`)
        console.error(`[CONTACT_API_ERROR:${requestId}] - Path: ${firstError?.path?.join('.') || 'unknown'}`)
        console.error(`[CONTACT_API_ERROR:${requestId}] - Message: ${firstError?.message || 'Unknown error'}`)
        console.error(`[CONTACT_API_ERROR:${requestId}] - Code: ${firstError?.code || 'unknown'}`)
        return NextResponse.json(
          { 
            success: false,
            error: 'VALIDATION_ERROR',
            errorCode: 'SCHEMA_VALIDATION_FAILED',
            message: firstError?.message || 'Invalid form data'
          },
          { status: 400 }
        )
      }
      console.error(`[CONTACT_API_ERROR:${requestId}] Unexpected validation error:`)
      console.error(`[CONTACT_API_ERROR:${requestId}] Error: ${validationError?.message || 'Unknown'}`)
      console.error(`[CONTACT_API_ERROR:${requestId}] Stack: ${validationError?.stack || 'No stack trace'}`)
      throw validationError
    }

    // ============================================
    // STEP 7: SANITIZE INPUT
    // ============================================
    console.log(`[CONTACT_API:${requestId}] Sanitizing input...`)
    const name = validated.name.trim()
    const contactInfo = validated.contactInfo.trim()
    const message = validated.message.trim()
    console.log(`[CONTACT_API:${requestId}] Sanitized lengths - name: ${name.length}, contactInfo: ${contactInfo.length}, message: ${message.length}`)

    // ============================================
    // STEP 8: DATABASE OPERATION (WITH COMPREHENSIVE LOGGING)
    // ============================================
    console.log(`[CONTACT_API:${requestId}] Preparing database operation...`)
    console.log(`[CONTACT_API:${requestId}] MongoDB client ready: ${!!client}`)
    console.log(`[CONTACT_API:${requestId}] Data to save:`, {
      name: name.substring(0, 20),
      contactInfo: contactInfo.substring(0, 30),
      messageLength: message.length,
      status: 'new'
    })
    
    let savedMessage
    try {
      console.log(`[CONTACT_API:${requestId}] Calling saveContactMessage...`)
      
      savedMessage = await saveContactMessage({
        name,
        contactInfo,
        message,
        status: 'new',
      })
      
      console.log(`[CONTACT_API:${requestId}] ========== DATABASE SAVE SUCCESS ==========`)
      console.log(`[CONTACT_API:${requestId}] Saved message ID: ${savedMessage._id}`)
      console.log(`[CONTACT_API:${requestId}] Saved message name: ${savedMessage.name}`)
      console.log(`[CONTACT_API:${requestId}] Saved message createdAt: ${savedMessage.createdAt}`)
    } catch (dbError: any) {
      console.error(`[CONTACT_API_ERROR:${requestId}] ========== DATABASE SAVE FAILED ==========`)
      console.error(`[CONTACT_API_ERROR:${requestId}] Error name: ${dbError?.name || 'Unknown'}`)
      console.error(`[CONTACT_API_ERROR:${requestId}] Error message: ${dbError?.message || 'Unknown error'}`)
      console.error(`[CONTACT_API_ERROR:${requestId}] Error code: ${dbError?.code || 'No code'}`)
      console.error(`[CONTACT_API_ERROR:${requestId}] Full error stack:`)
      console.error(dbError?.stack || 'No stack trace available')
      
      // NEVER return success on failure
      return NextResponse.json(
        { 
          success: false,
          error: 'DATABASE_ERROR',
          errorCode: dbError?.code || 'UNKNOWN_DB_ERROR',
          message: 'Failed to save message. Please try again later.'
        },
        { status: 500 }
      )
    }

    // ============================================
    // STEP 9: EMAIL NOTIFICATION (OPTIONAL, NON-BLOCKING)
    // ============================================
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.CONTACT_EMAIL) {
      console.log(`[CONTACT_API:${requestId}] Sending email notification...`)
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
        console.log(`[CONTACT_API:${requestId}] Email notification sent successfully`)
      } catch (emailError: any) {
        // Log email error but don't fail the request
        console.error(`[CONTACT_API_ERROR:${requestId}] Email notification failed (non-critical):`)
        console.error(`[CONTACT_API_ERROR:${requestId}] Error: ${emailError?.message || 'Unknown'}`)
        console.error(`[CONTACT_API_ERROR:${requestId}] Stack: ${emailError?.stack || 'No stack trace'}`)
      }
    } else {
      console.log(`[CONTACT_API:${requestId}] Email notification skipped (SMTP not configured)`)
    }

    // ============================================
    // STEP 10: SUCCESS RESPONSE
    // ============================================
    console.log(`[CONTACT_API:${requestId}] ========== REQUEST SUCCESS ==========`)
    return NextResponse.json({ 
      success: true,
      message: 'Message sent successfully' 
    })
  } catch (error: any) {
    // ============================================
    // STEP 11: CATCH-ALL ERROR HANDLING
    // ============================================
    console.error(`[CONTACT_API_ERROR:${requestId}] ========== UNEXPECTED ERROR ==========`)
    console.error(`[CONTACT_API_ERROR:${requestId}] Error name: ${error?.name || 'Unknown'}`)
    console.error(`[CONTACT_API_ERROR:${requestId}] Error message: ${error?.message || 'Unknown error'}`)
    console.error(`[CONTACT_API_ERROR:${requestId}] Full error stack:`)
    console.error(error?.stack || 'No stack trace available')
    
    // Ensure we always return JSON
    return NextResponse.json(
      { 
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        errorCode: error?.code || 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred. Please try again later.'
      },
      { status: 500 }
    )
  }
}
