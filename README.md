# ReviewReply AI

A highly scalable, context-aware Micro-SaaS designed to generate professional, human-like responses to Google Reviews in seconds. Built for local businesses and agencies to reclaim their time while maintaining brand consistency.

## Tech Stack

*   **Frontend**: React, Vite, Tailwind CSS
*   **Backend / Database**: Supabase (PostgreSQL, Auth, RLS)
*   **AI Engine**: Groq LPU (Llama 3 Models for near-instant inference)

## Key Features

*   **Contextual USP-Injection**: The AI dynamically learns your business details, industry, and Unique Selling Points (USPs) to write replies that sound exactly like you.
*   **$0 Monthly Burn Architecture**: Designed using Supabase's free tier and Groq's high-speed, cost-effective LPU infrastructure, minimizing operational costs to near zero for starting out.
*   **Schema-Agnostic Database Sync**: Built with robust sync logic that automatically adapts to different database schema configurations (e.g., handles varying column names gracefully).
*   **Multi-Lingual Generation**: Native-level fluency in multiple languages.
*   **Real-time Analytics**: Built-in dashboard to track generated replies and estimated hours saved.

## Setup Instructions

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone https://github.com/mubeencommits02/reviewreply-ai.git
    cd reviewreply-ai
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure environment variables**:
    Create a `.env` file in the root directory (see the [Environment Variables](#environment-variables) section below) and add your keys.

4.  **Start the development server**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
```

*Note: The Supabase URL and Anon Key can be found in your Supabase project settings under API. The Groq API Key can be generated from the Groq console.*
