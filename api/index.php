<?php
// phpinfo();
$db = require_once __DIR__ . "/lib/db.php";
require_once __DIR__ . "/class/User.php";
require_once __DIR__ . "/class/Post.php";
require_once __DIR__ . "/class/Reply.php";
require_once __DIR__ . "/class/Router.php";
require_once __DIR__ . "/class/Jwt.php";

$user = new User($db);
$post = new Post($db);
$reply = new Reply($db);
$jwt = new Jwt(JWTKEY);


function auth($jwt, $level)
{
    $headers = getallheaders();
    $token = $headers['Token'];

    if ($jwt->validateToken($token)) {
        $payload = $jwt->decodeToken($token);
        if ($payload['level'] >= $level) {
            return true;
        }
    }
    sendMsg("没有权限或token失效");
    die;
}

function sendMsg($msg)
{
    echo json_encode([
        'msg' => $msg
    ], JSON_UNESCAPED_UNICODE);
}

Router::post('/user/register', function () use ($user) {
    $uname = Router::input('name', null);
    $pwd = Router::input('pwd', null);
    $email = Router::input('email', null);
    $ret = $user->register($uname, $email, $pwd);
    header('Content-Type: application/json');
    echo json_encode($ret);
});

Router::post('/user/login', function () use ($user, $jwt) {
    $uname = Router::input('name', null);
    $pwd = Router::input('pwd', null);
    $ret = $user->login($uname, $pwd);
    $payload = [
        "id" => $ret['uid'],
        "name" => $ret['name'],
        "level" => $ret['level'],
        "exp" => time() + 3600, // Token expiration time (1 hour)
    ];
    $token = $jwt->createToken($payload);
    header('Content-Type: application/json');
    echo json_encode([
        'token' => $token,
        'user' => $ret
    ]);
});

Router::get('/user/view', function () use ($user, $jwt) {
    $uid = Router::query('id', 1);
    $ret = $user->view($uid);

    header('Content-Type: application/json');
    echo json_encode($ret);
});

Router::get('/reply/view', function () use ($reply, $jwt) {
    $rid = Router::query('id', null);
    $ret = $reply->view($rid);

    header('Content-Type: application/json');
    echo json_encode($ret);
});

Router::get('/post/view', function () use ($post, $jwt) {
    $pid = Router::query('id', 0);
    $ret = $post->view($pid);
    if (empty($ret)) {
        echo json_encode([
            'msg' => "没有数据"
        ]);
        return;
    }
    header('Content-Type: application/json');
    echo json_encode($ret);
});


Router::get('/post/list', function () use ($post, $jwt) {
    $tag = Router::query('tag', null);
    $uid = Router::query('uid', null);
    $page = Router::query('q', null);
    $size = Router::query('q', null);
    $q = Router::query('q', null);
    $ret = $post->list($tag, $uid,$page,$size,$q);
    header('Content-Type: application/json');
    echo json_encode($ret);
});

Router::get('/reply/list', function () use ($reply, $jwt) {
    $pid = Router::query('pid', null);
    $page = Router::query('page', null);
    $size = Router::query('size', null);
    $ret = $reply->list($page, $size, $pid);
    header('Content-Type: application/json');
    echo json_encode($ret);
});

Router::get('/post/rank', function () use ($post, $jwt) {

    $ret = $post->rank();
    header('Content-Type: application/json');
    echo json_encode($ret);
});

Router::post('/post/add', function () use ($post, $jwt) {
    auth($jwt, 2);
    $title = Router::input('title', null);
    $content = Router::input('content', null);
    $uid = Router::input('uid', null);
    $tag = Router::input('tag', null);
    $videos = Router::input('videos', null);
    $ret = $post->create($title, $content, $uid, $tag, $videos);
    header('Content-Type: application/json');
    echo json_encode($ret);
});

Router::post('/reply/add', function () use ($reply, $jwt) {
    $content = Router::input('content', null);
    $uid = Router::input('uid', null);
    $pid = Router::input('pid', null);
    $rid = Router::input('rid', null);
    $ret = $reply->create($content, $uid, $pid, $rid);
    header('Content-Type: application/json');
    echo json_encode($ret);
});
Router::post('/reply/delete', function () use ($reply, $jwt) {
    $rid = Router::query('id', null);
    $ret = $reply->delete($rid);
    header('Content-Type: application/json');
    echo json_encode($ret);
});

Router::post('/post/edit', function () use ($post, $jwt) {
    auth($jwt, 2);
    $title = Router::input('title', null);
    $pid = Router::input('pid', null);
    $content = Router::input('content', null);
    $tag = Router::input('tag', null);
    $ret = $post->update($pid, $title, $content, $tag);
    header('Content-Type: application/json');
    echo json_encode($ret);
});

Router::get('/assets/*', function ($uri) {
    $filePath = str_replace('/assets/', '', $uri);
    $realPath = __DIR__ . '/fre/dist/' . $filePath;

    $ext = strtolower(pathinfo($realPath, PATHINFO_EXTENSION));
    header('Content-Type: ' . ($ext === 'css' ? 'text/css' : 'application/javascript'));
    readfile($realPath);
    exit;
});


Router::get('/*', function () {
    header('Content-Type: text/html; charset=utf-8');
    echo file_get_contents(__DIR__ . '/fre/dist/index.html');
});

Router::dispatch();


// var_dump($_SERVER);



// $post->create("这是标题","这是内容",2,"耽美");
// $user->register("昌浩1", "aaa@qq.com", "aaa");
// $user->login("昌浩","aaa");

// var_dump($post->view(1));
// var_dump($post->list());