import { useState, type FormEvent } from "react";
import { errorMessage } from "../lib/api";
import { humanize } from "../lib/format";
import { createAdmin, updateAdmin } from "../lib/superAdminApi";
import type { AdminUser, UpdateAdminInput } from "../lib/types";
import { Modal } from "./Modal";

type AdminFormModalProps = {
  admin: AdminUser | null;
  roles: string[];
  isSelf: boolean;
  onClose: () => void;
  onSaved: () => void;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AdminFormModal({ admin, roles, isSelf, onClose, onSaved }: AdminFormModalProps) {
  const isNew = admin === null;
  const [name, setName] = useState(admin?.name ?? "");
  const [email, setEmail] = useState(admin?.email ?? "");
  const [role, setRole] = useState(admin?.role ?? "admin");
  const [active, setActive] = useState(admin?.active ?? true);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleOptions = roles.includes(role) ? roles : [role, ...roles];

  const validate = (): string | null => {
    if (!name.trim()) return "Enter a name.";
    if (name.trim().length > 120) return "Name must be 120 characters or fewer.";
    if (isNew && !EMAIL_PATTERN.test(email.trim())) return "Enter a valid email address.";
    if (isNew && password.length < 8) return "Password must be at least 8 characters.";
    if (!isNew && password && password.length < 8) return "New password must be at least 8 characters.";
    if (password.length > 100) return "Password must be 100 characters or fewer.";
    return null;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        await createAdmin({ name: name.trim(), email: email.trim(), password, role, active });
      } else {
        const changes: UpdateAdminInput = { name: name.trim() };
        if (!isSelf) {
          changes.role = role;
          changes.active = active;
        }
        if (password) changes.password = password;
        await updateAdmin(admin.id, changes);
      }
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isNew ? "Add admin" : `Edit ${admin.name?.trim() || admin.email}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" form="admin-form" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : isNew ? "Add admin" : "Save changes"}
          </button>
        </>
      }
    >
      <form id="admin-form" className="form" onSubmit={onSubmit} noValidate>
        {error ? (
          <div className="alert alert-error" role="alert">
            <span>{error}</span>
          </div>
        ) : null}

        <label className="field">
          <span className="field-label">Name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} autoFocus />
        </label>

        <label className="field">
          <span className="field-label">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={!isNew}
            placeholder="name@flintnthread.in"
          />
          {!isNew ? <span className="field-hint">Email can't be changed.</span> : null}
        </label>

        <label className="field">
          <span className="field-label">Role</span>
          <select value={role} onChange={(event) => setRole(event.target.value)} disabled={isSelf}>
            {roleOptions.map((value) => (
              <option key={value} value={value}>
                {humanize(value)}
              </option>
            ))}
          </select>
        </label>

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            disabled={isSelf}
          />
          <span>Active (can sign in)</span>
        </label>

        {isSelf ? (
          <p className="field-hint">
            You can't change your own role or turn off your own access. Ask another super admin to do it.
          </p>
        ) : null}

        <label className="field">
          <span className="field-label">{isNew ? "Password" : "New password"}</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={isNew ? "At least 8 characters" : "Leave empty to keep the current password"}
          />
        </label>
      </form>
    </Modal>
  );
}
