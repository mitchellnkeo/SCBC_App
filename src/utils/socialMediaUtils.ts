export type SocialPlatform = 'instagram' | 'twitter' | 'linkedin';

export interface SocialMediaConfig {
  baseUrl: string;
  appScheme?: string;
  usernamePrefix?: string;
}

const SOCIAL_MEDIA_CONFIGS: Record<SocialPlatform, SocialMediaConfig> = {
  instagram: {
    baseUrl: 'https://instagram.com/',
    appScheme: 'instagram://user?username=',
    usernamePrefix: '@',
  },
  twitter: {
    baseUrl: 'https://twitter.com/',
    appScheme: 'twitter://user?screen_name=',
    usernamePrefix: '@',
  },
  linkedin: {
    baseUrl: 'https://linkedin.com/in/',
    // LinkedIn doesn't have a reliable app scheme for profiles
  },
};

/**
 * Clean username by removing common prefixes and symbols
 */
export const cleanUsername = (username: string, platform: SocialPlatform): string => {
  if (!username) return '';
  
  let cleaned = username.trim();
  
  // Remove @ symbol if present
  if (cleaned.startsWith('@')) {
    cleaned = cleaned.substring(1);
  }
  
  // Remove platform-specific URL parts if user pasted a full URL
  const config = SOCIAL_MEDIA_CONFIGS[platform];
  const baseUrl = config.baseUrl;
  
  if (cleaned.includes(baseUrl)) {
    // Extract username from full URL
    const urlParts = cleaned.split(baseUrl);
    if (urlParts.length > 1) {
      cleaned = urlParts[1].split('/')[0].split('?')[0];
    }
  }
  
  // Handle other common URL patterns
  if (platform === 'linkedin') {
    // Handle linkedin.com/in/username patterns
    if (cleaned.includes('linkedin.com/in/')) {
      const parts = cleaned.split('linkedin.com/in/');
      if (parts.length > 1) {
        cleaned = parts[1].split('/')[0].split('?')[0];
      }
    }
  }
  
  // Remove any remaining special characters except allowed ones
  cleaned = cleaned.replace(/[^a-zA-Z0-9._-]/g, '');
  
  return cleaned;
};

/**
 * Convert username to proper web URL
 */
export const getUserWebUrl = (username: string, platform: SocialPlatform): string => {
  const cleaned = cleanUsername(username, platform);
  if (!cleaned) return '';
  
  const config = SOCIAL_MEDIA_CONFIGS[platform];
  return `${config.baseUrl}${cleaned}`;
};

/**
 * Convert username to app deep link URL (for mobile apps)
 */
export const getUserAppUrl = (username: string, platform: SocialPlatform): string => {
  const cleaned = cleanUsername(username, platform);
  if (!cleaned) return '';
  
  const config = SOCIAL_MEDIA_CONFIGS[platform];
  if (!config.appScheme) return '';
  
  return `${config.appScheme}${cleaned}`;
};

/**
 * Get display format for username (with @ prefix if applicable)
 */
export const getDisplayUsername = (username: string, platform: SocialPlatform): string => {
  const cleaned = cleanUsername(username, platform);
  if (!cleaned) return '';
  
  const config = SOCIAL_MEDIA_CONFIGS[platform];
  if (config.usernamePrefix && !cleaned.startsWith(config.usernamePrefix)) {
    return `${config.usernamePrefix}${cleaned}`;
  }
  
  return cleaned;
};

/**
 * Validate username format for a platform
 */
export const isValidUsername = (username: string, platform: SocialPlatform): boolean => {
  const cleaned = cleanUsername(username, platform);
  if (!cleaned) return false;
  
  // Basic validation rules
  switch (platform) {
    case 'instagram':
      // Instagram usernames: 1-30 characters, letters, numbers, periods, underscores
      return /^[a-zA-Z0-9._]{1,30}$/.test(cleaned);
    
    case 'twitter':
      // Twitter usernames: 1-15 characters, letters, numbers, underscores
      return /^[a-zA-Z0-9_]{1,15}$/.test(cleaned);
    
    case 'linkedin':
      // LinkedIn: more flexible, but basic check
      return /^[a-zA-Z0-9._-]{1,50}$/.test(cleaned) && cleaned.length >= 3;
    
    default:
      return false;
  }
};

/**
 * Get platform name for display
 */
export const getPlatformDisplayName = (platform: SocialPlatform): string => {
  switch (platform) {
    case 'instagram':
      return 'Instagram';
    case 'twitter':
      return 'Twitter';
    case 'linkedin':
      return 'LinkedIn';
    default:
      return platform;
  }
};

/**
 * Get platform emoji
 */
export const getPlatformEmoji = (platform: SocialPlatform): string => {
  switch (platform) {
    case 'instagram':
      return '📷';
    case 'twitter':
      return '🐦';
    case 'linkedin':
      return '💼';
    default:
      return '🔗';
  }
}; 