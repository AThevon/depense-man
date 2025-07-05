'use client';

import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-12 py-8 px-4 text-center text-sm text-secondary border-t border-default">
      <div className="flex items-center justify-center gap-2">
        <span>Fait avec</span>
        <Heart className="h-4 w-4 text-red-500" />
        <span>pour gérer vos finances</span>
      </div>
    </footer>
  );
};

export default Footer; 