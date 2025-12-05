# Design Guidelines: Viral 2-Player Connect-the-Dots Game

## Design Approach

**Primary Direction:** Cute, minimal, emotional aesthetic inspired by viral puzzle games like Wordle, Connections, and minimalist mobile games. The design must feel intimate, playful, and share-worthy for social media.

**Key Principles:**
- Emotional resonance through soft, rounded shapes and gentle interactions
- Minimal UI that disappears when playing, focusing attention on the canvas
- Celebration-focused design that builds anticipation toward the magical reveal
- Mobile-first with generous touch targets

---

## Typography System

**Font Families:**
- Primary: 'DM Sans' (Google Fonts) - Clean, friendly, modern
- Accent: 'Fredoka' (Google Fonts) - Playful for game title and celebratory moments

**Type Scale:**
- Game Title: text-4xl font-bold (Fredoka)
- Turn Indicator: text-2xl font-semibold (DM Sans)
- Tooltips/Hints: text-sm font-medium (DM Sans)
- Button Labels: text-base font-semibold (DM Sans)
- Status Text: text-xs font-medium uppercase tracking-wide (DM Sans)

---

## Spacing & Layout System

**Tailwind Units:** Consistently use 4, 8, 12, 16, 24 spacing units (p-4, gap-8, mb-12, etc.)

**Layout Structure:**

1. **Game Container:** Full viewport height with centered canvas
   - Max-width: none (game uses full available space)
   - Canvas area: Dynamic sizing based on viewport with 16-24 unit padding

2. **Control Panel:** Fixed bottom bar (mobile) or floating side panel (desktop)
   - Mobile: Bottom sheet with rounded-t-3xl corners
   - Desktop: Right sidebar with rounded-l-3xl corners
   - Padding: p-6 internal spacing

3. **Header Bar:** Minimal top bar
   - Height: h-16
   - Padding: px-6
   - Flex layout with space-between for logo and status

---

## Component Library

### Shape Creation Interface (Player 2 Setup)

**Three-Tab Input System:**
- Tab pills with rounded-full borders
- Active tab: Solid fill with shadow-sm
- Spacing: gap-2 between tabs, p-3 internal

**Text Input Mode:**
- Large centered input field
- Font preview showing how text will appear as dots
- Character limit indicator (1-12 characters recommended)

**Drawing Canvas Mode:**
- Full-screen drawing area with subtle grid overlay
- Floating tool palette (bottom-center on mobile, left side on desktop)
- Tools: Brush sizes, undo, clear - minimal icon-only buttons

**Image Upload Mode:**
- Large dropzone with dashed border (border-dashed border-2)
- Image preview with edge detection overlay visualization
- Adjustment slider for dot density (150-300 range)

### Game Canvas

**Canvas Styling:**
- Rounded corners: rounded-2xl
- Subtle shadow: shadow-xl
- Background: Solid neutral with very subtle grain texture

**Dot Appearance:**
- Unconnected dots: Small circles with soft glow (use CSS drop-shadow)
- Clickable dots: Larger with pulsing animation
- Connected dots: Medium size with connection lines
- Touch targets: Minimum 44px diameter for mobile

**Connection Lines:**
- Stroke width: 2-3px
- Rounded line caps
- Subtle dash animation when drawing

**Zoom/Pan Controls:**
- Floating button group (bottom-left)
- Buttons: Zoom In, Zoom Out, Reset View
- Icon-only with rounded-lg backgrounds
- Size: w-12 h-12 each

### Turn Indicator

**Position:** Top-center of screen, floating above canvas
- Pill-shaped container: rounded-full px-6 py-3
- Animated transition when turn changes
- Icon + Text layout (flex items-center gap-2)

**States:**
- "Your Turn" - with animated pulse
- "Waiting..." - with subtle loading spinner
- "Connecting..." - during move submission

### Progress & Strategy UI

**Progress Ring:** Top-right floating element
- Circular progress (SVG-based)
- Shows percentage of dots revealed
- Size: w-16 h-16

**Strategy Tooltip:** Floating hint that appears periodically
- Position: Bottom-center, above control panel
- Max-width: max-w-xs
- Auto-dismiss after 5 seconds
- Rounded-xl with subtle backdrop blur

### Reveal Animation Sequence

**Stage 1 - Build Up (0-2 seconds):**
- Dots begin gentle pulsing
- Zoom canvas to fit full shape
- Fade out UI elements except canvas

**Stage 2 - Outline Reveal (2-4 seconds):**
- Draw complete shape outline with stroke animation
- Glow effect radiating from center outward
- Dots fade out as outline completes

**Stage 3 - Final Reveal (4-6 seconds):**
- Large centered display of text/shape
- Confetti burst or sparkle particles
- Scale-up animation with bounce easing
- Sound effect trigger point

**Post-Reveal UI:**
- "Play Again" button: Large, centered, rounded-full
- "Share Result" button: Secondary style below
- Buttons spacing: gap-4 vertical stack

### Room Setup & Sharing

**Room Creation Flow:**
- Single screen with creation options prominent
- "Create Room" button: Large, primary style
- Generated room code: Large monospace font (font-mono text-3xl)
- Copy link button: Integrated with code display

**Join Flow:**
- Simple code input field
- Auto-submit on complete code entry
- Loading state during room validation

### Control Panel Components

**Player Avatars:**
- Circular avatars: w-10 h-10
- Player 1 and Player 2 indicators
- Active player: ring-2 border
- Stack horizontally: gap-3

**Game Controls:**
- Minimal icon buttons
- Size: w-10 h-10
- Rounded: rounded-lg
- Functions: Settings, Sound Toggle, Help

---

## Interaction Patterns

**Dot Selection:**
- Tap/click to select
- Immediate visual feedback (scale-up 1.2x)
- Haptic feedback on mobile (if available)

**Turn Transitions:**
- Smooth fade between states
- 300ms duration for most transitions
- Ease-in-out timing function

**Loading States:**
- Skeleton screens for initial load
- Gentle pulse animation for waiting states
- Never use traditional spinners - use dots or subtle animations

---

## Responsive Breakpoints

**Mobile (<768px):**
- Single column layout
- Full-width canvas
- Bottom sheet controls
- Minimum touch targets: 44px

**Tablet (768px-1024px):**
- Canvas takes 70% width
- Side panel for controls
- Larger dot sizes for easier interaction

**Desktop (>1024px):**
- Canvas centered with max 80% viewport
- Floating control panels
- Keyboard shortcuts enabled
- Mouse hover states for dots

---

## Accessibility

- Minimum contrast ratios maintained throughout
- Keyboard navigation for all interactive elements
- Screen reader announcements for turn changes and reveals
- Focus indicators on all clickable elements: ring-2 ring-offset-2
- Alternative input methods for drawing (grid-based for keyboard users)

---

## Images

**No hero images needed** - this is a game application focused on canvas gameplay.

**Icon Usage:**
- Use Heroicons via CDN for UI elements
- Icon size: Most icons w-5 h-5, larger actions w-6 h-6
- Always pair icons with accessible labels (aria-label)

---

## Special Effects Budget

**Essential Animations Only:**
1. Dot reveal/connection animations
2. Turn transition effects  
3. Final reveal sequence (main feature)
4. Button hover/press states

**Avoid:**
- Background animations
- Unnecessary page transitions
- Decorative animations that distract from gameplay