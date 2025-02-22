const puppeteer = require('puppeteer');
const readlineSync = require('readline-sync');
const ytdl = require('ytdl-core');
const fs = require('fs');
const axios = require('axios').default;
const moment = require('moment');
const cliProgress = require('cli-progress');

console.clear();
console.log("Bem vindo ao bot do tio Pedro para videos kwai 🎶😎");
const verify = fs.existsSync(`videos`);
if (verify == false) {
    let f = fs.mkdirSync("./videos", { recursive: true }, (error) => console.log("Não foi possivel criar a pasta videos - Ocorreu um erro"));
    if (f) {
        console.log("Pasta videos criada com sucesso");
    }
}

const generateRandomString = (num) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result1 = ' ';
    const charactersLength = characters.length;
    for (let i = 0; i < num; i++) {
        result1 += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result1;
}

const downloadVideo = (link, page, videoName) => new Promise(async (resolve) => {
    try {
        await page.goto(link);

        const title = await page.title();
        const isYouTube = title.split(' - ').at(-1) == 'YouTube';

        let file;
        if (isYouTube) {
            file = ytdl(link).pipe(fs.createWriteStream(`videos/${videoName}.mp4`));
        } else {
            const resultado = await page.evaluate(() => document.querySelector("#video-ele").src);

            let response = await axios({
                method: 'GET',
                url: resultado,
                responseType: 'stream'
            });

            file = response.data.pipe(fs.createWriteStream(`videos/${videoName}.mp4`));
        }

        file.on("finish", () => {
            resolve("Download Completed");
        });
    } catch (error) {
        resolve('video não existe');
    }
});

async function robo() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const linkkwai = readlineSync.question('Link desejado (Para usar arquivo links digite "all"):') || '';
    const foreachkwai = require("./links.json");
    const date = moment().format("YYYY-MM-DD_HHmmss");

    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    const videoName = `${date}_${generateRandomString(5)}`;

    if (linkkwai == "all" && foreachkwai != null) {
        bar1.start(foreachkwai.length, 0);
        for (let i = 0; i < foreachkwai.length; i = i + 1) {
            bar1.update(i + 1);
            await downloadVideo(foreachkwai[i], page, `${videoName}_${i + 1}`);
        }
        bar1.stop();
    } else {
        await downloadVideo(linkkwai, page, videoName);
    }

    await browser.close();
}

robo();