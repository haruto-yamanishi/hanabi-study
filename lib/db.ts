'use client';
import Dexie, { type Table } from 'dexie';
import { Evidence } from './types';

class MasteryDB extends Dexie {
  evidence!: Table<Evidence,string>;
  constructor(){
    super('HanabiStudy');
    this.version(1).stores({ evidence:'id,skillId,kind,aiUse,createdAt' });
  }
}
export const db = typeof window !== 'undefined' ? new MasteryDB() : null;
