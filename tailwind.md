# Tailwind CSS Configuration Issues and Solutions

## Issue: Unknown Utility Class `bg-surface-50`

### Problem Description
When using the `bg-surface-50` utility class from Skeleton UI in the layout file, the following error occurred:

```
[postcss] Cannot apply unknown utility class: bg-surface-50
```

This error occurred because:
1. The project is using Tailwind CSS v4 (beta)
2. The surface color utilities need to be configured differently in v4
3. The project was using v3 syntax and configuration patterns

### Solution Steps (Tailwind CSS v4)
1. Update dependencies to use v4-specific packages:
   ```bash
   pnpm remove tailwindcss @tailwindcss/postcss @tailwindcss/vite
   pnpm add -D tailwindcss@4 @tailwindcss/postcss@latest @tailwindcss/vite@latest
   ```

2. Update PostCSS configuration for v4 in `postcss.config.js`:
   ```javascript
   export default {
     plugins: {
       '@tailwindcss/postcss': {},
     },
   }
   ```

3. Replace old `@tailwind` directives with new v4 import in `app.css`:
   ```css
   @import "tailwindcss";
   ```

4. Convert utility classes to use the new v4 `@utility` syntax:
   ```css
   @utility auth-layout {
     min-height: 100vh;
     display: grid;
     place-items: center;
     background-color: var(--color-surface-50);
   }

   :root[data-theme="dark"] .auth-layout {
     background-color: var(--color-surface-900);
   }
   ```

### Implementation Details
The solution involves:
1. Using v4-specific packages and syntax
2. Converting utility classes to use CSS variables
3. Using the new `@utility` directive for custom utilities
4. Properly handling dark mode with CSS selectors

### Results
After implementing these changes:
1. The surface color utilities work correctly
2. Dark mode is handled through CSS variables
3. Custom utilities are properly scoped
4. The configuration follows v4 best practices

### Notes
- Tailwind CSS v4 requires modern browsers (Safari 16.4+, Chrome 111+, Firefox 128+)
- CSS variables are now used instead of utility classes for theme values
- The `@utility` directive replaces `@layer utilities` for custom utilities
- Dark mode is handled through CSS selectors rather than utility classes

### References
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)

### Alternative Approaches
If the above solution doesn't work, alternative approaches include:
1. Using custom color classes instead of surface colors
2. Downgrading to Tailwind CSS v3 where surface colors are known to work
3. Using inline theme variables from Skeleton UI

### Notes
- The type assertions (`as any`) are used as a temporary solution until proper type definitions are available
- This configuration supports all Skeleton UI color variants and opacity modifiers
- The solution maintains compatibility with Tailwind CSS v4 beta features
- PostCSS configuration is simplified to use standard plugins
- Vite configuration is streamlined by removing redundant Tailwind plugin 