/**
 * Authentication utility functions for handling redirects and URL parameters
 */

/**
 * Get the redirect URL from query parameters
 */
export function getRedirectUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('redirect') || urlParams.get('returnUrl');
}

/**
 * Set the redirect URL as a query parameter
 */
export function setRedirectUrl(path: string): string {
  const params = new URLSearchParams();
  params.set('redirect', path);
  return `?${params.toString()}`;
}

/**
 * Validate if a redirect path is safe to prevent open redirect attacks
 */
export function isValidRedirectPath(path: string): boolean {
  const validPaths = [
    '/',
    '/dashboard',
    '/income', 
    '/expenses', 
    '/assets', 
    '/accounts',
    '/bills', 
    '/reports'
  ];
  
  // Check if path is in valid paths or starts with a valid path followed by query params
  return validPaths.some(validPath => 
    path === validPath || path.startsWith(validPath + '?')
  );
}

/**
 * Get the final redirect destination after login
 */
export function getFinalRedirectPath(): string {
  const redirectTo = getRedirectUrl();
  
  if (redirectTo && isValidRedirectPath(redirectTo)) {
    return redirectTo;
  }
  
  return '/'; // Default to dashboard
}

/**
 * Create login URL with redirect parameter
 */
export function createLoginUrl(currentPath: string): string {
  if (currentPath === '/' || !currentPath) {
    return '/auth'; // No need to add redirect for home page
  }
  
  return `/auth${setRedirectUrl(currentPath)}`;
}