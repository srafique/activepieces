import { createPiece } from "../../framework/piece";
import { createClickupTask } from "./actions/create-task";

export const clickup = createPiece({
    name: 'clickup',
    displayName: "Clickup",
    logoUrl: 'https://cdn.activepieces.com/pieces/clickup.png',
    actions: [createClickupTask],
    triggers: [],
});