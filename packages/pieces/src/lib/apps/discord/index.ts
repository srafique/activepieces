import {createPiece} from "../../framework/piece";
import { discordSendMessageWebhook } from "./actions/send-message-webhook";

export const discord = createPiece({
    name: 'discord',
    displayName: "Discord",
    logoUrl: 'https://cdn.activepieces.com/pieces/discord.png',
    actions: [discordSendMessageWebhook],
    triggers: [],
});
