import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { useAuth } from "@/contexts/auth-context";
import { getFinalRedirectPath } from "@/lib/auth-utils";
import { Wallet, TrendingUp, Shield, Bell } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users away from auth page
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = getFinalRedirectPath();
      setLocation(redirectPath);
    }
  }, [isAuthenticated, setLocation]);

  const handleAuthSuccess = (user: any) => {
    login(user);
    
    // Get the final redirect path (validates and defaults to dashboard)
    const redirectPath = getFinalRedirectPath();
    setLocation(redirectPath);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="text-center lg:text-left space-y-6">
          <div className="flex items-center justify-center lg:justify-start space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              SpendTrack
            </h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              Master Your
              <span className="text-blue-600 block">Financial Journey</span>
            </h2>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-lg">
              Track expenses, manage assets, and get timely bill reminders with 
              Indian Financial Year reporting and smart notifications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Smart Analytics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Indian FY reports</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <Bell className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Bill Reminders</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email & SMS alerts</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <Shield className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Secure & Private</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your data protected</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <Wallet className="h-8 w-8 text-orange-500" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Indian Currency</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">₹ Rupee formatting</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="flex justify-center">
          {isLogin ? (
            <LoginForm onSuccess={handleAuthSuccess} onToggleMode={toggleMode} />
          ) : (
            <RegisterForm onSuccess={handleAuthSuccess} onToggleMode={toggleMode} />
          )}
        </div>
      </div>
    </div>
  );
}