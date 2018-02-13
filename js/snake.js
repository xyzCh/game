var grid = (function () {
            var Score=0;
            var Grid;
            var Snake;
            var Food;
            var snakePath = [];
            var snake_dels = [];
            var food_del = {};
            var Direction = "w";
            var timer;
            var LostLinstener;

            var $ = function (id) {
                return document.getElementById(id);
            }
            var createEle = function (name) {
                return document.createElement(name);
            }

            var touchEvent = function () {
                var start_x, start_y, end_x, end_y;
                $("panel").ontouchstart = function (e) {
                    e.preventDefault();
                    start_x = e.changedTouches[0].clientX;
                    start_y = e.changedTouches[0].clientY;
                }
                $("panel").ontouchend = function (e) {
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
                    Direction = key;
                }
            }

            function _init(fun) {
                Grid = $("Grid");
                Snake = $("Snake");
                Food = $("Food");
                LostLinstener = typeof (fun) === "function" ? fun : function () { alert("You Lost! Score:" + Score); start();};
                for (var i = 0; i < 36; i++) {
                    var line_div = createEle("div");
                    for (var j = 0; j < 24; j++) {
                        var bg_del = createEle("span");
                        bg_del.className = "bg_del";
                        line_div.appendChild(bg_del);
                    }
                    Grid.appendChild(line_div);
                }
                start();
            }

            
            function start() {
                Score = 0;
                snakePath = [];
                snake_dels = [];
                food_del = {};
                Direction = "w";
                Snake.innerHTML = "";
                Food.innerHTML = "";
                snakePath = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
                for (var i = 0; i < snakePath.length; i++) {
                    var snake_del = createEle("span");
                    snake_del.className = "snake_del";
                    snake_del.style.cssText = "left:" + (snakePath[i].x * 10) + "px;top:" + (snakePath[i].y * 10) + ";";
                    Snake.appendChild(snake_del);
                    snake_dels.push(snake_del);
                }
                randomFood();
                document.onkeydown = function (e) {
                    Direction = e.key;
                }
                touchEvent();
                timer=setInterval(move, 200);
            }

            /*移动*/
            function move() {
                if (snakePath[0].x == food_del.x && snakePath[0].y == food_del.y) {
                    eatFood();
                } else {
                    for (var i = snakePath.length - 1; i > 0; i--) {
                        snakePath[i].x = snakePath[i - 1].x;
                        snakePath[i].y = snakePath[i - 1].y;
                    }
                }
                switch (Direction) {
                    case "w": snakePath[0].y--; break;
                    case "a": snakePath[0].x--; break;
                    case "d": snakePath[0].x++; break;
                    case "s": snakePath[0].y++; break;
                }
                if(check())
                    for (var i = 0; i < snakePath.length; i++) {
                        snake_dels[i].style.cssText = "left:" + (snakePath[i].x * 10) + "px;top:" + (snakePath[i].y * 10) + ";";
                    }
            }

            function eatFood() {
                snakePath = [{ x: food_del.x, y: food_del.y }].concat(snakePath);
                Snake.insertBefore(food_del.food, snake_dels[0]);
                snake_dels = [food_del.food].concat(snake_dels);
                randomFood();
                Score++;
            }

            function check() {
                if (snakePath[0].x < 0 || snakePath[0].x > 23 || snakePath[0].y < 0 || snakePath[0].y > 36) {
                    clearInterval(timer);
                    LostLinstener({score:Score});
                    return false;
                }
                return true;
            }

            /*随机食物*/
            function randomFood() {
                food_del.x = Math.floor(Math.random() * 24);
                food_del.y = Math.floor(Math.random() * 36);
                var food = createEle("span");
                food.className = "snake_del";
                food.style.cssText = "left:" + (food_del.x * 10) + ";top:" + (food_del.y * 10) + "px;";
                Food.appendChild(food);
                food_del.food = food;
            }

            return {
                init: function () {
                    if (document.readyState != "complete")
                    {
                        setTimeout(_init, 1);
                    }
                },
                score:Score,
                restart:start
            }
        })();