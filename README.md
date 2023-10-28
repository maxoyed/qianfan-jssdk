# 百度智能云千帆大模型平台 JS SDK

## 安装

```shell
npm install qianfan
```

## 使用

```javascript
import { Qianfan } from "qianfan";

api_client = new Qianfan("API_KEY", "SECRET_KEY");

// 发起对话
const resp = await api_client.chat({
    messages: [
        {
            role: "user",
            content: "Hello World",
        },
    ],
});

// 打印结果
console.log(resp.result);
```

## LICENSE

Qianfan JS SDK is released under the [MIT license](https://github.com/maxoyed/qianfan-jssdk/blob/master/LICENSE).
