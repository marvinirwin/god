import dotenv from 'dotenv';
dotenv.config();
import { DiscordBotImpl } from "./DiscordBotImpl";
import { GoalManagerImpl, JSONGoalStore } from "./GoalManager";
import { InsultGeneratorImpl } from "./InsultGenerator";
import { JSONVoteStore, VoteManagerImpl } from "./VoteManager";
import { DiscordMessageListenerImpl } from './DiscordMessageListener';

 const goalManager = new GoalManagerImpl(new JSONGoalStore());
 const voteManager = new VoteManagerImpl(new JSONVoteStore());
 const insultGenerator = new InsultGeneratorImpl();
 const discordBot = new DiscordBotImpl(
    goalManager, 
    voteManager, 
    insultGenerator,
);
 const listener = new DiscordMessageListenerImpl(discordBot);
 listener.startListening()

