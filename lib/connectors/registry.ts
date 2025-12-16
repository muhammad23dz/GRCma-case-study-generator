
import { Connector } from './types';
import { GitHubConnector } from './github';

export class ConnectorRegistry {
    private static connectors: Record<string, Connector> = {
        'github': new GitHubConnector(),
        // Add more connectors here: 'aws': new AWSConnector(),
    };

    static getConnector(provider: string): Connector | undefined {
        return this.connectors[provider];
    }
}
