# Free Cabins Europe

Free Cabins is a web app for mapping and browsing free or low-cost cabins, shelters, and bivouacs across Europe. The goal is to centralize data about public shelters to make it easier for outdoor enthausiasts to plan multi-day trips with access to basic overnight accommodations.

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
