import { useNavigate } from 'react-router-dom';
import Book from "../assets/books.png";
import Desk from "../assets/desk.png";
import Test from "../assets/test.png";

// Updated Button component using useNavigate
const Button = ({ children, className, href }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <button
      onClick={handleClick}
      className={`${className} py-2 px-4 bg-black text-white rounded-md hover:bg-slate-900 text-center inline-block`}
      style={{ display: "inline-block" }}
    >
      {children}
    </button>
  );
};

// Card components remain the same
const Card = ({ children }) => (
  <div className="border border-gray-300 p-4 rounded-md shadow-sm h-full flex flex-col justify-between">
    {children}
  </div>
);

const CardHeader = ({ children }) => <div className="mb-4">{children}</div>;

const CardTitle = ({ children }) => (
  <h3 className="text-lg font-semibold text-center">{children}</h3>
);

const CardDescription = ({ children }) => (
  <p className="text-sm text-gray-600 text-center mb-4">{children}</p>
);

const CardContent = ({ children }) => (
  <div className="flex justify-center">{children}</div>
);

// Main HomePage Component remains mostly the same
export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                Welcome to TestSphere
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Simplify your exam management tasks with our easy-to-use tools.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-4 lg:grid-rows-2 lg:grid-flow-col lg:grid-auto-rows-[1fr]">
              <div className="lg:col-span-2 lg:row-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Timetable</CardTitle>
                    <CardDescription>
                      Easily create and manage school timetables
                    </CardDescription>
                  </CardHeader>
                  <img
                    src={Book}
                    alt="Timetable"
                    className="mb-4 w-full h-auto rounded bg-white"
                  />
                  <CardContent>
                    <Button className="w-full" href="/timetable">
                      Go to Timetable
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2 lg:h-full">
                <Card>
                  <CardHeader>
                    <CardTitle>Seating & Attendance</CardTitle>
                    <CardDescription>
                      Download seating arrangements and attendance sheets
                    </CardDescription>
                  </CardHeader>
                  <img
                    src={Desk}
                    alt="Seating & Attendance"
                    className="mb-4 w-full h-auto rounded bg-white block sm:block lg:hidden"
                  />
                  <CardContent>
                    <Button className="w-full" href="/arrangement">
                      Go to Arrangements
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2 lg:h-full">
                <Card>
                  <CardHeader>
                    <CardTitle>Term Test Retest</CardTitle>
                    <CardDescription>
                      Manage term tests and retests
                    </CardDescription>
                  </CardHeader>
                  <img
                    src={Test}
                    alt="Term Test Retest"
                    className="mb-4 w-full h-auto rounded bg-white block sm:block lg:hidden"
                  />
                  <CardContent>
                    <Button className="w-full" href="/retest">
                      Go to Retest
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}