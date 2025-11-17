import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, profile: initialProfile, loadProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: initialProfile?.full_name || '',
    company_name: initialProfile?.company_name || 'GIGEO Enterprises',
    company_address: initialProfile?.company_address || '',
    gstin: initialProfile?.gstin || '',
    signature_url: initialProfile?.signature_url || '',
  });

  useEffect(() => {
    if (initialProfile) {
      setProfile({
        full_name: initialProfile.full_name || '',
        company_name: initialProfile.company_name || 'GIGEO Enterprises',
        company_address: initialProfile.company_address || '',
        gstin: initialProfile.gstin || '',
        signature_url: initialProfile.signature_url || '',
      });
    }
  }, [initialProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          ...profile,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      await loadProfile();
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `signatures/${user?.id}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('signatures')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('signatures')
        .getPublicUrl(filePath);

      setProfile({ ...profile, signature_url: publicUrl });
    } catch (error: any) {
      toast.error('Error uploading signature');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Building2 className="h-8 w-8 text-emerald-600" />
            <h1 className="ml-2 text-2xl font-bold text-gray-900">Profile</h1>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                  type="text"
                  value={profile.company_name}
                  onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Company Address</label>
                <textarea
                  value={profile.company_address}
                  onChange={(e) => setProfile({ ...profile, company_address: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">GSTIN</label>
                <input
                  type="text"
                  value={profile.gstin}
                  onChange={(e) => setProfile({ ...profile, gstin: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Signature</label>
                <div className="mt-1 flex items-center space-x-4">
                  {profile.signature_url && (
                    <img
                      src={profile.signature_url}
                      alt="Signature"
                      className="h-20 object-contain"
                    />
                  )}
                  <label className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Signature
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}