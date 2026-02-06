import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <span className="text-2xl font-bold text-white mb-4 block">EventHorizon</span>
            <p className="text-sm text-gray-400">
              Discover and book the best events in town. From music festivals to tech conferences, we have it all.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/explore" className="hover:text-indigo-400 transition-colors">Explore Events</a></li>
              <li><a href="/about" className="hover:text-indigo-400 transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-indigo-400 transition-colors">Contact</a></li>
              <li><a href="/faq" className="hover:text-indigo-400 transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2"><Mail size={16} /> support@eventhorizon.com</li>
              <li className="flex items-center gap-2"><Phone size={16} /> +977 9800000000</li>
              <li className="flex items-center gap-2"><MapPin size={16} /> Kathmandu, Nepal</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-indigo-400 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-indigo-400 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="hover:text-indigo-400 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="hover:text-indigo-400 transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} EventHorizon. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
