<?php

class User
{
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function login($uname, $pwd)
    {
        if (empty($uname) || empty($pwd)) {
            throw new Exception("用户名，邮箱，密码，不能为空");
        }

        $sql = "select * from user where `name`=:name and `pwd` = :pwd";
        $new_pwd = $this->md5($pwd);

        $sm = $this->db->prepare($sql);
        $sm->bindParam(':name', $uname);
        $sm->bindParam(':pwd', $new_pwd);

        $sm->execute();

        $ret = $sm->fetch(PDO::FETCH_ASSOC);

        if (!$ret) {
            throw new Exception("用户名或密码错误");
        }

        return $ret;

    }

    public function register($uname, $email, $pwd)
    {
        if (empty($uname) || empty($email) || empty($pwd)) {
            throw new Exception("用户名，邮箱，密码，不能为空");
        }

        if ($this->isExists($uname)) {
            // echo "用户名已存在";
            return new Exception("用户名已存在");
        }

        $sql = "insert into `user` (`name`, `pwd`, `email`, `time`, `level`, `bio`) values (:name, :pwd, :email, :time, :level, :bio)";
        $now = date("Y-m-d H:i:s", time());
        $bio = "这个人很懒，没有简介";
        $level = 1;
        $new_pwd = $this->md5($pwd);
        $sm = $this->db->prepare($sql);
        $sm->bindParam(":name", $uname);
        $sm->bindParam(":email", $email);
        $sm->bindParam(":pwd", $new_pwd);
        $sm->bindParam(":time", $now);
        $sm->bindParam(":bio", $bio);
        $sm->bindParam(":level", $level);

        // if (!$sm->execute()) {
        //     throw new Exception("数据库执行失败");
        // }

        try {
            $sm->execute();
        } catch (PDOException $e) {
            $errorMsg = "数据库执行失败：错误码[{$e->getCode()}]，描述[{$e->getMessage()}]";
            throw new Exception($errorMsg);
        }

        return [
            'id' => $this->db->lastInsertId(),
            'name' => $uname,
            'time' => $now
        ];

    }

    public function view($id)
    {
        if (empty(($id))) {
            throw new Exception("内容和作者id不能为空");
        }

        $sql = "select * from user where `id`=:id";

        $sm = $this->db->prepare($sql);
        $sm->bindParam(':id', $id);

        $sm->execute();

        $ret = $sm->fetch(PDO::FETCH_ASSOC);

        return $ret;

    }

    public function update($uid, $uname = null, $email = null, $pwd = null, $level = null, $bio = null)
    {
        $user = $this->view($uid);
        $uname = empty($uname) ? $user['name'] : $uname;
        $email = empty($email) ? $user['email'] : $email;
        $pwd = empty($pwd) ? $user['pwd'] : $pwd;
        $level = empty($level) ? $user['level'] : $level;
        $bio = empty($bio) ? $user['bio'] : $bio;
        if ($this->isExists($uname)) {
            return new Exception("用户名已存在");
        }

        $sql = "update `user` set `name`=:name, `pwd`=:pwd, `email`=:email, `time`=:time, `level`=:level, `bio`=:bio where `id`=:id";
        $now = date("Y-m-d H:i:s", time());
        $new_pwd = $this->md5($pwd);
        $sm = $this->db->prepare($sql);
        $sm->bindParam(":name", $uname);
        $sm->bindParam(":email", $email);
        $sm->bindParam(":pwd", $new_pwd);
        $sm->bindParam(":time", $now);
        $sm->bindParam(":bio", $bio);
        $sm->bindParam(":level", $level);

        try {
            $sm->execute();
        } catch (PDOException $e) {
            $errorMsg = "数据库执行失败：错误码[{$e->getCode()}]，描述[{$e->getMessage()}]";
            throw new Exception($errorMsg);
        }

        return [
            'id' => $this->db->lastInsertId(),
            'name' => $uname,
            'time' => $now
        ];

    }

    private function isExists($uname)
    {
        $sql = "select * from `user` where `name`=:uname";
        $sm = $this->db->prepare($sql);
        $sm->bindParam(':uname', $uname);
        $sm->execute();
        $ret = $sm->fetch(PDO::FETCH_ASSOC);
        return !empty($ret);
    }

    private function md5($pwd)
    {
        return md5(md5($pwd) . SALT);
    }

}