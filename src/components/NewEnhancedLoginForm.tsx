import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Eye, EyeOff, Mail, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import '@/styles/enhanced-login.css';

// Health and wellness images for the carousel
const carouselImages = [
  {
    url: '/wellness-1.jpg',
    title: 'Smart Fitness Tracking',
    quote: 'Transform your wellness journey with AI-powered insights'
  },
  {
    url: '/wellness-2.jpg',
    title: 'Personalized Nutrition',
    quote: 'Your path to optimal health, guided by intelligence'
  },
  {
    url: '/wellness-3.jpg',
    title: 'Mindful Meditation',
    quote: 'Balance mind and body with data-driven wellness'
  }
];

interface EnhancedLoginFormProps {
  onLogin: (email: string, password: string) => void;
  onSignUp: () => void;
}

export default function EnhancedLoginForm({ onLogin, onSignUp }: EnhancedLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      onLogin(email, password);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-gradient-to-br from-background to-wellness-blue/5">
      {/* Carousel Section */}
      <div className="lg:w-1/2 relative overflow-hidden lg:min-h-screen">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-wellness-blue/20 to-transparent z-10" />
            <div className="absolute inset-0 bg-neural-pattern opacity-20 z-20" />
            <img
              src={carouselImages[currentSlide].url}
              alt={carouselImages[currentSlide].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent z-30">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white text-2xl font-bold mb-2"
              >
                {carouselImages[currentSlide].title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white/90"
              >
                {carouselImages[currentSlide].quote}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Controls */}
        <div className="absolute top-1/2 -translate-y-1/2 flex justify-between w-full px-4 z-40">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)}
            className="p-2 rounded-full bg-black/20 backdrop-blur text-white hover:bg-black/40 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % carouselImages.length)}
            className="p-2 rounded-full bg-black/20 backdrop-blur text-white hover:bg-black/40 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-24 left-0 right-0 flex justify-center gap-2 z-40">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === index
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Login Form Section */}
      <div className="lg:w-1/2 flex flex-col justify-center p-8 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-auto"
        >
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-wellness-blue rounded-2xl mb-4 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-neural-pattern opacity-20" />
              <Heart className="w-8 h-8 text-white fill-current relative z-10" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-wellness-blue to-blue-600 bg-clip-text text-transparent">
              Vita Navigator
            </h1>
            <p className="text-muted-foreground mt-2">
              Your AI-Powered Wellness Journey
            </p>
          </div>

          {/* Login Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Email Input */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-wellness-blue transition-colors" />
              <input
                type="email"
                placeholder="Email or Phone"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-input bg-white/5 backdrop-blur-sm 
                          focus:border-wellness-blue focus:ring-1 focus:ring-wellness-blue transition-all
                          hover:bg-white/10"
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-wellness-blue transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-12 pr-12 rounded-xl border border-input bg-white/5 backdrop-blur-sm 
                          focus:border-wellness-blue focus:ring-1 focus:ring-wellness-blue transition-all
                          hover:bg-white/10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground 
                          hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded border-input bg-white/5 text-wellness-blue focus:ring-wellness-blue"
                />
                <label htmlFor="remember" className="ml-2 text-sm">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="text-wellness-blue text-sm hover:underline focus:outline-none"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full h-12 bg-gradient-to-r from-wellness-blue to-blue-600 text-white rounded-xl
                        font-medium shadow-lg shadow-wellness-blue/25 hover:shadow-wellness-blue/40
                        focus:outline-none focus:ring-2 focus:ring-wellness-blue focus:ring-offset-2
                        disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </motion.button>

            {/* Social Login */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-input"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="flex items-center justify-center h-12 rounded-xl border border-input
                          bg-white/5 hover:bg-white/10 transition-all"
              >
                <img src="/google.svg" alt="Google" className="w-5 h-5 mr-2" />
                Google
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="flex items-center justify-center h-12 rounded-xl border border-input
                          bg-white/5 hover:bg-white/10 transition-all"
              >
                <img src="/apple.svg" alt="Apple" className="w-5 h-5 mr-2" />
                Apple
              </motion.button>
            </div>
          </motion.form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Not a member?{" "}
            <button
              onClick={onSignUp}
              className="text-wellness-blue font-medium hover:underline focus:outline-none"
            >
              Start your wellness journey
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}