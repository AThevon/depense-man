import { useState } from 'react';
import { 
  // Maison & Logement
  Home, Building, Key, Bed, Sofa, Lightbulb, Thermometer, Shield, Hammer, PaintBucket, 
  Armchair, Bath, Fence, Heater, Lamp, Wrench, Drill, Flashlight,
  
  // Transport
  Car, Plane, Train, Bus, Bike, Ship, Fuel, MapPin, Compass, 
  Truck, PlaneTakeoff, PlaneLanding, Navigation, Anchor,
  
  // Nourriture & Restaurants
  Utensils, Coffee, Pizza, Apple, ChefHat, Wine, Cake, 
  Fish, Beef, Milk, Cherry,
  
  // Shopping
  ShoppingCart, ShoppingBag, Store, Tag, Package, Gift, Shirt, Gem,
  Receipt, Ticket, ShoppingBasket, Watch, Glasses, Crown,
  
  // Technologie
  Laptop, Phone, Tablet, Headphones, Camera, Monitor, Printer, Router, Gamepad, Tv,
  Mouse, Keyboard, Cpu, HardDrive, Battery, Bluetooth, Speaker,
  
  // Santé & Sport
  Heart, Activity, Dumbbell, Stethoscope, Pill, Eye, Smile,
  Footprints, Bandage, Syringe,
  
  // Finance
  CreditCard, Banknote, Wallet, PiggyBank, TrendingUp, TrendingDown, DollarSign, Euro, Calculator,
  Coins, Landmark, HandCoins,
  
  // Travail & Éducation
  Briefcase, GraduationCap, BookOpen, Pen, FileText, Building2, Users, Calendar,
  Ruler, Scissors, Paperclip, Notebook, Badge, Award, Trophy,
  
  // Loisirs & Divertissement
  Music, Film, Book, Gamepad2, Palette, Mountain,
  Guitar, Mic, Dice1, Dice2, Dice3,
  
  // Services & Utilités
  Zap, Droplets, Wifi, MessageSquare, Mail, Cloud, Lock,
  Plug, Power, Settings, Trash, Recycle, Inbox, Send, Download, Upload,
  
  // Famille & Enfants
  Baby, Users2, PartyPopper, Gamepad as GameIcon, Backpack,
  
  // Autres
  Star, Flag, Clock, Bell, Search, X, ChevronRight,
  Plus, Minus, Check, AlertCircle, Info, HelpCircle, Sun, Moon
} from 'lucide-react';
import { IconOption } from '@/lib/types';

interface IconModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIcon?: string;
  onIconSelect: (iconName: string) => void;
}

