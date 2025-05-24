export class Logger {
  private static instance: Logger;
  private messages: string[] = [];

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public reset() {
    this.messages = [];
  }

  public log(message: string) {
    this.messages.push(message);
    console.log(message);
  }

  public warn(message: string) {
    this.messages.push(message);
    console.warn(message);
  }

  public error(message: string) {
    this.messages.push(message);
    console.error(message);
  }

  public info(message: string) {
    this.messages.push(message);
    console.info(message);
  }

  public getMessages() {
    return this.messages;
  }
}

export const logger = Logger.getInstance();
