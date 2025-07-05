import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-100 text-base-content">
      <MessageCircle className="size-24 text-base-content/20 mb-6 animate-pulse" />
      <h1 className="text-4xl font-bold mb-2">404 - Not Found</h1>
      <p className="text-lg text-base-content/70 mb-6">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link to="/" className="btn btn-primary btn-wide text-lg font-semibold">
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
