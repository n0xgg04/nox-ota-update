import axios from 'axios';
import config from '../config/config';
import cheerio from 'cheerio';
import { readCredential, stringToSlug, writeCredential } from './read_credential';
import select from '@inquirer/select';
import chalk from 'chalk';



export const getCodePtitCsrf = async (problemCode: string, cookie: string[] | string) => {
    const Axiosconfig = {
        headers: {
            Cookie: cookie,
            "User-Agent":
                "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36",
        },
    }


    const account = readCredential()
    if (!Object.keys(account).includes("course")) {
        const getList = await axios.get("https://code.ptit.edu.vn/student/question", Axiosconfig)
        const $x = cheerio.load(getList.data);
        const course = $x('select#course').find('option').map(function () {
            // eslint-disable-next-line @typescript-eslint/no-invalid-this
            return { val: $x(this).val(), text: $x(this).text() };
        }).toArray()
        const valid = course.filter(e => !isNaN(Number(e.val)))
        if (valid.length > 0) {
            const answer = await select({
                message: 'Select target course:',
                choices: [
                    {
                        name: `Default: ${course[0].text}`,
                        value: 'default',
                        description: `Default: ${course[0].text}`,
                    },
                    ...valid.map((e) => {
                        return {
                            name: e.text,
                            value: e.val,
                            description: e.text,
                        }
                    })
                ]
            });
            writeCredential({
                ...account,
                course: answer,
                course_name: ((valid.filter((e) => e.val === answer)[0]?.text || `Default: ${course[0].text}`)),
                all_course: valid
            })
            await axios.get(`https://code.ptit.edu.vn/student/question?course=${answer}`, Axiosconfig)
        }
    } else {
        console.log(chalk.green(`COURSE: ${account.course_name}`));
        if (account.course !== "default") {
            await axios.get(`https://code.ptit.edu.vn/student/question?course=${account.course}`, Axiosconfig)
        }
    }

    const api = `https://code.ptit.edu.vn/student/question/${problemCode}`;

    const result = await axios.get(api, Axiosconfig);

    const $ = cheerio.load(result.data);

    const csrf = $('input[name="_token"]').val();


    return csrf as string;
} 