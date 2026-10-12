export function $(selector: string, root: ParentNode = document) {
  const el = root.querySelector<HTMLElement>(selector)
  if (!el) throw new Error(`missing element ${selector}`)
  return el
}

export function show(id: string) {
  document.querySelectorAll<HTMLElement>("[data-screen]").forEach((el) => {
    el.hidden = el.dataset.screen !== id
  })
  window.scrollTo(0, 0)
}

export function short(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function toast(message: string) {
  const el = document.createElement("div")
  el.className = "toast"
  el.textContent = message
  document.body.append(el)
  setTimeout(() => el.remove(), 2600)
}

export async function copy(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast("Copiado")
  } catch {
    toast(value)
  }
}

export function errorText(error: unknown) {
  const e = error as { shortMessage?: string; details?: string; message?: string }
  return e.shortMessage ?? e.details ?? e.message ?? String(error)
}
