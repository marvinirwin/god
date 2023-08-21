import { Client, DMChannel, Message, TextChannel, Channel } from 'discord.js';
import { DiscordBotImpl } from './DiscordBotImpl';

// Interface for the DiscordMessageListener, which defines the methods for starting and stopping the listener
export interface DiscordMessageListener {
  startListening(): Promise<void>;
  stopListening(): Promise<void>;
}

// Class for the Command object, which is created from user messages
export class Command {
  constructor(
    public commandType: string, // The type of command, e.g., 'createGoal', 'castVote', 'checkGoal'
    public userId: string, // The ID of the user who sent the command
    public params: any // The parameters of the command, e.g., goal details, vote details
  ) { }
}

// Implementation of the DiscordMessageListener interface
export class DiscordMessageListenerImpl implements DiscordMessageListener {
  private bot: DiscordBotImpl; // The bot instance

  constructor(bot: DiscordBotImpl) {
    this.bot = bot; // Assign the bot instance
  }

  // Method to start the bot and listen for messages
  async startListening(): Promise<void> {
    await this.bot.start(); // Start the bot
    // Listen for 'messageCreate' events, parse the message into a Command, and handle the command
    this.bot.client.on('messageCreate', async (message: Message) => {
      const command = this.parseCommand(message);
      console.log(command)
      if (command) {
        await this.handleCommand(command);
      }
    });
    console.log('started listening');
    // List the channels the bot is listening on
    this.bot.client.on('ready', () => {
      // Your code here
      this.bot.client.channels.cache.forEach((channel) => {
        console.log(`Listening on channel: ${channel.id}`);
      });
    });
  }

  // Method to stop the bot
  stopListening(): Promise<void> {
    return this.bot.stop();
  }

  // Method to parse a message into a Command
  public parseCommand(message: { content: string, author: { id: string } }): Command | null {
    const parts = message.content.split(' '); // Split the message content into parts
    const commandType = parts[0]; // The first part is the command type
    const userId = message.author.id; // The author's ID is the user ID
    const params = parts.slice(1); // The rest of the parts are the command parameters

    return new Command(commandType, userId, params); // Return a new Command object
  }

  // Method to handle a Command
  private async handleCommand(command: Command): Promise<void> {
    switch (command.commandType) {
      case 'createGoal':
        // If the command is 'createGoal', create a goal and log the goal ID
        const goalId = await this.bot.handleGoalCommand(
          command.userId, command.params[0], new Date(command.params[1]));
        console.log(`Goal ${goalId} created.`);
        this.sendMessage(command.userId, `Goal ${goalId} created.`);
        break;
      case 'castVote':
        // If the command is 'castVote', cast a vote and log the user ID
        await this.bot.handleVoteCommand(command.userId, Number(command.params[0]), Boolean(command.params[1]));
        console.log(`Vote casted by ${command.userId}.`);
        this.sendMessage(command.userId, `Vote casted for goal ${command.params[0]} with choice ${command.params[1]}.`);
        break;
      case 'checkGoal':
        // If the command is 'checkGoal', check the goal and log the result
        const result = await this.bot.handleCheckCommand(command.userId, Number(command.params[0]));
        console.log(result);
        this.sendMessage(command.userId, `Goal ${command.params[0]} status: ${result}`);
        break;
      default:
        // If the command is unknown, log an error message
        console.log(`Unknown command: ${command.commandType}`);
        this.sendMessage(command.userId, `Unknown command: ${command.commandType}. Please check your command..`);
    }
  }

  // Method to send a message to a user
  private sendMessage(userId: string, message: string): void {
    const channel = this.bot.client.channels.cache.get(userId);
    if (this.isTextOrDMChannel(channel)) {
      channel.send(message);
    }
  }

  // Type guard for checking if a channel is a TextChannel or DMChannel
  private isTextOrDMChannel(channel: Channel): channel is TextChannel | DMChannel {
    return channel instanceof TextChannel || channel instanceof DMChannel;
  }
}

