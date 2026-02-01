<?php

class Post
{
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }


    public function view($id)
    {
        // if (empty(($id))) {
        //     throw new Exception("内容和作者id不能为空");
        // }

        $sql = "SELECT 
            p.*, 
            u.name AS uname, 
            u.email AS email 
        FROM post p
        LEFT JOIN user u ON p.uid = u.id WHERE p.id=:id";

        $sm = $this->db->prepare($sql);
        $sm->bindParam(':id', $id);

        $sm->execute();

        $ret = $sm->fetch(PDO::FETCH_ASSOC);

        return $ret;

    }

    public function rank()
    {

        $sql = "select * from post ORDER BY pv DESC LIMIT 10";

        $sm = $this->db->prepare($sql);
        $sm->bindParam(':id', $id);

        $sm->execute();

        $ret = $sm->fetchAll(PDO::FETCH_ASSOC);

        return $ret;

    }

    public function update($pid, $title = null, $content = null, $tag = null, $videos = null)
    {
        $post = $this->view($pid);
        $title = empty($title) ? $post['title'] : $title;
        $content = empty($cotnent) ? $post['content'] : $content;
        $tag = empty($tag) ? $post['tag'] : $tag;
        $videos = empty($videos) ? $post['videos'] : $videos;

        $sql = "update `post` set `title`=:title, `content`=:content, `tag`=:tag, `time` = :time, `videos`=:videos where `id` = :id";
        $now = date("Y-m-d H:i:s", time());
        $sm = $this->db->prepare($sql);

        $sm->bindParam(":title", $title);
        $sm->bindParam(":content", $content);
        $sm->bindParam(":tag", $tag);
        $sm->bindParam(":time", $now);
        $sm->bindParam(":id", $pid);
        $sm->bindParam(":videos", $videos);

        try {
            $sm->execute();
        } catch (PDOException $e) {
            $errorMsg = "数据库执行失败：错误码[{$e->getCode()}]，描述[{$e->getMessage()}]";
            throw new Exception($errorMsg);
        }

        return [
            'id' => $post['id'],
            'title' => $title,
            'content' => $content,
            'tag' => $tag,
            'pv' => $post['pv'],
            'uid' => $post['uid'],
            'videos' => $videos,
            'time' => $now
        ];

    }

    public function create($title, $content, $uid, $tag, $videos)
    {
        if (empty($content) || empty($uid)) {
            throw new Exception("内容和uid不能为空");
        }


        $sql = "insert into `post` (`title`, `content`, `uid`, `tag`, `time`, `pv`, `videos`) values (:title, :content, :uid, :tag, :time, :pv, :videos)";
        $now = date("Y-m-d H:i:s", time());
        if (empty($title)) {
            $title = "";
        }
        if (empty($tag)) {
            $tag = "";
        }
        $pv = 1;

        $sm = $this->db->prepare($sql);
        $sm->bindParam(":title", $title);
        $sm->bindParam(":content", $content);
        $sm->bindParam(":uid", $uid);
        $sm->bindParam(":tag", $tag);
        $sm->bindParam(":time", $now);
        $sm->bindParam(":pv", $pv);
        $sm->bindParam(":videos", $videos);

        try {
            $sm->execute();
        } catch (PDOException $e) {
            $errorMsg = "数据库执行失败：错误码[{$e->getCode()}]，描述[{$e->getMessage()}]";
            throw new Exception($errorMsg);
        }

        return [
            'id' => $this->db->lastInsertId(),
            'content' => $content,
            'time' => $now
        ];

    }

    public function delete($pid)
    {
        $sql = "delete from `post` where `id`=:id";
        $sm = $this->db->prepare($sql);
        $sm->bindParam(':id', $pid);
        $sm->execute();
        $sm->fetch(PDO::FETCH_ASSOC);
        return [
            'msg' => "删除成功"
        ];
    }

    public function list($page = 1, $size = 10, $tag = '', $uid = 0, $q = '')
    {
        // 1. 校验并处理参数（确保参数合法性）
        $page = is_numeric($page) && $page > 0 ? (int) $page : 1;
        $size = is_numeric($size) && $size > 0 ? (int) $size : 10;
        $offset = ($page - 1) * $size; // 计算分页偏移量
        $uid = is_numeric($uid) ? (int) $uid : 0;
        $tag = trim($tag);
        $q = trim($q);

        $where = [];
        $bindParams = [];

        if (!empty($tag)) {
            $where[] = "tag = :tag";
            $bindParams[':tag'] = $tag;
        }

        if ($uid > 0) {
            $where[] = "uid = :uid";
            $bindParams[':uid'] = $uid;
        }

        if (!empty($q)) {
            $where[] = "(title LIKE :q OR content LIKE :q)";
            $bindParams[':q'] = "%{$q}%";
        }

        $whereSql = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";

        $sql = "select * from `post` {$whereSql} order by time desc limit :offset, :size";
        $sm = $this->db->prepare($sql);

        $sm->bindParam(':offset', $offset, PDO::PARAM_INT);
        $sm->bindParam(':size', $size, PDO::PARAM_INT);

        foreach ($bindParams as $key => $value) {
            $sm->bindValue($key, $value);
        }

        try {
            $sm->execute();
            $list = $sm->fetchAll(PDO::FETCH_ASSOC);
            return $list;
        } catch (PDOException $e) {
            $errorMsg = "列表查询失败：错误码[{$e->getCode()}]，描述[{$e->getMessage()}]";
            throw new Exception($errorMsg);
        }
    }

}