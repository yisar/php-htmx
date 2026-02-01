<?php

class Reply
{
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function view($id)
    {
        if (empty(($id))) {
            throw new Exception("id不能为空");
        }

        $sql = "select * from reply where `id`=:id";

        $sm = $this->db->prepare($sql);
        $sm->bindParam(':id', $id);

        $sm->execute();

        $ret = $sm->fetch(PDO::FETCH_ASSOC);

        return $ret;

    }

    public function create($content, $uid, $pid = 0, $rid = 0 )
    {
        if (empty($content) || empty($uid)) {
            throw new Exception("内容和uid不能为空");
        }


        $sql = "insert into `reply` (`content`, `uid`, `time`, `pid`,`rid`) values (:content, :uid, :time, :pid, :rid)";
        $now = date("Y-m-d H:i:s", time());

        $sm = $this->db->prepare($sql);
        $sm->bindParam(":content", $content);
        $sm->bindParam(":uid", $uid);
        $sm->bindParam(":time", $now);
        $sm->bindParam(":pid", $pid);
        $sm->bindParam(":rid", $rid);

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

    public function delete($rid)
    {
        $sql = "delete from `reply` where `id`=:id";
        $sm = $this->db->prepare($sql);
        $sm->bindParam(':id', $rid);
        $sm->execute();
        $sm->fetch(PDO::FETCH_ASSOC);
        return [
            'msg' => "删除成功"
        ];
    }

    public function list($page = 1, $size = 10, $pid)
    {
        $page = is_numeric($page) && $page > 0 ? (int) $page : 1;
        $size = is_numeric($size) && $size > 0 ? (int) $size : 10;
        $offset = ($page - 1) * $size; // 计算分页偏移量
        $pid = is_numeric($pid) ? (int) $pid : 0;
        $sql = "select * from `reply` where `pid` = :pid order by time desc limit :offset, :size";
        $sm = $this->db->prepare($sql);

        $sm->bindParam(':offset', $offset, PDO::PARAM_INT);
        $sm->bindParam(':size', $size, PDO::PARAM_INT);
        $sm->bindParam(':pid', $pid);

        try {
            $sm->execute();
            $list = $sm->fetchAll(PDO::FETCH_ASSOC);
            return $this->filled($list);
        } catch (PDOException $e) {
            $errorMsg = "列表查询失败：错误码[{$e->getCode()}]，描述[{$e->getMessage()}]";
            throw new Exception($errorMsg);
        }
    }

    private function filled($data)
{
    if (empty($data)) {
        return [];
    }

    $mapReply = [];
    $ret = [];

    // 第一步：先把所有数据存入映射表，并且初始化replies，同时收集顶级回复（rid=0）
    // 关键点：直接操作$data的元素，而不是foreach的拷贝
    foreach ($data as $key => &$reply) { // 这里加&，操作原始$data的元素
        // 初始化replies字段
        if (is_object($reply)) {
            $reply->replies = [];
        } elseif (is_array($reply)) {
            $reply['replies'] = [];
        }

        // 获取回复ID，作为映射表的键
        $replyId = isset($reply->id) ? $reply->id : ($reply['id'] ?? 0);
        if ($replyId > 0) {
            $mapReply[$replyId] = &$reply; // 绑定原始数据的引用
        }

        // 收集顶级回复（rid=0）
        $replyRid = isset($reply->rid) ? $reply->rid : ($reply['rid'] ?? 0);
        if ($replyRid == 0) {
            $ret[] = &$reply; // 存引用，确保后续修改能同步
        }
    }
    unset($reply); // 释放引用，避免后续变量污染

    // 第二步：遍历所有数据，将子回复挂载到对应父回复的replies中
    foreach ($data as &$reply) { // 同样操作原始数据的引用
        $replyRid = isset($reply->rid) ? $reply->rid : ($reply['rid'] ?? 0);
        // 只处理有父回复且父回复存在的子回复
        if ($replyRid != 0 && isset($mapReply[$replyRid])) {
            $parent = &$mapReply[$replyRid];
            // 把当前子回复挂载到父回复的replies中
            if (is_object($parent)) {
                $parent->replies[] = $reply;
            } elseif (is_array($parent)) {
                $parent['replies'][] = $reply;
            }
        }
    }
    unset($reply); // 释放引用

    return $ret;
}

}