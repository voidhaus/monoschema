import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('cms_session');
    
    return NextResponse.json({
      hasCookie: !!sessionCookie,
      cookieValue: sessionCookie?.value ? 'present' : 'missing',
      cookieLength: sessionCookie?.value?.length || 0,
      allCookies: Array.from(cookieStore.getAll()).map(c => ({ name: c.name, hasValue: !!c.value }))
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
