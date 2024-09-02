import axios from "axios";
import config from "../config/config";
import { API_KEY, ProblemInfo } from "../../types";
import cheerio from "cheerio";
import fs from "fs";
import { findSourceCode } from "../task/submit_code";
import dotenv from "dotenv";
import FormData from 'form-data';


dotenv.config();

const GET = (endpoint: API_KEY, debug = false, page = 1, cookie: string) => {
    if (debug)
        console.log(`GET ${config.api.host}${(config.api as any)[endpoint]}?page=${page}`);
    return axios.get(`${config.api.host}${(config.api as any)[endpoint]}?page=${page}`, {
        headers: {
            Cookie: cookie,
            "User-Agent":
                "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Mobile Safari/537.36",
        },
    });
};

export enum submitStatus {
    SUCCESS,
    FAILED,
    NOT_FOUND,
}

const submitCode = async (
    problemCode: string,
    cookie: string,
    filepath: string,
    type: "cpp" | "c" | "java" | "py",
    csrf_str: string,
// eslint-disable-next-line max-params
): Promise<[submitStatus, string]> => {
    const api = `${config.api.host}/student/solution`;
    const form = new FormData();


    const sourceCode = fs.createReadStream(
        `${filepath}`
    );

    let ext = "";
    let lc = "2"
    switch (type.replace(".",'')) {
        case "py":
            lc = "4";
            ext = "py"
            break;
        
        case "cpp":
            lc = "2";
            ext = "cpp"
            break;
        
        case "c":
            lc = "1"
            ext = "c"
            break;
        
        case "java":
            lc = "3"
            ext = "java"
            break

        default:
            lc = "3"
            ext = "py"
    }

    form.append("_token", csrf_str);
    form.append("question", problemCode!);
    form.append("code_file", sourceCode);
    form.append("compiler", lc);

    try {
        const result = await axios.postForm(api, form, {
            headers: {
                Cookie: cookie,
                "Content-Type": "multipart/form-data",
                "User-Agent":
                    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Mobile Safari/537.36",
            },
        });
        if (result.status === 200) {
            console.log("\x1b[32m%s\x1b[0m", `Submit code success!`);
            const $ = cheerio.load(result.data)
            const problemId = $('table.status__table tbody tr td').first().html();
            return [submitStatus.SUCCESS, problemId || ""];
        } else {
            console.log("\x1b[31m%s\x1b[0m", `Submit code failed!`);
            return [submitStatus.FAILED, ''];
        }
    } catch (err) {
        console.log(err);
        return [submitStatus.FAILED,''];
    }
};

export { GET, submitCode };
