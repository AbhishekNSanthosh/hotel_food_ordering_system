import Link from "next/link";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <main className="container mx-auto px-4 py-8 flex-1">
        <Link
          href="/"
          className="inline-block mb-6 text-primary hover:underline"
        >
          &larr; Back to Menu
        </Link>
        <h1 className="text-4xl font-bold mb-6">About Us</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg leading-relaxed mb-4">
            Welcome to Hotel Food Ordering, your number one source for delicious
            meals. We're dedicated to providing you the very best of food, with
            an emphasis on taste, quality, and excellent service.
          </p>
          <p className="text-lg leading-relaxed mb-4">
            Founded in 2024, Hotel Food Ordering has come a long way from its
            beginnings. When we first started out, our passion for eco-friendly
            and tasty food drove us to start our own business.
          </p>
          <p className="text-lg leading-relaxed mb-4">
            We hope you enjoy our products as much as we enjoy offering them to
            you. If you have any questions or comments, please don't hesitate to
            contact us.
          </p>
          <p className="text-lg leading-relaxed mt-8 font-semibold">
            Sincerely,
            <br />
            The Hotel Food Ordering Team
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
