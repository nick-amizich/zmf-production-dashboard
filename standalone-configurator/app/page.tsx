export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">Shopify Product Configurator API</h1>
        <p className="text-lg text-gray-600 mb-8">
          This is a minimal API service for handling product configurations from Shopify.
        </p>
        
        <div className="bg-gray-100 p-6 rounded-lg text-left">
          <h2 className="text-xl font-semibold mb-4">API Endpoints:</h2>
          <ul className="space-y-2">
            <li>
              <code className="bg-gray-200 px-2 py-1 rounded">GET /api/shopify/product-config/[productId]</code>
              <p className="text-sm text-gray-600 mt-1">Retrieve product configuration</p>
            </li>
            <li>
              <code className="bg-gray-200 px-2 py-1 rounded">POST /api/shopify/product-config/[productId]</code>
              <p className="text-sm text-gray-600 mt-1">Create or update product configuration</p>
            </li>
            <li>
              <code className="bg-gray-200 px-2 py-1 rounded">DELETE /api/shopify/product-config/[productId]</code>
              <p className="text-sm text-gray-600 mt-1">Delete product configuration</p>
            </li>
          </ul>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>CORS is enabled for all API endpoints.</p>
          <p>See README for deployment instructions.</p>
        </div>
      </div>
    </main>
  );
}