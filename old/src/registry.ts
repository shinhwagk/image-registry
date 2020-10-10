export type RepoDaemon = 'docker.io' | 'quay.io' | 'mcr.microsoft.com'

export interface RegistryConfig {
    daemon: RepoDaemon;
    registry: string
}

export const ThirdRegistry: { [repo: string]: RegistryConfig } = {
    'docker.io': {
        daemon: 'docker.io',
        registry: 'registry-1.docker.io'
    },
    'quay.io': {
        daemon: 'quay.io',
        registry: 'quay.io'
    },
    'mcr.microsoft.com': {
        daemon: 'mcr.microsoft.com',
        registry: 'mcr.microsoft.com'
    }
}