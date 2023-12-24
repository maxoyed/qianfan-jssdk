/**
 * getAccessToken返回值
 */
export interface AccessTokenResp {
    /**
     * 访问凭证
     */
    access_token: string;
    /**
     * access_token 有效期。单位秒，有效期30天
     */
    expires_in: number;
}

/**
 * 对话请求公共服务模型列表
 */
export type ChatModel =
    | "ERNIE-Bot-4"
    | "ERNIE-Bot-8K"
    | "ERNIE-Bot"
    | "ERNIE-Bot-turbo"
    | "EB-turbo-AppBuilder"
    | "Yi-34B-Chat"
    | "BLOOMZ-7B"
    | "Qianfan-BLOOMZ-7B-compressed"
    | "Llama-2-7b-chat"
    | "Llama-2-13b-chat"
    | "Llama-2-70b-chat"
    | "Qianfan-Chinese-Llama-2-7B"
    | "Qianfan-Chinese-Llama-2-13B"
    | "ChatGLM2-6B-32K"
    | "XuanYuan-70B-Chat-4bit"
    | "ChatLaw"
    | "AquilaChat-7B";

/**
 * 对话请求公共服务模型信息
 */
export type ChatModelInfo = Record<
    ChatModel,
    {
        /**
         * API 请求节点
         */
        endpoint: string;
        /**
         * 模型描述
         */
        description?: string;
    }
>;

/**
 * 对话消息基类
 */
export interface ChatMessageBase {
    /**
     * user: 表示用户，assistant: 表示对话助手
     */
    role: "user" | "assistant";
    /**
     * 对话内容
     */
    content: string;
}

export interface FunctionCall {
    /**
     * 触发的 function 名
     */
    name: string;
    /**
     * 请求参数
     */
    arguments: string;
    /**
     * 模型思考过程
     */
    thoughts?: string;
}

/**
 * 带function的对话消息
 */
export interface ChatMessageWithFunction {
    /**
     * function: 表示函数
     */
    role: "function";
    /**
     * 对话内容，可为空
     */
    content?: string;
    /**
     * message 作者，是 function_call 中的 name
     */
    name: string;
    function_call: FunctionCall;
}

/**
 * 对话消息
 */
export type ChatMessage<T extends ChatModel> = T extends "ERNIE-Bot-4"
    ? ChatMessageBase | ChatMessageWithFunction
    : T extends "ERNIE-Bot-8K"
    ? ChatMessageBase | ChatMessageWithFunction
    : T extends "ERNIE-Bot"
    ? ChatMessageBase | ChatMessageWithFunction
    : ChatMessageBase;

/**
 * 对话请求基类
 */
export interface ChatBodyBase<T extends ChatModel> {
    /**
     * 聊天上下文信息
     * 1. messages 成员不能为空，1 个成员表示单轮对话，多个成员表示多轮对话
     * 2. 最后一个 message 为当前请求的信息，前面的 message 为历史对话信息
     * 3. 必须为奇数个成员
     */
    messages: ChatMessage<T>[];
    /**
     * 是否以流式接口的形式返回数据，默认为 false（当前版本 SDK 未实现流式接口支持）
     */
    stream?: false;
    /**
     * 表示最终用户的唯一标识符，可以监视和检测滥用行为，防止接口恶意调用
     */
    user_id?: string;
}

/**
 * ERNIE-Bot-turbo 对话请求
 */
