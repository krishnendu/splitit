import { sheetsClient } from './sheetsClient';
import { SHEET_NAMES, COMMENTS_HEADERS } from '../../constants/sheetSchemas';
import type { Comment, CommentRow } from '../../types';
import { v4 as uuidv4 } from 'uuid';

class CommentsService {
  private sheetName = SHEET_NAMES.COMMENTS;

  private rowToComment(row: string[]): Comment | null {
    if (row.length < COMMENTS_HEADERS.length) {
      return null;
    }

    return {
      comment_id: row[0] || '',
      expense_id: row[1] || '',
      user_id: row[2] || '',
      text: row[3] || '',
      timestamp: row[4] || new Date().toISOString(),
    };
  }

  private commentToRow(comment: Comment): string[] {
    return [
      comment.comment_id,
      comment.expense_id,
      comment.user_id,
      comment.text,
      comment.timestamp,
    ];
  }

  async create(comment: Omit<Comment, 'comment_id' | 'timestamp'>): Promise<Comment> {
    const newComment: Comment = {
      ...comment,
      comment_id: uuidv4(),
      timestamp: new Date().toISOString(),
    };

    const row = this.commentToRow(newComment);
    await sheetsClient.appendRange(`${this.sheetName}!A:E`, [row]);

    return newComment;
  }

  async readAll(): Promise<Comment[]> {
    const rows = await sheetsClient.readRange(`${this.sheetName}!A2:E`);
    
    return rows
      .map(row => this.rowToComment(row))
      .filter((comment): comment is Comment => comment !== null);
  }

  async readByExpenseId(expenseId: string): Promise<Comment[]> {
    const comments = await this.readAll();
    return comments.filter(c => c.expense_id === expenseId);
  }
}

export const commentsService = new CommentsService();
