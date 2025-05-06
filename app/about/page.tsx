export default function AboutPage() {
  return (
    <div className="container py-8 px-6 md:px-8">
      <h1 className="text-3xl font-bold mb-6">About Free Cabins Europe</h1>

      <div className="prose dark:prose-invert max-w-none">
        <p>
          Free Cabins Europe is a platform dedicated to mapping and providing information about free or low-cost cabins,
          shelters, and bivouacs across Europe. These structures provide essential shelter for hikers, mountaineers, and
          outdoor enthusiasts.
        </p>

        <h2>What are Free Cabins?</h2>
        <p>Free cabins come in many forms across Europe, including:</p>
        <ul>
          <li>
            <strong>Bivouacs (Bivacchi)</strong> - Small shelters in the Italian Alps, often unmanned and free to use
          </li>
          <li>
            <strong>Gaupa Huts</strong> - Simple shelters in Norwegian forests
          </li>
          <li>
            <strong>Mountain Refuges</strong> - Basic shelters in remote mountain areas
          </li>
          <li>
            <strong>Emergency Shelters</strong> - Basic structures designed for emergency use
          </li>
        </ul>

        <h2>Our Mission</h2>
        <p>
          Our mission is to create a comprehensive database of free shelters across Europe, making this information
          accessible to outdoor enthusiasts. We aim to:
        </p>
        <ul>
          <li>Document the location and condition of free shelters</li>
          <li>Provide accurate information about amenities and capacity</li>
          <li>Help outdoor enthusiasts find safe shelter during their adventures</li>
          <li>Promote responsible use of these valuable resources</li>
        </ul>

        <h2>Contributing</h2>
        <p>
          This platform is a community effort. If you know of a free cabin that isn't in our database, or if you have
          updated information about an existing entry, please contact us.
        </p>

        <h2>Responsible Use</h2>
        <p>When using free cabins and shelters, please remember:</p>
        <ul>
          <li>Leave the cabin in better condition than you found it</li>
          <li>Pack out all trash</li>
          <li>Respect booking requirements where they exist</li>
          <li>Be considerate of other users</li>
          <li>Follow local regulations and customs</li>
        </ul>
      </div>
    </div>
  )
}
