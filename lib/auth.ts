// lib/auth.ts
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Session } from 'next-auth';

// Hook to redirect if not authenticated
export function useAuthRedirect(redirectTo = '/auth/signin') {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(redirectTo);
    }
  }, [status, router, redirectTo]);

  return { session, status };
}

// Hook to check if user is an admin
export function useAdminCheck(redirectTo = '/unauthorized') {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push(redirectTo);
    }
  }, [status, session, router, redirectTo]);

  return { session, status, isAdmin: session?.user?.role === 'ADMIN' };
}

// HOC to protect pages that require authentication
export function withAuth<P>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { session, status } = useAuthRedirect();

    if (status === 'loading') {
      return <div>Loading...</div>;
    }

    if (!session) {
      return null; // Will redirect in useEffect
    }

    return <Component {...props} />;
  };
}

// HOC to protect admin-only pages
export function withAdmin<P>(Component: React.ComponentType<P>) {
  return function AdminComponent(props: P) {
    const { session, status, isAdmin } = useAdminCheck();

    if (status === 'loading') {
      return <div>Loading...</div>;
    }

    if (!session || !isAdmin) {
      return null; // Will redirect in useEffect
    }

    return <Component {...props} />;
  };
}
