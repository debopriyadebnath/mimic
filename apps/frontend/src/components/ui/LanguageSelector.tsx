import React from 'react';
import { SUPPORTED_LANGUAGES } from '@/lib/supportedLanguages';

interface LanguageSelectorProps {
  value: string;
  onChange: (language: string) => void;
  label?: string;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  label = 'Language',
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      >
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500">
        Selected: {SUPPORTED_LANGUAGES[value as keyof typeof SUPPORTED_LANGUAGES] || 'English'}
      </p>
    </div>
  );
};

export default LanguageSelector;
