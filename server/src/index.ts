import express, { Request, Response, Application } from "express";
import { PrismaClient } from "@prisma/client";
import WebSocket from "ws";
import cors from "cors";
import uuidv4 from "../utils/generateSocketID";
import authRouter from "../routes/authRoutes";
import userRouter from "../routes/userRoutes";
import messageRouter from "../routes/messageRoutes";

const wss = new WebSocket.Server({ port: 7071 });
// const clients = new Map();
let clients: any[] = [];
let webSockets: any = {};

const addUser = (userId: number, socketId: number) => {
  !clients.some((user) => user.userId === userId) &&
    clients.push({ userId, socketId });
};

const removeUser = (socketId: number) => {
  clients = clients.filter((user) => user.socketId !== socketId);
};

const getUser = (userId: number) => {
  return clients.find((user) => user.userId === userId);
};

const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

const main = async () => {
  const app: Application = express();

  app.use(express.json());
  app.use(cors());
  //   app.use(
  //     cors({
  //       origin: process.env.CORS_ORIGIN as string,
  //       credentials: true,
  //     })
  //   );
  //   app.use(express.static("public"));

  //   app.use(
  //     session({
  //       name: process.env.COOKIE_NAME as string,
  //       store: new RedisStore({ client: redisClient, disableTouch: true }),
  //       cookie: {
  //         maxAge: 1000 * 60 * 60 * 24 * 365 * 1, // 1 year
  //         // maxAge: 7000, // 1 day
  //         httpOnly: true,
  //         sameSite: "lax",
  //         secure: __prod__, // cookie only works in https
  //         domain: __prod__ ? ".example.com" : undefined
  //       },
  //       saveUninitialized: false,
  //       secret: process.env.SESSION_SECRET as string,
  //       resave: false,
  //     })
  //   );

  wss.on("connection", (ws) => {
    // console.log("A client just connected...");
    const userID = uuidv4();
    const color = Math.floor(Math.random() * 3600);
    const metadata = { userID, color };

    webSockets[userID] = ws;
    console.log(
      "connected: " + userID + " in " + Object.getOwnPropertyNames(webSockets)
    );

    // clients.set(ws, metadata);

    ws.on("message", async (message: any, isBinary: boolean) => {
      try {
        const data = JSON.parse(message);
        // console.log("data: ", data);
        switch (data.type) {
          case "connect": {
            // console.log("Connecting " + data.userId);
            clients.push({
              ws,
              ...data,
            });

            break;
          }

          case "message": {
            const { senderId, receiverId, message } = data;

            console.log("received from " + userID + ": " + message);

            const newMessage = await prisma.message.create({
              data: {
                message,
                senderId,
                receiverId,
              },
              include: {
                receiver: true,
                sender: true,
              },
            });

            let toUserWebSocket = webSockets[data];

            // if (toUserWebSocket) {
            //   console.log("sent to " + data[0] + ": " + JSON.stringify(data));
            //   data[0] = userID;
            //   toUserWebSocket.send(JSON.stringify(newMessage));
            // }

            wss.clients.forEach(function each(client) {
              // if (client !== ws && client.readyState === WebSocket.OPEN) {
              //   // client.send(data, { binary: isBinary });
              //   client.send(
              //     JSON.stringify({
              //       type: "message",
              //       ...newMessage,
              //     })
              //   );
              // }

              if (client.readyState === WebSocket.OPEN) {
                client.send(
                  JSON.stringify({
                    type: "message",
                    ...newMessage,
                  })
                );
              }
            });

            // clients
            //   .filter((c) => {
            //     return (
            //       c.userId === data.receiverId || c.userId === data.senderId
            //     );
            //   })
            //   .forEach((client) =>
            //     client.socket.send(
            //       JSON.stringify({
            //         type: "message",
            //         ...data,
            //       })
            //     )
            //   );
            break;
          }
        }
      } catch (err) {
        console.log(err);
      }

      // wss.clients.forEach((client) => {
      //   if (client !== ws && client.readyState === WebSocket.OPEN) {
      //     client.send(messageAsString);
      //   }
      // });
      // const data = JSON.parse(messageAsString);
      // console.dir("Received message from client - ", data);
      // const message = JSON.parse(messageAsString);
      // const metadata = clients.get(ws);

      // message.sender = metadata.id;
      // message.color = metadata.color;
      // const outbound = JSON.stringify(message);

      // [...clients.keys()].forEach((client) => {
      //   client.send(outbound);
      // });
    });

    ws.on("close", () => {
      delete webSockets[userID];
      console.log("A client disconnected...", userID);
      // clients.delete(ws);
      //   const client = clients.find((c) => c.userId === ws.userId);
      //   if (!client) return;
      //   console.log('Closing: ' + client.userId);
      //   clients.splice(clients.indexOf(client), 1);
    });
  });

  /*/ Routes /*/

  // Authentication
  app.use("/api/auth", authRouter);

  // Users
  app.use("/api/users", userRouter);

  // Messages
  app.use("/api/messages", messageRouter);

  // Root
  app.get("/", async (req, res) => {
    // const recentUsers = await prisma.user.findMany({
    //   include: {
    //     posts: true,
    //     profile: true,
    //   },
    // });
    // res.send(recentUsers);
  });

  //   const apolloServer = new ApolloServer({
  //     schema: await buildSchema({
  //       resolvers: [HelloResolver, PostResolver, UserResolver],
  //     }),
  //     context: ({ req, res }) => ({ prisma, req, res, redisClient }),
  //     // subscriptions: {
  //     //   path: "/subscriptions",
  //     //   onConnect: () => console.log("✅  Client connected for subscriptions"),
  //     //   onDisconnect: () => console.log("❌  Client disconnected from subscriptions")
  //     // },
  //     // uploads: false,
  //   });

  //   apolloServer.applyMiddleware({ app, cors: false });

  app.listen(PORT, () =>
    console.log(`🚀  Server running on http://localhost:${PORT}`)
  );
};

main().catch((err) => {
  console.log(err);
});
// .finally(async () => {
//   await prisma.$disconnect();
// });
