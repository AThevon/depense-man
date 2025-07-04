import { useState } from 'react';
import { 
  Home, Car, Utensils, ShoppingCart, Gamepad2, Coffee, 
  CreditCard, Phone, Wifi, Zap, Droplets, Heart, 
  Briefcase, GraduationCap, TrendingUp, Gift, 
  Banknote, Wallet, PiggyBank, TrendingDown,
  Search, X,
  ChevronLeft
} from 'lucide-react';
import { IconOption } from '@/lib/types';

interface IconSelectorProps {
  selectedIcon?: string;
  onIconSelect: (iconName: string) => void;
  className?: string;
}

export const AVAILABLE_ICONS: IconOption[] = [
  // Dépenses
  { name: 'home', icon: Home, category: 'expense' },
  { name: 'car', icon: Car, category: 'expense' },
  { name: 'utensils', icon: Utensils, category: 'expense' },
  { name: 'shopping-cart', icon: ShoppingCart, category: 'expense' },
  { name: 'gamepad-2', icon: Gamepad2, category: 'expense' },
  { name: 'coffee', icon: Coffee, category: 'expense' },
  { name: 'credit-card', icon: CreditCard, category: 'expense' },
  { name: 'phone', icon: Phone, category: 'expense' },
  { name: 'wifi', icon: Wifi, category: 'expense' },
  { name: 'zap', icon: Zap, category: 'expense' },
  { name: 'droplets', icon: Droplets, category: 'expense' },
  { name: 'heart', icon: Heart, category: 'expense' },
  { name: 'graduation-cap', icon: GraduationCap, category: 'expense' },
  { name: 'trending-down', icon: TrendingDown, category: 'expense' },

  // Entrées
  { name: 'briefcase', icon: Briefcase, category: 'income' },
  { name: 'trending-up', icon: TrendingUp, category: 'income' },
  { name: 'gift', icon: Gift, category: 'income' },
  { name: 'banknote', icon: Banknote, category: 'income' },
  { name: 'wallet', icon: Wallet, category: 'income' },
  { name: 'piggy-bank', icon: PiggyBank, category: 'income' },
];

const IconSelector = ({ selectedIcon, onIconSelect, className = '' }: IconSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'income' | 'expense'>('all');

  const filteredIcons = AVAILABLE_ICONS.filter(icon => {
    const matchesSearch = icon.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || icon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedIconData = AVAILABLE_ICONS.find(icon => icon.name === selectedIcon);

  const handleIconSelect = (iconName: string) => {
    onIconSelect(iconName);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-text mb-2">
        Icône
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-surface border border-default rounded-lg hover:bg-surface-elevated transition-colors"
      >
        <div className="flex items-center space-x-2">
          {selectedIconData ? (
            <>
              <selectedIconData.icon className="h-5 w-5 text-primary" />
              <span className="text-text">{selectedIconData.name}</span>
            </>
          ) : (
            <span className="text-secondary">Choisir une icône</span>
          )}
        </div>
        <div className="h-5 w-5 text-secondary">
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface-elevated border border-light rounded-lg shadow-lg z-[60] max-h-[60vh] md:max-h-80 overflow-hidden">
          <div className="p-2 md:p-3 border-b border-default space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" />
              <input
                type="text"
                placeholder="Rechercher une icône..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface border border-default rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'all' 
                    ? 'bg-primary text-white' 
                    : 'bg-surface text-secondary hover:bg-surface-elevated'
                }`}
              >
                Tous
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('income')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'income' 
                    ? 'bg-primary text-white' 
                    : 'bg-surface text-secondary hover:bg-surface-elevated'
                }`}
              >
                Revenus
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('expense')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'expense' 
                    ? 'bg-primary text-white' 
                    : 'bg-surface text-secondary hover:bg-surface-elevated'
                }`}
              >
                Dépenses
              </button>
            </div>
          </div>
          
          <div className="p-2 md:p-3 max-h-48 md:max-h-60 overflow-y-auto">
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {filteredIcons.map((icon) => (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => handleIconSelect(icon.name)}
                  className={`p-2 md:p-3 rounded-lg border transition-all duration-200 hover:scale-105 ${
                    selectedIcon === icon.name
                      ? 'border-primary bg-primary/10'
                      : 'border-default hover:border-primary hover:bg-surface'
                  }`}
                  title={icon.name}
                >
                  <icon.icon className={`h-5 w-5 md:h-6 md:w-6 mx-auto ${
                    selectedIcon === icon.name ? 'text-primary' : 'text-text'
                  }`} />
                </button>
              ))}
            </div>
            
            {filteredIcons.length === 0 && (
              <div className="text-center py-8 text-secondary">
                Aucune icône trouvée
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconSelector; 