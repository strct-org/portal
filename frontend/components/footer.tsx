export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 text-sm text-gray-500">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:underline">
                BeeStation
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                BeeDrive
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Accessories
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:underline">
                Downloads
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Knowledge Base
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Contact Us
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:underline">
                About Synology
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Newsroom
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Where to Buy
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Social</h4>
          <div className="flex gap-4">
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-4 pt-6 border-t border-gray-200 text-xs">
        © 2026 Strct Inc. All rights reserved.
      </div>
    </footer>
  );
}
