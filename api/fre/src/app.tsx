import { render, Fragment, } from "fre"
import Router, { push, useRouter } from './router'
import './app.css'
import Header from "./header/header"
import { homeLoader } from './home/home'
import { userLoader } from "./user/user"
import { pubLoader } from "./pub/pub"
import { playLoader } from "./play/play"

const routes = [
    {
        path: '/login',
        element: import('./login/login'),
    },
    {
        path: '/register',
        element: import('./login/register'),

    },
    {
        path: '/sponsor',
        element: import('./sponsor/sponsor'),
    },
    {
        path: '/',
        element: import('./home/home'),
        loader: homeLoader
    },
    {
        path: '/uu/:id',
        element: import('./user/user'),
        loader: userLoader
    },
    {
        path: '/play/:gv',
        element: import('./play/play'),
        loader: playLoader
    },
    {
        path: '/pub/:pid',
        element: import('./pub/pub'),
        loader: pubLoader
    }
    // {
    //     path: '/:action',
    //     element: ({ action }) => {
    //         return <div>{action}</div>
    //     }
    // }
]

const App = () => {
    const path = window.location.pathname
    return <main>
        <Header currentUrl={path} />
        <div class="container wrap flex">
            <Router routes={routes} fallback={<div className={`global-loader is-loading`}>
                <div className="global-loader-fill" />
            </div>} />
        </div>
    </main>
}

render(<App />, document.getElementById("app"))


