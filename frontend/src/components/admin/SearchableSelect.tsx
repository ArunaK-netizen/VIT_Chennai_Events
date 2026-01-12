'use client';

import Select from 'react-select';

interface IClub {
  _id: string;
  name: string;
}

interface OptionType {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: IClub[];
  value: string[];
  onChange: (selectedValues: string[]) => void;
  placeholder?: string;
  isMulti?: boolean;
}

export default function SearchableSelect({ options, value, onChange, placeholder, isMulti = true }: SearchableSelectProps) {
  const formattedOptions: OptionType[] = options.map(club => ({
    value: club._id,
    label: club.name,
  }));

  const selectedValues = formattedOptions.filter(option => value.includes(option.value));

  const handleChange = (selected: any) => {
    if (isMulti) {
      onChange(selected ? selected.map((item: OptionType) => item.value) : []);
    } else {
      onChange(selected ? selected.value : '');
    }
  };

  return (
    <Select
      options={formattedOptions}
      value={selectedValues}
      onChange={handleChange}
      isMulti={isMulti}
      placeholder={placeholder}
      className="react-select-container"
      classNamePrefix="react-select"
      styles={{
        control: (baseStyles, state) => ({
          ...baseStyles,
          backgroundColor: 'rgba(255, 255, 255, 0.9)', // Light background
          borderColor: state.isFocused ? 'var(--color-primary)' : '#cbd5e1', // slate-300
          color: '#0f172a', // slate-900 (black-ish)
          boxShadow: state.isFocused ? '0 0 0 1px var(--color-primary)' : 'none',
          '&:hover': {
            borderColor: state.isFocused ? 'var(--color-primary)' : '#94a3b8', // slate-400
          },
          minHeight: '42px',
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0', // slate-200
          zIndex: 9999,
        }),
        option: (baseStyles, state) => ({
          ...baseStyles,
          backgroundColor: state.isSelected
            ? 'var(--color-primary)'
            : state.isFocused
              ? 'rgba(14, 165, 233, 0.1)'
              : 'transparent',
          color: state.isSelected ? 'white' : '#0f172a', // slate-900
          '&:active': {
            backgroundColor: 'var(--color-primary-hover)',
          },
        }),
        singleValue: (base) => ({
          ...base,
          color: '#0f172a', // slate-900
        }),
        input: (base) => ({
          ...base,
          color: '#0f172a', // slate-900
        }),
        multiValue: (baseStyles) => ({
          ...baseStyles,
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
        }),
        multiValueLabel: (baseStyles) => ({
          ...baseStyles,
          color: '#0f172a', // slate-900
        }),
        multiValueRemove: (baseStyles) => ({
          ...baseStyles,
          color: '#64748b', // slate-500
          '&:hover': {
            backgroundColor: 'var(--color-primary-hover)',
            color: 'white',
          },
        }),
      }}
    />
  );
}