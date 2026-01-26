# SpecsFormAccordion Component

A responsive, collapsible/accordion form component for capturing technical specifications of new cars. Built with React, TypeScript, and Tailwind CSS, following the existing design system.

## Features

- **5 Organized Categories**: Engine & Performance, Dimensions, Capacity, Warranty, and Safety
- **Responsive Design**: Mobile-first approach with optimized layouts for all screen sizes
- **Collapsible Sections**: Each category can be expanded/collapsed independently
- **Progress Indicators**: Visual badges showing filled fields count per section
- **Clean UI**: Color-coded icons for each category (Blue, Purple, Green, Amber, Red)
- **TypeScript Support**: Fully typed with `SpecsFormData` interface
- **Optional Fields**: All fields are optional, perfect for incomplete data
- **Smart Defaults**: Can configure which sections are open by default
- **Consistent Design**: Matches existing Card, Badge, and Input components

## Installation

The component is located at:
```
src/components/forms/SpecsFormAccordion.tsx
```

## Usage

### Basic Usage

```tsx
import { SpecsFormAccordion } from '@/components/forms/SpecsFormAccordion'
import { useState } from 'react'

function MyForm() {
    const [specs, setSpecs] = useState({})

    return (
        <SpecsFormAccordion
            data={specs}
            onChange={setSpecs}
        />
    )
}
```

### With Pre-filled Data

```tsx
const [specs, setSpecs] = useState({
    enginePower: 150,
    engineTorque: 250,
    seats: 5,
    abs: true,
})

<SpecsFormAccordion
    data={specs}
    onChange={setSpecs}
/>
```

### With Default Open Sections

```tsx
<SpecsFormAccordion
    data={specs}
    onChange={setSpecs}
    defaultOpen={true}  // Open all sections by default
/>

// OR open specific sections
<SpecsFormAccordion
    data={specs}
    onChange={setSpecs}
    defaultOpenSections={['engine', 'dimensions']}
/>
```

## Props

### SpecsFormAccordionProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Partial<SpecsFormData>` | `undefined` | Current form data |
| `onChange` | `(data: Partial<SpecsFormData>) => void` | `undefined` | Callback when form data changes |
| `defaultOpen` | `boolean` | `false` | Whether all sections are open by default |
| `defaultOpenSections` | `string[]` | `[]` | Array of section IDs to open by default |

### SpecsFormData Interface

```typescript
interface SpecsFormData {
    // Engine & Performance
    enginePower?: number      // in hp
    engineTorque?: number     // in Nm
    cylinders?: number
    topSpeed?: number         // in km/h
    acceleration?: number     // 0-100 km/h in seconds

    // Dimensions
    length?: number           // in mm
    width?: number            // in mm
    height?: number           // in mm
    wheelbase?: number        // in mm
    groundClearance?: number  // in mm

    // Capacity
    seats?: number
    doors?: number
    fuelTank?: number         // in Liters
    luggageCapacity?: number  // in Liters

    // Warranty
    warrantyYears?: number    // in years
    warrantyKm?: number       // in km

    // Safety
    airbags?: number
    abs?: boolean
    esp?: boolean
    tractionControl?: boolean
}
```

## Component Structure

### Section Categories

1. **Mesin & Performa** (Engine & Performance)
   - Daya Maksimum (hp)
   - Torsi (Nm)
   - Silinder
   - Kecepatan Maksimum (km/h)
   - Akselerasi 0-100 km/h (detik)

2. **Dimensi** (Dimensions)
   - Panjang (mm)
   - Lebar (mm)
   - Tinggi (mm)
   - Jarak Poros Roda (mm)
   - Ground Clearance (mm)

3. **Kapasitas** (Capacity)
   - Jumlah Kursi
   - Jumlah Pintu
   - Kapasitas Tangki (Liter)
   - Kapasitas Bagasi (Liter)

4. **Garansi** (Warranty)
   - Garansi Pabrikan (tahun)
   - Garansi Kilometer (km)

5. **Keamanan** (Safety)
   - Jumlah Airbag
   - ABS (checkbox)
   - ESP (checkbox)
   - Traction Control (checkbox)

## Design Details

### Color Scheme

- **Engine**: Blue (`text-blue-600`, `bg-blue-50`)
- **Dimensions**: Purple (`text-purple-600`, `bg-purple-50`)
- **Capacity**: Green (`text-green-600`, `bg-green-50`)
- **Warranty**: Amber (`text-amber-600`, `bg-amber-50`)
- **Safety**: Red (`text-red-600`, `bg-red-50`)

### Responsive Breakpoints

- **Mobile (< 640px)**: Single column, smaller text, compact spacing
- **Tablet (640px - 1024px)**: Two columns where applicable
- **Desktop (> 1024px)**: Optimal spacing, larger text

### Icons

Each section uses a Lucide React icon:
- Engine: `Gauge`
- Dimensions: `Ruler`
- Capacity: `Users`
- Warranty: `Shield`
- Safety: `Zap`

## Integration with Existing Form

### Step 5 Integration Example

```tsx
// In your multi-step form component
import { SpecsFormAccordion, SpecsFormData } from '@/components/forms/SpecsFormAccordion'

function NewCarForm() {
    const [formData, setFormData] = useState({
        // ... other fields
        specs: {} as Partial<SpecsFormData>,
    })

    return (
        // Step 5
        {currentStep === 5 && (
            <SpecsFormAccordion
                data={formData.specs}
                onChange={(specs) => setFormData(prev => ({ ...prev, specs }))}
                defaultOpen={false}
            />
        )}
    )
}
```

### Submit Handler

```tsx
const handleSubmit = async () => {
    const payload = {
        ...formData,
        specs: formData.specs,  // Include specs in submission
    }

    const res = await fetch('/api/listings/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
    // ...
}
```

## Examples

See `SpecsFormAccordion.example.tsx` for complete examples including:
- Basic usage
- Multi-step form integration
- Minimal integration
- Data preview and handling

## Accessibility

- All form inputs have associated labels
- Proper ARIA attributes on interactive elements
- Keyboard navigation support
- High contrast colors for readability
- Clear visual feedback on focus and hover states

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

- React 18+
- TypeScript 5+
- Tailwind CSS 3+
- Lucide React (icons)

## File Structure

```
src/components/forms/
├── SpecsFormAccordion.tsx          # Main component
├── SpecsFormAccordion.example.tsx  # Usage examples
└── SpecsFormAccordion.md           # This documentation
```

## Customization

### Adding New Fields

To add a new field to an existing section, modify the `SPEC_SECTIONS` array:

```tsx
{
    id: 'engine',
    title: 'Mesin & Performa',
    icon: Gauge,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    fields: [
        // ... existing fields
        {
            name: 'newField',
            label: 'New Field Label',
            placeholder: 'Example placeholder',
            suffix: 'unit',
            type: 'number',
            halfWidth: true,
        },
    ],
}
```

### Adding New Sections

To add a completely new section, add to the `SPEC_SECTIONS` array:

```tsx
{
    id: 'new-section',
    title: 'New Section Title',
    icon: Settings,  // Import from lucide-react
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    fields: [
        // ... fields
    ],
}
```

## Tips

1. **Data Validation**: The component doesn't include validation. Add your own validation before submission.
2. **Unit Conversion**: All numeric values are stored as-is. Handle conversion if needed.
3. **Boolean Fields**: Safety checkboxes return boolean values.
4. **Optional Fields**: Empty fields are not included in the output object.
5. **Performance**: Component uses React state efficiently with minimal re-renders.

## License

This component is part of the Cepet Deal project.
