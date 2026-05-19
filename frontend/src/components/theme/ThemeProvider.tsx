'use client'

import { useAccessibility } from '@/hooks/useAccessibility'
import {ThemeProvider as NextThemeProvider} from 'next-themes'
import type { PropsWithChildren } from 'react'

type ThemeProviderProps = PropsWithChildren<{
    defaultTheme?: 'light' | 'dark' | 'system'
}>

function AccessibilityProvider({ children }: { children: React.ReactNode}) {
    useAccessibility()
    return <>{children}</>
}  
 
export default function ThemeProvider({ children, defaultTheme = 'light'}: ThemeProviderProps) {
    return (
        <NextThemeProvider
        attribute="class"
        defaultTheme={defaultTheme}
        storageKey="propbol-theme"
        enableSystem={false}
        disableTransitionOnChange
    >
        <AccessibilityProvider>{children}</AccessibilityProvider>
    </NextThemeProvider>
    )
}