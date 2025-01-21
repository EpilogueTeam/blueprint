# Blueprint Styling Guide

Blueprint provides a comprehensive styling system that ensures consistent, beautiful dark-themed UIs. This guide covers all available styling properties and how to use them effectively.

## Style Properties

### Layout Properties

#### Spacing and Sizing
- `wide`: Full width with max-width constraint (1200px)
- `compact`: Reduced padding (0.75rem)
- `spaced`: Space between items (gap: 1.5rem)
- `gap`: Custom gap size between items
- `width`: Custom width in percentage
- `height`: Custom height in percentage
- `padding`: Custom padding in pixels
- `margin`: Custom margin in pixels

#### Positioning
- `centered`: Center content horizontally and vertically
- `sticky`: Fixed position at top with blur backdrop
- `fixed`: Fixed position
- `relative`: Relative positioning
- `absolute`: Absolute positioning

#### Display and Flex
- `horizontal`: Horizontal flex layout with 1.5rem gap
- `vertical`: Vertical flex layout with 1.5rem gap
- `grid`: Grid layout with auto-fit columns
- `responsive`: Enable responsive wrapping
- `hidden`: Hide element
- `visible`: Show element

### Typography Properties

#### Text Size
- `huge`: Very large text (clamp(2.5rem, 5vw, 4rem))
- `large`: Large text (clamp(1.5rem, 3vw, 2rem))
- `small`: Small text (0.875rem)
- `tiny`: Very small text (0.75rem)

#### Text Weight
- `bold`: Bold weight (600)
- `light`: Light weight
- `normal`: Normal weight

#### Text Style
- `italic`: Italic text
- `underline`: Underlined text
- `strike`: Strikethrough text
- `uppercase`: All uppercase
- `lowercase`: All lowercase
- `capitalize`: Capitalize first letter

#### Text Color
- `subtle`: Muted text color (#8b949e)
- `accent`: Accent color text (#3b82f6)
- `error`: Error color text
- `success`: Success color text
- `warning`: Warning color text
- Custom colors using `color:value`

### Component Styles

#### Button Styles
- `prominent`: Primary button style
  - Background: #3b82f6
  - Hover: Scale up and glow
- `secondary`: Secondary button style
  - Background: #1f2937
  - Hover: Slight raise
- `light`: Light button style
  - Background: Transparent
  - Border: 1px solid rgba(48, 54, 61, 0.6)
- `compact`: Compact button style
  - Padding: 0.75rem
  - Border-radius: 12px

#### Card Styles
- `raised`: Card with hover effect
  - Background: #111827
  - Border: 1px solid rgba(48, 54, 61, 0.6)
  - Hover: Raise and glow
- `interactive`: Interactive card style
  - Hover: Scale and border color change

#### Input Styles
- `input`: Standard input style
  - Background: #111827
  - Border: 1px solid rgba(48, 54, 61, 0.6)
  - Focus: Blue glow
- `textarea`: Textarea style
  - Min-height: 120px
  - Resize: vertical
- `select`: Select input style
  - Custom dropdown arrow
  - Focus: Blue glow
- `checkbox`: Checkbox style
  - Custom checkmark
  - Hover: Blue border
- `radio`: Radio button style
  - Custom radio dot
  - Hover: Blue border
- `switch`: Toggle switch style
  - Animated toggle
  - Checked: Blue background

### Interactive States

#### Hover Effects
```blueprint
button(hover-scale) { "Scale on Hover" }
link(hover-underline) { "Underline on Hover" }
card(hover-raise) { "Raise on Hover" }
```

Available hover properties:
- `hover-scale`: Scale up on hover (1.1)
- `hover-raise`: Raise with shadow
- `hover-glow`: Glow effect
- `hover-underline`: Underline on hover
- `hover-fade`: Fade effect

#### Focus States
```blueprint
input(focus-glow) { }
button(focus-outline) { "Click me" }
```

Available focus properties:
- `focus-glow`: Blue glow effect
- `focus-outline`: Blue outline
- `focus-scale`: Scale effect

#### Active States
```blueprint
button(active-scale) { "Click me" }
link(active-color) { "Click me" }
```

Available active properties:
- `active-scale`: Scale down
- `active-color`: Color change
- `active-raise`: Raise effect

### Responsive Design

#### Breakpoints
Blueprint automatically handles responsive design, but you can use specific properties:

```blueprint
section(mobile-stack) {
    horizontal(tablet-wrap) {
        card(desktop-wide) { }
        card(desktop-wide) { }
    }
}
```

Available responsive properties:
- `mobile-stack`: Stack elements on mobile
- `mobile-hide`: Hide on mobile
- `tablet-wrap`: Wrap on tablet
- `tablet-hide`: Hide on tablet
- `desktop-wide`: Full width on desktop
- `desktop-hide`: Hide on desktop

#### Grid System
The grid system automatically adjusts based on screen size:

```blueprint
grid(columns:3, responsive) {
    card { }
    card { }
    card { }
}
```

### Custom Properties

#### Direct Style Properties
You can use these properties directly:
- `width`: Set width in percentage (e.g., width:80)
- `height`: Set height in percentage (e.g., height:50)
- `padding`: Set padding in pixels (e.g., padding:20)
- `margin`: Set margin in pixels (e.g., margin:10)
- `color`: Set text color (e.g., color:#ffffff)
- `backgroundColor`: Set background color (e.g., backgroundColor:#000000)

### Theme Variables

Blueprint uses CSS variables for consistent theming:

```css
:root {
    --navbar-height: 4rem;
    --primary-color: #3b82f6;
    --secondary-color: #1f2937;
    --text-color: #e6edf3;
    --subtle-color: #8b949e;
    --border-color: rgba(48, 54, 61, 0.6);
    --background-color: #0d1117;
    --hover-color: rgba(255, 255, 255, 0.1);
}
```

### Best Practices

1. **Consistency**
   - Use predefined properties when possible
   - Maintain consistent spacing
   - Follow the color theme
   - Use semantic styles

2. **Responsive Design**
   - Test at all breakpoints
   - Use relative units
   - Consider mobile-first
   - Use grid and flex layouts

3. **Performance**
   - Minimize custom styles
   - Use system properties
   - Avoid deep nesting
   - Optimize animations

4. **Accessibility**
   - Maintain color contrast
   - Use semantic markup
   - Consider focus states
   - Test with screen readers
``` 
</rewritten_file>