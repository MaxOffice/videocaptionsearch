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
    var wordsTimeline = null

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
        if (transcriptelement) {
            transcriptBrowser = new TranscriptBrowser(thisBrowser, transcriptelement)
        }

        var timelineelement = document.querySelector(".timelines." + name)
        if(timelineelement) {
            wordsTimeline = new WordsTimeLine(thisBrowser, timelineelement)
        }
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
                        setupwordstimeline()
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
        if (transcriptBrowser) {
            transcriptBrowser.addTranscript()
        }
    }

    function setupwordstimeline() {
        if(wordsTimeline) {
            wordsTimeline.setup()
        }
    }

    function settranscriptcurrentcue(ordinal) {
        if(transcriptBrowser) {
            transcriptBrowser.setCurrentCue(ordinal)
        }
    }

    function currentcuechanged(ordinal) {
        var currentcue = captionsData.cues[ordinal]
        setvideoposition(currentcue.startTime)
        settranscriptcurrentcue(ordinal)
    }


    this.instanceName = function () {
        return name
    }

    this.data = function () {
        return captionsData
    }

    this.currentCueChanged = currentcuechanged

    this.addSummary = addsummary

    this.timefromms = timefromms

    findElements()
    if (captionsUrl) {
        loadCaptions()
    } else {
        loadVideo()
    }

    return this
}