export interface ChatBodyErnieBotTurbo<T extends ChatModel>
    extends ChatBodyBase<T> {
    /**
     * 1. 较高的数值会使输出更加随机，而较低的数值会使其更加集中和确定
     * 2. 默认 0.95，范围 (0, 1.0]，不能为 0
     * 3. 建议该参数和 top_p 只设置1个
     * 4. 建议 top_p 和 temperature 不要同时更改
     */
    temperature?: number;
    /**
     * 1. 影响输出文本的多样性，取值越大，生成文本的多样性越强
     * 2. 默认 0.8，取值范围 [0, 1.0]
     * 3. 建议该参数和 temperature 只设置 1 个
     * 4. 建议 top_p 和 temperature 不要同时更改
     */
    top_p?: number;
    /**
     * 通过对已生成的token增加惩罚，减少重复生成的现象。说明：
     * 1. 值越大表示惩罚越大
     * 2. 默认 1.0，取值范围：[1.0, 2.0]
     */
    penalty_score?: number;
    /**
     * 模型人设，主要用于人设设定，例如，你是 xxx 公司制作的AI助手，说明：
     * 1. 长度限制 1024 个字符
     * 2. 如果使用 functions 参数，不支持设定人设 system
     */
    system?: string;
}

/**
 * 可触发函数
 */
export type ErnieBotFunction<T extends ChatModel> = {
    /**
     * 函数名
     */
    name: string;
    /**
     * 函数描述
     */
    description: string;
    /**
     * 函数请求参数
     * 1. JSON Schema 格式，参考 [JSON Schema描述](https://json-schema.org/understanding-json-schema/)
     * 2. 如果函数没有请求参数，parameters 值格式如下：{"type": "object","properties": {}}
     */
    parameters: object;
    /**
     * 函数响应参数，JSON Schema 格式，参考 [JSON Schema描述](https://json-schema.org/understanding-json-schema/)
     */
    responses: object;
    /**
     * function 调用的一些历史示例
     */
    examples: ChatMessage<T>[];
};

/**
 * ERNIE-Bot 和 ERNIE-Bot-4 对话请求
 */
export interface ChatBodyErnieBot<T extends ChatModel>
    extends ChatBodyErnieBotTurbo<T> {
    /**
     * 一个可触发函数的描述列表
     */
    functions?: ErnieBotFunction<T>[];
}

/**
 * token 用量基类
 */
export interface TokenUsageBase {
    /**
     * 问题tokens数
     */
    prompt_tokens: number;
    /**
     * 回答tokens数
     */
    completion_tokens: number;
    /**
     * tokens总数
     */
    total_tokens: number;
}

/**
 * 插件 token 用量
 */
export interface PluginTokenUsage {
    /**
     * plugin名称，chatFile：chatfile插件消耗的tokens
     */
    name: string;
    /**
     * 解析文档tokens
     */
    parse_tokens: number;
    /**
     * 摘要文档tokens
     */
    abstract_tokens: number;
    /**
     * 检索文档tokens
     */
    search_tokens: number;
    /**
     * 总tokens
     */
    total_tokens: number;
}

/**
 * token 用量（包括插件）
 */
export interface TokenUsageWithPlugins extends TokenUsageBase {
    plugins?: PluginTokenUsage[];
}

/**
 * token 用量
 */
export type TokenUsage<T extends ChatModel> = T extends "ERNIE-Bot-4"
    ? TokenUsageWithPlugins
    : T extends "ERNIE-Bot-8K"
    ? TokenUsageWithPlugins
    : T extends "ERNIE-Bot"
    ? TokenUsageWithPlugins
    : TokenUsageBase;

/**
 * 对话响应基类
 */
export interface ChatRespBase<T extends ChatModel> {
    /**
     * 本轮对话的id
     */
    id: string;
    /**
     * 回包类型。
     *
     * chat.completion：多轮对话返回
     */
    object: string;
    /**
     * 时间戳
     */
    created: number;
    /**
     * 表示当前子句的序号。只有在流式接口模式下会返回该字段
     */
    sentence_id?: number;
    /**
     * 表示当前子句是否是最后一句。只有在流式接口模式下会返回该字段
     */
    is_end?: boolean;
    /**
     * 当前生成的结果是否被截断
     */
    is_truncated?: boolean;
    /**
     * 对话返回结果
     */
    result: string;
    /**
     * 表示用户输入是否存在安全，是否关闭当前会话，清理历史会话信息
     *
     * true：是，表示用户输入存在安全风险，建议关闭当前会话，清理历史会话信息
     * false：否，表示用户输入无安全风险
     */
    need_clear_history: boolean;
    /**
     * 当 need_clear_history 为 true 时，此字段会告知第几轮对话有敏感信息，如果是当前问题，ban_round=-1
     */
    ban_round: number;
    /**
     * token统计信息，token数 = 汉字数+单词数*1.3 （仅为估算逻辑）
     */
    usage: TokenUsage<T>;
}

