const { Client, Server } = require("node-osc");
// import * as osc from "./osc.module.min.js";
// console.log(osc);

let socket;
let connected = false;

async function main() {
  console.log("~~~~~~~~~~~~~~~~~");

  // initialize values from previous session
  const socketServerURL = localStorage.getItem("socketServerURL");
  if (socketServerURL)
    document.getElementById("socket-server-url-input").value = socketServerURL;

  const oscServerIP = localStorage.getItem("oscServerIP");
  if (oscServerIP)
    document.getElementById("osc-server-ip-input").value = oscServerIP;

  const oscServerPort = localStorage.getItem("oscServerPort");
  if (oscServerPort)
    document.getElementById("osc-server-port-input").value = oscServerPort;

  const connectButton = document.getElementById("connect");
  connectButton.addEventListener("click", (ev) => {
    ev.preventDefault();
    if (connected) {
      // toggle connect button text
      connectButton.innerText = "Connect";
      connectButton.style.backgroundColor = "white";
      connectButton.style.color = "black";

      // disconnect socket
      socket.disconnect();
      connected = false;
    } else {
      const oscServerIP = document.getElementById("osc-server-ip-input").value;
      const oscServerPort = document.getElementById(
        "osc-server-port-input"
      ).value;
      const client = new Client(oscServerIP, oscServerPort);

      // set in storage
      localStorage.setItem("oscServerIP", oscServerIP);
      localStorage.setItem("oscServerPort", oscServerPort);

      console.log("Connecting to socket server");

      const serverURL = document.getElementById(
        "socket-server-url-input"
      ).value;
      localStorage.setItem("socketServerURL", serverURL);

      socket = io(serverURL, {
        path: "/socket.io",
      });

      socket.on("connect", () => {
        console.log("Connecteds! My socket ID: ", socket.id); // x8WIv7-mJelg7on_ALbx
      });

      // receive socket messages from socket server and forward them to local OSC receivers
      socket.on("osc", (message) => {
        console.log("Received socket message:", message);
        console.log("Sending osc:", message);
        client.send(message, 200, () => {});
      });

      // receive OSC from local transmitters and forward them to socket server
      var oscServer = new Server(3333, "127.0.0.1");

      oscServer.on("message", function (msg) {
        console.log(`Received OSC message: ${msg}`);
        console.log(`Sending socket message: ${msg}`);
        socket.emit("osc", msg);
      });

      // toggle connect button text
      connectButton.innerText = "Disconnect";
      connectButton.style.backgroundColor = "red";
      connectButton.style.color = "white";
      connected = true;
    }
  });
}

main();
