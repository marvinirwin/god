import { Client, Partials, GatewayIntentBits} from 'discord.js';
import { GoalManager, GoalManagerImpl } from './GoalManager';
import { VoteManager, VoteManagerImpl } from './VoteManager';
import { InsultGenerator } from './InsultGenerator';

export class DiscordBotImpl {
  public client: Client;
  private goalManager: GoalManager;
  private voteManager: VoteManager;
  private insultGenerator: InsultGenerator;

  constructor(
    goalManager: GoalManager, 
    voteManager: VoteManager, 
    insultGenerator: InsultGenerator,
    ) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    this.goalManager = goalManager;
    this.voteManager = voteManager;
    this.insultGenerator = insultGenerator;
  }

  async start() {
    return this.client.login(process.env.DISCORD_LOGIN_TOKEN);
  }

  async stop(): Promise<void> {
    this.client.destroy();
  }

  async handleGoalCommand(userId: string, goal: string, dueDate: Date): Promise<number> {
    return this.goalManager.createGoal(userId, goal, dueDate);
  }

  async handleVoteCommand(userId: string, goalId: number, vote: boolean): Promise<void> {
    this.voteManager.castVote(userId, goalId, vote);
  }

  async handleCheckCommand(userId: string, goalId: number): Promise<string> {
    const goal = await this.goalManager.getGoal(goalId);
    const [forCount, againstCount] = await this.voteManager.tallyVotes(goalId);
    const result = forCount > againstCount;
    const message = `For: ${forCount}, Against: ${againstCount}`;

    return result ? message : `Vote is not completed. ${message}`;
  }
}
