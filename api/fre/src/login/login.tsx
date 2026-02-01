import { useState } from 'fre'
import { push } from '../router'
import './login.css'
import { postLogin } from '../util/api'
import autolog from '../util/alert'

export default function Login() {
    const [name, setName] = useState("")
    const [pwd, setPwd] = useState("")

    function changeName(v) {
        setName(v)
    }

    function changePwd(v) {
        setPwd(v)
    }

    function login() {
        postLogin({ name, pwd }).then((res: any) => {

            if (res.token) {
                window.localStorage.setItem('token', res.token)
                window.localStorage.setItem('user', JSON.stringify(res.user))
                window.location.href = '/'
            }

        })
    }
    return <div className=" section">
        <div class="login">
            <div className="header">
                <li><h1>登录</h1></li>
            </div>
            <li><input type="text" placeholder="昵称" onInput={(e) => changeName(e.target.value)} /></li>
            <li><input type="password" placeholder="密码" onInput={(e) => changePwd(e.target.value)} /></li>
            <li><button onClick={login}>登录</button></li>
            <li><a onClick={() => push('/register')}>注册</a></li>
        </div>
    </div>
}
