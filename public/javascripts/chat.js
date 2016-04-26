$(document).ready(function(e) {
	$(window).keydown(function(e){
		if(e.keyCode == 116)
		{
			if(!confirm("刷新会将所有数据清空，确定要刷新么？"))
			{
				e.preventDefault();
			}
		}
  });
	var from = $.cookie('session');
	var to = 'all';
	$("#input_content").html("");
	var socket = io.connect();
	socket.emit('online',JSON.stringify({user:from}));
	socket.on('disconnect',function(){
		var msg = '<div style="color:#f00">SYSTEM:连接服务器失败</div>';
		addMsg(msg);
		$("#list").empty();
	});
	socket.on('reconnect',function(){
		socket.emit('online',JSON.stringify({user:from}));
		var msg = '<div style="color:#f00">SYSTEM:重新连接服务器</div>';
		addMsg(msg);
	});
	socket.on('system',function(data){
		var data = JSON.parse(data);
		var time = getTimeShow(data.time);
		var msg = '';
		if(data.type =='online')
		{
			msg += '用户 ' + data.msg +' 上线了！';
		} else if(data.type =='offline')
		{
			msg += '用户 ' + data.msg +' 下线了！';
		} else if(data.type == 'in')
		{
			msg += '你进入了聊天室！';
		} else
		{
			msg += '未知系统消息！';
		}
		var msg = '<div style="color:#f00">SYSTEM('+time+'):'+msg+'</div>';
		addMsg(msg);
	});
	// 刷新用户列表
	socket.on('userflush',function(data){
		var data = JSON.parse(data);
		var users = data.users;
		flushUsers(users);
	});
	socket.on('say',function(msgData){
		var time = msgData.time;
		time = getTimeShow(time);
		var data = msgData.data;
		if (data.to=='all') {
			addMsg('<div>'+data.from+'('+time+')说：<br/>'+data.msg+'</div>');
		} else if(data.from == from) {
			addMsg('<div>我('+time+')对'+data.to+'说：<br/>'+data.msg+'</div>');
		} else if(data.to == from)
		{
			addMsg('<div>'+data.from+'('+time+')对我说：<br/>'+data.msg+'</div>');
		}
	});

	function addMsg(msg){
	  $("#contents").append(msg);
	  $("#contents").append("<br/>");
		// scrollTop(offset) offset规定相对滚动条顶部的偏移
	  $("#contents").scrollTop($("#contents")[0].scrollHeight);
	}
	function flushUsers(users){
		var ulEle = $("#list");
		ulEle.empty();
		ulEle.append('<li title="双击聊天" alt="all" onselectstart="return false">所有人</li>');
		for(var i = 0; i < users.length; i ++)
		{
			ulEle.append('<li alt="'+users[i]+'" title="双击聊天" onselectstart="return false">'+users[i]+'</li>')
		}
			//双击对某人聊天
		$("#list > li").dblclick(function(e){
			if($(this).attr('alt') != from)
			{
				to = $(this).attr('alt');
				show_say_to();
			}
		});
		show_say_to();
	}
	$("#input_content").keydown(function(e) {
	  if(e.shiftKey && e.which==13){
		$("#input_content").append("<br/>");
	  } else if(e.which == 13)
	  {
		e.preventDefault();
			say();
	  }
	});
	$("#say").click(function(e){
		say();
	});
	function say(){
		if ($("#input_content").html() == "") {
			return;
		}
		socket.emit('say',JSON.stringify({to:to,from:from,msg:$("#input_content").html()}));
	  $("#input_content").html("");
	  $("#input_content").focus();
	}
	//显示正在对谁说话
	function show_say_to(){
		$("#from").html(from);
		$("#to").html(to=="all" ? "所有人" : to);
		var users = $("#list > li");
		for(var i = 0; i < users.length; i ++)
		{
			if($(users[i]).attr('alt')==to)
			{
				$(users[i]).addClass('sayingto');
			}
			else
			{
				$(users[i]).removeClass('sayingto');
			}
		}
	}
	function getTimeShow(time){
		var dt = new Date(time);
		time = dt.getFullYear() + '-' + (dt.getMonth()+1) + '-' + dt.getDate() + ' '+dt.getHours() + ':' + (dt.getMinutes()<10?('0'+ dt.getMinutes()):dt.getMinutes()) + ":" + (dt.getSeconds()<10 ? ('0' + dt.getSeconds()) : dt.getSeconds());
		return time;
	}
	$.cookie('isLogin',true);
});
