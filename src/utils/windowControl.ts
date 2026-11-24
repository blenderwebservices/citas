import { BackHandler, NativeModules, Platform } from 'react-native';

const { NativeWindowControl } = NativeModules;

export function closeApp(): void {
  if (Platform.OS === 'macos' && NativeWindowControl?.closeApp) {
    NativeWindowControl.closeApp();
    return;
  }

  if (BackHandler?.exitApp) {
    BackHandler.exitApp();
    return;
  }
}

export function setAlwaysOnTop(alwaysOnTop: boolean): void {
  if (Platform.OS === 'macos' && NativeWindowControl?.setAlwaysOnTop) {
    NativeWindowControl.setAlwaysOnTop(alwaysOnTop);
  }
}

