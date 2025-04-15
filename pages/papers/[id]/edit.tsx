import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import FileUpload from '../../../components/FileUpload';
import Link from 'next/link';

interface Paper {
  _id: string;
  title: string;
  abstract: string;
  fileUrl: string;
  author: {
    _id: string;
    email: string;
  };
  conference: string;
}

export default function EditPaper() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [paper, setPaper] = useState<Paper | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [existingFile, setExistingFile] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchPaper = async () => {
      if (!id) return;
      
      try {
        const response = await fetch(`/api/papers/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch paper');
        }
        const data = await response.json();
        setPaper(data);
        setFormData({
          title: data.title,
          abstract: data.abstract,
        });
        setExistingFile(data.fileUrl);
      } catch (error) {
        console.error('Error fetching paper:', error);
        setError('Failed to load paper');
      }
    };

    fetchPaper();
  }, [id]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!paper) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Loading paper...</p>
        </div>
      </div>
    );
  }

  if (session.user.id !== paper.author._id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">You are not authorized to edit this paper</p>
        </div>
      </div>
    );
  }

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    if (selectedFile) {
      setExistingFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let fileUrl = paper.fileUrl;

      // If a new file was uploaded, handle the file upload first
      if (file) {
        // Convert file to base64
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        const fileData = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
        });

        // Upload the file through our API
        const uploadResponse = await fetch('/api/papers/upload-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            fileData,
          }),
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload file');
        }

        const { fileUrl: newFileUrl } = await uploadResponse.json();
        fileUrl = newFileUrl;
      }

      // Update the paper record
      const response = await fetch(`/api/papers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          abstract: formData.abstract,
          fileUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update paper');
      }

      router.push(`/conferences/${paper.conference}`);
    } catch (error) {
      console.error('Error updating paper:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while updating the paper');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this paper? This action cannot be undone.')) {
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/papers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete paper');
      }

      router.push(`/conferences/${paper.conference}`);
    } catch (error) {
      console.error('Error deleting paper:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while deleting the paper');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Edit Paper</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <Link
              href={`/conferences/${paper.conference}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              ← Back to Conference
            </Link>
          </div>
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Paper</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Update your paper details and upload a new version if needed.</p>
              </div>
              <form onSubmit={handleSubmit} className="mt-5 space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="abstract" className="block text-sm font-medium text-gray-700">
                    Abstract
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="abstract"
                      name="abstract"
                      rows={4}
                      value={formData.abstract}
                      onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paper File
                  </label>
                  {existingFile && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-600">
                        Current file: <span className="font-medium">{existingFile.split('/').pop()}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Upload a new file to replace the existing one
                      </p>
                    </div>
                  )}
                  <FileUpload
                    onFileSelect={(file) => handleFileChange(file)}
                    accept=".pdf,.doc,.docx"
                    maxSize={10 * 1024 * 1024}
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 