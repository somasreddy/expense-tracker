// src/components/Icon.tsx
import React, { createContext, useContext } from 'react';
import * as HeroIcons from 'lucide-react';

// Optional Font Awesome support – loaded dynamically to avoid hard dependency
let FontAwesomeIcon: any = null;
let faIcons: Record<string, any> = {};
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { FontAwesomeIcon: FAIcon } = require('@fortawesome/react-fontawesome');
    FontAwesomeIcon = FAIcon;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { fas } = require('@fortawesome/free-solid-svg-icons');
    Object.entries(fas).forEach(([key, value]) => {
        // Convert "faCoffee" -> "coffee"
        const name = key.replace(/^fa/, '').toLowerCase();
        // @ts-ignore
        faIcons[name] = value;
    });
} catch (e) {
    // Font Awesome not installed – keep null
}

export type IconSet = 'hero' | 'fa';

// Context to allow global switching of the icon set
export const IconContext = createContext<IconSet>('hero');
export const useIconSet = () => useContext(IconContext);

interface IconProps {
    /** Icon name without prefix, e.g. "chevron-down" for Heroicons or "coffee" for Font Awesome */
    name: string;
    /** Optional override of the icon set; defaults to the value from IconContext */
    set?: IconSet;
    /** Additional Tailwind / CSS classes */
    className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, set, className = '' }) => {
    const contextSet = useIconSet();
    const iconSet = set ?? contextSet;
    const sizeClass = 'w-5 h-5'; // consistent size for all icons

    if (iconSet === 'fa' && FontAwesomeIcon && faIcons[name]) {
        return <FontAwesomeIcon icon={faIcons[name]} className={`${sizeClass} ${className}`} />;
    }

    // Heroicons – library uses PascalCase component names
    const pascalName = name
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
    const HeroComp = (HeroIcons as any)[pascalName];
    return HeroComp ? <HeroComp className={`${sizeClass} ${className}`} /> : null;
};