export const ALL_ICONS: IconOption[] = [
  // Maison & Logement
  { name: 'home', icon: Home, category: 'expense' },
  { name: 'building', icon: Building, category: 'expense' },
  { name: 'key', icon: Key, category: 'expense' },
  { name: 'bed', icon: Bed, category: 'expense' },
  { name: 'sofa', icon: Sofa, category: 'expense' },
  { name: 'lightbulb', icon: Lightbulb, category: 'expense' },
  { name: 'thermometer', icon: Thermometer, category: 'expense' },
  { name: 'shield', icon: Shield, category: 'expense' },
  { name: 'hammer', icon: Hammer, category: 'expense' },
  { name: 'paint-bucket', icon: PaintBucket, category: 'expense' },
  { name: 'armchair', icon: Armchair, category: 'expense' },
  { name: 'bath', icon: Bath, category: 'expense' },
  { name: 'fence', icon: Fence, category: 'expense' },
  { name: 'heater', icon: Heater, category: 'expense' },
  { name: 'lamp', icon: Lamp, category: 'expense' },
  { name: 'wrench', icon: Wrench, category: 'expense' },
  { name: 'drill', icon: Drill, category: 'expense' },
  { name: 'flashlight', icon: Flashlight, category: 'expense' },

  // Transport
  { name: 'car', icon: Car, category: 'expense' },
  { name: 'plane', icon: Plane, category: 'expense' },
  { name: 'train', icon: Train, category: 'expense' },
  { name: 'bus', icon: Bus, category: 'expense' },
  { name: 'bike', icon: Bike, category: 'expense' },
  { name: 'ship', icon: Ship, category: 'expense' },
  { name: 'fuel', icon: Fuel, category: 'expense' },
  { name: 'map-pin', icon: MapPin, category: 'expense' },
  { name: 'compass', icon: Compass, category: 'expense' },
  { name: 'truck', icon: Truck, category: 'expense' },
  { name: 'plane-takeoff', icon: PlaneTakeoff, category: 'expense' },
  { name: 'plane-landing', icon: PlaneLanding, category: 'expense' },
  { name: 'navigation', icon: Navigation, category: 'expense' },
  { name: 'anchor', icon: Anchor, category: 'expense' },

  // Nourriture & Restaurants
  { name: 'utensils', icon: Utensils, category: 'expense' },
  { name: 'coffee', icon: Coffee, category: 'expense' },
  { name: 'pizza', icon: Pizza, category: 'expense' },
  { name: 'apple', icon: Apple, category: 'expense' },
  { name: 'chef-hat', icon: ChefHat, category: 'expense' },
  { name: 'wine', icon: Wine, category: 'expense' },
  { name: 'cake', icon: Cake, category: 'expense' },
  { name: 'fish', icon: Fish, category: 'expense' },
  { name: 'beef', icon: Beef, category: 'expense' },
  { name: 'milk', icon: Milk, category: 'expense' },
  { name: 'cherry', icon: Cherry, category: 'expense' },

  // Shopping
  { name: 'shopping-cart', icon: ShoppingCart, category: 'expense' },
  { name: 'shopping-bag', icon: ShoppingBag, category: 'expense' },
  { name: 'store', icon: Store, category: 'expense' },
  { name: 'tag', icon: Tag, category: 'expense' },
  { name: 'package', icon: Package, category: 'expense' },
  { name: 'gift', icon: Gift, category: 'expense' },
  { name: 'shirt', icon: Shirt, category: 'expense' },
  { name: 'gem', icon: Gem, category: 'expense' },
  { name: 'receipt', icon: Receipt, category: 'expense' },
  { name: 'ticket', icon: Ticket, category: 'expense' },
  { name: 'shopping-basket', icon: ShoppingBasket, category: 'expense' },
  { name: 'watch', icon: Watch, category: 'expense' },
  { name: 'glasses', icon: Glasses, category: 'expense' },
  { name: 'crown', icon: Crown, category: 'expense' },

  // Technologie
  { name: 'laptop', icon: Laptop, category: 'expense' },
  { name: 'phone', icon: Phone, category: 'expense' },
  { name: 'tablet', icon: Tablet, category: 'expense' },
  { name: 'headphones', icon: Headphones, category: 'expense' },
  { name: 'camera', icon: Camera, category: 'expense' },
  { name: 'monitor', icon: Monitor, category: 'expense' },
  { name: 'printer', icon: Printer, category: 'expense' },
  { name: 'router', icon: Router, category: 'expense' },
  { name: 'gamepad', icon: Gamepad, category: 'expense' },
  { name: 'tv', icon: Tv, category: 'expense' },
  { name: 'mouse', icon: Mouse, category: 'expense' },
  { name: 'keyboard', icon: Keyboard, category: 'expense' },
  { name: 'cpu', icon: Cpu, category: 'expense' },
  { name: 'hard-drive', icon: HardDrive, category: 'expense' },
  { name: 'battery', icon: Battery, category: 'expense' },
  { name: 'bluetooth', icon: Bluetooth, category: 'expense' },
  { name: 'speaker', icon: Speaker, category: 'expense' },

  // Santé & Sport
  { name: 'heart', icon: Heart, category: 'expense' },
  { name: 'activity', icon: Activity, category: 'expense' },
  { name: 'dumbbell', icon: Dumbbell, category: 'expense' },
  { name: 'stethoscope', icon: Stethoscope, category: 'expense' },
  { name: 'pill', icon: Pill, category: 'expense' },
  { name: 'eye', icon: Eye, category: 'expense' },
  { name: 'smile', icon: Smile, category: 'expense' },
  { name: 'footprints', icon: Footprints, category: 'expense' },
  { name: 'bandage', icon: Bandage, category: 'expense' },
  { name: 'syringe', icon: Syringe, category: 'expense' },

  // Finance
  { name: 'credit-card', icon: CreditCard, category: 'expense' },
  { name: 'banknote', icon: Banknote, category: 'income' },
  { name: 'wallet', icon: Wallet, category: 'income' },
  { name: 'piggy-bank', icon: PiggyBank, category: 'income' },
  { name: 'trending-up', icon: TrendingUp, category: 'income' },
  { name: 'trending-down', icon: TrendingDown, category: 'expense' },
  { name: 'dollar-sign', icon: DollarSign, category: 'income' },
  { name: 'euro', icon: Euro, category: 'income' },
  { name: 'calculator', icon: Calculator, category: 'expense' },
  { name: 'coins', icon: Coins, category: 'income' },
  { name: 'landmark', icon: Landmark, category: 'income' },
  { name: 'hand-coins', icon: HandCoins, category: 'income' },

  // Travail & Éducation
  { name: 'briefcase', icon: Briefcase, category: 'income' },
  { name: 'graduation-cap', icon: GraduationCap, category: 'expense' },
  { name: 'book-open', icon: BookOpen, category: 'expense' },
  { name: 'pen', icon: Pen, category: 'expense' },
  { name: 'file-text', icon: FileText, category: 'expense' },
  { name: 'building-2', icon: Building2, category: 'income' },
  { name: 'users', icon: Users, category: 'income' },
  { name: 'calendar', icon: Calendar, category: 'expense' },
  { name: 'ruler', icon: Ruler, category: 'expense' },
  { name: 'scissors', icon: Scissors, category: 'expense' },
  { name: 'paperclip', icon: Paperclip, category: 'expense' },
  { name: 'notebook', icon: Notebook, category: 'expense' },
  { name: 'badge', icon: Badge, category: 'income' },
  { name: 'award', icon: Award, category: 'income' },
  { name: 'trophy', icon: Trophy, category: 'income' },

  // Loisirs & Divertissement
  { name: 'music', icon: Music, category: 'expense' },
  { name: 'film', icon: Film, category: 'expense' },
  { name: 'book', icon: Book, category: 'expense' },
  { name: 'gamepad-2', icon: Gamepad2, category: 'expense' },
  { name: 'palette', icon: Palette, category: 'expense' },
  { name: 'mountain', icon: Mountain, category: 'expense' },
  { name: 'guitar', icon: Guitar, category: 'expense' },
  { name: 'mic', icon: Mic, category: 'expense' },
  { name: 'dice-1', icon: Dice1, category: 'expense' },
  { name: 'dice-2', icon: Dice2, category: 'expense' },
  { name: 'dice-3', icon: Dice3, category: 'expense' },

  // Services & Utilités
  { name: 'zap', icon: Zap, category: 'expense' },
  { name: 'droplets', icon: Droplets, category: 'expense' },
  { name: 'wifi-service', icon: Wifi, category: 'expense' },
  { name: 'message-square', icon: MessageSquare, category: 'expense' },
  { name: 'mail', icon: Mail, category: 'expense' },
  { name: 'cloud', icon: Cloud, category: 'expense' },
  { name: 'lock', icon: Lock, category: 'expense' },
  { name: 'plug', icon: Plug, category: 'expense' },
  { name: 'power', icon: Power, category: 'expense' },
  { name: 'settings', icon: Settings, category: 'expense' },
  { name: 'trash', icon: Trash, category: 'expense' },
  { name: 'recycle', icon: Recycle, category: 'expense' },
  { name: 'inbox', icon: Inbox, category: 'expense' },
  { name: 'send', icon: Send, category: 'expense' },
  { name: 'download', icon: Download, category: 'expense' },
  { name: 'upload', icon: Upload, category: 'expense' },

  // Famille & Enfants
  { name: 'baby', icon: Baby, category: 'expense' },
  { name: 'users-2', icon: Users2, category: 'expense' },
  { name: 'party-popper', icon: PartyPopper, category: 'expense' },
  { name: 'game-icon', icon: GameIcon, category: 'expense' },
  { name: 'backpack', icon: Backpack, category: 'expense' },

  // Autres
  { name: 'star', icon: Star, category: 'general' },
  { name: 'flag', icon: Flag, category: 'general' },
  { name: 'clock', icon: Clock, category: 'general' },
  { name: 'bell', icon: Bell, category: 'expense' },
  { name: 'plus', icon: Plus, category: 'general' },
  { name: 'minus', icon: Minus, category: 'general' },
  { name: 'check', icon: Check, category: 'general' },
  { name: 'alert-circle', icon: AlertCircle, category: 'general' },
  { name: 'info', icon: Info, category: 'general' },
  { name: 'help-circle', icon: HelpCircle, category: 'general' },
  { name: 'sun', icon: Sun, category: 'general' },
  { name: 'moon', icon: Moon, category: 'general' },
];

