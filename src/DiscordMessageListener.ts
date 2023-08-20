import { Client, Message } from 'discord.js';
import { DiscordBotImpl } from './DiscordBotImpl';

/**
 * Interface for the DiscordMessageListener block.
 */
export interface DiscordMessageListener {
  startListening(): Promise<void>;
  stopListening(): Promise<void>;
}

/**
 * The Command class represents a command from a user.
 */
export class Command {
  constructor(
    public commandType: string,
    public userId: string,
    public params: any
  ) {}
}

export class DiscordMessageListenerImpl implements DiscordMessageListener {
  private bot: DiscordBotImpl;

  constructor(bot: DiscordBotImpl) {
    this.bot = bot;
  }

  async startListening(): Promise<void> {
    await this.bot.start();
    this.bot.client.on('messageCreate', async (message: Message) => {
      const command = this.parseCommand(message);
      if (command) {
        await this.handleCommand(command);
      }
    });
  }

  stopListening(): Promise<void> {
    return this.bot.stop();
  }

  public parseCommand(message: {content: string, author: {id: string}}): Command | null {
    const parts = message.content.split(' ');
    const commandType = parts[0];
    const userId = message.author.id;
    const params = parts.slice(1);

    return new Command(commandType, userId, params);
  }

  private async handleCommand(command: Command): Promise<void> {
    switch (command.commandType) {
      case 'createGoal':
        const goalId = await this.bot.handleGoalCommand(command.userId, command.params[0], new Date(command.params[1]));
        console.log(`Goal ${goalId} created.`);
        break;
      case 'castVote':
        await this.bot.handleVoteCommand(command.userId, Number(command.params[0]), Boolean(command.params[1]));
        console.log(`Vote casted by ${command.userId}.`);
        break;
      case 'checkGoal':
        const result = await this.bot.handleCheckCommand(command.userId, Number(command.params[0]));
        console.log(result);
        break;
      default:
        console.log(`Unknown command: ${command.commandType}`);
    }
  }
}
