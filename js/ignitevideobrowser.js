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
    var transcriptBrowser = null
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
        
        
        var transcriptelement = document.querySelector(".transcript." + name)
        if(transcriptelement) {
            transcriptBrowser = new TranscriptBrowser(thisBrowser, transcriptelement)
        }

        timelineElement = document.querySelector(".timelines." + name)
        timelinewordInputElement = document.querySelector(".timelineword." + name)
        timelinewordSubmitElement = document.querySelector(".timelinesubmit." + name)
        timelinewordResetElement = document.querySelector(".timelinereset." + name)
        timelinewordStatusElement = document.querySelector(".timelinestatus." + name)
    }

    function videoLoaded(event) {
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

    function addtranscript() {
        if(transcriptBrowser) {
            transcriptBrowser.addTranscript()
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

    function currentcuechanged(ordinal) {
        var currentcue = captionsData.cues[ordinal]
        setvideoposition(currentcue.startTime)
    }


    this.instanceName = function() {
        return name
    }

    this.data = function () {
        return captionsData
    }

    this.currentCueChanged = currentcuechanged

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