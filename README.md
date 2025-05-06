# Free Cabins Europe

Free Cabins is a web app for mapping and browsing free or low-cost cabins, shelters, and bivouacs across Europe. Although many useful websites display data on (free) cabins nationally, it seems hard to find a resource that aggregates this data across Europe.

## Purpose

This project is both a useful tool and a technical sandbox. It's built to:

- Provide a practical and open-source shelter map for outdoor enthusiasts
- Explore and apply DevOps principles (containerization, CI/CD, environment management)
- Experiment with modern web technologies like the Next.js App Router, Tailwind, and server components
- Practice database design, API integration, and full-stack workflows

## Use Case

- Find cabins in all or Europe
- Filter cabins based on location, capacity and amenities (e.g. water, toilet, fireplace)
- Visualize all shelters on an interactive map

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MySQL
- **Containerization**: Docker and Docker Compose for local database setup

## Getting Started
```bash
1. Clone the repository

git clone https://github.com/yourusername/free-cabins-europe.git
cd free-cabins-europe

2. Set up environment variables

Copy the example file and configure DB credentials:

cp .env.example .env

3. Start the MySQL database

docker compose up -d

4. Install dependencies and start the dev server

npm install
npm run dev

5. Build for production

npm run build
```

Contributions

If you have additional cabin data, bug fixes, or features to propose, feel free to open a pull request.
