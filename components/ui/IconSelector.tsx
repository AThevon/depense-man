import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import IconModal, { ALL_ICONS } from './IconModal';

interface IconSelectorProps {
  selectedIcon?: string;
  onIconSelect: (iconName: string) => void;
  className?: string;
}

const IconSelector = ({ selectedIcon, onIconSelect, className = '' }: IconSelectorProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedIconData = ALL_ICONS.find(icon => icon.name === selectedIcon);

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-foreground mb-2">
        Icône
      </label>
      
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
      >
        <div className="flex items-center space-x-2">
          {selectedIconData ? (
            <>
              <selectedIconData.icon className="h-5 w-5 text-primary" />
              <span className="text-foreground">{selectedIconData.name}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Choisir une icône</span>
          )}
        </div>
        <ChevronLeft className="h-5 w-5 text-muted-foreground rotate-180" />
      </button>

      <IconModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedIcon={selectedIcon}
        onIconSelect={onIconSelect}
      />
    </div>
  );
};

export default IconSelector; 