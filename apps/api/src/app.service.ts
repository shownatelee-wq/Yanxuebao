import { Injectable } from '@nestjs/common';
import { appModules } from '@yanxuebao/config';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'yanxuebao-api',
      timestamp: new Date().toISOString(),
    };
  }

  getManifest() {
    return {
      service: 'yanxuebao-api',
      version: '0.1.0',
      modules: appModules,
      auth: {
        web: 'account-password',
        device: 'authorization-code',
      },
      docs: {
        apiContracts: 'docs/api-contracts.md',
        dataDictionary: 'docs/data-dictionary.md',
        integration: 'docs/integration-conventions.md',
      },
    };
  }
}

