# Mac 键盘状态检测器 / Mac Keyboard Status Checker

## 中文

直接双击 `index.html`，或在该目录运行任意静态文件服务器即可使用。点击顶部的 **English** 按钮可以切换为英文界面。

本地应用：打开 `dist/Mac-Keyboard-Checker-1.0.0-Universal.dmg`，把 **Mac Keyboard Checker.app** 拖到 Applications；也可以直接运行 `dist` 中的 `.app`。应用使用 AppKit + WKWebView，网页资源随包内置，不需要浏览器、服务器或网络。App 中隐藏“最近一次输入”和“使用说明”，网页版仍然显示。

App 使用固定窗口布局，为底部五个修饰键状态保留一条约 60px 的状态栏；键盘随窗口宽高按比例适配。三种带数字区的键盘在网页和 App 中均可使用更宽的面板（最大 1480px），紧凑版保持独立尺寸。

目标系统为 **macOS 11.0 及以上**，同一程序包含 **x86_64 + arm64**，支持 Intel 和 Apple 芯片。已在本机 Intel Mac 上验证启动和普通键/Command 组合键事件；尚未在 macOS 11 或 Apple 芯片真机上验证。为早期 macOS 11 WebKit 提供了键盘高度比例兼容样式。

构建：安装完整 Xcode 后，在项目目录执行 `./build-macos.sh`，会生成 `.app`、Universal ZIP、DMG。原生源码在 `native/`。应用默认使用 ad-hoc 临时签名；本机没有 Developer ID 证书，当前安装包**未经过 Apple 公证**。正式对外分发需使用 Developer ID Application 证书（通过 `SIGN_IDENTITY` 环境变量指定）重新打包，并完成 Apple 公证及 stapling。更换签名不会自动完成公证。

映射回归检查：安装 Node.js 后运行 `node tests/key-mappings.test.cjs`，覆盖七种布局、笔记本 Fn/Ctrl 换位、逐键高亮与松开、左右修饰键同时按住的状态。复用布局只复用位置，不将 Home、End、Insert、Delete 或 Print Screen、Scroll Lock、Pause 冒充为 F13–F16。键盘驱动或固件重映射后，以系统实际发出的事件为准；这些检查不替代各型号真机测试。

测试期间可拦截应用内常见 Command 快捷键。点击测试区外，或在应用菜单选择“结束按键测试”，可恢复常规快捷键。Fn 通过当前窗口的本地修饰键事件补充识别；实际可用性取决于硬件、驱动及 macOS 设置。系统锁屏、系统保留快捷键、Touch ID 生物认证不能作为普通网页按键读取或屏蔽。应用不进行全局键盘监听，不需要辅助功能或输入监控授权。

页面会在当前浏览器页面获得焦点时读取 `keydown` / `keyup` 事件，并提供 Magic Keyboard、标准104美式键盘 英语-美国、常见笔记本电脑键盘（带独立数字区）、MacBook Pro、MacBook Air、MacBook Neo 等布局可选。标准美式和笔记本布局使用 Ctrl、Alt、Win、Insert、Num Lock 等键帽文字，但底层仍按 Mac 的 Meta/Alt/Control 方式监听，适合黑苹果用户。MacBook 版本复用紧凑键盘面板，只调整笔记本方向键排列。键盘会在对应按键位置实时高亮。浏览器无法读取其他应用中的系统级键盘状态。

## English

Double-click `index.html`, or serve this folder with any static file server. Use the **中文** button at the top to switch back to Chinese.

Native app: open `dist/Mac-Keyboard-Checker-1.0.0-Universal.dmg` and drag **Mac Keyboard Checker.app** to Applications, or run the app directly from `dist`. AppKit + WKWebView loads the bundled interface offline without a separate browser or server. The native app hides the event history and usage panels; the website retains them.

The native window reserves a compact 60px modifier status strip and fits each keyboard proportionally to the remaining width and height. All three layouts with numeric keypads can use panels up to 1480px wide in both the website and app; compact keyboards keep their own sizing.

The deployment target is **macOS 11.0+**, with **x86_64 and arm64** in one Universal executable. Startup, regular keys, and Command combinations were checked on the current Intel Mac. macOS 11 and Apple silicon hardware have not been tested. A layout fallback supports early macOS 11 WebKit versions without CSS aspect-ratio.

Build with full Xcode installed: run `./build-macos.sh`. It produces an app, Universal ZIP, and DMG. Native sources are in `native/`. The current build is ad-hoc signed and **not notarized**. Public distribution requires a Developer ID Application certificate (`SIGN_IDENTITY`), notarization, and stapling. Setting the signing identity does not notarize the app automatically.

Mapping regression checks: with Node.js installed, run `node tests/key-mappings.test.cjs`. It covers all seven layouts, laptop Fn/Ctrl swapping, key highlights/releases, and modifiers held on both sides. Reused positions do not bind Home/End/Insert/Delete or Print Screen/Scroll Lock/Pause to placeholder F13–F16 events. Firmware and driver remapping can change the events received from macOS; automated checks do not replace physical keyboard testing.

Click outside the test area or choose **End Keyboard Test** from the app menu to restore normal shortcuts. Fn support supplements WebKit with local window modifier events and depends on hardware, drivers, and macOS settings. System-reserved shortcuts and Touch ID authentication cannot be captured or blocked as ordinary keys. The app does not monitor global input and requires no Accessibility or Input Monitoring permission.

When this page has focus, it reads `keydown` and `keyup` events and lets you choose Magic Keyboard, a standard 104-key US keyboard (English — United States), a common laptop keyboard with a dedicated numeric keypad, MacBook Pro, MacBook Air, or MacBook Neo layouts. Standard US and laptop layouts use Ctrl, Alt, Win, Insert, and Num Lock labels while retaining Mac Meta/Alt/Control event handling for Hackintosh users. MacBook versions reuse the compact panel and only change the laptop-style arrow-key arrangement. Matching keys are highlighted in real time. A browser page cannot read system-wide keyboard state from other applications.
