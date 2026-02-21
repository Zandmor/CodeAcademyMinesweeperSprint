"use strict"
var gSafeClickUses = 3
var gPlaceMinesLeft = 0
var gPlaceMines = false
var gDifficulty = [8, 12] //[board size, mine count]
var gBoard = []
var gHealth = 3
var gHints = 3
var gHintClicked = false
var gMegaClicked = false
var gMegaArea = [["empty"], ["empty"]]
var gTimeStart = 0
var gMines = []
var gPrevBoards = []
var gHintTurn = false

var gGame =
{
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0
}


function onInit() {

    displayHighScore()
    gPlaceMinesLeft = 0
    gPlaceMines = false
    gTimeStart = new Date()
    gHealth = 3
    gHints = 3
    gSafeClickUses = 3
    gPrevBoards = []
    gMines = []
    gHintClicked = false
    gMegaClicked = false
    gMegaArea = [["empty"], ["empty"]]
    gHintTurn = false
    gGame =
    {
        isOn: false,
        revealedCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gBoard = []
    resetCheats()
    buildBoard()
    renderBoard()
    renderHealth()
    renderHints()
    renderSafeClick()
}


function buildBoard() {
    for (var i = 0; i < gDifficulty[0]; i++) {
        gBoard.push([])
        for (var j = 0; j < gDifficulty[0]; j++) {
            gBoard[i].push({ isMine: false, revealed: false, neighbors: 0, marked: false, safeMarked: false })
        }
    }
}

function checkNeighbor(y, x) {
    var check = 0
    for (var i = y - 1; i <= y + 1; i++) {
        for (var j = x - 1; j <= x + 1; j++) {
            if (!(i == y && j == x) && i > -1 && i < gBoard.length && j > -1 && j < gBoard.length) {

                if (gBoard[i][j].isMine) check++
            }
        }
    }
    return check
}


function checkBoard() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            gBoard[i][j].neighbors = checkNeighbor(i, j)
        }
    }
}

function onCellMark(elCell, y, x) {
    if (!gBoard[y][x].revealed) gBoard[y][x].marked = !gBoard[y][x].marked
    renderBoard()
}

function plantMines(initY, initX) {
    var x = 0
    var y = 0
    for (var i = 0; i < gDifficulty[1]; i++) {
        x = Math.floor(Math.random() * gBoard.length)
        y = Math.floor(Math.random() * gBoard.length)
        if (!(y == initY && x == initX)) {

            if (!(gBoard[y][x].isMine)) {
                gBoard[y][x].isMine = true
                gMines.push([y, x])
            }
            else i--
        }
        else i--
    }
    checkBoard()

}
function mineExplode() {
    var explode = new Audio('sound/explosion.mp3');
    explode.volume = 0.1
    explode.play();
}

function onSmileyClick() {
    onInit()
}

function expandReveal(y, x) {
    if (!gBoard[y][x].revealed) {
        for (var i = y - 1; i <= y + 1; i++) {
            for (var j = x - 1; j <= x + 1; j++) {
                if (!(i == y && j == x) && i > -1 && i < gBoard.length && j > -1 && j < gBoard.length) {

                    if ((!gBoard[y][x].isMine)) {
                        gBoard[y][x].revealed = true
                        gBoard[y][x].marked = false
                        if (!gBoard[i][j].isMine) {
                            if (gBoard[i][j].neighbors == 0) expandReveal(i, j)
                            else {
                                gBoard[i][j].revealed = true
                                gBoard[i][j].marked = false
                            }
                        }


                    }
                }
            }
        }
    }
}

function smallReveal(y, x) {
    for (var i = y - 1; i <= y + 1; i++) {
        for (var j = x - 1; j <= x + 1; j++) {
            if (!(i == y && j == x) && i > -1 && i < gBoard.length && j > -1 && j < gBoard.length) {

                gBoard[i][j].revealed = true
            }
        }
    }
}

function megaReveal(yStart, xStart, yEnd, xEnd) {
    if (yEnd >= yStart && xEnd >= xStart) {
        for (var i = yStart; i <= yEnd; i++) {
            for (var j = xStart; j <= xEnd; j++) {
                gBoard[i][j].revealed = true
            }
        }
    }
}

function hideMegaButton() {
    var gameMegaHint = document.getElementById("megaHint")
    var megaHintCode = "<button id = \"megaHint\" class=\"megaUsed\">Mega Hint</button>"

    gameMegaHint.disabled = true
}

function renderSafeClick() {

    var gameSafeClick = document.getElementById("safeClick")
    if (gSafeClickUses > 0) gameSafeClick.innerHTML = "Safe Click: " + gSafeClickUses + " Uses Left"
    if (gSafeClickUses == 0) {
        gameSafeClick.innerHTML = "Safe Click Ran Out"
        gameSafeClick.disabled = true
    }
}
function safeClick() {
    gHintTurn = true
    gSafeClickUses--
    renderSafeClick()
    var check = false
    var checkSpot
    while (check == false) {
        checkSpot = gBoard[Math.floor(Math.random() * gBoard.length)][Math.floor(Math.random() * gBoard.length)]
        if (checkSpot.revealed == false && checkSpot.isMine == false) {
            check = true
            checkSpot.safeMarked = true
        }
    }
    renderBoard()
    console.log(checkSpot)
    setTimeout(function () {
        console.log(checkSpot)
        checkSpot.safeMarked = false
        gHintTurn = false
        renderBoard()

    }, 1500);

}

