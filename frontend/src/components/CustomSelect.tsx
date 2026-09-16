'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  id?: string;
  name?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  disabled = false,
  className = '',
  triggerClassName = '',
  menuClassName = '',
  id,
  name,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (optionValue: string, optionDisabled?: boolean) => {
    if (optionDisabled || disabled) return;
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {name && <input type="hidden" name={name} value={value} />}

      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all text-left outline-none cursor-pointer select-none ${
          disabled
            ? 'bg-gray-100 dark:bg-zinc-800/80 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-zinc-800 cursor-not-allowed opacity-75'
            : isOpen
            ? 'bg-white dark:bg-zinc-900 border-primary ring-2 ring-primary/20 text-gray-900 dark:text-white shadow-sm'
            : 'bg-gray-50 dark:bg-zinc-900/70 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-zinc-700 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-2xs'
        } ${triggerClassName}`}
      >
        <span className={`truncate mr-2 ${!selectedOption ? 'text-gray-400 dark:text-gray-500' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 dark:text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary dark:text-primary' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-64 overflow-y-auto rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#181818] p-1.5 shadow-2xl backdrop-blur-md outline-none ${menuClassName}`}
            role="listbox"
          >
            {normalizedOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500 text-center">
                No options available
              </div>
            ) : (
              normalizedOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt.value, opt.disabled)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm text-left transition-colors cursor-pointer select-none ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-green-400 font-semibold'
                        : 'text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800/80 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="truncate mr-2">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-primary dark:text-green-400 shrink-0" />}
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
