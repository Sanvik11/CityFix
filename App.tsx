import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Building2, PlusCircle, LayoutDashboard, Sparkles, Home, Shield, Menu, X, User as UserIcon } from "lucide-react";
import { Issue, User } from "./types";
import { seedIssues } from "./data/mockIssues";
import LandingPage from "./components/LandingPage";
import ReportPage from "./components/ReportPage";
import Dashboard from "./components/Dashboard";
import UserPortal from "./components/UserPortal";

export default function App() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<"home" | "report" | "dashboard" | "portal">("home");
  
  // Issues master state (synced with localStorage)
  const [issues, setIssues] = useState<Issue[]>([]);
  
  // Mobile navigation drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // User state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize current user state from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("cityfix_user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user:", e);
      }
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("cityfix_user", JSON.stringify(user));
    setActiveTab("portal");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("cityfix_user");
    setActiveTab("home");
  };
  
  // Initialize issues state from localStorage or fallback to seedIssues
  useEffect(() => {
    const savedIssues = localStorage.getItem("cityfix_issues");
    if (savedIssues) {
      try {
        setIssues(JSON.parse(savedIssues));
      } catch (e) {
        console.error("Failed to parse saved issues:", e);
        setIssues(seedIssues);
      }
    } else {
      setIssues(seedIssues);
      localStorage.setItem("cityfix_issues", JSON.stringify(seedIssues));
    }
  }, []);

  // Update issues state and synchronize with localStorage
  const handleAddIssue = (newIssue: Issue) => {
    const updated = [newIssue, ...issues];
    setIssues(updated);
    localStorage.setItem("cityfix_issues", JSON.stringify(updated));
  };

  const handleUpdateIssue = (updatedIssue: Issue) => {
    const updated = issues.map((issue) => (issue.id === updatedIssue.id ? updatedIssue : issue));
    setIssues(updated);
    localStorage.setItem("cityfix_issues", JSON.stringify(updated));
  };

  const handleDeleteIssue = (id: string) => {
    const updated = issues.filter((issue) => issue.id !== id);
    setIssues(updated);
    localStorage.setItem("cityfix_issues", JSON.stringify(updated));
  };

  const handleNavigate = (tab: "home" | "report" | "dashboard" | "portal") => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    // Smooth scroll back to top of the viewport when changing tabs
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-gradient-to-br from-slate-100 via-teal-50 to-blue-50 min-h-screen text-slate-800 flex flex-col font-sans antialiased" id="app-root">
      
      {/* GLOBAL HEADER / NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white/40 backdrop-blur-md border-b border-white/20 shadow-sm shrink-0" id="global-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo Brand */}
            <div 
              onClick={() => handleNavigate("home")} 
              className="flex items-center gap-2.5 cursor-pointer group shrink-0"
              id="brand-logo"
            >
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-103 transition-all duration-300">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-emerald-600 transition">
                  City<span className="text-emerald-600">Fix</span>
                </span>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  AI Civic Hub
                </span>
              </div>
            </div>

            {/* Desktop Nav Actions */}
            <nav className="hidden md:flex items-center gap-1" id="desktop-navigation">
              <button
                onClick={() => handleNavigate("home")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  activeTab === "home" 
                    ? "text-emerald-800 bg-white/50 border border-white/40 shadow-sm" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/20"
                }`}
              >
                <Home className="w-4 h-4 text-emerald-600" />
                Home
              </button>
              
              <button
                onClick={() => handleNavigate("report")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  activeTab === "report" 
                    ? "text-emerald-800 bg-white/50 border border-white/40 shadow-sm" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/20"
                }`}
                id="nav-report"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                Report Issue
              </button>

              <button
                onClick={() => handleNavigate("dashboard")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  activeTab === "dashboard" 
                    ? "text-emerald-800 bg-white/50 border border-white/40 shadow-sm" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/20"
                }`}
                id="nav-dashboard"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                Dashboard & Analytics
              </button>
            </nav>

            {/* Desktop Secondary Action */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => handleNavigate("portal")}
                className={`inline-flex items-center gap-1.5 backdrop-blur-md border text-[11px] font-bold px-3.5 py-2 rounded-full shadow-sm transition active:scale-95 cursor-pointer ${
                  currentUser 
                    ? "bg-emerald-600 border-emerald-600 text-white" 
                    : activeTab === "portal"
                      ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                      : "bg-white/60 hover:bg-white/95 border-white/40 text-emerald-800"
                }`}
                id="header-secure-portal-btn"
              >
                {currentUser ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse shrink-0" />
                    Hi, {currentUser.fullName.split(" ")[0]} 👤
                  </>
                ) : (
                  <>
                    <Shield className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500/10 shrink-0" />
                    Secure Portal
                  </>
                )}
              </button>
            </div>

            {/* Mobile Hamburger toggle */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white/30 transition focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* MOBILE NAV DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/80 backdrop-blur-xl border-b border-white/40 shadow-inner overflow-hidden shrink-0 z-30 sticky top-16"
            id="mobile-nav-drawer"
          >
            <div className="px-4 pt-2 pb-5 space-y-2">
              <button
                onClick={() => handleNavigate("home")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
                  activeTab === "home" 
                    ? "text-emerald-800 bg-white border border-white/50" 
                    : "text-slate-600 hover:text-slate-800 hover:bg-white/30"
                }`}
              >
                <Home className="w-4.5 h-4.5 text-emerald-600" />
                Home
              </button>
              
              <button
                onClick={() => handleNavigate("report")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
                  activeTab === "report" 
                    ? "text-emerald-800 bg-white border border-white/50" 
                    : "text-slate-600 hover:text-slate-800 hover:bg-white/30"
                }`}
              >
                <PlusCircle className="w-4.5 h-4.5 text-emerald-600" />
                Report Issue
              </button>

              <button
                onClick={() => handleNavigate("dashboard")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
                  activeTab === "dashboard" 
                    ? "text-emerald-800 bg-white border border-white/50" 
                    : "text-slate-600 hover:text-slate-800 hover:bg-white/30"
                }`}
              >
                <LayoutDashboard className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                Dashboard & Analytics
              </button>

              <button
                onClick={() => handleNavigate("portal")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
                  activeTab === "portal" 
                    ? "text-emerald-800 bg-white border border-white/50" 
                    : "text-slate-600 hover:text-slate-800 hover:bg-white/30"
                }`}
              >
                <Shield className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                {currentUser ? `Portal (${currentUser.fullName.split(" ")[0]})` : "Secure Portal"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA WITH ROUTE TRANSITIONS */}
      <main className="flex-1 shrink-0" id="app-main-content">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <LandingPage onNavigate={handleNavigate} issuesCount={issues.length} />
            </motion.div>
          )}

          {activeTab === "report" && (
            <motion.div
              key="report-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <ReportPage onAddIssue={handleAddIssue} onNavigate={handleNavigate} currentUser={currentUser} />
            </motion.div>
          )}

          {activeTab === "portal" && (
            <motion.div
              key="portal-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <UserPortal 
                currentUser={currentUser} 
                onLogin={handleLogin} 
                onLogout={handleLogout} 
                issues={issues}
                onNavigate={handleNavigate}
              />
            </motion.div>
          )}

          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <Dashboard 
                issues={issues} 
                onUpdateIssue={handleUpdateIssue} 
                onDeleteIssue={handleDeleteIssue}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* GLOBAL FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-800 shrink-0 mt-auto" id="global-footer">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white">
            <Building2 className="w-5 h-5 text-teal-400" />
            <span className="font-extrabold text-sm tracking-tight">
              City<span className="text-teal-400">Fix</span>
            </span>
            <span className="text-xs text-slate-500">© 2026. Empowering Citizens.</span>
          </div>

          <div className="flex flex-wrap gap-4 md:gap-8 justify-center text-xs font-semibold text-slate-500">
            <button onClick={() => handleNavigate("home")} className="hover:text-slate-300 transition">Features</button>
            <button onClick={() => handleNavigate("report")} className="hover:text-slate-300 transition">Reporting</button>
            <button onClick={() => handleNavigate("dashboard")} className="hover:text-slate-300 transition">Registry</button>
            <a href="https://ai.studio" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-400 fill-teal-400/20" /> Powered by Gemini
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
