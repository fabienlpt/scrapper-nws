import {connect, Schema, model} from 'mongoose';
import fastify from 'fastify';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_PASS = process.env.MONGO_PASS;

const server = fastify({ logger: true });

connect(`mongodb+srv://fabienlpt:${MONGO_PASS}@cluster0.z6vliub.mongodb.net/?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true});

const carSchema = new Schema({
    brand: String,
    model: String,
    color: String,
    sportsCar: Boolean,
    kilometers: Number,
});

const Car = model('Car', carSchema);

server.post('/car', async (req, res) => {
    const {brand, model, color, sportsCar, kilometers} = req.body;
    const newCar = new Car({brand, model, color, sportsCar, kilometers});
    const savedCar = await newCar.save();
    res.code(201).send(savedCar);
});

server.get('/cars', async (req, res) => {
    const cars = await Car.find();
    res.code(200).send(cars);
});

server.get('/cars/:id', async (req, res) => {
    const car = await Car.findById(req.params.id);
    res.code(200).send(car);
});

server.put('/cars/:id', async (req, res) => {
    const {brand, model, color, sportsCar, kilometers} = req.body;
    const car = await Car.findByIdAndUpdate(req.params.id, {brand, model, color, sportsCar, kilometers});
    reply.code(200).send(car);
});

server.delete('/cars/:id', async (req, res) => {
    const car = await Car.findByIdAndDelete(req.params.id);
    res.code(200).send({message: car + ' deleted'});
});


server.listen({port: 3000}, (err, address) => {
    if (err) {
        server.log.error(err);
        process.exit(1);
    }
    server.log.info(`server listening on ${address}`);
});