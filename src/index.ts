import axios from "axios";
import {
    AccessTokenResp,
    TChatModelPublicInfo,
    EChatModelNames,
    ChatBodyBase,
    ChatRespErnieBot,
} from "./interface";

export class Qianfan {
    private API_KEY: string;
    private SECRET_KEY: string;
    private headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
    };
    private readonly api_base =
        "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop";
    private readonly chat_models: TChatModelPublicInfo = {
        [EChatModelNames.ErnieBot4]: {
            endpoint: "completions_pro",
        },
        [EChatModelNames.ErnieBot]: {
            endpoint: "completions",
        },
        [EChatModelNames.ErnieBotTurbo]: {
            endpoint: "eb-instant",
        },
        [EChatModelNames.Bloomz7B]: {
            endpoint: "bloomz_7b1",
        },
        [EChatModelNames.QianfanBloomz7BCompressed]: {
            endpoint: "qianfan_bloomz_7b_compressed",
        },
        [EChatModelNames.Llama27BChat]: {
            endpoint: "llama_2_7b",
        },
        [EChatModelNames.Llama213BChat]: {
            endpoint: "llama_2_13b",
        },
        [EChatModelNames.Llama270BChat]: {
            endpoint: "llama_2_70b",
        },
        [EChatModelNames.QianfanChineseLlama27B]: {
            endpoint: "qianfan_chinese_llama_2_7b",
        },
    };
    access_token: string = "";
    expires_in: number = 0;
    /**
     * 千帆大模型
     * @param API_KEY 应用的API Key，在千帆控制台-应用列表查看
     * @param SECRET_KEY 应用的Secret Key，在千帆控制台-应用列表查看
     */
    constructor(API_KEY: string, SECRET_KEY: string) {
        this.API_KEY = API_KEY;
        this.SECRET_KEY = SECRET_KEY;
    }

    /**
     * 获取access_token
     * @returns Promise<AccessTokenResp>
     */
    public async getAccessToken(): Promise<AccessTokenResp> {
        const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${this.API_KEY}&client_secret=${this.SECRET_KEY}`;
        const resp = await axios.post(url, {}, { headers: this.headers });
        if (resp.data?.error && resp.data?.error_description) {
            throw new Error(resp.data.error_description);
        }
        this.access_token = resp.data.access_token;
        this.expires_in = resp.data.expires_in + Date.now() / 1000;
        return {
            access_token: resp.data.access_token,
            expires_in: resp.data.expires_in,
        };
    }

    /**
     * 发起对话请求
     * @param model 模型名称
     * @param body 请求参数
     * @returns Promise<ChatResp>
     */
    public async chat(
        body: ChatBodyBase,
        model: EChatModelNames = EChatModelNames.ErnieBot,
    ): Promise<ChatRespErnieBot> {
        const endpoint = this.chat_models[model].endpoint;
        if (this.expires_in < Date.now() / 1000) {
            await this.getAccessToken();
        }
        const url = `${this.api_base}/chat/${endpoint}?access_token=${this.access_token}`;
        const resp = await axios.post(url, body, { headers: this.headers });
        if (resp.data?.error_code && resp.data?.error_msg) {
            throw new Error(resp.data.error_msg);
        }
        return resp.data as ChatRespErnieBot;
    }
}
