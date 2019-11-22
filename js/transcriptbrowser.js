"use strict";

function TranscriptBrowser(transcripter, transcriptElement) {
    if (!this) {
        return new TranscriptBrowser(transcripter)
    }

    function settranscriptposition(ordinal, interactive) {
        if (transcriptElement) {
            let currentline = transcriptElement.children[ordinal]
            if (currentline) {

                let oldcurrent = transcriptElement.querySelector(".current")
                if (oldcurrent)
                    oldcurrent.classList.remove("current")

                if (!interactive) {
                    currentline.scrollIntoView({ block: 'center', behavior: 'auto' })
                }

                currentline.classList.add("current")

            }
        }
    }

    function transcriptcueclick(event) {
        let thispointer = event.target

        if (thispointer.classList.contains('transcriptcue')) {
            var ordinal = thispointer.getAttribute("data-ordinal")

            transcripter.currentCueChanged(ordinal, true)
        }
    }

    function addtranscript() {
        var captionsData = transcripter.data()
        if (transcriptElement && captionsData) {
            transcriptElement.innerHTML = ""

            let limit = captionsData.cues.length
            for (let i = 0; i < limit; i++) {
                let cue = captionsData.cues[i]
                let newTranscriptCue = document.createElement("div")
                newTranscriptCue.setAttribute("class", "transcriptcue")
                newTranscriptCue.setAttribute("data-starttime", cue.startTime)
                newTranscriptCue.setAttribute("data-ordinal", i)
                newTranscriptCue.innerHTML = cue.text

                transcriptElement.appendChild(newTranscriptCue)
            }
        }
    }


    this.setCurrentCue = settranscriptposition
    this.addTranscript = addtranscript

    if (transcriptElement) {
        transcriptElement.addEventListener("click", transcriptcueclick)
    }

    return this
}