/**
 * ERNIE-Bot 和 ERNIE-Bot-4 对话响应
 */
export interface ChatRespErnieBot<T extends ChatModel> extends ChatRespBase<T> {
    /**
     * 由模型生成的函数调用，包含函数名称，和调用参数
     */
    function_call?: FunctionCall;
}

/**
 * 对话响应错误
 */
export interface ChatRespError {
    /**
     * 错误码
     */
    error_code: number;
    /**
     * 错误描述信息，帮助理解和解决发生的错误
     */
    error_msg: string;
}

/**
 * 对话请求参数
 */
export type ChatBody<T extends ChatModel> = T extends "ERNIE-Bot-4"
    ? ChatBodyErnieBot<T>
    : T extends "ERNIE-Bot-8K"
    ? ChatBodyErnieBot<T>
    : T extends "ERNIE-Bot"
    ? ChatBodyErnieBot<T>
    : T extends "ERNIE-Bot-turbo"
    ? ChatBodyErnieBotTurbo<T>
    : ChatBodyBase<T>;

/**
 * 对话响应
 */
export type ChatResp<T extends ChatModel> = T extends "ERNIE-Bot-4"
    ? ChatRespErnieBot<T>
    : T extends "ERNIE-Bot-8K"
    ? ChatRespErnieBot<T>
    : T extends "ERNIE-Bot"
    ? ChatRespErnieBot<T>
    : T extends "ERNIE-Bot-turbo"
    ? ChatRespErnieBot<T>
    : ChatRespBase<T>;

/**
 * 文生图请求参数
 */
export interface Text2ImageBody {
    /**
     * 提示词，即用户希望图片包含的元素。长度限制为1024字符，建议中文或者英文单词总数量不超过150个
     */
    prompt: string;
    /**
     * 反向提示词，即用户希望图片不包含的元素。长度限制为1024字符，建议中文或者英文单词总数量不超过150个
     */
    negative_prompt?: string;
    /**
     * 生成图片长宽，默认值 1024x1024
     *
     * 取值范围如下：
     * ["512x512", "768x768", "768x1024", "1024x768", "576x1024", "1024x576", "1024x1024"]
     *
     * 各尺寸对应的比例为：["1:1","1:1","3:4","4:3","9:16","16:9","1:1"]
     */
    size?:
    | "512x512"
    | "768x768"
    | "768x1024"
    | "1024x768"
    | "576x1024"
    | "1024x576"
    | "1024x1024";
    /**
     * 生成图片数量，说明：
     * - 默认值为1
     * - 取值范围为1-4
     * - 单次生成的图片较多及请求较频繁可能导致请求超时
     */
    n?: 1 | 2 | 3 | 4;
    /**
     * 迭代轮次，说明：
     * - 默认值为20
     * - 取值范围为10-50
     */
    steps?: number;
    /**
     * 采样方式，默认值：Euler a，可选值如下：
     * - Euler
     * - Euler a
     * - DPM++ 2M
     * - DPM++ 2M Karras
     * - LMS Karras
     * - DPM++ SDE
     * - DPM++ SDE Karras
     * - DPM2 a Karras
     * - Heun
     * - DPM++ 2M SDE
     * - DPM++ 2M SDE Karras
     * - DPM2
     * - DPM2 Karras
     * - DPM2 a
     * - LMS
     */
    sampler_index?:
    | "Euler"
    | "Euler a"
    | "DPM++ 2M"
    | "DPM++ 2M Karras"
    | "LMS Karras"
    | "DPM++ SDE"
    | "DPM++ SDE Karras"
    | "DPM2 a Karras"
    | "Heun"
    | "DPM++ 2M SDE"
    | "DPM++ 2M SDE Karras"
    | "DPM2"
    | "DPM2 Karras"
    | "DPM2 a"
    | "LMS";
    /**
     * 随机种子，说明：
     * - 不设置时，自动生成随机数
     * - 取值范围 [0, 4294967295]
     */
    seed?: number;
    /**
     * 提示词相关性，说明：默认值为5，取值范围0-30
     */
    cfg_scale?: number;
    /**
     * 生成风格，可选值如下
     * - Base：基础风格（默认）
     * - 3D Model：3D模型
     * - Analog Film：模拟胶片
     * - Anime：动漫
     * - Cinematic：电影
     * - Comic Book：漫画
     * - Craft Clay：工艺黏土
     * - Digital Art：数字艺术
     * - Enhance：增强
     * - Fantasy Art：幻想艺术
     * - lsometric：等距风格
     * - Line Art：线条艺术
     * - Lowpoly：低多边形
     * - Neonpunk：霓虹朋克
     * - Origami：折纸
     * - Photographic：摄影
     * - Pixel Art：像素艺术
     * - Texture：纹理
     */
    style?: "Base" | "3D Model" | "Analog Film" | "Anime" | "Cinematic" | "Comic Book" | "Craft Clay" | "Digital Art" | "Enhance" | "Fantasy Art" | "lsometric" | "Line Art" | "Lowpoly" | "Neonpunk" | "Origami" | "Photographic" | "Pixel Art" | "Texture";
    /**
     * 表示最终用户的唯一标识符，可以监视和检测滥用行为，防止接口恶意调用
     */
    user_id?: string;
}

