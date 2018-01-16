var color = 'black';
var stone = [];
var stoneFlag = [];
var stoneHasAir = [];
var eatI = 0,
    eatJ = 0;
var Black = 2,
    White = 1,
    Empty = 0;
var eatCount = 0;
//$(document).ready(function () {
//  
//});
//禁止右键菜单：
$(".chessboard").contextmenu(function () {
    return false;
});
//画棋盘：
function createBoard(id,boardSize) {
	$('#'+id).empty();
    for (var i = 0; i < boardSize; i++) { //先循环x
        stone[i] = [];
        for (var j = 0; j < boardSize; j++) { //再循环y
            stone[i][j] = 0;
            var _div = $('<div>');
            _div.addClass('chess');
            _div.attr('id', j + '-' + i + "-" + id);
            $('#'+id).append(_div);
            if (i == 0) _div.addClass('top');
            if (i == boardSize - 1) _div.addClass('bottom');
            if (j == 0) _div.addClass('left');
            if (j == boardSize - 1) _div.addClass('right');
        }
    }
};
//画棋盘2：
function createBoard1(id,boardSize) {
	$('#'+id).empty();
    for (var i = 0; i < boardSize; i++) { //先循环x
        stone[i] = [];
        for (var j = 0; j < boardSize; j++) { //再循环y
            stone[i][j] = 0;
            var _div = $('<div>');
            _div.addClass('chess');
            _div.attr('id', j + '-' + i + "-" + id);
            $('#'+id).append(_div);
            if (i == 0) _div.addClass('top');
            if (i == boardSize - 1) _div.addClass('bottom');
            if (j == 0) _div.addClass('left');
            if (j == boardSize - 1) _div.addClass('right');
        }
    }
};

//画布局
function initLayout(layout,id,boardSize){
	for(var i=0;i<layout.length;i++){
		var sub = layout[i];
		sub.id=sub.id+"-"+id;
		pushStones(sub,null,boardSize)
	}
}

function autoPlay(myAnswer,id,boardSize){
	//[[{"id":"6-5","name":"gf","color":2}]] 
	if(myAnswer.length>0){
		var a = myAnswer[0];
		if(a.length>0){
			for(var i=0;i<a.length;i++){
				var sub = a[i];
				sub.id=sub.id+'-'+id;
				pushStones(sub,(i),boardSize);
			}
		}else{
			return;
		}
	}else{
		return;
	}
	
}
function pushStones(sub,s,boardSize){
	//1白2黑 3+
	var id = sub.id;
	if(sub.color==3){
		var el = $("#"+id);
		var cls = el.attr("class")
		if(cls&&cls.indexOf('active')>0){
			el.addClass(' marks ');
			el.html('<em class="micon marks"></em>');
		}else{
			el.addClass(' mark ');	
		}
		return;
	}
	var color = sub.color==1?'white':'black';
	var className = 'active '+color;
	var el = $("#"+id);
	el.addClass(' active '+color);
	var splits = id.split("-")
	var j = splits[0];
	var i = splits[1];
	if(s||s==0){
		var cls = sub.color==1?'black-word':'white-word';
		el.addClass(cls);
		el.html(s+1)
        if (stone[i][j] == 0) {
			stone[i][j]=sub.color;
            eatenChesscount(i, j, color, boardSize);
        };
	}
	stone[i][j]=sub.color;
}


//答案内容布局
function initAnswerLayout(layout,id,boardSize){
	console.log("layout == "+JSON.stringify(layout))
	console.log("id == "+id)
	console.log("boardSize == "+boardSize)
	for(var i=0;i<layout.length;i++){
		var sub = layout[i];
		sub.id=sub.id+'-'+id;
		pushStones(sub,null,boardSize);
	}
}

