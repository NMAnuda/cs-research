import Link from "next/link";
import Image from "next/image";

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <nav className="bg-gray-500 p-4 flex items-center justify-between relative">
        <div className="w-1/3"></div>

        <div className="absolute left-1/2 transform -translate-x-1/2 space-x-8">
          <Link href="/" className="text-white hover:text-gray-200">
            Home
          </Link>
          <Link href="/viewpolice" className="text-white hover:text-gray-200">
          People
          </Link>
          <Link href="/Graphical-view" className="text-white hover:text-gray-200">
          Graphical view
          </Link>
          <Link href="/Officers" className="text-white hover:text-gray-200">
          Officers
          </Link>
          <Link href="/about" className="text-white hover:text-gray-200">
          About
          </Link>
        </div>

        <div className="w-1/3 flex justify-end">
          <Image src="/user-icon.png" alt="User" width={24} height={24} />
        </div>
      </nav>

      <main className="flex-1 w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;