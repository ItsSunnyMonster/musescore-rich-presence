import QtQuick 2.2
import QtQuick.Dialogs 1.1
import MuseScore 3.0
import FileIO 3.0

MuseScore {
    version: "1.0"
    title: "Discord Rich Presence"
    description: qsTr("A plugin that displays information about the current score in Discord")
    categoryCode: "Discord Rich Presence"
    thumbnailName: "discord_rich_presence.png"
    onRun: {
        if (Qt.csitimer == undefined || Qt.csitimer == null) {
            Qt.csitimer = csitimer;
            Qt.csitimer.start();
            startedDialog.open();
        } else {
            if (Qt.csitimer.running) {
                Qt.csitimer.stop();
                Qt.csitimer = null;
                stoppedDialog.open();
            }
        }
    }
    QProcess {
        id: proc
    }
    FileIO {
        id: outfile
        source: homePath() + "/.musepresenceinfo.json"
        onError: console.log(msg)
    }
    Timer {
        id: csitimer
        interval: 1000
        running: false
        repeat: true
        onTriggered: {
            makeScoreInfo();
        }
    }
    MessageDialog {
        id: startedDialog
        title: "Plugin Has Been Enabled"
        text: qsTr("The plugin has been enabled.")
        onAccepted: {
            
        }
        visible: false
    }
    MessageDialog {
        id: stoppedDialog
        title: "Plugin Has Been Disabled"
        text: qsTr("The plugin has been disabled.")
        onAccepted: {

        }
        visible: false
    }
    function makeScoreInfo() {
        if (curScore == null) {
            outfile.write("{}");
        } else {
            const score = fetchScoreInfo(curScore, null);
            outfile.write(JSON.stringify(score, null, 2));
        }
    }
    function fetchScoreInfo(obj, score) {
        if (score == null) {
            score = {};
        }
        for (var prop in obj) {
            if (typeof obj[prop] != "function" && typeof obj[prop] != "object") {
                if (typeof obj[prop] == "object") {
                    score[prop] = fetchScoreInfo(obj[prop], score);
                } else {
                    score[prop] = obj[prop];
                }
            }
        }
        return score;
    }
}