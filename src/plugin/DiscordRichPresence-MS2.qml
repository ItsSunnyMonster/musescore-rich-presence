import QtQuick 2.0
import MuseScore 1.0
import FileIO 1.0

MuseScore {
      description: "A plugin that displays information about the current score in Discord"
      version: "1.0"
      FileIO {
            id: outfile
            source: homePath() + "/.musepresenceinfo.json"
            onError: console.log(msg)
      }
      function makeScoreInfo(cscore) {
            const score = fetchScoreInfo(curScore);
            outfile.write(JSON.stringify(score, null, 2));
      }
      function fetchScoreInfo(obj) {
            const score = {};
            for (var prop in obj) {
                if (typeof obj[prop] != "function" && typeof obj[prop] != "object") {
                    score[prop] = obj[prop];
                }
            }
            return score;
      }
      Timer {
            id: csitimer
            interval: 1000
            running: true
            repeat: true
            onTriggered: {
                makeScoreInfo();
            }
      }
}