export interface Text2ImageRespImageData {
    object: "image";
    /**
     * 图片base64编码内容
     */
    b64_image: string;
    /**
     * 图片base64编码内容
     */
    index: number;
}

export interface Text2ImageRespUsage {
    /**
     * 问题tokens数，包含提示词和负向提示词
     */
    prompt_tokens: number;
    /**
     * tokens总数
     */
    total_tokens: number;
}

/**
 * 文生图响应
 */
export interface Text2ImageResp {
    /**
     * 请求的id
     */
    id: string;
    /**
     * 回包类型。image：图像生成返回
     */
    object: string;
    /**
     * 时间戳
     */
    created: number;
    /**
     * 生成图片结果
     */
    data: Text2ImageRespImageData[];
    /**
     * token统计信息，token数 = 汉字数+单词数*1.3 （仅为估算逻辑）
     */
    usage: Text2ImageRespUsage;
}

export type PluginName = ["uuid-zhishiku"] | ["uuid-chatocr"] | ["uuid-weatherforecast"]

export interface PluginBodyBase {
    /**
     * 查询信息。说明：
     * 1. 成员不能为空
     * 2. 长度不能超过1000个字符
     */
    query: string;
    /**
     * 需要调用的插件ID列表
     * - 知识库插件固定值为 `["uuid-zhishiku"]`
     * - 智慧图问插件固定值为 `["uuid-chatocr"]`
     * - 天气插件固定值为 `["uuid-weatherforecast"]`
     */
    plugins?: PluginName;
    /**
     * llm相关参数，不指定参数时，使用调试过程中的默认值。
     * 参数示例：
     * ```json
     * {
     *   "temperature":0.1,
     *   "top_p":1,
     *   "penalty_score":1
     * }
     * ```
     */
    llm?: {
        temperature: number;
        top_p: number;
        penalty_score: number;
    };
    /**
     * 说明：
     * 1. 如果prompt中使用了变量，推理时可以填写具体值；
     * 2. 如果prompt中未使用变量，该字段不填。
     * 参数示例：
     * ```json
     * {
     *   "key1":"value1",
     *   "key2":"value2"
     * }
     * ```
     * key1、key2为配置时prompt中使用了变量key
     */
    input_variables?: {
        [key: string]: string
    };
    /**
     * 聊天上下文信息。
     * 参数示例：
     * ```json
     * [
     *   {
     *     "role":"user",
     *     "content":"..."
     *   },
     *   {
     *     "role":"assisant",
     *     "content":"..."
     *   }
     * ]
     * ```
     */
    history?: ChatMessageBase[];
    /**
     * 是否返回插件的原始请求信息，默认false，可选值如下：
     * - `true`: 是，返回插件的原始请求信息meta_info
     * - `false`: 否，不返回插件的原始请求信息meta_info
     */
    verbose?: boolean;
}

