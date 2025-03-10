import { OAuth2PropertyValue, Property } from '../../../framework/property';
import { httpClient } from '../../../common/http/core/http-client';
import { HttpRequest } from '../../../common/http/core/http-request';
import { HttpMethod } from '../../../common/http/core/http-method';
import { AuthenticationType } from '../../../common/authentication/core/authentication-type';

type FormListResponse = {
    items: {
        id: string;
        title: string;
    }[];
}

export const formsDropdown = Property.Dropdown<string>({
    displayName: 'Form',
    description: 'Form Name',
    required: true,
    refreshers: ['authentication'],
    async options(propsValue) {
        const auth = propsValue['authentication'] as OAuth2PropertyValue;

        if (auth === undefined) {
            return {
                disabled: true,
                placeholder: 'Connect typeform account',
                options: [],
            };
        }

        const accessToken = auth.access_token;

        const request: HttpRequest = {
            method: HttpMethod.GET,
            url: 'https://api.typeform.com/forms',
            authentication: {
                type: AuthenticationType.BEARER_TOKEN,
                token: accessToken,
            },
        };

        const response = await httpClient.sendRequest<FormListResponse>(request);
        const options = response.body.items.map(item => ({
            label: item.title,
            value: item.id,
        }));

        return {
            disabled: false,
            placeholder: 'Select form',
            options,
        };
    },
});

export const typeformCommon = {
    baseUrl: "https://api.typeform.com",
    authentication: Property.OAuth2({
        displayName: "Authentication",
        required: true,
        tokenUrl: 'https://api.typeform.com/oauth/token',
        authUrl: 'https://admin.typeform.com/oauth/authorize',
        scope: ['webhooks:write', 'forms:read'],
    }),
    subscribeWebhook: async (formId: string, tag: string, webhookUrl: string, accessToken: string) => {
        const request: HttpRequest = {
            method: HttpMethod.PUT,
            url: `${typeformCommon.baseUrl}/forms/${formId}/webhooks/${tag}`,
            headers: {
                "Content-Type": "application/json"
            },
            body: {
                enabled: true,
                url: webhookUrl
            },
            authentication: {
                type: AuthenticationType.BEARER_TOKEN,
                token: accessToken,
            },
            queryParams: {},
        };

        await httpClient.sendRequest(request);
    },
    unsubscribeWebhook: async (formId: string, tag: string, accessToken: string) => {
        const request: HttpRequest = {
            method: HttpMethod.DELETE,
            url: `${typeformCommon.baseUrl}/forms/${formId}/webhooks/${tag}`,
            headers: {
                "Content-Type": "application/json"
            },
            authentication: {
                type: AuthenticationType.BEARER_TOKEN,
                token: accessToken,
            },
        };
        return await httpClient.sendRequest(request);
    }
}

