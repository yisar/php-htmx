const addEvent = (el, name, handler) => {
    el.addEventListener(name, handler)
    return () => el.removeEventListener(name, handler)
}

const stringSplice = (str, start, end, insert = '') =>
    str.slice(0, start) + insert + str.slice(end)

const wrapMarkup = (state, tag) => {
    const { selectionStart: start, selectionEnd: end, value } = state
    const content = value.slice(start, end) || '输入内容'
    const markup = `[${tag}:${content}]`
    state.value = stringSplice(value, start, end, markup)
    state.selectionStart = state.selectionEnd = start + markup.length
}

const createLinkOrImage = (state, type, url = 'url', text = '') => {
    const { selectionStart: start, selectionEnd: end, value } = state
    const content = value.slice(start, end) || text || '内容'
    const markup = text ? `[${type}:${url},文本:${content}]` : `[${type}:${url}]`
    state.value = stringSplice(value, start, end, markup)
    state.selectionStart = state.selectionEnd = start + markup.length
}

export class XPCode {
    constructor(rules) {
        this.rules = Object.entries(rules).map(([regex, replacement]) => ({
            regexp: new RegExp(regex, 'g'),
            replacement
        }))

    }

    mount(el) {
        this.el = typeof el === 'string' ? document.querySelector(el) : el
        if (!(this.el instanceof HTMLTextAreaElement)) {
            throw new TypeError('必须传入 textarea 元素')
        }
    }

    parse(text) {
        return this.rules.reduce((result, { regexp, replacement }) =>
            result.replace(regexp, replacement), text)
    }

    // 加粗：[加粗:内容]
    bold() {
        wrapMarkup(this.el, '加粗')
        this.el.focus()
    }

    // 标题：[标题:内容]
    heading() {
        wrapMarkup(this.el, '标题')
        this.el.focus()
    }

    // 代码：[代码:内容]
    code() {
        wrapMarkup(this.el, '代码')
        this.el.focus()
    }

    // 引用：[引用:内容]
    quote() {
        wrapMarkup(this.el, '引用')
        this.el.focus()
    }

    // 图片：[图片:描述](url)
    image(url, text) {
        createLinkOrImage(this.el, '图片', url, text)
        this.el.focus()
    }

    // 链接：[链接:文本](url)
    link(url, text) {
        createLinkOrImage(this.el, '链接', url, text)
        this.el.focus()
    }

    // 艾特：[艾特:名称](url)
    at(url, text) {
        createLinkOrImage(this.el, '艾特', url, text)
        this.el.focus()
    }

    // 话题：[话题:名称](url)
    topic(url, text) {
        createLinkOrImage(this.el, '话题', url, text)
        this.el.focus()
    }
}