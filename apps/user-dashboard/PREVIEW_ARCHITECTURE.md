# Preview Page Architecture

This document outlines the refactored `/preview` page architecture that follows the same principles as the `/create` page.

## Architecture Overview

The preview functionality is organized using a clean separation of concerns:

```
app/preview/[id]/page.tsx          # Route entry point
├── containers/preview/            # Business logic layer
│   └── PreviewInvitationContainer.tsx
├── hooks/preview/                 # Data & state management
│   ├── useInvitationPreview.ts
│   └── index.ts
└── components/preview/            # UI components
    ├── templates/                 # Layout templates
    │   └── PreviewLayout.tsx
    ├── organisms/                 # Complex components
    │   └── InvitationContent.tsx
    ├── molecules/                 # Reusable components
    │   ├── InvitationHeader.tsx
    │   ├── CoupleNames.tsx
    │   └── EventDetails.tsx
    └── index.ts
```

## Component Hierarchy

### 1. **Page Component** (`page.tsx`)
- **Purpose**: Route entry point with auth protection
- **Responsibilities**: Minimal wrapper, just renders container
- **Pattern**: Same as `/create` page

```tsx
function PreviewInvitationPage() {
  return <PreviewInvitationContainer />
}
export default withAuth(PreviewInvitationPage)
```

### 2. **Container Component** (`PreviewInvitationContainer.tsx`)
- **Purpose**: Orchestrates business logic and state
- **Responsibilities**: Connects hooks to UI components
- **Pattern**: Pure rendering, no logic

```tsx
export function PreviewInvitationContainer() {
  const { invitation, formData, loading, error, handleBack, handleEdit, handleShare } = useInvitationPreview()
  
  return (
    <PreviewLayout {...actions}>
      {invitation && <InvitationContent invitation={invitation} formData={formData} />}
    </PreviewLayout>
  )
}
```

### 3. **Custom Hook** (`useInvitationPreview.ts`)
- **Purpose**: Manages all preview-specific state and logic
- **Responsibilities**: Data fetching, error handling, navigation
- **Returns**: State and action handlers

```tsx
export function useInvitationPreview() {
  // State management
  // Data fetching logic
  // Action handlers
  return { invitation, formData, loading, error, handleBack, handleEdit, handleShare }
}
```

### 4. **Layout Template** (`PreviewLayout.tsx`)
- **Purpose**: Provides consistent page structure
- **Responsibilities**: Header, navigation, error states, loading states
- **Pattern**: Reusable layout with children slots

### 5. **Organism Components** (`InvitationContent.tsx`)
- **Purpose**: Complex, feature-complete components
- **Responsibilities**: Compose molecules into complete features
- **Pattern**: Domain-specific business logic

### 6. **Molecule Components**
- **`InvitationHeader.tsx`**: Invitation title and description display
- **`CoupleNames.tsx`**: Bride and groom names with elegant styling
- **`EventDetails.tsx`**: Date, time, and venue information

## Key Architectural Principles

### 🎯 **Separation of Concerns**
- **Business Logic**: Isolated in custom hooks
- **UI Logic**: Separated into focused components
- **Data Fetching**: Centralized in hooks
- **Styling**: Component-level with consistent patterns

### 🔄 **Reusability**
- **Molecules**: Reusable across different invitation types
- **Layout**: Consistent structure for all preview pages
- **Hooks**: Shareable preview logic
- **Types**: Shared interfaces and type definitions

### 🛠️ **Maintainability**
- **Single Responsibility**: Each file has one clear purpose
- **Dependency Flow**: Top-down data flow, bottom-up events
- **Testing**: Isolated components are easy to test
- **Extensibility**: Easy to add new preview features

### 📱 **Responsive Design**
- **Text Overflow**: `break-words` and `hyphens-auto` on all text
- **Mobile-First**: Responsive layouts throughout
- **Loading States**: Consistent loading indicators
- **Error Handling**: User-friendly error messages

## Benefits of This Architecture

### 🚀 **Developer Experience**
- **Predictable Structure**: Same patterns as `/create` page
- **Easy Debugging**: Clear separation makes issues easy to trace
- **Type Safety**: Full TypeScript support throughout
- **Hot Reloading**: Efficient development with minimal re-renders

### 👥 **Team Collaboration**
- **Clear Boundaries**: Team members can work on different layers
- **Consistent Patterns**: Reduced cognitive load across features
- **Code Reviews**: Focused reviews on specific concerns
- **Knowledge Transfer**: Patterns transfer between features

### 🔧 **Extensibility**
- **New Components**: Easy to add molecules/organisms
- **Feature Enhancement**: Hooks can be extended with new logic
- **Template Variations**: Multiple layout templates possible
- **Theme Support**: Consistent styling patterns ready for theming

## Future Enhancements

### 📊 **Analytics Integration**
- Add preview tracking in `useInvitationPreview` hook
- Track user interactions with preview components
- Measure preview-to-edit conversion rates

### 🎨 **Template Variations**
- Multiple layout templates for different invitation styles
- Theme switching capability
- Custom styling options

### 📱 **Mobile Optimization**
- Touch-friendly interactions
- Mobile-specific preview modes
- Gesture support for navigation

### 🔗 **Social Sharing**
- Enhanced sharing with preview images
- Social media integration
- Copy link with rich previews

## Migration Benefits

### ✅ **Immediate Improvements**
- **Text Overflow Fixed**: Proper handling of long invitation titles
- **Type Safety**: Better TypeScript integration
- **Error Handling**: More robust error states
- **Loading States**: Consistent loading experience

### ✅ **Code Quality**
- **Reduced Complexity**: Single preview page went from 262 lines to multiple focused files
- **Improved Testability**: Isolated components are easier to test
- **Better Maintainability**: Clear responsibility boundaries
- **Consistent Patterns**: Matches `/create` page architecture

### ✅ **Future-Ready**
- **Easy Extension**: New preview features can be added cleanly
- **Reusable Components**: Preview components can be used elsewhere
- **Scalable Architecture**: Supports growth in preview functionality
- **Team Scalability**: Multiple developers can work on different layers

This refactored architecture provides a solid foundation for the preview functionality while maintaining consistency with the overall application patterns.
