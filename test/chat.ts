import * as dotenv from "dotenv";
import { Qianfan } from "../src/index";

dotenv.config();

const API_KEY = process.env.API_KEY || "";
const SECRET_KEY = process.env.SECRET_KEY || "";
const client = new Qianfan(API_KEY, SECRET_KEY);

async function main() {
    const resp = await client.chat({
        messages: [
            {
                role: "user",
                content: "你好",
            },
        ],
    });
    console.log(resp);

    const text2image_resp = await client.text2image({
        prompt: "cat",
    });
    console.log(text2image_resp);
}

main();
