<?php
class Router
{
    // 存储路由规则：[['method' => 'GET', 'route' => '/user', 'callback' => 回调/控制器, 'isWildcard' => false]]
    private static $routes = [];
    // 404 全局通配符回调（* 对应的回调）
    private static $globalWildcardCallback;
    // 缓存解析后的 JSON 数据
    private static $jsonInput;

    /**
     * 初始化跨域设置（允许所有域名访问）
     */
    private static function initCors()
    {
        // 允许所有域名跨域访问
        header('Access-Control-Allow-Origin: *');
        // 允许的请求方法
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
        // 关键：添加 content-type 到允许的请求头列表中
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, token, Token");
        // 允许携带Cookie（如果需要的话）
        header("Access-Control-Allow-Credentials: true");

        // 处理预检请求（OPTIONS请求直接返回200）
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }

    /**
     * 魔术方法：处理 GET/POST/PUT/DELETE 等路由注册
     */
    public static function __callStatic($method, $params)
    {
        $route = '/' . ltrim($params[0], '/'); // 统一路由开头为 /
        $callback = $params[1];

        // 全局 * 通配符（单独存储）
        if ($route === '/*') {
            self::$globalWildcardCallback = $callback;
            return;
        }

        // 判断是否是前缀通配符路由（如 /assets/*）
        $isWildcardRoute = substr($route, -2) === '/*';
        if ($isWildcardRoute) {
            $route = rtrim($route, '/*'); // 去掉末尾的 /*，保留前缀（如 /assets）
        }

        self::$routes[] = [
            'method' => strtoupper($method),
            'route' => $route,
            'callback' => $callback,
            'isWildcard' => $isWildcardRoute // 标记是否是前缀通配符路由
        ];
    }

    /**
     * 分发路由（核心方法）
     */
    public static function dispatch()
    {
        // 先初始化跨域设置
        self::initCors();

        // 获取当前请求的 URI 和方法
        $uri = rtrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/') ?: '/';
        $method = strtoupper($_SERVER['REQUEST_METHOD']);
        $found = false;

        // 1. 先匹配精确路由
        foreach (self::$routes as $item) {
            if (!$item['isWildcard'] && $item['method'] === $method && $item['route'] === $uri) {
                self::executeCallback($item['callback'], $uri);
                $found = true;
                break;
            }
        }

        // 2. 精确路由未匹配，匹配前缀通配符路由
        if (!$found) {
            foreach (self::$routes as $item) {
                if ($item['isWildcard'] && $item['method'] === $method && strpos($uri, $item['route']) === 0) {
                    self::executeCallback($item['callback'], $uri);
                    $found = true;
                    break;
                }
            }
        }

        // 3. 未匹配到任何路由则执行全局 * 通配符回调
        if (!$found) {
            self::handleGlobalWildcard();
        }
    }

    /**
     * 执行回调（闭包/控制器@方法），传递请求URI参数
     */
    private static function executeCallback($callback, $uri)
    {
        if (is_callable($callback)) {
            call_user_func($callback, $uri); // 把请求URI传给回调函数
            return;
        }

        // 控制器@方法 格式
        if (is_string($callback) && strpos($callback, '@')) {
            list($controllerClass, $action) = explode('@', $callback, 2);
            if (class_exists($controllerClass) && method_exists($controllerClass, $action)) {
                $controller = new $controllerClass();
                call_user_func([$controller, $action], $uri); // 传递URI参数
                return;
            }
        }

        // 回调无效则执行全局 * 通配符
        self::handleGlobalWildcard();
    }

    /**
     * 处理全局 * 通配符（404）响应
     */
    private static function handleGlobalWildcard()
    {
        if (self::$globalWildcardCallback) {
            call_user_func(self::$globalWildcardCallback);
            return;
        }

        // 默认 404 响应
        header($_SERVER['SERVER_PROTOCOL'] . ' 404 Not Found');
        echo '404 Not Found';
    }

    /**
     * 获取 GET 请求参数（带XSS过滤）
     */
    public static function query($key, $default = null)
    {
        $value = $_GET[$key] ?? $default;
        return is_string($value) ? htmlspecialchars($value, ENT_QUOTES) : $value;
    }

    /**
     * 获取 POST 请求数据（兼容 JSON 和普通表单）
     */
    public static function input($key = null, $default = null)
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (strpos(strtolower($contentType), 'application/json') !== false) {
            if (self::$jsonInput === null) {
                $json = file_get_contents('php://input');
                self::$jsonInput = json_decode($json, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    self::$jsonInput = [];
                }
            }
            $data = self::$jsonInput;
        } else {
            $data = $_POST;
        }

        if ($key === null) {
            return $data;
        }
        return $data[$key] ?? $default;
    }
}