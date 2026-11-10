// Run on macOS: swift tools/generate-social-icons.swift
// Native drawing keeps the PNG assets reproducible without external icon services or packages.
import AppKit
import ImageIO
import UniformTypeIdentifiers

let colorSpace = CGColorSpace(name: CGColorSpace.sRGB)!
let pixelSize = 192
let canvasSize: CGFloat = 48
let outputDirectory = URL(fileURLWithPath: #filePath)
    .deletingLastPathComponent().deletingLastPathComponent()
    .appendingPathComponent("assets/social", isDirectory: true)
try FileManager.default.createDirectory(at: outputDirectory, withIntermediateDirectories: true)

func color(_ hex: UInt32) -> CGColor {
    CGColor(colorSpace: colorSpace, components: [
        CGFloat((hex >> 16) & 255) / 255,
        CGFloat((hex >> 8) & 255) / 255,
        CGFloat(hex & 255) / 255,
        1,
    ])!
}

func drawGradient(_ context: CGContext, colors: [UInt32], inset: CGFloat, radius: CGFloat) {
    context.saveGState()
    let bounds = CGRect(x: inset, y: inset, width: canvasSize - 2 * inset, height: canvasSize - 2 * inset)
    context.addPath(CGPath(roundedRect: bounds, cornerWidth: radius, cornerHeight: radius, transform: nil))
    context.clip()
    let gradient = CGGradient(colorsSpace: colorSpace, colors: colors.map(color) as CFArray, locations: nil)!
    context.drawLinearGradient(gradient, start: .zero, end: CGPoint(x: 48, y: 48), options: [])
    context.restoreGState()
}

func drawFacebook(_ context: CGContext) {
    let mark = CGMutablePath()
    mark.move(to: CGPoint(x: 24.8, y: 36))
    mark.addLine(to: CGPoint(x: 19.6, y: 36))
    mark.addLine(to: CGPoint(x: 19.6, y: 25))
    mark.addLine(to: CGPoint(x: 16.5, y: 25))
    mark.addLine(to: CGPoint(x: 16.5, y: 20.4))
    mark.addLine(to: CGPoint(x: 19.6, y: 20.4))
    mark.addLine(to: CGPoint(x: 19.6, y: 17.7))
    mark.addCurve(to: CGPoint(x: 25.6, y: 11.8), control1: CGPoint(x: 19.6, y: 13.9), control2: CGPoint(x: 21.6, y: 11.8))
    mark.addCurve(to: CGPoint(x: 29.2, y: 12.2), control1: CGPoint(x: 27, y: 11.8), control2: CGPoint(x: 28.2, y: 12))
    mark.addLine(to: CGPoint(x: 29.2, y: 16.4))
    mark.addLine(to: CGPoint(x: 26.9, y: 16.4))
    mark.addCurve(to: CGPoint(x: 24.8, y: 18.6), control1: CGPoint(x: 25.3, y: 16.4), control2: CGPoint(x: 24.8, y: 17.1))
    mark.addLine(to: CGPoint(x: 24.8, y: 20.4))
    mark.addLine(to: CGPoint(x: 29, y: 20.4))
    mark.addLine(to: CGPoint(x: 28.3, y: 25))
    mark.addLine(to: CGPoint(x: 24.8, y: 25))
    mark.closeSubpath()
    context.addPath(mark)
    context.fillPath()
}

func drawInstagram(_ context: CGContext) {
    context.setLineWidth(2.5)
    context.addPath(CGPath(roundedRect: CGRect(x: 12.5, y: 12.5, width: 23, height: 23), cornerWidth: 6.5, cornerHeight: 6.5, transform: nil))
    context.strokePath()
    context.strokeEllipse(in: CGRect(x: 18.5, y: 18.5, width: 11, height: 11))
    context.fillEllipse(in: CGRect(x: 29.4, y: 15.4, width: 3.2, height: 3.2))
}

func drawLinkedIn(_ context: CGContext) {
    context.fillEllipse(in: CGRect(x: 12.8, y: 12.5, width: 4.9, height: 4.9))
    context.fill(CGRect(x: 13, y: 20, width: 4.5, height: 15))
    let mark = CGMutablePath()
    mark.move(to: CGPoint(x: 21, y: 20))
    mark.addLine(to: CGPoint(x: 25.2, y: 20))
    mark.addLine(to: CGPoint(x: 25.2, y: 22))
    mark.addCurve(to: CGPoint(x: 29.7, y: 19.5), control1: CGPoint(x: 26.2, y: 20.5), control2: CGPoint(x: 27.6, y: 19.5))
    mark.addCurve(to: CGPoint(x: 35.5, y: 26.3), control1: CGPoint(x: 34, y: 19.5), control2: CGPoint(x: 35.5, y: 22.4))
    mark.addLine(to: CGPoint(x: 35.5, y: 35))
    mark.addLine(to: CGPoint(x: 31, y: 35))
    mark.addLine(to: CGPoint(x: 31, y: 27.2))
    mark.addCurve(to: CGPoint(x: 28.4, y: 23.5), control1: CGPoint(x: 31, y: 25.2), control2: CGPoint(x: 30.8, y: 23.5))
    mark.addCurve(to: CGPoint(x: 25.5, y: 27.2), control1: CGPoint(x: 26.2, y: 23.5), control2: CGPoint(x: 25.5, y: 25.2))
    mark.addLine(to: CGPoint(x: 25.5, y: 35))
    mark.addLine(to: CGPoint(x: 21, y: 35))
    mark.closeSubpath()
    context.addPath(mark)
    context.fillPath()
}

for (name, drawMark) in [("facebook", drawFacebook), ("instagram", drawInstagram), ("linkedin", drawLinkedIn)] {
    let context = CGContext(data: nil, width: pixelSize, height: pixelSize, bitsPerComponent: 8,
                            bytesPerRow: pixelSize * 4, space: colorSpace,
                            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    let scale = CGFloat(pixelSize) / canvasSize
    context.translateBy(x: 0, y: CGFloat(pixelSize))
    context.scaleBy(x: scale, y: -scale)
    drawGradient(context, colors: [0xFF50DE, 0x7F00FF], inset: 0.5, radius: 13)
    drawGradient(context, colors: [0x3C203E, 0x21152F, 0x161625], inset: 1.5, radius: 12)
    context.setFillColor(color(0xFFFFFF))
    context.setStrokeColor(color(0xFFFFFF))
    drawMark(context)

    let url = outputDirectory.appendingPathComponent("\(name).png")
    let destination = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil)!
    CGImageDestinationAddImage(destination, context.makeImage()!, nil)
    guard CGImageDestinationFinalize(destination) else { fatalError("Could not write \(url.path)") }
    print(url.path)
}
