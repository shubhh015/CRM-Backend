import { getChannel } from "../config/rabbitmq.js";

const QUEUE_NAME = "messageQueue";

export const sendMessageToQueue = async (message) => {
    const channel = getChannel();
    if (channel) {
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)));
        console.log(`Sent message to queue: ${JSON.stringify(message)}`);
    }
};