function MouseDown(event) {
	if(typeOfQuestion==3){
		return;
	}
    var event = event || window.event,
        target = event.target,
        data = target.id.split('-');//6-5
    var x = data[0],
        y = data[1];
    var i = 1 * y,
        j = 1 * x;
    if (target.className !== 'chessboard') {
        if (target.className.indexOf('active') == -1) {
        	if(typeOfQuestion==1){//标记题
        		if (target.className.indexOf('mark') == -1) {
	        		target.className +=" mark";
        			answerSgf+=";"
        			answerSgf+="M[";
        			answerSgf+=(letters[j]+letters[i]);
					answerSgf+="]"
					isMarkedRight(j+"-"+i);
        		}
        	}else{
	            color = first == 2 ? 'black' : 'white';
	            target.className += ' active ' + color;
				answerSgf+=";"
	            if(first==2){
					answerSgf+="B[";
	            	target.className += (' white-word')
	            }else{
					answerSgf+="W[";
	            	target.className += (' black-word')
	            }
				answerSgf+=(letters[j]+letters[i]);
				answerSgf+="]"
	            target.innerHTML=(step+1)
	            var type = (color == 'black') ? Black : White;
	            if (stone[i][j] == 0) {
	                stone[i][j] = type;
	                eatenChesscount(i, j, type, boardSize);
	            };
	            isAnswerRight(j+"-"+i);
            }
        };
    };
};

//初始化矩阵B都为false   
function initFlagMatrix(boardSize) {
    for (var i = 0; i < boardSize; i++) {
        stoneFlag[i] = [];
        stoneHasAir[i] = [];
        for (var j = 0; j < boardSize; j++) {
            stoneFlag[i][j] = false;
            stoneHasAir[i][j] = false;
        }
    }
}

function hasAir(i, j, type,boardSize) {
    if (stone[i][j] == 0)
        return true;
    if (stone[i][j] != type) {
        stoneHasAir[i][j] = false;
        return false;
    }
    eatCount++;
    stoneFlag[i][j] = true;
    if (i > 0 && !stoneFlag[i - 1][j] && hasAir(i - 1, j, type,boardSize)) {
        stoneHasAir[i][j] = true;
        return true;
    }
    if (i < (boardSize - 1) && !stoneFlag[i + 1][j] && hasAir(i + 1, j, type,boardSize)) {
        stoneHasAir[i][j] = true;
        return true;
    }
    if ((j > 0 && stoneFlag[i][j - 1] && stoneHasAir[i][j - 1]) ||
        (j > 0 && !stoneFlag[i][j - 1] && hasAir(i, j - 1, type,boardSize))) {
        stoneHasAir[i][j] = true;
        return true;
    }
    if ((j < boardSize - 1 && stoneFlag[i][j + 1] && stoneHasAir[i][j + 1]) || (j < boardSize - 1 && !stoneFlag[i][j + 1] && hasAir(i, j + 1, type,boardSize))) {
        stoneHasAir[i][j] = true;
        return true;
    } else {
        stoneHasAir[i][j] = false;
        return false;
    }
}

//将与A[i][j]相连的相同类型的棋子全部吃掉    
function eatChess(i, j, type,boardSize) {
    if (stone[i][j] != type) return;
    stone[i][j] = 0; //吃掉子  
    var id = j + "-" + i;
    var stoneC = type == 1 ? 'white' : 'black';
    $("#" + id).removeClass('active ' + stoneC);
    if (i > 0) eatChess(i - 1, j, type,boardSize);
    if (i < boardSize - 1) eatChess(i + 1, j, type,boardSize);
    if (j > 0) eatChess(i, j - 1, type,boardSize);
    if (j < boardSize - 1) eatChess(i, j + 1, type,boardSize);
}

//查找整个棋盘看棋子是否有气    
function hasAirOfType(type,boardSize) {
    for (var i = 0; i < boardSize; i++) {
        for (var j = 0; j < boardSize; j++) {
            if (stone[i][j] != type || stoneFlag[i][j])
                continue;
            eatCount = 0;
            if (!hasAir(i, j, type,boardSize)) {
                eatI = i, eatJ = j;
                return false;
            }
        }
    }
    return true;
}