function exterminateMines(minesRemoved) {
    var randomSpot
    for (var i = 0; i < minesRemoved; i++) {
        if (gMines.length > 0) {
            randomSpot = Math.floor(Math.random() * gMines.length)
            gBoard[gMines[randomSpot][0]][gMines[randomSpot][1]].isMine = false
            gMines.splice(randomSpot, 1)
        }
    }
    checkBoard()
    disableExterminator()
    renderBoard()

}
function disableExterminator() {
    var gameExterminator = document.getElementById("mineExterminator")

    gameExterminator.innerHTML = "Exterminator Disabled"
    gameExterminator.disabled = true
}

function revealCell(elCell, y, x) {
    if (!gHintTurn) {
        if (gGame.isOn) {
            if (gPlaceMines) {
                placeManualMine(y, x)
            }
            else {


                if (gMegaClicked) {
                    if (gMegaArea[0] == "empty") gMegaArea[0] = [y, x]
                    else {
                        if (gMegaArea[1] == "empty") {
                            gMegaArea[1] = [y, x]
                            SaveBoards()
                            gHintTurn = true
                            gMegaClicked = false
                            hideMegaButton()
                            megaReveal(gMegaArea[0][0], gMegaArea[0][1], gMegaArea[1][0], gMegaArea[1][1])
                            renderBoard()
                            setTimeout(() => {

                                undo()
                                gHintTurn = false
                                renderHints()
                            }, 1500);
                        }
                    }
                }

                else {
                    SaveBoards()
                    if (gHintClicked) {
                        gHintClicked = false
                        gHintTurn = true
                        smallReveal(y, x)
                        renderBoard()
                        setTimeout(() => {

                            undo()
                            gHintTurn = false
                            renderHints()
                        }, 1500);
                    }
                    else {
                        if (!(gBoard[y][x].revealed) && (gBoard[y][x].isMine)) {

                            if (gHealth > 0) gHealth--
                            renderHealth()
                            mineExplode()
                        }

                        else {
                            if (gBoard[y][x].neighbors == 0) expandReveal(y, x)
                            gBoard[y][x].revealed = true
                            gBoard[y][x].marked = false
                        }
                    }
                }
            }
        }
        else {
            gGame.isOn = true
            plantMines(y, x)
            if (gBoard[y][x].neighbors == 0) expandReveal(y, x)
            gBoard[y][x].revealed = true
            gBoard[y][x].marked = false
        }

        renderBoard()
    }
}

function DisplayConsoleBoard() {
    var StringTable = []
    for (var i = 0; i < gBoard.length; i++) {
        StringTable.push([])
        for (var j = 0; j < gBoard.length; j++) {

            if (gBoard[i][j].isMine == true) StringTable[i].push("*")
            else StringTable[i].push(gBoard[i][j].neighbors)
            if (gBoard[i][j].marked) StringTable[i][j] += "!"
        }
    }
    console.table(StringTable)
}



function renderBoard() {
    var gameTable = document.getElementById("gameTable")
    var tableCode = ""
    for (var i = 0; i < gBoard.length; i++) {
        tableCode += "<tr>"
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].revealed) {
                if (gBoard[i][j].isMine) tableCode += "<td><button class=\"cell mineCell\"></button></td>"
                else tableCode += "<td><button class=\"cell visibleCell\">" + gBoard[i][j].neighbors + "</button></td>"
            }
            else {
                if (gBoard[i][j].marked) tableCode += "<td><button class=\"cell markedCell\""
                else if (gBoard[i][j].safeMarked) tableCode += "<td><button class=\"cell safeMarkedCell\""
                else tableCode += "<td><button class=\"cell hiddenCell\""
                tableCode += "onclick= \"revealCell(this, " + i + ", " + j + ")\" oncontextmenu= \"onCellMark(this, " + i + ", " + j + ")\"></button></td>"
            }
        }
        tableCode += "</tr>"

    }
    gameTable.innerHTML = tableCode
    if (gGame.isOn) checkGameState()
    //DisplayConsoleBoard()
    //console.log(gPrevBoards)
}

function renderHealth() {
    var gameHealth = document.getElementById("gameHealth")
    var healthCode = ""
    healthCode += "<b class=\"health\">Health: </b>"
    for (var i = 0; i < gHealth; i++) {
        healthCode += "<img class=\"heart\" src= \"img/heart.png\"></img>"
    }
    gameHealth.innerHTML = healthCode
}


