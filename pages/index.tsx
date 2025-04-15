import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import { Conference } from '../lib/models';

interface ConferenceType {
  _id: string;
  title: string;
  description: string;
  image: string;
  eventDates: {
    start: string;
    end: string;
  };
  submissionDeadline: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conferences, setConferences] = useState<ConferenceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchConferences = async () => {
      try {
        const res = await fetch('/api/conferences');
        const data = await res.json();
        setConferences(data);
      } catch (error) {
        console.error('Error fetching conferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConferences();
  }, []);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Scientific Conferences - Submit Your Manuscript</title>
        <meta name="description" content="Submit your scientific manuscript to top conferences" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Banner */}
        <div className="bg-indigo-600">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to submit your manuscript?</span>
              <span className="block text-indigo-200">Choose from our curated list of scientific conferences.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link
                  href="/conferences/new"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
                >
                  Create Conference
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Conference Grid */}
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {conferences.map((conference) => (
              <div
                key={conference._id}
                className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
              >
                <div className="relative h-48">
                  <img
                    className="w-full h-full object-cover"
                    src={conference.image}
                    alt={conference.title}
                  />
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">{conference.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">{conference.description}</p>
                  <div className="mt-4">
                    <div className="text-sm text-gray-500">
                      <p>Event Dates: {format(new Date(conference.eventDates.start), 'MMM d, yyyy')} - {format(new Date(conference.eventDates.end), 'MMM d, yyyy')}</p>
                      <p>Submission Deadline: {format(new Date(conference.submissionDeadline), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/conferences/${conference._id}`}
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 