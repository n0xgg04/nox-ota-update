import { program } from 'commander';
import {execSync} from 'child_process'
import * as fs from "fs"
import * as path from "node:path";
import ExpoConfig from "@expo/config";
import AdmZip from 'adm-zip'
import axios from "axios";
import FormData from "form-data";
import { createSpinner } from 'nanospinner'

export interface UploadResponse {
  result: string
  data: Data
}

export interface Data {
  id: string
}


program
  .version('1.0.0')
  .description('NOX OTA UPDATER')
  .option('-o, --os <type>', 'Platform')
  .option('-v, --runtimeVersion <type>', 'Run time version')
  .option('-b, --build', 'Build mode')
  .action(async (options) => {

    const configPath = path.resolve(process.cwd(),".nox.config.json")
    if(!fs.existsSync(configPath)){
      console.error("Config path not found")
      return
    }

    const config = JSON.parse(fs.readFileSync(configPath, {encoding:'utf8'}));


    if(options.build){
      const appPath = path.resolve(process.cwd(),"app.json")
      let appConfig = JSON.parse(fs.readFileSync(appPath,{encoding:'utf-8'}))
      appConfig.expo.updates = {
        "url": `${config.updateHostUrl}/updates/${config.projectId}/${config.branch.build}`,
        ...config.config
      }

      fs.writeFileSync(appPath, JSON.stringify(appConfig, null, 2))
      console.log("Edited app.json for Nox OTA Update")
      return;
    }

    const projectId = config.projectId;
    const os = options.os ?? "android"
    const branch = config.branch.update

    if(!projectId || !os || !branch){
      console.error("No valid config provided")
      return;
    }


    console.log(`Project ID: ${projectId}`);
    console.log(`Branch: ${branch}`);
    console.log(`OS: ${os}`);

    try {
      execSync(`npx expo export --platform=${os}`, {stdio: 'inherit'});
      const distDir = path.resolve(process.cwd(), 'dist');
      if (fs.existsSync(distDir)) {
        const {exp} = ExpoConfig.getConfig(process.cwd(), {
          skipSDKVersionRequirement: true,
          isPublicConfig: true,
        });
        fs.writeFileSync(path.resolve(distDir, "expoConfig.json"), JSON.stringify(exp), {
          encoding: "utf8",
        })

        const runTime = exp.runtimeVersion ?? options.runtimeVersion;
        if(!runTime){
          console.error("Runtime version not found")
          return;
        }
        console.log(`Runtime Version: ${runTime}`);
        const zip = new AdmZip();
        const archiveLoading = createSpinner('Archiving file...').start();
        zip.addLocalFolder(distDir)
        const zipDir = path.resolve(distDir, "update.zip");
        zip.writeZip(zipDir);
        archiveLoading.success({text: `Saved update to ${zipDir}`})

        const uploadLoading = createSpinner('Uploading to Nox OTA Server...').start();
        const form = new FormData();
        form.append('file', fs.createReadStream(zipDir));
        try {
          const response = await axios.post<UploadResponse>(`${config.updateHostUrl}/update/${projectId}?platform=${os}&runtime-version=${runTime}&branch=${branch}`, form, {
            headers: {
              ...form.getHeaders(),
            },
          })
          uploadLoading.success({text: `Uploaded to Nox OTA Server (ID: ${response.data.data.id} - Branch: ${config.branch.update}). Your update will available after 1-5 minutes`});
        } catch (err) {
          uploadLoading.error({text: "Upload failed"});
        }
      } else {
        console.error("Invalid export folder.");
      }
    } catch (error) {
      console.error("Failed to export:", (error as any).message);
    }
  });

program.parse(process.argv);

