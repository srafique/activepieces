import { getPiece, pieces, Trigger, TriggerStrategy } from "@activepieces/pieces";
import {
  CollectionId,
  CollectionVersion,
  FlowId,
  FlowVersion,
  PieceTrigger,
  ProjectId,
  RunEnvironment,
  TriggerHookType,
  TriggerType,
} from "@activepieces/shared";
import { ActivepiecesError, ErrorCode } from "@activepieces/shared";
import { flowQueue } from "../workers/flow-worker/flow-queue";
import { getBackendUrl } from "./public-ip-utils";
import { engineHelper } from "./engine-helper";
import { logger } from "../../main";

const EVERY_FIVE_MINUTES = "*/5 * * * *";

export const triggerUtils = {
  async executeTrigger({ collectionVersion, payload, flowVersion, projectId }: ExecuteTrigger): Promise<any[]> {
    const flowTrigger = flowVersion.trigger;
    let payloads = [];
    switch (flowTrigger.type) {
      case TriggerType.PIECE:
        const pieceTrigger = getPieceTrigger(flowTrigger);
        try {
          payloads = await engineHelper.executeTrigger({
            hookType: TriggerHookType.RUN,
            flowVersion: flowVersion,
            triggerPayload: payload,
            webhookUrl: await getWebhookUrl(flowVersion.flowId),
            collectionVersion: collectionVersion,
            projectId: projectId
          }) as unknown[];
        } catch (e) {
          logger.error(`Flow ${flowTrigger.name} with ${pieceTrigger.name} trigger throws and error, returning as zero payload `);
          payloads = [];
        }
        break;
      default:
        payloads = [payload];
        break;
    }
    return payloads;
  },

  async enable({ collectionId, collectionVersion, flowVersion, projectId }: EnableOrDisableParams): Promise<void> {
    switch (flowVersion.trigger.type) {
      case TriggerType.PIECE:
        await enablePieceTrigger({ collectionId, collectionVersion, projectId, flowVersion });
        break;

      case TriggerType.SCHEDULE:
        console.log("Created Schedule for flow version Id " + flowVersion.id);

        await flowQueue.add({
          id: flowVersion.id,
          data: {
            environment: RunEnvironment.PRODUCTION,
            projectId: projectId,
            collectionId,
            collectionVersionId: collectionVersion.id,
            flowVersion,
            triggerType: TriggerType.SCHEDULE,
          },
          cronExpression: flowVersion.trigger.settings.cronExpression,
        });

        break;
      default:
        break;
    }
  },

  async disable({ collectionId, collectionVersion, flowVersion, projectId }: EnableOrDisableParams): Promise<void> {
    switch (flowVersion.trigger.type) {
      case TriggerType.PIECE:
        await disablePieceTrigger({ collectionId, collectionVersion, projectId, flowVersion });
        break;

      case TriggerType.SCHEDULE:
        console.log("Deleted Schedule for flow version Id " + flowVersion.id);
        await flowQueue.remove({
          id: flowVersion.id,
          repeatable: true,
        });
        break;

      default:
        break;
    }
  },
};

const disablePieceTrigger = async ({ flowVersion, projectId, collectionId, collectionVersion }: EnableOrDisableParams): Promise<void> => {
  const flowTrigger = flowVersion.trigger as PieceTrigger;
  const pieceTrigger = getPieceTrigger(flowTrigger);
  await engineHelper.executeTrigger({
    hookType: TriggerHookType.ON_DISABLE,
    flowVersion: flowVersion,
    webhookUrl: await getWebhookUrl(flowVersion.flowId),
    collectionVersion: collectionVersion,
    projectId: projectId
  });
  switch (pieceTrigger.type) {
    case TriggerStrategy.WEBHOOK:
      break;
    case TriggerStrategy.POLLING:
      await flowQueue.remove({
        id: flowVersion.id,
        repeatable: true,
      });
      break;
  }
};

const enablePieceTrigger = async ({ flowVersion, projectId, collectionId, collectionVersion }: EnableOrDisableParams): Promise<void> => {
  const flowTrigger = flowVersion.trigger as PieceTrigger;
  const pieceTrigger = getPieceTrigger(flowTrigger);

  await engineHelper.executeTrigger({
    hookType: TriggerHookType.ON_ENABLE,
    flowVersion: flowVersion,
    webhookUrl: await getWebhookUrl(flowVersion.flowId),
    collectionVersion: collectionVersion,
    projectId: projectId
  });
  switch (pieceTrigger.type) {
    case TriggerStrategy.WEBHOOK:
      break;
    case TriggerStrategy.POLLING:
      await flowQueue.add({
        id: flowVersion.id,
        data: {
          projectId,
          environment: RunEnvironment.PRODUCTION,
          collectionId,
          collectionVersionId: collectionVersion.id,
          flowVersion,
          triggerType: TriggerType.PIECE,
        },
        cronExpression: EVERY_FIVE_MINUTES,
      });

      break;
  }
};

const getPieceTrigger = (trigger: PieceTrigger): Trigger => {
  const piece = getPiece(trigger.settings.pieceName);

  if (piece == null) {
    throw new ActivepiecesError({
      code: ErrorCode.PIECE_NOT_FOUND,
      params: {
        pieceName: trigger.settings.pieceName,
      },
    });
  }
  const pieceTrigger = piece.getTrigger(trigger.settings.triggerName);
  if (pieceTrigger == null) {
    throw new ActivepiecesError({
      code: ErrorCode.PIECE_TRIGGER_NOT_FOUND,
      params: {
        pieceName: trigger.settings.pieceName,
        triggerName: trigger.settings.triggerName,
      },
    });
  }

  return pieceTrigger;
};

const getWebhookUrl = async (flowId: FlowId): Promise<string> => {
  const webhookPath = `v1/webhooks?flowId=${flowId}`;
  const serverUrl = await getBackendUrl();
  return `${serverUrl}/${webhookPath}`;
};

interface EnableOrDisableParams {
  collectionId: CollectionId;
  collectionVersion: CollectionVersion;
  flowVersion: FlowVersion;
  projectId: ProjectId;
}

interface ExecuteTrigger {
  payload: any;
  projectId: ProjectId;
  collectionVersion: CollectionVersion;
  flowVersion: FlowVersion;
}