export interface PluginBodyChatOCR extends PluginBodyBase {
    /**
     * 智慧图问插件使用图片的URL地址，说明：
     * 1. 图片要求是百度bos上的图片，即用户必须现将图片上传至百度bos，图片url地址包含bcebos.com
     * 2. 图片支持jpg、jpeg、png、bmp、webp，必须带后缀名
     */
    fileurl: string;
}

export type PluginBody<T extends PluginName> = T extends ["uuid-chatocr"] ? PluginBodyChatOCR : PluginBodyBase;

export interface PluginRespMetaInfoRequestZhishiku {
    /**
     * 用于查询知识库的用户请求
     */
    query: string;
    /**
     * 使用知识库的 Id 列表
     */
    kbIds: string[];
    /**
     * 分片和query的相似度分数的下限，低于该下限的文档分片不会被返回
     */
    score: number;
    /**
     * 返回的最相关的文档数
     */
    topN: number;
}

export interface PluginRespMetaInfoResponseZhishiku {
    /**
     * 文档分片的下载地址
     */
    contentUrl: string;
    /**
     * 文档 Id
     */
    docId: string;
    /**
     * 文档的名称
     */
    docName: string;
    /**
     * 文档上传的知识库 Id
     */
    kbId: string;
    /**
     * 当前分片和用户请求的相关度，取值范围（0-1）
     */
    score: number;
    /**
     * 分片 ID
     */
    shardId: string;
    /**
     * 分片序号
     */
    shardIndex: number;
    /**
     * 分片的实际内容
     */
    content: string;
}

export interface PluginRespMetaInfoRequestChatOCR {
    /**
     * 用于查询用户请求
     */
    query: string;
    /**
     * 从文件地址中解析出的文件名称
     */
    filename: string;
}

export interface PluginRespMetaInfoResponseChatOCR {
    /**
     * 错误码
     */
    error_no: number;
    /**
     * 错误信息
     */
    error_msg: string;
    /**
     * 当前返回的数据格式，可忽略
     */
    format: string;
    /**
     * OCR 返回的识别信息
     */
    result: {
        /**
         * 用户请求的实际返回结果
         */
        llm_result: string;
        /**
         * OCR 接口返回的识别文字信息
         */
        ocr_result: {
            /**
             * 文字所在的位置，识别为矩形框
             */
            rect: {
                /**
                 * 文字框左上角相对于图片左上角的横向偏移量，单位为像素
                 */
                left: number;
                /**
                 * 文字框左上角相对于图片左上角的纵向偏移量，单位为像素
                 */
                top: number;
                /**
                 * 文字框的宽度，单位为像素
                 */
                width: number;
                /**
                 * 文字框的高度，单位为像素
                 */
                height: number;
            };
            /**
             * 文字内容
             */
            word: string;
        }[]
    };
    /**
     * 唯一的logid，用于问题定位
     */
    logid: number;
}

export interface PluginRespMetaInfo<T extends PluginName> {
    request: T extends ["uuid-zhishiku"] ? PluginRespMetaInfoRequestZhishiku : T extends ["uuid-chatocr"] ? PluginRespMetaInfoRequestChatOCR : null;
    response: T extends ["uuid-zhishiku"] ? PluginRespMetaInfoResponseZhishiku : T extends ["uuid-chatocr"] ? PluginRespMetaInfoResponseChatOCR : null;
}

export interface PluginResp<T extends PluginName> extends ChatRespBase<"ERNIE-Bot-turbo"> {
    /**
     * 插件的原始请求信息
     */
    meta_info: T extends ["uuid-weatherforecast"] ? "" : PluginRespMetaInfo<T>
}