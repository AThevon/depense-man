'use client';

import { Github, Heart, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';
import { MonthlyItem, MonthlyCalculation } from '@/lib/types';
import { motion } from 'motion/react';

interface FooterProps {
  items?: MonthlyItem[];
  calculation?: MonthlyCalculation;
}

const Footer = ({ items, calculation }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-0 border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <motion.div
            className="space-y-4 md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold text-foreground font-display">
                Dépense-Man
              </h3>
            </div>
          </motion.div>


          {/* Stats */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Statistiques
            </h4>
            {items && calculation ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Éléments totaux</span>
                  <span className="font-bold text-primary">{items.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Revenus</span>
                  <span className="font-bold text-success">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                      minimumFractionDigits: 0,
                    }).format(calculation.totalIncome)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Dépenses</span>
                  <span className="font-bold text-destructive">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                      minimumFractionDigits: 0,
                    }).format(calculation.totalExpenses)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Connectez-vous pour voir vos statistiques
              </p>
            )}
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          className="pt-8 border-t border-border"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>© {currentYear} Dépense-Man</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-xs">v1.0.0</span>
            </div>

            <div className="flex items-center space-x-4">
              <motion.a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Github className="h-5 w-5" />
              </motion.a>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>Vers l&apos;infini</span>
                <Sparkles className="h-3 w-3 text-primary" />
                <span>money</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer; 