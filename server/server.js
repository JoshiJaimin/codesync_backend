const express = require("express")
const app = express()
const http = require("http")
const cors = require("cors")
const userroute = require("./src/routes/userRoute")
const roomroute = require("./src/routes/roomRoute")
const ACTIONS = require("./utils/actions")
require("dotenv").config()
require('./src/db/conn')

app.use(express.json())
app.use(cors())
app.use("/", userroute)
app.use("/room", roomroute)

const { Server } = require("socket.io")

const server = http.createServer(app)
const io = new Server(server, {
	cors: {
		origin: "*",
	},
})

const userSocketMap = {}

function getAllConnectedClient(roomId) {
	return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
		(socketId) => {
			return {
				socketId,
				username: userSocketMap[socketId]?.username,
				status: userSocketMap[socketId]?.status,
			}
		}
	)
}

io.on("connection", (socket) => {
	// Handle user actions
	socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
		userSocketMap[socket.id] = { username, roomId, status: ACTIONS.ONLINE }
		socket.join(roomId)
		const clients = getAllConnectedClient(roomId)
		socket.broadcast.to(roomId).emit(ACTIONS.JOINED, {
			username,
			socketId: socket.id,
		})
		// Send clients list to all sockets in room
		io.to(roomId).emit(ACTIONS.UPDATE_CLIENTS_LIST, { clients })
	})
	socket.on("disconnecting", () => {
		const rooms = [...socket.rooms]
		rooms.forEach((roomId) => {
			const clients = getAllConnectedClient(roomId)
			clients.forEach(({ socketId }) => {
				io.to(socketId).emit(ACTIONS.DISCONNECTED, {
					username: userSocketMap[socket.id]?.username,
					socketId: socket.id,
				})
			})
		})

		delete userSocketMap[socket.id]
		socket.leave()
	})

	// Handle file actions
	socket.on(ACTIONS.SYNC_FILES, ({ files, currentFile, socketId }) => {
		io.to(socketId).emit(ACTIONS.SYNC_FILES, { files, currentFile })
	})

	socket.on(ACTIONS.FILE_CREATED, ({ roomId, file }) => {
		socket.broadcast.to(roomId).emit(ACTIONS.FILE_CREATED, { file })
	})

	socket.on(ACTIONS.FILE_UPDATED, ({ roomId, file }) => {
		socket.broadcast.to(roomId).emit(ACTIONS.FILE_UPDATED, { file })
	})

	socket.on(ACTIONS.FILE_RENAMED, ({ roomId, file }) => {
		socket.broadcast.to(roomId).emit(ACTIONS.FILE_RENAMED, { file })
	})

	socket.on(ACTIONS.FILE_DELETED, ({ roomId, id }) => {
		socket.broadcast.to(roomId).emit(ACTIONS.FILE_DELETED, { id })
	})

	// Handle user status
	socket.on(ACTIONS.OFFLINE, ({ roomId, socketId }) => {
		userSocketMap[socketId] = {
			...userSocketMap[socketId],
			status: ACTIONS.OFFLINE,
		}
		socket.broadcast.to(roomId).emit(ACTIONS.OFFLINE, { socketId })
	})

	socket.on(ACTIONS.ONLINE, ({ roomId, socketId }) => {
		userSocketMap[socketId] = {
			...userSocketMap[socketId],
			status: ACTIONS.ONLINE,
		}
		socket.broadcast.to(roomId).emit(ACTIONS.ONLINE, { socketId })
	})

	// Handle chat actions
	socket.on(ACTIONS.SEND_MESSAGE, ({ roomId, message }) => {
		socket.broadcast.to(roomId).emit(ACTIONS.RECEIVE_MESSAGE, { message })
	})
})

const PORT = process.env.PORT || 8080



server.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`)
})
