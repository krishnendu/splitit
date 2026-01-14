import { sheetsClient } from './sheetsClient';
import { SHEET_NAMES, GROUPS_HEADERS } from '../../constants/sheetSchemas';
import type { Group } from '../../types';
import { v4 as uuidv4 } from 'uuid';

class GroupsService {
  private sheetName = SHEET_NAMES.GROUPS;

  private rowToGroup(row: string[]): Group | null {
    if (row.length < GROUPS_HEADERS.length) {
      return null;
    }

    let members: string[] = [];
    try {
      members = JSON.parse(row[3] || '[]');
    } catch {
      members = [];
    }

    return {
      group_id: row[0] || '',
      name: row[1] || '',
      created_by: row[2] || '',
      members,
      currency: row[4] || 'USD',
      image_url: row[5] || undefined,
      created_at: row[6] || new Date().toISOString(),
      archived: row[7] === 'true',
    };
  }

  private groupToRow(group: Group): string[] {
    return [
      group.group_id,
      group.name,
      group.created_by,
      JSON.stringify(group.members),
      group.currency,
      group.image_url || '',
      group.created_at,
      group.archived ? 'true' : 'false',
    ];
  }

  async create(group: Omit<Group, 'group_id' | 'created_at'>): Promise<Group> {
    const newGroup: Group = {
      ...group,
      group_id: uuidv4(),
      created_at: new Date().toISOString(),
    };

    const row = this.groupToRow(newGroup);
    await sheetsClient.appendRange(`${this.sheetName}!A:H`, [row]);

    return newGroup;
  }

  async readAll(): Promise<Group[]> {
    const rows = await sheetsClient.readRange(`${this.sheetName}!A2:H`);
    
    return rows
      .map(row => this.rowToGroup(row))
      .filter((group): group is Group => group !== null && !group.archived);
  }

  async readById(groupId: string): Promise<Group | null> {
    const groups = await this.readAll();
    return groups.find(g => g.group_id === groupId) || null;
  }

  async readByUserEmail(userEmail: string): Promise<Group[]> {
    const groups = await this.readAll();
    return groups.filter(g => g.members.includes(userEmail));
  }

  async update(groupId: string, updates: Partial<Group>): Promise<Group | null> {
    const groups = await this.readAll();
    const groupIndex = groups.findIndex(g => g.group_id === groupId);

    if (groupIndex === -1) {
      return null;
    }

    const updatedGroup: Group = {
      ...groups[groupIndex],
      ...updates,
      group_id: groupId,
    };

    const row = this.groupToRow(updatedGroup);
    await sheetsClient.writeRange(`${this.sheetName}!A${groupIndex + 2}:H${groupIndex + 2}`, [row]);

    return updatedGroup;
  }

  async addMember(groupId: string, userEmail: string): Promise<Group | null> {
    const group = await this.readById(groupId);
    if (!group) {
      return null;
    }

    if (group.members.includes(userEmail)) {
      return group; // Already a member
    }

    return this.update(groupId, {
      members: [...group.members, userEmail],
    });
  }

  async removeMember(groupId: string, userEmail: string): Promise<Group | null> {
    const group = await this.readById(groupId);
    if (!group) {
      return null;
    }

    return this.update(groupId, {
      members: group.members.filter(email => email !== userEmail),
    });
  }

  async delete(groupId: string): Promise<boolean> {
    // Soft delete by archiving
    const result = await this.update(groupId, { archived: true });
    return result !== null;
  }
}

export const groupsService = new GroupsService();
