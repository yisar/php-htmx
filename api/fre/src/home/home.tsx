import { useEffect, useState, Fragment } from 'fre'
import './home.css'

import { deleteNote, getPost, getRank, getReplies, getUser } from '../util/api'
import Markdown from '../component/md/md'
import Avatar from '../component/avatar/avatar'
import Footer from '../header/footer'
import autolog from '../util/alert'
import Publish, { MiniPub } from '../pub/pub'
import Recommend from '../drama/recommend'
import Rank from '../drama/rank'

export async function homeLoader(req) {
    // const replies = await getReplies(8, 0, 0, 1, 50)
    // const users = await getUsers(['公主', '滑稽大宝', '肥波'])
    const posts = await getPost('广播剧', '', 1, 10)
    const rank = await getRank(1000)
    return {
        replies: [], users: [], posts: posts, rank: rank
    }
}
export function Motal({ comp, props }) {
    const Comp = comp
    return <div >
        <div class="motal">
            <div class="motal-content">
                <p>{props.prefix}{props.id || props.rid || props.pid}</p>
                <i class='iconfont icon-close' onclick={() => {
                    props.close && props.close()
                }}></i>

            </div>
            <Comp {...props}></Comp>
        </div>
        <div className="mask">

        </div>
    </div>

}

export function ReplyCard({ c, pid }) {
    const [show, setShow] = useState(false)
    const [rid, setRid] = useState(0)

    // function like(cid) {
    //     updateReplyUv({ cid }).then(res => {
    //         autolog.log('成功', 'success')
    //     })
    // }

    // const uv = c.uv || ''

    // const isLike = (c.uv || '').indexOf(getUser()?.name) > -1

    return <><div className="bio">
        <div>
            <Avatar uname={c.uname} uqq={c.email} time={c.time} uid={c.uid}></Avatar>
        </div>
        <div></div>
    </div>
        <div>
            <Markdown text={c.content || ''} isNew={dayjs(c.time).valueOf() > 1754137572811}></Markdown>
            <div className="actions">
                <div>
                    <li onClick={() => {
                        setShow(true)
                        setRid(c.id)
                    }}><i class="iconfont icon-message-circle-outline"></i>{c.replies?.length ?? 0}</li>
                </div>
                <div style={{
                    display: getUser()?.id === c.uid ? 'flex' : 'none'
                }}>
                    {/* <li onClick={() => push(`/pub/${c.id}`)}>编辑</li> */}
                    <li class="del" onClick={() => deleteNote(c.id).then(res => {
                        autolog.log(res.msg)
                    })}>删除</li>
                </div>
            </div>
        </div>
        <div className="replies">
            {/* {c.uv.length > 1 && <div class='likes'>{c.uv}</div>} */}
            {c.replies && c.replies.map(item => {
                return <li>
                    <Avatar uqq={item.email} uname={item.uname}></Avatar>
                    <p>{item.content}</p>
                    <li class="del" onClick={() => deleteNote(item.id).then(res => {
                        autolog.log(res.msg)
                    })}>删除</li>
                </li>
            })}
        </div>
        {show && <Motal comp={MiniPub} props={{
            close: () => setShow(false),
            rid: rid,
            pid: pid,
            prefix: '回复: RID-'
        }}></Motal>}
    </>

}


export default function Home(props) {

    return (
        <div class="flex">
            <div className="center">
                <div className="recommend">
                    <Recommend posts={props.data.posts} />
                </div>
                {(props.data.replies || []).map(c => {

                    return <li class="item">
                        <ReplyCard c={c}></ReplyCard>
                    </li>
                })}</div>
            <div className="right h" key="b">
                <div className="rank">
                    <Rank posts={props.data.rank} />
                </div>
                {/* <section class="news">
                    <h1>公告栏</h1>
                    <ul>
                        <li>使用说明</li>
                        <li>APP下载</li>
                        <li>其它说明</li>
                    </ul>
                </section> */}
                {/* <section class="authors">
                    <h1>推荐作者</h1>
                    <ul>
                        {
                            (props.data.users || []).map(au => {
                                return <div className="bio">
                                    <li>
                                        <Avatar uname={au.name} uqq={au.email} uid={au.id}></Avatar>
                                    </li>
                                    <div></div>
                                </div>
                            })
                        }
                    </ul>
                </section> */}
                <Footer></Footer>
            </div>

        </div>

    )
}