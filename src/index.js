// var Events = require("@minima-global/mds-api");
// console.log(Events);

import { Events, Commands } from "@minima-global/mds-api";

let mdsCmds = new Commands();

let retries = 3;

const callStatus = () => {
  return retryPromise(mdsCmds.status, retries);
};

const retryPromise = (myProm, attemptsLeft) => {
  const newAttemptsLeft = attemptsLeft - 1;
  return new Promise((resolve, reject) => {
    //console.log(`attempt ${attemptsLeft} to call ${myProm.name}`);
    myProm().then(
      (successData) => {
        //console.log(`attempt ${attemptsLeft} success`);
        addText("**********************************************\n");
        addText("*  __  __  ____  _  _  ____  __  __    __    *\n");
        addText("* (  \\/  )(_  _)( \\( )(_  _)(  \\/  )  /__\\   *\n");
        addText("*  )    (  _)(_  )  (  _)(_  )    (  /(__)\\  *\n");
        addText("* (_/\\/\\_)(____)(_)\\_)(____)(_/\\/\\_)(__)(__) *\n");
        addText("*                                            *\n");
        addText("**********************************************\n");
        addText(
          "Welcome to Minima. For assistance type help. Then press enter.\n"
        );
        resolve(successData);
      },
      (failureData) => {
        console.log(`attempt ${attemptsLeft} failure`);
        if (newAttemptsLeft < 1) {
          reject(failureData);
        } else {
          return retryPromise(myProm, newAttemptsLeft).then(resolve, reject);
        }
      }
    );
  });
};

callStatus();

var HISTORY = [];
var histcounter = 0;

//Add text to the TextArea
function addText(text) {
  //Get the TextArea
  var txt = document.getElementById("terminal");

  //Add the text
  txt.value += text;
  txt.focus();

  //Scroll to the bottom
  txt.scrollTop = txt.scrollHeight;
}

function deleteLastLine() {
  var txt = document.getElementById("terminal");
  var content = txt.value;
  var prelastLine = content.substr(0, content.lastIndexOf("\n") + 1);
  txt.value = prelastLine;
}

//Disable all arrow keys..
window.addEventListener(
  "keydown",
  function (e) {
    //LEFT RIGHT
    if ([37, 39].indexOf(e.keyCode) > -1) {
      //UP DOWN
    } else if ([38, 40].indexOf(e.keyCode) > -1) {
      //Last line
      deleteLastLine();

      //use the History.. UP
      if (e.keyCode == 38) {
        histcounter--;
        if (histcounter < 0) {
          histcounter = 0;
        }

        //UP
        addText(HISTORY[histcounter]);
      } else {
        histcounter++;
        if (histcounter >= HISTORY.length - 1) {
          histcounter = HISTORY.length - 1;
        }

        //UP
        addText(HISTORY[histcounter]);
      }

      //And prevent normal behaviour
      e.preventDefault();

      //ENTER
    } else if ([13].indexOf(e.keyCode) > -1) {
      //Grab the Last Line..
      var txt = document.getElementById("terminal");
      var content = txt.value;
      var lastLine = content.substr(content.lastIndexOf("\n") + 1).trim();

      //Run it on Minima
      if (lastLine !== "") {
        //Add to the History
        if (lastLine != HISTORY[HISTORY.length - 1]) {
          HISTORY.push(lastLine);
        }
        histcounter = HISTORY.length;

        // check index of first space
        const indexOfSpace = lastLine.indexOf(" ");
        let commandName = "";
        let arguements = [];
        let result = {};
        // check if there is any spaces after first command
        if (indexOfSpace !== -1) {
          // get the arguements as string
          commandName = lastLine.substr(0, indexOfSpace);
          // replace spaces with comma and trim
          arguements = lastLine
            .substr(indexOfSpace, lastLine.length)
            .trim()
            .replace(/ /g, ",");
          // split them into an array then apply key/pair object
          arguements.split(",").forEach(function (x) {
            var arr = x.split(":");
            arr[1] && (result[arr[0]] = arr[1]);
          });
        }

        // call cmd
        mdsCmds
          .custom({
            name:
              commandName && commandName.length > 0 ? commandName : lastLine,
            args: { ...result },
          })
          .then((res) => {
            // console.log(res);

            //Get the JSON..
            var respstring = JSON.stringify(res, null, 2);

            //Convert line breakers..
            var linebreaker = respstring.replace(/\\n/g, "\n");

            //And add..
            addText(linebreaker + "\n");

            txt.focus();
            txt.setSelectionRange(txt.value.length, txt.value.length);
          })
          .catch((err) => {
            let dummyError = `{\n  "command": "${
              commandName && commandName.length > 0 ? commandName : lastLine
            }",\n  "status": false,\n  "error": "${err
              .toString()
              .substring(7, err.length)}"\n} `;
            addText(dummyError + "\n");
            txt.focus();
            txt.setSelectionRange(txt.value.length, txt.value.length);
          });
      } else {
        addText("");
      }

      //Move to the end..
      txt.focus();
      txt.setSelectionRange(txt.value.length, txt.value.length);
    }
  },
  false
);
