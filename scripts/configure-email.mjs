import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline';

const project = 'yjrviglirxoqsrycsuay';
const domain = 'auth.servicevigevano.store';
const mode = process.argv[2] ?? 'inspect';
if (!['inspect', 'prepare-domain', 'verify-domain', 'prepare-auth', 'activate'].includes(mode)) throw new Error('Operazione non supportata');

if (process.stdin.isTTY) process.stdin.setRawMode(true);
const input = createInterface({ input: process.stdin, terminal: false });
const key = await new Promise((resolve, reject) => {
  input.once('line', (line) => {
    resolve(line.trim());
    input.close();
    if (process.stdin.isTTY) process.stdin.setRawMode(false);
    process.stdin.pause();
  });
  input.once('close', () => reject(new Error('Chiave non ricevuta')));
});
if (!/^re_[A-Za-z0-9_]+$/.test(key)) throw new Error('Formato chiave non valido');

async function request(base, path, token, method = 'GET', body) {
  const response = await fetch(`${base}${path}`, {
    method, redirect: 'error', signal: AbortSignal.timeout(25000),
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${String(data.message ?? data.error ?? data.name ?? 'richiesta non riuscita').replaceAll(token, '[redacted]')}`);
  return data;
}

try {
  const resend = (path, method, body) => request('https://api.resend.com', path, key, method, body);
  let domains = { data: [] };
  if (mode !== 'prepare-auth') {
    try { domains = await resend('/domains'); }
    catch (error) {
      if (mode !== 'inspect') throw error;
      console.log(JSON.stringify({ resendDomainAccess: error.message }));
    }
  }
  console.log(JSON.stringify({ domains: domains.data.map(({ id, name, status, region }) => ({ id, name, status, region })) }));
  let selected = domains.data.find(({ name }) => name === domain);
  if (mode === 'prepare-domain' && !selected) {
    selected = await resend('/domains', 'POST', { name: domain, region: 'eu-west-1', capabilities: { sending: 'enabled', receiving: 'disabled' } });
  }
  if (mode === 'prepare-domain' && selected) {
    await resend(`/domains/${selected.id}`, 'PATCH', { open_tracking: false, click_tracking: false });
  }
  if (mode === 'verify-domain' && selected) await resend(`/domains/${selected.id}/verify`, 'POST');
  if (selected) {
    selected = await resend(`/domains/${selected.id}`);
    console.log(JSON.stringify({ domain: selected }));
  }
  const accessToken = (await readFile(join(homedir(), '.supabase', 'access-token'), 'utf8')).trim();
  if (!accessToken.startsWith('sbp_')) throw new Error('Accesso Supabase locale non disponibile');
  const auth = (method, body) => request('https://api.supabase.com', `/v1/projects/${project}/config/auth`, accessToken, method, body);
  let config = await auth('GET');
  if (mode === 'prepare-auth') {
    const redirect = new Set((config.uri_allow_list ?? '').split(',').filter(Boolean));
    redirect.add('https://servicevigevano.store/admin');
    redirect.add('http://127.0.0.1:5173/admin');
    await auth('PATCH', {
      site_url: 'https://servicevigevano.store', uri_allow_list: [...redirect].join(','),
    });
    config = await auth('GET');
    if (config.site_url !== 'https://servicevigevano.store' || !config.uri_allow_list.includes('https://servicevigevano.store/admin')) throw new Error('URL remoti non confermati');
  }
  if (mode === 'activate') {
    if (selected?.status !== 'verified') throw new Error('Dominio mittente non ancora verificato: SMTP non modificato');
    const redirect = new Set((config.uri_allow_list ?? '').split(',').filter(Boolean));
    redirect.add('https://servicevigevano.store/admin');
    redirect.add('http://127.0.0.1:5173/admin');
    const template = await readFile(new URL('../supabase/templates/recovery.html', import.meta.url), 'utf8');
    await auth('PATCH', {
      smtp_host: 'smtp.resend.com', smtp_port: 465, smtp_user: 'resend', smtp_pass: key,
      smtp_admin_email: `noreply@${domain}`, smtp_sender_name: 'SERVICE SRL',
      site_url: 'https://servicevigevano.store', uri_allow_list: [...redirect].join(','),
      mailer_subjects_recovery: 'Reimposta la password — SERVICE SRL', mailer_templates_recovery_content: template,
    });
    config = await auth('GET');
  }
  // Non stampare mai la configurazione completa: contiene credenziali server.
  console.log(JSON.stringify({ supabase: {
    smtpConfigured: Boolean(config.smtp_host), host: config.smtp_host,
    sender: config.smtp_admin_email, siteUrl: config.site_url, redirects: config.uri_allow_list,
    recoverySubject: config.mailer_subjects_recovery,
  } }));
} catch (error) {
  console.error(error.message.replaceAll(key, '[redacted]'));
  process.exitCode = 1;
}
