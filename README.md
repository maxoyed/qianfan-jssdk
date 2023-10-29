# 百度智能云千帆大模型平台 JS SDK

[![npm version](https://badge.fury.io/js/qianfan.svg)](https://www.npmjs.com/package/qianfan)

## 安装

```shell
npm install qianfan
```

## 使用

```javascript
import { Qianfan } from "qianfan";

const api_client = new Qianfan("API_KEY", "SECRET_KEY");

async function main() {
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

    // 文生图
    const text2image_resp = await client.text2image({
        prompt: "cat",
    });
    // 打印结果
    console.log(text2image_resp);
}

main();
```

## LICENSE

Qianfan JS SDK is released under the [MIT license](https://github.com/maxoyed/qianfan-jssdk/blob/master/LICENSE).
