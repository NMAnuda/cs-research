import Link from "next/link";
import Image from "next/image";

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <nav className="bg-gray-500 p-4 flex items-center justify-between relative">
        <div className="w-1/3"></div>

        <div className="absolute left-1/2 transform -translate-x-1/2 space-x-8">
          <Link href="/Phome" className="text-white hover:text-gray-200">
            Home
          </Link>
          <Link href="/viewreport" className="text-white hover:text-gray-200">
          View Report
          </Link>
          <Link href="/ghrape" className="text-white hover:text-gray-200">
          Graphical view
          </Link>
          
          <Link href="/HR" className="text-white hover:text-gray-200">
          HR
          </Link>
          <Link href="/History" className="text-white hover:text-gray-200">
          History
          </Link>
        </div>

        <div className="w-1/3 flex justify-end">
              
                         <Link
                           href="http://localhost:3000/login"
                           className="flex items-center gap-3 h-12 px-4 rounded-lg text-lg font-medium bg-gray-800 hover:bg-red-700 hover:scale-[1.02] transition-all duration-200"
                         >
                           <span className="text-xl">↩️</span>
                           <span>Logout</span>
                         </Link>
                       
               </div>
      </nav>

      <main className="flex-1 w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;