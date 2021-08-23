import "reflect-metadata"
import { ApolloServer } from "apollo-server-express"
import express from "express"
import { buildSchema } from "type-graphql"
import cors from "cors"
import dotenv from "dotenv"
import { ChatResolver } from "./resolvers/chat"
import { createServer } from 'http';


dotenv.config()

const main = async () => {
    const app = express()
    const httpServer = createServer(app);

    app.use(cors({ origin: "*", credentials: true }))

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [ChatResolver],
            validate: false
        })
        ,
 
        subscriptions: {
            path: "/subscriptions",
            onConnect: () => {
                console.log("Client connected for subscriptions")
            },
            onDisconnect: () => {
                console.log("Client disconnected for subscriptions")
            }
        }
    })

    

    await apolloServer.start()
    

    apolloServer.applyMiddleware({ app, cors: false })

    apolloServer.installSubscriptionHandlers(httpServer)

    
    httpServer.listen(process.env.PORT || 4000 , () => {
        console.log(`Server started on http://localhost:${process.env.PORT || 4000 }${apolloServer.graphqlPath}`)
        console.log(`Subscriptions server started on ws://localhost:${process.env.PORT || 4000 }${apolloServer.subscriptionsPath}`)
    }
    )
}

main().catch((err) => {
    console.error(err)
})
