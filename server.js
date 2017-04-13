var express=require('express'),
	app=express(),
	http = require('http').Server(app),
	mongo=require('mongodb').MongoClient,
	client=require('socket.io')(http),
	url="mongodb://admin:shahir1994@ds159670.mlab.com:59670/chat";
	
app.use(express.static('public'));
/*app.get('/', function(req, res){
	console.log('Request made');
  res.sendFile(__dirname + '/public/index.html');
});*/

http.listen((process.env.PORT || 5000), function(){
  console.log('listening on *:5000');
});
	
mongo.connect(url,function(err,db){
	if(err) throw err;
	client.on('connection',function(socket){
		
		var col=db.collection('messages'),
			sendStatus=function(s){
				socket.emit('status',s);
			};
		
		//Emit all messages
		col.find().limit(100).sort({_id:1}).toArray(function(err,res){
			if(err) throw err;
			socket.emit('output',res);
		});
		
		//wait for input
		socket.on('input',function(data){
			var name=data.name,
				message=data.message,
				whitespacePattern=/^\s*$/;
			if(whitespacePattern.test(name)||whitespacePattern.test(message)){
				sendStatus('Name and message is required.');
			}else{
				col.insert({name:name,message:message},function(){
					
					//Emit latest message to all clients
					client.emit('output',[data]);
					sendStatus({
						message:"Message sent",
						clear:true
					});
				});		
			}
 			
		});
	});
});
	
