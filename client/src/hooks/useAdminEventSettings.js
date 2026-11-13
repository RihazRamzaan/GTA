import { useEffect, useState } from 'react';
import { getAdminSettings, updateAdminSettings } from '../api/admin.js';
import { getApiError } from '../api/http.js';
import { refreshEventSettings } from './useEventSettings.js';

export default function useAdminEventSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const response = await getAdminSettings();
        if (!cancelled) setSettings(response.data.data);
      } catch (err) { if (!cancelled) setError(getApiError(err).message); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [retry]);
  async function save(payload) {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await updateAdminSettings(payload);
      setSettings(response.data.data);
      refreshEventSettings();
      setNotice('Saved to the database. Public pages now use these values.');
    } catch (err) { setError(getApiError(err).message); }
    finally { setSaving(false); }
  }
  return { settings, setSettings, loading, saving, error, notice, setNotice, save, reload: () => setRetry(value => value + 1) };
}
