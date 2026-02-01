import { push } from '../../router'
import { getAv, getAvatar } from '../../util/avatar'
import './avatar.css'

export default function Avatar(props) {
    return <div className="avatar" onClick={() => {
        console.log(props)
        if (props.uid) push(`/uu/${props.uid}`)
    }}>
        <img src={getAvatar(props.uqq)} alt="" loading="lazy" />
        {
            <div class="info">
                {props.uname && <p>{props.uname}</p>}
                {props.time && <b>{dayjs(props.time).format('YYYY-MM-DD')}</b>}
                {props.extra && <b>{props.extra}</b>}
            </div>
        }
    </div>
}