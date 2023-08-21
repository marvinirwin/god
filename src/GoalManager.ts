export interface Goal {
  userId: string;
  description: string;
  dueDate: Date;
  id: number;
}
export interface GoalStore {
  save(goal: Goal): Promise<number>;
  delete(id: number): Promise<void>;
  get(id: number): Promise<Goal | null>;
}

export class InMemoryGoalStore implements GoalStore {
  private store: Map<number, Goal> = new Map();

  async save(goal: Goal): Promise<number> {
    this.store.set(goal.id, goal);
    return goal.id;
  }

  async delete(id: number): Promise<void> {
    this.store.delete(id);
  }

  async get(id: number): Promise<Goal | null> {
    return this.store.get(id) || null;
  }
}

export class JSONGoalStore implements GoalStore {
  private store: Goal[] = [];
  private fs = require('fs');
  private jsonFile = 'goals.json';

  constructor() {
    if (this.fs.existsSync(this.jsonFile)) {
      this.store = JSON.parse(this.fs.readFileSync(this.jsonFile));
    }
  }

  async save(goal: Goal): Promise<number> {
    this.store.push(goal);
    this.fs.writeFileSync(this.jsonFile, JSON.stringify(this.store));
    return goal.id;
  }

  async delete(id: number): Promise<void> {
    this.store = this.store.filter(goal => goal.id !== id);
    this.fs.writeFileSync(this.jsonFile, JSON.stringify(this.store));
  }

  async get(id: number): Promise<Goal | null> {
    const goal = this.store.find(goal => goal.id === id);
    return goal || null;
  }
}
export interface GoalManager {
  createGoal(userId: string, goal: string, dueDate: Date): Promise<number>;
  deleteGoal(goalId: number): Promise<void>;
  getGoal(goalId: number): Promise<Goal | null>;
}

export class GoalManagerImpl implements GoalManager {
  constructor(private goalStore: GoalStore) {}

  async createGoal(userId: string, goal: string, dueDate: Date): Promise<number> {
    const id = Math.floor(Math.random() * 10000);
    const newGoal = {userId, dueDate, id, description: goal};
    return this.goalStore.save(newGoal);
  }

  deleteGoal(goalId: number): Promise<void> {
    return this.goalStore.delete(goalId);
  }

  getGoal(goalId: number): Promise<Goal | null> {
    return this.goalStore.get(goalId);
  }
}
