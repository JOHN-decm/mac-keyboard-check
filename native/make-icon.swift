import AppKit

let size = 1024
let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size,
                             bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true,
                             isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
let context = NSGraphicsContext(bitmapImageRep: bitmap)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = context
let tile = NSBezierPath(roundedRect: NSRect(x: 64, y: 64, width: 896, height: 896), xRadius: 190, yRadius: 190)
NSGradient(starting: NSColor(calibratedRed: 0.1, green: 0.46, blue: 0.94, alpha: 1),
           ending: NSColor(calibratedRed: 0.04, green: 0.18, blue: 0.46, alpha: 1))!.draw(in: tile, angle: -90)
NSColor(calibratedWhite: 0.9, alpha: 1).setFill()
NSBezierPath(roundedRect: NSRect(x: 156, y: 287, width: 712, height: 410), xRadius: 48, yRadius: 48).fill()
for row in 0..<3 {
    for col in 0..<9 {
        NSColor.white.setFill()
        NSBezierPath(roundedRect: NSRect(x: 184 + col * 74, y: 518 - row * 73, width: 62, height: 59), xRadius: 10, yRadius: 10).fill()
    }
}
NSColor.white.setFill()
NSBezierPath(roundedRect: NSRect(x: 324, y: 316, width: 376, height: 42), xRadius: 9, yRadius: 9).fill()
let label: NSString = "⌘"
label.draw(at: NSPoint(x: 450, y: 591), withAttributes: [.font: NSFont.systemFont(ofSize: 88, weight: .medium),
                                                       .foregroundColor: NSColor(calibratedWhite: 0.28, alpha: 1)])
NSGraphicsContext.restoreGraphicsState()
try bitmap.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: CommandLine.arguments[1]))
