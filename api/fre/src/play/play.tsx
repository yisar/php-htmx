import { useEffect, useState, Fragment, useRef } from 'fre'
import './play.css'
import { getPostDetail, getReplies, getUser } from '../util/api'
import Avatar from '../component/avatar/avatar'
import { Motal, ReplyCard } from '../home/home'
import { push } from '../router'
import { MiniPub } from '../pub/pub'
import { Right } from '../component/md/md'
import { getSuo } from '../util/avatar'

export async function playLoader(props) {

    const gv = props.gv.slice(2)
    const detail = await getPostDetail(gv)
    console.log(detail)
    const replies = await getReplies(gv, 0, 0, 1, 30)

    console.log(replies)

    let data = detail
    data.tag = data?.tag?.split(',')
    data.videos = data.videos.split('\n').map(str => str.split('$'))

    return { detail: data, replies }
}

export default function Play(props) {
    const post = props.data.detail || {}
    const [play, setPlay] = useState(post.videos[0][1])
    const [show, setShow] = useState(false)

    return (
        <div class="play">
            <div className="wrap flex">
                <div class="center">
                    <div className="play-box">
                        <div className="instro">
                            <div>
                                <div className="flex">
                                    <div class="a">
                                        <Avatar uqq={post.email}></Avatar>
                                    </div><h1>{post.title}</h1>
                                </div>

                                <p>
                                    <span>GV{post.id}</span>
                                    <span>{post.pv}℃</span>
                                    {post.tag.map(t => <i>{t}</i>)}
                                    <Right comp={<i onClick={() => push(`/pub/${post.id}`)}>编辑</i>}></Right>
                                </p>
                            </div>
                            <button onclick={() => setShow(true)}>评论</button>

                        </div>

                        <div className="player">
                            <Eplayer url={play} img={getSuo(post.content)} />
                        </div>
                    </div>
                    <div className="comments">
                        <ul>
                            {props.data.replies.map(item => {
                                return <li className=""><ReplyCard c={item} pid={props.data.detail.id} /></li>
                            })}
                        </ul>
                    </div>

                </div>
                <div class="right">
                    <section class="play-right">
                        <div className="top">
                            <h1>选集</h1>
                        </div>
                        <ul>
                            {post.videos.map(v => {
                                return <li onClick={() => {
                                    setPlay(v[1])

                                }} class={play === v[1] ? 'active' : ""}>{v[0]}</li>
                            })}
                        </ul>
                    </section>
                </div>
            </div>
            {show && <Motal comp={MiniPub} props={{
                close: () => setShow(false),
                pid: post.id,
                prefix: '评论: GV'
            }}></Motal>}
        </div>

    )
}

export function Eplayer(props) {
    console.log(props.img)
    const t = useRef(null)

    useEffect(() => {
        // const ep = window.customElements.get('e-player') as any

        // ep.use('play', (host) => {
        //     document.querySelector('.ep-ad').style.display = 'none'
        // })

        // ep.use('pause', () => {



        // })

    }, [])

    useEffect(() => {
        t.current.setAttribute('cover', props.img)


        if (t.current) {
            t.current.setAttribute('type', 'mp4')
            t.current.setAttribute('src', props.url)
        }

    }, [props.url, props.img])


    const user = getUser()

    return (
        <div style={{ 'position': 'relative' }}>

            <div className="ep-wrap">
                {<e-player ref={t} cover={props.img} />}
            </div>

        </div >
    )
}