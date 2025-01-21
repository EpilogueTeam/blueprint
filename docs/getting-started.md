# Getting Started with Blueprint

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/blueprint.git
cd blueprint
```

2. Install dependencies:
```bash
npm install
```

3. Create your first Blueprint file:
```bash
mkdir src
touch src/index.bp
```

## Basic Usage

Blueprint uses a declarative syntax to define UI components. Each file with a `.bp` extension will be compiled into HTML and CSS.

### Basic Structure

A Blueprint file consists of elements, which can have properties and children. Properties can be flags or key-value pairs:

```blueprint
element(flag1, key:value) {
    child-element {
        // Content
    }
}
```

### Property Types

Blueprint supports several types of properties:

1. **Flag Properties**
   ```blueprint
   button(bold, centered) { "Text" }
   ```

2. **Key-Value Properties**
   ```blueprint
   input(type:email, placeholder:"Enter email")
   ```

3. **Numeric Properties**
   ```blueprint
   section(width:80, padding:20)
   ```

4. **Color Properties**
   ```blueprint
   text(color:#ff0000) { "Red text" }
   ```

### Page Configuration

Every Blueprint page can have metadata defined using the `page` element:

```blueprint
page {
    title { "My Page Title" }
    description { "Page description for SEO" }
    keywords { "keyword1, keyword2, keyword3" }
    author { "Author Name" }
    meta-viewport { "width=device-width, initial-scale=1" }
}
```

Available page metadata:
- `title`: Page title (appears in browser tab)
- `description`: Meta description for SEO
- `keywords`: Meta keywords for SEO
- `author`: Page author
- `meta-*`: Custom meta tags (e.g., meta-viewport, meta-robots)

### Basic Layout

A typical page structure:

```blueprint
page {
    title { "My First Page" }
    description { "A simple Blueprint page" }
    meta-viewport { "width=device-width, initial-scale=1" }
}

navbar {
    horizontal(spaced) {
        text(bold) { "My App" }
        links {
            link(href:/) { "Home" }
            link(href:/about) { "About" }
            link(href:/contact) { "Contact" }
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

section(wide) {
    grid(columns:3) {
        card {
            title { "Feature 1" }
            text { "Description of feature 1" }
            button-secondary { "Learn More" }
        }
        card {
            title { "Feature 2" }
            text { "Description of feature 2" }
            button-secondary { "Learn More" }
        }
        card {
            title { "Feature 3" }
            text { "Description of feature 3" }
            button-secondary { "Learn More" }
        }
    }
}
```

## Project Structure

A typical Blueprint project has the following structure:

```
my-blueprint-project/
├── src/                  # Source Blueprint files
│   ├── index.bp         # Main page
│   ├── about.bp         # About page
│   └── contact.bp       # Contact page
├── public/              # Static assets
│   ├── images/          # Image files
│   ├── fonts/           # Font files
│   └── favicon.ico      # Favicon
├── dist/                # Generated files (auto-generated)
│   ├── index.html       # Compiled HTML
│   ├── index.css        # Generated CSS
│   └── ...
└── package.json         # Project configuration
```

## Error Handling

Blueprint provides helpful error messages when something goes wrong:

```
BlueprintError at line 5, column 10:
Unknown element type: invalid-element
```

Common errors include:
- Missing closing braces
- Unknown element types
- Invalid property values
- Unterminated strings
- Missing required properties
- Invalid color values
- Invalid numeric values

## Best Practices

1. **Organization**
   - Group related elements logically
   - Use consistent spacing and indentation
   - Keep files focused on a single purpose
   - Split large files into components

2. **Naming**
   - Use descriptive names for links and sections
   - Follow a consistent naming convention
   - Use semantic element names

3. **Layout**
   - Use semantic elements (`section`, `navbar`, etc.)
   - Leverage the grid system for responsive layouts
   - Use appropriate spacing with `gap` property
   - Use `width` and `padding` for fine-tuned control

4. **Styling**
   - Use predefined style properties when possible
   - Group related styles together
   - Keep styling consistent across pages
   - Use custom properties sparingly

5. **Performance**
   - Keep files small and focused
   - Use appropriate image formats and sizes
   - Minimize custom styles
   - Leverage built-in responsive features

## Next Steps

- Explore available [components](components.md)
- Learn about [styling](styling.md)
- Check out [examples](examples.md)
- Read about advanced features in the component documentation 