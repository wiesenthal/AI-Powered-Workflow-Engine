import { ChatCompletion, Model } from "openai/resources";
import { Socket } from "socket.io";
import { devLog } from "../utils/logging";

export type chatCompletionModel = 'gpt-3.5-turbo' | 'gpt-4-1106-preview' | 'gpt-4';

type tokenCosts = { [key in chatCompletionModel]: number };

class OpenAIAuditor {
    private socket?: Socket;
    private totalCost: number;
    private modelPromptCostsPer1000Tokens: tokenCosts = {
        'gpt-3.5-turbo': 0.001,
        'gpt-4-1106-preview': 0.01,
        'gpt-4': 0.03
    }
    private modelCompletionTokenCostsPer1000Tokens: tokenCosts = {
        'gpt-3.5-turbo': 0.002,
        'gpt-4-1106-preview': 0.02,
        'gpt-4': 0.06
    }

    constructor(socket?: Socket) {
        this.totalCost = 0;

        if (socket) {
            this.setSocket(socket);
        }
    }

    public setSocket = (socket: Socket): void => {
        this.socket = socket;
        this.socket.on('getTotalCost', (callback: (totalCost: number) => void) => {
            callback(this.getTotalCost());
        });
    }

    private parseModel = (model: string): chatCompletionModel => {
        for (const modelKey in this.modelPromptCostsPer1000Tokens) {
            if (model.includes(modelKey)) {
                return modelKey as chatCompletionModel;
            }
        }
        console.warn(`Could not parse model ${model}, defaulting to gpt-3.5-turbo`);
        return 'gpt-3.5-turbo';
    }

    public audit = (chatCompletion: ChatCompletion): void => {
        const model = this.parseModel(chatCompletion.model);

        const promptTokens: number = chatCompletion.usage?.prompt_tokens || 0;
        const completionTokens: number = chatCompletion.usage?.completion_tokens || 0;

        const promptTokenCost = this.modelPromptCostsPer1000Tokens[model] * promptTokens / 1000;
        const completionTokenCost = this.modelCompletionTokenCostsPer1000Tokens[model] * completionTokens / 1000;

        this.totalCost += promptTokenCost + completionTokenCost;

        devLog(`Audited chat completion for model ${model} with prompt tokens ${promptTokens} and completion tokens ${completionTokens}, total cost is now \$${this.totalCost}`);
        
        this.socket?.emit('updateTotalCost', this.getTotalCost());
    }

    public getTotalCost = (): number => {
        return Math.round(this.totalCost * 100) / 100;
    }
}

export default new OpenAIAuditor();
