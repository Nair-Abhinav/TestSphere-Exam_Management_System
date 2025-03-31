const Footer = () => {
  return (
    <footer className="w-full border-t bg-gray-100 p-8">
      <div className="container mx-auto flex flex-col items-center justify-between space-y-4 md:h-24 md:flex-row md:space-y-0 md:py-0">
        <div className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <a href="/" className="flex items-center space-x-2">
            <span className="font-bold">TestSphere</span>
          </a>
          <nav className="flex items-center space-x-4">
            <a
              href="/terms"
              className="text-sm hover:underline underline-offset-4"
            >
              Terms
            </a>
            <a
              href="/privacy"
              className="text-sm hover:underline underline-offset-4"
            >
              Privacy
            </a>
          </nav>
        </div>
        <p className="text-sm text-gray-500">
          © 2024 TestSphere. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
