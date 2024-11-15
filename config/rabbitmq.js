import amqp from "amqplib";

let channel;

const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL, {
            heartbeat: 60,
            connectionTimeout: 30000,
            ssl: {
                enabled: true,
                rejectUnauthorized: false,
            },
        });

        channel = await connection.createChannel();
        console.log("Connected to CloudAMQP RabbitMQ");
    } catch (error) {
        console.error("RabbitMQ connection error:", error);
        setTimeout(connectRabbitMQ, 5000);
    }
};

const getChannel = () => channel;

export { connectRabbitMQ, getChannel };
