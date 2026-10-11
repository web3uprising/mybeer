import jsQR from "jsqr"

export interface Scanner {
  stop(): void
}

export async function startScanner(video: HTMLVideoElement, onResult: (text: string) => void): Promise<Scanner> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: false,
  })
  video.srcObject = stream
  video.setAttribute("playsinline", "true")
  video.muted = true
  await video.play()

  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d", { willReadFrequently: true })!
  let running = true
  let frame = 0

  const tick = () => {
    if (!running) return
    if (video.readyState >= video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
      const scale = Math.min(1, 720 / Math.max(video.videoWidth, video.videoHeight))
      canvas.width = Math.round(video.videoWidth * scale)
      canvas.height = Math.round(video.videoHeight * scale)
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      const image = context.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(image.data, image.width, image.height, { inversionAttempts: "dontInvert" })
      if (code?.data) {
        running = false
        stream.getTracks().forEach((t) => t.stop())
        onResult(code.data)
        return
      }
    }
    frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)

  return {
    stop() {
      running = false
      cancelAnimationFrame(frame)
      stream.getTracks().forEach((t) => t.stop())
      video.srcObject = null
    },
  }
}
