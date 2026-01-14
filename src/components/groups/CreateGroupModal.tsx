import React, { useState } from 'react';
import { useGroups } from '../../contexts/GroupContext';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { validateEmail } from '../../utils/validation';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupToEdit?: any;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  groupToEdit,
}) => {
  const { user } = useAuth();
  const { createGroup, updateGroup } = useGroups();
  const [name, setName] = useState(groupToEdit?.name || '');
  const [memberEmail, setMemberEmail] = useState('');
  const [members, setMembers] = useState<string[]>(groupToEdit?.members || (user?.email ? [user.email] : []));
  const [currency, setCurrency] = useState(groupToEdit?.currency || 'USD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddMember = () => {
    if (memberEmail && validateEmail(memberEmail) && !members.includes(memberEmail)) {
      setMembers([...members, memberEmail]);
      setMemberEmail('');
    }
  };

  const handleRemoveMember = (email: string) => {
    setMembers(members.filter(m => m !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || members.length === 0 || !user?.email) return;

    setIsSubmitting(true);
    try {
      if (groupToEdit) {
        await updateGroup(groupToEdit.group_id, {
          name,
          members,
          currency,
        });
      } else {
        await createGroup({
          name,
          created_by: user.email,
          members,
          currency,
          archived: false,
        });
      }
      onClose();
      // Reset form
      setName('');
      setMembers(user.email ? [user.email] : []);
      setMemberEmail('');
      setCurrency('USD');
    } catch (error) {
      console.error('Error saving group:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={groupToEdit ? 'Edit Group' : 'Create Group'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Group Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium mb-2">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="input"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
            <option value="JPY">JPY (¥)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Members</label>
          <div className="flex space-x-2 mb-2">
            <Input
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="Enter email"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMember();
                }
              }}
            />
            <Button type="button" onClick={handleAddMember} variant="secondary">
              Add
            </Button>
          </div>
          <div className="space-y-1">
            {members.map((email) => (
              <div key={email} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm">{email}</span>
                {email !== user?.email && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(email)}
                    className="text-red-600 text-sm hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-2 pt-4">
          <Button type="submit" variant="primary" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Saving...' : groupToEdit ? 'Update' : 'Create'}
          </Button>
          <Button type="button" onClick={onClose} variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};
