
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <img 
                src="/lovable-uploads/78a2d79c-a1fb-4c60-a0db-7800ea5d0fa0.png" 
                alt="QUEROX Logo" 
                className="h-10 w-auto mr-3"
              />
              <h3 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">QUEROX</h3>
            </div>
            <p className="text-gray-300 mb-4">
              La solution N°1 pour digitaliser et développer votre restaurant.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Solutions</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-300 hover:text-white transition-colors">Menus QR Code</a></li>
              <li><a href="#features" className="text-gray-300 hover:text-white transition-colors">Commandes en ligne</a></li>
              <li><a href="#features" className="text-gray-300 hover:text-white transition-colors">Gestion restaurant</a></li>
              <li><a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Tarifs</a></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Centre d'aide</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Tutoriels vidéo</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Formation gratuite</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact support</a></li>
            </ul>
          </div>
          
          {/* Contact & Newsletter */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <div className="space-y-3 mb-6">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-300">contact@querox.me</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-300">Support 24/7</span>
              </div>
            </div>
            
            <h5 className="font-semibold text-white mb-3">Newsletter</h5>
            <p className="text-gray-300 mb-4 text-sm">
              Conseils pour booster votre restaurant
            </p>
            <div className="flex flex-col space-y-3">
              <Input 
                type="email" 
                placeholder="Votre email"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                S'abonner
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2025 QUEROX. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Mentions légales</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Confidentialité</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">CGU</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
