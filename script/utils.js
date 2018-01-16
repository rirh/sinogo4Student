function get_pos_by_dot(dot){
	var x=-1;
	var y=-1;
	for(var i=0;i<letters.length;i++){
		var letter = letters[i]
		if(letter==dot[0]){
			x=i
		}
		if(letter==dot[1]){
			y=i
		}
	}
	if(x<0||y<0){
		return null;
	}
	var d = new Position(x,y)
	d.name=dot
	
	return d ;	
}
function get_pos_by_position(x,y){
	//如果是不完整的棋盘,还要进行其他判断
  	var posx = board_edge + x * board_square;
    var posy = board_edge + y * board_square;
    return [posx, posy];	
}

function getPosition(e,canvas){
	var x = e.pageX;
	var y = e.pageY;
//	var offset =$api.offset(canvas);
	var offset = canvas.offset();
	x -= offset.left;
	y -= offset.top;
	
	x=x-board_edge;
	y=y-board_edge;
	
    var posx = Math.round(x/board_square)//通过四舍五入确定点
    var posy = Math.round(y/board_square)
    
	if (posx < 0 || posx >= board_size || posy < 0 || posy >= board_size) {
        return;
    }
   	var d = new Position(posx, posy);
    d.ptname = letters_up[posx] + (board_size - posy);
    d.ptname2 = letters_up[posx] + (posy + 1);
    return d
}
function getPosition1(e,canvas){
	var x = e.pageX;
	var y = e.pageY;
	var offset =$api.offset(canvas);
//	var offset = canvas.offset();
	x -= offset.l;
	y -= offset.t;
	
	x=x-board_edge;
	y=y-board_edge;
	
    var posx = Math.round(x/board_square)//通过四舍五入确定点
    var posy = Math.round(y/board_square)
    
	if (posx < 0 || posx >= board_size || posy < 0 || posy >= board_size) {
        return;
    }
   	var d = new Position(posx, posy);
    d.ptname = letters_up[posx] + (board_size - posy);
    d.ptname2 = letters_up[posx] + (posy + 1);
    return d
}

function check_pos(p,color){
	//如果p未定义直接返回
	if(!p)return -1;
	//如果超出棋盘布局,返回-1
	if (p.x< 0 || p.x >= board_size || p.y < 0 || p.y >= board_size) {
        return -1;
    }
    //如果已经有棋子,返回-2
    if(getStone(p)!=EMPTY){
    	return -2;
    }
	if(color==EMPTY) color=getNextColor();
	addStone(p, color);
	//判断这个位置是否有气,没有气的点是不能落子的.
	//如果会,重新设置stone为empty
	var ret = check_kill_block(p,color)
	if(ret!=0){//不为0,表示此点无气,不可放在此处,把stone设置为空点
		color=getNextColor();
		addStone(p, EMPTY);
	}else{
		//steps.push(p)
	}
	return ret;//暂时不做判断.
}

function check_kill_block(p,color){
	//计算该店和其所有连接点的总气,如果总气为0,则返回1,如果有气,返回0
	var block;
	var oppo_color=BLACK;
	if(color==BLACK) oppo_color=WHITE;
	var iskill = false;//四周是否有被删除棋子
	var around = [{
        x: p.x - 1,
        y: p.y
    }, {
        x: p.x,
        y: p.y - 1
    }, {
        x: p.x + 1,
        y: p.y
    }, {
        x: p.x,
        y: p.y + 1
    }];
    //先看四周是否有棋要被吃掉
    for (var i = 0; i < around.length; i++) {
        var res = trykillblock(around[i], oppo_color, p, step);
        if (res == -3) {
            addStone(p, EMPTY);
            return -3;
        }
        if (res == 0) {
            iskill = true;
        }
    }
    //没有,判断此位置自己是否会被吃掉
    if (!iskill) {
        block = findblock({
            x: p.x,
            y: p.y
        }, color);
        if (!isblocklive(block)) {//不是活棋,不让放
            addStone(p, EMPTY);
            return -4;
        }else{//是活棋可以放
        	return 0;
        }
    }
    return 0;
}

function trykillblock(pt, color, from, step) {
   	var block = findblock(pt, color);
    if (!block) {
        return -1;
    }
    if (isblocklive(block)) {
        return -2;
    }
    if (block.length == 1 && steps.length > 0) {
        var lastpt = steps[steps.length - 1];
        if (lastpt != null && block[0].x == lastpt.x && block[0].y == lastpt.y) {
            if (last_kill_pt && last_kill_pt.x == from.x && last_kill_pt.y == from.y) {
                if (step - last_kill_step == 1) {
                    return -3;
                }
            }
        }
    }
    killblock(block);
    if(block.length>0){
    	for(var i=0;i<block.length;i++){
    		killBlock.push(stones[block[i].x*board_size+block[i].y])
    	}
    }
    return 0;
}

