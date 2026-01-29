import { NextResponse } from 'next/server'
import { getContactMessages, updateMessageStatus, deleteContactMessage } from '@/lib/models'

export async function GET() {
  try {
    const messages = await getContactMessages(100)
    
    return NextResponse.json({ 
      success: true, 
      messages: messages.map(msg => ({
        id: msg._id?.toString(),
        name: msg.name,
        contactInfo: msg.contactInfo,
        message: msg.message,
        status: msg.status,
        createdAt: msg.createdAt,
      }))
    })
  } catch (error: any) {
    console.error('[ADMIN_MESSAGES_ERROR]:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch messages',
        message: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    // Safely parse request body
    let body: any
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('[ADMIN_MESSAGES_ERROR] Failed to parse request body:', parseError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request format',
          message: 'Request body must be valid JSON'
        },
        { status: 400 }
      )
    }

    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          message: 'Missing required fields: id and status' 
        },
        { status: 400 }
      )
    }

    if (status !== 'new' && status !== 'read') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid status',
          message: 'Invalid status. Must be "new" or "read"' 
        },
        { status: 400 }
      )
    }

    await updateMessageStatus(id, status)

    return NextResponse.json({ success: true, message: 'Message status updated' })
  } catch (error: any) {
    console.error('[ADMIN_MESSAGES_ERROR]:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update message',
        message: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required parameter',
          message: 'Missing required parameter: id' 
        },
        { status: 400 }
      )
    }

    await deleteContactMessage(id)

    return NextResponse.json({ success: true, message: 'Message deleted' })
  } catch (error: any) {
    console.error('[ADMIN_MESSAGES_ERROR]:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete message',
        message: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}