//当位置[i,j]放个黑白子的时候吃掉子的个数    
function eatenChesscount(i, j, type, boardSize) {
    initFlagMatrix(boardSize)
    var self_hasAir = hasAir(i, j, type,boardSize);
    eatCount = 0;
    eatI = 0;
    eatJ = 0;
    var other_type = (type == 1 ? 2 : 1);
    initFlagMatrix(boardSize)
    var other_hasAir = hasAirOfType(other_type,boardSize);
    if (!self_hasAir && other_hasAir) {
        eatChess(i, j, type,boardSize);
    }
    if (!other_hasAir) {
        eatChess(eatI, eatJ, other_type,boardSize);
        eatenChesscount(i, j, type, boardSize);
    };
};
function initView(w,itemw){
	$(".chessboard").css("width",w+"px");
	$(".chessboard").css("height",w+"px");
	$(".chessboard1").css("width",w+"px");
	$(".chessboard1").css("height",w+"px");
	$(".chessboard1").css("background","#F9CC9D");
//		
	$(".chess").css("width",itemw+"px");
	$(".chess").css("height",itemw+"px");
	$(".chess").css("line-height",itemw+"px");
	
	$(".active").css("width",itemw+"px");
	$(".active").css("height",itemw+"px");
	$(".active").css("line-height",itemw+"px");
	
	var half = itemw/2
	
	var c1 = '.chess:before {top: '+half+'px;}'
	var c2 = '.chess:after {left: '+half+'px;}'
	var c3 = '.chess.left:before {left: '+half+'px;top: '+half+'px;}'
	var c4 = '.chess.left:after {left: '+half+'px;}'
	var c5 = '.chess.right:before {right: '+half+'px;top: '+half+'px;}'
	var c6 = '.chess.right:after {left: '+half+'px;}'
	var c7 = '.chess.top:before {top: '+half+'px;}'
	var c8 = '.chess.top:after {top: '+half+'px;left:'+half+'px;}'
	var c9 = '.chess.bottom:before {top: '+half+'px;}'
	var c10 = '.chess.bottom:after {left: '+half+'px;bottom: '+half+'px;}'
	var c11 = '.chess.top.left:before {left: '+half+'px;top: '+half+'px;}'
	var c12 = '.chess.top.right:after {left: '+half+'px;top: '+half+'px;}'
	var c13 = '.chess.top.right:before {right: '+half+'px;top: '+half+'px;}'
	var c14 = '.chess.top.left:after {left: '+half+'px;top: '+half+'px;}'
	var c15 = '.chess.bottom.left:before {left: '+half+'px;top: '+half+'px;}'
	var c16 = '.chess.bottom.left:after {left: '+half+'px;bottom: '+half+'px;}'
	var c17 = '.chess.bottom.right:before {right: '+half+'px;top: '+half+'px;}'
	var c18 = '.chess.bottom.right:after {left: '+half+'px;bottom: '+half+'px;}'
	
	
	document.styleSheets[0].insertRule(c1, 0);
	document.styleSheets[0].insertRule(c2, 0);
	document.styleSheets[0].insertRule(c3, 0);
	document.styleSheets[0].insertRule(c4, 0);
	document.styleSheets[0].insertRule(c5, 0);
	document.styleSheets[0].insertRule(c6, 0);
	document.styleSheets[0].insertRule(c7, 0);
	document.styleSheets[0].insertRule(c8, 0);
	document.styleSheets[0].insertRule(c9, 0);
	document.styleSheets[0].insertRule(c10, 0);
	document.styleSheets[0].insertRule(c11, 0);
	document.styleSheets[0].insertRule(c12, 0);
	document.styleSheets[0].insertRule(c13, 0);
	document.styleSheets[0].insertRule(c14, 0);
	document.styleSheets[0].insertRule(c15, 0);
	document.styleSheets[0].insertRule(c16, 0);
	document.styleSheets[0].insertRule(c17, 0);
	document.styleSheets[0].insertRule(c18, 0);
}
function initView1(w,itemw,id){
	$(".chessboard").css("width",w+"px");
	$(".chessboard").css("height",w+"px");
	$(".chessboard1").css("width",w+"px");
	$(".chessboard1").css("height",w+"px");
	$(".chessboard1").css("background","#F9CC9D");
//		
	$("#"+id+" .chess").css("width",itemw+"px");
	$("#"+id+" .chess").css("height",itemw+"px");
	$("#"+id+" .chess").css("line-height",itemw+"px");
	
	$("#"+id+" .active").css("width",itemw+"px");
	$("#"+id+" .active").css("height",itemw+"px");
	$("#"+id+" .active").css("line-height",itemw+"px");
	
	var half = itemw/2
	
	var c1 = '#'+id+' .chess:before {top: '+half+'px;}'
	var c2 = '#'+id+' .chess:after {left: '+half+'px;}'
	var c3 = '#'+id+' .chess.left:before {left: '+half+'px;top: '+half+'px;}'
	var c4 = '#'+id+' .chess.left:after {left: '+half+'px;}'
	var c5 = '#'+id+' .chess.right:before {right: '+half+'px;top: '+half+'px;}'
	var c6 = '#'+id+' .chess.right:after {left: '+half+'px;}'
	var c7 = '#'+id+' .chess.top:before {top: '+half+'px;}'
	var c8 = '#'+id+' .chess.top:after {top: '+half+'px;left:'+half+'px;}'
	var c9 = '#'+id+' .chess.bottom:before {top: '+half+'px;}'
	var c10 = '#'+id+' .chess.bottom:after {left: '+half+'px;bottom: '+half+'px;}'
	var c11 = '#'+id+' .chess.top.left:before {left: '+half+'px;top: '+half+'px;}'
	var c12 = '#'+id+' .chess.top.right:after {left: '+half+'px;top: '+half+'px;}'
	var c13 = '#'+id+' .chess.top.right:before {right: '+half+'px;top: '+half+'px;}'
	var c14 = '#'+id+' .chess.top.left:after {left: '+half+'px;top: '+half+'px;}'
	var c15 = '#'+id+' .chess.bottom.left:before {left: '+half+'px;top: '+half+'px;}'
	var c16 = '#'+id+' .chess.bottom.left:after {left: '+half+'px;bottom: '+half+'px;}'
	var c17 = '#'+id+' .chess.bottom.right:before {right: '+half+'px;top: '+half+'px;}'
	var c18 = '#'+id+' .chess.bottom.right:after {left: '+half+'px;bottom: '+half+'px;}'
	
	
	document.styleSheets[0].insertRule(c1, 0);
	document.styleSheets[0].insertRule(c2, 0);
	document.styleSheets[0].insertRule(c3, 0);
	document.styleSheets[0].insertRule(c4, 0);
	document.styleSheets[0].insertRule(c5, 0);
	document.styleSheets[0].insertRule(c6, 0);
	document.styleSheets[0].insertRule(c7, 0);
	document.styleSheets[0].insertRule(c8, 0);
	document.styleSheets[0].insertRule(c9, 0);
	document.styleSheets[0].insertRule(c10, 0);
	document.styleSheets[0].insertRule(c11, 0);
	document.styleSheets[0].insertRule(c12, 0);
	document.styleSheets[0].insertRule(c13, 0);
	document.styleSheets[0].insertRule(c14, 0);
	document.styleSheets[0].insertRule(c15, 0);
	document.styleSheets[0].insertRule(c16, 0);
	document.styleSheets[0].insertRule(c17, 0);
	document.styleSheets[0].insertRule(c18, 0);
}