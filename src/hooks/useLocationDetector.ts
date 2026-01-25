'use client'

import { useState, useEffect } from 'react'

interface UserLocation {
    latitude: number
    longitude: number
    city: string
    detectedAt: Date
}

const STORAGE_KEY = 'user_location'

export function useLocationDetector() {
    const [location, setLocation] = useState<UserLocation | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [hasAskedBefore, setHasAskedBefore] = useState(false)

    useEffect(() => {
        // Check if user has already set location
        const savedLocation = localStorage.getItem(STORAGE_KEY)
        const hasAsked = localStorage.getItem(STORAGE_KEY + '_asked')

        if (savedLocation) {
            try {
                setLocation(JSON.parse(savedLocation))
            } catch (e) {
                console.error('Failed to parse saved location:', e)
            }
        }

        if (hasAsked) {
            setHasAskedBefore(true)
        } else {
            // Show modal on first visit
            setShowModal(true)
        }
    }, [])

    const handleLocationDetected = (loc: { latitude: number; longitude: number; city: string }) => {
        const userLocation: UserLocation = {
            ...loc,
            detectedAt: new Date(),
        }

        setLocation(userLocation)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userLocation))
        localStorage.setItem(STORAGE_KEY + '_asked', 'true')
        setShowModal(false)
        setHasAskedBefore(true)
    }

    const handleModalClose = () => {
        localStorage.setItem(STORAGE_KEY + '_asked', 'true')
        setShowModal(false)
        setHasAskedBefore(true)
    }

    const changeLocation = () => {
        setShowModal(true)
    }

    const clearLocation = () => {
        setLocation(null)
        localStorage.removeItem(STORAGE_KEY)
    }

    return {
        location,
        showModal,
        hasAskedBefore,
        handleLocationDetected,
        handleModalClose,
        changeLocation,
        clearLocation,
    }
}
