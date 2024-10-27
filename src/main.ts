import { program } from 'commander';
import {execSync} from 'child_process'
import * as fs from "fs"
import * as path from "node:path";
import ExpoConfig from "@expo/config";
import AdmZip from 'adm-zip'
import axios from "axios";
import {CONSTANTS} from "./config";
import FormData from "form-data";
import ora from 'ora';


program
  .version('1.0.0')
  .description('NOX OTA UPDATER')
  .requiredOption('-p, --projectId <type>', 'Project ID')
  .requiredOption('-b, --branch <type>', 'Update branch')
  .requiredOption('-o, --os <type>', 'Platform')
  .requiredOption('-v, --runtimeVersion <type>', 'Run time version')
  .action(async (options) => {
    console.log(`Project ID: ${options.projectId}`);
    console.log(`Branch: ${options.branch}`);
    console.log(`OS: ${options.os}`);
    console.log(`Runtime Version: ${options.runtimeVersion}`);
    try {
      execSync(`npx expo export --platform=${options.os}`, {stdio: 'inherit'});
      const distDir = path.resolve(process.cwd(), 'dist');
      if (fs.existsSync(distDir)) {
        const {exp} = ExpoConfig.getConfig(process.cwd(), {
          skipSDKVersionRequirement: true,
          isPublicConfig: true,
        });
        fs.writeFileSync(path.resolve(distDir, "expoConfig.json"), JSON.stringify(exp), {
          encoding: "utf8",
        })

        const zip = new AdmZip();
        const archiveLoading = ora('Archiving file...').start();
        zip.addLocalFolder(distDir)
        const zipDir = path.resolve(distDir, "update.zip");
        zip.writeZip(zipDir);
        archiveLoading.succeed(`Saved update to ${zipDir}`)

        const uploadLoading = ora('Uploading to Nox OTA Server...').start();
        const form = new FormData();
        form.append('file', fs.createReadStream(zipDir));
        try {
          await axios.post(`${CONSTANTS.updateEndpoint}/${options.projectId}?platform=${options.os}&runtime-version=${options.runtimeVersion}&branch=${options.branch}`, form, {
            headers: {
              ...form.getHeaders(),
            },
          })
          uploadLoading.succeed("Uploaded to Nox OTA Server. Your update will available after 1-5 minutes");
        } catch (err) {
          uploadLoading.fail("Upload failed");
        }
      } else {
        console.error("Invalid export folder.");
      }
    } catch (error) {
      console.error("Failed to export:", (error as any).message);
    }
  });

program.parse(process.argv);