const CATEGORIES = [
  { id: 'all', name: 'Tous', icons: ALL_ICONS },
  { id: 'maison', name: '🏠 Maison', icons: ALL_ICONS.filter(icon => 
    ['home', 'building', 'key', 'bed', 'sofa', 'lightbulb', 'thermometer', 'shield', 'hammer', 'paint-bucket', 'armchair', 'bath', 'fence', 'heater', 'lamp', 'wrench', 'drill', 'flashlight'].includes(icon.name)) },
  { id: 'transport', name: '🚗 Transport', icons: ALL_ICONS.filter(icon => 
    ['car', 'plane', 'train', 'bus', 'bike', 'ship', 'fuel', 'map-pin', 'compass', 'truck', 'plane-takeoff', 'plane-landing', 'navigation', 'anchor'].includes(icon.name)) },
  { id: 'nourriture', name: '🍕 Nourriture', icons: ALL_ICONS.filter(icon => 
    ['utensils', 'coffee', 'pizza', 'apple', 'chef-hat', 'wine', 'cake', 'fish', 'beef', 'milk', 'cherry'].includes(icon.name)) },
  { id: 'shopping', name: '🛍️ Shopping', icons: ALL_ICONS.filter(icon => 
    ['shopping-cart', 'shopping-bag', 'store', 'tag', 'package', 'gift', 'shirt', 'gem', 'receipt', 'ticket', 'shopping-basket', 'watch', 'glasses', 'crown'].includes(icon.name)) },
  { id: 'tech', name: '📱 Tech', icons: ALL_ICONS.filter(icon => 
    ['laptop', 'phone', 'tablet', 'headphones', 'camera', 'monitor', 'printer', 'router', 'gamepad', 'tv', 'mouse', 'keyboard', 'cpu', 'hard-drive', 'battery', 'bluetooth', 'speaker'].includes(icon.name)) },
  { id: 'sante', name: '❤️ Santé', icons: ALL_ICONS.filter(icon => 
    ['heart', 'activity', 'dumbbell', 'stethoscope', 'pill', 'eye', 'smile', 'footprints', 'bandage', 'syringe'].includes(icon.name)) },
  { id: 'finance', name: '💰 Finance', icons: ALL_ICONS.filter(icon => 
    ['credit-card', 'banknote', 'wallet', 'piggy-bank', 'trending-up', 'trending-down', 'dollar-sign', 'euro', 'calculator', 'coins', 'landmark', 'hand-coins'].includes(icon.name)) },
  { id: 'travail', name: '💼 Travail', icons: ALL_ICONS.filter(icon => 
    ['briefcase', 'graduation-cap', 'book-open', 'pen', 'file-text', 'building-2', 'users', 'calendar', 'ruler', 'scissors', 'paperclip', 'notebook', 'badge', 'award', 'trophy'].includes(icon.name)) },
  { id: 'loisirs', name: '🎮 Loisirs', icons: ALL_ICONS.filter(icon => 
    ['music', 'film', 'book', 'gamepad-2', 'palette', 'mountain', 'guitar', 'mic', 'dice-1', 'dice-2', 'dice-3'].includes(icon.name)) },
  { id: 'services', name: '⚡ Services', icons: ALL_ICONS.filter(icon => 
    ['zap', 'droplets', 'wifi-service', 'message-square', 'mail', 'cloud', 'lock', 'plug', 'power', 'settings', 'trash', 'recycle', 'inbox', 'send', 'download', 'upload'].includes(icon.name)) },
  { id: 'famille', name: '👶 Famille', icons: ALL_ICONS.filter(icon => 
    ['baby', 'users-2', 'party-popper', 'game-icon', 'backpack'].includes(icon.name)) },
];

