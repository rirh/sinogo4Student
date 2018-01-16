/**
 *解析SGF,例如:
 */
function parseSGF(str){
//	var str = "(;CA[UTF-8]DI[5k]DP[32]SO[adum]CO[7]GM[1]FF[3]RU[Japanese]SZ[19]HA[0]KM[5.5]PW[White]PB[Black]GN[White(W)vs.Black(B)]DT[1999-07-27]SY[Cgoban 1.9.2]TM[30:00(5x1:00)];AW[pe][pf][qg][qh][oi][ri][oj][pj][rj][sk][rl][sl][rm]AB[pg][ph][rh][pi][qi][qj][pk][qk][rk][pl]C[black to do something effective on the side](;B[sh](;W[sj](;B[qf];W[rg];B[rf]C[RIGHT])(;B[rg];W[qf]))(;W[rg];B[sj];W[si];B[sj]C[RIGHT snapback]))(;B[sj];W[si](;B[sh];W[sj](;B[qf];W[rg])(;B[rg];W[qf]))(;B[qf];W[rg])(;B[rg];W[qf]))(;B[rg];W[qf]C[black has nothing now])(;B[qf];W[rg](;B[sh];W[sg])(;B[rf];W[sh]))(;B[sj];W[si](;B[sh];W[sj](;B[qf];W[rg])(;B[rg];W[qf]))(;B[rg];W[qf])(;B[qf];W[rg]))(;B[qn];W[rg])(;B[qm];W[rg])(;B[rn];W[rg])(;B[rf];W[rg])(;B[sg];W[rg]))";
	var splits = str.split(";")
//	for(var i=0;i<splits.length;i++){
//		console.log(splits[i])
//	}
	var subject=''
	var sIndex = 1;
	//(;CA[UTF-8]FF[4]SZ[13]AP[北京中棋]AB[al]AB[bl]AB[bm](;M[am];M[ak];M[bk];M[cl];M[cm]C[RIGHT]))
	if(splits[1].indexOf("AW")>=0||splits[1].indexOf("AB")>=0){//题目在第一节
		subject = splits[1]
		sIndex = 1;
	}else if(splits[2].indexOf("AW")>=0||splits[2].indexOf("AB")>=0){//题目在第二节
		subject = splits[2]
		sIndex = 2;
	}else{//其他不考虑
		return alert("题目格式有误");
	}
	var goInfo = getGOInfo(splits[1]+splits[2])
	//subject="GE[life and death]DI[2d]DP[12]SO[kaf]CO[9]AB[cq]AB[dq]AB[eq]AB[br]AB[ar]AB[fq]AB[ds]AW[aq]AW[bq]AW[bo]AW[cp]AW[dp]AW[ep]AW[fp]AW[gq]AW[hq]AW[jr]AW[fr]AW[cs]C[black to live]AW[jp]AW[jq]AP[goproblems]"
	var addStone = getSubject(subject)	
	console.log(JSON.stringify(addStone))
	var index = splits[0].length+splits[1].length+(sIndex==1?2:(splits[2].length+3));
	
	str = str.substring(index-2,str.length-1);//答案走子字符串
	console.log(str)
	//(;B[sh](;W[sj](;B[qf];W[rg];B[rf]C[RIGHT])(;B[rg];W[qf]))(;W[rg];B[sj];W[si];B[sj]C[RIGHT snapback]))(;B[sj];W[si](;B[sh];W[sj](;B[qf];W[rg])(;B[rg];W[qf]))(;B[qf];W[rg])(;B[rg];W[qf]))(;B[rg];W[qf]C[black has nothing now])(;B[qf];W[rg](;B[sh];W[sg])(;B[rf];W[sh]))(;B[sj];W[si](;B[sh];W[sj](;B[qf];W[rg])(;B[rg];W[qf]))(;B[rg];W[qf])(;B[qf];W[rg]))(;B[qn];W[rg])(;B[qm];W[rg])(;B[rn];W[rg])(;B[rf];W[rg])(;B[sg];W[rg])
	var answers = getAnswers(str);
	var question = {
		board_size:parseInt(goInfo.boardsize),//棋盘大小(可能存在半棋盘,后续实现)
		question_layout:addStone,//问题布局,使用"cc"形式
		answer:answers,//答案,双重,黑白按步骤
		first:2//先手,1白2黑
	}
	return question;
}

