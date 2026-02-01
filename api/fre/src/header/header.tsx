import { render, useState, useEffect, Fragment } from "fre"
import { push } from '../router'
import { getUser } from "../util/api"
import './header.css'
import Avatar from "../component/avatar/avatar"
import { getAvatar } from "../util/avatar"
import autolog from "../util/alert"


function debounce(func, wait) {
    let timeout
    return function () {
        const context = this
        const args = arguments
        clearTimeout(timeout)
        timeout = setTimeout(function () {
            func.apply(context, args)
        }, wait)
    }
}

export default function Header() {
    const [key, setKey] = useState("")
    const [show, setShow] = useState(false)


    let user = getUser() || {}

    function publish() {
        let user = getUser() || {}
        if (user?.level > 1) {
            push('/pub/0')
        } else {
            autolog.log('投稿请加群索要权限：208288291', 'warn', 10000)
        }
    }

    return (<header>
        <div className="top wrap">
            <div className="flex">
                <div onClick={() => push('/')} class="band">
                    <div className="logo"></div>
                    <h1>蛋木FM</h1>
                </div>
                <div className="search">
                    <input type="text" placeholder="搜一下菊花又不会坏..." />
                    <button>
                        搜索
                    </button>
                </div>
            </div>
            <div className="bio right">
                {user.id ? <div><Avatar uqq={user.email} /></div> : <li onClick={() => push('/login')}>登录/注册</li>}
            </div>
        </div>
        <nav>
            <div class='wrap'>
                <ul>
                    <li class="active" onClick={() => push('/')}>首页</li>
                    <a href="https://app.danmu.me" target="__blank"><li>APP</li></a>
                    <li onClick={() => push('/sponsor')}>赞助</li>
                </ul>

                <ul class="menu">
                    <button onClick={() => publish()}>投稿</button>
                </ul>
            </div>

        </nav>
    </header>
    )
}