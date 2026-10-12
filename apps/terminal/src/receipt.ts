const ESC = 0x1b
const GS = 0x1d

export interface Receipt {
  shop: string
  date: string
  items: string
  total: string
  tx: string
  link: string
}

/** Thermal printers here print plain ASCII, so accents are dropped rather than garbled. */
function ascii(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[·•]/g, "-")
    .replace(/[^\x20-\x7e]/g, "?")
}

class EscPos {
  private bytes: number[] = [ESC, 0x40]

  raw(...values: number[]) {
    this.bytes.push(...values)
    return this
  }

  text(value: string) {
    for (const char of ascii(value)) this.bytes.push(char.charCodeAt(0))
    return this.raw(0x0a)
  }

  align(position: "left" | "center") {
    return this.raw(ESC, 0x61, position === "center" ? 1 : 0)
  }

  bold(on: boolean) {
    return this.raw(ESC, 0x45, on ? 1 : 0)
  }

  big(on: boolean) {
    return this.raw(GS, 0x21, on ? 0x11 : 0x00)
  }

  qr(data: string) {
    const payload = [...new TextEncoder().encode(data)]
    const length = payload.length + 3
    return this.raw(GS, 0x28, 0x6b, 4, 0, 0x31, 0x41, 0x32, 0)
      .raw(GS, 0x28, 0x6b, 3, 0, 0x31, 0x43, 6)
      .raw(GS, 0x28, 0x6b, 3, 0, 0x31, 0x45, 0x31)
      .raw(GS, 0x28, 0x6b, length & 0xff, length >> 8, 0x31, 0x50, 0x30, ...payload)
      .raw(GS, 0x28, 0x6b, 3, 0, 0x31, 0x51, 0x30)
      .raw(0x0a)
  }

  feed(lines: number) {
    return this.raw(ESC, 0x64, lines)
  }

  base64() {
    let binary = ""
    for (const byte of this.bytes) binary += String.fromCharCode(byte)
    return btoa(binary)
  }
}

export function receiptEscPos(receipt: Receipt): string {
  return new EscPos()
    .align("center")
    .bold(true)
    .big(true)
    .text(receipt.shop)
    .big(false)
    .bold(false)
    .text(receipt.date)
    .text("--------------------------------")
    .text(receipt.items)
    .bold(true)
    .big(true)
    .text(receipt.total)
    .big(false)
    .bold(false)
    .text("--------------------------------")
    .align("left")
    .text(`Tx: ${receipt.tx}`)
    .align("center")
    .qr(receipt.link)
    .text("Recibo")
    .text("Obrigado!")
    .feed(4)
    .base64()
}

/**
 * Builds a link that hands the receipt to the RawBT app, which prints on the SUNMI's built-in printer.
 *
 * The dot.li sandbox has no allow-modals, so window.print() is ignored, but it keeps allow-popups,
 * which is what lets Chrome open an app link from inside the frame.
 */
export function rawbtLink(receipt: Receipt): string {
  return `intent:base64,${receiptEscPos(receipt)}#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end;`
}

export function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent)
}
