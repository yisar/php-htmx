import { marked } from "marked"
import './md.css'
import { getUser } from "../../util/api"

export default function Markdown({ text, isNew }: any) {
    var renderer = new marked.Renderer()
    renderer.link = function (href, title, text) {
        var link = marked.Renderer.prototype.link.call(this, href, title, text)
        return link.replace("<a", "<a target='_blank' ")
    }
    const html = isNew ? window.xp.parse(text) : marked.parse(text, { renderer })
    return <article className="artice" ref={dom => {
        if (dom) dom.innerHTML = html
    }}></article>
}

export function Right({ comp }) {
    const user = getUser() || {}
    return user.level > 4 ? comp : <div></div>
}