
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export default function Card({ children, className = '', hoverEffect = false }: CardProps) {
    return (
        <div className={`glass-card p-6 ${hoverEffect ? 'hover:scale-[1.02] hover:shadow-2xl' : ''} ${className}`}>
            {children}
        </div>
    );
}
