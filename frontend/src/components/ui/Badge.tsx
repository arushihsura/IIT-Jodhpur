import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'status' | 'severity' | 'info';
  color?: 'gray' | 'red' | 'yellow' | 'orange' | 'green' | 'blue';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'info', color, size = 'md' }: BadgeProps) {
  const colors = {
    gray: 'bg-gray-100 text-gray-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    orange: 'bg-orange-100 text-orange-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  const defaultColor = color || 'blue';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${colors[defaultColor]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
}
