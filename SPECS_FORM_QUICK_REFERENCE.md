# SpecsFormAccordion - Quick Reference Guide

## Import

```tsx
import { SpecsFormAccordion, SpecsFormData } from '@/components/forms/SpecsFormAccordion'
```

## Basic Usage

```tsx
const [specs, setSpecs] = useState<Partial<SpecsFormData>>({})

<SpecsFormAccordion
    data={specs}
    onChange={setSpecs}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `data` | `Partial<SpecsFormData>` | No | `undefined` | Current form values |
| `onChange` | `(data) => void` | No | `undefined` | Change callback |
| `defaultOpen` | `boolean` | No | `false` | Open all sections |
| `defaultOpenSections` | `string[]` | No | `[]` | Sections to open |

## Data Structure

```typescript
interface SpecsFormData {
    // Engine
    enginePower?: number      // hp
    engineTorque?: number     // Nm
    cylinders?: number
    topSpeed?: number         // km/h
    acceleration?: number     // seconds

    // Dimensions
    length?: number           // mm
    width?: number            // mm
    height?: number           // mm
    wheelbase?: number        // mm
    groundClearance?: number  // mm

    // Capacity
    seats?: number
    doors?: number
    fuelTank?: number         // Liters
    luggageCapacity?: number  // Liters

    // Warranty
    warrantyYears?: number    // years
    warrantyKm?: number       // km

    // Safety
    airbags?: number
    abs?: boolean
    esp?: boolean
    tractionControl?: boolean
}
```

## Section IDs

```typescript
'engine'      // Mesin & Performa
'dimensions'  // Dimensi
'capacity'    // Kapasitas
'warranty'    // Garansi
'safety'      // Keamanan
```

## Common Patterns

### With Initial Data
```tsx
const [specs, setSpecs] = useState<Partial<SpecsFormData>>({
    enginePower: 150,
    seats: 5,
    abs: true,
})
```

### Open Specific Sections
```tsx
<SpecsFormAccordion
    data={specs}
    onChange={setSpecs}
    defaultOpenSections={['engine', 'dimensions']}
/>
```

### Handle Submission
```tsx
const handleSubmit = async () => {
    const payload = {
        ...otherData,
        specs: specs,  // Include specs
    }
    await fetch('/api/listings', {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}
```

### Validation Example
```tsx
const isValid = specs.enginePower && specs.enginePower > 0
if (!isValid) {
    alert('Please enter engine power')
    return
}
```

### Reset Form
```tsx
const resetSpecs = () => {
    setSpecs({})
}
```

## File Locations

```
Component:     src/components/forms/SpecsFormAccordion.tsx
Docs:          src/components/forms/SpecsFormAccordion.md
Examples:      src/components/forms/SpecsFormAccordion.example.tsx
Demo:          src/app/demo/specs-form/page.tsx
Integration:   src/app/dashboard/listings/new/page.tsx (Step 5)
```

## Colors

| Section | Color | Tailwind |
|---------|-------|----------|
| Engine | Blue | `text-blue-600`, `bg-blue-50` |
| Dimensions | Purple | `text-purple-600`, `bg-purple-50` |
| Capacity | Green | `text-green-600`, `bg-green-50` |
| Warranty | Amber | `text-amber-600`, `bg-amber-50` |
| Safety | Red | `text-red-600`, `bg-red-50` |

## Icons (Lucide)

```tsx
import { Gauge, Ruler, Users, Shield, Zap, Settings } from 'lucide-react'
```

## Demo URLs

```
Local:         http://localhost:3000/demo/specs-form
Production:    /demo/specs-form
Admin Form:    /dashboard/listings/new (Step 5)
```

## Quick Tips

1. **All fields are optional** - Don't validate unless required
2. **Numbers are stored as-is** - No automatic unit conversion
3. **Booleans for safety features** - `abs`, `esp`, `tractionControl`
4. **Use `defaultOpenSections`** - Better UX than opening all
5. **Check data before submit** - Filter out undefined values

## Example Data

```typescript
// Toyota Avanza
const avanzaSpecs: SpecsFormData = {
    enginePower: 106,
    engineTorque: 140,
    cylinders: 4,
    seats: 7,
    fuelTank: 45,
    airbags: 2,
    abs: true,
}

// Honda Brio RS
const brioSpecs: SpecsFormData = {
    enginePower: 120,
    engineTorque: 173,
    acceleration: 10.8,
    seats: 5,
    airbags: 6,
    abs: true,
    esp: true,
    tractionControl: true,
}
```

## Integration Checklist

- [ ] Import component
- [ ] Add state for specs
- [ ] Pass data and onChange props
- [ ] Update form submission
- [ ] Test on mobile and desktop
- [ ] Verify data persistence
- [ ] Check accessibility

## Troubleshooting

### Issue: Changes not saving
**Solution:** Ensure `onChange` is properly updating state

### Issue: Type errors
**Solution:** Use `Partial<SpecsFormData>` type

### Issue: Not responsive
**Solution:** Check Tailwind classes for `sm:` breakpoints

### Issue: Sections always closed
**Solution:** Set `defaultOpen={true}` or use `defaultOpenSections`

## Support Files

- Full documentation: `SpecsFormAccordion.md`
- Visual guide: `SPECS_FORM_VISUAL_GUIDE.md`
- Implementation summary: `SPECS_FORM_IMPLEMENTATION.md`
- Examples: `SpecsFormAccordion.example.tsx`

---

**Version:** 1.0.0
**Last Updated:** 2026-01-27
**Status:** Production Ready
