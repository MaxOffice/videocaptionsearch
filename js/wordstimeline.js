"use strict";

const WTLTEMPLATE = `
<div class="headercontainer">
<div class="header">
<div class="row">
    <div class="col col-1">
    <button class="timelinereset atleastoneword hidden">Clear All</button>        
    </div>
    <div class="col col-2">
    &nbsp;
    </div>
    <div class="col col-3">
        <input class="timelineword" placeholder="Type search text (Enter)" />
        <button class="timelinesubmit" type="submit">Search</button>
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
        <div style="float:left" class="atleastoneword hidden">00:00:00</div>
        <div style="float:right" class="endtime atleastoneword hidden">00:00:00</div>
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

    function hideshowsearchelements() {
        let searchelements = timelineElement.querySelectorAll(".atleastoneword")
        let hide = (timelineRowsElement.children.length === 0)
        for(let i=0;i<searchelements.length;i++) {
            if(hide) {
                searchelements[i].classList.add('hidden')
            } else {
                searchelements[i].classList.remove('hidden')
            }
        }
    }

    function cleartimeline() {
        timelinewordInputElement.value = ""
        timelineRowsElement.innerHTML = ""
        timelinewordInputElement.focus()
        hideshowsearchelements()
    }

    function addrowtotable() {
        let fragment = document.createDocumentFragment()

        let newRow = document.createElement("div")
        newRow.classList.add("row")

        let newCol1 = document.createElement("div")
        newCol1.classList.add("col", "col-1")

        let newCol2 = document.createElement("div")
        newCol2.classList.add("col", "col-2")

        let wordDeleter = document.createElement("img")
        wordDeleter.classList.add("deleteword")
        wordDeleter.src = "assets/remove.svg"
        wordDeleter.title = "Delete word"

        newCol2.appendChild(wordDeleter)

        let newCol3 = document.createElement("div")
        newCol3.classList.add("col", "col-3")

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

            let cueElement = document.createElement("div")
            cueElement.setAttribute("class", "timelinecue")
            cueElement.setAttribute("data-starttime", cue.startTime)
            cueElement.setAttribute("data-ordinal", cue.ordinal)
            cueElement.style.left = cueposition + "%"
            cueElement.style.width = cuewidth + "%"
            cueElement.innerHTML = "&nbsp;"
            cueElement.setAttribute("title", cue.text)

            cuescell.appendChild(cueElement)
        })

        timelineRowsElement.appendChild(row)
        timelineRowsElement.querySelector('div.row:last-child').scrollIntoView()
        hideshowsearchelements()
    }

    function timelinecueclick(event) {
        let currentcue = event.target

        if (currentcue.classList.contains('timelinecue')) {
            let ordinal = currentcue.getAttribute("data-ordinal")
            transcripter.currentCueChanged(ordinal)

        } else if (currentcue.classList.contains('deleteword')) {
            currentcue.parentElement.parentElement.remove()
            hideshowsearchelements()
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