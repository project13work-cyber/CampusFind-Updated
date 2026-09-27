import React from 'react';
import Logo from './Logo';
import { ShieldCheck, MapPin, Phone, Mail, Clock, ArrowRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-[#0b0f19] text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <Logo textClass="text-xl text-white" badgeClass="text-cyan-400" />
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Official Digital Lost & Found System for our college campus. Empowering students, faculty, and campus security with precision similarity matching.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Campus Security Verified Network</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">Home & Live Feed</Link>
              </li>
              <li>
                <Link to="/search" className="text-slate-400 hover:text-white transition-colors">Search Lost & Found Catalog</Link>
              </li>
              <li>
                <Link to="/report-lost" className="text-slate-400 hover:text-white transition-colors">Report Lost Belonging</Link>
              </li>
              <li>
                <Link to="/report-found" className="text-slate-400 hover:text-white transition-colors">Report Found Belonging</Link>
              </li>
              <li>
                <Link to="/my-reports" className="text-slate-400 hover:text-white transition-colors">Track Reports & Verification Claims</Link>
              </li>
            </ul>
          </div>

          {/* Featured Campus Spots */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Featured Campus Spots</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>College Canteen & Food Court</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Central Library & Study Halls</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Computer Center Labs 1 & 2</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Main Auditorium & Plaza</span>
              </li>
            </ul>
          </div>

          {/* Security Desk Hotline Box */}
          <div className="bg-slate-800/60 p-5 rounded-3xl border border-slate-700/60 space-y-3 backdrop-blur-md">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>Campus Security Desk</span>
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              For urgent reports or physical collection of verified items:
            </p>
            <div className="space-y-1">
              <p className="text-xs font-bold text-white">
                Ground Floor, Main Gate 1
              </p>
              <p className="text-xs text-cyan-300 font-mono font-bold">
                Hotline: +91 98765 43210
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1 border-t border-slate-700/50">
              <Clock className="w-3.5 h-3.5" />
              <span>Mon - Sat: 8:00 AM - 8:00 PM</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>© 2026 CampusFind — Digital Lost & Found System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for College Campus Community • Privacy & Identity Protected
          </p>
        </div>
      </div>
    </footer>
  );
}
