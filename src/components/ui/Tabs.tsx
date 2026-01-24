'use client'

import { useState, createContext, useContext } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextType {
    activeTab: string
    setActiveTab: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

interface TabsProps {
    defaultValue: string
    children: React.ReactNode
    className?: string
    onChange?: (value: string) => void
}

export function Tabs({ defaultValue, children, className, onChange }: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultValue)

    const handleTabChange = (value: string) => {
        setActiveTab(value)
        onChange?.(value)
    }

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    )
}

function useTabsContext() {
    const context = useContext(TabsContext)
    if (!context) {
        throw new Error('Tabs components must be used within a Tabs provider')
    }
    return context
}

interface TabsListProps {
    children: React.ReactNode
    className?: string
}

export function TabsList({ children, className }: TabsListProps) {
    return (
        <div
            className={cn(
                'flex gap-1 p-1 bg-gray-100 rounded-lg',
                className
            )}
            role="tablist"
        >
            {children}
        </div>
    )
}

interface TabsTriggerProps {
    value: string
    children: React.ReactNode
    className?: string
    disabled?: boolean
}

export function TabsTrigger({ value, children, className, disabled = false }: TabsTriggerProps) {
    const { activeTab, setActiveTab } = useTabsContext()
    const isActive = activeTab === value

    return (
        <button
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => !disabled && setActiveTab(value)}
            className={cn(
                'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all',
                isActive
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
            disabled={disabled}
        >
            {children}
        </button>
    )
}

interface TabsContentProps {
    value: string
    children: React.ReactNode
    className?: string
}

export function TabsContent({ value, children, className }: TabsContentProps) {
    const { activeTab } = useTabsContext()

    if (activeTab !== value) return null

    return (
        <div role="tabpanel" className={cn('mt-4', className)}>
            {children}
        </div>
    )
}
