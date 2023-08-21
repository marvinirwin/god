export interface VoteStore {
  save(vote: Vote): Promise<void>;
  getVotes(goalId: number): Promise<Vote[]>;
}

export class InMemoryVoteStore implements VoteStore {
  private votes: Vote[] = [];

  async save(vote: Vote): Promise<void> {
    this.votes.push(vote);
  }

  async getVotes(goalId: number): Promise<Vote[]> {
    return this.votes.filter(vote => vote.goalId === goalId);
  }
}
export class JSONVoteStore implements VoteStore {
  private votes: Vote[] = [];
  private fs = require('fs');
  private jsonFile = 'votes.json';

  constructor() {
    if (this.fs.existsSync(this.jsonFile)) {
      this.votes = JSON.parse(this.fs.readFileSync(this.jsonFile));
    }
  }

  async save(vote: Vote): Promise<void> {
    this.votes.push(vote);
    this.fs.writeFileSync(this.jsonFile, JSON.stringify(this.votes));
  }

  async getVotes(goalId: number): Promise<Vote[]> {
    return this.votes.filter(vote => vote.goalId === goalId);
  }
}
export interface VoteManager {
  castVote(userId: string, goalId: number, vote: boolean): Promise<void>;
  tallyVotes(goalId: number): Promise<[number, number]>;
}

export class VoteManagerImpl implements VoteManager {
  constructor(private voteStore: VoteStore) {}

  async castVote(userId: string, goalId: number, vote: boolean): Promise<void> {
    const voteObj = {userId, goalId, vote};
    await this.voteStore.save(voteObj);
  }

  async tallyVotes(goalId: number): Promise<[number, number]> {
    const votes = await this.voteStore.getVotes(goalId);
    return [votes.filter(vote => vote.vote).length, votes.filter(vote => !vote.vote).length];
  }
}

export interface Vote {
  userId: string;
  goalId: number;
  vote: boolean;
}