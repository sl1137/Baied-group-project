import { useState } from 'react';
import { useLang } from '../../../context/LangContext';
import { login, register } from '../../../utils/auth';
import styles from './AuthView.module.css';

interface Props {
  onAuth: (username: string) => void;
}

export default function AuthView({ onAuth }: Props) {
  const { tr } = useLang();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (loading) return;
    setError(null);
    setLoading(true);
    const err = mode === 'signin'
      ? await login(username, password)
      : await register(username, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      onAuth(username.trim());
    }
  }

  function switchMode() {
    setMode(m => m === 'signin' ? 'signup' : 'signin');
    setError(null);
    setUsername('');
    setPassword('');
  }

  const isSignIn = mode === 'signin';

  return (
    <div className={styles.page}>
      <div className={styles.logo}>
        <div className={styles.logoMark}>
          <svg width="16" height="18" viewBox="0 0 16 20" fill="none">
            <path d="M9 1L0 11H7L7 19L16 9H9L9 1Z" fill="white" />
          </svg>
        </div>
        <span className={styles.logoText}>Mini<b>Knowledge</b></span>
      </div>

      <div className={styles.card}>
        <h1 className={styles.title}>{isSignIn ? tr.signInTitle : tr.signUpTitle}</h1>
        <p className={styles.sub}>{isSignIn ? tr.signInSub : tr.signUpSub}</p>

        <div className={styles.fields}>
          <input
            className={styles.input}
            type="text"
            placeholder={tr.usernamePlaceholder}
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoComplete="username"
            autoFocus
          />
          <input
            className={styles.input}
            type="password"
            placeholder={tr.passwordPlaceholder}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoComplete={isSignIn ? 'current-password' : 'new-password'}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
          {loading ? '…' : (isSignIn ? tr.signInBtn : tr.signUpBtn)}
        </button>

        <button className={styles.switchBtn} onClick={switchMode}>
          {isSignIn ? tr.toSignUp : tr.toSignIn}
        </button>
      </div>
    </div>
  );
}
