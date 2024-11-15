import { getChannel } from "../config/rabbitmq.js";
import CommunicationLog from "../models/CommunicationLog.js";

const QUEUE_NAME = "messageQueue";

export const startConsumer = async () => {
    const channel = getChannel();
    if (channel) {
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        channel.consume(
            QUEUE_NAME,
            async (msg) => {
                if (msg !== null) {
                    const { logId } = JSON.parse(msg.content.toString());

                    const status = Math.random() < 0.9 ? "SENT" : "FAILED";

                    await CommunicationLog.findByIdAndUpdate(logId, { status });
                    console.log(
                        `✅ Processed message with logId: ${logId}, Status: ${status}`
                    );

                    channel.ack(msg);
                }
            },
            { noAck: false }
        );
    }
};
