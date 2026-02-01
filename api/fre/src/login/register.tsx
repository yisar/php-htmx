import { useState, useEffect } from 'fre'
import { push } from '../router'
import './login.css'
import { addUser, findUser, getUser } from '../util/api'
import autolog from '../util/alert'

export function logout() {
    localStorage.clear()
    window.location.href = '/'
}

export default function Register({ id }) {

    const [user, setUser] = useState({} as any)

    useEffect(() => {
        if (id) {
            findUser({ qq: id } as any).then((user: any) => {
                setUser(user.data)
            })
        }

    }, [])

    function change(key, val) {
        setUser({
            ...user,
            [key as any]: val,
        } as any)
    }


    async function register() {
        if (id != null) {
            console.log('修改用户')
            addUser(user as any).then(res => {
                if ((res as any).code === 200) {
                    autolog.log("修改成功啦~")
                }
            })
            return
        }
        if (!user.name || !user.email || !user.pwd) {
            autolog.log('全都得填::>_<::')
            return
        }
        await addUser({ name: user.name, pwd: user.pwd, email: user.email, bio: "这个人很懒，什么都没有留下~" }) as any

        autolog.log("注册成功啦~", 'success')

    }

    console.log(user.id)

    return <div class="section">
        <div class="login">
            {!id && <div className="header"><li><h1>注册</h1></li></div>}
            <li><input type="text" placeholder="邮箱" onInput={(e) => change('email', e.target.value)} value={user.email} /></li>
            <li><input type="text" placeholder="昵称" onInput={(e) => change('name', e.target.value)} value={user.name} /></li>
            <li><input type="text" placeholder={id ? "留空则不改" : "密码"} onInput={(e) => change('pwd', e.target.value)} /></li>
            <li><input type="text" placeholder="签名(可不填)" onInput={(e) => change('bio', e.target.value)} value={user.sign} /></li>
            {id && (getUser()?.level & 0b1110) != 0 && <select value={user.level} onInput={e => change('level', parseInt(e.target.value))}>
                <option value="1">游客</option>
                <option value="2">主播</option>
                <option value="4">审核</option>
                <option value="8">管理</option>
            </select>}
            <li><button onClick={register}>{id ? '修改' : '注册'}</button></li>
            {!id && <li><a onClick={() => push('/login')}>登录</a></li>}
        </div>
    </div>
}
