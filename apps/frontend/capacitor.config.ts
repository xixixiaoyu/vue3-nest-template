import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.myapp.app',
  appName: 'My App',
  webDir: 'dist',
  server: {
    // 开发时可启用热重载（取消注释并修改为本机 IP）
    // url: 'http://192.168.x.x:5173',
    // cleartext: true,
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
    },
  },
}

export default config
