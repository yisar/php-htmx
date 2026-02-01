import { useEffect, useRef, useState } from 'fre'
import { findUser, getUser, pay, paycheck } from '../util/api'
import { getMatrix, render, renderPath } from 'qr-code-generator-lib'

import './sponsor.css'
import { getAvatar, getSuo } from '../util/avatar'

export async function sponsorLoader(req) {
    return {
        msg: "hello sponsor"
    }
}


export default function Sponsor() {
    const [index, setIndex] = useState(0)
    const order = Math.floor(Math.random() * 10000000000)
    const [user, setUser] = useState({} as any)
    const q = useRef({})
    const q2 = useRef({})
    useEffect(() => {
        pay({
            price: Object.values(list)[index],
            order,
            uid: user?.id || getUser()?.id || 2
        }).then((res: any) => {
            q.current.innerHTML = render(getMatrix(res.alipay_trade_precreate_response.qr_code), 'var(--secondary)')
            q2.current.href = res.alipay_trade_precreate_response.qr_code
        })
    }, [index, user])

    function changeUser(name) {
        findUser({ name } as any).then(res => {
            setUser(res.data)
        })
    }

    const list = { '一天': 0.5, '一月': 10, '一季度': 25, '一年': 100 }

    return <div className="vip wrap section">
        <div class="userinfo">
            <input type="text" placeholder="请输入站内昵称，并确保头像正确" onInput={(e) => changeUser(e.target.value)} />
            <div className="avatar">
                <img src={getAvatar((user || {}).qq)} />
            </div>
        </div>
        <p>p.s. 请确认昵称和头像正确!</p>
        <ul>
            {Object.keys(list).map((item, i) => {
                return <li class={i === index ? 'active' : ''} onclick={() => setIndex(i)}>赞助{item} <span>￥{list[item]}</span></li>
            })}
        </ul>
        <h3>支付宝扫码（手机请截图使用支付宝app扫码）</h3>
        <div className="qrcode" ref={q}></div>
    </div>
}