import { useEffect, useState } from "fre"
import { getSuo } from "../util/avatar"
import { push } from "../router"
import './recommend.css'

const tags = ['日漫', '国漫', '美漫', '剧场版']

export default function Recommend(props) {
    const [posts, setPosts] = useState(props.posts)
    return <section className="recommend">
        <div className="top">
            <h1>推荐</h1>
        </div>
        <ul>
            {posts.length > 0 && posts.map(item => {
                return <li key={item.id} onClick={() => push(`/play/gv${item.id}`)}>
                    <div className="cover" >
                        <img src={getSuo(item.content)} loading="lazy"/>
                    </div>
                    <div className="title">{item.title}</div>
                </li>
            })}
        </ul>
    </section>
}