function renderHints() {
    var gameHints = document.getElementById("gameHints")
    var hintsCode = ""
    if (gHintClicked) gHints--
    for (var i = 0; i < gHints; i++) {
        if (!gHintClicked) hintsCode += "<img onclick= \"clickHint()\" "
        else hintsCode += "<img "
        hintsCode += "class=\"hint\" src= \"img/hint.png\"></img>"
    }
    if (gHintClicked) hintsCode += "<img class=\"hint\" src= \"img/clickhint.png\"></img>"
    gameHints.innerHTML = hintsCode
}

function clickHint() {
    gHintClicked = true
    renderHints()
}

function clickMegaHint() {
    gMegaClicked = true
}

function checkGameState() {
    var Smiley = document.getElementById("gameSmiley")
    if (gHealth > 0 && !checkGameOver()) Smiley.innerHTML = "&#128516"
    if (gHealth == 0) {
        gHealth--
        Smiley.innerHTML = "&#128584"
        var lose = new Audio('sound/lose.opus');
        lose.volume = 0.02
        lose.play();
        setTimeout(() => {
            Smiley.innerHTML = "&#128516"
            onInit()
        }, 3000);

    }
    if (checkGameOver()) {
        Smiley.innerHTML = "&#128640"
        for (var i = 0; i < gMines.length; i++) {
            gBoard[gMines[i][0]][gMines[i][1]].marked = false
            gBoard[gMines[i][0]][gMines[i][1]].revealed = true
        }
        gGame.isOn = false
        renderBoard()
        var win = new Audio('sound/win.opus');
        win.volume = 1
        win.play();
        gGame.secsPassed = ((new Date()) - gTimeStart) / 1000
        if (localStorage.getItem("Difficulty " + gDifficulty[0])) {
            var Highscore = localStorage.getItem("Difficulty " + gDifficulty[0])
            if (gGame.secsPassed < Number(Highscore)) localStorage.setItem("Difficulty " + gDifficulty[0], gGame.secsPassed)

        }
        else localStorage.setItem("Difficulty " + gDifficulty[0], gGame.secsPassed)
        displayHighScore()

    }
}

function checkGameOver() {
    var CheckWin = true
    if (gHintTurn) CheckWin = false
    for (var i = 0; i < gBoard.length; i++) {

        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine && !gBoard[i][j].marked) CheckWin = false
            if (!gBoard[i][j].isMine && gBoard[i][j].marked) CheckWin = false
            if (!gBoard[i][j].isMine && !gBoard[i][j].revealed) CheckWin = false
        }
    }
    return CheckWin
}

function changeDifficulty(diff, mines) {
    gDifficulty = [diff, mines]
    onInit()
}

function displayHighScore() {
    var HS = document.getElementById("highscore")
    var display = "Highscore: "
    if (localStorage.getItem("Difficulty " + gDifficulty[0])) display += localStorage.getItem("Difficulty " + gDifficulty[0])
    else display += "000"
    HS.innerHTML = display
}

function SaveBoards() {
    var copy = []
    for (var i = 0; i < gDifficulty[0]; i++) {
        copy.push([])
        for (var j = 0; j < gDifficulty[0]; j++) {
            copy[i].push({ isMine: gBoard[i][j].isMine, revealed: gBoard[i][j].revealed, neighbors: gBoard[i][j].neighbors, marked: gBoard[i][j].marked })
        }
    }
    if (gPrevBoards.length == 5) gPrevBoards.splice(0, 1)
    gPrevBoards.push(copy)

}

function undo() {
    if (gPrevBoards.length != 0) {
        console.log(gPrevBoards)
        gBoard = gPrevBoards.pop()
        console.log(gBoard)
    }
    gHintTurn = false
    renderBoard()

}


function switchDarkMode() {
    var element = document.body
    element.classList.toggle("darkMode")
}

function resetCheats() {
    var cheats = document.querySelectorAll(".cheat")
    for (var i = 0; i < cheats.length; i++) {
        cheats[i].disabled = false
    }
    var resetExterminator = document.getElementById("mineExterminator")
    resetExterminator.innerHTML = "Mine Exterminator"
    var placeMinesTurn = document.getElementById("placeMines")
    placeMinesTurn.innerHTML = "Place Mines"
}

function placeManualMines() {
    onInit()
    gGame.isOn = true
    gPlaceMinesLeft = gDifficulty[1]
    gPlaceMines = true
    var placeMinesTurn = document.getElementById("placeMines")
    placeMinesTurn.innerHTML = "Place Mines: " + gPlaceMinesLeft + " Mines Left"
}

function placeManualMine(y, x) {
    
    console.log(gPlaceMinesLeft)
    gBoard[y][x].isMine = true
    gPlaceMinesLeft--
    var placeMinesTurn = document.getElementById("placeMines")
    placeMinesTurn.innerHTML = "Place Mines: " + gPlaceMinesLeft + " Mines Left"
    if (gPlaceMinesLeft == 0) {
        placeMinesTurn.innerHTML = "Place Mines"
        gPlaceMines = false
    }
}