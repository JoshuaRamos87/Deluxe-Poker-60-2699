import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.retropoker.app',
  appName: 'Retro Poker',
  webDir: 'dist/frontend/browser',
  plugins: {
    StatusBar: {
      backgroundColor: '#1a1a1a',
    },
  },
};

export default config;
