var topology = require("fully-connected-topology")
var jsonStream = require("duplex-json-stream")
var streamSet = require("stream-set")
// var register = require('register-multicast-dns')


var logs = {}

var address = process.argv[2]
var peers = process.argv.slice(3)

var swarm = topology(address,peers);
var streams = streamSet()

swarm.on('connection', (peer)=>{
  console.log("[a friend joined!]")
  peer = jsonStream(peer)
  streams.add(peer)


  peer.on('data', (data)=>{
    if(data.seq <= logs[data.from]) return;
    logs[data.from] = data.seq
    console.log(data.username + "> " + data.message)
    streams.forEach(otherPeer=>{
      otherPeer.write(data)
    })

  })
})

var id = Math.random();
var seq = 0;

process.stdin.on('data', (data)=>{
  streams.forEach((peer) => {
    peer.write({from: id, seq: seq++, username: address, message: data.toString().trim()})
  });
  
})