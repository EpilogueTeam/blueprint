# Blueprint Documentation

Blueprint is a modern, declarative UI framework for building beautiful web interfaces. It provides a simple, intuitive syntax for creating responsive, dark-themed web applications with consistent styling and behavior.

## Core Features

- **Declarative Syntax**: Write UI components using a clean, intuitive syntax
- **Dark Theme**: Beautiful dark theme with consistent styling
- **Responsive Design**: Built-in responsive design system
- **Component-Based**: Rich set of reusable components
- **Type-Safe**: Catch errors before they reach the browser
- **Custom Properties**: Direct control over styling when needed
- **Live Preview**: Changes appear instantly in your browser

## Documentation Structure

1. [Getting Started](getting-started.md)
   - Installation
   - Basic Usage
   - Project Structure
   - Property Types
   - Page Configuration
   - Error Handling
   - Best Practices

2. [Components](components.md)
   - Layout Components (Section, Grid, Horizontal, Vertical)
   - Typography (Title, Text)
   - Navigation (Navbar, Links)
   - Form Elements (Input, Textarea, Select, Checkbox, Radio, Switch)
   - Interactive Components (Button, Card, Badge, Alert, Tooltip)
   - Container Components (List, Table, Progress, Slider)

3. [Styling](styling.md)
   - Layout Properties
   - Typography Properties
   - Component Styles
   - Interactive States
   - Responsive Design
   - Custom Properties
   - Theme Variables
   - Best Practices

4. [Examples](examples.md)
   - Basic Examples
   - Layout Examples
   - Form Examples
   - Navigation Examples
   - Complete Page Examples

## Quick Start

```blueprint
page {
    title { "My First Blueprint Page" }
    description { "A simple Blueprint page example" }
    meta-viewport { "width=device-width, initial-scale=1" }
}

navbar {
    horizontal(spaced) {
        text(bold) { "My App" }
        links {
            link(href:/) { "Home" }
            link(href:/about) { "About" }
        }
    }
}

section(wide, centered) {
    vertical(gap:2) {
        title(huge) { "Welcome to Blueprint" }
        text(subtle) { "Start building beautiful UIs with Blueprint" }
        
        horizontal(centered, gap:2) {
            button { "Get Started" }
            button-light { "Learn More" }
        }
    }
}
```

## Key Concepts

1. **Elements**
   - Basic building blocks of Blueprint
   - Each element maps to an HTML tag
   - Elements can have properties and children
   - Elements follow semantic naming

2. **Properties**
   - Flag properties (e.g., `centered`, `bold`)
   - Key-value properties (e.g., `type:email`)
   - Numeric properties (e.g., `width:80`)
   - Color properties (e.g., `color:#ff0000`)

3. **Styling**
   - Consistent dark theme
   - Built-in responsive design
   - Direct style properties
   - Theme variables
   - Interactive states

4. **Components**
   - Layout components
   - Form elements
   - Interactive components
   - Container components
   - Typography elements

## Best Practices

1. **Organization**
   - Group related elements
   - Use consistent spacing
   - Keep files focused
   - Split into components

2. **Styling**
   - Use predefined properties
   - Maintain consistency
   - Leverage built-in features
   - Custom styles sparingly

3. **Performance**
   - Small, focused files
   - Optimize assets
   - Use responsive features
   - Minimize custom styles

4. **Accessibility**
   - Semantic elements
   - Color contrast
   - Focus states
   - Screen reader support

## Need Help?

- Check the [examples](examples.md) for common patterns
- Read the [components guide](components.md) for detailed documentation
- Learn about styling in the [styling guide](styling.md)
- Start with the [getting started guide](getting-started.md) for basics 