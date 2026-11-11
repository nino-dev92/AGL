import { supabase } from './supabase';

export async function logAudit(entry: {
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  actor?: string;
}) {
  await supabase.from('audit_log').insert({
    action: entry.action,
    entity_type: entry.entity_type,
    entity_id: entry.entity_id,
    description: entry.description,
    actor: entry.actor ?? 'Admin',
  });
}
