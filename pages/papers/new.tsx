import React, { useState } from 'react';
import { useRouter } from 'next/router';

const NewPaper: React.FC = () => {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!selectedFile) {
        throw new Error('Please select a file to upload');
      }

      // First, get the upload URL from our API
      const uploadUrlResponse = await fetch('/api/papers/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          contentType: selectedFile.type,
        }),
      });

      if (!uploadUrlResponse.ok) {
        const errorData = await uploadUrlResponse.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }

      const { uploadUrl, authorizationToken, fileName } = await uploadUrlResponse.json();

      // Upload the file directly to Backblaze B2
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': authorizationToken,
          'Content-Type': selectedFile.type,
          'X-Bz-File-Name': fileName,
          'X-Bz-Content-Sha1': 'do_not_verify',
        },
        body: selectedFile,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to storage');
      }

      const uploadData = await uploadResponse.json();

      // Create the paper record in our database
      const response = await fetch('/api/papers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          abstract,
          fileUrl: `https://f002.backblazeb2.com/file/${process.env.NEXT_PUBLIC_BACKBLAZE_BUCKET_NAME}/${fileName}`,
          conferenceId: router.query.conferenceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create paper record');
      }

      router.push('/papers');
    } catch (err) {
      console.error('Error in paper submission:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while submitting the paper');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Render your form here */}
    </div>
  );
};

export default NewPaper; 