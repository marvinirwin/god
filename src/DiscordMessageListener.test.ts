import { DiscordBotImpl } from './DiscordBotImpl';
import { Command, DiscordMessageListenerImpl } from './DiscordMessageListener';
import { GoalManagerImpl, InMemoryGoalStore } from './GoalManager';
import { InsultGeneratorImpl } from './InsultGenerator';
import { InMemoryVoteStore, VoteManagerImpl } from './VoteManager';

describe('DiscordMessageListenerImpl', () => {
  let bot: DiscordBotImpl;
  let listener: DiscordMessageListenerImpl;

  beforeEach(() => {
    bot = new DiscordBotImpl(
    new GoalManagerImpl(new InMemoryGoalStore()), 
    new VoteManagerImpl(new InMemoryVoteStore()),
    new InsultGeneratorImpl()
    );
    listener = new DiscordMessageListenerImpl(bot);
  });

  it('should parse commands correctly', () => {
    const message = {
      content: 'createGoal goal dueDate',
      author: { id: 'userId' },
      channelId: 'channelId'
    };
    const command = listener.parseCommand(message);
    expect(command).toEqual(new Command('createGoal', 'userId', ['goal', 'dueDate'], 'channelId'));
  });

  // Add more tests here
});
