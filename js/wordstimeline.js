"use strict";

function WordsTimeLine(transcripter, timelineElement) {
    if (!this) {
        return new WordsTimeLine(transcripter)
    }

    var name = transcripter.instanceName()

    var timelinewordInputElement = null
    var timelinewordSubmitElement = null
    var timelinewordResetElement = null
    var timelinewordStatusElement = null

    function cleartimeline() {
        if (timelineElement)
            timelineElement.innerHTML = ""

        if (timelinewordInputElement)
            timelinewordInputElement.value = ""

        if (timelinewordStatusElement)
            timelinewordStatusElement.innerHTML = ""
    }

    function timelinecueclick(event) {
        let currentcue = event.target

        if (currentcue.classList.contains('timelinecue')) {
            //let starttime = thispointer.getAttribute("data-starttime")
            let ordinal = currentcue.getAttribute("data-ordinal")

            //setvideoposition(starttime)
            transcripter.currentCueChanged(ordinal)
        }
    }
    
    function addwordtotimeline(word) {
        var captionsData = transcripter.data()
        if (!(timelineElement && captionsData && captionsData.cues.length > 0))
            return

        timelineElement.innerHTML = ""

        let lastcue = captionsData.cues[captionsData.cues.length - 1]
        let totaltime = lastcue.endTime

        let filteredcues = captionsData.cues.filter(function (item) {
            return item.text.toLowerCase().includes(word.toLowerCase())
        })

        if (timelinewordStatusElement)
            timelinewordStatusElement.innerHTML = filteredcues.length + " occurences."

        filteredcues.forEach(function (cue) {
            let cuetime = cue.endTime - cue.startTime
            let cuewidth = (cuetime / totaltime) * 100

            let cueposition = (cue.startTime / totaltime) * 100

            let newBlock = document.createElement("div")
            newBlock.setAttribute("class", "timelinecue")
            newBlock.setAttribute("data-starttime", cue.startTime)
            newBlock.setAttribute("data-ordinal", cue.ordinal)
            newBlock.style.position = "absolute"
            newBlock.style.left = cueposition + "%"
            newBlock.style.width = cuewidth + "%"
            newBlock.innerHTML = "&nbsp;"
            newBlock.setAttribute("title", transcripter.timefromms(cue.startTime * 1000))
            newBlock.addEventListener("click", timelinecueclick)
            timelineElement.appendChild(newBlock)
        })
    }

    function formsubmitclick(event) {
        if (timelinewordInputElement) {
            let word = timelinewordInputElement.value
            if (word === "") {
                cleartimeline()
            } else {
                addwordtotimeline(word)
            }
        }
    }

    function formresetclick(event) {
        cleartimeline()
    }

    function setupwordform() {
        if (timelinewordSubmitElement)
            timelinewordSubmitElement.addEventListener("click", formsubmitclick)
        if (timelinewordResetElement)
            timelinewordResetElement.addEventListener("click", formresetclick)
    }

    this.setup = setupwordform


    timelinewordInputElement = document.querySelector(".timelineword." + name)
    timelinewordSubmitElement = document.querySelector(".timelinesubmit." + name)
    timelinewordResetElement = document.querySelector(".timelinereset." + name)
    timelinewordStatusElement = document.querySelector(".timelinestatus." + name)

    return this
}