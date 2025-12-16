
import { Evidence } from "@prisma/client";

export interface ConnectorConfig {
    encryptedCredentials: string;
    config: any;
}

export interface Connector {
    provider: string;
    testConnection(config: ConnectorConfig): Promise<boolean>;
    collectEvidence(config: ConnectorConfig, options?: any): Promise<Partial<Evidence>[]>;
}
