const views = {
  carteira: () => import("./carteira"),
  terminal: () => import("./terminal"),
}

type View = keyof typeof views

function currentView(): View | "home" {
  const view = new URLSearchParams(location.search).get("ecra")
  return view === "carteira" || view === "terminal" ? view : "home"
}

const view = currentView()
const template = document.getElementById(`view-${view}`) as HTMLTemplateElement
document.title = template.dataset.title ?? document.title
document.body.prepend(template.content.cloneNode(true))
if (view !== "home") void views[view]()