const IconModal = ({ isOpen, onClose, selectedIcon, onIconSelect }: IconModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showMobileCategories, setShowMobileCategories] = useState(false);

  if (!isOpen) return null;

  const currentCategory = CATEGORIES.find(cat => cat.id === selectedCategory) || CATEGORIES[0];
  const filteredIcons = currentCategory.icons.filter(icon => 
    icon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleIconSelect = (iconName: string) => {
    onIconSelect(iconName);
    onClose();
    setSearchQuery('');
    setSelectedCategory('all');
    setShowMobileCategories(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-2 md:p-4"
    >
      <div className="bg-surface rounded-xl shadow-2xl w-full h-full md:h-[80vh] md:max-h-[600px] md:max-w-4xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-default">
          <h2 className="text-lg md:text-xl font-bold text-text">Choisir une icône</h2>
          <button
            onClick={onClose}
            className="text-secondary hover:text-text transition-colors"
          >
            <X className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 md:p-4 border-b border-default">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" />
            <input
              type="text"
              placeholder="Rechercher une icône..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 md:py-3 bg-surface-elevated border border-default rounded-lg text-text placeholder-text-secondary outline-none text-sm md:text-base"
            />
          </div>
        </div>

        {/* Mobile Category Selector */}
        <div className="md:hidden border-b border-default">
          <button
            onClick={() => setShowMobileCategories(!showMobileCategories)}
            className="w-full flex items-center justify-between p-4 text-text hover:bg-surface-elevated transition-colors"
          >
            <span className="font-medium">{currentCategory.name} ({currentCategory.icons.length})</span>
            <ChevronRight className={`h-4 w-4 transition-transform ${showMobileCategories ? 'rotate-90' : ''}`} />
          </button>
          
          {showMobileCategories && (
            <div className="border-t border-default bg-surface-elevated max-h-48 overflow-y-auto">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setShowMobileCategories(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary text-white'
                      : 'text-secondary hover:bg-surface hover:text-text'
                  }`}
                >
                  {category.name}
                  <span className="ml-2 text-xs opacity-70">
                    ({category.icons.length})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Categories Sidebar */}
          <div className="hidden md:block w-48 border-r border-default bg-surface-elevated overflow-y-auto">
            <div className="p-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary text-white'
                      : 'text-secondary hover:bg-surface hover:text-text'
                  }`}
                >
                  {category.name}
                  <span className="ml-2 text-xs opacity-70">
                    ({category.icons.length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Icons Grid */}
          <div className="flex-1 p-3 md:p-4 overflow-y-auto">
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3">
              {filteredIcons.map((icon) => (
                <button
                  key={icon.name}
                  onClick={() => handleIconSelect(icon.name)}
                  className={`p-2 md:p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
                    selectedIcon === icon.name
                      ? 'border-primary bg-primary/10'
                      : 'border-default hover:border-primary hover:bg-surface-elevated'
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
              <div className="text-center py-8 md:py-12 text-secondary">
                <Search className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 opacity-50" />
                <p className="text-sm md:text-base">Aucune icône trouvée</p>
                <p className="text-xs md:text-sm mt-1 md:mt-2">Essayez un autre terme de recherche</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconModal; 