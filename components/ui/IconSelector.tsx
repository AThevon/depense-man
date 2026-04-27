import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import IconModal, { ALL_ICONS } from './IconModal';
import { Icon } from './Icon';

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
      <label className="block text-sm font-medium text-foreground mb-2">Icône</label>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-full h-12 flex items-center justify-between px-3.5 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-lg active:bg-[rgba(255,255,255,0.08)] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          {selectedIconData ? (
            <>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name={selectedIconData.name} className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-foreground truncate">{selectedIconData.name}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Choisir une icône</span>
          )}
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      </button>

      <AnimatePresence>
        {isModalOpen && (
          <IconModal
            key="icon-modal"
            onClose={() => setIsModalOpen(false)}
            selectedIcon={selectedIcon}
            onIconSelect={onIconSelect}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default IconSelector;
