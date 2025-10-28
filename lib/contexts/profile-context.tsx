"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ProfileTypeEnum, getActiveProfileId, setActiveProfileId, clearActiveProfileId, getProfileType, setProfileType, clearProfileType, checkFeatureAccess, clearProfileContext } from '@/lib/utils/profile-utils'
import { api, endpoints } from '@/lib/api'

interface Profile {
  id: string
  name: string
  type: ProfileTypeEnum
  avatarUrl?: string
  companyName?: string
}

interface ProfileApiResponse {
  id: string
  name?: string
  company_name?: string
  profileType?: ProfileTypeEnum
  avatarUrl?: string
  companyName?: string
}

interface ApiResponse {
  data?: ProfileApiResponse
}

interface ProfileContextType {
  activeProfileId: string | null
  activeProfile: Profile | null
  profileType: ProfileTypeEnum
  isLoading: boolean
  setActiveProfile: (profileId: string, profile: Profile) => void
  clearActiveProfile: () => void
  hasFeatureAccess: (feature: string) => boolean
  refreshProfile: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

interface ProfileProviderProps {
  children: ReactNode
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(null)
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(null)
  const [profileType, setProfileTypeState] = useState<ProfileTypeEnum>(ProfileTypeEnum.Free)
  const [isLoading, setIsLoading] = useState(true)

  // Load profile context from localStorage on mount and hydrate from API
  useEffect(() => {
    let cancelled = false
    const loadProfileContext = async () => {
      try {
        const savedProfileId = getActiveProfileId()
        const savedProfileType = getProfileType()

        if (savedProfileId) {
          setActiveProfileIdState(savedProfileId)
          setProfileTypeState(savedProfileType)

          // Optimistic placeholder while fetching
          setActiveProfileState({
            id: savedProfileId,
            name: 'Loading...'
            ,
            type: savedProfileType,
            companyName: 'Loading...'
          })

          // Fetch full profile details
          try {
            const response = await api.get<ApiResponse | ProfileApiResponse>(endpoints.profileById(savedProfileId))
            if (cancelled) return
            const p = (response.data as ApiResponse)?.data ?? (response.data as ProfileApiResponse)
            if (p) {
              const hydrated: Profile = {
                id: p.id ?? savedProfileId,
                name: p.name || p.company_name || 'Profile',
                type: (typeof p.profileType !== 'undefined' ? p.profileType : savedProfileType) as ProfileTypeEnum,
                avatarUrl: p.avatarUrl,
                companyName: p.company_name || p.companyName
              }
              setActiveProfileState(hydrated)
              setProfileTypeState(hydrated.type)
              setProfileType(hydrated.type)
            }
          } catch (err) {
            console.error('Failed to hydrate profile from API:', err)
          }
        }
      } catch (error) {
        console.error('Error loading profile context:', error)
        clearProfileContext()
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    setIsLoading(true)
    loadProfileContext()
    return () => { cancelled = true }
  }, [])

  const setActiveProfile = (profileId: string, profile: Profile) => {
    setActiveProfileIdState(profileId)
    setActiveProfileState(profile)
    setProfileTypeState(profile.type)
    
    // Persist to localStorage
    setActiveProfileId(profileId)
    setProfileType(profile.type)
  }

  const clearActiveProfile = () => {
    setActiveProfileIdState(null)
    setActiveProfileState(null)
    setProfileTypeState(ProfileTypeEnum.Free)
    
    // Clear localStorage
    clearActiveProfileId()
    clearProfileType()
  }

  const hasFeatureAccess = (feature: string): boolean => {
    return checkFeatureAccess(profileType, feature)
  }

  const refreshProfile = async (): Promise<void> => {
    if (!activeProfileId) return
    try {
      setIsLoading(true)
      const response = await api.get<ApiResponse | ProfileApiResponse>(endpoints.profileById(activeProfileId))
      const p = (response.data as ApiResponse)?.data ?? (response.data as ProfileApiResponse)
      if (p) {
        const hydrated: Profile = {
          id: p.id ?? activeProfileId,
          name: p.name || p.company_name || 'Profile',
          type: (typeof p.profileType !== 'undefined' ? p.profileType : profileType) as ProfileTypeEnum,
          avatarUrl: p.avatarUrl,
          companyName: p.company_name || p.companyName
        }
        setActiveProfileState(hydrated)
        setProfileTypeState(hydrated.type)
        setProfileType(hydrated.type)
      }
    } catch (error) {
      console.error('Error refreshing profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const value: ProfileContextType = {
    activeProfileId,
    activeProfile,
    profileType,
    isLoading,
    setActiveProfile,
    clearActiveProfile,
    hasFeatureAccess,
    refreshProfile
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider')
  }
  return context
}

// Hook for checking feature access
export function useFeatureAccess(feature: string) {
  const { hasFeatureAccess } = useProfile()
  return hasFeatureAccess(feature)
}
