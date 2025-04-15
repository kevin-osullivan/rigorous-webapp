# Scientific Conference Platform

A full-stack web application built with Next.js, MongoDB, and Tailwind CSS for managing scientific conferences and manuscript submissions.

## Features

- User authentication (sign up and login)
- Conference listing with postcard-style display
- Conference creation
- Responsive design
- SEO optimized

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB (hosted on MongoDB Atlas)
- Authentication: NextAuth.js

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- npm or yarn

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd rigorous
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_atlas_connection_string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The application is configured for deployment on Vercel. To deploy:

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Add the environment variables in the Vercel dashboard
4. Deploy

## Project Structure

```
rigorous/
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth].ts
│   │   │   └── signup.ts
│   │   └── conferences/
│   │       └── index.ts
│   ├── auth/
│   │   ├── signin.tsx
│   │   └── signup.tsx
│   ├── conferences/
│   │   └── new.tsx
│   └── index.tsx
├── models/
│   ├── User.ts
│   └── Conference.ts
├── lib/
│   └── mongodb.ts
├── .env.local
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 