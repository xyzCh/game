var Grid = (function () {
    var ORIGIN_X = 0;   //原点坐标(px)
    var ORIGIN_Y = 0;  
    var GRID_ARR;   //Grid数组
    var CELL_SIZE;
    var CELL_NUM = 0;   //随机数
    var SEED_X = 0;     //随机数坐标(单位坐标)
    var SEED_Y = 0;
    var SCORE;      //得分
    var BEST;
    var ISMOVE;
    var ISAPPEN;
    var Colors = { 2: "#9e9e9e", 4: "#607d8b", 8: "#795548", 16: "#4caf50", 32: "#009688", 64: "#2196f3", 128: "#3f51b5", 256: "#673ab7", 512: "#9c27b0", 1024: "#e91e63", 2048: "#e8382b" };

    function $(id) {
        return document.getElementById(id);
    }

    function random_xy() {  //随机位置
        return Math.floor(Math.random() * 4);
    }
    function random_num() {
        var cursor = Math.floor(Math.random() * 100);
        if (cursor < 80)
            return 2;
        return 4;
    }
    function appendCell() {
        var cell = document.createElement("div");
        cell.className = "Cell A_Cell";
        while (true) {
            SEED_X = random_xy();
            SEED_Y = random_xy();
            CELL_NUM = random_num();
            if (GRID_ARR[SEED_Y][SEED_X] == 0) {
                cell.id = "Cell" + SEED_Y+SEED_X;
                GRID_ARR[SEED_Y][SEED_X] = CELL_NUM;
                cell.innerHTML = CELL_NUM;
                cell.style.cssText = "left:" + (ORIGIN_X + SEED_X * CELL_SIZE) + "px;top:" + (ORIGIN_Y + SEED_Y * CELL_SIZE) + "px;background-color:" + Colors[CELL_NUM];
                $("Cells").appendChild(cell);
                break;
            }
        }
        ISAPPEN=true;
        ISMOVE=true;
    }

    function Redraw(){
        ORIGIN_X = $("Origin").offsetLeft;
        ORIGIN_Y = $("Origin").offsetTop;
        CELL_SIZE = $("Origin").offsetWidth + 10;
        var changeCells = $("Cells").childNodes;
        for (var i = 0; i < changeCells.length; i++) {
            var x=changeCells[i].id[4];
            var y=changeCells[i].id[5];
            changeCells[i].style.left = ORIGIN_X + y * CELL_SIZE + "px";
            changeCells[i].style.top = ORIGIN_Y + x * CELL_SIZE + "px";
        }
    }

    //target:目标元素(面板）
    function init() {
        $("Cells").innerHTML="";
        $("score").innerHTML = "0";
        BEST = localStorage.getItem("bestScore2048") || 0;
        $("best").innerHTML = BEST;
        SCORE=0;
        GRID_ARR=[[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
        ORIGIN_X = $("Origin").offsetLeft;
        ORIGIN_Y = $("Origin").offsetTop;
        CELL_SIZE = $("Origin").offsetWidth + 10;
        appendCell();
        appendCell();
    }
    function _init() {
        window.onresize = Redraw;
        document.onkeyup = function (e) {
            active(e.key);
        }
        var start_x, start_y, end_x, end_y;
        document.ontouchstart = function (e) {
            e.preventDefault();
            start_x = e.changedTouches[0].clientX;
            start_y = e.changedTouches[0].clientY;
        }
        document.ontouchend = function (e) {
            e.preventDefault();
            end_x = e.changedTouches[0].clientX;
            end_y = e.changedTouches[0].clientY;
            var offsetx = end_x - start_x;
            var offsety = end_y - start_y;
            var key = "";
            if (Math.abs(offsetx) > Math.abs(offsety)) {
                key = offsetx > 0 ? "d" : "a";
            } else {
                key = offsety > 0 ? "s" : "w";
            }
            active(key);
        }
        if (document.readyState != "complete")
            setTimeout(init, 1);
    }

    function active(key) {
        if (ISMOVE && ISAPPEN) {
            switch (key) {
                case "w": UP(); break;
                case "s": DOWN(); break;
                case "a": LEFT(); break;
                case "d": RIGHT(); break;
            }
            if (ISAPPEN && !ISMOVE) {
                ISAPPEN = false;
                appendCell();
                if (!CHECK()) {
                    ISMOVE = false;
                    Done(0);
                }
            }
        }
    }
    return {
        Restart:init,
        Init: _init,
        getGrid: function () { return GRID_ARR; },
        getScore: function () { return SCORE; },
        Redraw: Redraw
    }

    function UP() {
        for (var i = 0; i < 4; i++) {
            var k = 0;
            for (var j = 1; j < 4; j++) {
                var tmp = GRID_ARR[k][i];
                if(tmp!=0){
                    if (tmp == GRID_ARR[j][i]) {
                        GRID_ARR[k][i] = tmp + GRID_ARR[j][i];
                        GRID_ARR[j][i] = 0;
                        GRID_MOVE(k, i, j, i,GRID_ARR[k][i]);
                        SCORE += tmp * 2;
                    } else if (GRID_ARR[j][i] != 0) {
                        if (k + 1 != j) {
                            GRID_ARR[k + 1][i] = GRID_ARR[j][i];
                            GRID_ARR[j][i] = 0;
                            GRID_MOVE(k + 1, i, j, i,GRID_ARR[k + 1][i]);
                        }
                    } else continue;
                    k++;
                }else if(tmp != GRID_ARR[j][i]) {
                    GRID_ARR[k][i] = GRID_ARR[j][i];
                    GRID_ARR[j][i] = 0;
                    GRID_MOVE(k, i, j, i,GRID_ARR[k][i]);
                }
            }
        }
    }
    function DOWN() {
        for (var i = 0; i < 4; i++) {
            var k = 3;
            for (var j = 2; j > -1; j--) {
                var tmp = GRID_ARR[k][i];
                if (tmp != 0) {
                    if (tmp == GRID_ARR[j][i]) {
                        GRID_ARR[k][i] = tmp + GRID_ARR[j][i];
                        GRID_ARR[j][i] = 0;
                        GRID_MOVE(k, i, j, i,GRID_ARR[k][i]);
                        SCORE += tmp * 2;
                    } else if (GRID_ARR[j][i] != 0) {
                        if (k - 1 != j) {
                            GRID_ARR[k - 1][i] = GRID_ARR[j][i];
                            GRID_ARR[j][i] = 0;
                            GRID_MOVE(k - 1, i, j, i,GRID_ARR[k - 1][i]);
                        }
                    } else continue;
                    k--;
                }else if (tmp != GRID_ARR[j][i]) {
                    GRID_ARR[k][i] = GRID_ARR[j][i];
                    GRID_ARR[j][i] = 0;
                    GRID_MOVE(k, i, j, i,GRID_ARR[k][i]);
                }
            }
        }
    }
    function LEFT() {
        for (var i = 0; i < 4; i++) {
            var k = 0;
            for (var j = 1; j < 4; j++) {
                var tmp = GRID_ARR[i][k];
                if (tmp != 0) {
                    if (tmp == GRID_ARR[i][j]) {
                        GRID_ARR[i][k] = tmp + GRID_ARR[i][j];
                        GRID_ARR[i][j] = 0;
                        GRID_MOVE(i, k, i, j,GRID_ARR[i][k]);
                        SCORE += tmp * 2;
                    } else if (GRID_ARR[i][j] != 0) {
                        if (k + 1 != j) {
                            GRID_ARR[i][k + 1] = GRID_ARR[i][j];
                            GRID_ARR[i][j] = 0;
                            GRID_MOVE(i, k + 1, i, j,GRID_ARR[i][k + 1]);
                        }
                    } else continue;
                    k++;
                } else if (tmp != GRID_ARR[i][j]) {
                    GRID_ARR[i][k] = GRID_ARR[i][j];
                    GRID_ARR[i][j] = 0;
                    GRID_MOVE(i, k, i, j,GRID_ARR[i][k]);
                }
            }
        }
    }

    function RIGHT() {
        for (var i = 0; i < 4; i++) {
            var k = 3;
            for (var j = 2; j >-1; j--) {
                var tmp = GRID_ARR[i][k];
                if (tmp != 0) {
                    if (tmp == GRID_ARR[i][j]) {
                        GRID_ARR[i][k] = tmp + GRID_ARR[i][j];
                        GRID_ARR[i][j] = 0;
                        GRID_MOVE(i, k, i, j,GRID_ARR[i][k]);
                        SCORE += tmp * 2;
                    } else if (GRID_ARR[i][j] != 0) {
                        if (k - 1 != j) {
                            GRID_ARR[i][k - 1] = GRID_ARR[i][j];
                            GRID_ARR[i][j] = 0;
                            GRID_MOVE(i, k - 1, i, j,GRID_ARR[i][k - 1]);
                        }
                    } else continue;
                    k--;
                } else if (tmp != GRID_ARR[i][j]) {
                    GRID_ARR[i][k] = GRID_ARR[i][j];
                    GRID_ARR[i][j] = 0;
                    GRID_MOVE(i, k, i, j,GRID_ARR[i][k]);
                }
            }
        }
    }
    function GRID_MOVE(old_x,old_y,x,y,num) {
        $("Cell" + x + y).style.cssText = "left:" + (ORIGIN_X + old_y * CELL_SIZE) + "px;top:" + (ORIGIN_Y + old_x * CELL_SIZE) + "px;background-color:" + Colors[GRID_ARR[old_x][old_y]] + ";";
        var old_cell = $("Cell" + old_x + old_y);
        var new_cell = $("Cell" + x + y);
        new_cell.className = "Cell";
        new_cell.id = "Cell" + old_x + old_y;
        if (old_cell != null) {
            document.getElementById('Cells').removeChild(old_cell);
            setTimeout(function () {
                new_cell.className += " M_Cell";
                new_cell.innerHTML = num;
                $("score").innerHTML = SCORE;
            }, 100);
        }
        ISMOVE = false;
        if (num == 2048) {
            ISAPPEN = false;
            Done(1);
        }
    }

    function CHECK(){
        for(var i=0;i<4;i++){
            for(var j=0;j<4;j++){
                if(GRID_ARR[i][j]==0)
                    return true;
                else if(j==3&&i<3){
                    if(GRID_ARR[i][j]==GRID_ARR[i+1][j])
                        return true;
                }else if(j<3&&i==3){
                    if(GRID_ARR[i][j]==GRID_ARR[i][j+1])
                        return true;
                }else if(i<3&&j<3)
                    if(GRID_ARR[i][j]==GRID_ARR[i][j+1]||GRID_ARR[i][j]==GRID_ARR[i+1][j])
                        return true;
            }
        }
        return false;
    }

    function Done(status) {
        var msg = status == 1 ? "You Win! score：" : "Game Over! score:";
        if (SCORE > BEST)
            localStorage.setItem("bestScore2048", SCORE);
        setTimeout(function () {
            alert(msg + SCORE);
            init();
        }, 300);
    }
})();