function getAnswers(str){
	var answers = [];
	var tempa = {} ;
	var index = 0;
	var level = 0;
	var l = 0;
	answers.push([])
	while(index<=str.length){
		var c = str.charAt(index);
		if(c=="B"){//黑子
			var bs = str.substring(index,index+5);
			var p = parseProperty(bs);
			var v = p.propertyValues[0];
			var splits=v.split("");
			var id = letters.indexOf(splits[0])+"-"+letters.indexOf(splits[1]);	
			var bj = {
				id:id,
				name:p.propertyValues[0],
				color:2,
			}
			answers[level].push(bj)
			index = index+5;
		}else if(c=="W"){
			var ws = str.substring(index,index+5);
			var p = parseProperty(ws);
			var splits=p.propertyValues[0].split("")
			var id = letters.indexOf(splits[0])+"-"+letters.indexOf(splits[1]);	
			var wj = {
				id:id,
				name:p.propertyValues[0],
				color:1,
			}
			answers[level].push(wj)
			index = index+5;
		}else if(c=="M"){//新增mark
			var ws = str.substring(index,index+5);
			var p = parseProperty(ws);
			var splits=p.propertyValues[0].split("")
			var id = letters.indexOf(splits[0])+"-"+letters.indexOf(splits[1]);	
			var wj = {
				id:id,
				name:p.propertyValues[0],
				color:3,//颜色3为标记
			}
			answers[level].push(wj)
			index = index+5;
		}else if(c==")"){
			var cp = str.charAt(index-1);
			if(cp=="]"){//新answer
				level++;
				answers.push(tempa["temp"+l])
				l--;
			}else{
				if(answers[level]){//存在
					answers[level]=tempa["temp"+l]
					l--;
				}
			}
			
			index++;
		}else if(c=="("){
			l++;
			tempa["temp"+l]=[]
			for(var j = 0;j<answers[level].length;j++){
				tempa["temp"+l].push(answers[level][j])
			}
			index++;
		}else if(c==")"){
			tempa["temp"+l]=[]
			l--;
			index++;
		}else if(c=="C"){
			var comIndex = str.indexOf("]",index);
			var pro = parseProperty(str.substring(index,comIndex+1))
			var nowAnswer = answers[level];
			nowAnswer[nowAnswer.length-1].comment=pro.propertyValues[0];
			index=comIndex+1;
		}else{
			index++;
		}
	}
	answers.pop();
	return answers;
}


function getAnswers222(str){
	var answers = [];
	var index = 0;//当前字符串角标
	var level = 0;//当前答案角标
	answers.push([])//初始化第一个答案
	
	while(index<=str.length){
		var c = str.charAt(index);
		//	index++;//自动换到下一个字符
		if(c=="B"){//黑子
			
		}else if(c=="W"){//白子
			var b = {
				name:str.substring(index+1,index+3),
				color:1,
				comment:''
			}
			answers[0].push(b);
		}else{
			//
		}
	}
	console.log(JSON.stringify(answers))
	
}

function getAnswers111(str){
	var answers = [];
	var leftArr=[];
	var level = 0;
	
	var index = 0;
	while(index<=str.length){
		var c = str.charAt(index);
	}
	
	
	for(var i=0;i<str.length;i++){
		var c = str.charAt(i);
		if(c=='('){
			leftArr.push(i);
			continue;
		}
	}
}

function getSubject(str){
	var addStone = [];
	var index = str.indexOf("(");
	if(index>0){
		str = str.substring(0,index);
	}
	var nodes = parseNode(str);
	for(var i=0;i<nodes.length;i++){
		var node = nodes[i];
		if(node.propertyName=="AW"){
			for(var j=0;j<node.propertyValues.length;j++){
				var v = node.propertyValues[j];
				var splits=v.split("")
				var id = letters.indexOf(splits[0])+"-"+letters.indexOf(splits[1]);
				var st = {};
				st.name = v;
				st.color = 1;
				st.id = id;
				addStone.push(st);
			}
		} else if(node.propertyName=="AB"){
			for(var j=0;j<node.propertyValues.length;j++){
				var v = node.propertyValues[j];
				var splits=v.split("")
				var id = letters.indexOf(splits[0])+"-"+letters.indexOf(splits[1]);
				var st = {};
				st.name = v;
				st.color = 2;
				st.id = id;
				addStone.push(st);
			}
		}  else if(node.propertyName=="AM"){
			for(var j=0;j<node.propertyValues.length;j++){
				var v = node.propertyValues[j];
				var splits=v.split("")
				var id = letters.indexOf(splits[0])+"-"+letters.indexOf(splits[1]);
				var st = {};
				st.name = v;
				st.color = 3;
				st.id = id;
				addStone.push(st);
			}
		} else {
			//其他设置按需获取
		}
	}
	return addStone;
	
}

var infos = [{
	key:"CA",
	name:"charset"
},{
	key:"FF",
	name:"ff"
},{
	key:"SZ",
	name:"boardsize"
},{
	key:"AP",
	name:"app"
},{
	key:"GE",
	name:"ge"
}]

function getGOInfo(str){
	var goInfo = {};
	for(var i=0;i<infos.length;i++){
		var info = infos[i];
		var index = str.indexOf(info.key);
		if(index>=0){
			var endIndex = str.indexOf("]",index)
			var s = str.substring(index,endIndex+1);
			var prop = parseProperty(s);
			goInfo[info.name]=prop.propertyValues[0]
		}
	}
	return goInfo;
}


