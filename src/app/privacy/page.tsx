import Link from "next/link";
import Footer from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <main className="container mx-auto px-4 py-8 flex-1">
        <Link
          href="/"
          className="inline-block mb-6 text-primary hover:underline"
        >
          &larr; Back to Menu
        </Link>
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p className="mb-4">
            Your privacy is important to us. It is Hotel Food Ordering's policy
            to respect your privacy regarding any information we may collect
            from you across our website.
          </p>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">
              Information We Collect
            </h2>
            <p className="mb-2">
              We only ask for personal information when we truly need it to
              provide a service to you. We collect it by fair and lawful means,
              with your knowledge and consent. We also let you know why we’re
              collecting it and how it will be used.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">
              Changes to This Policy
            </h2>
            <p className="mb-2">
              We may update our privacy policy from time to time. We will notify
              you of any changes by posting the new privacy policy on this page.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
            <p className="mb-2">
              If you have any questions or suggestions about our Privacy Policy,
              do not hesitate to contact us.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