function killblock(block) {
    var color = getStone(block[0]);
    if (WHITE == color) {
        capturesW += block.length;
    } else if (BLACK == color) {
        capturesB += block.length;
    } else {
        alert('error');
    }
    for (var i = 0; i < block.length; i++) {
        pt = block[i];
        addStone(pt, EMPTY);
    }
    if (block.length == 1) {
        last_kill_step = step;
        last_kill_pt = block[0];
    }
}

function findblock(pt, color) {
    if (getStone(pt) != color) {
        return null;
    }
    var known_pt = [pt];
    _findblock(pt, color, known_pt);
    return known_pt;
}

function _findblock(pt, color, known_pt) {
    checkpoint({
        x: pt.x - 1,
        y: pt.y
    }, color, known_pt);
    checkpoint({
        x: pt.x,
        y: pt.y - 1
    }, color, known_pt);
    checkpoint({
        x: pt.x + 1,
        y: pt.y
    }, color, known_pt);
    checkpoint({
        x: pt.x,
        y: pt.y + 1
    }, color, known_pt);
}

function checkpoint(pt, color, known_pt) {
    if (getStone(pt) == color) {
        var is_known = false;
        for (var i = 0; i < known_pt.length; i++) {
            if (known_pt[i].x == pt.x && known_pt[i].y == pt.y) {
                is_known = true;
            }
        }
        if (!is_known) {
            known_pt.push(pt);
            _findblock(pt, color, known_pt);
            return;
        }
    }
}
function isblocklive(block) {
    if (!block) {
        return true;
    }
    for (var i = 0; i < block.length; i++) {
        pt = block[i];
        if (EMPTY == getStone({
            x: pt.x - 1,
            y: pt.y
        })) return true;
        if (EMPTY == getStone({
            x: pt.x,
            y: pt.y - 1
        })) return true;
        if (EMPTY == getStone({
            x: pt.x + 1,
            y: pt.y
        })) return true;
        if (EMPTY == getStone({
            x: pt.x,
            y: pt.y + 1
        })) return true;
    }
    return false;
}
function getStone(pt){
	if(!pt){
		return ;
	}
	var stone = stones[pt.x*board_size+pt.y]
	if(stone) return stone.status;
	return EMPTY;
}

function addStone(pt,color){
	var stone = stones[pt.x*board_size+pt.y]
	if(stone){
		stone.status=color;
	}
	return stone;
}

function getNextColor(){
	color=currentColor;
	var temp = currentColor;
	currentColor=nextColor
	nextColor=temp;
	return color;
}

function getCursorPosition(e, canvasobj) {
    var x = e.pageX;
    var y = e.pageY;
    var offset = canvasobj.offset();
    x -= offset.left;
    y -= offset.top;
    var d = get_postion_by_xypos(x, y);
    return d;
}

function toastAtMiddle(str){
	api.toast({
	    msg:str,
	    location:'middle'
    });
}

function get_postion_by_xypos(xoff, yoff) {
    var x = xoff - board_edge - 0.5;
    var y = yoff - board_edge - 0.5;
    var posx = parseInt(xoff / board_square);
    var posy = parseInt(yoff / board_square);
//  var xys = return_pos_by_arrow(posx, posy);
	var xys = [posx,posy]
    posx = xys[0];
    posy = xys[1];
    var xys = get_near_pos(posx, posy, xoff, yoff);
    posx = xys[0];
    posy = xys[1];
    if (posx < 0 || posx >= board_size || posy < 0 || posy >= board_size) {
        return;
    }
    var px = letters[posx];
    var py = letters[posy];
    var dot = "";
    dot += px;
    dot += py;
    var d = new Position(posx, posy);
    d.name = dot;
    d.ptname = letters_up[posx] + (board_size - posy);
    d.ptname2 = letters_up[posx] + (posy + 1);
    d.qname = dot;
    return d;
}

function return_pos_by_arrow(xpos, ypos) {
    var x = xpos;
    var y = ypos;
    if (board_arrow == 2) {
        xpos += (board_size - board_size_y);
        ypos += (board_size - board_size_x);
        y = board_size - xpos - 1;
        x = ypos;
    } else if (board_arrow == 3) {
        ypos += (board_size - board_size_y) - 1;
        x = board_size - xpos - 1;
        y = board_size - ypos - 1;
    } else if (board_arrow == 4) {
        x = board_size - ypos - 1;
        y = xpos;
    } else {
        x += (board_size - board_size_x);
    }
    return [x, y];
}

