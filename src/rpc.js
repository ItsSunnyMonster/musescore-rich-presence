const fp = require("find-process");
const path = require("path");
const fs = require("fs");
const os = require("os");

const { Client } = require("discord-rpc");
const client = new Client({ transport: "ipc" });

let start = new Date();
let lastfile = "";
let stateindex = 0;
let sheetcache = null;

async function update() {
    const apps = await fp("name", "MuseScore");
    let app;
    for (let i = 0; i < apps.length; i++) {
        if (["MuseScore.exe", "MuseScore2.exe", "MuseScore3.exe", "MuseScore4.exe"].includes(apps[i].name)) {
            app = apps[i];
            break;
        }
    }

    let info = {};
    if (app) {
        const currDir = path.join(os.homedir(), "/.musepresenceinfo.json");
        if (fs.existsSync(currDir)) {
            try {
                const curr = JSON.parse(fs.readFileSync(currDir));
                // console.log(curr);
                info.sheet = curr;
                if (info.sheet.scoreName != lastfile) {
                    start = new Date();
                    lastfile = info.sheet.scoreName;
                }
            } catch (e) {
                console.log("X Unable to read .musepresenceinfo.json! Is the file corrupt?")
            }
        } else {
            console.log("X Whoops! I wasn't able to find the .musepresenceinfo.json. Did you install the DiscordRichPresence MuseScore plugin?");
        }
    }

    let largeImageKey = "musescore-square";
    let smallImageKey = "musescore-circle";
    let appTitle = "MuseScore";
    if (app.name == "MuseScore3.exe") {
        largeImageKey = "musescore3-square";
        smallImageKey = "musescore3-circle";
        appTitle = "MuseScore 3";
    } else if (app.name == "MuseScore4.exe") {
        largeImageKey = "musescore4-square";
        smallImageKey = "musescore4-circle";
        appTitle = "MuseScore 4";
    }

    if (info && info.sheet || app && !info && sheetcache) {
        if (info && info.sheet) sheetcache = info.sheet;
        else if (sheetcache) {
            info = {};
            info.sheet = sheetcache;
        }
        var states = [];
        if (info.sheet.title) states.push(`Title: ${info.sheet.title}`);
        if (info.sheet.subtitle) states.push(`Subtitle: ${info.sheet.subtitle}`);
        if (info.sheet.composer) states.push(`Composer: ${info.sheet.composer}`);
        states.push(`Contains ${info.sheet.nmeasures} Measures`);
        states.push(`Contains ${info.sheet.npages} Pages`);
        // Possibly unessecary? How does this apply to more than 1 instrument?
        // states.push(`Contains ${window.sheet.nstaves} Staves`);
        states.push(`Contains ${info.sheet.ntracks} Tracks`);
        

        stateindex++;
        if (stateindex >= states.length) stateindex = 0;

        client.setActivity({
            details: `Editing ${info.sheet.scoreName}`,
            state: states[stateindex],
            startTimestamp: start,
            largeImageKey: largeImageKey,
            smallImageKey: smallImageKey,
            largeImageText: appTitle,
            smallImageText: `Contains ${info.sheet.nmeasures} Measures`
        }, (app.pid || null));
    } else {
        client.setActivity({
            details: "Musescore",
            state: "Unknown",
            startTimestamp: start,
            largeImageKey: largeImageKey,
            smallImageKey: smallImageKey,
            largeImageText: appTitle,
            smallImageText: "Composing"
        }, (app.pid || null));
    }
}

update();

client.on("ready", () => {
    console.log("✓ Online and ready to rock!")
    update();
    setInterval(() => {
        update();
    }, 5000);
});

console.log("Connecting...");
client.login({ clientId: "577645453429047314" });

process.on("unhandledRejection", console.error);