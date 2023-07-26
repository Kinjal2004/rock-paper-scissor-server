const io = require('socket.io')(3000, {
  cors: {
      origin: '*'
  }
})
rooms = []
function generateId() {
  let result = Math.floor(Math.random()*1000000).toString()
  //recheck
  if(rooms.includes(result)){
    generateId()
  }
  return result;
}
function addRoom(name) {
  rooms.push(name);
}

io.on('connection',socket=>{
  console.log("user connected",socket.id)
  socket.on('generateRoom',()=>{
    uniqueId = generateId()
    socket.join(uniqueId);
    addRoom(uniqueId);
    console.log(rooms)
    socket.emit('generatedId',uniqueId);
  })
  socket.on("joinRoom",roomId =>{
    
    if(rooms.some(room => room == roomId.toString())){
      socket.join(roomId);
      const roomIdx = rooms.findIndex(room => room === roomId)
      rooms.splice(roomIdx,1)
      socket.emit("foundRoom",roomId);
      socket.broadcast.to(roomId).emit("joined");
    }
    else{
      socket.emit("noSuchRoom");
    }
  })
  socket.on("local-choice",({LChoice,Id})=>{
    console.log(LChoice)
    console.log(Id)
    socket.broadcast.to(Id).emit("remote-choice",LChoice);
  })
  socket.on("replay-request",(Id)=>{
    socket.broadcast.to(Id).emit("replay-requested");
  })
  socket.on("approved",(Id)=>{
    socket.broadcast.to(Id).emit("replay-approved");
  })
  socket.on('disconnect', () => {
   
  });
})