# AI Development Rules

This document outlines the technology stack and specific library usage guidelines for this Liviskov Professional application. Adhering to these rules will help maintain consistency, improve collaboration, and ensure the AI assistant can effectively understand and modify the codebase.

## Tech Stack Overview

The application is built using the following core technologies:

* **Framework**: Next.js (App Router)
* **Language**: TypeScript
* **UI Components**: Shadcn/UI - Collection of re-usable UI components built with Radix UI and Tailwind CSS
* **Styling**: Tailwind CSS - Utility-first CSS framework for rapid UI development
* **Authentication**: Firebase Auth for user authentication and session management
* **Database**: Firebase Firestore for real-time data storage
* **Icons**: Lucide React - Comprehensive library of simply beautiful SVG icons
* **Forms**: React Hook Form with Zod validation
* **Notifications**: Custom toast system based on Radix UI Toast component
* **Video**: react-youtube for YouTube video integration
* **Payments**: Stripe integration for course purchases
* **Analytics**: Firebase analytics and Crisp chat widget

## Library Usage Guidelines

To ensure consistency and leverage the chosen stack effectively, please follow these rules:

### 1. UI Components
* **Primary Choice**: Always use components from `src/components/ui/` directory (Shadcn/UI components)
* **Custom Components**: When creating new components, follow Shadcn/UI composition patterns using Radix UI primitives and Tailwind CSS styling
* **Avoid**: Introducing new third-party UI component libraries without explicit need

### 2. Styling
* **Primary Choice**: Use Tailwind CSS utility classes for all styling
* **Global Styles**: Use `src/app/globals.css` only for Tailwind directives and CSS variable definitions
* **Avoid**: CSS-in-JS libraries (Styled Components, Emotion) - only Tailwind CSS allowed

### 3. Forms
* **Management**: Use `react-hook-form` for all form state and submission logic
* **Validation**: Use `zod` for schema validation with `@hookform/resolvers`
* **Error Handling**: Display validation errors using Shadcn/UI Form components

### 4. Authentication & Database
* **Authentication**: Use Firebase Auth through custom hooks (`useUser`, `useAuth`)
* **Data Fetching**: Use Firebase Firestore with custom hooks (`useCollection`, `useDoc`, `useMemoFirebase`)
* **Updates**: Use non-blocking update functions (`setDocumentNonBlocking`, `addDocumentNonBlocking`)

### 5. State Management
* **Local State**: Use React's `useState` and `useReducer` for component-level state
* **Shared State**: Use React Context API through Firebase Provider system
* **Avoid**: External state management libraries unless explicitly necessary

### 6. File Structure
* **Pages**: Place in `src/pages/` directory
* **Components**: Place in `src/components/` directory
* **Hooks**: Place in `src/hooks/` directory
* **Lib**: Place utilities in `src/lib/` directory
* **Firebase**: Place Firebase-related code in `src/firebase/` directory

### 7. TypeScript
* **Mandatory**: Write all new code in TypeScript
* **Types**: Define proper interfaces and types for all components and data structures
* **Strict Mode**: Enable strict TypeScript configuration

### 8. Image Handling
* **Next.js Image**: Use Next.js `Image` component for all images
* **Optimization**: Specify proper width/height and use `priority` for above-the-fold images
* **Placeholders**: Use the placeholder images system when appropriate

### 9. Authentication Flow
* **Protected Routes**: Use the `useUser` hook to check authentication status
* **Redirects**: Implement proper redirect logic for authenticated/unauthenticated users
* **Loading States**: Show loading states during authentication checks

### 10. Error Handling
* **Global Errors**: Use the Firebase error emitter system for permission errors
* **User Feedback**: Show meaningful error messages using the toast system
* **Fallbacks**: Implement proper error boundaries and loading states

### 11. Accessibility
* **Semantic HTML**: Use proper HTML elements and ARIA attributes
* **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
* **Focus Management**: Manage focus properly in modals and dynamic content

### 12. Performance
* **Code Splitting**: Use Next.js dynamic imports for heavy components
* **Memoization**: Use `useMemo` and `useCallback` appropriately for performance optimization
* **Image Optimization**: Leverage Next.js image optimization features

## Component Creation Guidelines

When creating new components:
1. Create individual files for each component
2. Follow Shadcn/UI naming conventions and patterns
3. Export components as default exports
4. Use TypeScript interfaces for props
5. Implement responsive design with Tailwind CSS
6. Include proper error boundaries and loading states
7. Ensure accessibility compliance

## Firebase Guidelines

* **Security Rules**: All data access must comply with Firestore security rules
* **Real-time Updates**: Use the provided hooks for real-time data synchronization
* **Error Handling**: Handle permission errors through the error emitter system
* **Performance**: Optimize queries and use proper indexing

## Code Quality Standards

* **Formatting**: Use consistent code formatting (prettier recommended)
* **Imports**: Organize imports logically (external libraries first, then internal)
* **Comments**: Add meaningful comments for complex logic
* **Naming**: Use descriptive names for variables, functions, and components

By following these guidelines, we can maintain a consistent, maintainable, and scalable codebase that delivers an excellent user experience.