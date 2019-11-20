"use strict";

var IgniteVideoBrowser = function (name, videoUrl, captionsUrl, captionsLoadedCallBack) {
    if (!this) {
        return new igniteVideoBrowser(name, videoUrl, captionsUrl, captionsLoadedCallBack)
    }

    var thisBrowser = this
    var captionsReady = false
    var videoReady = false

    var videoElement = null
    var totaltimeElement = null
    var transcriptElement = null
    var timelineElement = null
    var timelinewordInputElement = null
    var timelinewordSubmitElement = null
    var timelinewordResetElement = null
    var timelinewordStatusElement = null

    var captionsData = null // Object with cues property. Cue looks like this:
    /*
    {
    alignment: "middle"
    direction: "horizontal"
    endTime: 2578.133
    id: ""
    linePosition: "auto"
    pauseOnExit: false
    size: 100
    snapToLines: true
    startTime: 2576.19
    text: "have a great day everyone."
    textPosition: 50
    }
    */

    function findElements() {
        videoElement = document.querySelector("video." + name)
        totaltimeElement = document.querySelector(".videotime." + name)
        transcriptElement = document.querySelector(".transcript." + name)
        timelineElement = document.querySelector(".timelines." + name)
        timelinewordInputElement = document.querySelector(".timelineword." + name)
        timelinewordSubmitElement = document.querySelector(".timelinesubmit." + name)
        timelinewordResetElement = document.querySelector(".timelinereset." + name)
        timelinewordStatusElement = document.querySelector(".timelinestatus." + name)
    }

    function videoLoaded(videoElement) {
        videoReady = true
    }

    function loadVideo() {
        if (videoElement && videoUrl) {
            videoElement.addEventListener("canplay", videoLoaded)
            videoElement.src = videoUrl
        }
    }

    function loadCaptions() {
        fetch(captionsUrl, { method: "GET" }).then(
            function onSRTFetched(response) {
                var parser = new WebVTTParser()
                response.text().then(
                    function onSRTResponseText(resptext) {
                        captionsData = parser.parse(resptext)
                        // Check sanity here

                        // Fill ordinals
                        captionsData.cues.forEach(function numberCues(item, index) {
                            item.ordinal = index
                        })
                        captionsReady = true
                        if (typeof captionsLoadedCallBack === "function") {
                            captionsLoadedCallBack(thisBrowser)
                        }

                        loadVideo()
                        addsummary()
                        addtranscript()
                        setupwordform()
                    }
                )
            }
        ).catch(
            function onSRTFetchError(err) {
                captionsData = null
                captionsReady = false
                window.alert("Error:" + err)
            }
        )
    }

    function timefromms(ms) {
        return new Date(ms).toISOString().slice(11, -1);
    }

    function addsummary() {
        if (captionsData && captionsData.cues.length > 0 && totaltimeElement) {
            let lastcue = captionsData.cues[captionsData.cues.length - 1]
            let summary = timefromms(lastcue.endTime * 1000)
            totaltimeElement.innerHTML = summary
        }
    }

    function setvideoposition(seconds) {
        if (videoElement && videoUrl) {
            videoElement.currentTime = seconds
        } else {
            window.alert("Move to: " + timefromms(seconds * 1000))
        }
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
        let thisclass = thispointer.getAttribute("class")
        let starttime = thispointer.getAttribute("data-starttime")
        let ordinal = thispointer.getAttribute("data-ordinal")

        setvideoposition(starttime)

        settranscriptposition(ordinal)
    }

    function addtranscript() {
        if (transcriptElement && captionsData) {
            transcriptElement.innerHTML = ""

            let limit = captionsData.cues.length
            for (let i = 0; i < limit; i++) {
                let cue = captionsData.cues[i]
                let newDiv = document.createElement("div")
                newDiv.setAttribute("class", "transcriptline")
                newDiv.setAttribute("data-starttime", cue.startTime)
                newDiv.setAttribute("data-ordinal", i)
                newDiv.innerHTML = cue.text
                //newDiv.addEventListener("click", transcriptlineclick)
                newDiv.addEventListener("click", transcriptpointerclick)
                transcriptElement.appendChild(newDiv)
            }
        }
    }

    function cleartimeline() {
        if (timelineElement)
            timelineElement.innerHTML = ""

        if (timelinewordInputElement)
            timelinewordInputElement.value =""
            
        if (timelinewordStatusElement)
            timelinewordStatusElement.innerHTML = ""
    }

    function addwordtotimeline(word) {
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
            newBlock.setAttribute("class", "transcriptcue")
            newBlock.setAttribute("data-starttime", cue.startTime)
            newBlock.setAttribute("data-ordinal", cue.ordinal)
            newBlock.style.position = "absolute"
            newBlock.style.left = cueposition + "%"
            newBlock.style.width = cuewidth + "%"
            newBlock.innerHTML = "&nbsp;"
            newBlock.setAttribute("title", timefromms(cue.startTime * 1000))
            newBlock.addEventListener("click", transcriptpointerclick)
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

    this.data = function () {
        return captionsData
    }

    this.addSummary = addsummary
    this.addWordToTimeline = function (word) {
        addwordtotimeline(word)
    }

    findElements()
    if (captionsUrl) {
        loadCaptions()
    } else {
        loadVideo()
    }

    return this
}