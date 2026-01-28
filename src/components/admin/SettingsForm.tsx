'use client'

import { useState } from 'react'
import { Save, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui'
import { Card, CardContent } from '@/components/ui'

interface AppSettings {
    aiProvider: 'zhipu' | 'gemini'
    zhipuApiKey: string
    zhipuModel: string
    geminiApiKey: string
    geminiModel: string
}

interface SettingsFormProps {
    settings: AppSettings
    onSave: (settings: Partial<AppSettings>) => Promise<void>
    isSaving: boolean
}

const zhipuModels = [
    { value: 'glm-4-flash', label: 'GLM-4 Flash', description: 'Fast & cost-effective' },
    { value: 'glm-4-plus', label: 'GLM-4 Plus', description: 'Higher quality' },
    { value: 'glm-4-air', label: 'GLM-4 Air', description: 'Lightweight' },
]

const geminiModels = [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', description: 'Ultra fast & efficient' },
    { value: 'gemini-3-flash', label: 'Gemini 3 Flash', description: 'Next generation speed' },

]

export function SettingsForm({ settings, onSave, isSaving }: SettingsFormProps) {
    const [localSettings, setLocalSettings] = useState<Partial<AppSettings>>({
        aiProvider: settings.aiProvider,
        zhipuModel: settings.zhipuModel,
        geminiModel: settings.geminiModel,
        zhipuApiKey: '',
        geminiApiKey: '',
    })

    const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [testing, setTesting] = useState(false)

    const handleSave = async () => {
        // Remove empty API keys before sending
        const dataToSend = { ...localSettings }
        if (!dataToSend.zhipuApiKey || dataToSend.zhipuApiKey === '') {
            delete dataToSend.zhipuApiKey
        }
        if (!dataToSend.geminiApiKey || dataToSend.geminiApiKey === '') {
            delete dataToSend.geminiApiKey
        }

        await onSave(dataToSend)
    }

    const handleTest = async () => {
        setTesting(true)
        setTestResult(null)

        try {
            // Determine which API key to use (new or existing)
            let zhipuKey = localSettings.zhipuApiKey
            let geminiKey = localSettings.geminiApiKey

            // If new key not provided, use existing from settings
            if (!zhipuKey && localSettings.aiProvider === 'zhipu') {
                zhipuKey = settings.zhipuApiKey
            }
            if (!geminiKey && localSettings.aiProvider === 'gemini') {
                geminiKey = settings.geminiApiKey
            }

            const res = await fetch('/api/admin/settings/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    aiProvider: localSettings.aiProvider,
                    zhipuApiKey: zhipuKey,
                    zhipuModel: localSettings.zhipuModel,
                    geminiApiKey: geminiKey,
                    geminiModel: localSettings.geminiModel,
                }),
            })

            if (res.ok) {
                setTestResult({ type: 'success', message: 'API connection successful!' })
            } else {
                const error = await res.json()
                setTestResult({ type: 'error', message: error.error || 'Connection failed' })
            }
        } catch (error: any) {
            setTestResult({ type: 'error', message: error?.message || 'Connection failed' })
        } finally {
            setTesting(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* AI Configuration */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🤖</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">AI Configuration</h2>
                            <p className="text-sm text-gray-400">Pilih dan konfigurasi provider AI untuk generate artikel</p>
                        </div>
                    </div>

                    {/* AI Provider Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                            AI Provider
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setLocalSettings({ ...localSettings, aiProvider: 'zhipu' })}
                                className={`p-4 rounded-lg border text-left transition-all ${
                                    localSettings.aiProvider === 'zhipu'
                                        ? 'bg-primary/20 border-primary text-white'
                                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                                }`}
                            >
                                <div className="font-semibold">Zhipu AI</div>
                                <div className="text-xs text-gray-400 mt-1">GLM-4 models from China</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setLocalSettings({ ...localSettings, aiProvider: 'gemini' })}
                                className={`p-4 rounded-lg border text-left transition-all ${
                                    localSettings.aiProvider === 'gemini'
                                        ? 'bg-primary/20 border-primary text-white'
                                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                                }`}
                            >
                                <div className="font-semibold">Gemini AI</div>
                                <div className="text-xs text-gray-400 mt-1">Google Gemini models</div>
                            </button>
                        </div>
                    </div>

                    {/* Zhipu Configuration */}
                    <div className={`mb-6 p-4 rounded-lg border ${localSettings.aiProvider === 'zhipu' ? 'bg-gray-700/50 border-primary/30' : 'bg-gray-800/30 border-gray-700 opacity-50'}`}>
                        <h3 className="font-medium text-white mb-4">Zhipu AI Configuration</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    API Key
                                </label>
                                <input
                                    type="password"
                                    value={localSettings.zhipuApiKey}
                                    onChange={(e) => setLocalSettings({ ...localSettings, zhipuApiKey: e.target.value })}
                                    placeholder={settings.zhipuApiKey || 'Masukkan API key Zhipu'}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                                {settings.zhipuApiKey && !localSettings.zhipuApiKey && (
                                    <p className="text-xs text-gray-500 mt-1">API key tersimpan (masked untuk keamanan)</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Model
                                </label>
                                <select
                                    value={localSettings.zhipuModel}
                                    onChange={(e) => setLocalSettings({ ...localSettings, zhipuModel: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    disabled={localSettings.aiProvider !== 'zhipu'}
                                >
                                    {zhipuModels.map((model) => (
                                        <option key={model.value} value={model.value}>
                                            {model.label} - {model.description}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Gemini Configuration */}
                    <div className={`mb-6 p-4 rounded-lg border ${localSettings.aiProvider === 'gemini' ? 'bg-gray-700/50 border-primary/30' : 'bg-gray-800/30 border-gray-700 opacity-50'}`}>
                        <h3 className="font-medium text-white mb-4">Gemini AI Configuration</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    API Key
                                </label>
                                <input
                                    type="password"
                                    value={localSettings.geminiApiKey}
                                    onChange={(e) => setLocalSettings({ ...localSettings, geminiApiKey: e.target.value })}
                                    placeholder={settings.geminiApiKey || 'Masukkan API key Gemini'}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                                {settings.geminiApiKey && !localSettings.geminiApiKey && (
                                    <p className="text-xs text-gray-500 mt-1">API key tersimpan (masked untuk keamanan)</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Model
                                </label>
                                <select
                                    value={localSettings.geminiModel}
                                    onChange={(e) => setLocalSettings({ ...localSettings, geminiModel: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    disabled={localSettings.aiProvider !== 'gemini'}
                                >
                                    {geminiModels.map((model) => (
                                        <option key={model.value} value={model.value}>
                                            {model.label} - {model.description}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Test Connection */}
                    <div className="flex items-center gap-3 mb-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleTest}
                            isLoading={testing}
                        >
                            Test Connection
                        </Button>
                        {testResult && (
                            <div className={`flex items-center gap-2 text-sm ${testResult.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                {testResult.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                {testResult.message}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} isLoading={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Pengaturan
                </Button>
            </div>
        </div>
    )
}
