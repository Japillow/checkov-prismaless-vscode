import * as vscode from 'vscode';
import { Logger } from 'winston';
import * as semver from 'semver';
import { isWindows, asyncExec } from './utils';

const minCheckovVersion = '2.0.0';
const minPythonVersion = '3.7.0';

export const getPathToCert = (): string | undefined => {
    const configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('checkov-prismaless');
    const pathToCert = configuration.get<string>('certificate');
    return pathToCert;
};

export const getUseBcIds = (): boolean | undefined => {
    const configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('checkov-prismaless');
    const useBcIds = configuration.get<boolean>('useBridgecrewIDs', false);
    return useBcIds;
};

export const getUseDebugLogs = (): boolean | undefined => {
    const configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('checkov-prismaless');
    const useDebugLogs = configuration.get<boolean>('useDebugLogs', false);
    return useDebugLogs;
};

export const getNoCertVerify = (): boolean | undefined => {
    const configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('checkov-prismaless');
    const noCertVerify = configuration.get<boolean>('noCertVerify', false);
    return noCertVerify;
};

export const getSkipFrameworks = (): string[] | undefined => {
    const configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('checkov-prismaless');
    const skipFrameworks = configuration.get<string>('skipFrameworks');
    return skipFrameworks ? skipFrameworks.split(' ').map(entry => entry.trim()) : undefined;
};

export const getSkipChecks = (): string[] | undefined => {
    const configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('checkov-prismaless');
    const skipChecks = configuration.get<string>('skipChecks');
    return skipChecks ? skipChecks.split(' ').map(entry => entry.trim()) : undefined;
};

export const getFrameworks = (): string[] | undefined => {
    const configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('checkov-prismaless');
    const frameworks = configuration.get<string>('frameworks');
    return frameworks ? frameworks.split(' ').map(entry => entry.trim()) : undefined;
};

export const getCheckovVersion = async (logger: Logger): Promise<string> => {
    const configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('checkov-prismaless');
    const checkovVersion = configuration.get<string>('checkovVersion', 'latest').trim().toLowerCase();

    if (checkovVersion === '' || checkovVersion === 'latest') {
        return 'latest';
    } else {
        logger.debug(`Found version other than "latest" - will attempt to use this: ${checkovVersion}`);
        if (!semver.valid(checkovVersion)) {
            throw Error(`Invalid checkov version: ${checkovVersion}`);
        }
        
        const clean = semver.clean(checkovVersion);
        if (!clean) {
            throw Error(`Invalid checkov version: ${checkovVersion}`);
        }

        if (!semver.satisfies(checkovVersion, `>=${minCheckovVersion}`)) {
            throw Error(`Invalid checkov version: ${checkovVersion} (must be >=${minCheckovVersion})`);
        }

        logger.debug(`Cleaned version: ${clean}`);

        return clean;
    }
};

export const verifyPythonVersion = async (logger: Logger, command = 'python3 --version'): Promise<void> => {
    logger.debug(`Getting python version with command: ${command}`);
    try {
        const [pythonVersionResponse] = await asyncExec(command);
        logger.debug('Raw output:');
        logger.debug(pythonVersionResponse);
        const pythonVersion = pythonVersionResponse.split(' ')[1];
        logger.debug(`Python version: ${pythonVersion}`);
        if (semver.lt(pythonVersion, minPythonVersion)){
            throw Error(`Invalid python version: ${pythonVersion} (must be >=${minPythonVersion})`);
        }
    } catch (error) {
        if (isWindows && command === 'python3 --version') {
            logger.debug('python3 executable not found on Windows, falling back to python');
            await verifyPythonVersion(logger, 'python --version');
        } else {
            throw error;
        }
    }
};

export const shouldDisableErrorMessage = (): boolean => {
    const configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('checkov-prismaless');
    const disableErrorMessageFlag = configuration.get<boolean>('disableErrorMessage', false);
    return disableErrorMessageFlag;
};

export const shouldClearCacheUponConfigUpdate = (): boolean => {
    const configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('checkov-prismaless');
    const clearCacheUponConfigUpdateFlag = configuration.get<boolean>('clearCacheUponConfigUpdate', true);
    return clearCacheUponConfigUpdateFlag;
};

export const getExternalChecksDir = (): string | undefined => {
    const configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('checkov-prismaless');
    const externalChecksDir = configuration.get<string>('externalChecksDir');
    return externalChecksDir;
};

export const getMaximumConcurrentScans = (): number => {
    const configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('checkov-prismaless');
    const maximumConcurrentScans = configuration.get<number>('maximumConcurrentScans', 2);
    return maximumConcurrentScans;
};

export const getScanTimeout = (): number => {
    const configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('checkov-prismaless');
    const scanTimeout = configuration.get<number>('scanTimeout', 60);
    return scanTimeout;
};
