(function () {
    var app = angular.module('ctdApp', []);

    app.controller('MainController', function () {
        this.objs = objs;
        this.txt = textos;
        this.scorestyle = { 'width': (NC * 12 + 2) + "vmin" };

        this.boardstyle = {
            'width': (NC * 12 + 2) + "vmin",
            'height': (NC * 12 + 2) + "vmin"
        };
    });


    var pcolor = [{ 'background-color': 'aliceblue' }, { 'background-color': 'blue' }, { 'background-color': 'red'}];
    var shade = { 'background-color': 'lightgrey' };
    var negro = { 'background-color': 'black' };

    var UP = 2;
    var RIGHT = 4;
    var DOWN = 8;
    var LEFT = 16;
    var JUGADOR = [0, 32, 64];

    var NC = 5;
    var NO = NC * 2 + 1;

    var textos = {
        titulo: "Conecta los Puntos",
        j1: 0,
        j2: 0
    };

    var lastplay = {
        x: 0,
        y: 0,
        lado: 0
    };

    var virtplay = {
        x: 0,
        y: 0,
        lado: 0
    };

    var jump = 0;

    var grid = [];
    var viewgrid = [];
    var tempgrid = [];

    for (var y = 0; y < NC; y++)
        for (var x = 0; x < NC; x++) {
            viewgrid.push({
                U: (y * NO * 2) + (x * 2) + 1,
                R: NO + (y * NO * 2) + (x * 2) + 2,
                D: (NO * 2) + (y * NO * 2) + (x * 2) + 1,
                L: NO + (y * NO * 2) + (x * 2),
                C: NO + (y * NO * 2) + (x * 2) + 1
            });
            grid.push(0);
            tempgrid.push(0);
        }

    var objs = [];
    for (var y = 0; y < NO; ++y) {
        for (var x = 0; x < NO; ++x)
            if (y % 2) {
                if (x % 2) {
                    objs.push({
                        clase: "empty",
                        owner: 0,
                        color: pcolor[0]
                    });
                }
                else {
                    objs.push({
                        clase: "vline",
                        active: 0,
                        color: pcolor[0],
                        click: function () {
                            if (!this.active) {
                                this.active = 1;
                                this.color = negro;
                                updateGame();
                            }
                        },
                        hoveron: function () {
                            if (!this.active) this.color = shade;
                        },
                        hoveroff: function () {
                            if (!this.active) this.color = pcolor[0];
                        }
                    });
                }
            }
            else {
                if (x % 2) {
                    objs.push({
                        clase: "hline",
                        active: 0,
                        color: pcolor[0],
                        click: function () {
                            if (!this.active) {
                                this.active = 1;
                                this.color = negro;
                                updateGame();
                            }
                        },
                        hoveron: function () {
                            if (!this.active) this.color = shade;
                        },
                        hoveroff: function () {
                            if (!this.active) this.color = pcolor[0];
                        }
                    });
                }
                else objs.push({
                    clase: "dot"
                });
            }
    }


    viewToGrid = function () {
        var block = 0;
        for (var i = 0; i < NC * NC; ++i) {
            block = 0;
            if (objs[viewgrid[i].U].active) block += UP;
            if (objs[viewgrid[i].R].active) block += RIGHT;
            if (objs[viewgrid[i].D].active) block += DOWN;
            if (objs[viewgrid[i].L].active) block += LEFT;
            block += objs[viewgrid[i].C].owner;

            if (block > grid[i]) {
                lastplay.x = i % NC;
                lastplay.y = Math.floor(i / NC);
                lastplay.lado = block - grid[i];
            }
            grid[i] = block;
        }
    };

    gridToView = function () {
        var j1 = 0;
        var j2 = 0;
        for (var i = 0; i < NC * NC; ++i) {
            if (grid[i] & UP) { objs[viewgrid[i].U].active = 1; objs[viewgrid[i].U].color = negro; }
            if (grid[i] & RIGHT) { objs[viewgrid[i].R].active = 1; objs[viewgrid[i].R].color = negro; }
            if (grid[i] & DOWN) { objs[viewgrid[i].D].active = 1; objs[viewgrid[i].D].color = negro; }
            if (grid[i] & LEFT) { objs[viewgrid[i].L].active = 1; objs[viewgrid[i].L].color = negro; }
            if (grid[i] & JUGADOR[1]) { ++j1; objs[viewgrid[i].C].owner = JUGADOR[1]; objs[viewgrid[i].C].color = pcolor[1]; }
            if (grid[i] & JUGADOR[2]) { ++j2; objs[viewgrid[i].C].owner = JUGADOR[2]; objs[viewgrid[i].C].color = pcolor[2]; }
        }

        if ((j1 + j2) === (NC * NC)) {
            if (j1 > j2) textos.titulo = "Ganas Tú!";
            else if (j2 > j1) textos.titulo = "Gana el Computador";
            else textos.titulo = "Empate";
        }

        textos.j1 = j1;
        textos.j2 = j2;
    };

    freeBlocks = function () {
        var count = 0;

        for (var i = 0; i < NC * NC; ++i)
            if ((grid[i] & JUGADOR[1]) || (grid[i] & JUGADOR[2])) ++count;

        return (NC * NC - count);
    };

    updateGame = function () {
        viewToGrid();
        if (hasScored(grid, 1)) {
            gridToView();
            return 1;
        }

        compuPlay();

        gridToView();
    };

    compuPlay = function () {
        scored = 1;

        while (scored) {
            scored = findToScore(grid);
            if (hasScored(grid, 2)) scored = 1;
            if (scored === -1) return 1;
        }

        if (!findNoHarm(grid)) findLessHarm(grid);
        hasScored(grid, 2);
    };

    hasScored = function (g, player) {
        var ok = 0;
        for (var y = 0; y < NC; ++y)
            for (var x = 0; x < NC; ++x)
                if (!ladosLibres(g, x, y) && !owner(g, x, y)) {
                    chOwner(g, x, y, player);
                    ok = 1;
                }
        return ok;
    };

    findToScore = function (g) {
        var ll = 0;
        var hayLibres = findNoHarm2(g);
        var fb = freeBlocks();
        var vx = 0;
        var vy = 0;
        var vl = 0;
        var proy = 0;

        for (var y = 0; y < NC; ++y)
            for (var x = 0; x < NC; ++x)
                if (cuentaLados(g, x, y) === 3) {
                    ll = ladosLibres(g, x, y);
                    proy = proyectaJugada(x, y, ll);
                    vx = virtplay.x;
                    vy = virtplay.y;
                    vl = virtplay.lado;
                    if (!hayLibres && (proy === 2) && (fb > 3) && jump) {
                        continue;
                    }
                    else if (!hayLibres && (proy === 1) && (fb > 2)) {
                        marca(g, vx, vy, vl);
                        return -1;
                    }
                    else {
                        marca(g, x, y, ll);
                        return 1;
                    }
                }

        return 0;
    };

    findNoHarm2 = function (g) {
        for (var y = 0; y < NC; ++y)
            for (var x = 0; x < NC; ++x)
                if (cuentaLados(g, x, y) < 2) return 1;

        return 0;
    };

    findNoHarm = function (g) {
        var ll = 0;
        var x = lastplay.x;
        var y = lastplay.y;

        var ladosposibles = [];

        if (cuentaLados(g, x, y) < 2) {
            ll = ladosLibres(g, x, y);
            if ((ll & UP) && (cuentaLados(g, x, y - 1) < 2)) ladosposibles.push(UP);
            if ((ll & RIGHT) && (cuentaLados(g, x + 1, y) < 2)) ladosposibles.push(RIGHT);
            if ((ll & DOWN) && (cuentaLados(g, x, y + 1) < 2)) ladosposibles.push(DOWN);
            if ((ll & LEFT) && (cuentaLados(g, x - 1, y) < 2)) ladosposibles.push(LEFT);

            if (ladosposibles.length > 0) {
                marca(g, x, y, ladosposibles[Math.floor(Math.random() * ladosposibles.length)]);
                return 1;
            }
        }

        ladosposibles.length = 0;
        for (y = 0; y < NC; ++y)
            for (x = 0; x < NC; ++x)
                if (cuentaLados(g, x, y) < 2) {
                    ladosposibles.length = 0;
                    ll = ladosLibres(g, x, y);
                    if ((ll & UP) && (cuentaLados(g, x, y - 1) < 2)) ladosposibles.push(UP);
                    if ((ll & RIGHT) && (cuentaLados(g, x + 1, y) < 2)) ladosposibles.push(RIGHT);
                    if ((ll & DOWN) && (cuentaLados(g, x, y + 1) < 2)) ladosposibles.push(DOWN);
                    if ((ll & LEFT) && (cuentaLados(g, x - 1, y) < 2)) ladosposibles.push(LEFT);

                    if (ladosposibles.length > 0) {
                        marca(g, x, y, ladosposibles[Math.floor(Math.random() * ladosposibles.length)]);
                        return 1;
                    }
                }
        return 0;
    };

    findLessHarm = function (g) {
        var ll = 0;
        var posibilidad = [];
        var mejor = 0;

        for (var y = 0; y < NC; ++y)
            for (var x = 0; x < NC; ++x)
                if (cuentaLados(g, x, y) === 2) {
                    ll = ladosLibres(g, x, y);
                    if (ll & UP) posibilidad.push({ x: x, y: y, lado: UP, harm: proyectaJugada(x, y, UP) });
                    if (ll & RIGHT) posibilidad.push({ x: x, y: y, lado: RIGHT, harm: proyectaJugada(x, y, RIGHT) });
                    if (ll & DOWN) posibilidad.push({ x: x, y: y, lado: DOWN, harm: proyectaJugada(x, y, DOWN) });
                    if (ll & LEFT) posibilidad.push({ x: x, y: y, lado: LEFT, harm: proyectaJugada(x, y, LEFT) });
                }

        if (!posibilidad.length) return 0;
        for (var n in posibilidad)
            if (posibilidad[n].harm < posibilidad[mejor].harm) mejor = n;

        marca(g, posibilidad[mejor].x, posibilidad[mejor].y, posibilidad[mejor].lado);
    };

    proyectaJugada = function (x, y, lado) {
        var n = 0;

        gridToTemp();
        marca(tempgrid, x, y, lado);

        jump = 0;
        virtplay.x = x;
        virtplay.y = y;
        while (findToScore2(tempgrid)) ++n;
        return n;
    };

    findToScore2 = function (g) {
        var ll = 0;
        for (var y = 0; y < NC; ++y)
            for (var x = 0; x < NC; ++x)
                if (cuentaLados(g, x, y) === 3) {
                    ll = ladosLibres(g, x, y);
                    marca(g, x, y, ll);
                    if ((Math.abs(x - virtplay.x) > 1) || (Math.abs(y - virtplay.y) > 1)) jump = 1;
                    virtplay.x = x;
                    virtplay.y = y;
                    virtplay.lado = ll;
                    return 1;
                }

        return 0;
    };


    marca = function (g, x, y, lado) {
        if ((x < 0) || (x >= NC) || (y < 0) || (y >= NC)) return 0;

        var i = y * NC + x;
        g[i] += lado;

        if (lado === UP) marca2(g, x, y - 1, DOWN);
        else if (lado === RIGHT) marca2(g, x + 1, y, LEFT);
        else if (lado === DOWN) marca2(g, x, y + 1, UP);
        else if (lado === LEFT) marca2(g, x - 1, y, RIGHT);
    };

    marca2 = function (g, x, y, lado) {
        if ((x < 0) || (x >= NC) || (y < 0) || (y >= NC)) return 0;

        var i = y * NC + x;
        g[i] += lado;
    };

    owner = function (g, x, y) {
        if ((x < 0) || (x >= NC) || (y < 0) || (y >= NC)) return 0;

        var i = y * NC + x;

        if (g[i] & JUGADOR[1]) return JUGADOR[1];
        else if (g[i] & JUGADOR[2]) return JUGADOR[2];

        return 0;
    };

    chOwner = function (g, x, y, owner) {
        if ((x < 0) || (x >= NC) || (y < 0) || (y >= NC)) return 0;

        var i = y * NC + x;

        if (g[i] & JUGADOR[1]) g[i] -= JUGADOR[1];
        else if (g[i] & JUGADOR[2]) g[i] -= JUGADOR[2];

        g[i] += JUGADOR[owner];
    };

    ladosLibres = function (g, x, y) {
        if ((x < 0) || (x >= NC) || (y < 0) || (y >= NC)) return 0;

        var count = 30;
        var i = y * NC + x;

        if (g[i] & UP) count -= UP;
        if (g[i] & RIGHT) count -= RIGHT;
        if (g[i] & DOWN) count -= DOWN;
        if (g[i] & LEFT) count -= LEFT;

        return count;
    };

    cuentaLados = function (g, x, y) {
        if ((x < 0) || (x >= NC) || (y < 0) || (y >= NC)) return 0;

        var count = 0;
        var i = y * NC + x;

        if (g[i] & UP) ++count;
        if (g[i] & RIGHT) ++count;
        if (g[i] & DOWN) ++count;
        if (g[i] & LEFT) ++count;

        return count;
    };

    gridToTemp = function () {
        for (var i = 0; i < NC * NC; ++i)
            tempgrid[i] = grid[i];
    };

})();
