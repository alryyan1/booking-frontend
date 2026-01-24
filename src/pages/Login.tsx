import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, User, Lock, AlertCircle, Loader2, Heart, Sparkles, Flower2 } from 'lucide-react';
import heroImage from '../assets/login_hero_background.png';
import { bookingsAPI } from '../services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Test function to check API connectivity
  const testBookingsAPI = async () => {
    try {
      setTestResult('Testing API...');
      const response = await bookingsAPI.getAll();
      setTestResult(`✅ Success! Got ${response.data.data?.length || 0} bookings`);
      console.log('Bookings response:', response.data);
    } catch (err) {
      setTestResult(`❌ Error: ${err.response?.data?.message || err.message}`);
      console.error('Bookings error:', err);
    }
  };

  // Floating decorative elements
  const FloatingOrb = ({ delay = 0, duration = 4, className = "" }) => (
    <motion.div
      animate={{
        y: [0, -20, 0],
        opacity: [0.3, 0.5, 0.3],
        scale: [1, 1.1, 1],
      }}
      transition={{
        repeat: Infinity,
        duration,
        delay,
        ease: "easeInOut"
      }}
      className={className}
    />
  );

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 overflow-hidden relative font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap');
        
        .font-serif-display {
          font-family: 'Playfair Display', serif;
        }
        .font-body {
          font-family: 'Lato', sans-serif;
        }
      `}</style>

      {/* Decorative Background Elements */}
      <FloatingOrb 
        delay={0} 
        duration={6}
        className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-pink-200/30 to-rose-300/30 rounded-full blur-3xl" 
      />
      <FloatingOrb 
        delay={2} 
        duration={8}
        className="absolute bottom-32 left-20 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl" 
      />
      
      {/* Floral Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
        }} 
      />

      {/* Left Side: Hero Image & Branding */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-rose-400 via-pink-400 to-purple-500 overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/70 via-pink-500/60 to-purple-600/60 mix-blend-multiply" />
          
          {/* Decorative floating hearts/flowers */}
          <motion.div
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              rotate: [0, 10, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 7,
              ease: "easeInOut"
            }}
            className="absolute top-20 right-20 text-white/20"
          >
            <Heart className="w-20 h-20" fill="currentColor" />
          </motion.div>
          
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, -15, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 9,
              delay: 1,
              ease: "easeInOut"
            }}
            className="absolute bottom-40 right-40 text-white/15"
          >
            <Flower2 className="w-16 h-16" />
          </motion.div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white h-full">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-full">
                <Heart className="w-8 h-8 text-rose-100" fill="currentColor" />
              </div>
              <span className="text-xl font-serif-display tracking-widest uppercase text-rose-100">Beauty &amp; Grace</span>
            </div>
            
            <h1 className="text-6xl font-serif-display font-medium tracking-tight mb-8 leading-tight">
              Welcome to Your <br />
              <span className="bg-gradient-to-r from-white to-rose-200 bg-clip-text text-transparent italic">
                Sanctuary
              </span>
            </h1>
            <p className="text-xl text-rose-50 max-w-md leading-relaxed font-body font-light tracking-wide">
              Manage your bookings with elegance. Use this beautiful space to organize your schedule effortlessly and with style.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-16 flex items-center space-x-4 text-rose-100/70 text-sm font-body"
          >
            <div className="w-16 h-px bg-rose-200/40" />
            <span className="italic tracking-widest uppercase text-xs">Crafted with love for you</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Glassmorphic Card */}
          <div className="bg-white/60 backdrop-blur-2xl rounded-[3rem] shadow-xl shadow-rose-200/40 p-10 border border-white/80 relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-300 via-pink-400 to-purple-400 opacity-60" />

            <div className="text-center mb-10 relative">
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut"
                }}
                className="inline-block mb-3"
              >
                <div className="w-16 h-16 bg-gradient-to-tr from-rose-100 to-pink-100 rounded-full flex items-center justify-center shadow-inner shadow-white">
                  <Sparkles className="w-7 h-7 text-rose-400" />
                </div>
              </motion.div>
              
              <h2 className="text-4xl font-serif-display text-gray-800 mb-2">
                Hello, Beautiful
              </h2>
              <p className="text-gray-500 font-body font-light">Please sign in to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start space-x-3"
                  >
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-rose-700 font-medium">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-5">
                <motion.div 
                  whileFocus={{ scale: 1.02 }}
                  className="relative group"
                >
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-3 transition-colors group-focus-within:text-rose-500">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-rose-500 text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      required
                      className="w-full pl-12 pr-6 py-4 bg-white/70 border border-pink-100 rounded-full focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all text-gray-800 placeholder-gray-400 font-body shadow-sm hover:bg-white"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </motion.div>

                <motion.div 
                  whileFocus={{ scale: 1.02 }}
                  className="relative group"
                >
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-3 transition-colors group-focus-within:text-rose-500">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-rose-500 text-gray-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      required
                      className="w-full pl-12 pr-6 py-4 bg-white/70 border border-pink-100 rounded-full focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all text-gray-800 placeholder-gray-400 font-body shadow-sm hover:bg-white"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </motion.div>
              </div>

              <div className="flex items-center justify-between text-sm px-2">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-pink-300 transition-all checked:border-rose-500 checked:bg-rose-500 hover:border-rose-400" 
                    />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <span className="text-gray-500 group-hover:text-rose-600 transition-colors font-medium">
                    Remember me
                  </span>
                </label>
                <a 
                  href="#" 
                  className="font-semibold text-rose-500 hover:text-rose-600 transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <motion.button
                whileHover={{ scale: 1.03, y: -2, boxShadow: "0 10px 25px -5px rgba(244, 63, 94, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-bold tracking-wide rounded-full shadow-lg shadow-pink-300/50 focus:outline-none focus:ring-4 focus:ring-pink-200 transition-all disabled:opacity-70 flex items-center justify-center space-x-2 group mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span className="font-serif-display text-lg">Sign In</span>
                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            {/* API Test Section */}
            <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <button
                onClick={testBookingsAPI}
                className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full transition-all text-sm"
              >
                🧪 Test API Connection (Fetch Bookings)
              </button>
              {testResult && (
                <div className="mt-3 p-3 bg-white rounded-xl border border-gray-200 text-sm font-mono text-gray-700">
                  {testResult}
                </div>
              )}
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm font-light">
                Don't have an account?{' '}
                <a 
                  href="#" 
                  className="font-bold text-rose-500 hover:text-rose-600 hover:underline decoration-2 underline-offset-4 transition-all"
                >
                  Contact Administrator
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

