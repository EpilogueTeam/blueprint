# Blueprint Components

Blueprint provides a rich set of components for building modern web interfaces. Each component is designed to be responsive, accessible, and consistent with the dark theme.

## Layout Components

### Section
Container for page sections:
```blueprint
section(wide, centered) {
    // Content
}
```
Properties:
- `wide`: Full width with max-width constraint (1200px)
- `centered`: Center content horizontally and vertically
- `alternate`: Alternate background color
- `padding`: Custom padding in pixels
- `margin`: Custom margin in pixels

### Grid
Responsive grid layout:
```blueprint
grid(columns:3) {
    // Grid items
}
```
Properties:
- `columns`: Number of columns (default: auto-fit)
- `responsive`: Enable responsive behavior
- `gap`: Custom gap size between items
- `width`: Custom width in percentage

### Horizontal
Horizontal flex container:
```blueprint
horizontal(centered, spaced) {
    // Horizontal items
}
```
Properties:
- `centered`: Center items vertically
- `spaced`: Space between items
- `gap`: Custom gap size
- `width`: Custom width in percentage
- `responsive`: Wrap items on small screens

### Vertical
Vertical flex container:
```blueprint
vertical(centered) {
    // Vertical items
}
```
Properties:
- `centered`: Center items horizontally
- `spaced`: Space between items
- `gap`: Custom gap size
- `width`: Custom width in percentage

## Typography

### Title
Page or section titles:
```blueprint
title(huge) { "Main Title" }
title(large) { "Section Title" }
```
Properties:
- `huge`: Very large size (4rem)
- `large`: Large size (2rem)
- `bold`: Bold weight
- `centered`: Center align
- `color`: Custom text color

### Text
Regular text content:
```blueprint
text(large) { "Large text" }
text(subtle) { "Subtle text" }
```
Properties:
- `large`: Larger size
- `small`: Smaller size (0.875rem)
- `subtle`: Muted color
- `bold`: Bold weight
- `color`: Custom text color

## Navigation

### Navbar
Fixed navigation bar:
```blueprint
navbar {
    horizontal {
        text(bold) { "Brand" }
        links {
            link(href:home) { "Home" }
            link(href:about) { "About" }
        }
    }
}
```
Properties:
- `sticky`: Fixed to top
- `transparent`: Transparent background
- `backgroundColor`: Custom background color

### Links
Navigation link group:
```blueprint
links {
    link(href:page1) { "Link 1" }
    link(href:page2) { "Link 2" }
}
```
Properties:
- `spaced`: Add spacing between links
- `vertical`: Vertical orientation
- `gap`: Custom gap size

### Link
Individual link:
```blueprint
link(href:page, text:"Click here") { }
link(href:https://example.com) { "External Link" }
```
Properties:
- `href`: Target URL or page
- `text`: Link text (optional)
- `external`: Open in new tab (automatic for http/https URLs)
- `color`: Custom text color

## Interactive Components

### Button
Various button styles:
```blueprint
button { "Primary" }
button-secondary { "Secondary" }
button-light { "Light" }
button-compact { "Compact" }
```
Properties:
- `disabled`: Disabled state
- `width`: Custom width in percentage
- `backgroundColor`: Custom background color
- `color`: Custom text color

### Card
Content container with hover effect:
```blueprint
card {
    title { "Card Title" }
    text { "Card content" }
    button { "Action" }
}
```
Properties:
- `raised`: Add shadow and hover effect
- `width`: Custom width in percentage
- `padding`: Custom padding in pixels
- `backgroundColor`: Custom background color

### Badge
Status indicators:
```blueprint
badge { "New" }
badge(color:blue) { "Status" }
```
Properties:
- `color`: Custom badge color
- `backgroundColor`: Custom background color
- `width`: Custom width in percentage

