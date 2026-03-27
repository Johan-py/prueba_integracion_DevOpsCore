import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ComboBoxProps {
  label: string;
  placeholder?: string;
  options?: string[];
}

export function ComboBox({ label, placeholder = "Seleccionar...", options = [] }: ComboBoxProps) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-xs">
      <label className="text-sm font-medium text-stone-900 font-inter">
        {label}
      </label>

      <div className="relative">
        <select
          className="w-full appearance-none bg-white border border-stone-200 text-stone-600 py-2 px-4 pr-10 rounded-lg focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-colors"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="w-5 h-5 text-stone-400" />
        </div>
      </div>
    </div>
  );
}