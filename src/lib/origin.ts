/**
 * Returns the address a phone should open for this app.
 *
 * Inside the dot.li gateway the app runs in a sandbox origin such as
 * `<label>.app.dev-dot.li`, which refuses to load on its own, so shared links
 * point at the public gateway host instead.
 */
export function publicOrigin(): string {
  return location.origin.replace(/^(https:\/\/[^/]+)\.app\.(dev-dot\.li|dot\.li)$/, "$1.$2")
}
