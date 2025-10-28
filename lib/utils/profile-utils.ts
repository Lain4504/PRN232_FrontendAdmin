// Profile utilities for managing profile context and feature access

export enum ProfileTypeEnum {
  Free = 0,
  Basic = 1,
  Pro = 2
}

export const PROFILE_TYPE_LABELS = {
  [ProfileTypeEnum.Free]: 'Free',
  [ProfileTypeEnum.Basic]: 'Basic', 
  [ProfileTypeEnum.Pro]: 'Pro',
  'Free': 'Free',
  'Basic': 'Basic',
  'Pro': 'Pro'
} as const

export const PROFILE_TYPE_COLORS = {
  [ProfileTypeEnum.Free]: 'bg-gray-100 text-gray-800',
  [ProfileTypeEnum.Basic]: 'bg-blue-100 text-blue-800',
  [ProfileTypeEnum.Pro]: 'bg-purple-100 text-purple-800',
  'Free': 'bg-gray-100 text-gray-800',
  'Basic': 'bg-blue-100 text-blue-800',
  'Pro': 'bg-purple-100 text-purple-800'
} as const

// Storage utilities
export const getActiveProfileId = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('activeProfileId')
}

export const setActiveProfileId = (profileId: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('activeProfileId', profileId)
}

export const clearActiveProfileId = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('activeProfileId')
}

export const getActiveTeamId = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('activeTeamId')
}

export const setActiveTeamId = (teamId: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('activeTeamId', teamId)
}

export const clearActiveTeamId = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('activeTeamId')
}

export const getProfileType = (): ProfileTypeEnum => {
  if (typeof window === 'undefined') return ProfileTypeEnum.Free
  const saved = localStorage.getItem('profileType')
  return saved ? parseInt(saved) as ProfileTypeEnum : ProfileTypeEnum.Free
}

export const setProfileType = (type: ProfileTypeEnum): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('profileType', type.toString())
}

export const clearProfileType = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('profileType')
}

// Feature access validation
export const checkFeatureAccess = (profileType: ProfileTypeEnum, feature: string): boolean => {
  switch (feature.toLowerCase()) {
    case 'teams':
    case 'team_management':
    case 'team_members':
      return profileType !== ProfileTypeEnum.Free
    case 'advanced_analytics':
      return profileType === ProfileTypeEnum.Pro
    case 'priority_support':
      return profileType === ProfileTypeEnum.Pro
    default:
      return true
  }
}

export const getFeatureErrorMessage = (profileType: ProfileTypeEnum, feature: string): string => {
  switch (feature.toLowerCase()) {
    case 'teams':
    case 'team_management':
    case 'team_members':
      return 'Team features require Basic or Pro subscription. Please upgrade your profile.'
    case 'advanced_analytics':
      return 'Advanced analytics require Pro subscription. Please upgrade your profile.'
    case 'priority_support':
      return 'Priority support requires Pro subscription. Please upgrade your profile.'
    default:
      return `This feature is not available for ${PROFILE_TYPE_LABELS[profileType]} profiles.`
  }
}

export const getUpgradeMessage = (currentType: ProfileTypeEnum, requiredType: ProfileTypeEnum): string => {
  if (currentType >= requiredType) return ''
  
  const currentLabel = PROFILE_TYPE_LABELS[currentType]
  const requiredLabel = PROFILE_TYPE_LABELS[requiredType]
  
  return `Upgrade from ${currentLabel} to ${requiredLabel} to access this feature.`
}

// Clear all profile context
export const clearProfileContext = (): void => {
  clearActiveProfileId()
  clearActiveTeamId()
  clearProfileType()
}

// Debug helper
export const debugProfileContext = () => {
  if (typeof window === 'undefined') return
  
  console.log('Profile Context Debug:', {
    activeProfileId: getActiveProfileId(),
    activeTeamId: getActiveTeamId(),
    profileType: PROFILE_TYPE_LABELS[getProfileType()],
    localStorage: {
      activeProfileId: localStorage.getItem('activeProfileId'),
      activeTeamId: localStorage.getItem('activeTeamId'),
      profileType: localStorage.getItem('profileType')
    }
  })
}
