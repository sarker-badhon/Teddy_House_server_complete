const express = require("express")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require("cors")
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

//middleware
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('hello i am ready')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zwfejkx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    client.connect((error)=>{
      if(error){
        console.log(error)
        return;
      }
    });


    const teddyCollection = client.db("teddyDb").collection("teddys")
    const bookToyCollection = client.db("teddyDb").collection("bookToys")
    const toyGalleryCollection = client.db("teddyDb").collection("toyGallery")
    app.get("/toyGallery", async (req, res) => {
      const cursor = toyGalleryCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })


    app.get("/teddys", async (req, res) => {
      const result = await teddyCollection.find().toArray()
      res.send(result)
    })
    app.get('/teddys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
        const result = await teddyCollection.findOne(query);
        res.send(result);
        res.status(400).send('Error Retrieving Toy Details');
   
    });

    app.get('/bookToys', async (req, res) => {
      let query = {}
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await bookToyCollection.find(query).toArray()
      res.send(result)
    })


    app.patch('/bookToy/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const toyUpdate = req.body;
      const update = {
        $set: {
          ...toyUpdate
        }
      };
      const result = await bookToyCollection.updateOne(filter, update)
      res.send(result)
    })

    app.delete('/bookToys/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await bookToyCollection.deleteOne(query)
      res.send(result)
    })



    app.get('/toysdetails/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      try {
        const result = await bookToyCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(400).send('Error Retrieving Toy Details');
      }
    });

    app.post('/bookToys', async (req, res) => {
      const bookToy = req.body
      console.log(bookToy)
      const result = await bookToyCollection.insertOne(bookToy)
      res.send(result)
    })
    app.delete('/bookToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookToyCollection.deleteOne(query);
      res.send(result);
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`listen port is running : ${port}`)
})