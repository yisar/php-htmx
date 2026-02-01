import { useEffect, useState, Fragment } from 'fre'
import './user.css'
import { findUser, getReplies, getUser,  } from '../util/api'
import Avatar from '../component/avatar/avatar'
import { Motal, ReplyCard } from '../home/home'
import { push } from '../router'
import Register, { logout } from '../login/register'

export async function userLoader(props) {

    const user = await findUser({ id: props.id } as any).then(res => res.data)

    const replies = await getReplies(0, 0, user.id, 1, 100).then(res => res.data)


    return { replies, user }
}

export default function User(props) {
    const user = props.data.user || {}
    const replies = props.data.replies || []
    const [show, setShow] = useState(false)

    return (
        <div>

            <div className="wrap flex">
                <div class="replys center">
                    {
                        replies.map(c => {
                            return <li>
                                <ReplyCard c={c}></ReplyCard>
                            </li>
                        })}
                </div>
                <div class="right">
                    <div className="uc">
                        <div className="bio bioo">
                            <Avatar uqq={user.email}></Avatar>
                            <p className="name">{user.name}</p>
                            <div>{user.bio}</div>
                        </div>

                    </div>
                    <button class="toubi">投币给TA</button>
                    {getUser()?.id === user.id && <button class="toubi logout" onclick={() => logout()}>退出登录</button>}
                    {(getUser()?.level >= 8 || getUser()?.id === user.id) && <div class="post-btn" onClick={() => setShow(true)}>修改资料</div>}
                </div>
            </div>
            {show && <Motal comp={Register} props={{
                close: () => setShow(false),
                id: user.qq,
                prefix: '修改: QQ-'
            }} />}
        </div>

    )
}