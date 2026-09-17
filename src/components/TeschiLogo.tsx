import React from 'react';

interface TeschiLogoProps {
  className?: string;
  variant?: 'full' | 'symbol' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const TeschiLogo: React.FC<TeschiLogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md',
}) => {
  // Dimensiones según tamaño solicitado
  const sizeClasses = {
    sm: variant === 'full' ? 'h-8 w-auto' : 'w-7 h-7',
    md: variant === 'full' ? 'h-12 w-auto' : 'w-10 h-10',
    lg: variant === 'full' ? 'h-16 w-auto' : 'w-14 h-14',
    xl: variant === 'full' ? 'h-24 w-auto' : 'w-20 h-20',
  }[size];

  if (variant === 'symbol' || variant === 'badge') {
    return (
      <svg
        viewBox="0 0 350 120"
        className={`${sizeClasses} ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Logo Oficial TESChi"
        role="img"
      >
        <defs>
          <filter id="symTileShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="2" dy="3" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.3" />
          </filter>
          <filter id="symLetterShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="2" dy="2" stdDeviation="0.5" floodColor="#0d2817" floodOpacity="0.85" />
          </filter>
        </defs>

        {/* TES Letters */}
        <g filter="url(#symLetterShadow)">
          {/* T */}
          <path d="M 10 20 L 46 20 L 46 34 L 34 34 L 34 76 L 22 76 L 22 34 L 10 34 Z" fill="#246a3b" />
          {/* E */}
          <path d="M 54 20 L 88 20 L 88 32 L 66 32 L 66 41 L 84 41 L 84 53 L 66 53 L 66 64 L 90 64 L 90 76 L 54 76 Z" fill="#246a3b" />
          {/* S */}
          <path d="M 124 25 C 119 20 111 19 104 19 C 94 19 89 25 89 31 C 89 45 125 39 125 61 C 125 72 116 77 103 77 C 94 77 87 73 83 67 L 91 58 C 95 62 99 65 104 65 C 109 65 113 62 113 58 C 113 46 77 50 77 30 C 77 22 85 19 95 19 C 105 19 114 22 118 27 Z" fill="#246a3b" />
        </g>

        {/* CHI Tiles */}
        <g>
          {/* C Tile */}
          <g filter="url(#symTileShadow)">
            <rect x="138" y="10" width="58" height="68" rx="8" ry="8" fill="#84b438" stroke="#668c27" strokeWidth="2" />
            <path d="M 180 30 C 176 23 171 21 165 21 C 154 21 147 29 147 43 C 147 57 155 65 166 65 C 172 65 177 62 181 56 L 188 62 C 183 71 175 74 165 74 C 148 74 137 62 137 43 C 137 25 149 12 167 12 C 176 12 184 16 189 24 Z" fill="#ffffff" transform="translate(1, 1)" />
          </g>

          {/* H Tile */}
          <g filter="url(#symTileShadow)">
            <rect x="202" y="10" width="58" height="68" rx="8" ry="8" fill="#b3ada6" stroke="#89827a" strokeWidth="2" />
            <path d="M 215 20 L 226 20 L 226 38 L 235 38 L 235 20 L 246 20 L 246 68 L 235 68 L 235 49 L 226 49 L 226 68 L 215 68 Z" fill="#ffffff" />
          </g>

          {/* I Tile */}
          <g filter="url(#symTileShadow)">
            <rect x="266" y="10" width="58" height="68" rx="8" ry="8" fill="#246a3b" stroke="#174826" strokeWidth="2" />
            <path d="M 290 20 L 301 20 L 301 68 L 290 68 Z" fill="#ffffff" />
          </g>
        </g>
      </svg>
    );
  }

  // Full variant: Official Lockup with institutional wording and red line
  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 460 210"
        className={`${sizeClasses} max-w-full`}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Tecnológico de Estudios Superiores de Chimalhuacán (TESChi) - Logo Oficial"
        role="img"
      >
        <defs>
          <filter id="fullTileShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="3" dy="4" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.32" />
          </filter>
          <filter id="fullLetterShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="2" dy="2.5" stdDeviation="0.5" floodColor="#0e311a" floodOpacity="0.9" />
          </filter>
          <filter id="fullInnerBevel" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="1" dy="1.5" stdDeviation="0.4" floodColor="#333333" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* TES Green Letters */}
        <g filter="url(#fullLetterShadow)">
          {/* T */}
          <path d="M 44 48 L 86 48 L 86 63 L 72 63 L 72 108 L 58 108 L 58 63 L 44 63 Z" fill="#246a3b" />
          {/* E */}
          <path d="M 94 48 L 132 48 L 132 62 L 108 62 L 108 71 L 128 71 L 128 84 L 108 84 L 108 94 L 134 94 L 134 108 L 94 108 Z" fill="#246a3b" />
          {/* S */}
          <path d="M 174 53 C 168 47 159 47 151 47 C 141 47 136 53 136 60 C 136 76 176 69 176 93 C 176 104 167 109 152 109 C 142 109 135 105 130 99 L 139 88 C 143 93 148 96 153 96 C 158 96 162 93 162 89 C 162 76 122 81 122 59 C 122 50 131 47 142 47 C 153 47 163 50 168 56 Z" fill="#246a3b" />
        </g>

        {/* CHI Tiles */}
        <g>
          {/* Tile 1: C (Lime Green) */}
          <g filter="url(#fullTileShadow)">
            <rect x="188" y="38" width="64" height="74" rx="10" ry="10" fill="#84b438" stroke="#688f28" strokeWidth="2.5" />
            <path d="M 235 59 C 231 52 225 50 218 50 C 206 50 199 59 199 74 C 199 89 207 98 219 98 C 226 98 232 95 236 88 L 244 95 C 238 105 229 108 218 108 C 200 108 188 94 188 74 C 188 54 201 40 220 40 C 230 40 239 44 245 52 Z" fill="#ffffff" filter="url(#fullInnerBevel)" transform="translate(4, 2)" />
          </g>

          {/* Tile 2: H (Silver Gray) */}
          <g filter="url(#fullTileShadow)">
            <rect x="256" y="38" width="64" height="74" rx="10" ry="10" fill="#b3ada6" stroke="#8c857e" strokeWidth="2.5" />
            <path d="M 271 49 L 283 49 L 283 67 L 293 67 L 293 49 L 305 49 L 305 100 L 293 100 L 293 80 L 283 80 L 283 100 L 271 100 Z" fill="#ffffff" filter="url(#fullInnerBevel)" transform="translate(0, 1)" />
          </g>

          {/* Tile 3: I (Forest Green) */}
          <g filter="url(#fullTileShadow)">
            <rect x="324" y="38" width="64" height="74" rx="10" ry="10" fill="#246a3b" stroke="#174826" strokeWidth="2.5" />
            <path d="M 350 49 L 362 49 L 362 101 L 350 101 Z" fill="#ffffff" filter="url(#fullInnerBevel)" transform="translate(0, 1)" />
          </g>
        </g>

        {/* Text: TECNOLÓGICO DE ESTUDIOS SUPERIORES */}
        <text
          x="230"
          y="148"
          textAnchor="middle"
          fontFamily="'Montserrat', 'Inter', 'Segoe UI', system-ui, sans-serif"
          fontSize="18.5"
          fontWeight="900"
          fill="#1b2220"
          letterSpacing="1.8"
        >
          TECNOLÓGICO DE ESTUDIOS SUPERIORES
        </text>

        {/* Red Accent Divider Line */}
        <line x1="20" y1="160" x2="440" y2="160" stroke="#a7342b" strokeWidth="3" strokeLinecap="round" />

        {/* Text: CHIMALHUACÁN */}
        <text
          x="230"
          y="185"
          textAnchor="middle"
          fontFamily="'Montserrat', 'Inter', 'Segoe UI', system-ui, sans-serif"
          fontSize="20.5"
          fontWeight="900"
          fill="#1b2220"
          letterSpacing="4"
        >
          CHIMALHUACÁN
        </text>
      </svg>
    </div>
  );
};
