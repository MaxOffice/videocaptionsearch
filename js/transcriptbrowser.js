"use strict";

function TranscriptBrowser(transcripter, transcriptElement) {
    if (!this) {
        return new TranscriptBrowser(transcripter)
    }

    function settranscriptposition(ordinal) {
        if (transcriptElement) {
            let currentline = transcriptElement.children[ordinal]
            if (currentline) {

                let oldcurrent = transcriptElement.querySelector(".current")
                if (oldcurrent)
                    oldcurrent.classList.remove("current")

                currentline.scrollIntoView({ block: 'nearest' })
                currentline.classList.add("current")

            }
        }
    }

    function transcriptpointerclick(event) {
        let thispointer = event.target

        if (thispointer.classList.contains('transcriptcue')) {
            //let starttime = thispointer.getAttribute("data-starttime")
            var ordinal = thispointer.getAttribute("data-ordinal")

            //setvideoposition(starttime)
            transcripter.currentCueChanged(ordinal)

            settranscriptposition(ordinal)
        }
    }

    function addtranscript() {
        var captionsData = transcripter.data()
        if (transcriptElement && captionsData) {
            transcriptElement.innerHTML = ""

            let limit = captionsData.cues.length
            for (let i = 0; i < limit; i++) {
                let cue = captionsData.cues[i]
                let newDiv = document.createElement("div")
                newDiv.setAttribute("class", "transcriptcue")
                newDiv.setAttribute("data-starttime", cue.startTime)
                newDiv.setAttribute("data-ordinal", i)
                newDiv.style.cursor = 'pointer'
                newDiv.innerHTML = cue.text

                newDiv.addEventListener("click", transcriptpointerclick)
                transcriptElement.appendChild(newDiv)
            }
        }
    }


    this.addTranscript = addtranscript

    transcriptElement.style.position = 'absolute'
    transcriptElement.style.width = '100%'
    transcriptElement.style.height = '100%'
    transcriptElement.style.boxSizing = 'border-box'
    transcriptElement.style.overflowY = 'scroll'
    transcriptElement.addEventListener("click", transcriptpointerclick)

    return this
}