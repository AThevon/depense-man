import { LucideIcon } from 'lucide-react';
import { ALL_ICONS } from './IconModal';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

/**
 * Composant Icon centralisé pour afficher les icônes Lucide
 * Utilise le nom de l'icône (string) pour rendre le composant correspondant
 *
 * @param name - Le nom de l'icône (ex: 'home', 'car', 'credit-card')
 * @param className - Classes CSS optionnelles
 * @param size - Taille de l'icône en pixels (optionnel, utilise className par défaut)
 */
export const Icon = ({ name, className = '', size }: IconProps) => {
  const iconData = ALL_ICONS.find(icon => icon.name === name);

  if (!iconData) {
    console.warn(`Icon "${name}" not found in ALL_ICONS`);
    return null;
  }

  const IconComponent = iconData.icon;

  const sizeClass = size ? `h-[${size}px] w-[${size}px]` : '';
  const finalClassName = `${sizeClass} ${className}`.trim();

  return <IconComponent className={finalClassName} />;
};

/**
 * Hook pour obtenir le composant d'icône directement
 * Utile quand vous avez besoin du composant lui-même plutôt que du rendu
 */
export const useIcon = (name: string): LucideIcon | null => {
  const iconData = ALL_ICONS.find(icon => icon.name === name);
  return iconData?.icon || null;
};

/**
 * Vérifie si une icône existe
 */
export const hasIcon = (name: string): boolean => {
  return ALL_ICONS.some(icon => icon.name === name);
};

/**
 * Obtient toutes les icônes disponibles
 */
export const getAllIcons = () => ALL_ICONS;

/**
 * Obtient les icônes par catégorie
 */
export const getIconsByCategory = (category: 'income' | 'expense' | 'general') => {
  return ALL_ICONS.filter(icon => icon.category === category);
};

export default Icon;
