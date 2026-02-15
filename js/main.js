"use strict"
var gBoard = []
function onInit() {
    buildBoard(4)
    plantMines()
    checkBoard()
    renderBoard()
}

function buildBoard(diff) {
    for (var i = 0; i < diff; i++) {
        gBoard.push([])
        for (var j = 0; j < diff; j++) {
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

function plantMines() {
    var x = 0
    var y = 0
    for (var i = 0; i < 2; i++) {
        x = Math.floor(Math.random() * 4)
        y = Math.floor(Math.random() * 4)
        if (!(gBoard[y][x].isMine))
            gBoard[y][x].isMine = true
        else i--
    }

}

function revealCell(elCell, y,x) {
gBoard[y][x].revealed=true
renderBoard()
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
            else tableCode += "<td><button class=\"cell hiddenCell\" onclick= \"revealCell(this, " + i +", " + j +")\"></button></td>"
        }
        tableCode += "</tr>"

    }
    gameTable.innerHTML = tableCode
}
