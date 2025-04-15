import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';

interface Paper {
  _id: string;
  title: string;
  abstract: string;
  fileUrl: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  conference: string;
}

interface Conference {
  _id: string;
  title: string;
  description: string;
  image: string;
  eventDates: {
    start: string;
    end: string;
  };
  submissionDeadline: string;
  papers: Paper[];
}

export default function ConferenceDetail() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [conference, setConference] = useState<Conference | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchConference();
    }
  }, [id]);

  const fetchConference = async () => {
    try {
      const res = await fetch(`/api/conferences/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch conference');
      }
      const data = await res.json();
      setConference(data);
    } catch (error) {
      setError('Failed to load conference details');
      console.error('Error fetching conference:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !conference) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600">{error || 'Conference not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{conference.title} - Conference Details</title>
        <meta name="description" content={conference.description} />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              ← Back to Conferences
            </Link>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {/* Conference Header */}
            <div className="px-4 py-5 sm:px-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{conference.title}</h3>
                {session && (
                  <Link
                    href={`/conferences/${id}/submit-paper`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Submit Paper
                  </Link>
                )}
              </div>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {format(new Date(conference.eventDates.start), 'MMMM d, yyyy')} -{' '}
                {format(new Date(conference.eventDates.end), 'MMMM d, yyyy')}
              </p>
            </div>

            {/* Conference Details */}
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {conference.description}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Submission Deadline</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {format(new Date(conference.submissionDeadline), 'MMMM d, yyyy')}
                  </dd>
                </div>
                {conference.image && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Conference Image</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <img
                        src={conference.image}
                        alt={conference.title}
                        className="h-32 w-auto object-cover rounded-lg"
                      />
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Papers Section */}
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">Submitted Papers</h4>
                {session && (
                  <Link
                    href={`/conferences/${id}/submit-paper`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Submit Paper
                  </Link>
                )}
              </div>
              {conference.papers && conference.papers.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {conference.papers.map((paper) => (
                    <div
                      key={paper._id}
                      className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="p-6">
                        <h5 className="text-lg font-medium text-gray-900 mb-2">{paper.title}</h5>
                        <div className="flex items-center mb-4">
                          <span className="text-sm text-gray-500">
                            By {paper.author.name}
                          </span>
                        </div>
                        <div className="mb-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              paper.status === 'accepted'
                                ? 'bg-green-100 text-green-800'
                                : paper.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {paper.status.charAt(0).toUpperCase() + paper.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-3">{paper.abstract}</p>
                      </div>
                      <div className="bg-gray-50 px-6 py-4">
                        <div className="mt-4 flex justify-between items-center">
                          <a
                            href={`/api/papers/${paper._id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Paper
                          </a>
                          {session?.user?.id === paper.author._id && (
                            <Link
                              href={`/papers/${paper._id}/edit`}
                              className="text-sm text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No papers submitted yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Be the first to submit a paper to this conference.
                  </p>
                  {session && (
                    <div className="mt-6">
                      <Link
                        href={`/conferences/${id}/submit-paper`}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Submit Paper
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 