### Alert
Notification messages:
```blueprint
alert(type:info) { "Information message" }
```
Properties:
- `type`: info, success, warning, error
- `backgroundColor`: Custom background color
- `color`: Custom text color
- `width`: Custom width in percentage

### Tooltip
Hover tooltips:
```blueprint
tooltip(text:"More info") {
    text { "Hover me" }
}
```
Properties:
- `text`: Tooltip text
- `position`: top, right, bottom, left
- `backgroundColor`: Custom background color
- `color`: Custom text color

## Form Elements

### Input
Text input field:
```blueprint
input(placeholder:"Type here") { }
```
Properties:
- `placeholder`: Placeholder text
- `type`: Input type (text, email, password, etc.)
- `required`: Required field
- `disabled`: Disabled state
- `width`: Custom width in percentage

### Textarea
Multi-line text input:
```blueprint
textarea(placeholder:"Enter message") { }
```
Properties:
- `placeholder`: Placeholder text
- `rows`: Number of visible rows
- `required`: Required field
- `width`: Custom width in percentage

### Select
Dropdown selection:
```blueprint
select {
    option { "Option 1" }
    option { "Option 2" }
}
```
Properties:
- `placeholder`: Placeholder text
- `required`: Required field
- `disabled`: Disabled state
- `width`: Custom width in percentage

### Checkbox
Checkbox input:
```blueprint
horizontal {
    checkbox { }
    text { "Accept terms" }
}
```
Properties:
- `checked`: Default checked state
- `required`: Required field
- `disabled`: Disabled state
- `width`: Custom width in percentage

### Radio
Radio button input:
```blueprint
vertical {
    horizontal {
        radio(name:"choice") { }
        text { "Option 1" }
    }
    horizontal {
        radio(name:"choice") { }
        text { "Option 2" }
    }
}
```
Properties:
- `name`: Group name
- `checked`: Default checked state
- `disabled`: Disabled state
- `width`: Custom width in percentage

### Switch
Toggle switch:
```blueprint
horizontal {
    switch { }
    text { "Enable feature" }
}
```
Properties:
- `checked`: Default checked state
- `disabled`: Disabled state
- `width`: Custom width in percentage

## Container Components

### List
Ordered or unordered lists:
```blueprint
list {
    text { "Item 1" }
    text { "Item 2" }
}
```
Properties:
- `ordered`: Use ordered list
- `bullet`: Show bullets
- `spaced`: Add spacing
- `width`: Custom width in percentage

### Table
Data tables:
```blueprint
table {
    row {
        cell { "Header 1" }
        cell { "Header 2" }
    }
    row {
        cell { "Data 1" }
        cell { "Data 2" }
    }
}
```
Properties:
- `striped`: Alternate row colors
- `bordered`: Add borders
- `compact`: Reduced padding
- `width`: Custom width in percentage

### Progress
Progress indicators:
```blueprint
progress(value:75, max:100) { }
```
Properties:
- `value`: Current value
- `max`: Maximum value
- `indeterminate`: Loading state
- `width`: Custom width in percentage

### Slider
Range input:
```blueprint
slider(min:0, max:100, value:50) { }
```
Properties:
- `min`: Minimum value
- `max`: Maximum value
- `step`: Step increment
- `disabled`: Disabled state
- `width`: Custom width in percentage

### Media
Images and videos with responsive behavior:
```blueprint
media(src:/path/to/image.jpg) { "Image description" }
media(src:https://example.com/video.mp4, type:video) { "Video description" }
```
Properties:
- `src`: URL or path to the media file (required)
- `type`: Media type (`img` or `video`, defaults to `img`)
- `width`: Custom width in percentage
- `height`: Custom height in percentage
- `padding`: Custom padding in pixels
- `margin`: Custom margin in pixels

The media component automatically:
- Scales images/videos responsively (max-width: 100%)
- Maintains aspect ratio (height: auto)
- Adds rounded corners
- Includes a subtle hover effect
- Uses the content as alt text for images
- Adds video controls when type is video 