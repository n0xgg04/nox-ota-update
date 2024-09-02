import fs from "fs"
import path from "path"


const dir = process.cwd();
const tmp = path.join(dir, '.lta');
let accountData: Object;

function stringToSlug(str: string) {
    let result = str;
    let from = "àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ";
    let to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy";

  for (let i=0, l=from.length ; i < l ; i++) {
    result = result.replace(RegExp(from[i], "gi"), to[i]);
  }

  result = result.toLowerCase()
        .trim()
        .replace(/[^a-z0-9\-]/g, '-')
        .replace(/-+/g, '-');

  return str;
}

function readCredential() {
    if (accountData) return accountData
    const account = fs.readFileSync(path.join(tmp, 'account.json'), {
        encoding: 'utf-8',
    });
    const parsed = JSON.parse(account);
    accountData = parsed
    return parsed
}

function writeCredential(data: Object) {
        const jsonString = JSON.stringify(data, (_, value) =>
      typeof value === 'string'
        ? value.replace(/[\u0000-\u001F\u007F]/g, '') // Loại bỏ các ký tự điều khiển không hợp lệ
        : value
        );
    
    fs.writeFileSync(
      path.join(tmp, 'account.json'),
      jsonString,{ encoding: 'utf-8' }
    );
}

export { readCredential, tmp, dir, writeCredential, stringToSlug }