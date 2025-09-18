import React, { useState } from 'react';
import { Heart, Eye, EyeOff, Mail, Lock, Chrome, Smartphone, ArrowRight } from 'lucide-react';

interface EnhancedLoginFormProps {
  onLogin: (email: string, password: string) => void;
  onSignUp: () => void;
  onSocialLogin: (provider: 'google' | 'apple') => void;
}

export const EnhancedLoginForm = ({ onLogin, onSignUp, onSocialLogin }: EnhancedLoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      onLogin(email, password);
      setIsLoading(false);
    }, 1000);
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    setIsLoading(true);
    setTimeout(() => {
      onSocialLogin(provider);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-green/10 via-soft-blue/5 to-lavender/10 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sage-green to-soft-blue rounded-full mb-6 shadow-lg">
            <div className="wellness-compass-icon text-2xl">
              🧘‍♀️
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vita Navigator</h1>
          <p className="text-lg text-sage-green font-medium">Your Wellness Journey</p>
        </div>

        {/* Motivational Tagline */}
        <div className="text-center mb-8 max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Transform Your Life, One Day at a Time
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Personalized wellness plans designed for your unique journey towards better health, mindfulness, and balance.
          </p>
        </div>

        {/* Login Form Container */}
        <div className="w-full max-w-md">
          
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 shadow-sm"
            >
              <Chrome className="w-5 h-5" />
              Continue with Google
            </button>
            
            <button
              onClick={() => handleSocialLogin('apple')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-black text-white rounded-2xl font-medium hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 shadow-sm"
            >
              <Smartphone className="w-5 h-5" />
              Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-sage-green/10 via-soft-blue/5 to-lavender/10 text-gray-500 font-medium">
                Or continue with {loginType}
              </span>
            </div>
          </div>

          {/* Login Type Toggle */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            <button
              onClick={() => setLoginType('email')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                loginType === 'email' 
                  ? 'bg-white text-sage-green shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setLoginType('phone')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                loginType === 'phone' 
                  ? 'bg-white text-sage-green shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Phone
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email/Phone Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type={loginType === 'email' ? 'email' : 'tel'}
                placeholder={loginType === 'email' ? 'Enter your email' : 'Enter your phone number'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-800 placeholder:text-gray-500 focus:border-sage-green focus:ring-4 focus:ring-sage-green/20 focus:outline-none transition-all duration-200"
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-14 py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-800 placeholder:text-gray-500 focus:border-sage-green focus:ring-4 focus:ring-sage-green/20 focus:outline-none transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-sage-green font-medium hover:text-sage-green-dark transition-colors duration-200"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-gradient-to-r from-sage-green to-soft-blue text-white font-semibold py-4 px-6 rounded-2xl hover:from-sage-green-dark hover:to-soft-blue-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sign Up Link */}
        <div className="mt-8 text-center">
          <span className="text-gray-600">New to Vita Navigator? </span>
          <button
            onClick={onSignUp}
            className="text-sage-green font-semibold hover:text-sage-green-dark transition-colors duration-200"
          >
            Create Account
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-6 text-center">
        <p className="text-sm text-gray-500">
          By continuing, you agree to our{' '}
          <button className="text-sage-green hover:underline">Terms of Service</button>
          {' '}and{' '}
          <button className="text-sage-green hover:underline">Privacy Policy</button>
        </p>
      </div>
    </div>
  );
};