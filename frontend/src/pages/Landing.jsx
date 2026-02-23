import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";
import logo from "../assets/logo_LibraFlow.png";

export default function Landing() {
  const { t, lang, toggleLang } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("login");
  const [scrolled, setScrolled] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/app/dashboard");
    }
  }, [user, navigate]);

  // Handle scroll for navbar transparency
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openModal = (mode) => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Features", href: "#features" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 scroll-smooth">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass py-3 shadow-md" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="LibraFlow Logo" className="h-10 w-auto" />
            <span className="font-bold text-xl tracking-tight text-slate-900">LibraFlow</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleLang} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              {lang === "fr" ? "🇬🇧 EN" : "🇫🇷 FR"}
            </button>
            <button 
              onClick={() => openModal("login")}
              className="px-5 py-2.5 text-sm font-semibold text-sky-600 hover:bg-sky-50 rounded-xl transition-all"
            >
              {t("login")}
            </button>
            <button 
              onClick={() => openModal("register")}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-600 rounded-xl shadow-md hover:shadow-lg hover:shadow-sky-200 transition-all transform hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-mesh">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 text-sky-600 text-xs font-bold uppercase tracking-widest mb-6 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            {t("intelligentSystem")}
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight animate-slide-up">
            Manage Your Library <br /> 
            <span className="text-gradient">With Intelligence</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
            The all-in-one solution for schools and businesses. Integrated AI assistant, real-time QR tracking, and a powerful catalog in one elegant platform.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <button 
              onClick={() => openModal("register")}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition-all transform hover:scale-105"
            >
              Start Free Trial
            </button>
            <a 
              href="#features"
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              Learn More
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>

        {/* Abstract shapes for hero background */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-sky-100 rounded-full blur-[100px] opacity-50" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[100px] opacity-40" />
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-sky-50 to-indigo-50 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center p-12">
                 <img src={logo} alt="LibraFlow Feature" className="w-full h-auto max-w-xs drop-shadow-2xl animate-float" />
              </div>
              <div className="absolute -bottom-6 -right-6 glass p-6 rounded-2xl shadow-xl max-w-xs animate-slide-up">
                <p className="text-sm font-bold text-slate-900 mb-1">99.9% Efficiency</p>
                <p className="text-xs text-slate-500">Manual library tracking is a thing of the past. Embrace the digital flow.</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
                Crafted for Modern <br /> Learning Environments
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                LibraFlow was born from the need for a simple yet powerful library management system. We combine advanced technology with human-centric design to make knowledge accessible and manageable.
              </p>
              <ul className="space-y-4">
                {[
                  "Real-time data synchronization",
                  "Cross-platform accessibility",
                  "Detailed analytics and reporting",
                  "Secure user management"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Powerful Features</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Everything you need to run a modern library, elevated by AI.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                title: "AI Librarian", 
                desc: "Intelligent recommendations and statistics analysis powered by top-tier AI models.", 
                icon: "✦", 
                color: "bg-sky-500" 
              },
              { 
                title: "QR Tracking", 
                desc: "Manage loans and returns instantly with built-in QR code scanning and generation.", 
                icon: "📷", 
                color: "bg-indigo-500" 
              },
              { 
                title: "Smart Catalog", 
                desc: "A beautiful, searchable index of all your resources with real-time availability tracking.", 
                icon: "📚", 
                color: "bg-emerald-500" 
              }
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-sky-100/50 transition-all group">
                <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center text-white text-xl mb-6 shadow-lg transform group-hover:rotate-6 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl text-center mx-auto">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Ready to Transform Your Library?</h2>
              <p className="text-slate-300 mb-10 text-lg">Join hundreds of institutions already using LibraFlow to simplify knowledge management.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => openModal("register")}
                  className="px-8 py-4 bg-sky-500 text-white rounded-2xl font-bold shadow-lg hover:bg-sky-600 transition-all"
                >
                  Create Account
                </button>
                <button className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-bold shadow-lg hover:bg-slate-700 transition-all">
                  Contact Sales
                </button>
              </div>
              
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-slate-400 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  support@libraflow.com
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Montreal, QC, Canada
                </div>
              </div>
            </div>
            
            {/* Visual flair for the dark section */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-sky-500 rounded-full blur-[160px] opacity-20" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500 rounded-full blur-[140px] opacity-20" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <img src={logo} alt="LibraFlow Logo" className="h-8 w-auto grayscale" />
            <span className="font-bold text-lg tracking-tight text-slate-400">LibraFlow</span>
          </div>
          <p className="text-sm text-slate-400">
            &copy; 2024 LibraFlow. Built for the future of library management.
          </p>
        </div>
      </footer>

      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialMode={modalMode} 
      />
    </div>
  );
}
