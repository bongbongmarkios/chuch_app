import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sbc.worshipflow',
  appName: 'SBC WorshipFlow',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
