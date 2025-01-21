# Blueprint Examples

This guide provides comprehensive examples of common UI patterns and layouts using Blueprint.

## Basic Examples

### Page Setup
```blueprint
page {
    title { "My Blueprint Page" }
    description { "A comprehensive example page" }
    keywords { "blueprint, example, ui" }
    author { "Blueprint Team" }
}

navbar {
    horizontal {
        text(bold) { "My App" }
        links {
            link(href:home) { "Home" }
            link(href:about) { "About" }
            link(href:contact) { "Contact" }
        }
    }
}

section(wide, centered) {
    title(huge) { "Welcome" }
    text(subtle) { "Start building beautiful UIs" }
}
```

### Basic Card
```blueprint
card {
    title { "Simple Card" }
    text { "This is a basic card with some content." }
    button { "Learn More" }
}
```

### Alert Messages
```blueprint
vertical(gap:2) {
    alert(type:info) { "This is an information message" }
    alert(type:success) { "Operation completed successfully" }
    alert(type:warning) { "Please review your input" }
    alert(type:error) { "An error occurred" }
}
```

## Layout Examples

### Grid Layout
```blueprint
section(wide) {
    title { "Our Features" }
    
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

### Responsive Layout
```blueprint
section(wide) {
    horizontal(mobile-stack) {
        vertical(width:40) {
            title { "Left Column" }
            text { "This column takes 40% width on desktop" }
        }
        vertical(width:60) {
            title { "Right Column" }
            text { "This column takes 60% width on desktop" }
        }
    }
}
```

### Nested Layout
```blueprint
section(wide) {
    vertical(centered) {
        title(huge) { "Nested Layout" }
        
        horizontal(centered, gap:4) {
            vertical(centered) {
                title { "Column 1" }
                text { "Content" }
            }
            vertical(centered) {
                title { "Column 2" }
                text { "Content" }
            }
        }
    }
}
```

## Form Examples

### Login Form
```blueprint
section(wide, centered) {
    card {
        title { "Login" }
        vertical(gap:2) {
            vertical {
                text(bold) { "Email" }
                input(type:email, placeholder:"Enter your email") { }
            }
            vertical {
                text(bold) { "Password" }
                input(type:password, placeholder:"Enter your password") { }
            }
            horizontal {
                checkbox { }
                text { "Remember me" }
            }
            button { "Sign In" }
            text(small, centered) { "Forgot password?" }
        }
    }
}
```

### Contact Form
```blueprint
section(wide) {
    card {
        title { "Contact Us" }
        vertical(gap:2) {
            horizontal(gap:2) {
                vertical {
                    text(bold) { "First Name" }
                    input(placeholder:"John") { }
                }
                vertical {
                    text(bold) { "Last Name" }
                    input(placeholder:"Doe") { }
                }
            }
            vertical {
                text(bold) { "Email" }
                input(type:email, placeholder:"john@example.com") { }
            }
            vertical {
                text(bold) { "Message" }
                textarea(placeholder:"Your message here...") { }
            }
            button { "Send Message" }
        }
    }
}
```

### Settings Form
```blueprint
section(wide) {
    card {
        title { "Settings" }
        vertical(gap:3) {
            horizontal {
                vertical(width:70) {
                    title(small) { "Notifications" }
                    text(subtle) { "Manage your notification preferences" }
                }
                switch { }
            }
            horizontal {
                vertical(width:70) {
                    title(small) { "Dark Mode" }
                    text(subtle) { "Toggle dark/light theme" }
                }
                switch { }
            }
            horizontal {
                vertical(width:70) {
                    title(small) { "Email Updates" }
                    text(subtle) { "Receive email updates about your account" }
                }
                switch { }
            }
        }
    }
}
```

## Navigation Examples

### Complex Navbar
```blueprint
navbar {
    horizontal {
        horizontal(gap:2) {
            text(bold) { "Logo" }
            links {
                link(href:home) { "Home" }
                link(href:products) { "Products" }
                link(href:pricing) { "Pricing" }
                link(href:about) { "About" }
            }
        }
        horizontal(gap:2) {
            button-light { "Sign In" }
            button { "Get Started" }
        }
    }
}
```

### Sidebar Navigation
```blueprint
horizontal {
    vertical(width:20) {
        title { "Dashboard" }
        links(vertical) {
            link(href:home) { "Home" }
            link(href:profile) { "Profile" }
            link(href:settings) { "Settings" }
            link(href:help) { "Help" }
        }
    }
    vertical(width:80) {
        title { "Main Content" }
        text { "Your content here" }
    }
}
```

### Breadcrumb Navigation
```blueprint
horizontal(gap:1) {
    link(href:home) { "Home" }
    text { ">" }
    link(href:products) { "Products" }
    text { ">" }
    text(bold) { "Current Page" }
}
```

## Complete Page Examples

### Landing Page
```blueprint
page {
    title { "Blueprint - Modern UI Framework" }
    description { "Build beautiful web interfaces with Blueprint" }
}

navbar {
    horizontal {
        text(bold) { "Blueprint" }
        links {
            link(href:features) { "Features" }
            link(href:docs) { "Docs" }
            link(href:pricing) { "Pricing" }
            button { "Get Started" }
        }
    }
}

section(wide, centered) {
    vertical(centered) {
        title(huge) { "Build Beautiful UIs" }
        text(large, subtle) { "Create modern web interfaces with ease" }
        horizontal(centered, gap:2) {
            button { "Get Started" }
            button-light { "Learn More" }
        }
    }
}

section(wide) {
    grid(columns:3) {
        card {
            title { "Easy to Use" }
            text { "Simple, declarative syntax for building UIs" }
            button-secondary { "Learn More" }
        }
        card {
            title { "Modern Design" }
            text { "Beautiful dark theme with consistent styling" }
            button-secondary { "View Examples" }
        }
        card {
            title { "Responsive" }
            text { "Looks great on all devices out of the box" }
            button-secondary { "See Details" }
        }
    }
}
```

### Dashboard Page
```blueprint
page {
    title { "Dashboard - My App" }
}

navbar {
    horizontal {
        text(bold) { "Dashboard" }
        horizontal {
            text { "Welcome back, " }
            text(bold) { "John" }
        }
    }
}

section(wide) {
    grid(columns:4) {
        card {
            title { "Total Users" }
            text(huge) { "1,234" }
            text(subtle) { "+12% this month" }
        }
        card {
            title { "Revenue" }
            text(huge) { "$5,678" }
            text(subtle) { "+8% this month" }
        }
        card {
            title { "Active Users" }
            text(huge) { "892" }
            text(subtle) { "Currently online" }
        }
        card {
            title { "Conversion" }
            text(huge) { "3.2%" }
            text(subtle) { "+0.8% this month" }
        }
    }
    
    horizontal(gap:4) {
        vertical(width:60) {
            card {
                title { "Recent Activity" }
                list {
                    text { "User signup: John Doe" }
                    text { "New order: #12345" }
                    text { "Payment received: $99" }
                }
            }
        }
        vertical(width:40) {
            card {
                title { "Quick Actions" }
                vertical(gap:2) {
                    button { "Create User" }
                    button-secondary { "View Reports" }
                    button-light { "Export Data" }
                }
            }
        }
    }
}
```

These examples demonstrate common UI patterns and how to implement them using Blueprint. Use them as a starting point for your own projects and customize them to match your needs. 