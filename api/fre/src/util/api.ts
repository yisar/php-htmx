import { get, post } from './post'
const HOST = 'http://api.danmu.com'

export function getPost(sort, tag, page, pageSize, uid?) {
  return get(`${HOST}/post/list?tag=${tag}&uid=${uid || ''}&page=${page}&size=${pageSize}`)
}

export function getRank(day) {
  return get(`${HOST}/post/rank`)
}

export function getPostDetail(pid) {
  return get(`${HOST}/post/view?id=${pid}`)
}

export function getReplyDetail(id) {
  return get(`${HOST}/reply/${id}`)
}

export function deleteNote(id) {
  return post(`${HOST}/reply/delete?id=${id}`, {})
}


export function getSearch(key) {
  return get(`${HOST}/post/list?q=${key}`)
}

export function addPost(data) {
  const videos = data.videos.replace(/http/g, 'https')
  return post(`${HOST}/post/add`, { videos, ...data })
}

export function getUser() {
  return JSON.parse(window.localStorage.getItem('user'))
}

export function addUser(data) {
  return post(`${HOST}/user/register`, data)
}

export function findUser({ id, qq, name }) {
  return get(`${HOST}/user/view?id=${id || ""}`)
}

export function pay({ price, order, uid }) {
  return get(`${HOST}/vip/pay?price=${price}&order=${order}&uid=${uid}`)
}

export function paycheck(tradeno) {
  return get(`${HOST}/vip/paycheck?tradeno=${tradeno}`)
}

export function getReplies(pid, rid, uid, page?, pageSize?) {
  return get(`${HOST}/reply/list?pid=${pid}&rid=${rid}&uid=${uid}&page=${page || 1}&size=${pageSize || 1000}`)
}


export function addReply({ id, pid, content, rid = 0, rstr }) {
  return post(`${HOST}/reply/add`, {
    id: parseInt(id),
    content,
    uid: parseInt(getUser().id),
    pid: parseInt(pid), rid: parseInt(rid as any)
  })
}

export function postLogin({ name, pwd }) {
  return post(`${HOST}/user/login`, { name, pwd })
}
