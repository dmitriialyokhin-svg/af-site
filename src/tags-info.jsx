/**
 * Tag configuration for the portfolio filter.
 *
 * Fields:
 *   id     — unique key, used in card-info.js tags arrays
 *   label  — display text
 *   icon   — JSX SVG element (optional)
 *
 * The "All" tag is hardcoded in App.jsx and always appears first.
 * Order here = render order after "All".
 */

const S = 14 // icon size px

const IconAll = () => (
  <svg width={S} height={S} viewBox="0 0 10 10" fill="none">
    {/* infinity ∞ drawn as two connected loops */}
    <path
      d="M5 5 C5 3.6 3.8 2.6 2.8 2.6 C1.6 2.6 0.8 3.5 0.8 5 C0.8 6.5 1.6 7.4 2.8 7.4 C3.8 7.4 4.5 6.7 5 5 C5.5 3.3 6.2 2.6 7.2 2.6 C8.4 2.6 9.2 3.5 9.2 5 C9.2 6.5 8.4 7.4 7.2 7.4 C6.2 7.4 5 6.4 5 5 Z"
      stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none"
    />
  </svg>
)

const IconFeatured = () => (
  <svg width={S} height={S} viewBox="0 0 10 10" fill="none">
    <polygon
      points="5,1 6.18,3.82 9.26,4.12 7.04,6.06 7.72,9.06 5,7.5 2.28,9.06 2.96,6.06 0.74,4.12 3.82,3.82"
      fill="currentColor"
    />
  </svg>
)

const IconVertical = () => (
  <svg width={S} height={S} viewBox="0 0 10 10" fill="none">
    <rect x="3.5" y="1" width="3" height="8" rx="1" fill="currentColor"/>
  </svg>
)

const IconHorizontal = () => (
  <svg width={S} height={S} viewBox="0 0 10 10" fill="none">
    <rect x="1" y="3.5" width="8" height="3" rx="1" fill="currentColor"/>
  </svg>
)

const IconLite = () => (
  <svg width={S} height={S} viewBox="0 0 10 10" fill="none">
    {/* cloud: three overlapping circles on top, flat base */}
    <path
      d="M2 7 Q1 7 1 5.8 Q1 4.6 2.2 4.5 Q2.2 3 3.8 3 Q4.4 3 4.8 3.4 Q5 2.2 6.2 2.2 Q7.6 2.2 7.8 3.6 Q9 3.7 9 5 Q9 6.2 7.8 6.4 Q7.8 7 2 7 Z"
      stroke="currentColor" strokeWidth="1" strokeLinejoin="round" fill="none"
    />
  </svg>
)

const IconEasy = () => (
  <svg width={S} height={S} viewBox="0 0 10 10">
    {/* treble clef as text glyph — crisp at any size */}
    <text
      x="5"
      y="9.5"
      textAnchor="middle"
      fontSize="11"
      fontFamily="serif"
      fill="currentColor"
    >𝄞</text>
  </svg>
)

const IconAdvanced = () => (
  // Brain icon from Tabler Icons (MIT license) — adapted to 10x10
  <svg width={S} height={S} viewBox="0 0 24 24" fill="none">
    <path d="M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17.5 16a3.5 3.5 0 0 0 0 -7h-.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 9.3v-2.8a3.5 3.5 0 0 0 -7 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.5 16a3.5 3.5 0 0 1 0 -7h.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 9.3v-2.8a3.5 3.5 0 0 1 7 0v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconPro = () => (
  <svg width={S} height={S} viewBox="0 0 12 12" fill="none">
    {/* mortarboard top — flat diamond/square rotated 45° */}
    <path
      d="M6 1 L11 4 L6 7 L1 4 Z"
      fill="currentColor"
    />
    {/* tassel cord hanging right */}
    <line x1="11" y1="4" x2="11" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <circle cx="11" cy="8.8" r="0.9" fill="currentColor"/>
    {/* cap brim underside / body */}
    <path
      d="M3 5.2 L3 8 Q6 9.5 9 8 L9 5.2"
      stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none"
    />
  </svg>
)

const tags = [
  { id: 'Featured',   label: 'Featured',   icon: <IconFeatured /> },
  { id: 'Vertical',   label: 'Vertical',   icon: <IconVertical /> },
  { id: 'Horizontal', label: 'Horizontal', icon: <IconHorizontal /> },
  { id: 'Lite',       label: 'Lite',       icon: <IconLite /> },
  { id: 'Easy',       label: 'Easy',       icon: <IconEasy /> },
  { id: 'Advanced',   label: 'Advanced',   icon: <IconAdvanced /> },
  { id: 'Pro',        label: 'Pro',        icon: <IconPro /> },
]

export { IconAll }
export default tags
