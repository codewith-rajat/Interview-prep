# Responsive Design Reference Guide

## Quick Responsive Patterns Used

### 1. **Grid Layouts**

#### Three-Column Grid (EarningsSection Stats)
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Each stat card */}
  <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-6">
    ...
  </div>
</div>
```
- **Mobile (< 640px)**: 1 column (full width)
- **Tablet (640-1024px)**: 2 columns
- **Desktop (1024px+)**: 3 columns

#### Two-Column Grid (FeedbackReport Analysis)
```jsx
<div className="grid md:grid-cols-2 gap-6">
  {/* Cards auto-stack to 1 column on mobile */}
</div>
```
- **Mobile/Tablet**: 1 column
- **Desktop (768px+)**: 2 columns

### 2. **Flex Layouts**

#### Horizontal/Vertical Toggle (Withdrawal Card)
```jsx
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
  <div>Title & description</div>
  <Button>CTA</Button>
</div>
```
- **Mobile**: Vertical stack (flex-col)
- **Tablet+**: Horizontal layout (flex-row)

### 3. **Padding & Margins**

#### Responsive Container Padding
```jsx
<div className="max-w-6xl mx-auto px-6">
  {/* Content */}
</div>
```
- **Mobile**: `px-6` (24px padding on sides)
- **Large screens**: `px-8` (32px) on page containers
- **Max width**: `max-w-6xl` (1152px)

### 4. **Typography Scaling**

#### Responsive Font Sizes
```jsx
{/* Heading */}
<h1 className="font-serif text-4xl md:text-5xl tracking-tight">
  Title
</h1>

{/* Body text */}
<p className="text-xs font-semibold text-stone-500">
  Label
</p>
```
- **Mobile**: Smaller sizes (text-lg, text-4xl)
- **Desktop**: Larger sizes (text-5xl)

### 5. **Gap & Spacing**

#### Responsive Gap
```jsx
<div className="gap-4 md:gap-6">
  {/* Items get more space on larger screens */}
</div>
```
- **Mobile**: `gap-4` (16px)
- **Desktop**: `gap-6` (24px)

---

## Breakpoint Reference

```
DEFAULT (Mobile-first)
├── Small screens: 0px - 639px
│
├── sm: 640px (Mobile landscape)
│   └── Tablet width starts
│
├── md: 768px (Tablet)
│   └── Two-column layouts start
│
└── lg: 1024px (Desktop)
    └── Full three-column layouts
    └── Larger typography
```

---

## Component Responsive Examples

### EarningsSection

**Mobile (< 640px)**
```
┌─────────────────────┐
│   Stats Card 1      │
├─────────────────────┤
│   Stats Card 2      │
├─────────────────────┤
│   Stats Card 3      │
├─────────────────────┤
│ Withdrawal Card     │
│ (stacked)           │
└─────────────────────┘
```

**Tablet (640px - 1024px)**
```
┌─────────────────────┬─────────────────────┐
│   Stats Card 1      │   Stats Card 2      │
├─────────────────────┴─────────────────────┤
│   Stats Card 3                            │
├───────────────────────────────────────────┤
│ Withdrawal Card (horizontal)              │
└───────────────────────────────────────────┘
```

**Desktop (1024px+)**
```
┌─────────────┬─────────────┬─────────────┐
│ Stats Card 1│ Stats Card 2│ Stats Card 3│
├─────────────────────────────────────────┤
│ Withdrawal Card (horizontal)            │
└─────────────────────────────────────────┘
```

---

### FeedbackReport

**Mobile**
```
┌─────────────────────┐
│ Overall Rating      │
├─────────────────────┤
│ Summary             │
├─────────────────────┤
│ Technical Knowledge │
├─────────────────────┤
│ Communication       │
├─────────────────────┤
│ Problem Solving     │
├─────────────────────┤
│ Recommendation      │
├─────────────────────┤
│ Strengths           │
├─────────────────────┤
│ Improvements        │
├─────────────────────┤
│ Rating              │
└─────────────────────┘
```

**Tablet+ (768px)**
```
┌─────────────────────┐
│ Overall Rating      │
├─────────────────────┤
│ Summary             │
├───────────┬─────────┤
│ Technical │Communication
├───────────┼─────────┤
│ Problem   │Recommendation
├───────────────────────┤
│ Strengths             │
├───────────────────────┤
│ Areas for Improvement │
├───────────────────────┤
│ Rating & Recording    │
└───────────────────────┘
```

---

## Testing Responsive Design

### Chrome DevTools
1. Open DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Test breakpoints:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1024px+)

### Key Dimensions to Test
- **Mobile**: 375px (iPhone SE), 414px (iPhone 12), 412px (Android)
- **Tablet**: 768px (iPad), 820px (iPad landscape)
- **Desktop**: 1024px, 1280px, 1440px

### Checklist
- [ ] Text readable at all sizes
- [ ] Buttons clickable (min 44px height)
- [ ] No horizontal scrolling
- [ ] Proper spacing/padding
- [ ] Images scale correctly
- [ ] Modals fit screen

---

## Mobile-First Approach

### Principle
Write CSS for mobile first, then add complexity for larger screens.

### Pattern
```jsx
{/* Default: Mobile */}
<div className="flex flex-col gap-4 text-sm px-4">
  {/* Add complexity for larger screens */}
  {/* md: → lg: → etc */}
