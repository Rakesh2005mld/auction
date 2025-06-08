const express = require("express");
const http = require("http");
const cors = require("cors"); // Add this import
const { Server } = require("socket.io");
const admin = require("firebase-admin");
const serviceAccount = require("./firebase-service-account.json"); // Update path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const app = express();
app.use(cors()); // Enable CORS for the backend

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow frontend to access the backend
    methods: ["GET", "POST"],
  },
});

let lowestBid = Infinity; // Initialize lowestBid
let bidders = []; // Initialize bidders list

// Socket.io connection
io.on("connection", (socket) => {
  console.log("A user connected");

  // Send product details when the user joins the auction
  socket.on("joinAuction", async (postId) => {
    const postDoc = await db.doc(`shippingPosts/${postId}`).get();
    if (postDoc.exists) {
      socket.emit("productDetails", postDoc.data());
    }
  });

  // Handle placing a new bid
  socket.on("placeBid", async ({ bidAmount, user, postId }) => {
    if (bidAmount >= lowestBid) {
      socket.emit("errorBid", "Bid must be lower than the current lowest bid!");
      return;
    }

    // Fetch the current post data to update the bids array
    const postRef = db.doc(`shippingPosts/${postId}`);
    const postDoc = await postRef.get();
    const postData = postDoc.data();
    
    // If bids array is empty, initialize it with the first bid
    const updatedBids = postData.bids ? [...postData.bids, { ...user, bidAmount }] : [{ ...user, bidAmount }];

    // Update Firestore with the new bid
    await postRef.update({ bids: updatedBids });

    // Update lowest bid to the new bidAmount if it's the lowest
    lowestBid = bidAmount;

    // Emit the updated bid and bidders list to all connected clients
    io.emit("updateBid", { bid: lowestBid, bidders: updatedBids });
  });

  // Handle the auction ending
  socket.on("auctionEnd", async (postId) => {
    const postRef = db.doc(`shippingPosts/${postId}`);
    const postDoc = await postRef.get();
    const winner = postDoc.data().bids.slice(-1)[0]; // Get the last bid as the winner
    io.emit("announceWinner", winner); // Announce the winner to all clients
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
