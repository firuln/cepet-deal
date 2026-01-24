'use client'

import { useState } from 'react'
import { Car, Armchair, Shield, Music } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CarFeature {
    id: string
    category: string
    name: string
}

interface CarFeaturesProps {
    features: CarFeature[]
}

const CATEGORY_CONFIG = [
    {
        key: 'Eksterior',
        label: 'Eksterior',
        icon: Car,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
    },
    {
        key: 'Interior',
        label: 'Interior',
        icon: Armchair,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
    },
    {
        key: 'Keselamatan',
        label: 'Keselamatan',
        icon: Shield,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
    },
    {
        key: 'Hiburan',
        label: 'Hiburan',
        icon: Music,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
    },
]

export function CarFeatures({ features }: CarFeaturesProps) {
    const [activeTab, setActiveTab] = useState('Eksterior')

    // Group features by category
    const featuresByCategory = features.reduce((acc, feature) => {
        if (!acc[feature.category]) {
            acc[feature.category] = []
        }
        acc[feature.category].push(feature)
        return acc
    }, {} as Record<string, CarFeature[]>)

    // Get available categories
    const availableCategories = CATEGORY_CONFIG.filter(config =>
        featuresByCategory[config.key]?.length > 0
    )

    // If no features, don't render
    if (features.length === 0) return null

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            {/* Tabs Header */}
            <div className="border-b border-gray-200">
                <div className="flex overflow-x-auto scrollbar-hide">
                    {availableCategories.map((config) => {
                        const Icon = config.icon
                        const isActive = activeTab === config.key
                        const count = featuresByCategory[config.key]?.length || 0

                        return (
                            <button
                                key={config.key}
                                onClick={() => setActiveTab(config.key)}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap transition-all duration-200 border-b-2 flex-1 min-w-max justify-center',
                                    isActive
                                        ? `${config.color} ${config.borderColor} border-current`
                                        : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                                )}
                            >
                                <Icon className={cn('w-4 h-4', isActive ? config.color : 'text-gray-400')} />
                                <span>{config.label}</span>
                                <span className={cn(
                                    'ml-1 px-2 py-0.5 rounded-full text-xs',
                                    isActive ? config.bgColor + ' ' + config.color : 'bg-gray-100 text-gray-500'
                                )}>
                                    {count}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
                {availableCategories.map((config) => {
                    const isActive = activeTab === config.key
                    const categoryFeatures = featuresByCategory[config.key] || []

                    if (!isActive) return null

                    return (
                        <div
                            key={config.key}
                            className="animate-fade-in"
                        >
                            {/* Category Header */}
                            <div className={cn(
                                'flex items-center gap-2 mb-4 pb-3 border-b',
                                config.borderColor
                            )}>
                                <div className={cn('p-2 rounded-lg', config.bgColor)}>
                                    <config.icon className={cn('w-5 h-5', config.color)} />
                                </div>
                                <div>
                                    <h3 className={cn('font-semibold text-lg', config.color)}>
                                        {config.label}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {categoryFeatures.length} fitur tersedia
                                    </p>
                                </div>
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {categoryFeatures.map((feature) => (
                                    <div
                                        key={feature.id}
                                        className={cn(
                                            'flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all duration-200 hover:shadow-md',
                                            config.borderColor,
                                            config.bgColor
                                        )}
                                    >
                                        <div className={cn(
                                            'w-1.5 h-1.5 rounded-full flex-shrink-0',
                                            isActive ? config.color.replace('text-', 'bg-') : 'bg-gray-400'
                                        )} />
                                        <span className="text-sm font-medium text-gray-700">
                                            {feature.name}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Empty State */}
                            {categoryFeatures.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-400 text-sm">
                                        Tidak ada fitur {config.label.toLowerCase()} yang terdaftar
                                    </p>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Custom scrollbar styles */}
            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}
