#import "AppDelegate.h"

#import <React/RCTBridgeModule.h>
#import <React/RCTBundleURLProvider.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>

@implementation AppDelegate

- (void)applicationDidFinishLaunching:(NSNotification *)notification
{
  self.moduleName = @"Citas";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
  self.dependencyProvider = [RCTAppDependencyProvider new];
  
  [super applicationDidFinishLaunching:notification];

  if (self.window) {
    self.window.opaque = NO;
    self.window.backgroundColor = [NSColor clearColor];
    self.window.hasShadow = NO;
    self.window.titlebarAppearsTransparent = YES;
    self.window.titleVisibility = NSWindowTitleHidden;
    self.window.styleMask = NSWindowStyleMaskTitled | NSWindowStyleMaskFullSizeContentView | NSWindowStyleMaskResizable;
    self.window.movableByWindowBackground = NO;

    [[self.window standardWindowButton:NSWindowCloseButton] setHidden:YES];
    [[self.window standardWindowButton:NSWindowMiniaturizeButton] setHidden:YES];
    [[self.window standardWindowButton:NSWindowZoomButton] setHidden:YES];

    NSView *rootView = self.window.contentViewController.view;
    if (rootView) {
      if ([rootView respondsToSelector:@selector(setBackgroundColor:)]) {
        [rootView performSelector:@selector(setBackgroundColor:) withObject:[NSColor clearColor]];
      }
      rootView.wantsLayer = YES;
      rootView.layer.backgroundColor = [NSColor clearColor].CGColor;
    }

    NSScreen *screen = [NSScreen mainScreen];
    if (screen) {
      NSRect visibleFrame = [screen visibleFrame];
      NSRect windowFrame = self.window.frame;
      windowFrame.origin.x = visibleFrame.origin.x + 16;
      windowFrame.origin.y = visibleFrame.origin.y + visibleFrame.size.height - windowFrame.size.height - 16;
      [self.window setFrame:windowFrame display:YES];
    }
  }
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feature is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
#ifdef RN_FABRIC_ENABLED
  return true;
#else
  return false;
#endif
}

@end

@interface NativeWindowControl : NSObject <RCTBridgeModule>
@end

@implementation NativeWindowControl

RCT_EXPORT_MODULE(NativeWindowControl);

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

RCT_EXPORT_METHOD(closeApp)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [NSApp terminate:nil];
  });
}

@end
