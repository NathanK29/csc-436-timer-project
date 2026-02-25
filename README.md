# CSC 436: Pomodoro Timer

A web-based Pomodoro timer application to help students manage study sessions and breaks, built with HTML, CSS, JavaScript, Vite, and Supabase.

## Prerequisites

Before you begin, ensure you have the following installed:
* **[Node.js](https://nodejs.org/)** (Download the LTS version). This automatically includes `npm` which you need to run the server.

## Local Setup Instructions

**1. Clone the repository**
Open your terminal and clone this project to your local machine:
```bash
git clone https://github.com/NathanK29/csc-436-timer-project.git
cd csc-436-project
```

**2. Install Dependencies**
Run the following command to install the required packages (Vite and Supabase):
```bash
npm install
```

**3. Environment Variables (Supabase)**

## NOTE: We dont not have API keys yet, ignore this step

Create a file named `.env` in the root of the project directory. 
Ask Nathan for the Supabase API keys, and add them to the file exactly like this:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**4. Start the Development Server**
Boot up the local Vite server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173` to view the app
