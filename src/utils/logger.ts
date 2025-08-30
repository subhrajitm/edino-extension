import * as vscode from 'vscode';

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

export class Logger {
    private static instance: Logger;
    private logLevel: LogLevel = LogLevel.INFO;
    private outputChannel: vscode.OutputChannel;

    private constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Edino Project Generator');
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    public setLogLevel(level: LogLevel): void {
        this.logLevel = level;
    }

    public debug(message: string, ...args: any[]): void {
        if (this.logLevel <= LogLevel.DEBUG) {
            this.log('DEBUG', message, ...args);
        }
    }

    public info(message: string, ...args: any[]): void {
        if (this.logLevel <= LogLevel.INFO) {
            this.log('INFO', message, ...args);
        }
    }

    public warn(message: string, ...args: any[]): void {
        if (this.logLevel <= LogLevel.WARN) {
            this.log('WARN', message, ...args);
        }
    }

    public error(message: string, error?: Error, ...args: any[]): void {
        if (this.logLevel <= LogLevel.ERROR) {
            this.log('ERROR', message, ...args);
            if (error) {
                this.log('ERROR', `Stack trace: ${error.stack}`);
            }
        }
    }

    private log(level: string, message: string, ...args: any[]): void {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level}] ${message}`;
        
        console.log(logMessage, ...args);
        this.outputChannel.appendLine(logMessage);
        
        if (args.length > 0) {
            this.outputChannel.appendLine(JSON.stringify(args, null, 2));
        }
    }

    public showOutput(): void {
        this.outputChannel.show();
    }

    public clear(): void {
        this.outputChannel.clear();
    }
}
