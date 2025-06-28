
import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { getExhibitionSettings, updateExhibitionSettings, type ExhibitionSettings } from '../../services/settingsService';

export const SettingsManager = () => {
  const [settings, setSettings] = useState<ExhibitionSettings>({
    marqueeMessages: [''],
    marqueeSpeed: 5,
    marqueeColor: '#1e40af',
    welcomeMessage: '',
    contactInfo: {
      phone: '',
      email: '',
      address: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getExhibitionSettings();
      setSettings(data);
    } catch (err) {
      setError('Failed to load settings');
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateExhibitionSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update settings');
      console.error('Error updating settings:', err);
    }
  };

  const addMarqueeMessage = () => {
    setSettings({
      ...settings,
      marqueeMessages: [...settings.marqueeMessages, '']
    });
  };

  const removeMarqueeMessage = (index: number) => {
    if (settings.marqueeMessages.length > 1) {
      const newMessages = settings.marqueeMessages.filter((_, i) => i !== index);
      setSettings({
        ...settings,
        marqueeMessages: newMessages
      });
    }
  };

  const updateMarqueeMessage = (index: number, value: string) => {
    const newMessages = [...settings.marqueeMessages];
    newMessages[index] = value;
    setSettings({
      ...settings,
      marqueeMessages: newMessages
    });
  };

  const updateContactInfo = (field: keyof ExhibitionSettings['contactInfo'], value: string) => {
    setSettings({
      ...settings,
      contactInfo: {
        ...settings.contactInfo,
        [field]: value
      }
    });
  };

  if (loading) return <div className="text-center py-4">Loading settings...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Exhibition Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Welcome Message
              </label>
              <input
                type="text"
                value={settings.welcomeMessage}
                onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Welcome message"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={settings.contactInfo.phone}
                onChange={(e) => updateContactInfo('phone', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Phone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={settings.contactInfo.email}
                onChange={(e) => updateContactInfo('email', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Address
              </label>
              <input
                type="text"
                value={settings.contactInfo.address}
                onChange={(e) => updateContactInfo('address', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Address"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Marquee Settings</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marquee Speed (1 = fastest, 10 = slowest)
              </label>
              <input
                type="range"
                value={settings.marqueeSpeed}
                onChange={(e) => setSettings({ ...settings, marqueeSpeed: Number(e.target.value) })}
                className="w-full"
                min="1"
                max="10"
                step="1"
              />
              <div className="text-sm text-gray-500 mt-1">
                Current speed: {settings.marqueeSpeed}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banner Color
              </label>
              <input
                type="color"
                value={settings.marqueeColor}
                onChange={(e) => setSettings({ ...settings, marqueeColor: e.target.value })}
                className="w-full h-10 px-1 py-1 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marquee Messages
              </label>
              {settings.marqueeMessages.map((message, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => updateMarqueeMessage(index, e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg"
                    placeholder="Enter message"
                  />
                  {settings.marqueeMessages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMarqueeMessage(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addMarqueeMessage}
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Message
              </button>
            </div>
          </div>

          {error && <div className="text-red-600">{error}</div>}
          {success && <div className="text-green-600">Settings updated successfully!</div>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Save All Settings
          </button>
        </form>
      </div>
    </div>
  );
};
