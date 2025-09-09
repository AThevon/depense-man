'use client';

import { Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/ibutton';
import { MonthlyItem, MonthlyCalculation } from '@/lib/types';
import { useState } from 'react';

interface FooterProps {
  items?: MonthlyItem[];
  calculation?: MonthlyCalculation;
}

const Footer = ({ items, calculation }: FooterProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyJSON = async () => {
    if (!items) {
      return;
    }

    // Créer l'objet d'export
    const exportData = {
      exportDate: new Date().toISOString(),
      totalItems: items.length,
      items: items,
      calculation: calculation,
      metadata: {
        appName: 'Dépense-Man',
        version: '1.0.0'
      }
    };

    // Convertir en JSON formaté
    const dataStr = JSON.stringify(exportData, null, 2);

    try {
      // Copier dans le presse-papiers
      await navigator.clipboard.writeText(dataStr);
      setIsCopied(true);
      
      // Réinitialiser l'état après 2 secondes
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  return (
    <footer className="mt-12 py-8 px-4 text-center text-sm text-muted-foreground border-t border-border">
      <div className="space-y-4">
        <h3>Dépense-Man</h3>
        {items && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyJSON}
            className={`text-muted-foreground hover:text-foreground transition-colors ${
              isCopied ? 'text-success border-success bg-success/10' : ''
            }`}
          >
            {isCopied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isCopied ? 'Copié !' : `Copier JSON (${items.length} éléments)`}
          </Button>
        )}
      </div>
    </footer>
  );
};

export default Footer; 