import express, { Request, Response, Application } from "express";
import { PrismaClient } from "@prisma/client";
import WebSocket from "ws";
import cors from "cors";
import uuidv4 from "../utils/generateSocketID";
import authRouter from "../routes/authRoutes";
import userRouter from "../routes/userRoutes";
import messageRouter from "../routes/messageRoutes";

const wss = new WebSocket.Server({ port: 7071 });
let webSockets: any = {};

function sendMessageTo(senderID: any, receiverID: any, data: any) {
  if (
    webSockets[senderID] &&
    webSockets[receiverID] &&
    webSockets[receiverID].readyState === WebSocket.OPEN &&
    webSockets[senderID].readyState === WebSocket.OPEN
  )
    webSockets[senderID].send(data);
    webSockets[receiverID].send(data);
}

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

    ws.on("message", async (message: any, isBinary: boolean) => {
      try {
        const data = JSON.parse(message);
        const userID = data.userId;
        console.log("data: ", data);
        switch (data.type) {
          case "connect": {
            console.log("Connecting " + data.userId);
            // clients.push({
            //   ws,
            //   ...data,
            // });

            webSockets[userID] = ws;
            console.log(
              "connected: " +
                userID +
                " in " +
                Object.getOwnPropertyNames(webSockets)
            );

            break;
          }

          case "message": {
            const { senderId, receiverId, message } = data;

            console.log("received from " + senderId + ": " + message);

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

            // Send message to a specific user
            sendMessageTo(
              senderId,
              receiverId,
              JSON.stringify({
                type: "message",
                ...newMessage,
              })
            );

            // Stream message to all users on WebSocket
            //   if (client.readyState === WebSocket.OPEN) {
            //     client.send(
            //       JSON.stringify({
            //         type: "message",
            //         ...newMessage,
            //       })
            //     );
            //   }
            // });

            break;
          }
        }

        ws.on("close", () => {
          console.log("A client disconnected...");
          delete webSockets[userID];
          console.log("WebSockets: " + Object.getOwnPropertyNames(webSockets));
        });
      } catch (err) {
        console.log(err);
      }
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

main()
  .catch((err) => {
    console.log(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
