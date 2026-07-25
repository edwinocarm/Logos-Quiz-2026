import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  // Only protect the /admin route
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = req.headers.get('authorization');
    
    // We will store your secure password in your deployment environment variables
    const adminPassword = process.env.ADMIN_PASSWORD || "logos123"; // Default password for testing
    const expectedAuth = `Basic ${btoa(`admin:${adminPassword}`)}`;

    if (authHeader !== expectedAuth) {
      return new NextResponse('Unauthorized access', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Admin Area"',
        },
      });
    }
  }
  return NextResponse.next();
}