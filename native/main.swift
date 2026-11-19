import AppKit
import WebKit

// Use only APIs available on macOS 11. The interface is bundled inside the app.
final class KeyboardWebView: WKWebView {
    var testingKeyboard = false

    override func performKeyEquivalent(with event: NSEvent) -> Bool {
        if testingKeyboard && event.modifierFlags.contains(.command) {
            keyDown(with: event)
            return true
        }
        return super.performKeyEquivalent(with: event)
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate,
                         WKNavigationDelegate, WKScriptMessageHandler {
    private var window: NSWindow!
    private var webView: KeyboardWebView!
    private var flagsMonitor: Any?
    private var fnDown = false
    private var isChinese: Bool {
        Locale.preferredLanguages.first?.hasPrefix("zh") ?? false
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        buildMenus()

        let controller = WKUserContentController()
        controller.add(self, name: "keyboardFocus")
        controller.addUserScript(WKUserScript(source: """
            (() => {
              const report = () => window.webkit.messageHandlers.keyboardFocus.postMessage(
                document.hasFocus() && document.activeElement?.id === 'keyboard-focus');
              document.addEventListener('focusin', report);
              document.addEventListener('focusout', () => queueMicrotask(report));
              window.addEventListener('focus', report);
              window.addEventListener('blur', report);
              report();
            })();
            """, injectionTime: .atDocumentEnd, forMainFrameOnly: true))
        let config = WKWebViewConfiguration()
        config.userContentController = controller
        webView = KeyboardWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.allowsBackForwardNavigationGestures = false

        let screen = NSScreen.main?.visibleFrame ?? NSRect(x: 0, y: 0, width: 1440, height: 900)
        let size = NSSize(width: min(1480, screen.width - 64), height: min(960, screen.height - 64))
        window = NSWindow(contentRect: NSRect(origin: .zero, size: size),
                          styleMask: [.titled, .closable, .miniaturizable, .resizable],
                          backing: .buffered, defer: false)
        window.title = isChinese ? "Mac 键盘状态检测器" : "Mac Keyboard Checker"
        window.minSize = NSSize(width: 720, height: 560)
        window.contentView = webView
        window.delegate = self
        window.isReleasedWhenClosed = false
        window.setFrameAutosaveName("KeyboardCheckerMainWindow")
        window.center()

        guard let page = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "Web") else {
            let alert = NSAlert()
            alert.messageText = "Missing bundled interface"
            alert.informativeText = "The app is missing Resources/Web/index.html. Please rebuild or reinstall it."
            alert.runModal()
            NSApp.terminate(nil)
            return
        }
        webView.loadFileURL(page, allowingReadAccessTo: page.deletingLastPathComponent())
        flagsMonitor = NSEvent.addLocalMonitorForEvents(matching: .flagsChanged) { [weak self] event in
            self?.handleFunctionFlag(event)
            return event
        }
        window.makeKeyAndOrderFront(nil)
        window.makeFirstResponder(webView)
        NSApp.activate(ignoringOtherApps: true)
    }

    private func handleFunctionFlag(_ event: NSEvent) {
        guard event.window === window else { return }
        let down = event.modifierFlags.contains(.function)
        guard down != fnDown else { return }
        fnDown = down
        guard webView.testingKeyboard else { return }
        // Fn is usually not exposed by WebKit. Forward only local window flags.
        let type = down ? "keydown" : "keyup"
        webView.evaluateJavaScript("""
            (() => {
              const area = document.getElementById('keyboard-focus');
              if (document.activeElement === area) area.dispatchEvent(new KeyboardEvent('\(type)', {
                key: 'Fn', code: 'Fn', bubbles: true, cancelable: true
              }));
            })();
            """, completionHandler: nil)
    }

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "keyboardFocus", message.frameInfo.isMainFrame,
              let active = message.body as? Bool else { return }
        webView.testingKeyboard = active && window.isKeyWindow
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url,
              let resources = Bundle.main.resourceURL else { decisionHandler(.cancel); return }
        let webRoot = resources.appendingPathComponent("Web", isDirectory: true).standardizedFileURL.path + "/"
        decisionHandler(url.isFileURL && url.standardizedFileURL.path.hasPrefix(webRoot) ? .allow : .cancel)
    }

    func windowDidResignKey(_ notification: Notification) {
        webView.testingKeyboard = false
        fnDown = false
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }

    func applicationWillTerminate(_ notification: Notification) {
        if let monitor = flagsMonitor { NSEvent.removeMonitor(monitor) }
        webView.configuration.userContentController.removeScriptMessageHandler(forName: "keyboardFocus")
    }

    @objc private func endKeyboardTest(_ sender: Any?) {
        webView.testingKeyboard = false
        webView.evaluateJavaScript("document.activeElement?.blur()", completionHandler: nil)
    }

    private func buildMenus() {
        let mainMenu = NSMenu()
        NSApp.mainMenu = mainMenu
        let appMenu = NSMenu()
        let appItem = NSMenuItem()
        appItem.submenu = appMenu
        mainMenu.addItem(appItem)
        appMenu.addItem(withTitle: isChinese ? "关于 Mac 键盘状态检测器" : "About Mac Keyboard Checker",
                        action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)), keyEquivalent: "")
        appMenu.addItem(.separator())
        let stop = NSMenuItem(title: isChinese ? "结束按键测试" : "End Keyboard Test",
                             action: #selector(endKeyboardTest(_:)), keyEquivalent: "")
        stop.target = self
        appMenu.addItem(stop)
        appMenu.addItem(.separator())
        appMenu.addItem(withTitle: isChinese ? "隐藏" : "Hide", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
        appMenu.addItem(withTitle: isChinese ? "退出" : "Quit", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")

        let edit = NSMenu(title: isChinese ? "编辑" : "Edit")
        let editItem = NSMenuItem(title: edit.title, action: nil, keyEquivalent: "")
        editItem.submenu = edit
        mainMenu.addItem(editItem)
        for (title, selector, key) in [(isChinese ? "剪切" : "Cut", "cut:", "x"),
                                        (isChinese ? "复制" : "Copy", "copy:", "c"),
                                        (isChinese ? "粘贴" : "Paste", "paste:", "v"),
                                        (isChinese ? "全选" : "Select All", "selectAll:", "a")] {
            edit.addItem(withTitle: title, action: NSSelectorFromString(selector), keyEquivalent: key)
        }
        let windowMenu = NSMenu(title: isChinese ? "窗口" : "Window")
        let windowItem = NSMenuItem(title: windowMenu.title, action: nil, keyEquivalent: "")
        windowItem.submenu = windowMenu
        mainMenu.addItem(windowItem)
        NSApp.windowsMenu = windowMenu
        windowMenu.addItem(withTitle: isChinese ? "最小化" : "Minimize", action: #selector(NSWindow.performMiniaturize(_:)), keyEquivalent: "m")
        windowMenu.addItem(withTitle: isChinese ? "缩放" : "Zoom", action: #selector(NSWindow.performZoom(_:)), keyEquivalent: "")
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
