"use strict" 
var gDifficulty = [8,12] //[board size, mine count]
var gBoard = []
var gHealth = 3
var gTimeStart = 0
var gMines = []
var gPrevBoards = []
var gGame =
{
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0
}


function onInit() {
    displayHighScore()
    gTimeStart = new Date()
    gHealth = 3
    gPrevBoards = []
    gMines = []
    gGame =
    {
        isOn: false,
        revealedCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gBoard = []
    buildBoard()
    renderBoard()
    renderHealth()
}


function buildBoard() {
    for (var i = 0; i < gDifficulty[0]; i++) {
        gBoard.push([])
        for (var j = 0; j < gDifficulty[0]; j++) {
            gBoard[i].push({ isMine: false, revealed: false, neighbors: 0, marked: false })
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

            if (!(gBoard[y][x].isMine)){
                gBoard[y][x].isMine = true
                gMines.push([y,x])
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
function revealCell(elCell, y, x) {

    if (gGame.isOn) {
        SaveBoards()
        if (!(gBoard[y][x].revealed) && (gBoard[y][x].isMine)) {
            
            gHealth--
            renderHealth()
            mineExplode()
        }

        else {
            if (gBoard[y][x].neighbors == 0) expandReveal(y, x)
            gBoard[y][x].revealed = true
            gBoard[y][x].marked = false
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
                else tableCode += "<td><button class=\"cell hiddenCell\""
                tableCode += "onclick= \"revealCell(this, " + i + ", " + j + ")\" oncontextmenu= \"onCellMark(this, " + i + ", " + j + ")\"></button></td>"
            }
        }
        tableCode += "</tr>"

    }
    gameTable.innerHTML = tableCode
    checkGameState()
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


function checkGameState() {
    var Smiley = document.getElementById("gameSmiley")
    if (gHealth>0 && !checkGameOver()) Smiley.innerHTML = "&#128516"
    if (gHealth == 0) {
        Smiley.innerHTML = "&#128584"
    }
    if (checkGameOver()) {
        Smiley.innerHTML = "&#128640"
        var win = new Audio('sound/win.opus');
        win.volume = 1
        win.play();
        gGame.secsPassed = ((new Date())-gTimeStart)/1000
        if(localStorage.getItem("Difficulty " + gDifficulty[0]))
        {
            var Highscore = localStorage.getItem("Difficulty " + gDifficulty[0])
            if(gGame.secsPassed<Number(Highscore)) localStorage.setItem("Difficulty " + gDifficulty[0],gGame.secsPassed)
        
        }
        else localStorage.setItem("Difficulty " + gDifficulty[0],gGame.secsPassed)
        displayHighScore()

    }
}

function checkGameOver() {
    var CheckWin = true

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine && !gBoard[i][j].marked) CheckWin = false
            if (!gBoard[i][j].isMine && gBoard[i][j].marked) CheckWin = false
            if (!gBoard[i][j].isMine && !gBoard[i][j].revealed) CheckWin = false
        }
    }
    return CheckWin
}

function changeDifficulty(diff,mines){
    gDifficulty=[diff,mines]
onInit()
}

function displayHighScore() {
    var HS = document.getElementById("highscore")
    var display="Highscore: "
    if(localStorage.getItem("Difficulty " + gDifficulty[0])) display+=localStorage.getItem("Difficulty " + gDifficulty[0])
    else display+= "000"
    HS.innerHTML=display
}

function SaveBoards() {
    var copy = []
    for (var i = 0; i < gDifficulty[0]; i++) {
        copy.push([])
        for (var j = 0; j < gDifficulty[0]; j++) {
            copy[i].push({ isMine: gBoard[i][j].isMine, revealed: gBoard[i][j].revealed, neighbors: gBoard[i][j].neighbors, marked: gBoard[i][j].marked})
        }
    }
    if (gPrevBoards.length==5) gPrevBoards.splice(0,1)
    gPrevBoards.push(copy)

}

function undo() {
    if(gPrevBoards.length!=0){
    console.log(gPrevBoards)
    gBoard = gPrevBoards.pop()
    console.log(gBoard)
}
    renderBoard()
    
}


function switchDarkMode() {
    var element = document.body
    element.classList.toggle("darkMode")
}