/**
 *解析树,例如:(;B[sh](;W[sj](;B[qf];W[rg];B[rf]C[RIGHT])(;B[rg];W[qf]))(;W[rg];B[sj];W[si];B[sj]C[RIGHTsnapback]))
 */
function parseTree(){
	var gameTree=[];//没思路啊 没思路啊没思路啊 没思路啊 没思路啊 
	var str = "(;B[sh](;W[sj](;B[qf];W[rg];B[rf]C[RIGHT])(;B[rg];W[qf]))(;W[rg];B[sj];W[si];B[sj]C[RIGHT snapback]))"
	//str = str.substring(1,str.length-1);
	
	
	
	
	return;
	
	
	
	
	
	var splits = str.split("(")
	return console.log(splits)
//	
//	while(str.indexOf("](")!=-1){
//		GongSiTiGongQiuHePaiZi
//	}
//	
	
	
	var leftArr=[];
	var rightArr=[];
////	str = str.split("");
	var quoteArr = [];
	var i=0;
	while(str.indexOf("(",i)!=-1){
		var x = str.indexOf("(",i)
		i=x+1;
		leftArr.push(x)
	}
	i=0
	while(str.indexOf(")",i)!=-1){
		var x = str.indexOf(")",i)
		i=x+1;
		rightArr.push(x)
	}
	
	if(leftArr.length<=0||rightArr.length<=0||leftArr.length!=rightArr.length){
		return alert("SGF格式有误,请检查后重试!");
	}
	console.log(JSON.stringify(leftArr))	
	console.log(JSON.stringify(rightArr))	
	
}
/**
 *解析节点序列,例如:;B[qf];W[rg];B[rf]C[RIGHT] 
 */
function parseNodeSeq(str){
	var nodeSeq = [];
//	var str = ";W[rg];B[sj]C[RIGHTsnapback]"
	var splits = str.split(";")
	splits.shift();//删除第一个空元素
	for(var i=0;i<splits.length;i++){
		nodeSeq.push(parseNode(splits[i]))
	}
	console.log(JSON.stringify(nodeSeq))
	return nodeSeq;
}
/**
 * 解析节点,例如:GE[tesuji][11]DI[5k]DP[32]SO[adum]CO[7]GM[1]FF[4]
 */
function parseNode(str){
	console.log("parseNode==="+str)
	var nodes = [];
	var splits = str.split("]");
	if(splits[splits.length-1]==''){
		splits.pop();
	}if(splits[splits.length-1]==')'){
		splits.pop();
	}
	if(splits.length==1){
		splits[0] = splits[0]+"]"
		nodes.push(parseProperty(splits[0]));	
		return nodes;
	}
	var i=0;
	while((i+1)<splits.length){
		var x = doWithTwo(i,splits)
		i=(x==0?i:i-1)
		i++;
	}
	for(var i=0;i<splits.length;i++){
		nodes.push(parseProperty(splits[i]));	
	}
	
	return nodes;
	
}
function doWithTwo(i,splits){
	if(splits[i+1].indexOf("[")==0){//..巧了
		if(splits[i].indexOf("]")>=0){
			
		}else{
			splits[i]=splits[i]+"]"
		}
		splits[i]=splits[i]+splits[i+1]+"]"
		removeByValue(splits,splits[i+1]);
		return -1;
	}else{//正合适
		if(splits[i].indexOf("]")>=0){
		}else{
			splits[i]=splits[i]+"]"
		}
		if(splits[i+1].indexOf("]")>=0){
		}else{
			splits[i+1]=splits[i+1]+"]"
		}
		return 0;
	}
}

function removeByValue(arr, val) {
  for(var i=0; i<arr.length; i++) {
    if(arr[i] == val) {
      arr.splice(i, 1);
      break;
    }
  }
}


/**
 * 解析属性,例如:B[qf]
 */
function parseProperty(str){
	//B[qf]
	var startIndexs = [];
	var endIndexs = [];
	for(var i=0;i<str.length;i++){
		if(str[i]=="["){
			startIndexs.push(i);
		}
		if(str[i]=="]"){
			endIndexs.push(i);
		}
	}
	if(startIndexs.length==0||endIndexs.length==0||startIndexs.length!=endIndexs.length){
		return alert("节点解析失败!")
	}
	var propertyName = str.substring(0,startIndexs[0]);
	var propertyValues = [];
	for(var i=0;i<startIndexs.length;i++){
		var value = str.substring((startIndexs[i]+1),endIndexs[i]);
		propertyValues.push(value);
	}
	var property = {
		propertyName:propertyName,
		propertyValues:propertyValues
	}
	return property;
}
