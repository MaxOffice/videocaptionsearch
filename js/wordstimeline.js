"use strict";

const WTLTEMPLATE = `
<div class="headercontainer">
<div class="header">
<div class="row">
    <div class="col col-1">
    &nbsp;        
    </div>
    <div class="col col-2">
    &nbsp;
    </div>
    <div class="col col-3">
        <input class="timelineword" />
        <button class="timelinesubmit" type="submit">Show</button>
        <button class="timelinereset">Clear</button>
        <span class="timelinestatus"></span>
    </div>
</div>
<div class="row">
    <div class="col col-1">
    &nbsp;
    </div>
    <div class="col col-2">
    &nbsp;
    </div>
    <div class="col col-3">
        <div style="float:left">00:00:00</div>
        <div style="float:right" class="endtime">00:00:00</div>
    </div>
</div>
</div>
</div>
<div class="bodycontainer">
<div class="body">
</div>
</div>
`

function WordsTimeLine(transcripter, timelineElement) {
    if (!this) {
        return new WordsTimeLine(transcripter)
    }

    var name = transcripter.instanceName()

    var timelinewordInputElement = null
    var timelinewordSubmitElement = null
    var timelinewordResetElement = null

    var endTimeElement = null
    var timelineRowsElement = null

    function cleartimeline() {
        timelinewordInputElement.value = ""
        timelineRowsElement.innerHTML = ""
        timelinewordInputElement.focus()
    }

    function addrowtotable() {
        let fragment = document.createDocumentFragment()

        let newRow = document.createElement("div")
        newRow.classList.add("row")

        let newCol1 = document.createElement("div")
        newCol1.classList.add("col", "col-1")

        let newCol2 = document.createElement("div")
        newCol2.classList.add("col", "col-2")

        let wordDeleter = document.createElement("div")
        wordDeleter.classList.add("delete")
        wordDeleter.innerText = "X"
        wordDeleter.style.cursor = 'pointer'

        newCol2.appendChild(wordDeleter)

        let newCol3 = document.createElement("div")
        newCol3.classList.add("col", "col-3")
        newCol3.style.backgroundColor = 'white'

        newRow.appendChild(newCol1)
        newRow.appendChild(newCol2)
        newRow.appendChild(newCol3)

        fragment.appendChild(newRow)

        return {
            row: fragment,
            wordcell: newCol1,
            cuescell: newCol3
        }
    }

    function addwordtotimeline(word) {
        var captionsData = transcripter.data()
        if (!(captionsData && captionsData.cues.length > 0))
            return

        let lastcue = captionsData.cues[captionsData.cues.length - 1]
        let totaltime = lastcue.endTime

        let filteredcues = captionsData.cues.filter(function (item) {
            return item.text.toLowerCase().includes(word.toLowerCase())
        })

        let newrow = addrowtotable()
        let row = newrow.row
        let wordcell = newrow.wordcell
        let cuescell = newrow.cuescell

        wordcell.innerText = word + " (" + filteredcues.length + ")"

        filteredcues.forEach(function (cue) {
            let cuetime = cue.endTime - cue.startTime
            let cuewidth = (cuetime / totaltime) * 100

            let cueposition = (cue.startTime / totaltime) * 100

            let newBlock = document.createElement("div")
            newBlock.setAttribute("class", "timelinecue")
            newBlock.setAttribute("data-starttime", cue.startTime)
            newBlock.setAttribute("data-ordinal", cue.ordinal)
            newBlock.style.left = cueposition + "%"
            newBlock.style.width = cuewidth + "%"
            newBlock.innerHTML = "&nbsp;"
            newBlock.setAttribute("title", cue.text)

            cuescell.appendChild(newBlock)
        })

        timelineRowsElement.appendChild(row)
        timelineRowsElement.querySelector('div.row:last-child').scrollIntoView()
        
    }

    function timelinecueclick(event) {
        let currentcue = event.target

        if (currentcue.classList.contains('timelinecue')) {
            let ordinal = currentcue.getAttribute("data-ordinal")
            transcripter.currentCueChanged(ordinal)

        } else if (currentcue.classList.contains('delete')) {
            currentcue.parentElement.parentElement.remove()
        }
    }

    function formsubmitclick(event) {
        if (timelinewordInputElement) {
            let word = timelinewordInputElement.value
            if (word.trim() !== "") {
                addwordtotimeline(word)
                timelinewordInputElement.value = ""
                timelinewordInputElement.focus()
            }
        }
    }

    function formresetclick(event) {
        cleartimeline()
    }

    function setup() {
        timelineElement.innerHTML = WTLTEMPLATE
        timelinewordInputElement = timelineElement.querySelector(".timelineword")

        timelinewordSubmitElement = timelineElement.querySelector(".timelinesubmit")
        timelinewordSubmitElement.addEventListener("click", formsubmitclick)

        timelinewordResetElement = timelineElement.querySelector(".timelinereset")
        timelinewordResetElement.addEventListener("click", formresetclick)

        endTimeElement = timelineElement.querySelector(".endtime")
        endTimeElement.innerText = transcripter.videoLastTime()

        timelineRowsElement = timelineElement.querySelector(".body")

        timelinewordInputElement.onkeypress = function (event) {
            if (event.keyCode === 13) {
                timelinewordSubmitElement.click()
                event.preventDefault()
            }
        }
    }

    this.setup = setup

    timelineElement.innerHTML = ""
    timelineElement.addEventListener("click", timelinecueclick)

    return this
}