import { useState, useEffect } from "fre"
import { push } from "../router"
import { addReply, addPost, getPostDetail, getUser } from "../util/api"
import { XPCode } from "../util/xpcode"
import './pub.css'
import autolog from "../util/alert"
import { Right } from "../component/md/md"


let lock = false

window.xp = new XPCode({
    '\\[加粗\\:(.+?)\\]': '<strong>$1</strong>',
    '\\[标题\\:(.+?)\\]': '<h2>$1</h2>',
    '\\[代码\\:(.+?)\\]': '<pre>$1</pre>',
    '\\[引用\\:(.+?)\\]': '<blockquote>$1</blockquote>',
    '\\[图片\\:(.+?)(?:,文本\\:(.+?))?\\]': (match, url, text) =>
        `<img src="${url}" alt="${text || ''}">`,
    '\\[链接\\:(.+?)(?:,文本\\:(.+?))?\\]': (match, url, text) =>
        `<a href="${url}">${text || url}</a>`,
    '\n': '<br>'
})

export async function pubLoader(props) {
    if (props.pid === 0) {
        return { post: {} }
    }
    const post = await getPostDetail(props.pid)
    return { post: post.data }
}

const strTags = ['推荐', '收费', '免费', '独家', '纯爱', '百合', '言情', '原创', '古风', '现代', '民国', '架空', '全一期']

export default function Publish(props) {
    // const [tags, setTags] = useState(props.data.post?.tag?.split(',') || [])

    const [post, setPost] = useState({ pid: 0, sort: "广播剧", tag: "推荐", status: "public", time: "", content: "", title: '', uid: getUser().id, videos: "" })
    const tags = props.data.post?.tag?.split(',') || []

    useEffect(() => {
        if (props.data.post) {
            console.log(props.data.post)
            setPost({
                ...post,
                ...props.data.post
            })
        }

        window.xp.mount(document.querySelector('textarea'),)

    }, [])

    useEffect(() => {

        document.querySelector('#taobao').addEventListener('change', event => {
            handleTaobaoImageUpload(event)
        })
    }, [])

    function change(key, val) {
        setPost({
            ...post,
            [key as any]: val,
        } as any)
    }

    function selectTag(item) {
        let a = post.tag?.split(',')
        if (tags.includes(item)) {
            a = tags.filter(i => i != item)
        } else {
            a = tags.concat([item])
        }
        change('tag', a.join(','))
    }


    function submit() {
        if (lock) {
            return
        }
        console.log(post)
        if (!post.content || !post.title || !post) {
            autolog.log("内容要填的", 'warn')
            return
        }
        lock = true


        addPost(post as any).then(res => {
            lock = false
            autolog.log("发布成功", 'success')
            // push('/')
        })

    }



    const handleTaobaoImageUpload = async event => {
        const file = event.target.files[0]

        const formData = new FormData()
        formData.append('upload', file)
        try {
            fetch('https://tuchuang.deno.dev/taobao-proxy', {
                body: formData,
                method: 'POST'
            }).then(res => res.json()).then(data => {
                console.log(data)
                xp.image(data.path.replace(/dd-static.jd.com\/ddimgp/g, 'img20.360buyimg.com/openfeedback'), '')
            })
        } catch (e) {
            xp.image('', '没有传成功')
        }


    }

    return (
        <div className="section">
            <div className="pub">
                <input type="text" placeholder="请输入标题" value={post.title} onInput={e => change('title', e.target.value)} />

                <section>
                    <i onclick={() => xp.bold()}>加粗</i>
                    <i onclick={() => xp.quote()}>引用</i>
                    <i>
                        <input id="taobao" type="file" accept="image/*" style="display:none" />
                        <label for="taobao">图片</label>
                    </i>
                    <i onclick={() => xp.link()}>链接</i>
                    <i onclick={() => xp.code()}>代码</i>
                </section>
                <textarea spellcheck="false" placeholder="请输入简介，支持 xpcode 语法" value={post.content} onInput={e => change('content', e.target.value)}></textarea>
                <textarea spellcheck="false" placeholder="请输入音频直链，格式：标题$链接，如第一话$https://danmu.me/001.mp4" value={post.videos} onInput={e => change('videos', e.target.value)}></textarea>
                <div className="options">
                    {props.data.post?.id > 0 && <input type="text" value={post.time} onInput={e => change('time', e.target.value)} className="time" />}
                </div>
                <div className="tags">
                    <ul>
                        {strTags.map((item, index) => <li onClick={() => selectTag(item)} key={index.toString()}
                            className={post.tag.includes(item) ? 'active' : ''}>{item}</li>)}
                    </ul>

                </div>
                <div className="submit" onClick={submit}>
                    <button>发布</button>
                </div>
            </div>

        </div>
    )
}


export function MiniPub(props) {

    console.log(props)

    const [post, setPost] = useState({ pid: props.pid || 8, rid: props.rid || 0, time: "", content: "", uid: getUser()?.id })


    function change(key, val) {
        setPost({
            ...post,
            [key as any]: val,
        } as any)
    }



    function submit() {
        if (lock) {
            return
        }
        console.log(post)
        if (!post.content) {
            autolog.log("内容要填的", 'warn')
            return
        }
        lock = true


        addReply(post as any).then(res => {
            lock = false
            autolog.log("发布成功", 'success')
            // push('/')
        })

    }

    return (
        <div className="section">
            <div className="minipub">
                <textarea spellcheck="false" placeholder="请输入内容，支持 xpcode 语法" value={post.content} onInput={e => change('content', e.target.value)}></textarea>
                <div className="submit" onClick={submit}>
                    <button>发布</button>
                </div>
            </div>

        </div>
    )
}