import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ie.listme.app',
  appName: 'ListMe',
  webDir: 'out',
  server: {
    url: 'https://www.listme.ie',
    cleartext: false,
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#121212',
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#121212',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