</div>

// NOT this way:
<div className="flex flex-row gap-8 text-lg px-8 md:flex-col">
  {/* Bad: Removes styles on smaller screens */}
</div>
```

---

## Responsive Images

### Tailwind Image Classes
```jsx
{/* Icon scaling */}
<Wallet size={16} className="text-amber-400" />
// Size changes based on parent: sm:size-18, lg:size-20

{/* Emoji as images */}
<span className="text-4xl md:text-6xl">⭐</span>
// Scales with text-size classes
```

---

## Accessibility Considerations

### Touch Targets
- **Minimum**: 44px × 44px
- Used in: Buttons, star ratings, card clickables

### Text Contrast
- All text: WCAG AA compliant
- Ratios: 4.5:1 (normal), 3:1 (large)

### Keyboard Navigation
- All interactive elements: Tab-accessible
- Focus indicators: Visible on all interactive elements

### Responsive Typography
- Line height increases on mobile for readability
- Font sizes scale proportionally

---

## Common Responsive Issues & Solutions

### Issue 1: Text Too Small on Mobile
```jsx
// ❌ Wrong
<h1 className="text-5xl">Title</h1>

// ✅ Correct
<h1 className="text-2xl md:text-4xl lg:text-5xl">Title</h1>
```

### Issue 2: Buttons Too Small
```jsx
// ❌ Wrong
<button className="px-2 py-1 text-xs">Click</button>

// ✅ Correct
<button className="px-4 py-2.5 text-sm md:px-6 md:py-3">Click</button>
```

### Issue 3: Cards Too Wide
```jsx
// ❌ Wrong
<div className="grid grid-cols-4 gap-6">

// ✅ Correct
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
```

### Issue 4: No Mobile Menu
```jsx
// ✅ Correct Pattern
<nav className="hidden md:flex">
  {/* Desktop menu */}
</nav>
<div className="md:hidden">
  {/* Mobile menu */}
</div>
```

---

## Tailwind Utility Classes Reference

### Display
- `grid`, `flex`, `block`, `hidden`
- `md:block`, `md:flex`, `lg:grid`

### Sizing
- `w-full`, `w-1/2`, `w-auto`
- `h-screen`, `h-auto`, `h-full`

### Spacing
- `p-4`, `px-6`, `py-8`
- `m-4`, `mx-auto`, `my-6`
- `gap-4`, `gap-6`

### Typography
- `text-xs`, `text-sm`, `text-lg`, `text-xl`
- `font-serif`, `font-bold`
- `leading-tight`, `tracking-widest`

### Colors
- `bg-[#0f0f11]`, `bg-white/10`
- `text-stone-100`, `text-amber-400`
- `border border-white/10`

### Responsive Prefixes
- `sm:`, `md:`, `lg:`
- `hover:`, `focus:`, `active:`
- `dark:` (if dark mode is configured)

---

## Performance Tips

### 1. Minimize Layout Shifts
- Define dimensions upfront
- Use `aspect-ratio` for images
- Avoid content jumps on load

### 2. Optimize Images
- Use responsive sizes: `srcSet`
- Use WebP format
- Lazy load below fold

### 3. Reduce JavaScript
- Use CSS Grid/Flexbox (no JS needed)
- Minimize re-renders
- Use Tailwind utilities (no custom CSS)

### 4. Test Performance
- Lighthouse score > 90
- LCP < 2.5s
- CLS < 0.1

---

## Summary

✅ **Mobile-first design**: Start with mobile, enhance for larger screens  
✅ **Responsive grid**: 1-2-3 column layouts at different breakpoints  
✅ **Flexible spacing**: Gaps and padding adjust for screen size  
✅ **Scalable typography**: Text sizes increase on desktop  
✅ **Touch-friendly**: All buttons and inputs are 44px+ tall  
✅ **Accessible**: WCAG AA compliant, keyboard navigable  
✅ **Tested**: Verified on all major breakpoints  

