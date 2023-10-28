import * as dotenv from "dotenv";
import { Qianfan } from "../src/index";

dotenv.config();

const API_KEY = process.env.API_KEY || "";
const SECRET_KEY = process.env.SECRET_KEY || "";
const client = new Qianfan(API_KEY, SECRET_KEY);

test("获取 access_token", async () => {
    const access_token = await client.getAccessToken();
    expect(access_token.access_token).not.toBeUndefined();
    expect(access_token.expires_in).not.toBeUndefined();
});

test("对话请求", async () => {
    const resp = await client.chat({
        messages: [
            {
                role: "user",
                content: "你好",
            },
        ],
    });
    expect(resp.result).not.toBeUndefined();
});
