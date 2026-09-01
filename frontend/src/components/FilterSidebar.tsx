import React from 'react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterGroup {
  title: string;
  options: FilterOption[];
}

export default function FilterSidebar({ title, filterGroups }: { title: string, filterGroups: FilterGroup[] }) {
  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-white dark:bg-zinc-950 p-5 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm sticky top-20">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{title}</h2>
        
        <div className="space-y-6">
          {filterGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.options.map((option, optIdx) => (
                  <li key={optIdx}>
                    <label className="flex items-center cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-zinc-700 dark:bg-zinc-900 dark:checked:bg-primary" 
                      />
                      <span className="ml-3 text-sm text-gray-600 dark:text-gray-400 group-hover:text-primary transition-colors">
                        {option.label}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
