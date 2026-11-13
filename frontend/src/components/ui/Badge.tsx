import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'lime' | 'gray' | 'error' | 'warning' | 'info' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'gray', 
  size = 'sm',
  className = '' 
}) => {
  const base = "inline-flex items-center font-mono font-medium rounded transition-colors";
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  };
  const variants = {
    lime: "bg-lime-muted text-lime-accent border border-lime-dim/40",
    gray: "bg-graphite-800 text-graphite-300 border border-graphite-600",
    error: "bg-status-error/15 text-status-error border border-status-error/30",
    warning: "bg-status-warning/15 text-status-warning border border-status-warning/30",
    info: "bg-status-info/15 text-status-info border border-status-info/30",
    outline: "border border-graphite-600 text-graphite-300",
  };

  return (
    <span className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
