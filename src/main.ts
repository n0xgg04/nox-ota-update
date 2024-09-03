import chalk from 'chalk';
import { program } from 'commander';
import inquirer from 'inquirer';
import { getCodePtitCookie } from './common/utils/get_codeptit_cookie';
import path from 'path';
import fs from 'fs';
import { submitCode } from './common/api';
import { getCodePtitCsrf } from './common/utils/get_csrf';
import { dir, readCredential, tmp, writeCredential } from './common/utils/read_credential';
import figlet from "figlet"
import { loading } from 'cli-loading-animation';
import axios from 'axios';
import Table from "cli-table3"
import confirm from '@inquirer/confirm';


program.version('1.0.0').description('CODEPTIT SUBMITTER - CLI by @n0xgg04')
  .option('-c', 'Clear target course')
  .option('-r', 'Reset account')

program.parse(process.argv);

const options = program.opts();

program.action(async () => {
  console.clear();
  console.log(figlet.textSync("CODEPTIT SUBMIT"));
  if (options.c) {
    const account = readCredential()
    delete account['course']
    writeCredential({
      ...account
    })
    console.log(chalk.green(`Cleared default course!`));
  }

  if (options.r) {
    fs.rmSync(path.join(dir, '.lta','account.json'));
     console.log(chalk.green(`Reset credentials successfully!`));
  }


  await submit("h");
});

const submit = async (code: string) => {
  if (!fs.existsSync(path.join(dir, '.lta'))) {
    fs.mkdirSync(tmp);
  }
  if (!fs.existsSync(path.join(tmp, 'account.json'))) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Account',
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password',
      },
    ]);

    writeCredential({
        username: answers.name,
        password: answers.password,
    })

  }
 
  const parsed = readCredential()
    
  console.log(chalk.green(`Login to ${parsed.username}...!`));

  if (!Object.keys(parsed).includes("save")) {
      const answer = await confirm({ message: 'Do you want to auto save your source code after submit?' });
  
    const read = readCredential();
    if (answer) {
      read['save'] = true;
      if(!fs.existsSync(process.cwd()+"/code")) fs.mkdirSync(process.cwd()+"/code")
      writeCredential(read);
    }
  }
  
  
  const data = await getCodePtitCookie(parsed.username, parsed.password);
    if (data.cookie) {
        const file = fs.readdirSync(dir)
      const existed = file.find((f) => f.toLowerCase().startsWith("main"))
    
      if (existed) {
          const source = fs.readFileSync(existed, {
                encoding: "ascii"
            })
            const code = source.split("\n")[0].replace(/[^a-zA-Z0-9]/g, '');
          if (parsed.save) {
            fs.writeFileSync(process.cwd()+"/code/"+code+path.extname(existed), source.replace("class Main",`class ${code}`))
          }
            try {
              const csrf = await getCodePtitCsrf(code, data.cookie)
          const { start, stop } = loading(`Submiting ${code}...`);
           start()
                try {
                  const [result, problem] = await submitCode(code, data.cookie, existed, path.extname(existed) as any, csrf)
                   stop()
                  if (!result) {
                    console.log(chalk.green(`Submited ${code}`));
                    const { start: start2, stop: stop2 } = loading(`Waiting for result: ${code}...`);
                    start2()
                  
                    const poll = 5;
                    let tried = 0;
                    let result: any;
                    // eslint-disable-next-line max-depth
                    while(tried < poll){
                       result = await axios.post("https://code.ptit.edu.vn/api/solution/status", {
                        id: [problem]
                      }, {
                        headers: {
                          Cookie: data.cookie,
                        },
                      })
                      // eslint-disable-next-line max-depth
                      if (!result.data.result) {
                        tried++;
                        await new Promise((resolve, reject) => {
          setTimeout(() => resolve(""), tried * 500);
});
                      } else {
                        break;
                      }
                    }

                    stop2()

                    const table = new Table({
  head: ['Problem', 'Problem Name', 'Date', 'Time', 'Result', 'Memory', 'Run Time', 'Compiler'],
  colWidths: [10, 20, 15, 10, 10, 10, 10, 15]
                    });

                    result.data.solutions.forEach((solution: any) => {
  table.push([
    solution.problem,
    solution.problem_name,
    solution.date,
    solution.time,
    solution.result,
    solution.memory,
    solution.run_time,
    solution.compiler
  ]);
});

                    
                    // eslint-disable-next-line max-depth
                    if (result.data.solutions[0].result === "AC") { 
                       console.log(chalk.green(table.toString()))
                    
                    } else {
                       console.log(chalk.green(table.toString()))
                    }


                    } else {
                        console.log(chalk.red("Failed to submit!"));
                    }
                } catch (e) {
                    stop()
                    console.log(chalk.red("FAILED TO SUB! PLEASE CHECK THE TARGET COURSE!",e))
                }
            } catch (e) {
                console.log(chalk.red("This problem is not valid or account information was wrong!",e));
                fs.rmSync(path.join(dir, '.lta','account.json'));
        
            }
        } else console.log(chalk.red("Code not found!"));
  } else {
    console.log(chalk.red(`Wrong username or password!`));
  }
};

program.parse(process.argv);
