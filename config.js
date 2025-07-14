// Configuration for SUNO AI Complete Builder
const config = {
  // Supabase Configuration
  supabase: {
    url: 'https://ncarwqyhpohybnignsxq.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jYXJ3cXlocG9oeWJuaWduc3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODgwMDAsImV4cCI6MjA2ODA2NDAwMH0.Uc9JQYRaIJpHaJNB3-QJLZSZjEYat5He7MMAogD4ruI'
  },
  
  // Stripe Configuration (for future use)
  stripe: {
    publishableKey: 'pk_live_YOUR_PUBLISHABLE_KEY_HERE', // Replace with your actual key
    accountId: 'acct_1NGFrXLopXhymmb3'
  },
  
  // App Configuration
  app: {
    name: 'SUNO AI Complete Builder',
    url: 'https://suno-ai-complete-builder.vercel.app',
    version: '1.0.0'
  },
  
  // Usage Limits
  limits: {
    free: {
      promptGenerations: 100,
      lyricGenerations: 3
    },
    premium: {
      promptGenerations: -1, // unlimited
      lyricGenerations: -1   // unlimited
    }
  },
  
  // Subscription Plans (for future use)
  plans: {
    premium: {
      name: 'Premium Plan',
      price: 9.99,
      currency: 'USD',
      interval: 'month',
      features: [
        '無制限プロンプト生成',
        '無制限Pro歌詞生成',
        '優先サポート',
        '新機能への早期アクセス'
      ]
    }
  },
  
  // Authentication Configuration
  auth: {
    enableEmailAuth: true,
    enableGoogleAuth: false, // Temporarily disabled until OAuth is configured
    enableSignUp: true,
    requireEmailConfirmation: true // メール確認を有効化
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
}

// Make available globally
window.SUNO_CONFIG = config;
