import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({
    req,
    res,
  });

  // Use getUser() to authenticate the user
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Authentication error:', error);
    // You can handle redirection or other error responses here if needed
    return NextResponse.redirect('/login');
  }

  // If user is authenticated, proceed
  return res;
}
