# BlockNote Editor Component

This component provides beautiful, interactive markdown editing for the Lumine canvas system.

## Features

- **Rich Text Editing**: Built on BlockNote, providing excellent markdown editing experience
- **Math Equations**: Support for both mathematical and chemical equations using KaTeX
- **Image Support**: Drag-and-drop or paste images directly into the editor
- **Beautiful UI**: Modern, gradient-based design with smooth animations
- **View/Edit Modes**: Switch between read-only and editing modes
- **Unsaved Changes**: Tracks and shows unsaved changes with save functionality

## Installation Requirements

The BlockNote editor requires several npm packages. Install them with:

```bash
npm install @blocknote/core @blocknote/react @blocknote/mantine katex
```

## Usage

```tsx
import { BlockNoteEditor } from '@/components/block-note';

// Basic usage
<BlockNoteEditor
  value="# Hello World\n\nThis is **rich text** editing."
  onChange={(newContent) => console.log(newContent)}
  editable={true}
  minHeight={500}
/>

// With image assets mapping
<BlockNoteEditor
  value={markdownContent}
  onChange={handleChange}
  editable={true}
  assetsMapping={{
    'file-uuid': 'https://example.com/image.jpg'
  }}
/>
```

## Components

- **BlockNoteEditor**: Main editor component with beautiful UI
- **EquationModal**: Modal for inserting mathematical and chemical equations
- **CustomEquationBlock**: Custom block for rendering equations with KaTeX
- **CustomImageBlock**: Custom block for handling images

## Canvas Integration

The component is integrated into the canvas system through:
- `components/assistant-ui/canvas-sidebar.tsx` - Displays the editor
- `lib/store/canvas-store.ts` - Manages edit state and content

## Features

### Math Equations
- Type `/` to open the slash menu
- Select "Math Equation" or "Inline Math"
- Use the equation modal to create formulas with real-time KaTeX preview
- Supports both mathematical and chemical equations

### Quick Input
- Greek letters (α, β, γ, ...)
- Math operators (×, ÷, ±, ...)
- Calculus symbols (∫, ∑, √, ...)
- Functions (sin, cos, log, ...)

### Predefined Formulas
Common formulas ready to use:
- Quadratic formula
- Pythagorean theorem
- Euler's formula
- And many more...

### Image Support
- Drag and drop images
- Paste from clipboard
- Images are embedded as data URLs

## Styling

The component uses Tailwind CSS with a beautiful gradient design:
- Blue to purple gradients for headers
- Smooth transitions and animations
- Glassmorphism effects (backdrop-blur)
- Responsive design for all screen sizes
