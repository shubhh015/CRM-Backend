import { getChannel } from "../config/rabbitmq.js";

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

                    const req = {
                        body: {
                            logId,
                            status,
                        },
                    };
                    const res = {
                        status: (code) => ({
                            json: (response) =>
                                console.log(
                                    `Response Code: ${code}, Message: ${JSON.stringify(
                                        response
                                    )}`
                                ),
                        }),
                        json: (response) =>
                            console.log(`Success: ${JSON.stringify(response)}`),
                    };

                    await updateDeliveryStatus(req, res);
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
