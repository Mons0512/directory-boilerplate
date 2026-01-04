// Authentication utility functions for admin access

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  expiresAt: number | null;
}

class AuthUtils {
  private static readonly STORAGE_KEY = 'admin_auth_state';
  private static readonly TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private static readonly ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'default_password'; // Default for development only

  /**
   * Login with password
   */
  public static login(password: string): boolean {
    // In a real app, this would be a secure API call
    // For this pure frontend app, we compare with environment variable
    if (password === this.ADMIN_PASSWORD) {
      const token = this.generateToken();
      const expiresAt = Date.now() + this.TOKEN_EXPIRY;
      
      const authState: AuthState = {
        isAuthenticated: true,
        token,
        expiresAt
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authState));
      return true;
    }
    return false;
  }

  /**
   * Logout
   */
  public static logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Check if user is authenticated
   */
  public static isAuthenticated(): boolean {
    const authState = this.getAuthState();
    if (!authState?.isAuthenticated || !authState.token) {
      return false;
    }
    
    // Check if token has expired
    if (authState.expiresAt && Date.now() > authState.expiresAt) {
      this.logout();
      return false;
    }
    
    return true;
  }

  /**
   * Get current auth state
   */
  public static getAuthState(): AuthState | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('Error getting auth state:', error);
      return null;
    }
  }

  /**
   * Generate a simple token (for demo purposes only)
   */
  private static generateToken(): string {
    // In a real app, this would be a secure JWT token
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    return btoa(String.fromCharCode(...randomBytes));
  }

  /**
   * Check if password is set in environment variables
   */
  public static isPasswordConfigured(): boolean {
    return this.ADMIN_PASSWORD !== 'default_password';
  }
}

export default AuthUtils;
