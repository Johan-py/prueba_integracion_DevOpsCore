import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";

let io: SocketServer | null = null;

export const initSocket = (server: HttpServer): SocketServer => {
  if (io) return io;

  io = new SocketServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`📡 Cliente conectado (ID: ${socket.id})`);

    socket.on("join_blog_room", (blogId: string) => {
      socket.join(`blog_${blogId}`);
      console.log(`User ${socket.id} se unió al blog: ${blogId}`);
    });

    socket.on("disconnect", () => {
      console.log("📡 Cliente desconectado");
    });
  });

  return io;
};

export const getIO = (): SocketServer => {
  if (!io) {
    throw new Error("Socket.io no ha sido inicializado.");
  }
  return io;
};