function get_near_pos(x, y, xoff, yoff) {
    var datas = [];
    var poses = [
        [x - 1, y],
        [x + 1, y],
        [x, y + 1],
        [x, y - 1],
        [x - 1, y - 1],
        [x - 1, y + 1],
        [x + 1, y - 1],
        [x + 1, y + 1],
        [x, y]
    ];
    for (var i = 0; i < poses.length; i += 1) {
        var p = poses[i];
        var px = p[0];
        var py = p[1];
        if (px < 0 || px >= board_size || py < 0 || py >= board_size) {
            continue;
        }
        var d = stones[px * board_size + py];
        if (d == undefined) {
            continue;
        }
        var sx = Math.abs(xoff - d.posx);
        var sy = Math.abs(yoff - d.posy);
        var dist = Math.sqrt(sx * sx + sy * sy);
        datas.push([px, py, dist]);
    }
    if (datas.length == 0) {
        return [-1, -1];
    }
    datas.sort(sortdist);
    var first = datas[0];
    return [first[0], first[1]];
}

function sortdist(a, b) {
    return a[2] - b[2];
}

function autoPlayNext(){
	if(step>(answer.length-1))return alert("超限");
	var a = answer[step]
	//白棋需要下的位置
	var dot = dots_dict[a]
	if(!dot){
		return alert("没有这个点");
	}
	if(dot.status!=EMPTY){
		return alert("油籽")
	}
	dot.status=WHITE;
	step++;
	var position = new Position(dot.x,dot.y);
    position.ptname = letters_up[dot.x] + (board_size - dot.y);
    position.ptname2 = letters_up[dot.x] + (dot.y + 1);
	steps.push(position)
	dot.index=step;
	getNextColor();
}

function init_dots(){
	var length = stones.length;//19*19 13*13 	=[]
    if (length > 0) {
        for (var i = 0; i < length; i += 1) {
            var d = stones[i];
            d.status = EMPTY;
            d.index = 0;
            d.sign = 0;
        }
        return;
    }
    for (var i = 0; i < board_size; i += 1) {
        for (var j = 0; j < board_size; j += 1) {
            var d = new Dot(i, j);
            dots_dict[d.name] = d;
            stones.push(d);
        }
    }
}
function init_dots_2(){
	var length = stones.length;
    if (length > 0) {
        for (var i = 0; i < length; i += 1) {
            var d = stones[i];
            d.status = EMPTY;
            d.index = 0;
            d.sign = 0;
        }
        return;
    }
    for (var i = 0; i < board_size; i += 1) {
        for (var j = 0; j < board_size; j += 1) {
            var d = new Dot(j,i);
            dots_dict[d.name] = d;
            stones.push(d);
        }
    }
}

function clear_board(){
	for(var i=0;i<stones.length;i++){
		var stone = stones[i]
		stone.index=0;
		stone.status=0;
	}
	step=0;
	steps=[];
	stepInfos=[];
	var ctx = canvas.getContext("2d")
	draw_board(ctx)
	
}

function draw_white(ctx,x,y,index){
	draw_h_image(ctx, white_img, x - stone_radius, y - stone_radius, stone_radius * 2, stone_radius * 2);
	if(index>0){
	    ctx.font="15px 微软雅黑,sans-serif";
		ctx.textAlign="center"
		ctx.fillStyle="#000"
		ctx.fillText(index,x, y + stone_radius / 3)
	}
}

function draw_black(ctx,x,y,index){
	draw_h_image(ctx, black_img, x - stone_radius, y - stone_radius, stone_radius * 2, stone_radius * 2);
	if(index>0){
	    ctx.font="15px 微软雅黑,sans-serif";
		ctx.textAlign="center"
		ctx.fillStyle="#FFF"
		ctx.fillText(index,x, y + stone_radius / 3)
	}
}

function draw_h_image(context, img, startx, starty, w, h) {
    context.drawImage(img, startx , starty , w, h);
}

function init_src_dots(h){
	var dd ;
	for(var i=0;i<h.question_layout.length;i++){
		var t = h.question_layout[i]
		dd=dots_dict[t.name]
		if(dd) dd.status=t.color;
	}
}


function draw_background(ctx) {
    var maxx = $api.attr(canvas,"width");
    var maxy =  $api.attr(canvas,"width");
    draw_h_image(ctx, board_img, 0, 0, maxx, maxy);
}


Date.prototype.Format = function(fmt) {//author: meizz
	var o = {
		"M+" : this.getMonth() + 1, //月份
		"d+" : this.getDate(), //日
		"h+" : this.getHours(), //小时
		"m+" : this.getMinutes(), //分
		"s+" : this.getSeconds(), //秒
		"q+" : Math.floor((this.getMonth() + 3) / 3), //季度
		"S" : this.getMilliseconds() //毫秒
	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
	if (new RegExp("(" + k + ")").test(fmt))
		fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}
